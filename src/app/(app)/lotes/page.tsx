'use client';
import React, { useState, useEffect } from "react";
import { useInventory } from "../../InventoryProvider";
import styles from "./lotes.module.css";
import Link from "next/link";

// Tipo para lote
interface LoteProducto {
  productId: number;
  cantidad: number;
}
interface Lote {
  id: number;
  nombre: string;
  productos: LoteProducto[];
}

export default function Lotes() {
  const { products, suppliers } = useInventory(); // <-- ahora también traemos suppliers
  // Leer lotes de localStorage
  const [lotes, setLotes] = useState<Lote[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("lotes");
      if (stored) return JSON.parse(stored);
    }
    // Ejemplo inicial
    return [
      { id: 1, nombre: "Bodega 1", productos: [{ productId: 1, cantidad: 5 }, { productId: 2, cantidad: 3 }] },
      { id: 2, nombre: "Bodega 2", productos: [] },
    ];
  });
  const [nuevoLote, setNuevoLote] = useState("");

  // Guardar lotes en localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lotes", JSON.stringify(lotes));
    }
  }, [lotes]);

  // Editar lote (ahora el modal se encarga)
  const handleEditLote = (lote: Lote) => {};

  // Eliminar lote
  const handleDeleteLote = (loteId: number) => {
    if (window.confirm("¿Seguro que deseas eliminar este lote?")) {
      setLotes(lotes.filter(l => l.id !== loteId));
    }
  };

  // Actualizar productos del lote y nombre
  const handleUpdateLoteProducts = (loteId: number, productos: LoteProducto[], nuevoNombre?: string) => {
    setLotes(lotes.map(l =>
      l.id === loteId
        ? { ...l, productos, nombre: nuevoNombre !== undefined ? nuevoNombre : l.nombre }
        : l
    ));
  };

  // Crear lote
  const handleAddLote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nuevoLote.trim()) return;
    setLotes([...lotes, { id: Date.now(), nombre: nuevoLote, productos: [] }]);
    setNuevoLote("");
  };

  // Componente de tabla de lotes con acciones rápidas y modal
  function LotesTable({ lotes, products, onEditLote, onDeleteLote, onUpdateLoteProducts }: {
    lotes: Lote[];
    products: { id: number; name: string; description?: string; category?: string; price?: number; stock?: number; }[];
    onEditLote: (lote: Lote) => void;
    onDeleteLote: (loteId: number) => void;
    onUpdateLoteProducts: (loteId: number, productos: LoteProducto[], nuevoNombre?: string) => void;
  }) {
    const [showModal, setShowModal] = useState(false);
    const [modalLote, setModalLote] = useState<Lote | null>(null);
    const [modalProducts, setModalProducts] = useState<LoteProducto[]>([]);
    const [editName, setEditName] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState("");

    const handleView = (lote: Lote) => {
      setModalLote(lote);
      setModalProducts(lote.productos);
      setEditName(false);
      setShowModal(true);
    };

    const handleEdit = (lote: Lote) => {
      setModalLote(lote);
      setModalProducts(lote.productos);
      setNuevoNombre(lote.nombre);
      setEditName(true);
      setShowModal(true);
    };

    // Cambia la cantidad de un producto en el modal
    const handleCantidadChange = (productId: number, cantidad: number) => {
      // Calcular el máximo permitido para este producto
      const stockTotal = products.find(p => p.id === productId)?.stock ?? 0;
      // Suma de cantidades en otros lotes (excluyendo el actual modal)
      const cantidadEnOtrasBodegas = lotes.reduce((acc, l) => {
        if (!modalLote || l.id === modalLote.id) return acc;
        const found = l.productos.find(p => p.productId === productId);
        return acc + (found ? found.cantidad : 0);
      }, 0);
      const maxPermitido = stockTotal - cantidadEnOtrasBodegas;
      const nuevaCantidad = Math.max(1, Math.min(cantidad, maxPermitido));
      setModalProducts(prev =>
        prev.map(p => p.productId === productId ? { ...p, cantidad: nuevaCantidad } : p)
      );
    };

    // Agrega o quita productos del lote
    const handleToggleProduct = (pid: number) => {
      // Calcular el máximo permitido para este producto
      const stockTotal = products.find(p => p.id === pid)?.stock ?? 0;
      const cantidadEnOtrasBodegas = lotes.reduce((acc, l) => {
        if (!modalLote || l.id === modalLote.id) return acc;
        const found = l.productos.find(p => p.productId === pid);
        return acc + (found ? found.cantidad : 0);
      }, 0);
      const maxPermitido = stockTotal - cantidadEnOtrasBodegas;
      setModalProducts(prev => {
        if (prev.some(p => p.productId === pid)) {
          return prev.filter(p => p.productId !== pid);
        } else {
          return [...prev, { productId: pid, cantidad: Math.max(1, maxPermitido) }];
        }
      });
    };

    const handleSave = () => {
      if (modalLote) {
        onUpdateLoteProducts(modalLote.id, modalProducts, editName ? nuevoNombre : undefined);
      }
      setShowModal(false);
      setEditName(false);
    };

    return (
      <div>
        <table className={styles.lotesTable}>
          <thead>
            <tr className={styles.lotesTableHeadRow}>
              <th className={styles.lotesTableHead}>Nombre del lote</th>
              <th className={styles.lotesTableHeadCenter}>Cantidad de productos</th>
              <th className={styles.lotesTableHeadCenter}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lotes.map(lote => (
              <tr key={lote.id} className={styles.lotesTableRow}>
                <td className={styles.lotesTableCell}>{lote.nombre}</td>
                <td className={styles.lotesTableCellCenter}>{lote.productos.reduce((acc, p) => acc + p.cantidad, 0)}</td>
                <td className={styles.lotesTableCellCenter}>
                  <button className={styles.btnPrimary} style={{ marginRight: 8 }} onClick={() => handleView(lote)}>Ver</button>
                  <button className={styles.btnPrimary} style={{ marginRight: 8 }} onClick={() => handleEdit(lote)}>Editar</button>
                  <button className={styles.btnDanger} onClick={() => onDeleteLote(lote.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Modal de productos del lote */}
        {showModal && modalLote && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              {editName ? (
                <>
                  <h3 className={styles.modalTitle}>Editar bodega</h3>
                  <input
                    className={styles.formControl}
                    value={nuevoNombre}
                    onChange={e => setNuevoNombre(e.target.value)}
                    placeholder="Nuevo nombre de la bodega"
                    style={{ marginBottom: 16 }}
                  />
                </>
              ) : (
                <h3 className={styles.modalTitle}>Productos en "{modalLote.nombre}"</h3>
              )}
              <div className={styles.modalTableWrapper}>
                <table className={styles.lotesTableModal}>
                  <thead>
                    <tr>
                      <th className={styles.lotesTableHead}>Producto</th>
                      <th className={styles.lotesTableHead}>Proveedor</th>
                      <th className={styles.lotesTableHead}>Añadir</th>
                      <th className={styles.lotesTableHead}>Stock disponible</th>
                      <th className={styles.lotesTableHeadCenter}>Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(prod => {
                      if (!prod.name || prod.name.trim() === "") return null;
                      const stockTotal = prod.stock ?? 0;
                      const cantidadEnOtrasBodegas = lotes.reduce((acc, l) => {
                        if (!modalLote || l.id === modalLote.id) return acc;
                        const found = l.productos.find(p => p.productId === prod.id);
                        return acc + (found ? found.cantidad : 0);
                      }, 0);
                      const loteProd = modalProducts.find(lp => lp.productId === prod.id);
                      const cantidadEnEsteLote = loteProd ? loteProd.cantidad : 0;
                      const stockDisponible = stockTotal - cantidadEnOtrasBodegas;
                      return (
                        <tr key={prod.id}>
                          <td>{prod.name}</td>
                          <td>{prod.proveedor || '-'}</td>
                          <td>
                            <input
                              type="number"
                              min={0}
                              max={stockDisponible}
                              value={cantidadEnEsteLote}
                              onChange={e => {
                                const val = Number(e.target.value);
                                if (val === 0) {
                                  setModalProducts(prev => prev.filter(p => p.productId !== prod.id));
                                } else {
                                  if (loteProd) {
                                    setModalProducts(prev => prev.map(p => p.productId === prod.id ? { ...p, cantidad: val } : p));
                                  } else {
                                    setModalProducts(prev => [...prev, { productId: prod.id, cantidad: val }]);
                                  }
                                }
                              }}
                              style={{ width: 60 }}
                            />
                          </td>
                          <td>{stockDisponible}</td>
                          <td>{prod.price !== undefined ? `$${prod.price}` : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.btnPrimary} style={{ marginRight: 8 }} onClick={() => { setShowModal(false); setEditName(false); }}>Cancelar</button>
                <button className={styles.btnPrimary} onClick={handleSave}>Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarHeaderTitle}>
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block" }}
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="4"
                rx="1.5"
                fill="#3498db"
              />
              <rect
                x="3"
                y="10"
                width="18"
                height="4"
                rx="1.5"
                fill="#2980b9"
              />
              <rect
                x="3"
                y="16"
                width="18"
                height="4"
                rx="1.5"
                fill="#2471a3"
              />
              <rect x="7" y="6" width="2" height="2" rx="1" fill="#fff" />
              <rect x="7" y="12" width="2" height="2" rx="1" fill="#fff" />
              <rect x="7" y="18" width="2" height="2" rx="1" fill="#fff" />
            </svg>
            <span>InventarioApp</span>
          </h2>
        </div>
        <ul className={styles.navLinks}>
          <li>
            <Link className={styles.navLink} href="/dashboard">
              <span className={styles.navIcon}>📊</span>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link className={styles.navLink} href="/inventario">
              <span className={styles.navIcon}>📦</span>
              <span>Inventario</span>
            </Link>
          </li>
          <li>
            <Link className={styles.navLink} href="/proveedores">
              <span className={styles.navIcon}>🏭</span>
              <span>Proveedores</span>
            </Link>
          </li>
          <li>
            <Link className={`${styles.navLink} ${styles.navLinkActive}`} href="/lotes">
              <span className={styles.navIcon}>📦</span>
              <span>Lotes</span>
            </Link>
          </li>
        </ul>
      </aside>
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Lotes</h1>
        </div>
        <form
          onSubmit={handleAddLote}
          style={{ marginBottom: 24, display: "flex", gap: 8 }}
        >
          <input
            className={styles.formControl}
            value={nuevoLote}
            onChange={(e) => setNuevoLote(e.target.value)}
            placeholder="Nombre del lote (ej: Bodega 1)"
          />
          <button className={styles.btnPrimary} type="submit">
            Crear lote
          </button>
        </form>
        <LotesTable
          lotes={lotes}
          products={products
            .filter(p => p.name && p.name.trim() !== "")
            .map(p => ({
              id: p.id,
              name: p.name,
              stock: p.stock,
              price: p.price,
              proveedor: suppliers?.find(s => s.id === p.supplierId)?.name || '-' // <-- nombre del proveedor
            }))}
          onEditLote={handleEditLote}
          onDeleteLote={handleDeleteLote}
          onUpdateLoteProducts={handleUpdateLoteProducts}
        />
      </main>
    </div>
  );
}
