-- Add verdicts JSONB column for flexible judge storage
ALTER TABLE toasts ADD COLUMN IF NOT EXISTS verdicts jsonb;

-- Backfill from flat columns (array format)
UPDATE toasts SET verdicts = (
  SELECT jsonb_agg(v) FROM (
    SELECT jsonb_build_object(
      'judge_id', 'jp',
      'judge_name', 'Jean-Pierre',
      'verdict', t.jp_verdict,
      'tqi', t.jp_tqi,
      'tier', t.jp_tier,
      'metrics', t.jp_metrics
    ) AS v WHERE t.jp_verdict IS NOT NULL
    UNION ALL
    SELECT jsonb_build_object(
      'judge_id', 'nana',
      'judge_name', 'Nana',
      'verdict', t.nana_verdict,
      'tqi', t.nana_tqi,
      'tier', t.nana_tier,
      'metrics', t.nana_metrics
    ) WHERE t.nana_verdict IS NOT NULL
    UNION ALL
    SELECT jsonb_build_object(
      'judge_id', 'chad',
      'judge_name', 'Chad',
      'verdict', t.chad_verdict,
      'tqi', t.chad_tqi,
      'tier', t.chad_tier,
      'metrics', t.chad_metrics
    ) WHERE t.chad_verdict IS NOT NULL
  ) sub
)
FROM toasts t
WHERE toasts.id = t.id AND toasts.verdicts IS NULL;

-- Make required after backfill
ALTER TABLE toasts ALTER COLUMN verdicts SET NOT NULL;

-- GIN index for querying
CREATE INDEX IF NOT EXISTS idx_toasts_verdicts ON toasts USING gin(verdicts);
