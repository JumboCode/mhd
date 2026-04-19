export const filterOptions = [
    { value: "school", label: "School" },
    { value: "city", label: "City" },
    { value: "project-type", label: "Project Type" },
    { value: "division", label: "Division" },
    { value: "school-type", label: "School Type" },
    { value: "region", label: "Region" },
    { value: "implementation-type", label: "Implementation Type" },
    { value: "teacher-participation", label: "Teacher Participation" },
    { value: "only-gateway-school", label: "Gateway School" },
];
export type Filter = (typeof filterOptions)[number];

// Filter values that use the generic multi-select popover (FilterValuePopover)
export type MultiSelectFilterType =
    | "school"
    | "city"
    | "project-type"
    | "division"
    | "school-type"
    | "region"
    | "implementation-type";
