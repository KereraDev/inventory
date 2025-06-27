'use client';
import { useEffect, useState } from "react";
import { useInventory } from "../../InventoryProvider";
import styles from "./dashboard.module.css";
import { IoCube, IoBusiness, IoWarning } from "react-icons/io5";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { products, suppliers } = useInventory();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const lowStockCount = products.filter(p => p.status === "low-stock").length;

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarHeaderTitle}>
            {/* Nuevo icono tipo inventario */}
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
              <rect x="3" y="4" width="18" height="4" rx="1.5" fill="#3498db"/>
              <rect x="3" y="10" width="18" height="4" rx="1.5" fill="#2980b9"/>
              <rect x="3" y="16" width="18" height="4" rx="1.5" fill="#2471a3"/>
              <rect x="7" y="6" width="2" height="2" rx="1" fill="#fff"/>
              <rect x="7" y="12" width="2" height="2" rx="1" fill="#fff"/>
              <rect x="7" y="18" width="2" height="2" rx="1" fill="#fff"/>
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
            <Link className={styles.navLink} href="/lotes">
              <span className={styles.navIcon}>📦</span>
              <span>Lotes</span>
            </Link>
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
            <button
              className={styles.btnPrimary}
              onClick={() => router.push('/inventario?modal=add')}
            >
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
        {/* Tabla de productos recientes */}
        <div className={styles.tableContainer} style={{ marginTop: 30 }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle2}>Últimos Productos</h3>
            <Link href="/inventario" legacyBehavior>
              <a className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}>Ver Todos</a>
            </Link>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {products.slice(-5).reverse().map(product => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={
                      `${styles.status} ` +
                      (product.status === 'in-stock' ? styles.statusInStock : product.status === 'low-stock' ? styles.statusLowStock : styles.statusOutOfStock)
                    }>
                      {product.status === 'in-stock' ? 'En Stock' : product.status === 'low-stock' ? 'Bajo Stock' : 'Agotado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Aquí puedes seguir adaptando la tabla y las secciones de productos y proveedores */}
      </main>
    </div>
  );
}