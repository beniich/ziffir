import { PrismaClient } from '@prisma/client';
declare global {
    var __prisma: PrismaClient | undefined;
}
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
type PrismaTx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;
export declare const transaction: <T>(callback: (tx: PrismaTx) => Promise<T>) => Promise<T>;
export declare const withRetry: <T>(fn: () => Promise<T>, retries?: number) => Promise<T>;
export declare const softDelete: (model: string, id: string) => Promise<any>;
export {};
//# sourceMappingURL=database.d.ts.map