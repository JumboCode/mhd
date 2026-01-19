export const filterOptions = [
    { value: "gateway-cities", label: "Gateway Cities" },
    { value: "school", label: "School" },
    { value: "city", label: "City" },
    { value: "project-type", label: "Project Type" },
    { value: "teacher-participation", label: "Teacher Participation" },
];
export type Filter = (typeof filterOptions)[number];
