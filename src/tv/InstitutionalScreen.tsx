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
  // Com o aviso "novos gatinhos" ou muitos passos, tudo fica um pouco menor
  const size = steps.length > 6 ? 'tiny' : steps.length > 5 ? 'small' : noCats ? 'medium' : 'big';
  const S = {
    big: { gap: 'mb-[30px]', pad: 'px-[36px] py-[30px]', num: 'h-[100px] w-[100px] text-[56px]', text: 'text-[50px]', title: 'text-[96px]' },
    medium: { gap: 'mb-[22px]', pad: 'px-[32px] py-[22px]', num: 'h-[88px] w-[88px] text-[50px]', text: 'text-[46px]', title: 'text-[88px]' },
    small: { gap: 'mb-[18px]', pad: 'px-[30px] py-[18px]', num: 'h-[76px] w-[76px] text-[42px]', text: 'text-[40px]', title: 'text-[84px]' },
    tiny: { gap: 'mb-[14px]', pad: 'px-[28px] py-[14px]', num: 'h-[64px] w-[64px] text-[36px]', text: 'text-[36px]', title: 'text-[76px]' },
  }[size];

  // Layout em coluna: o logo da FecoVet fica sempre embaixo, sem nada por cima
  return (
    <div className="absolute inset-x-0 top-0 flex h-[1660px] flex-col overflow-hidden bg-brand-gradient px-[70px] pb-[50px] pt-[60px] font-body text-white">
      <div className="flex shrink-0 justify-center">
        <img src={BRAND.gatinderLogoBranco} alt="Gatinder" className="h-[92px] w-auto" />
      </div>

      <div className="mt-[64px] min-h-0 flex-1 overflow-hidden">
        {noCats && (
          <div className="mb-[28px] inline-block animate-fade-in rounded-full bg-white/20 px-[30px] py-[10px] text-[38px] font-bold">
            🐾 Novos gatinhos chegando em breve!
          </div>
        )}
        <h1 className={`animate-fade-in font-display font-extrabold leading-[1.05] ${S.title}`}>
          {settings.institutional_title}
        </h1>

        <ol className="mt-[48px]">
          {steps.map((step, i) => (
            <li
              key={i}
              className={`flex animate-pop-in items-center rounded-[36px] bg-white text-ink shadow-[0_14px_40px_rgba(0,0,0,0.15)] ${S.gap} ${S.pad}`}
              style={{ animationDelay: `${300 + i * 350}ms` }}
            >
              <span
                className={`mr-[30px] flex shrink-0 items-center justify-center rounded-full bg-brand-gradient font-display font-extrabold text-white ${S.num}`}
              >
                {i + 1}
              </span>
              <span className={`font-semibold leading-tight ${S.text}`}>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-[24px] flex shrink-0 justify-center">
        <img src={BRAND.fecovetLogoBranco} alt="FecoVet" className="h-[90px] w-auto opacity-95" />
      </div>
    </div>
  );
}
