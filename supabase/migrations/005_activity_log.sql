CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id UUID NOT NULL REFERENCES team_members(id),
  member_id UUID NOT NULL REFERENCES team_members(id),
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_member ON activity_log(member_id);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read activity_log" ON activity_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM team_members WHERE email = auth.jwt() ->> 'email' AND is_admin = true)
  );

CREATE POLICY "Authenticated insert activity_log" ON activity_log
  FOR INSERT TO authenticated
  WITH CHECK (true);
