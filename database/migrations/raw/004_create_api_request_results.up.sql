CREATE TABLE api_request_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint_id uuid NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE,
  request_path varchar(500) NOT NULL,
  status_code integer NOT NULL,
  response jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint_id)
);
CREATE INDEX api_request_results_user_idx ON api_request_results(user_id);
