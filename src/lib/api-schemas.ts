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

/** Body for PATCH /api/schools/[name] — exactly one update shape per request. */
export type SchoolPatchBody = {
    latitude?: number;
    longitude?: number;
    name?: string;
    city?: string;
    division?: string[];
    implementationModel?: string;
    schoolType?: string;
    year?: number;
};

const schoolPatchNameSchema = z
    .object({ name: z.string().trim().min(1) })
    .strict();

const schoolPatchCitySchema = z
    .object({ city: z.string().trim().min(1) })
    .strict();

const schoolPatchLocationSchema = z
    .object({ latitude: latSchema, longitude: longSchema })
    .strict();

const schoolPatchDivisionSchema = z
    .object({
        division: z.array(z.string()),
        year: yearParamSchema,
    })
    .strict();

const schoolPatchImplementationModelSchema = z
    .object({
        implementationModel: z.string(),
        year: yearParamSchema,
    })
    .strict();

const schoolPatchSchoolTypeSchema = z
    .object({
        schoolType: z.string(),
        year: yearParamSchema,
    })
    .strict();

export const schoolPatchBodySchema: z.ZodType<SchoolPatchBody> = z.union([
    schoolPatchNameSchema.transform((d): SchoolPatchBody => ({ name: d.name })),
    schoolPatchCitySchema.transform((d): SchoolPatchBody => ({ city: d.city })),
    schoolPatchLocationSchema.transform(
        (d): SchoolPatchBody => ({
            latitude: d.latitude,
            longitude: d.longitude,
        }),
    ),
    schoolPatchDivisionSchema.transform(
        (d): SchoolPatchBody => ({
            division: d.division,
            year: d.year,
        }),
    ),
    schoolPatchImplementationModelSchema.transform(
        (d): SchoolPatchBody => ({
            implementationModel: d.implementationModel,
            year: d.year,
        }),
    ),
    schoolPatchSchoolTypeSchema.transform(
        (d): SchoolPatchBody => ({
            schoolType: d.schoolType,
            year: d.year,
        }),
    ),
]);

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
