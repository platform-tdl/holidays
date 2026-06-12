-- Migrate compensatorio and examenes entries to vacaciones
UPDATE day_entries SET day_type = 'vacaciones' WHERE day_type IN ('compensatorio', 'examenes');

-- Simplify the member_balances view: count all entries as days_used
CREATE OR REPLACE VIEW member_balances AS
SELECT
  tm.id AS member_id,
  tm.name,
  tm.slug,
  yb.year,
  yb.base_days,
  yb.carried_over_days,
  yb.compensatory_earned,
  (yb.base_days + yb.carried_over_days + yb.compensatory_earned) AS total_available,
  COALESCE(used.days_used, 0)::int AS days_used,
  (yb.base_days + yb.carried_over_days + yb.compensatory_earned
    - COALESCE(used.days_used, 0)) AS remaining
FROM team_members tm
JOIN yearly_balances yb ON yb.member_id = tm.id
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS days_used
  FROM day_entries de
  WHERE de.member_id = tm.id
    AND EXTRACT(YEAR FROM de.date) = yb.year
    AND de.day_type IN ('vacaciones', 'compensatorio', 'examenes')
) used ON true
WHERE tm.is_active = true;

GRANT SELECT ON member_balances TO authenticated;
