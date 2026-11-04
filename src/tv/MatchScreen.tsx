import type { Cat } from '../types';
import { photoUrl } from '../lib/supabase';
import { BRAND } from '../theme/brand';
import { HeartIcon } from '../components/icons';

const HEARTS = [
  { left: 80, size: 70, delay: 0 },
  { left: 230, size: 46, delay: 1.6 },
  { left: 400, size: 90, delay: 3.1 },
  { left: 610, size: 54, delay: 0.8 },
  { left: 790, size: 80, delay: 2.4 },
  { left: 950, size: 50, delay: 4 },
];

/** "It's a Match!" — aparece de tempos em tempos, com o último gato mostrado */
export function MatchScreen({ cat }: { cat: Cat }) {
  const photo = photoUrl(cat.photo_path);
  const ele = cat.sex === 'femea' ? 'ela' : 'ele';

  return (
    <div className="absolute inset-x-0 top-0 h-[1660px] overflow-hidden bg-ink font-body text-white">
      {photo && (
        <img
          src={photo}
          alt=""
          crossOrigin="anonymous"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: 'blur(40px)', transform: 'scale(1.2)' }}
        />
      )}
      <div className="absolute inset-0 bg-brand-gradient opacity-[0.88]" />

      {/* corações subindo */}
      {HEARTS.map((h, i) => (
        <HeartIcon
          key={i}
          className="absolute bottom-[-120px] animate-float text-white/40"
          style={{ left: h.left, width: h.size, height: h.size, animationDelay: `${h.delay}s` }}
        />
      ))}

      <div className="absolute inset-x-0 top-[60px] flex justify-center">
        <img src={BRAND.gatinderLogoBranco} alt="Gatinder" className="h-[92px] w-auto" />
      </div>

      <div className="absolute inset-x-0 top-[250px] text-center">
        <div className="animate-pop-in font-display text-[86px] font-semibold italic leading-none">It's a</div>
        <div
          className="animate-pop-in font-display text-[210px] font-extrabold italic leading-[0.95] tracking-tight"
          style={{ animationDelay: '150ms', textShadow: '0 10px 40px rgba(0,0,0,.25)' }}
        >
          Match!
        </div>
      </div>

      {/* as duas "fotos de perfil" */}
      <div className="absolute inset-x-0 top-[640px] flex items-center justify-center">
        <div
          className="relative z-10 h-[400px] w-[400px] animate-pop-in overflow-hidden rounded-full bg-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-[14px] ring-white"
          style={{ animationDelay: '350ms', marginRight: -60, transform: 'rotate(-6deg)' }}
        >
          {photo ? (
            <img src={photo} alt={cat.name} crossOrigin="anonymous" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[180px]">🐱</div>
          )}
        </div>
        <div
          className="flex h-[400px] w-[400px] animate-pop-in flex-col items-center justify-center rounded-full bg-white text-like shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-[14px] ring-white"
          style={{ animationDelay: '500ms' }}
        >
          <HeartIcon className="h-[150px] w-[150px]" />
          <div className="font-display text-[64px] font-extrabold leading-none">Você?</div>
        </div>
      </div>

      <div className="absolute inset-x-[70px] top-[1140px] animate-fade-in text-center" style={{ animationDelay: '900ms' }}>
        <div className="font-display text-[76px] font-bold leading-[1.1]">
          Você e {cat.name}
          <br />
          combinam!
        </div>
        <div className="mt-[30px] text-[46px] font-semibold leading-snug opacity-95">
          Fale com a nossa equipe e leve {ele} pra casa 💕
        </div>
      </div>
    </div>
  );
}
