// Shape actually returned by ProductsService.formatProduct()
export interface ApiAttribute {
  id: string;
  name: string;
  value: string | number | boolean;
}

export interface ApiProduct {
  id: string;
  title: string;
  description: string | null;
  price: string;
  category: { id: string; name: string };
  attributes: ApiAttribute[];
}