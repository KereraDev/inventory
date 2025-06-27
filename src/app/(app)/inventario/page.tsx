'use client';
import { useState, useEffect } from "react";
import { useInventory } from "../../InventoryProvider";
import type { Product } from "../../InventoryProvider";
import styles from "./inventario.module.css";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function Inventario() {
  const { products, setProducts, suppliers, movements, setMovements, movementCounter, setMovementCounter } = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    supplierId: '',
    status: 'in-stock',
    movement: 'entrada',
    quantity: '',
    minLowStock: '1',
    minInStock: '10',
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [movementFilters, setMovementFilters] = useState({
    movement: '',
    category: '',
    supplierId: '',
    status: '',
  });
  const [movementSort, setMovementSort] = useState({
    date: '', // '', 'asc', 'desc'
    time: '',
    id: '', // '', 'asc', 'desc'
    quantity: '',
    price: '',
  });
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Estado inicial de filtros y ordenamiento SOLO con los campos visibles
  const initialMovementFilters = {
    movement: '',
    category: '',
    supplierId: '',
    status: '',
  };
  const initialMovementSort = {
    date: '',
    time: '',
    id: '',
    quantity: '',
    price: '',
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && searchParams.get("modal") === "add") {
      setShowModal(true);
      setEditId(null);
    }
  }, [mounted, searchParams]);

  if (!mounted) return null;

  // Obtener categorías únicas de los movimientos
  const uniqueMovementCategories = Array.from(new Set(movements.map(m => m.category))).filter(Boolean);

  // Filtrar movimientos según los filtros activos
  const filteredMovements = movements.filter(movement =>
    (movementFilters.movement === '' || movement.movement === movementFilters.movement) &&
    (movementFilters.category === '' || movement.category === movementFilters.category) &&
    (movementFilters.supplierId === '' || movement.supplierId.toString() === movementFilters.supplierId) &&
    (movementFilters.status === '' || movement.status === movementFilters.status)
  );

  // Ordenar movimientos filtrados
  let sortedMovements = [...filteredMovements];
  if (movementSort.date) {
    sortedMovements.sort((a, b) => {
      const dA = a.date.split('/').reverse().join('-');
      const dB = b.date.split('/').reverse().join('-');
      return movementSort.date === 'asc' ? dA.localeCompare(dB) : dB.localeCompare(dA);
    });
  } else if (movementSort.time) {
    sortedMovements.sort((a, b) => {
      return movementSort.time === 'asc' ? a.time.localeCompare(b.time) : b.time.localeCompare(a.time);
    });
  } else if (movementSort.id) {
    sortedMovements.sort((a, b) => movementSort.id === 'asc' ? a.id - b.id : b.id - a.id);
  } else if (movementSort.quantity) {
    sortedMovements.sort((a, b) => movementSort.quantity === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity);
  } else if (movementSort.price) {
    sortedMovements.sort((a, b) => movementSort.price === 'asc' ? a.price - b.price : b.price - a.price);
  }

  // Abrir modal
  const openModal = () => {
    setShowModal(true);
    setEditId(null);
  };
  const closeModal = () => {
    setShowModal(false);
    setForm({
      name: '',
      description: '',
      category: '',
      price: '',
      stock: '',
      supplierId: '',
      status: 'in-stock',
      movement: 'entrada',
      quantity: '',
      minLowStock: '1',
      minInStock: '10',
    });
    setEditId(null);
  };

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      // Buscar productos con ese nombre
      const matches = products.filter(p => p.name.trim().toLowerCase() === value.trim().toLowerCase());
      if (matches.length > 0) {
        // Si hay proveedor seleccionado y existe la combinación, autocompletar con ese producto
        const matchWithSupplier = matches.find(p => p.supplierId.toString() === form.supplierId);
        if (matchWithSupplier) {
          setForm(prev => ({
            ...prev,
            name: value,
            supplierId: matchWithSupplier.supplierId.toString(),
            stock: matchWithSupplier.stock.toString(),
            description: matchWithSupplier.description,
            category: matchWithSupplier.category,
            price: matchWithSupplier.price.toString(),
          }));
          return;
        } else {
          // Si no hay proveedor seleccionado, autocompletar con el primer match y setear proveedor
          const firstMatch = matches[0];
          setForm(prev => ({
            ...prev,
            name: value,
            supplierId: firstMatch.supplierId.toString(),
            stock: firstMatch.stock.toString(),
            description: firstMatch.description,
            category: firstMatch.category,
            price: firstMatch.price.toString(),
          }));
          return;
        }
      } else {
        // Si no hay match, limpiar campos
        setForm(prev => ({
          ...prev,
          name: value,
          supplierId: '',
          stock: '',
          description: '',
          category: '',
          price: '',
        }));
        return;
      }
    }
    if (name === 'supplierId') {
      // Si cambia proveedor, buscar si existe ese producto con ese proveedor
      const existing = products.find(p =>
        p.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
        p.supplierId.toString() === value
      );
      if (existing) {
        setForm(prev => ({
          ...prev,
          supplierId: value,
          stock: existing.stock.toString(),
          description: existing.description,
          category: existing.category,
          price: existing.price.toString(),
        }));
        return;
      } else {
        // Si no existe, limpiar campos excepto nombre y proveedor
        setForm(prev => ({
          ...prev,
          supplierId: value,
          stock: '',
          description: '',
          category: '',
          price: '',
        }));
        return;
      }
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Tipos para los handlers
  const handleEditProduct = (product: Product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      supplierId: product.supplierId.toString(),
      status: product.status,
      movement: product.movement,
      quantity: '',
      minLowStock: (product.minLowStock !== undefined ? product.minLowStock : 1).toString(),
      minInStock: (product.minInStock !== undefined ? product.minInStock : 10).toString(),
    });
    setShowModal(true);
  };

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let stock = parseInt(form.stock || '0', 10);
    let quantity = parseInt(form.quantity || '0', 10);
    const minLowStock = parseInt(form.minLowStock || '1', 10);
    const minInStock = parseInt(form.minInStock || '10', 10);
    // Buscar si ya existe producto con mismo nombre y proveedor
    const existingIdx = products.findIndex(p =>
      p.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
      p.supplierId.toString() === form.supplierId
    );
    let status = 'in-stock';
    if (existingIdx !== -1) {
      let updatedProduct = { ...products[existingIdx], minLowStock, minInStock };
      if (form.movement === 'entrada') {
        updatedProduct.stock += quantity;
      } else if (form.movement === 'salida') {
        updatedProduct.stock -= quantity;
        if (updatedProduct.stock < 0) updatedProduct.stock = 0;
      }
      // Usar los umbrales personalizados
      if (updatedProduct.stock <= 0) status = 'out-of-stock';
      else if (updatedProduct.stock < minInStock && updatedProduct.stock >= minLowStock) status = 'low-stock';
      else if (updatedProduct.stock >= minInStock) status = 'in-stock';
      updatedProduct.status = status;
      updatedProduct.movement = form.movement;
      updatedProduct.quantity = quantity;
      updatedProduct.description = form.description;
      updatedProduct.category = form.category;
      updatedProduct.price = parseFloat(form.price || '0');
      setProducts(products.map((p, idx) => idx === existingIdx ? updatedProduct : p));
      setMovements([{ // Cambiado: movimiento al principio
        movementId: movementCounter,
        date: new Date().toLocaleDateString(), // Solo fecha
        time: new Date().toLocaleTimeString(), // Solo hora
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        category: updatedProduct.category,
        price: updatedProduct.price,
        quantity,
        supplierId: updatedProduct.supplierId,
        status: updatedProduct.status,
        movement: form.movement,
      }, ...movements]);
      setMovementCounter(movementCounter + 1);
    } else {
      if (form.movement === 'entrada') {
        stock += quantity;
      } else if (form.movement === 'salida') {
        stock -= quantity;
        if (stock < 0) stock = 0;
      }
      if (stock <= 0) status = 'out-of-stock';
      else if (stock < minInStock && stock >= minLowStock) status = 'low-stock';
      else if (stock >= minInStock) status = 'in-stock';
      const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: form.name,
        description: form.description,
        category: form.category,
        price: parseFloat(form.price || '0'),
        stock,
        supplierId: parseInt(form.supplierId || '0', 10),
        status,
        movement: form.movement,
        quantity,
        minLowStock,
        minInStock,
      };
      setProducts([ ...products, newProduct ]);
      setMovements([{ // Cambiado: movimiento al principio
        movementId: movementCounter,
        date: new Date().toLocaleDateString(), // Solo fecha
        time: new Date().toLocaleTimeString(), // Solo hora
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        price: newProduct.price,
        quantity: newProduct.quantity,
        supplierId: newProduct.supplierId,
        status: newProduct.status,
        movement: newProduct.movement,
      }, ...movements]);
      setMovementCounter(movementCounter + 1);
    }
    closeModal();
  };

  // Agregar handler para actualizar producto
  function handleUpdateProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editId === null) return;
    let stock = parseInt(form.stock || '0', 10);
    let quantity = parseInt(form.quantity || '0', 10);
    const minLowStock = parseInt(form.minLowStock || '1', 10);
    const minInStock = parseInt(form.minInStock || '10', 10);
    let status = 'in-stock';
    if (form.movement === 'entrada') {
      stock += quantity;
    } else if (form.movement === 'salida') {
      stock -= quantity;
      if (stock < 0) stock = 0;
    }
    if (stock <= 0) status = 'out-of-stock';
    else if (stock < minInStock && stock >= minLowStock) status = 'low-stock';
    else if (stock >= minInStock) status = 'in-stock';
    const updatedProduct = {
      id: editId,
      name: form.name,
      description: form.description,
      category: form.category,
      price: parseFloat(form.price || '0'),
      stock,
      supplierId: parseInt(form.supplierId || '0', 10),
      status,
      movement: form.movement,
      quantity,
      minLowStock,
      minInStock,
    };
    setProducts(products.map(p => p.id === editId ? updatedProduct : p));
    setMovements([{ // Cambiado: movimiento al principio
      movementId: movementCounter,
      date: new Date().toLocaleDateString(), // Solo fecha
      time: new Date().toLocaleTimeString(), // Solo hora
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      category: updatedProduct.category,
      price: updatedProduct.price,
      quantity: updatedProduct.quantity,
      supplierId: updatedProduct.supplierId,
      status: updatedProduct.status,
      movement: updatedProduct.movement,
    }, ...movements]);
    setMovementCounter(movementCounter + 1);
    closeModal();
  }

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
      const deletedProduct = products.find(p => p.id === id);
      if (!deletedProduct) return;
      setProducts(products.filter(p => p.id !== id));
      setMovements([
        {
          movementId: movementCounter,
          date: new Date().toLocaleDateString(), // Solo fecha
          time: new Date().toLocaleTimeString(), // Solo hora
          id: deletedProduct.id,
          name: deletedProduct.name,
          description: deletedProduct.description,
          category: deletedProduct.category,
          price: deletedProduct.price,
          quantity: 0,
          supplierId: deletedProduct.supplierId,
          status: 'deleted',
          movement: 'eliminado',
        },
        ...movements,
      ]);
      setMovementCounter(movementCounter + 1);
    }
  };

  // Exportar movimientos a PDF
  const exportMovementsToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [[
        "Fecha", "Hora", "ID", "Movimiento", "Cantidad", "Producto", "Descripción", "Categoría", "Precio", "Proveedor", "Estado"
      ]],
      body: sortedMovements.map(m => [
        m.date,
        m.time,
        m.id,
        m.movement === 'entrada' ? 'Entrada' : m.movement === 'salida' ? 'Salida' : m.movement,
        m.quantity,
        m.name,
        m.description,
        m.category,
        `$${m.price.toFixed(2)}`,
        suppliers.find(s => s.id === m.supplierId)?.name || 'N/A',
        m.status === 'in-stock' ? 'En Stock' : m.status === 'low-stock' ? 'Bajo Stock' : m.status === 'out-of-stock' ? 'Agotado' : m.status
      ]),
    });
    doc.save("movimientos.pdf");
  };

  // Exportar movimientos a Excel
  const exportMovementsToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sortedMovements.map(m => ({
      Fecha: m.date,
      Hora: m.time,
      ID: m.id,
      Movimiento: m.movement === 'entrada' ? 'Entrada' : m.movement === 'salida' ? 'Salida' : m.movement,
      Cantidad: m.quantity,
      Producto: m.name,
      Descripción: m.description,
      Categoría: m.category,
      Precio: m.price,
      Proveedor: suppliers.find(s => s.id === m.supplierId)?.name || 'N/A',
      Estado: m.status === 'in-stock' ? 'En Stock' : m.status === 'low-stock' ? 'Bajo Stock' : m.status === 'out-of-stock' ? 'Agotado' : m.status
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
    XLSX.writeFile(wb, "movimientos.xlsx");
  };

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
            <h1 className={styles.pageTitle}>Inventario</h1>
          </div>
          <div>
            <button className={styles.btnPrimary} onClick={openModal}>
              + Añadir Producto
            </button>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className={styles.tableContainer}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Todos los Productos</h3>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th className={styles.textRight}>Acciones</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {products.map(product => {
                const supplier = suppliers.find(s => s.id === product.supplierId);
                return (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td className={styles.productName}>{product.name}</td>
                    <td>{product.description}</td>
                    <td>{product.category}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>{supplier ? supplier.name : 'N/A'}</td>
                    <td>
                      <span className={
                        `${styles.status} ` +
                        (product.status === 'in-stock' ? styles.statusInStock : product.status === 'low-stock' ? styles.statusLowStock : styles.statusOutOfStock)
                      }>
                        {product.status === 'in-stock' ? 'En Stock' : product.status === 'low-stock' ? 'Bajo Stock' : 'Agotado'}
                      </span>
                    </td>
                    <td className={styles.textRight}>
                      <div className={styles.actions}>
                        <button className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`} onClick={() => handleEditProduct(product)}>Editar</button>
                        <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => handleDeleteProduct(product.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tabla de registro de movimientos */}
        <div className={styles.tableContainer} style={{ marginTop: 32 }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Registro de Movimientos</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className={styles.btn}
                style={{ marginLeft: 8, padding: '4px 12px', fontSize: 14 }}
                onClick={() => {
                  setMovementFilters(initialMovementFilters);
                  setMovementSort(initialMovementSort);
                }}
                type="button"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  Fecha
                  <button type="button" style={{marginLeft: 4}} onClick={() => setMovementSort(s => ({
                    date: s.date === 'asc' ? 'desc' : 'asc',
                    time: '',
                    id: '',
                    quantity: '',
                    price: ''
                  }))}>
                    {movementSort.date === 'asc' ? '▲' : movementSort.date === 'desc' ? '▼' : '↕'}
                  </button>
                </th>
                <th>
                  Hora
                  <button type="button" style={{marginLeft: 4}} onClick={() => setMovementSort(s => ({
                    date: '',
                    time: s.time === 'asc' ? 'desc' : 'asc',
                    id: '',
                    quantity: '',
                    price: ''
                  }))}>
                    {movementSort.time === 'asc' ? '▲' : movementSort.time === 'desc' ? '▼' : '↕'}
                  </button>
                </th>
                <th>
                  <span style={{fontWeight: 500}}>ID</span>
                  <button type="button" style={{marginLeft: 4}} onClick={() => setMovementSort(s => ({
                    date: '',
                    time: '',
                    id: s.id === 'asc' ? 'desc' : 'asc',
                    quantity: '',
                    price: ''
                  }))}>
                    {movementSort.id === 'asc' ? '▲' : movementSort.id === 'desc' ? '▼' : '↕'}
                  </button>
                </th>
                <th>
                  <select
                    className={styles.formControl}
                    style={{ marginBottom: 2 }}
                    value={movementFilters.movement}
                    onChange={e => setMovementFilters(f => ({ ...f, movement: e.target.value }))}
                  >
                    <option value="">Movimiento</option>
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                  </select>
                </th>
                <th>
                  <span style={{fontWeight: 500}}>Cantidad</span>
                  <button type="button" style={{marginLeft: 4}} onClick={() => setMovementSort(s => ({
                    date: '',
                    time: '',
                    id: '',
                    quantity: s.quantity === 'asc' ? 'desc' : 'asc',
                    price: ''
                  }))}>
                    {movementSort.quantity === 'asc' ? '▲' : movementSort.quantity === 'desc' ? '▼' : '↕'}
                  </button>
                </th>
                <th>Producto</th>
                <th>Descripción</th>
                <th>
                  <select
                    className={styles.formControl}
                    style={{ marginBottom: 2 }}
                    value={movementFilters.category}
                    onChange={e => setMovementFilters(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">Categoría</option>
                    {uniqueMovementCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </th>
                <th>
                  <span style={{fontWeight: 500}}>Precio</span>
                  <button type="button" style={{marginLeft: 4}} onClick={() => setMovementSort(s => ({
                    date: '',
                    time: '',
                    id: '',
                    quantity: '',
                    price: s.price === 'asc' ? 'desc' : 'asc'
                  }))}>
                    {movementSort.price === 'asc' ? '▲' : movementSort.price === 'desc' ? '▼' : '↕'}
                  </button>
                </th>
                <th>
                  <select
                    className={styles.formControl}
                    style={{ marginBottom: 2 }}
                    value={movementFilters.supplierId}
                    onChange={e => setMovementFilters(f => ({ ...f, supplierId: e.target.value }))}
                  >
                    <option value="">Proveedor</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </th>
                <th>
                  <select
                    className={styles.formControl}
                    style={{ marginBottom: 2 }}
                    value={movementFilters.status}
                    onChange={e => setMovementFilters(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="">Estado</option>
                    <option value="in-stock">En Stock</option>
                    <option value="low-stock">Bajo Stock</option>
                    <option value="out-of-stock">Agotado</option>
                  </select>
                </th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {sortedMovements.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#888' }}>Sin movimientos registrados</td>
                </tr>
              ) : (
                sortedMovements.map(movement => {
                  const supplier = suppliers.find(s => s.id === movement.supplierId);
                  return (
                    <tr key={movement.movementId}>
                      <td>{movement.date || '-'}</td>
                      <td>{movement.time || '-'}</td>
                      <td>{movement.id}</td>
                      <td>{movement.movement === 'entrada' ? 'Entrada' : 'Salida'}</td>
                      <td>{movement.quantity !== undefined ? movement.quantity : '-'}</td>
                      <td className={styles.productName}>{movement.name}</td>
                      <td>{movement.description}</td>
                      <td>{movement.category}</td>
                      <td>${movement.price.toFixed(2)}</td>
                      <td>{supplier ? supplier.name : 'N/A'}</td>
                      <td>
                        <span className={
                          `${styles.status} ` +
                          (movement.status === 'in-stock' ? styles.statusInStock : movement.status === 'low-stock' ? styles.statusLowStock : styles.statusOutOfStock)
                        }>
                          {movement.status === 'in-stock' ? 'En Stock' : movement.status === 'low-stock' ? 'Bajo Stock' : 'Agotado'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24 }}>
            <button className={styles.btnExportPDF} onClick={exportMovementsToPDF} type="button">PDF</button>
            <button className={styles.btnExportExcel} onClick={exportMovementsToExcel} type="button">Excel</button>
          </div>
        </div>

        {/* Modal para añadir producto */}
        {showModal && !editId && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Añadir Producto</h3>
                <button className={styles.modalClose} onClick={closeModal}>&times;</button>
              </div>
              <form className={styles.modalBody} onSubmit={handleAddProduct}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Nombre</label>
                      <input
                        className={styles.formControl}
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        list="productNames"
                      />
                      <datalist id="productNames">
                        {Array.from(new Set(products.map(p => p.name.trim().toLowerCase())))
                          .map((name, idx, arr) => {
                            const original = products.find(p => p.name.trim().toLowerCase() === name)?.name || name;
                            return arr.indexOf(name) === idx ? (
                              <option key={name} value={original} />
                            ) : null;
                          })}
                      </datalist>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Proveedor</label>
                      <select
                        className={styles.formControl}
                        name="supplierId"
                        value={form.supplierId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona proveedor</option>
                        {suppliers.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Descripción</label>
                      <input
                        className={styles.formControl}
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        list="productDescriptions"
                        disabled={!!products.find(p => p.name.trim().toLowerCase() === form.name.trim().toLowerCase() && p.supplierId.toString() === form.supplierId)}
                      />
                      <datalist id="productDescriptions">
                        {Array.from(new Set(products.map(p => p.description.trim().toLowerCase())))
                          .map((desc, idx, arr) => {
                            const original = products.find(p => p.description.trim().toLowerCase() === desc)?.description || desc;
                            return arr.indexOf(desc) === idx ? (
                              <option key={desc} value={original} />
                            ) : null;
                          })}
                      </datalist>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Categoría</label>
                      <input
                        className={styles.formControl}
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        list="productCategories"
                        disabled={!!products.find(p => p.name.trim().toLowerCase() === form.name.trim().toLowerCase() && p.supplierId.toString() === form.supplierId)}
                      />
                      <datalist id="productCategories">
                        {Array.from(new Set(products.map(p => p.category.trim().toLowerCase())))
                          .map((cat, idx, arr) => {
                            const original = products.find(p => p.category.trim().toLowerCase() === cat)?.category || cat;
                            return arr.indexOf(cat) === idx ? (
                              <option key={cat} value={original} />
                            ) : null;
                          })}
                      </datalist>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Precio</label>
                      <input
                        className={styles.formControl}
                        name="price"
                        type="number"
                        step="0.01"
                        value={form.price}
                        onChange={handleChange}
                        list="productPrices"
                        disabled={!!products.find(p => p.name.trim().toLowerCase() === form.name.trim().toLowerCase() && p.supplierId.toString() === form.supplierId)}
                      />
                      <datalist id="productPrices">
                        {Array.from(new Set(products.map(p => p.price)))
                          .map((price, idx, arr) => {
                            return arr.indexOf(price) === idx ? (
                              <option key={price} value={price} />
                            ) : null;
                          })}
                      </datalist>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Stock inicial</label>
                      <input
                        className={styles.formControl}
                        name="stock"
                        type="number"
                        value={form.stock}
                        onChange={handleChange}
                        disabled={!!products.find(p => p.name.trim().toLowerCase() === form.name.trim().toLowerCase() && p.supplierId.toString() === form.supplierId)}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Mínimo Bajo stock</label>
                      <input
                        className={styles.formControl}
                        name="minLowStock"
                        type="number"
                        min={0}
                        value={form.minLowStock}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Mínimo En stock</label>
                      <input
                        className={styles.formControl}
                        name="minInStock"
                        type="number"
                        min={1}
                        value={form.minInStock}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Movimiento</label>
                      <select className={styles.formControl} name="movement" value={form.movement} onChange={handleChange}>
                        <option value="entrada">Entrada</option>
                        <option value="salida">Salida</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Cantidad</label>
                      <input className={styles.formControl} name="quantity" type="number" value={form.quantity} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={closeModal}>Cancelar</button>
                  <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para editar producto */}
        {showModal && editId && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Editar Producto</h3>
                <button className={styles.modalClose} onClick={closeModal}>&times;</button>
              </div>
              <form className={styles.modalBody} onSubmit={handleUpdateProduct}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Nombre</label>
                      <input
                        className={styles.formControl}
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        list="productNames"
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Proveedor</label>
                      <select
                        className={styles.formControl}
                        name="supplierId"
                        value={form.supplierId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona proveedor</option>
                        {suppliers.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Descripción</label>
                      <input
                        className={styles.formControl}
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        list="productDescriptions"
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Categoría</label>
                      <input
                        className={styles.formControl}
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        list="productCategories"
                      />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Precio</label>
                      <input
                        className={styles.formControl}
                        name="price"
                        type="number"
                        step="0.01"
                        value={form.price}
                        onChange={handleChange}
                        list="productPrices"
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Stock</label>
                      <input
                        className={styles.formControl}
                        name="stock"
                        type="number"
                        value={form.stock}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Mínimo Bajo stock</label>
                      <input
                        className={styles.formControl}
                        name="minLowStock"
                        type="number"
                        min={0}
                        value={form.minLowStock}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={styles.formGroup}>
                      <label>Mínimo En stock</label>
                      <input
                        className={styles.formControl}
                        name="minInStock"
                        type="number"
                        min={1}
                        value={form.minInStock}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
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