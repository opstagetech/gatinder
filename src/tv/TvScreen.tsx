import { useEffect, useRef, useState } from 'react';
import type { Cat, Settings } from '../types';
import { photoUrl } from '../lib/supabase';
import { BRAND } from '../theme/brand';
import { AppChrome, CatCard, CatProfile, LikeStamp } from '../components/CatCard';
import { TvFooter } from '../components/TvFooter';
import { TvStage, type Rotation } from '../components/TvStage';
import { InstitutionalScreen } from './InstitutionalScreen';
import { MatchScreen } from './MatchScreen';
import { useCatsFeed } from './useCatsFeed';
import { useKiosk } from './useKiosk';

type Slide =
  | { kind: 'loading'; key: string }
  | { kind: 'cat'; key: string; cat: Cat }
  | { kind: 'match'; key: string; cat: Cat }
  | { kind: 'info'; key: string; empty: boolean };

/** Usados até a TV conseguir ler as Configurações pela primeira vez */
const DEFAULT_SETTINGS: Omit<Settings, 'id' | 'updated_at'> = {
  whatsapp_number: '',
  whatsapp_message: '',
  slide_seconds: 10,
  institutional_every_min: 5,
  institutional_title: 'Como funciona a adoção',
  institutional_steps: [
    'Escolha seu match na TV',
    'Fale com a nossa equipe',
    'Preencha a ficha de adoção',
    'Conheça o gatinho pessoalmente',
    'Leve seu novo amigo pra casa 💚',
  ],
};

const MATCH_MS = 9_000;
const TRANSITION_MS = 1_700;

/**
 * Tela da TV (/tv). Sem botões. Loop:
 *   gato → gato (desliza com "AMEI!") → … → "It's a Match!" a cada volta completa
 *   e "Como funciona a adoção" a cada X minutos (Configurações).
 * Para TV em pé com aparelho que não gira a imagem: /tv?girar=90 (ou 270).
 */
export function TvScreen() {
  useKiosk();
  const [rotate] = useState(readRotation);
  const feed = useCatsFeed();
  const settings = feed.settings ?? DEFAULT_SETTINGS;

  const catsRef = useRef(feed.cats);
  catsRef.current = feed.cats;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const sched = useRef({ lastInfo: Date.now(), sinceMatch: 0, lastCatId: null as string | null, n: 0 });
  const [{ prev, cur }, setSlides] = useState<{ prev: Slide | null; cur: Slide }>({
    prev: null,
    cur: { kind: 'loading', key: 'loading' },
  });

  // Agenda a próxima tela
  useEffect(() => {
    const ms = durationOf(cur, settingsRef.current);
    const t = setTimeout(() => {
      setSlides((s) => ({ prev: s.cur, cur: pickNext(s.cur, catsRef.current, settingsRef.current, sched.current) }));
    }, ms);
    return () => clearTimeout(t);
  }, [cur]);

  // Depois da transição, descarta a tela anterior
  useEffect(() => {
    if (!prev) return;
    const t = setTimeout(() => setSlides((s) => ({ ...s, prev: null })), TRANSITION_MS);
    return () => clearTimeout(t);
  }, [prev]);

  const catToCat = prev?.kind === 'cat' && cur.kind === 'cat';

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-black">
      <TvStage fill rotate={rotate}>
        {/* tela que está saindo (some por baixo da nova) */}
        {prev && !catToCat && (
          <div key={`prev-${prev.key}`} className="absolute inset-0">
            <StaticSlide slide={prev} settings={settings} />
          </div>
        )}

        {/* tela atual */}
        <div
          key={cur.kind === 'cat' ? 'cats' : cur.key}
          className={`absolute inset-0 ${prev && !catToCat ? 'animate-fade-in' : ''}`}
        >
          {cur.kind === 'cat' ? (
            <AppChrome pulseKey={catToCat ? cur.key : undefined}>
              <CatProfile
                key={cur.key}
                cat={cur.cat}
                photo={photoUrl(cur.cat.photo_path)}
                className={catToCat ? 'animate-card-in' : ''}
              />
              {catToCat && prev.kind === 'cat' && (
                <CatProfile
                  key={prev.key}
                  cat={prev.cat}
                  photo={photoUrl(prev.cat.photo_path)}
                  className="z-10 animate-swipe-out"
                  style={{ transformOrigin: '50% 120%' }}
                >
                  <LikeStamp />
                </CatProfile>
              )}
            </AppChrome>
          ) : (
            <StaticSlide slide={cur} settings={settings} />
          )}
        </div>

        <TvFooter settings={settings} />

        {!feed.online && (
          <div className="absolute left-1/2 top-[108px] z-30 -translate-x-1/2 rounded-full bg-black/50 px-[18px] py-[4px] text-[20px] font-semibold text-white/80">
            sem internet · mostrando a última lista salva
          </div>
        )}
      </TvStage>
    </div>
  );
}

function StaticSlide({ slide, settings }: { slide: Slide; settings: typeof DEFAULT_SETTINGS }) {
  switch (slide.kind) {
    case 'cat':
      return <CatCard cat={slide.cat} photo={photoUrl(slide.cat.photo_path)} />;
    case 'match':
      return <MatchScreen cat={slide.cat} />;
    case 'info':
      return <InstitutionalScreen settings={settings} noCats={slide.empty} />;
    case 'loading':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-surface">
          <img src={BRAND.gatinderLogo} alt="Gatinder" className="w-[700px] animate-pulse" />
        </div>
      );
  }
}

function durationOf(slide: Slide, s: typeof DEFAULT_SETTINGS) {
  switch (slide.kind) {
    case 'loading':
      return 1_500;
    case 'cat':
      return s.slide_seconds * 1000;
    case 'match':
      return MATCH_MS;
    case 'info':
      return 12_000 + s.institutional_steps.length * 1_500;
  }
}

function pickNext(
  cur: Slide,
  cats: Cat[],
  s: typeof DEFAULT_SETTINGS,
  st: { lastInfo: number; sinceMatch: number; lastCatId: string | null; n: number },
): Slide {
  const now = Date.now();
  st.n++;

  if (cats.length === 0) {
    st.lastInfo = now;
    return { kind: 'info', key: `info-${st.n}`, empty: true };
  }

  if (cur.kind !== 'info' && now - st.lastInfo >= s.institutional_every_min * 60_000) {
    st.lastInfo = now;
    return { kind: 'info', key: `info-${st.n}`, empty: false };
  }

  // "It's a Match!" a cada volta completa (no mínimo a cada 5 gatos)
  if (cur.kind === 'cat' && st.sinceMatch >= Math.max(5, cats.length)) {
    const cat = cats.find((c) => c.id === cur.cat.id);
    if (cat) {
      st.sinceMatch = 0;
      return { kind: 'match', key: `match-${st.n}`, cat };
    }
  }

  const i = cats.findIndex((c) => c.id === st.lastCatId);
  const next = cats[(i + 1) % cats.length];
  st.lastCatId = next.id;
  st.sinceMatch++;
  return { kind: 'cat', key: `cat-${next.id}-${st.n}`, cat: next };
}

function readRotation(): Rotation {
  const v = Number(new URLSearchParams(location.search).get('girar'));
  return v === 90 || v === 180 || v === 270 ? v : 0;
}
