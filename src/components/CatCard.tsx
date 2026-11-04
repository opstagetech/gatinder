import type { CSSProperties, ReactNode } from 'react';
import type { CatInput } from '../types';
import { BRAND } from '../theme/brand';
import { formatAge, SEX_LABEL, TEMPERAMENT_EMOJI, temperamentLabel } from '../lib/format';
import { CheckIcon, ClockIcon, FemaleIcon, HeartIcon, MaleIcon, StarIcon, XIcon } from './icons';

/**
 * ⭐ O card "perfil" do gato, desenhado no tamanho da TV em pé (1080×1920),
 * como a tela de um app de namoro. O rodapé com o QR fica em <TvFooter>.
 * É o MESMO componente na TV e na pré-visualização do painel.
 * Sempre renderizar dentro de <TvStage>.
 *
 * Mapa da tela (em pixels da TV):
 *   0–150      barra do "app" com o logo
 *   150–1430   foto 4:5 (1024×1280) com nome, idade, selos, tags e bio
 *   1430–1660  botões ✕ ★ ❤
 *   1660–1920  rodapé (TvFooter)
 */
export const CARD = { top: 150, left: 28, width: 1024, height: 1280 } as const;

export function CatCard({ cat, photo }: { cat: CatInput; photo: string | null }) {
  return (
    <AppChrome>
      <CatProfile cat={cat} photo={photo} />
    </AppChrome>
  );
}

/**
 * A "moldura do app" que fica parada: fundo, barra com os logos e os botões ✕ ★ ❤.
 * O(s) card(s) entram como filhos (na TV, eles deslizam por cima).
 * Quando `pulseKey` muda, o coração "pulsa" (como se alguém tivesse dado like).
 */
export function AppChrome({ children, pulseKey }: { children?: ReactNode; pulseKey?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-surface font-body">
      {/* Barra do app: Gatinder + clínica parceira */}
      <div className="absolute inset-x-0 top-0 flex h-[150px] items-center justify-between px-[44px]">
        <img src={BRAND.gatinderLogo} alt="Gatinder" className="h-[92px] w-auto" />
        <img src={BRAND.fecovetLogo} alt="FecoVet" className="h-[74px] w-auto" />
      </div>

      {/* Botões decorativos do "app" */}
      <div
        className="absolute inset-x-0 flex items-center justify-center gap-[64px]"
        style={{ top: CARD.top + CARD.height, height: 230 }}
      >
        <ActionButton size={160} className="text-nope">
          <XIcon className="h-[70px] w-[70px]" />
        </ActionButton>
        <ActionButton size={124} className="text-sky-500">
          <StarIcon className="h-[60px] w-[60px]" />
        </ActionButton>
        <ActionButton key={pulseKey} size={180} className={`text-like ${pulseKey ? 'animate-like-pulse' : ''}`}>
          <HeartIcon className="h-[96px] w-[96px]" />
        </ActionButton>
      </div>

      {children}
    </div>
  );
}

/** Só o card com a foto e as informações (é ele que "desliza" na TV) */
export function CatProfile({
  cat,
  photo,
  className = '',
  style,
  children,
}: {
  cat: CatInput;
  photo: string | null;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const SexIcon = cat.sex === 'femea' ? FemaleIcon : MaleIcon;
  return (
    <div
      className={`absolute overflow-hidden rounded-[52px] bg-ink shadow-[0_30px_80px_rgba(0,0,0,0.35)] ${className}`}
      style={{ top: CARD.top, left: CARD.left, width: CARD.width, height: CARD.height, ...style }}
    >
      {photo ? (
        <img src={photo} alt={cat.name} crossOrigin="anonymous" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-gradient text-[320px]">🐱</div>
      )}

      {/* Degradê para o texto ficar legível */}
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/95 via-black/55 to-transparent" />

      {/* Selo */}
      <div className="absolute right-[36px] top-[36px] flex items-center gap-[12px] rounded-full bg-white/95 px-[28px] py-[14px] text-[34px] font-extrabold text-brand shadow-lg">
        <StarIcon className="h-[36px] w-[36px]" /> Procurando um lar
      </div>

      <div className="absolute inset-x-0 bottom-0 px-[56px] pb-[52px] text-white">
        <h2
          className="flex flex-wrap items-baseline font-display leading-[1.05]"
          style={{ textShadow: '0 4px 24px rgba(0,0,0,.4)' }}
        >
          <span className="break-words font-bold" style={{ fontSize: nameSize(cat.name) }}>
            {cat.name || 'Nome'},
          </span>
          <span className="whitespace-nowrap pl-[20px] text-[76px] font-semibold opacity-95">
            {formatAge(cat.age_months)}
          </span>
        </h2>

        <div className="mt-[22px] flex flex-wrap items-center gap-[14px] whitespace-nowrap text-[34px] font-bold">
          <Badge>
            <SexIcon className="h-[36px] w-[36px]" /> {SEX_LABEL[cat.sex]}
          </Badge>
          <Badge ok={cat.neutered}>
            {cat.neutered ? <CheckIcon className="h-[34px] w-[34px]" /> : <ClockIcon className="h-[34px] w-[34px]" />}
            {cat.neutered ? fem(cat.sex, 'Castrado') : `Não ${fem(cat.sex, 'castrado')}`}
          </Badge>
          <Badge ok={cat.vaccinated}>
            {cat.vaccinated ? <CheckIcon className="h-[34px] w-[34px]" /> : <ClockIcon className="h-[34px] w-[34px]" />}
            {cat.vaccinated ? fem(cat.sex, 'Vacinado') : `Não ${fem(cat.sex, 'vacinado')}`}
          </Badge>
        </div>

        {cat.temperament.length > 0 && (
          <div className="mt-[18px] flex flex-wrap gap-[14px]">
            {cat.temperament.map((t) => (
              <span
                key={t}
                className="whitespace-nowrap rounded-full border-[3px] border-white/75 px-[22px] py-[6px] text-[32px] font-bold"
              >
                {TEMPERAMENT_EMOJI[t]} {temperamentLabel(t, cat.sex)}
              </span>
            ))}
          </div>
        )}

        {cat.bio && (
          <p className="mt-[24px] text-[42px] font-semibold leading-[1.3] opacity-95">“{cat.bio}”</p>
        )}
      </div>
      {children}
    </div>
  );
}

/** Nome comprido diminui para caber */
function nameSize(name: string) {
  const n = name.length;
  return n <= 9 ? 124 : n <= 13 ? 104 : n <= 18 ? 84 : 64;
}

/** "Castrado" → "Castrada" para fêmeas */
function fem(sex: CatInput['sex'], word: string) {
  return sex === 'femea' ? word.replace(/o$/, 'a') : word;
}

function Badge({ children, ok }: { children: React.ReactNode; ok?: boolean }) {
  const tone = ok === undefined ? 'bg-white/20' : ok ? 'bg-ok/90' : 'bg-white/15 text-white/85';
  return (
    <span className={`flex items-center gap-[10px] rounded-full px-[20px] py-[8px] backdrop-blur ${tone}`}>
      {children}
    </span>
  );
}

function ActionButton({ children, className, size }: { children: React.ReactNode; className: string; size: number }) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-surface shadow-[0_14px_40px_rgba(0,0,0,0.18)] ring-[3px] ring-line ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}

/** Carimbo "AMEI!" que aparece no card quando ele desliza para a direita (like) */
export function LikeStamp() {
  return (
    <div
      className="absolute left-[60px] top-[90px] animate-stamp-in rounded-[24px] border-[10px] border-like px-[34px] py-[6px] font-display text-[120px] font-extrabold uppercase leading-none tracking-wider text-like opacity-0"
      style={{ animationDelay: '250ms', background: 'rgba(255,255,255,0.12)' }}
    >
      Amei!
    </div>
  );
}
