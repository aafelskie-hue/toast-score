CREATE OR REPLACE FUNCTION get_bottom_shelf(
  date_filter timestamptz DEFAULT NULL,
  row_limit int DEFAULT 20,
  row_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  image_url text,
  nickname text,
  official_tqi numeric,
  official_tier text,
  jp_verdict text,
  jp_tqi numeric,
  jp_tier text,
  jp_metrics jsonb,
  nana_verdict text,
  nana_tqi numeric,
  nana_tier text,
  nana_metrics jsonb,
  chad_verdict text,
  chad_tqi numeric,
  chad_tier text,
  chad_metrics jsonb,
  created_at timestamptz,
  lowest_tqi numeric,
  harshest_judge text
)
LANGUAGE sql STABLE
AS $$
  SELECT
    t.id,
    t.image_url,
    t.nickname,
    t.official_tqi,
    t.official_tier,
    t.jp_verdict,
    t.jp_tqi,
    t.jp_tier,
    t.jp_metrics,
    t.nana_verdict,
    t.nana_tqi,
    t.nana_tier,
    t.nana_metrics,
    t.chad_verdict,
    t.chad_tqi,
    t.chad_tier,
    t.chad_metrics,
    t.created_at,
    LEAST(t.jp_tqi, t.nana_tqi, t.chad_tqi) AS lowest_tqi,
    CASE LEAST(t.jp_tqi, t.nana_tqi, t.chad_tqi)
      -- Tie-breaking: JP wins ties by WHEN evaluation order.
      -- This matches getHarshestJudge() in judge-avatar.tsx. Do not reorder.
      WHEN t.jp_tqi THEN 'jp'
      WHEN t.nana_tqi THEN 'nana'
      WHEN t.chad_tqi THEN 'chad'
    END AS harshest_judge
  FROM toasts t
  WHERE (date_filter IS NULL OR t.created_at >= date_filter)
  ORDER BY LEAST(t.jp_tqi, t.nana_tqi, t.chad_tqi) ASC
  LIMIT row_limit
  OFFSET row_offset;
$$;
