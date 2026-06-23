export interface CacheOptions {
    ttl?: number;
    prefix?: string;
}
export declare class CacheService {
    static get<T = any>(key: string): Promise<T | null>;
    static set<T = any>(key: string, value: T, options?: CacheOptions): Promise<void>;
    static del(key: string): Promise<void>;
    static delPattern(pattern: string): Promise<number>;
    static remember<T = any>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T>;
    static invalidate(...keys: string[]): Promise<void>;
}
//# sourceMappingURL=cache.service.d.ts.map