-- Migration: Change official_tqi from generated column (GREATEST) to regular column (average)
--
-- The official_tqi column was defined as GENERATED ALWAYS AS GREATEST(jp_tqi, nana_tqi, chad_tqi),
-- which silently overrode the average value the application inserted. Postgres does not allow
-- altering a generated column's expression in place, so we must drop and recreate.

-- 1. Drop generated columns and their dependents
DROP INDEX IF EXISTS idx_toasts_official_tqi;
ALTER TABLE toasts DROP COLUMN official_tier;
ALTER TABLE toasts DROP COLUMN official_tqi;

-- 2. Recreate as regular columns
ALTER TABLE toasts ADD COLUMN official_tqi numeric(5,2);
ALTER TABLE toasts ADD COLUMN official_tier text;

-- 3. Backfill official_tqi as average of non-null judge scores
UPDATE toasts SET official_tqi = ROUND(
  (
    COALESCE(jp_tqi, 0) * (jp_tqi IS NOT NULL)::int +
    COALESCE(nana_tqi, 0) * (nana_tqi IS NOT NULL)::int +
    COALESCE(chad_tqi, 0) * (chad_tqi IS NOT NULL)::int
  )::numeric
  / NULLIF(
    (jp_tqi IS NOT NULL)::int +
    (nana_tqi IS NOT NULL)::int +
    (chad_tqi IS NOT NULL)::int,
    0
  ),
  2
);

-- 4. Backfill official_tier from new official_tqi values
UPDATE toasts SET official_tier = CASE
  WHEN official_tqi >= 90 THEN 'Legendary'
  WHEN official_tqi >= 75 THEN 'Golden'
  WHEN official_tqi >= 60 THEN 'Respectable'
  WHEN official_tqi >= 40 THEN 'Questionable'
  WHEN official_tqi >= 20 THEN 'Concerning'
  ELSE 'Criminal'
END;

-- 5. Add NOT NULL constraints
ALTER TABLE toasts ALTER COLUMN official_tqi SET NOT NULL;
ALTER TABLE toasts ALTER COLUMN official_tier SET NOT NULL;

-- 6. Recreate index
CREATE INDEX idx_toasts_official_tqi ON toasts (official_tqi DESC);
