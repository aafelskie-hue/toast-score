drop table if exists toasts;

create table toasts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  nickname text not null default 'Anonymous Toaster',
  official_tqi numeric(5,2) not null,
  official_tier text not null,
  jp_verdict text,
  jp_tqi numeric(5,2),
  jp_tier text,
  jp_metrics jsonb,
  nana_verdict text,
  nana_tqi numeric(5,2),
  nana_tier text,
  nana_metrics jsonb,
  chad_verdict text,
  chad_tqi numeric(5,2),
  chad_tier text,
  chad_metrics jsonb,
  created_at timestamptz not null default now()
);

create index idx_toasts_official_tqi on toasts (official_tqi desc);
create index idx_toasts_created_at on toasts (created_at desc);
create index idx_toasts_official_tier on toasts (official_tier);
