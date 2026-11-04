/**
 * Corte automático 4:5 (retrato, 1080×1350) + compressão, tudo no navegador.
 * A equipe só escolhe a foto; o enquadramento é automático e pode ser
 * ajustado com "posição" (0 a 1) e "zoom" (1 a 3).
 */
export const OUT_W = 1080;
export const OUT_H = 1350;
const RATIO = OUT_W / OUT_H; // 0.8
const MAX_BYTES = 2.8 * 1024 * 1024; // o bucket aceita até 3 MB

export interface Framing {
  /** 0 = esquerda/topo, 0.5 = centro, 1 = direita/base */
  x: number;
  y: number;
  /** 1 = sem zoom */
  zoom: number;
}

/** Fotos de gato costumam ter a cara na parte de cima: puxa um pouco pra cima */
export const DEFAULT_FRAMING: Framing = { x: 0.5, y: 0.4, zoom: 1 };

export function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img); // o navegador já corrige a rotação (EXIF)
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não consegui abrir essa imagem. Tente outra foto (JPG ou PNG).'));
    };
    img.src = url;
  });
}

/** Área da foto original que vai virar o card 4:5 */
export function cropRect(w: number, h: number, f: Framing) {
  let cw: number, ch: number;
  if (w / h > RATIO) {
    ch = h;
    cw = h * RATIO;
  } else {
    cw = w;
    ch = w / RATIO;
  }
  cw /= f.zoom;
  ch /= f.zoom;
  const sx = (w - cw) * clamp01(f.x);
  const sy = (h - ch) * clamp01(f.y);
  return { sx, sy, cw, ch };
}

export async function cropToCard(img: HTMLImageElement, f: Framing): Promise<Blob> {
  const { sx, sy, cw, ch } = cropRect(img.naturalWidth, img.naturalHeight, f);
  const canvas = document.createElement('canvas');
  canvas.width = OUT_W;
  canvas.height = OUT_H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, cw, ch, 0, 0, OUT_W, OUT_H);

  // WebP quando o navegador suporta; senão JPEG (ex.: iPhone antigo)
  for (const q of [0.85, 0.75, 0.65, 0.5]) {
    let blob = await toBlob(canvas, 'image/webp', q);
    if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', q);
    if (blob && blob.size <= MAX_BYTES) return blob;
  }
  throw new Error('A foto ficou grande demais mesmo depois de comprimir. Tente outra.');
}

function toBlob(c: HTMLCanvasElement, type: string, q: number): Promise<Blob | null> {
  return new Promise((r) => c.toBlob(r, type, q));
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}
