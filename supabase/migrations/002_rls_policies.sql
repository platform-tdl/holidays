-- Enable RLS but with public access policies (no auth yet)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read team_members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Public read yearly_balances" ON yearly_balances FOR SELECT USING (true);
CREATE POLICY "Public all day_entries" ON day_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read bank_holidays" ON bank_holidays FOR SELECT USING (true);

-- Grant access to the view
GRANT SELECT ON member_balances TO anon, authenticated;
