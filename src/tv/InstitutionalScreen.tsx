import type { Settings } from '../types';
import { BRAND } from '../theme/brand';

/** Tela "Como funciona a adoção" — textos vêm das Configurações do painel */
export function InstitutionalScreen({
  settings,
  noCats = false,
}: {
  settings: Pick<Settings, 'institutional_title' | 'institutional_steps'>;
  noCats?: boolean;
}) {
  const steps = settings.institutional_steps.filter(Boolean).slice(0, 8);
  const big = steps.length <= 5;

  return (
    <div className="absolute inset-x-0 top-0 h-[1660px] overflow-hidden bg-brand-gradient font-body text-white">
      <div className="absolute inset-x-0 top-[60px] flex justify-center">
        <img src={BRAND.gatinderLogoBranco} alt="Gatinder" className="h-[92px] w-auto" />
      </div>

      <div className="absolute inset-x-[70px] top-[220px]">
        {noCats && (
          <div className="mb-[30px] inline-block animate-fade-in rounded-full bg-white/20 px-[30px] py-[10px] text-[38px] font-bold">
            🐾 Novos gatinhos chegando em breve!
          </div>
        )}
        <h1 className="animate-fade-in font-display text-[96px] font-extrabold leading-[1.05]">
          {settings.institutional_title}
        </h1>

        <ol className={`mt-[56px] flex flex-col ${big ? 'gap-[30px]' : 'gap-[20px]'}`}>
          {steps.map((step, i) => (
            <li
              key={i}
              className={`flex animate-pop-in items-center gap-[30px] rounded-[36px] bg-white text-ink shadow-[0_14px_40px_rgba(0,0,0,0.15)] ${
                big ? 'px-[36px] py-[30px]' : 'px-[30px] py-[20px]'
              }`}
              style={{ animationDelay: `${300 + i * 350}ms` }}
            >
              <span
                className={`flex shrink-0 items-center justify-center rounded-full bg-brand-gradient font-display font-extrabold text-white ${
                  big ? 'h-[100px] w-[100px] text-[56px]' : 'h-[80px] w-[80px] text-[44px]'
                }`}
              >
                {i + 1}
              </span>
              <span className={`font-semibold leading-tight ${big ? 'text-[50px]' : 'text-[42px]'}`}>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="absolute inset-x-0 bottom-[50px] flex justify-center">
        <img src={BRAND.fecovetLogoBranco} alt="FecoVet" className="h-[90px] w-auto opacity-95" />
      </div>
    </div>
  );
}
