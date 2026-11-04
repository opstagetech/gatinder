import { useEffect } from 'react';

const RELOAD_HOUR = 4; // recarrega 1x por dia, de madrugada (pega versão nova do site)

/**
 * Modo vitrine: esconde o cursor, impede a tela de dormir, liga o cache
 * offline e recarrega a página 1x por dia.
 */
export function useKiosk() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('kiosk');

    // Cache offline (fotos, site, fontes)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // Tela não dorme (quando o navegador permite)
    let lock: WakeLockSentinel | null = null;
    const requestLock = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          lock = await navigator.wakeLock.request('screen');
        }
      } catch {
        /* sem permissão: o app de quiosque/configuração da TV cuida disso */
      }
    };
    requestLock();
    const onVisible = () => document.visibilityState === 'visible' && requestLock();
    document.addEventListener('visibilitychange', onVisible);

    // Tela cheia ao apertar qualquer botão do controle remoto
    const goFull = () => {
      if (!document.fullscreenElement) root.requestFullscreen?.().catch(() => {});
    };
    window.addEventListener('keydown', goFull);
    window.addEventListener('click', goFull);
    const noMenu = (e: Event) => e.preventDefault();
    window.addEventListener('contextmenu', noMenu);

    // Recarrega 1x por dia
    const startedAt = Date.now();
    const daily = setInterval(() => {
      const up = Date.now() - startedAt;
      const isTime = new Date().getHours() === RELOAD_HOUR && up > 2 * 3600_000;
      if ((isTime || up > 26 * 3600_000) && navigator.onLine) location.reload();
    }, 10 * 60_000);

    return () => {
      root.classList.remove('kiosk');
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('keydown', goFull);
      window.removeEventListener('click', goFull);
      window.removeEventListener('contextmenu', noMenu);
      clearInterval(daily);
      lock?.release().catch(() => {});
    };
  }, []);
}
