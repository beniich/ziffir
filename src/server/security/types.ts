export type SecurityRole = 'guest' | 'client' | 'operator' | 'manager' | 'sovereign_member' | 'system_admin';

export interface SecurityUser {
  userId: string;
  tenantId: string; // Used for database isolation
  role: SecurityRole;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: SecurityUser;
    }
  }
}
