import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { friendlyError } from '../lib/api';
import { BRAND } from '../theme/brand';
import { loginToEmail } from '../lib/login';
import { Button, ErrorBox, Field, inputClass } from './ui';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: loginToEmail(email), password });
    if (error) setError(friendlyError(error));
    setBusy(false);
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-5 py-10">
      <div className="mb-8 flex flex-col items-center gap-3">
        <h1>
          <img src={BRAND.gatinderLogo} alt="Gatinder" className="h-16 w-auto" />
        </h1>
        <p className="text-center font-semibold text-muted">Painel da equipe</p>
      </div>

      <form onSubmit={submit} className="w-full max-w-sm space-y-5">
        <Field label="Usuário ou e-mail">
          <input
            type="text"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Senha">
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>
        {error && <ErrorBox>{error}</ErrorBox>}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Entrando…' : 'Entrar'}
        </Button>
        <p className="text-center text-sm text-muted">Esqueceu a senha? Peça ao responsável pelo gatil.</p>
      </form>

      <img src={BRAND.fecovetLogo} alt="FecoVet" className="mt-12 h-10 w-auto opacity-90" />
    </div>
  );
}
