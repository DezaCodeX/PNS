create extension if not exists pgcrypto;

do $$ begin
  create type public.admin_user_status as enum ('active', 'disabled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.permission_effect as enum ('allow', 'deny');
exception when duplicate_object then null;
end $$;

create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_protected boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text not null,
  password_hash text not null,
  status public.admin_user_status not null default 'active',
  role_id uuid not null references public.admin_roles(id),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  is_active boolean not null default true,
  is_protected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_permissions (
  id uuid primary key default gen_random_uuid(),
  permission_key text not null unique,
  label text not null,
  area text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_group_permissions (
  group_id uuid not null references public.admin_groups(id) on delete cascade,
  permission_id uuid not null references public.admin_permissions(id) on delete cascade,
  effect public.permission_effect not null default 'allow',
  primary key (group_id, permission_id)
);

create table if not exists public.admin_user_groups (
  user_id uuid not null references public.admin_users(id) on delete cascade,
  group_id uuid not null references public.admin_groups(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, group_id)
);

create table if not exists public.admin_user_permissions (
  user_id uuid not null references public.admin_users(id) on delete cascade,
  permission_id uuid not null references public.admin_permissions(id) on delete cascade,
  effect public.permission_effect not null,
  primary key (user_id, permission_id)
);

create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.admin_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists admin_sessions_token_hash_idx on public.admin_sessions(token_hash);
create index if not exists admin_sessions_expires_at_idx on public.admin_sessions(expires_at);

create table if not exists public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.admin_users(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  outcome text not null,
  request_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_events_created_at_idx on public.admin_audit_events(created_at desc);

create table if not exists public.managed_images (
  id uuid primary key default gen_random_uuid(),
  category_type text not null check (category_type in ('room', 'dining')),
  category_id text not null,
  source_type text not null check (source_type in ('upload', 'external', 'bundled')),
  public_url text not null,
  storage_path text,
  display_location text not null default 'gallery',
  display_order integer not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  legacy_id text unique,
  created_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists managed_images_category_idx on public.managed_images(category_type, category_id, is_active, display_order);

insert into public.admin_roles (name, is_protected)
values ('Super Admin', true), ('Administrator', false)
on conflict (name) do nothing;

insert into public.admin_permissions (permission_key, label, area)
values
  ('room_images.read', 'Read room images', 'Room images'),
  ('room_images.upload', 'Upload room images', 'Room images'),
  ('room_images.add_url', 'Add room image URLs', 'Room images'),
  ('room_images.delete', 'Delete room images', 'Room images'),
  ('dining_images.read', 'Read dining images', 'Dining images'),
  ('dining_images.upload', 'Upload dining images', 'Dining images'),
  ('dining_images.add_url', 'Add dining image URLs', 'Dining images'),
  ('dining_images.delete', 'Delete dining images', 'Dining images'),
  ('users.read', 'Read users', 'Administration'),
  ('users.create', 'Create users', 'Administration'),
  ('users.update', 'Update users', 'Administration'),
  ('users.disable', 'Enable or disable users', 'Administration'),
  ('groups.read', 'Read groups', 'Administration'),
  ('groups.create', 'Create groups', 'Administration'),
  ('groups.update', 'Update groups', 'Administration'),
  ('groups.delete', 'Delete groups', 'Administration'),
  ('groups.members.manage', 'Manage group members', 'Administration'),
  ('groups.permissions.manage', 'Manage group permissions', 'Administration'),
  ('audit.read', 'Read audit events', 'Administration')
on conflict (permission_key) do nothing;

insert into public.admin_groups (name, description, is_protected)
values ('Super Admins', 'Built-in full administration group', true)
on conflict (name) do nothing;

insert into public.admin_group_permissions (group_id, permission_id, effect)
select g.id, p.id, 'allow'::public.permission_effect
from public.admin_groups g cross join public.admin_permissions p
where g.name = 'Super Admins'
on conflict (group_id, permission_id) do nothing;

alter table public.admin_roles enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_groups enable row level security;
alter table public.admin_permissions enable row level security;
alter table public.admin_group_permissions enable row level security;
alter table public.admin_user_groups enable row level security;
alter table public.admin_user_permissions enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.admin_audit_events enable row level security;
alter table public.managed_images enable row level security;

create or replace function public.admin_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_users_updated_at on public.admin_users;
create trigger admin_users_updated_at before update on public.admin_users for each row execute function public.admin_touch_updated_at();
drop trigger if exists admin_groups_updated_at on public.admin_groups;
create trigger admin_groups_updated_at before update on public.admin_groups for each row execute function public.admin_touch_updated_at();
drop trigger if exists managed_images_updated_at on public.managed_images;
create trigger managed_images_updated_at before update on public.managed_images for each row execute function public.admin_touch_updated_at();
