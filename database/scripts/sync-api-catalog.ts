import { syncApiCatalog } from '../../apps/api/src/modules/catalog/catalog.sync.js';
import { pool } from '../../apps/api/src/database/raw/pool.js';
await syncApiCatalog();
console.log('API catalog synchronized from source metadata.');
await pool.end();
