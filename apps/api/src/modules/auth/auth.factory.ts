import { env } from '../../config/env.js'; import type { AuthRepository } from './auth.repository.js'; import { RawAuthRepository } from './raw-auth.repository.js';
export function createAuthRepository(): AuthRepository { if (env.DB_ACCESS_MODE !== 'raw') throw new Error(`${env.DB_ACCESS_MODE} adapter is structured but not yet enabled; use raw.`); return new RawAuthRepository(); }
