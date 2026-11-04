import { useCallback, useEffect, useRef, useState } from 'react';
import type { Cat, Settings } from '../types';
import { photoUrl, supabase } from '../lib/supabase';

const STORAGE_KEY = 'gatinder.tv.feed.v1';
const PHOTO_CACHE = 'gatinder-photos-v1'; // mesmo nome do public/sw.js
const POLL_MS = 60_000;

export interface Feed {
  cats: Cat[];
  settings: Settings | null;
  /** quando a lista foi atualizada com sucesso pela última vez (ms) */
  syncedAt: number | null;
}

/**
 * Lista de gatos disponíveis + configurações, para a TV.
 * - Tempo real: escuta a linha de configurações (o banco "cutuca" ela a cada mudança em gatos)
 * - Reserva: busca de novo a cada 1 minuto
 * - Sem internet: continua com a última lista guardada no aparelho
 */
export function useCatsFeed() {
  const [feed, setFeed] = useState<Feed>(() => loadSaved());
  const [online, setOnline] = useState(true);
  const busy = useRef(false);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const [catsRes, settingsRes] = await Promise.all([
        supabase
          .from('cats')
          .select('*')
          .eq('status', 'disponivel') // mesmo que o aparelho esteja logado como equipe
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true }),
        supabase.from('settings').select('*').single(),
      ]);
      if (catsRes.error) throw catsRes.error;
      if (settingsRes.error) throw settingsRes.error;

      const next: Feed = { cats: catsRes.data as Cat[], settings: settingsRes.data as Settings, syncedAt: Date.now() };
      setFeed((prev) => (sameContent(prev, next) ? { ...prev, syncedAt: next.syncedAt } : next));
      save(next);
      setOnline(true);
      warmPhotos(next.cats);
    } catch {
      setOnline(false); // fica com a lista que já tem
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    refresh();
    const poll = setInterval(refresh, POLL_MS);

    let debounce: ReturnType<typeof setTimeout> | undefined;
    const channel = supabase
      .channel('tv-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        clearTimeout(debounce);
        debounce = setTimeout(refresh, 800);
      })
      .subscribe();

    const onOnline = () => refresh();
    window.addEventListener('online', onOnline);
    return () => {
      clearInterval(poll);
      clearTimeout(debounce);
      supabase.removeChannel(channel);
      window.removeEventListener('online', onOnline);
    };
  }, [refresh]);

  return { ...feed, online };
}

function loadSaved(): Feed {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Feed;
  } catch {
    /* sem armazenamento: começa vazio */
  }
  return { cats: [], settings: null, syncedAt: null };
}

function save(feed: Feed) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feed));
  } catch {
    /* armazenamento cheio/bloqueado: segue sem cache */
  }
}

function sameContent(a: Feed, b: Feed) {
  return JSON.stringify([a.cats, a.settings]) === JSON.stringify([b.cats, b.settings]);
}

const warm = new Map<string, HTMLImageElement>();

/** Baixa todas as fotos já (o service worker guarda) e apaga do aparelho as de gatos que saíram */
function warmPhotos(cats: Cat[]) {
  const urls = new Set(cats.map((c) => photoUrl(c.photo_path)).filter((u): u is string => !!u));
  for (const url of urls) {
    if (warm.has(url)) continue;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    warm.set(url, img);
  }
  for (const url of warm.keys()) if (!urls.has(url)) warm.delete(url);

  if ('caches' in window) {
    caches
      .open(PHOTO_CACHE)
      .then(async (cache) => {
        for (const req of await cache.keys()) if (!urls.has(req.url)) await cache.delete(req);
      })
      .catch(() => {});
  }
}
