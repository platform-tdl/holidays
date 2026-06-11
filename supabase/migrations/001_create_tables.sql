-- TDL Vacaciones - Database Schema

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  email TEXT,
  base_days_per_year INT NOT NULL DEFAULT 22,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE yearly_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  year INT NOT NULL,
  base_days INT NOT NULL DEFAULT 22,
  carried_over_days INT NOT NULL DEFAULT 0,
  compensatory_earned INT NOT NULL DEFAULT 0,
  UNIQUE(member_id, year)
);

CREATE TYPE day_type AS ENUM (
  'vacaciones',
  'compensatorio',
  'evento',
  'competicion',
  'examenes'
);

CREATE TABLE day_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_type day_type NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id, date)
);

CREATE INDEX idx_day_entries_member_date ON day_entries(member_id, date);
CREATE INDEX idx_day_entries_date ON day_entries(date);

CREATE TABLE bank_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL
);

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
  COALESCE(used.vacation_used, 0)::int AS vacation_used,
  COALESCE(used.comp_used, 0)::int AS compensatory_used,
  (yb.base_days + yb.carried_over_days + yb.compensatory_earned
    - COALESCE(used.vacation_used, 0)
    - COALESCE(used.comp_used, 0)) AS remaining
FROM team_members tm
JOIN yearly_balances yb ON yb.member_id = tm.id
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) FILTER (WHERE day_type = 'vacaciones') AS vacation_used,
    COUNT(*) FILTER (WHERE day_type = 'compensatorio') AS comp_used
  FROM day_entries de
  WHERE de.member_id = tm.id
    AND EXTRACT(YEAR FROM de.date) = yb.year
) used ON true
WHERE tm.is_active = true;
