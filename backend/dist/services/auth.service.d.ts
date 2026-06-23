export type UserRole = 'VISITOR' | 'CLIENT' | 'HOTEL' | 'SUPER_ADMIN';
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export interface AuthResult {
    user: {
        id: string;
        email: string;
        username: string;
        role: UserRole;
        hotelId?: string | null;
    };
    tokens: TokenPair;
}
export declare class AuthService {
    static hashPassword(password: string): Promise<string>;
    static verifyPassword(password: string, hash: string): Promise<boolean>;
    static generateAccessToken(userId: string, role: UserRole, hotelId?: string | null): string;
    static generateRefreshToken(userId: string): string;
    static verifyAccessToken(token: string): {
        userId: string;
        role: UserRole;
        hotelId?: string | null;
    };
    static verifyRefreshToken(token: string): {
        userId: string;
        jti: string;
    };
    static register(email: string, username: string, password: string, role?: UserRole): Promise<AuthResult>;
    static login(email: string, password: string): Promise<AuthResult>;
    static refresh(refreshToken: string): Promise<TokenPair>;
    static logout(userId: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map