import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
export declare const validate: (schema: ZodSchema, source?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => void;
export declare const schemas: {
    register: z.ZodObject<{
        email: z.ZodString;
        username: z.ZodString;
        password: z.ZodString;
        role: z.ZodDefault<z.ZodEnum<{
            operator: "operator";
            manager: "manager";
            admin: "admin";
        }>>;
    }, z.core.$strip>;
    login: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
    refresh: z.ZodObject<{
        refreshToken: z.ZodString;
    }, z.core.$strip>;
    createAudit: z.ZodObject<{
        user: z.ZodString;
        role: z.ZodString;
        action: z.ZodString;
        reason: z.ZodString;
        status: z.ZodEnum<{
            AUTHORIZED: "AUTHORIZED";
            BYPASS: "BYPASS";
            RESTRICTED_ATTEMPT: "RESTRICTED_ATTEMPT";
        }>;
    }, z.core.$strip>;
    createOrder: z.ZodObject<{
        roomNumber: z.ZodString;
        guestName: z.ZodString;
        guestVIP: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        items: z.ZodArray<z.ZodObject<{
            courseCode: z.ZodString;
            quantity: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
        notes: z.ZodOptional<z.ZodString>;
        priority: z.ZodDefault<z.ZodEnum<{
            low: "low";
            normal: "normal";
            high: "high";
        }>>;
    }, z.core.$strip>;
    createStaff: z.ZodObject<{
        name: z.ZodString;
        role: z.ZodEnum<{
            operator: "operator";
            manager: "manager";
            admin: "admin";
        }>;
        department: z.ZodString;
        clearanceLevel: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    updateClearance: z.ZodObject<{
        clearanceLevel: z.ZodNumber;
    }, z.core.$strip>;
    createCourse: z.ZodObject<{
        code: z.ZodString;
        name: z.ZodString;
        category: z.ZodEnum<{
            Operations: "Operations";
            Gastronomy: "Gastronomy";
            Service: "Service";
            Management: "Management";
        }>;
        credits: z.ZodNumber;
        grade: z.ZodEnum<{
            D: "D";
            "A+": "A+";
            A: "A";
            "A-": "A-";
            "B+": "B+";
            B: "B";
            "B-": "B-";
            "C+": "C+";
            C: "C";
            "C-": "C-";
            F: "F";
        }>;
        completedDate: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=validation.d.ts.map