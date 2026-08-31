CREATE TABLE api_request_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint_id uuid NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE,
  request_path varchar(500),
  request_body jsonb,
  response_status integer,
  response_body jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint_id)
);
INSERT INTO api_request_history(user_id,endpoint_id,request_body,updated_at)
SELECT user_id,endpoint_id,body,updated_at FROM api_request_drafts
ON CONFLICT(user_id,endpoint_id) DO UPDATE SET request_body=EXCLUDED.request_body,updated_at=GREATEST(api_request_history.updated_at,EXCLUDED.updated_at);
INSERT INTO api_request_history(user_id,endpoint_id,request_path,response_status,response_body,updated_at)
SELECT user_id,endpoint_id,request_path,status_code,response,updated_at FROM api_request_results
ON CONFLICT(user_id,endpoint_id) DO UPDATE SET request_path=EXCLUDED.request_path,response_status=EXCLUDED.response_status,response_body=EXCLUDED.response_body,updated_at=GREATEST(api_request_history.updated_at,EXCLUDED.updated_at);
DROP TABLE api_request_drafts;
DROP TABLE api_request_results;
CREATE INDEX api_request_history_user_idx ON api_request_history(user_id);
