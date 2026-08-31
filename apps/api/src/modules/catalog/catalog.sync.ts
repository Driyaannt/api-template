import { query } from '../../database/raw/pool.js';
import { apiEndpointDefinitions } from './catalog.definition.js';

export async function syncApiCatalog(): Promise<void> {
  for (const endpoint of apiEndpointDefinitions) {
    await query('INSERT INTO api_endpoints(method,path,name,description,module,requires_auth,request_example) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb) ON CONFLICT(method,path) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,module=EXCLUDED.module,requires_auth=EXCLUDED.requires_auth,request_example=EXCLUDED.request_example,updated_at=NOW()', [endpoint.method,endpoint.path,endpoint.name,endpoint.description,endpoint.module,endpoint.requiresAuth,endpoint.requestExample ? JSON.stringify(endpoint.requestExample) : null]);
  }
}
