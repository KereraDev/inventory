'use client';
import { useState } from "react";
import styles from "./inventario.module.css";
import { IoCube, IoBusiness, IoWarning } from "react-icons/io5";

const initialProducts = [
  { id: 1, name: "Laptop HP Elite", description: "Laptop de 15 pulgadas con 8GB RAM", category: "Tecnología", price: 1200, stock: 15, supplierId: 1, status: "in-stock" },
  { id: 2, name: "Mouse Inalámbrico", description: "Mouse ergonómico inalámbrico", category: "Tecnología", price: 25.99, stock: 42, supplierId: 1, status: "in-stock" },
  { id: 3, name: "Teclado Mecánico", description: "Teclado mecánico retroiluminado", category: "Tecnología", price: 89.99, stock: 5, supplierId: 2, status: "low-stock" },
  { id: 4, name: "Monitor 24\"", description: "Monitor Full HD 24 pulgadas", category: "Tecnología", price: 199.99, stock: 0, supplierId: 3, status: "out-of-stock" }
];

const initialSuppliers = [
  { id: 1, name: "Tech Solutions SA", contact: "Juan Perez", phone: "555-123-4567", email: "info@techsolutions.com", address: "Av. Principal 123, Lima" },
  { id: 2, name: "Electronic Parts", contact: "Maria Gomez", phone: "555-987-6543", email: "ventas@electronicparts.com", address: "Calle Secundaria 456, Lima" },
  { id: 3, name: "Global Components", contact: "Carlos Ruiz", phone: "555-555-5555", email: "contacto@globalcomp.com", address: "Jr. Comercial 789, Lima" }
];

export default function Inventario() {
  const [products] = useState(initialProducts);
  const [suppliers] = useState(initialSuppliers);

  const lowStockCount = products.filter(p => p.status === "low-stock").length;

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarHeaderTitle}>
            <img src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/bab5cfed-f914-49cb-9aee-cf7ad1e542d0.png" alt="Logo" className={styles.sidebarLogo} />
            <span>InventarioPro</span>
          </h2>
        </div>
        <ul className={styles.navLinks}>
          <li>
            <button className={`${styles.navLink} ${styles.navLinkActive}`}> {/* Puedes manejar el estado activo con useState */}
              <span className={styles.navIcon}>📊</span>
              <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button className={styles.navLink}>
              <span className={styles.navIcon}>📦</span>
              <span>Productos</span>
            </button>
          </li>
          <li>
            <button className={styles.navLink}>
              <span className={styles.navIcon}>🏭</span>
              <span>Proveedores</span>
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
          </div>
          <div>
            <button className={styles.btnPrimary}>
              + Añadir Producto
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Total Productos</h3>
              <div className={`${styles.cardIcon} ${styles.cardIconProducts}`}>
                <IoCube size={24} />
              </div>
            </div>
            <div className={styles.cardValue}>{products.length}</div>
            <div className={styles.cardFooter}>En inventario</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Total Proveedores</h3>
              <div className={`${styles.cardIcon} ${styles.cardIconSuppliers}`}>
                <IoBusiness size={24} />
              </div>
            </div>
            <div className={styles.cardValue}>{suppliers.length}</div>
            <div className={styles.cardFooter}>Registrados</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Bajo Stock</h3>
              <div className={`${styles.cardIcon} ${styles.cardIconLowStock}`}>
                <IoWarning size={24} />
              </div>
            </div>
            <div className={styles.cardValue}>{lowStockCount}</div>
            <div className={styles.cardFooter}>Productos con stock bajo</div>
          </div>
        </div>
        {/* Aquí puedes seguir adaptando la tabla y las secciones de productos y proveedores */}
      </main>
    </div>
  );
}