-- ============================================================
-- Emergency Hunger Alerts Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS emergency_alerts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id       TEXT NOT NULL,
  creator_name     TEXT NOT NULL,
  priority         TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  description      TEXT NOT NULL,
  location         TEXT NOT NULL,
  latitude         DOUBLE PRECISION,
  longitude        DOUBLE PRECISION,
  status           TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'escalated', 'responded', 'closed')),
  responder_id     TEXT,
  voice_transcript TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  escalated_at     TIMESTAMPTZ,
  closed_at        TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Public read (anyone can see active alerts)
CREATE POLICY "Public can read active alerts" ON emergency_alerts
  FOR SELECT USING (status != 'closed');

-- Authenticated users can create alerts
CREATE POLICY "Authenticated users can create alerts" ON emergency_alerts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only responders or creators can update
CREATE POLICY "Responders can update alerts" ON emergency_alerts
  FOR UPDATE USING (true);

-- Index for fast geo queries (future enhancement)
CREATE INDEX IF NOT EXISTS idx_alerts_status ON emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_priority ON emergency_alerts(priority);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON emergency_alerts(created_at DESC);

-- Auto-escalation function (runs via pg_cron every 10 mins)
-- Enable pg_cron extension in Supabase: Extensions > pg_cron
CREATE OR REPLACE FUNCTION escalate_stale_alerts()
RETURNS void AS $$
BEGIN
  UPDATE emergency_alerts
  SET status = 'escalated', escalated_at = now()
  WHERE status = 'open'
    AND created_at < now() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql;

-- Schedule auto-escalation (run in Supabase SQL editor after enabling pg_cron)
-- SELECT cron.schedule('escalate-alerts', '*/10 * * * *', 'SELECT escalate_stale_alerts()');
