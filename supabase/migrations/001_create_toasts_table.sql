create table if not exists toasts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  image_url text not null,
  nickname text not null default 'Anonymous Toaster',

  -- Jean-Pierre (JP) judge
  jp_verdict text,
  jp_browning_uniformity_score numeric(4,2),
  jp_crust_integrity_score numeric(4,2),
  jp_crumb_crust_ratio_score numeric(4,2),
  jp_char_analysis_score numeric(4,2),
  jp_surface_texture_score numeric(4,2),
  jp_presentation_score numeric(4,2),
  jp_tqi numeric(5,2),

  -- Nana judge (Phase 2)
  nana_verdict text,
  nana_browning_uniformity_score numeric(4,2),
  nana_crust_integrity_score numeric(4,2),
  nana_crumb_crust_ratio_score numeric(4,2),
  nana_char_analysis_score numeric(4,2),
  nana_surface_texture_score numeric(4,2),
  nana_presentation_score numeric(4,2),
  nana_tqi numeric(5,2),

  -- Chad judge (Phase 2)
  chad_verdict text,
  chad_browning_uniformity_score numeric(4,2),
  chad_crust_integrity_score numeric(4,2),
  chad_crumb_crust_ratio_score numeric(4,2),
  chad_char_analysis_score numeric(4,2),
  chad_surface_texture_score numeric(4,2),
  chad_presentation_score numeric(4,2),
  chad_tqi numeric(5,2),

  -- Official (aggregated) scores
  official_tqi numeric(5,2),
  official_tier text
);

-- Indexes
create index idx_toasts_created_at on toasts (created_at desc);
create index idx_toasts_official_tqi on toasts (official_tqi desc);
create index idx_toasts_official_tier on toasts (official_tier);
