export const filterOptions = [
    { value: "school", label: "School" },
    { value: "city", label: "City" },
    { value: "project-type", label: "Project Type" },
    { value: "teacher-participation", label: "Teacher Participation" },
    { value: "only-gateway-school", label: "Gateway School" },
];
export type Filter = (typeof filterOptions)[number];
