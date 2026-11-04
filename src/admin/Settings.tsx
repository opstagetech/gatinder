import { useEffect, useState, type FormEvent } from 'react';
import type { Settings as S } from '../types';
import { friendlyError, getSettings, saveSettings } from '../lib/api';
import { whatsappLink } from '../lib/format';
import { Button, ErrorBox, Field, inputClass, PageHeader, Spinner } from './ui';

type Form = Omit<S, 'id' | 'updated_at'>;

export function Settings() {
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(
      ({ id: _id, updated_at: _u, ...rest }) => setForm(rest),
      (e) => setError(friendlyError(e)),
    );
  }, []);

  if (!form) {
    return (
      <div>
        <PageHeader title="Configurações" back="/admin" />
        <div className="mx-auto max-w-2xl p-4">{error ? <ErrorBox>{error}</ErrorBox> : <Spinner />}</div>
      </div>
    );
  }

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setSaved(false);
    setForm({ ...form, [k]: v });
  };
  const digits = form.whatsapp_number.replace(/\D/g, '');
  const waOk = digits === '' || whatsappLink(digits, '') !== null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!waOk) return setError('O número de WhatsApp parece incompleto. Use DDI + DDD + número, ex.: 5511999999999.');
    setBusy(true);
    setError(null);
    try {
      await saveSettings({
        ...form,
        whatsapp_number: digits,
        institutional_steps: form.institutional_steps.map((s) => s.trim()).filter(Boolean),
      });
      setSaved(true);
    } catch (err) {
      setError(friendlyError(err));
    }
    setBusy(false);
  }

  const steps = form.institutional_steps;

  return (
    <div className="min-h-[100dvh] pb-32">
      <PageHeader title="Configurações" back="/admin" />
      <form id="settings-form" onSubmit={submit} className="mx-auto max-w-2xl space-y-7 px-4 pt-5">
        {error && <ErrorBox>{error}</ErrorBox>}

        <h2 className="font-display text-xl font-bold">WhatsApp do QR code</h2>
        <Field
          label="Número"
          hint={
            waOk
              ? 'Com DDI 55 e DDD, só números. Ex.: 5511999999999. Deixe vazio para esconder o QR.'
              : <span className="font-bold text-red-600">Número incompleto.</span>
          }
        >
          <input
            inputMode="tel"
            value={form.whatsapp_number}
            onChange={(e) => set('whatsapp_number', e.target.value)}
            placeholder="5511999999999"
            className={inputClass}
          />
        </Field>
        <Field label="Mensagem que já vem escrita">
          <textarea
            rows={2}
            value={form.whatsapp_message}
            onChange={(e) => set('whatsapp_message', e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </Field>

        <h2 className="pt-2 font-display text-xl font-bold">Tempo na TV</h2>
        <NumberField
          label="Segundos para cada gato"
          value={form.slide_seconds}
          min={5}
          max={60}
          step={1}
          unit="s"
          onChange={(v) => set('slide_seconds', v)}
        />
        <NumberField
          label="Tela “Como funciona a adoção” a cada"
          value={form.institutional_every_min}
          min={1}
          max={60}
          step={1}
          unit="min"
          onChange={(v) => set('institutional_every_min', v)}
        />

        <h2 className="pt-2 font-display text-xl font-bold">Tela “Como funciona a adoção”</h2>
        <Field label="Título">
          <input
            value={form.institutional_title}
            onChange={(e) => set('institutional_title', e.target.value)}
            className={inputClass}
          />
        </Field>
        <div>
          <span className="mb-2 block text-base font-extrabold">Passos</span>
          <div className="space-y-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient font-extrabold text-white">
                  {i + 1}
                </span>
                <input
                  value={s}
                  onChange={(e) => set('institutional_steps', steps.map((x, j) => (j === i ? e.target.value : x)))}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => set('institutional_steps', steps.filter((_, j) => j !== i))}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl text-muted active:bg-line"
                  aria-label={`Remover passo ${i + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {steps.length < 8 && (
            <Button
              type="button"
              variant="secondary"
              className="mt-3 w-full"
              onClick={() => set('institutional_steps', [...steps, ''])}
            >
              + Adicionar passo
            </Button>
          )}
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <Button type="submit" form="settings-form" className="w-full" disabled={busy}>
            {busy ? 'Salvando…' : saved ? '✓ Salvo! A TV já vai atualizar' : 'Salvar configurações'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div>
      <span className="mb-2 block text-base font-extrabold">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          className="h-14 w-14 rounded-2xl bg-surface text-3xl font-bold ring-2 ring-line active:bg-bg"
          aria-label="Diminuir"
        >
          −
        </button>
        <div className="min-w-[96px] text-center font-display text-3xl font-bold">
          {value} <span className="text-lg text-muted">{unit}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          className="h-14 w-14 rounded-2xl bg-surface text-3xl font-bold ring-2 ring-line active:bg-bg"
          aria-label="Aumentar"
        >
          +
        </button>
      </div>
    </div>
  );
}
