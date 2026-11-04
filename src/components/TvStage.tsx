import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

// TV em pé (retrato), dentro de uma moldura que imita um celular
export const STAGE_W = 1080;
export const STAGE_H = 1920;

/**
 * "Palco" 1080×1920 (TV em pé) que encolhe/aumenta para caber no espaço disponível.
 * A TV e a pré-visualização usam o mesmo palco: o que aparece em uma
 * é exatamente o que aparece na outra.
 */
export type Rotation = 0 | 90 | 180 | 270;

/**
 * `rotate` gira o palco inteiro. Serve para aparelhos (Fire Stick, Chromecast,
 * smart TV) que não sabem girar a imagem sozinhos: a TV fica em pé, o aparelho
 * continua achando que está deitada, e a página gira por conta própria.
 */
export function TvStage({ children, fill = false, rotate = 0 }: { children: ReactNode; fill?: boolean; rotate?: Rotation }) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const sideways = rotate === 90 || rotate === 270;
      const w = sideways ? r.height : r.width;
      const h = sideways ? r.width : r.height;
      setScale(Math.min(w / STAGE_W, h / STAGE_H));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rotate]);

  return (
    <div
      ref={outer}
      className={fill ? 'relative h-full w-full overflow-hidden bg-black' : 'relative w-full overflow-hidden bg-black'}
      style={fill ? undefined : { aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
          transformOrigin: 'center',
          visibility: scale ? 'visible' : 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}
