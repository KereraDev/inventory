'use client';
import { useState } from "react";
import { useInventory } from "../../InventoryProvider";
import Link from "next/link";
import styles from "./proveedores.module.css";

export default function Proveedores() {
  const { suppliers, setSuppliers } = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
  });

  const openModal = () => {
    setShowModal(true);
    setEditId(null);
    setForm({ name: '', contact: '', phone: '', email: '', address: '' });
  };
  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ name: '', contact: '', phone: '', email: '', address: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSupplier = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newSupplier = {
      id: suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1,
      ...form,
    };
    setSuppliers([...suppliers, newSupplier]);
    closeModal();
  };

  const handleEditSupplier = (supplier: typeof suppliers[0]) => {
    setEditId(supplier.id);
    setForm({
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
    });
    setShowModal(true);
  };

  const handleUpdateSupplier = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editId === null) return;
    setSuppliers(suppliers.map(s =>
      s.id === editId ? { ...s, ...form } : s
    ));
    closeModal();
  };

  const handleDeleteSupplier = (id: number) => {
    if (window.confirm('¿Seguro que deseas eliminar este proveedor?')) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  return (
    <div className={styles.layout}>
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
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Proveedores</h1>
          </div>
          <div>
            <button className={styles.btnPrimary} onClick={openModal}>
              + Añadir Proveedor
            </button>
          </div>
        </div>
        <div className={styles.tableContainer}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Todos los Proveedores</h3>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Dirección</th>
                <th className={styles.textRight}>Acciones</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#888' }}>Sin proveedores registrados</td>
                </tr>
              ) : (
                suppliers.map(supplier => (
                  <tr key={supplier.id}>
                    <td>{supplier.id}</td>
                    <td>{supplier.name}</td>
                    <td>{supplier.contact}</td>
                    <td>{supplier.phone}</td>
                    <td>{supplier.email}</td>
                    <td>{supplier.address}</td>
                    <td className={styles.textRight}>
                      <div className={styles.actions}>
                        <button className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`} onClick={() => handleEditSupplier(supplier)}>Editar</button>
                        <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => handleDeleteSupplier(supplier.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Modal para añadir proveedor */}
        {showModal && !editId && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Añadir Proveedor</h3>
                <button className={styles.modalClose} onClick={closeModal}>&times;</button>
              </div>
              <form className={styles.modalBody} onSubmit={handleAddSupplier}>
                <div className={styles.formGroup}>
                  <label>Nombre</label>
                  <input className={styles.formControl} name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Contacto</label>
                  <input className={styles.formControl} name="contact" value={form.contact} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Teléfono</label>
                  <input className={styles.formControl} name="phone" value={form.phone} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input className={styles.formControl} name="email" value={form.email} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Dirección</label>
                  <input className={styles.formControl} name="address" value={form.address} onChange={handleChange} />
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={closeModal}>Cancelar</button>
                  <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal para editar proveedor */}
        {showModal && editId && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Editar Proveedor</h3>
                <button className={styles.modalClose} onClick={closeModal}>&times;</button>
              </div>
              <form className={styles.modalBody} onSubmit={handleUpdateSupplier}>
                <div className={styles.formGroup}>
                  <label>Nombre</label>
                  <input className={styles.formControl} name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Contacto</label>
                  <input className={styles.formControl} name="contact" value={form.contact} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Teléfono</label>
                  <input className={styles.formControl} name="phone" value={form.phone} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input className={styles.formControl} name="email" value={form.email} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Dirección</label>
                  <input className={styles.formControl} name="address" value={form.address} onChange={handleChange} />
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={closeModal}>Cancelar</button>
                  <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Actualizar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
