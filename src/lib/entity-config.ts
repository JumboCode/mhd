import { FolderOpenDot, GraduationCap, School, User } from "lucide-react";

export const ENTITY_CONFIG = {
    projects: {
        icon: FolderOpenDot,
        label: "Total # Projects",
        color: "rgb(59 130 246)",
        colorLight: "rgb(59 130 246 / 0.08)",
        colorMid: "rgb(59 130 246 / 0.35)",
    },
    teachers: {
        icon: User,
        label: "Total # Teachers",
        color: "rgb(34 197 94)",
        colorLight: "rgb(34 197 94 / 0.08)",
        colorMid: "rgb(34 197 94 / 0.35)",
    },
    students: {
        icon: GraduationCap,
        label: "Total # Students",
        color: "rgb(236 72 153)",
        colorLight: "rgb(236 72 153 / 0.08)",
        colorMid: "rgb(236 72 153 / 0.35)",
    },
    schools: {
        icon: School,
        label: "# Schools",
        color: "rgb(245 158 11)",
        colorLight: "rgb(245 158 11 / 0.08)",
        colorMid: "rgb(245 158 11 / 0.35)",
    },
} as const;
