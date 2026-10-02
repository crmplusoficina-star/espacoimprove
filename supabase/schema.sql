-- Espaço Improve - schema inicial
create extension if not exists pgcrypto;

create table if not exists public.improvements (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  method text not null check (method in ('Kaizen','A3','PDCA')),
  title text not null,
  area text not null,
  owner_name text not null,
  owner_user_id uuid references auth.users(id) on delete set null,
  problem text not null,
  objective text not null,
  status text not null default 'Rascunho' check (status in ('Rascunho','Enviado','Aprovado','Em execução','Verificação','Concluído')),
  progress integer not null default 0 check (progress between 0 and 100),
  baseline text,
  target text,
  deadline date,
  impact numeric(14,2) not null default 0,
  is_public boolean not null default false,
  submitted_at timestamptz,
  approved_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.improvement_actions (
  id uuid primary key default gen_random_uuid(),
  improvement_id uuid not null references public.improvements(id) on delete cascade,
  title text not null,
  owner_name text,
  due_date date,
  status text not null default 'Aberta' check (status in ('Aberta','Em andamento','Concluída','Cancelada')),
  created_at timestamptz not null default now()
);

create table if not exists public.improvement_updates (
  id uuid primary key default gen_random_uuid(),
  improvement_id uuid not null references public.improvements(id) on delete cascade,
  stage text not null,
  content text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.improvements enable row level security;
alter table public.improvement_actions enable row level security;
alter table public.improvement_updates enable row level security;

drop policy if exists "public can read published improvements" on public.improvements;
create policy "public can read published improvements"
on public.improvements for select
to anon, authenticated
using (is_public = true or owner_user_id = (select auth.uid()));

drop policy if exists "authenticated can create improvements" on public.improvements;
create policy "authenticated can create improvements"
on public.improvements for insert
to authenticated
with check (owner_user_id = (select auth.uid()));

drop policy if exists "owners can update improvements" on public.improvements;
create policy "owners can update improvements"
on public.improvements for update
to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

drop policy if exists "owners can delete improvements" on public.improvements;
create policy "owners can delete improvements"
on public.improvements for delete
to authenticated
using (owner_user_id = (select auth.uid()));

drop policy if exists "actions visible with improvement" on public.improvement_actions;
create policy "actions visible with improvement"
on public.improvement_actions for select
to anon, authenticated
using (exists (
  select 1 from public.improvements i
  where i.id = improvement_id
    and (i.is_public = true or i.owner_user_id = (select auth.uid()))
));

drop policy if exists "owners manage actions" on public.improvement_actions;
create policy "owners manage actions"
on public.improvement_actions for all
to authenticated
using (exists (
  select 1 from public.improvements i
  where i.id = improvement_id and i.owner_user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.improvements i
  where i.id = improvement_id and i.owner_user_id = (select auth.uid())
));

drop policy if exists "updates visible with improvement" on public.improvement_updates;
create policy "updates visible with improvement"
on public.improvement_updates for select
to anon, authenticated
using (exists (
  select 1 from public.improvements i
  where i.id = improvement_id
    and (i.is_public = true or i.owner_user_id = (select auth.uid()))
));

drop policy if exists "owners manage updates" on public.improvement_updates;
create policy "owners manage updates"
on public.improvement_updates for all
to authenticated
using (exists (
  select 1 from public.improvements i
  where i.id = improvement_id and i.owner_user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.improvements i
  where i.id = improvement_id and i.owner_user_id = (select auth.uid())
));
