import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Login } from './Login';
import { Button, Spinner } from './ui';

type Access = 'checking' | 'staff' | 'not_staff' | 'error';

/** Protege todas as telas do /admin: precisa de login E estar na tabela staff */
export function AdminLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [access, setAccess] = useState<Access>('checking');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    setAccess('checking');
    supabase
      .from('staff')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => setAccess(error ? 'error' : data ? 'staff' : 'not_staff'));
  }, [userId]);

  if (session === undefined) return <Spinner />;
  if (!session) return <Login />;
  if (access === 'checking') return <Spinner label="Verificando acesso…" />;

  if (access !== 'staff') {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center gap-5 px-5 text-center">
        <div className="text-6xl">🙀</div>
        <h1 className="font-display text-2xl font-bold">
          {access === 'error' ? 'Não consegui verificar seu acesso' : 'Sua conta ainda não tem acesso'}
        </h1>
        <p className="text-muted">
          {access === 'error'
            ? 'Confira a internet e tente de novo.'
            : `Você entrou como ${session.user.email}, mas ainda não está na lista da equipe. Peça ao responsável para liberar.`}
        </p>
        {access === 'error' && <Button onClick={() => location.reload()}>Tentar de novo</Button>}
        <Button variant="secondary" onClick={() => supabase.auth.signOut()}>
          Sair
        </Button>
      </div>
    );
  }

  return <Outlet />;
}
