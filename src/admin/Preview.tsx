import { useEffect, useState } from 'react';
import type { CatInput, Settings } from '../types';
import { getSettings } from '../lib/api';
import { CatCard } from '../components/CatCard';
import { TvFooter } from '../components/TvFooter';
import { TvStage } from '../components/TvStage';
import { XIcon } from '../components/icons';

/** Mostra o card EXATAMENTE como vai aparecer na TV (mesmo palco, mesmo card, mesmo rodapé) */
export function Preview({ cat, photo, onClose }: { cat: CatInput; photo: string | null; onClose: () => void }) {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings, () => setSettings(null));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black p-3 pt-[max(12px,env(safe-area-inset-top))]">
      <div className="mb-3 flex items-center justify-between text-white">
        <div>
          <div className="font-display text-xl font-bold">Pré-visualização da TV</div>
          <div className="text-sm text-white/60">Exatamente como fica na TV em pé</div>
        </div>
        <button
          onClick={onClose}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 active:bg-white/25"
          aria-label="Fechar"
        >
          <XIcon className="h-7 w-7" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="flex h-full w-full items-center" style={{ maxWidth: 'calc((100dvh - 110px) * 9 / 16)' }}>
          <div className="w-full overflow-hidden rounded-[18px] ring-4 ring-white/15">
            <TvStage>
              <CatCard cat={cat} photo={photo} />
              <TvFooter settings={settings} />
            </TvStage>
          </div>
        </div>
      </div>
      {cat.status !== 'disponivel' && (
        <div className="mt-3 rounded-2xl bg-warn/20 p-3 text-center font-bold text-amber-200">
          Atenção: com o status atual, este gato NÃO aparece na TV.
        </div>
      )}
    </div>
  );
}
