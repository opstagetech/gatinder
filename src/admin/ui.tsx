import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BackIcon } from '../components/icons';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-gradient text-brand-ink shadow-md active:brightness-95',
  secondary: 'bg-surface text-ink ring-2 ring-line active:bg-bg',
  danger: 'bg-surface text-red-600 ring-2 ring-red-200 active:bg-red-50',
  ghost: 'text-muted active:bg-line/50',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`flex min-h-[56px] items-center justify-center gap-2 rounded-2xl px-5 text-lg font-extrabold transition disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    />
  );
}

export function PageHeader({ title, back, right, icon }: { title: string; back?: string; right?: ReactNode; icon?: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-2xl items-center gap-2 px-3">
        {back && (
          <Link to={back} className="flex h-12 w-12 items-center justify-center rounded-xl active:bg-bg" aria-label="Voltar">
            <BackIcon className="h-7 w-7" />
          </Link>
        )}
        {icon && <img src={icon} alt="" className="ml-1 h-9 w-9" />}
        <h1 className="flex-1 truncate font-display text-2xl font-bold">{title}</h1>
        {right}
      </div>
    </header>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-base font-extrabold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-sm text-muted">{hint}</span>}
    </label>
  );
}

export const inputClass =
  'w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-lg outline-none focus:border-brand';

/** Botões grandes lado a lado (escolha única) */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: ReactNode; activeClass?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`min-h-[56px] flex-1 rounded-2xl px-2 text-base font-extrabold ring-2 transition ${
              active ? o.activeClass ?? 'bg-brand text-brand-ink ring-brand' : 'bg-surface text-ink ring-line'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Sim / Não grande */
export function YesNo({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Segmented
      value={value ? 'sim' : 'nao'}
      onChange={(v) => onChange(v === 'sim')}
      options={[
        { value: 'sim', label: 'Sim', activeClass: 'bg-ok text-white ring-ok' },
        { value: 'nao', label: 'Não', activeClass: 'bg-ink text-white ring-ink' },
      ]}
    />
  );
}

export function Spinner({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-brand" />
      <span className="font-semibold">{label}</span>
    </div>
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl bg-red-50 p-4 font-semibold text-red-700 ring-2 ring-red-200">{children}</div>;
}
