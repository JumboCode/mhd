import { z } from "zod";
import { yearSchema } from "@/lib/year-validation";

// ---------------------------------------------------------------------------
// Reusable primitives
// ---------------------------------------------------------------------------

/** Coerces a search-param string to a validated year. */
export const yearParamSchema = yearSchema;

/** Coerces a search-param / route-param string to a positive integer ID. */
export const idParamSchema = z.coerce.number().int().positive();

/** Latitude must be a finite number. */
export const latSchema = z.coerce.number().finite();

/** Longitude must be a finite number. */
export const longSchema = z.coerce.number().finite();

// ---------------------------------------------------------------------------
// Query-param schemas (GET / DELETE routes)
// ---------------------------------------------------------------------------

export const yearQuerySchema = z.object({
    year: yearParamSchema,
});

export const latLongQuerySchema = z.object({
    lat: latSchema,
    long: longSchema,
});

export const schoolsListQuerySchema = z.object({
    list: z.literal("true").optional(),
    gateway: z.literal("true").optional(),
    year: yearParamSchema.optional(),
});

// ---------------------------------------------------------------------------
// Body schemas (POST / PATCH routes)
// ---------------------------------------------------------------------------

export const mergeSchoolsBodySchema = z
    .object({
        baseSchoolId: z.number().int(),
        mergingSchoolId: z.number().int(),
    })
    .refine((d) => d.baseSchoolId !== d.mergingSchoolId, {
        message: "A school cannot be merged with itself",
    });

export const gatewayPatchBodySchema = z.object({
    gateway: z.boolean(),
});

export const schoolPatchBodySchema = z.object({
    latitude: z.number().finite().optional(),
    longitude: z.number().finite().optional(),
    name: z.string().trim().min(1).optional(),
    city: z.string().trim().min(1).optional(),
    division: z.array(z.string()).optional(),
    implementationModel: z.string().optional(),
    schoolType: z.string().optional(),
    year: yearParamSchema.optional(),
});

export const projectPatchBodySchema = z
    .object({
        title: z.string().trim().min(1).optional(),
        category: z.string().trim().min(1).optional(),
        categoryId: z.string().trim().optional(),
        division: z.string().trim().min(1).optional(),
        teamProject: z
            .union([z.boolean(), z.literal("true"), z.literal("false")])
            .transform((v) => v === true || v === "true")
            .optional(),
        numStudents: z.coerce.number().int().positive().optional(),
    })
    .refine((d) => Object.keys(d).length > 0, {
        message: "No valid fields to update",
    });

export const teacherPatchBodySchema = z
    .object({
        name: z.string().trim().min(1).optional(),
        email: z
            .string()
            .trim()
            .min(1)
            .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format")
            .optional(),
    })
    .refine((d) => Object.keys(d).length > 0, {
        message: "No valid fields to update",
    });
