-- =====================================================================
-- Gatinder — schema inicial
-- Rodar no SQL Editor do Supabase (projeto novo, exclusivo do gatil).
-- =====================================================================

-- ---------- Tipos ----------------------------------------------------
create type cat_sex as enum ('macho', 'femea');
create type cat_status as enum ('disponivel', 'em_processo', 'adotado');
create type cat_temperament as enum (
  'brincalhao', 'calmo', 'carinhoso', 'timido',
  'gosta_de_gatos', 'gosta_de_caes'
);

-- ---------- Equipe (quem pode usar o painel) -------------------------
-- Ter login no Supabase NÃO basta: a pessoa precisa estar nesta lista.
-- Assim, se alguém criar conta por engano, não consegue mexer em nada.
create table staff (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

create or replace function is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from staff where user_id = auth.uid());
$$;

-- ---------- Gatos ----------------------------------------------------
create table cats (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 40),
  -- idade aproximada em meses: dá pra mostrar "4 meses" ou "2 anos"
  age_months    smallint not null check (age_months between 0 and 300),
  sex           cat_sex not null,
  neutered      boolean not null default false,   -- castrado
  vaccinated    boolean not null default false,   -- vacinado
  temperament   cat_temperament[] not null default '{}',
  bio           text not null default '' check (char_length(bio) <= 120),
  status        cat_status not null default 'disponivel',
  photo_path    text,            -- caminho no bucket cat-photos (já cortada 4:5)
  sort_order    integer not null default 0,  -- ordem na TV (menor primeiro)
  adopted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index cats_status_order_idx on cats (status, sort_order, created_at);

-- updated_at automático + data de adoção
create or replace function cats_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status = 'adotado' and (tg_op = 'INSERT' or old.status <> 'adotado') then
    new.adopted_at := now();
  elsif new.status <> 'adotado' then
    new.adopted_at := null;
  end if;
  return new;
end $$;

create trigger cats_touch_trg
before insert or update on cats
for each row execute function cats_touch();

-- ---------- Configurações da vitrine (linha única) -------------------
-- Para a equipe trocar WhatsApp/textos sem precisar de programador.
create table settings (
  id                     boolean primary key default true check (id), -- só 1 linha
  whatsapp_number        text not null default '',   -- só dígitos, ex.: 5511999999999
  whatsapp_message       text not null default 'Oi! Vi um gatinho na TV e quero dar match 😺',
  slide_seconds          smallint not null default 10 check (slide_seconds between 5 and 60),
  institutional_every_min smallint not null default 5 check (institutional_every_min between 1 and 60),
  institutional_title    text not null default 'Como funciona a adoção',
  institutional_steps    text[] not null default array[
    'Escolha seu match na TV',
    'Fale com a nossa equipe',
    'Preencha a ficha de adoção',
    'Conheça o gatinho pessoalmente',
    'Leve seu novo amigo pra casa 💚'
  ],
  updated_at             timestamptz not null default now()
);
insert into settings default values;

-- ---------- Segurança (RLS) ------------------------------------------
alter table staff    enable row level security;
alter table cats     enable row level security;
alter table settings enable row level security;

-- TV (sem login): só enxerga gatos DISPONÍVEIS
create policy "tv vê disponíveis" on cats
  for select to anon
  using (status = 'disponivel');

-- Equipe: vê e mexe em tudo
create policy "equipe lê gatos"     on cats for select to authenticated using (is_staff());
create policy "equipe cria gatos"   on cats for insert to authenticated with check (is_staff());
create policy "equipe edita gatos"  on cats for update to authenticated using (is_staff()) with check (is_staff());
create policy "equipe apaga gatos"  on cats for delete to authenticated using (is_staff());

-- Configurações: todo mundo lê (a TV precisa), só a equipe edita
create policy "todos leem config"   on settings for select to anon, authenticated using (true);
create policy "equipe edita config" on settings for update to authenticated using (is_staff()) with check (is_staff());

-- Lista da equipe: cada um só confere a própria linha (o painel usa pra saber se tem acesso).
-- Adicionar/remover gente da equipe é feito pelo dono no painel do Supabase, não pelo app.
create policy "vê a si mesmo" on staff for select to authenticated using (user_id = auth.uid());

-- ---------- Storage: fotos ------------------------------------------
-- Bucket público para leitura: a TV precisa baixar e guardar as fotos em cache
-- sem login. Os nomes de arquivo são UUID aleatório, então não dá pra "adivinhar"
-- foto de gato adotado. Envio/troca/remoção só pela equipe.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cat-photos', 'cat-photos', true, 3 * 1024 * 1024,
        array['image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "equipe envia fotos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'cat-photos' and is_staff());

create policy "equipe troca fotos" on storage.objects
  for update to authenticated
  using (bucket_id = 'cat-photos' and is_staff())
  with check (bucket_id = 'cat-photos' and is_staff());

create policy "equipe apaga fotos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'cat-photos' and is_staff());

-- ---------- Realtime -------------------------------------------------
-- A TV escuta mudanças ao vivo (e ainda faz polling de 1 min como reserva).
--
-- A TV não escuta a tabela de gatos direto: quando um gato vira "adotado",
-- ela perde a permissão de ver a linha e NÃO receberia o aviso. Por isso,
-- qualquer mudança em gatos "cutuca" a linha de configurações, que a TV
-- sempre enxerga, e a TV então recarrega a lista.
create or replace function cats_ping_tv()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update settings set updated_at = now() where id;
  return null;
end $$;

create trigger cats_ping_tv_trg
after insert or update or delete on cats
for each statement execute function cats_ping_tv();

alter publication supabase_realtime add table settings;

-- ---------- Depois de rodar -----------------------------------------
-- 1. Authentication → Providers → Email: DESLIGAR "Allow new users to sign up".
-- 2. Authentication → Users → "Add user" para cada funcionário (e-mail + senha).
-- 3. Colocar cada um na equipe:
--    insert into staff (user_id, name)
--    select id, 'Nome da pessoa' from auth.users where email = 'pessoa@petshop.com';
