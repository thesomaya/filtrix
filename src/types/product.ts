export interface ApiAttribute {
  id: string;
  name: string;
  value: string | number | boolean | { min: number; max: number } | string[] | null;
  unit: string;

}

export interface ApiImage {
  id: string;
  url: string;
  isPrimary: boolean;
}
export interface ApiProduct {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  price: string;
  category: { id: string; name: string };
  images: ApiImage[];
  attributes: ApiAttribute[];
}