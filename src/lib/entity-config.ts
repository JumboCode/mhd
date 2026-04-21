import { FolderOpenDot, GraduationCap, School, User } from "lucide-react";

/**
 * Entity configuration for Projects, Teachers, Students, and Schools.
 * Colors are defined in globals.css as CSS variables for consistency.
 *
 * Usage:
 * - color: Primary entity color (for icons, chart lines, accents)
 * - colorMuted: Very light tint (for backgrounds, fills)
 * - colorMid: Semi-transparent (for chart strokes, subtle borders)
 * - borderClass: Tailwind class for left border accents on tables
 * - textClass: Tailwind class for colored text (badges, labels)
 * - bgClass: Tailwind class for muted backgrounds
 */
export const ENTITY_CONFIG = {
    projects: {
        icon: FolderOpenDot,
        label: "Total # Projects",
        color: "var(--color-entity-projects)",
        colorMuted: "var(--color-entity-projects-muted)",
        colorMid: "var(--color-entity-projects-stroke)",
        borderClass: "border-l-entity-projects",
        textClass: "text-entity-projects",
        bgClass: "bg-entity-projects-muted",
    },
    teachers: {
        icon: User,
        label: "Total # Teachers",
        color: "var(--color-entity-teachers)",
        colorMuted: "var(--color-entity-teachers-muted)",
        colorMid: "var(--color-entity-teachers-stroke)",
        borderClass: "border-l-entity-teachers",
        textClass: "text-entity-teachers",
        bgClass: "bg-entity-teachers-muted",
    },
    students: {
        icon: GraduationCap,
        label: "Total # Students",
        color: "var(--color-entity-students)",
        colorMuted: "var(--color-entity-students-muted)",
        colorMid: "var(--color-entity-students-stroke)",
        borderClass: "border-l-entity-students",
        textClass: "text-entity-students",
        bgClass: "bg-entity-students-muted",
    },
    // Competing = primary student metric, reuses the existing student pink.
    studentsCompeting: {
        icon: GraduationCap,
        label: "Total # Students",
        color: "rgb(236 72 153)",
        colorMuted: "rgb(236 72 153 / 0.08)",
        colorMid: "rgb(236 72 153 / 0.35)",
        borderClass: "border-l-entity-students",
        textClass: "text-entity-students",
        bgClass: "bg-entity-students-muted",
    },
    // Participating uses a complementary violet ramp.
    studentsParticipating: {
        icon: GraduationCap,
        label: "Total # Students",
        color: "rgb(139 92 246)",
        colorMuted: "rgb(139 92 246 / 0.08)",
        colorMid: "rgb(139 92 246 / 0.35)",
        borderClass: "border-l-entity-students",
        textClass: "text-entity-students",
        bgClass: "bg-entity-students-muted",
    },
    schools: {
        icon: School,
        label: "# Schools",
        color: "var(--color-entity-schools)",
        colorMuted: "var(--color-entity-schools-muted)",
        colorMid: "var(--color-entity-schools-stroke)",
        borderClass: "border-l-entity-schools",
        textClass: "text-entity-schools",
        bgClass: "bg-entity-schools-muted",
    },
} as const;

export type EntityType = keyof typeof ENTITY_CONFIG;

/** Get entity config by type - useful when entity type is dynamic */
export function getEntityConfig(type: EntityType) {
    return ENTITY_CONFIG[type];
}
