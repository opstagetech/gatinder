import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Cat, CatStatus } from '../types';
import { friendlyError, listCats } from '../lib/api';
import { formatAge, SEX_LABEL, STATUS_SHORT } from '../lib/format';
import { photoUrl, supabase } from '../lib/supabase';
import { GearIcon, PlusIcon, TvIcon } from '../components/icons';
import { Button, ErrorBox, PageHeader, Spinner } from './ui';

type Filter = CatStatus | 'todos';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'disponivel', label: 'Na TV' },
  { value: 'em_processo', label: 'Em processo' },
  { value: 'adotado', label: 'Adotados' },
  { value: 'todos', label: 'Todos' },
];

export const STATUS_PILL: Record<CatStatus, string> = {
  disponivel: 'bg-ok/15 text-green-700',
  em_processo: 'bg-warn/20 text-amber-700',
  adotado: 'bg-line text-muted',
};

export function CatList() {
  const navigate = useNavigate();
  const [cats, setCats] = useState<Cat[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('disponivel');

  useEffect(() => {
    listCats().then(setCats, (e) => setError(friendlyError(e)));
  }, []);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { disponivel: 0, em_processo: 0, adotado: 0, todos: 0 };
    cats?.forEach((cat) => {
      c[cat.status]++;
      c.todos++;
    });
    return c;
  }, [cats]);

  const shown = cats?.filter((c) => filter === 'todos' || c.status === filter) ?? [];

  return (
    <div className="min-h-[100dvh] pb-32">
      <PageHeader
        title="Gatos"
        right={
          <Link
            to="/admin/config"
            className="flex h-12 w-12 items-center justify-center rounded-xl active:bg-bg"
            aria-label="Configurações"
          >
            <GearIcon className="h-7 w-7" />
          </Link>
        }
      />

      <main className="mx-auto max-w-2xl px-4 pt-4">
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex min-h-[48px] shrink-0 items-center gap-2 rounded-full px-5 text-base font-extrabold ring-2 ${
                filter === f.value ? 'bg-ink text-white ring-ink' : 'bg-surface ring-line'
              }`}
            >
              {f.label}
              <span className={`rounded-full px-2 text-sm ${filter === f.value ? 'bg-white/20' : 'bg-bg'}`}>
                {counts[f.value]}
              </span>
            </button>
          ))}
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}
        {!cats && !error && <Spinner />}

        {cats && shown.length === 0 && (
          <div className="py-16 text-center text-muted">
            <div className="mb-3 text-5xl">😿</div>
            <p className="font-semibold">
              {filter === 'disponivel'
                ? 'Nenhum gato aparecendo na TV agora.'
                : 'Nenhum gato aqui.'}
            </p>
          </div>
        )}

        <ul className="space-y-3">
          {shown.map((cat) => {
            const url = photoUrl(cat.photo_path);
            return (
              <li key={cat.id}>
                <Link
                  to={`/admin/gato/${cat.id}`}
                  className="flex items-center gap-4 rounded-3xl bg-surface p-3 shadow-sm ring-1 ring-line active:bg-bg"
                >
                  <div className="h-[90px] w-[72px] shrink-0 overflow-hidden rounded-2xl bg-bg">
                    {url ? (
                      <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">🐱</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-2xl font-bold">{cat.name}</div>
                    <div className="text-muted">
                      {formatAge(cat.age_months)} · {SEX_LABEL[cat.sex]}
                    </div>
                    <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-sm font-extrabold ${STATUS_PILL[cat.status]}`}>
                      {STATUS_SHORT[cat.status]}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex flex-col gap-3">
          <a
            href="/tv"
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-surface text-lg font-extrabold ring-2 ring-line"
          >
            <TvIcon className="h-6 w-6" /> Abrir a tela da TV
          </a>
          <Button variant="ghost" onClick={() => supabase.auth.signOut()}>
            Sair da conta
          </Button>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-bg via-bg/90 to-transparent px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-6">
        <div className="mx-auto max-w-2xl">
          <Button className="w-full text-xl" onClick={() => navigate('/admin/novo')}>
            <PlusIcon className="h-6 w-6" /> Cadastrar gato
          </Button>
        </div>
      </div>
    </div>
  );
}
