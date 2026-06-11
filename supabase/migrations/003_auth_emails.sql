-- Add is_admin column and populate emails for auth
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

UPDATE team_members SET email = 'maria.ruiz@thedigitalabs.com' WHERE slug = 'maria-ruiz';
UPDATE team_members SET email = 'jose.rivas@thedigitalabs.com' WHERE slug = 'jota';
UPDATE team_members SET email = 'rocio.ruiz@thedigitalabs.com', is_admin = true WHERE slug = 'rocio-ruiz';
UPDATE team_members SET email = 'daniel.pajuelo@thedigitalabs.com' WHERE slug = 'dani-pajuelo';
UPDATE team_members SET email = 'cristinarhnrh@gmail.com' WHERE slug = 'cristina';
UPDATE team_members SET email = 'lucia.santiago@thedigitalabs.com' WHERE slug = 'lucia';
UPDATE team_members SET email = 'pol.moya@thedigitalabs.com' WHERE slug = 'pol';
UPDATE team_members SET email = 'guillermo.rergis@thedigitalabs.com' WHERE slug = 'guillermo';
UPDATE team_members SET email = 'german.ruiz@thedigitalabs.com' WHERE slug = 'german';
UPDATE team_members SET email = 'carmen.ruiz@atos.net', is_admin = true WHERE slug = 'carmen';
UPDATE team_members SET email = 'eulogio.ruiz@thedigitalabs.com', is_admin = true WHERE slug = 'eulogio';

-- Make email NOT NULL and UNIQUE now that all are set
ALTER TABLE team_members ALTER COLUMN email SET NOT NULL;
ALTER TABLE team_members ADD CONSTRAINT team_members_email_key UNIQUE (email);

-- Replace RLS policies with auth-aware ones
DROP POLICY IF EXISTS "Public read team_members" ON team_members;
DROP POLICY IF EXISTS "Public read yearly_balances" ON yearly_balances;
DROP POLICY IF EXISTS "Public all day_entries" ON day_entries;
DROP POLICY IF EXISTS "Public read bank_holidays" ON bank_holidays;

-- Everyone authenticated can read everything
CREATE POLICY "Authenticated read team_members" ON team_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read yearly_balances" ON yearly_balances
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read day_entries" ON day_entries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read bank_holidays" ON bank_holidays
  FOR SELECT TO authenticated USING (true);

-- Users can insert/delete their own day entries
CREATE POLICY "Own insert day_entries" ON day_entries
  FOR INSERT TO authenticated
  WITH CHECK (
    member_id = (SELECT id FROM team_members WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Own delete day_entries" ON day_entries
  FOR DELETE TO authenticated
  USING (
    member_id = (SELECT id FROM team_members WHERE email = auth.jwt() ->> 'email')
  );

-- Admins can also insert/delete any day entries
CREATE POLICY "Admin insert day_entries" ON day_entries
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM team_members WHERE email = auth.jwt() ->> 'email' AND is_admin = true)
  );

CREATE POLICY "Admin delete day_entries" ON day_entries
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM team_members WHERE email = auth.jwt() ->> 'email' AND is_admin = true)
  );

-- Admins can update yearly_balances (compensatory days)
CREATE POLICY "Admin update yearly_balances" ON yearly_balances
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM team_members WHERE email = auth.jwt() ->> 'email' AND is_admin = true)
  );

-- Admins can insert yearly_balances (carryover)
CREATE POLICY "Admin insert yearly_balances" ON yearly_balances
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM team_members WHERE email = auth.jwt() ->> 'email' AND is_admin = true)
  );

-- Update the view grants
REVOKE SELECT ON member_balances FROM anon;
GRANT SELECT ON member_balances TO authenticated;
