export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'USER';
export interface User { id: string; name: string; email: string; roles: Role[]; status: string; emailVerifiedAt: Date | null; createdAt: Date; }
