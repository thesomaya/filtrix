import { useEffect, useState } from "react";
import { API_BASE } from "../config";

export interface Category {
  id: string;
  slug: string;
  name: string;
  imageFileId: string;
}


export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/categories`);
        const data: Category[] = await res.json();
        if (!cancelled) setCategories(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}