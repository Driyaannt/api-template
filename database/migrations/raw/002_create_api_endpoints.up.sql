CREATE TABLE api_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method varchar(10) NOT NULL CHECK(method IN ('GET','POST','PUT','PATCH','DELETE')),
  path varchar(255) NOT NULL,
  name varchar(160) NOT NULL,
  description text,
  module varchar(80) NOT NULL,
  requires_auth boolean NOT NULL DEFAULT false,
  request_example jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(method,path)
);
CREATE INDEX api_endpoints_module_idx ON api_endpoints(module);
