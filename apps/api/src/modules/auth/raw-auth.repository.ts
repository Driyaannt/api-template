import { query, transaction } from '../../database/raw/pool.js';
import type { AuthRepository } from './auth.repository.js'; import type { User } from './auth.types.js';
type Row = { id: string; name: string; email: string; password_hash?: string; status: string; email_verified_at: Date | null; created_at: Date; roles: string[] | null };
const map = (r: Row): User => ({ id: r.id, name: r.name, email: r.email, status: r.status, emailVerifiedAt: r.email_verified_at, createdAt: r.created_at, roles: (r.roles ?? []) as User['roles'] });
const select = `SELECT u.id,u.name,u.email,u.password_hash,u.status,u.email_verified_at,u.created_at,COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL),'{}') roles FROM users u LEFT JOIN user_roles ur ON ur.user_id=u.id LEFT JOIN roles r ON r.id=ur.role_id`;
export class RawAuthRepository implements AuthRepository {
 async findByEmail(email: string) { const r = await query<Row>(`${select} WHERE u.email=$1 GROUP BY u.id LIMIT 1`, [email.toLowerCase()]); return r.rows[0] ? { ...map(r.rows[0]), passwordHash: r.rows[0].password_hash! } : null; }
 async findById(id: string) { const r = await query<Row>(`${select} WHERE u.id=$1 GROUP BY u.id LIMIT 1`, [id]); return r.rows[0] ? map(r.rows[0]) : null; }
 async create(input: { name: string; email: string; passwordHash: string }) { return transaction(async client => { const created = await client.query<Row>('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,status,email_verified_at,created_at', [input.name, input.email.toLowerCase(), input.passwordHash]); const role = await client.query<{id:string}>('SELECT id FROM roles WHERE name=$1', ['USER']); if (role.rows[0]) await client.query('INSERT INTO user_roles(user_id,role_id) VALUES($1,$2)', [created.rows[0].id, role.rows[0].id]); return { ...map(created.rows[0]), roles: ['USER'] as User['roles'] }; }); }
 async storeRefreshToken(userId: string, tokenHash: string, expiresAt: Date) { await query('INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES($1,$2,$3)', [userId, tokenHash, expiresAt]); }
 async consumeRefreshToken(tokenHash: string) { const r = await query<{user_id:string}>('UPDATE refresh_tokens SET revoked_at=NOW() WHERE token_hash=$1 AND revoked_at IS NULL AND expires_at>NOW() RETURNING user_id', [tokenHash]); return r.rows[0]?.user_id ?? null; }
 async revokeRefreshToken(tokenHash: string) { await query('UPDATE refresh_tokens SET revoked_at=NOW() WHERE token_hash=$1 AND revoked_at IS NULL', [tokenHash]); }
}
