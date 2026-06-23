import { UserContext } from './permissions.service';
export declare class AppError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string);
}
export declare const securePrisma: {
    roomOrder: {
        findMany: (ctx: UserContext, args?: any) => any;
        findUnique: (ctx: UserContext, id: string, args?: any) => any;
        findFirst: (ctx: UserContext, args?: any) => any;
        count: (ctx: UserContext, args?: any) => any;
        create: (ctx: UserContext, args?: any) => any;
        createMany: (ctx: UserContext, args?: any) => any;
        update: (ctx: UserContext, id: string, data: any, args?: any) => any;
        updateMany: (ctx: UserContext, args: any) => any;
        delete: (ctx: UserContext, id: string) => any;
        deleteMany: (ctx: UserContext, args?: any) => any;
    };
    room: {
        findMany: (ctx: UserContext, args?: any) => any;
        findUnique: (ctx: UserContext, id: string, args?: any) => any;
        findFirst: (ctx: UserContext, args?: any) => any;
        count: (ctx: UserContext, args?: any) => any;
        create: (ctx: UserContext, args?: any) => any;
        createMany: (ctx: UserContext, args?: any) => any;
        update: (ctx: UserContext, id: string, data: any, args?: any) => any;
        updateMany: (ctx: UserContext, args: any) => any;
        delete: (ctx: UserContext, id: string) => any;
        deleteMany: (ctx: UserContext, args?: any) => any;
    };
    staff: {
        findMany: (ctx: UserContext, args?: any) => any;
        findUnique: (ctx: UserContext, id: string, args?: any) => any;
        findFirst: (ctx: UserContext, args?: any) => any;
        count: (ctx: UserContext, args?: any) => any;
        create: (ctx: UserContext, args?: any) => any;
        createMany: (ctx: UserContext, args?: any) => any;
        update: (ctx: UserContext, id: string, data: any, args?: any) => any;
        updateMany: (ctx: UserContext, args: any) => any;
        delete: (ctx: UserContext, id: string) => any;
        deleteMany: (ctx: UserContext, args?: any) => any;
    };
    vault: {
        findMany: (ctx: UserContext, args?: any) => any;
        findUnique: (ctx: UserContext, id: string, args?: any) => any;
        findFirst: (ctx: UserContext, args?: any) => any;
        count: (ctx: UserContext, args?: any) => any;
        create: (ctx: UserContext, args?: any) => any;
        createMany: (ctx: UserContext, args?: any) => any;
        update: (ctx: UserContext, id: string, data: any, args?: any) => any;
        updateMany: (ctx: UserContext, args: any) => any;
        delete: (ctx: UserContext, id: string) => any;
        deleteMany: (ctx: UserContext, args?: any) => any;
    };
    suiteControl: {
        findMany: (ctx: UserContext, args?: any) => any;
        findUnique: (ctx: UserContext, id: string, args?: any) => any;
        findFirst: (ctx: UserContext, args?: any) => any;
        count: (ctx: UserContext, args?: any) => any;
        create: (ctx: UserContext, args?: any) => any;
        createMany: (ctx: UserContext, args?: any) => any;
        update: (ctx: UserContext, id: string, data: any, args?: any) => any;
        updateMany: (ctx: UserContext, args: any) => any;
        delete: (ctx: UserContext, id: string) => any;
        deleteMany: (ctx: UserContext, args?: any) => any;
    };
    pricing: {
        findMany: (ctx: UserContext, args?: any) => any;
        findUnique: (ctx: UserContext, id: string, args?: any) => any;
        findFirst: (ctx: UserContext, args?: any) => any;
        count: (ctx: UserContext, args?: any) => any;
        create: (ctx: UserContext, args?: any) => any;
        createMany: (ctx: UserContext, args?: any) => any;
        update: (ctx: UserContext, id: string, data: any, args?: any) => any;
        updateMany: (ctx: UserContext, args: any) => any;
        delete: (ctx: UserContext, id: string) => any;
        deleteMany: (ctx: UserContext, args?: any) => any;
    };
    course: {
        findMany: (ctx: UserContext, args?: any) => any;
        findUnique: (ctx: UserContext, id: string, args?: any) => any;
        findFirst: (ctx: UserContext, args?: any) => any;
        count: (ctx: UserContext, args?: any) => any;
        create: (ctx: UserContext, args?: any) => any;
        createMany: (ctx: UserContext, args?: any) => any;
        update: (ctx: UserContext, id: string, data: any, args?: any) => any;
        updateMany: (ctx: UserContext, args: any) => any;
        delete: (ctx: UserContext, id: string) => any;
        deleteMany: (ctx: UserContext, args?: any) => any;
    };
    hotel: {
        findMany: (ctx: UserContext, args?: any) => any;
        findUnique: (ctx: UserContext, id: string, args?: any) => any;
        findFirst: (ctx: UserContext, args?: any) => any;
        count: (ctx: UserContext, args?: any) => any;
        create: (ctx: UserContext, args?: any) => any;
        createMany: (ctx: UserContext, args?: any) => any;
        update: (ctx: UserContext, id: string, data: any, args?: any) => any;
        updateMany: (ctx: UserContext, args: any) => any;
        delete: (ctx: UserContext, id: string) => any;
        deleteMany: (ctx: UserContext, args?: any) => any;
    };
    audit: {
        findMany: (ctx: UserContext, args?: any) => any;
        findUnique: (ctx: UserContext, id: string, args?: any) => any;
        findFirst: (ctx: UserContext, args?: any) => any;
        count: (ctx: UserContext, args?: any) => any;
        create: (ctx: UserContext, args?: any) => any;
        createMany: (ctx: UserContext, args?: any) => any;
        update: (ctx: UserContext, id: string, data: any, args?: any) => any;
        updateMany: (ctx: UserContext, args: any) => any;
        delete: (ctx: UserContext, id: string) => any;
        deleteMany: (ctx: UserContext, args?: any) => any;
    };
    user: {
        findMany: (ctx: UserContext, args?: any) => any;
        findUnique: (ctx: UserContext, id: string, args?: any) => any;
        findFirst: (ctx: UserContext, args?: any) => any;
        count: (ctx: UserContext, args?: any) => any;
        create: (ctx: UserContext, args?: any) => any;
        createMany: (ctx: UserContext, args?: any) => any;
        update: (ctx: UserContext, id: string, data: any, args?: any) => any;
        updateMany: (ctx: UserContext, args: any) => any;
        delete: (ctx: UserContext, id: string) => any;
        deleteMany: (ctx: UserContext, args?: any) => any;
    };
};
//# sourceMappingURL=secure-prisma.d.ts.map