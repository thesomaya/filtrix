export type FilterType =
    | "checkbox"
    | "radio"
    | "range"
    | "toggle"; //union type

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterConfig {
    id: string;
    title: string;
    type: FilterType;
    options?: FilterOption[];
}

export interface SelectedFilters {
  [key: string]: unknown;
}