CREATE TABLE api_request_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint_id uuid NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE,
  body jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint_id)
);
CREATE INDEX api_request_drafts_user_idx ON api_request_drafts(user_id);
