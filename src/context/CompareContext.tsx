import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "filtrix:compare";
export const MAX_COMPARE = 4;

interface CompareContextValue {
  selected: string[];
  toggleCompare: (id: string) => void;
  isSelected: (id: string) => boolean;
  clear: () => void;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | undefined>(
  undefined,
);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    } catch {
      // ignore storage errors (private browsing, quota, etc.)
    }
  }, [selected]);

  const toggleCompare = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const isSelected = (id: string) => selected.includes(id);
  const clear = () => setSelected([]);

  return (
    <CompareContext.Provider
      value={{
        selected,
        toggleCompare,
        isSelected,
        clear,
        isFull: selected.length >= MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return ctx;
}