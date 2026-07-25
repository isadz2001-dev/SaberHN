import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Course } from "./courses";

export interface CartItem {
  courseId: string;
  title: string;
  instructor: string;
  price: number;
  image: string;
  category: string;
}

interface CartState {
  items: CartItem[];
  add: (course: Course) => void;
  remove: (courseId: string) => void;
  clear: () => void;
  has: (courseId: string) => boolean;
  total: number;
  count: number;
}

const CartCtx = createContext<CartState | null>(null);
const KEY = "es_cart";

function load(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(load());
  }, []);

  const persist = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const value: CartState = {
    items,
    add: (course) => {
      setItems((prev) => {
        if (prev.some((i) => i.courseId === course.id)) return prev;
        const next = [
          ...prev,
          {
            courseId: course.id,
            title: course.title,
            instructor: course.instructor,
            price: course.price,
            image: course.image,
            category: course.category,
          },
        ];
        persist(next);
        return next;
      });
    },
    remove: (courseId) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.courseId !== courseId);
        persist(next);
        return next;
      });
    },
    clear: () => persist([]),
    has: (courseId) => items.some((i) => i.courseId === courseId),
    total: items.reduce((a, b) => a + b.price, 0),
    count: items.length,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
