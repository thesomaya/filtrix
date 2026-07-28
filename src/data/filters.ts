import type { FilterConfig } from "../types/filters";

export const filters: FilterConfig[] = [
  {
    id: "color",
    title: "Color",
    type: "checkbox",
    options: [
      { label: "Black", value: "black" },
      { label: "White", value: "white" },
      { label: "Grey", value: "grey" },
    ],
  },
  {
    id: "weight",
    title: "Weight",
    type: "range",
  },
  {
    id: "mounting",
    title: "Mounting",
    type: "radio",
    options: [
      { label: "DIN Rail", value: "din" },
      { label: "Wall", value: "wall" },
    ],
  },
];