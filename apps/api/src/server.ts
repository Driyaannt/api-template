import { app } from './app.js'; import { env } from './config/env.js'; import { pool } from './database/raw/pool.js';
import { syncApiCatalog } from './modules/catalog/catalog.sync.js';
await syncApiCatalog();
const server=app.listen(env.PORT,()=>console.log(`API listening on http://localhost:${env.PORT}`)); const close=()=>server.close(()=>pool.end().finally(()=>process.exit(0)));process.on('SIGINT',close);process.on('SIGTERM',close);
