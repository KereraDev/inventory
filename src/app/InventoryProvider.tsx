"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

// Tipos
export type Movement = {
  movementId: number;
  date: string; // Solo fecha
  time: string; // Solo hora
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  supplierId: number;
  status: string;
  movement: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  supplierId: number;
  status: string;
  movement: string;
  quantity: number;
  minLowStock?: number;
  minInStock?: number;
};

export type Supplier = {
  id: number;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
};

const initialProducts: Product[] = [
  { id: 1, name: "Laptop HP Elite", description: "Laptop de 15 pulgadas con 8GB RAM", category: "Tecnología", price: 1200, stock: 15, supplierId: 1, status: "in-stock", movement: "entrada", quantity: 0 },
  { id: 2, name: "Mouse Inalámbrico", description: "Mouse ergonómico inalámbrico", category: "Tecnología", price: 25.99, stock: 42, supplierId: 1, status: "in-stock", movement: "entrada", quantity: 0 },
  { id: 3, name: "Teclado Mecánico", description: "Teclado mecánico retroiluminado", category: "Tecnología", price: 89.99, stock: 5, supplierId: 2, status: "low-stock", movement: "entrada", quantity: 0 },
  { id: 4, name: "Monitor 24\"", description: "Monitor Full HD 24 pulgadas", category: "Tecnología", price: 199.99, stock: 0, supplierId: 3, status: "out-of-stock", movement: "entrada", quantity: 0 }
];

const initialSuppliers: Supplier[] = [
  { id: 1, name: "Tech Solutions SA", contact: "Juan Perez", phone: "555-123-4567", email: "info@techsolutions.com", address: "Av. Principal 123, Lima" },
  { id: 2, name: "Electronic Parts", contact: "Maria Gomez", phone: "555-987-6543", email: "ventas@electronicparts.com", address: "Calle Secundaria 456, Lima" },
  { id: 3, name: "Global Components", contact: "Carlos Ruiz", phone: "555-555-5555", email: "contacto@globalcomp.com", address: "Jr. Comercial 789, Lima" }
];

// Contexto
export const InventoryContext = createContext<null | {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  movements: Movement[];
  setMovements: React.Dispatch<React.SetStateAction<Movement[]>>;
  movementCounter: number;
  setMovementCounter: React.Dispatch<React.SetStateAction<number>>;
}>(null);

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory debe usarse dentro de InventoryProvider");
  return ctx;
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  // Leer de localStorage solo en cliente
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("products");
      if (stored) return JSON.parse(stored);
    }
    return initialProducts;
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("suppliers");
      if (stored) return JSON.parse(stored);
    }
    return initialSuppliers;
  });
  const [movements, setMovements] = useState<Movement[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("movements");
      if (stored) return JSON.parse(stored);
    }
    return [];
  });
  const [movementCounter, setMovementCounter] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("movementCounter");
      if (stored) return JSON.parse(stored);
    }
    return 1;
  });

  // Guardar en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem("suppliers", JSON.stringify(suppliers));
  }, [suppliers]);
  useEffect(() => {
    localStorage.setItem("movements", JSON.stringify(movements));
  }, [movements]);
  useEffect(() => {
    localStorage.setItem("movementCounter", JSON.stringify(movementCounter));
  }, [movementCounter]);

  return (
    <InventoryContext.Provider value={{
      products, setProducts,
      suppliers, setSuppliers,
      movements, setMovements,
      movementCounter, setMovementCounter
    }}>
      {children}
    </InventoryContext.Provider>
  );
}
