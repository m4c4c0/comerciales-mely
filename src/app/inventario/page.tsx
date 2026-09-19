'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Product {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
}

export default function InventarioPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'ok'>('all');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados de Formulario de Creación
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    nombre: '',
    codigo: '',
    categoria: '',
    precio: '',
    stock: '',
  });

  // Estados de Formulario de Edición (Modal)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    nombre: '',
    codigo: '',
    categoria: '',
    precio: '',
    stock: '',
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Error al cargar los productos del inventario' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Notificación temporal
  const showToast = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Crear Producto (C en CRUD)
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          precio: Number(createForm.precio),
          stock: Number(createForm.stock),
          usuario: user?.nombre || 'Usuario',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar el producto');

      setCreateForm({ nombre: '', codigo: '', categoria: '', precio: '', stock: '' });
      setShowCreateForm(false);
      showToast('success', `Producto "${createForm.nombre}" guardado con éxito`);
      fetchProducts();
    } catch (err: any) {
      showToast('error', err.message || 'Error al crear producto');
    } finally {
      setSaving(false);
    }
  };

  // Iniciar Edición (U en CRUD)
  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      nombre: product.nombre,
      codigo: product.codigo,
      categoria: product.categoria || '',
      precio: String(product.precio),
      stock: String(product.stock),
    });
  };

  // Guardar Cambios de Edición (U en CRUD)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editForm.nombre,
          codigo: editForm.codigo,
          categoria: editForm.categoria,
          precio: Number(editForm.precio),
          stock: Number(editForm.stock),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar producto');

      setEditingProduct(null);
      showToast('success', `Producto "${editForm.nombre}" actualizado correctamente`);
      fetchProducts();
    } catch (err: any) {
      showToast('error', err.message || 'Error al editar producto');
    } finally {
      setSaving(false);
    }
  };

  // Eliminar Producto (D en CRUD)
  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Confirmas que deseas eliminar "${nombre}" del inventario?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar');

      showToast('success', `Producto "${nombre}" eliminado del inventario`);
      fetchProducts();
    } catch (err: any) {
      showToast('error', err.message || 'No se pudo eliminar el producto');
    }
  };

  // Filtros combinados
  const categories = ['Todas', ...Array.from(new Set(products.map(p => p.categoria || 'General')))];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Todas' || (p.categoria || 'General') === selectedCategory;

    const matchesStock =
      filterStock === 'all'
        ? true
        : filterStock === 'low'
        ? (p.stock || 0) <= 5
        : (p.stock || 0) > 5;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <AppLayout
      title="Gestión de Inventario (CRUD)"
      subtitle="Registro, consulta, actualización y control de productos"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Volver al</span> Dashboard
          </Link>

          {user?.rol !== 'Facturador' && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showCreateForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
              </svg>
              <span>{showCreateForm ? 'Cerrar Formulario' : '+ Nuevo Producto'}</span>
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Notificación Toast */}
        {message && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between text-sm shadow-xs transition-all ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-xs font-bold underline ml-4">
              Cerrar
            </button>
          </div>
        )}

        {/* Panel Formulario de Creación (Desplegable) */}
        {showCreateForm && user?.rol !== 'Facturador' && (
          <div className="bg-white p-6 rounded-2xl border border-teal-200 shadow-md animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  +
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Registrar Nuevo Producto</h3>
                  <p className="text-xs text-slate-500">Agrega un artículo al catálogo y almacén</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Código del Producto *</label>
                <input
                  placeholder="ej. PROD-001"
                  value={createForm.codigo}
                  onChange={(e) => setCreateForm({ ...createForm, codigo: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Producto *</label>
                <input
                  placeholder="Nombre descriptivo"
                  value={createForm.nombre}
                  onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
                <input
                  placeholder="ej. Hogar, Papelería"
                  value={createForm.categoria}
                  onChange={(e) => setCreateForm({ ...createForm, categoria: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Precio Unitario ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={createForm.precio}
                  onChange={(e) => setCreateForm({ ...createForm, precio: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Inicial *</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={createForm.stock}
                  onChange={(e) => setCreateForm({ ...createForm, stock: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2 md:col-span-5 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm px-6 py-2 rounded-xl transition shadow"
                >
                  {saving ? 'Guardando en Base de Datos...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal de Edición de Producto (Update en CRUD) */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    ✎
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Editar Producto</h3>
                    <p className="text-xs text-slate-500">Modifica los detalles del artículo en el inventario</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Código</label>
                    <input
                      value={editForm.codigo}
                      onChange={(e) => setEditForm({ ...editForm, codigo: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
                    <input
                      value={editForm.categoria}
                      onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Producto</label>
                  <input
                    value={editForm.nombre}
                    onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Precio ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={editForm.precio}
                      onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Stock (Existencias)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2 rounded-xl transition shadow"
                  >
                    {saving ? 'Guardando...' : 'Actualizar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="w-full md:w-auto flex flex-wrap gap-2 items-center">
            {/* Filtro por Categoría */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Categoría: {c}
                </option>
              ))}
            </select>

            {/* Filtro por Stock */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterStock('all')}
                className={`px-3 py-1 rounded-lg transition ${filterStock === 'all' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500'}`}
              >
                Todos ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStock('low')}
                className={`px-3 py-1 rounded-lg transition ${filterStock === 'low' ? 'bg-white shadow-xs text-amber-700' : 'text-slate-500'}`}
              >
                Stock Bajo
              </button>
              <button
                type="button"
                onClick={() => setFilterStock('ok')}
                className={`px-3 py-1 rounded-lg transition ${filterStock === 'ok' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-500'}`}
              >
                Normal
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Productos (Listado y Acciones CRUD) */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mostrando {filtered.length} de {products.length} productos
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Rol actual: <strong className="text-slate-700">{user?.rol}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase bg-slate-50/40">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Existencias</th>
                  <th className="py-3 px-4 text-right">Precio Unitario</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Cargando productos de la base de datos...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No se encontraron productos que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const isLow = Number(item.stock) <= 5;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-600">
                          {item.codigo}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 block">{item.nombre}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.categoria || 'General'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isLow
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isLow ? 'bg-amber-600' : 'bg-emerald-600'
                              }`}
                            ></span>
                            {item.stock} unidades
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          ${Number(item.precio).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            {/* Botón Editar (Update) */}
                            {user?.rol !== 'Facturador' ? (
                              <button
                                onClick={() => startEdit(item)}
                                title="Editar producto"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            ) : (
                              <span className="text-xs text-slate-300">Solo lectura</span>
                            )}

                            {/* Botón Eliminar (Delete) - Solo Administrador */}
                            {user?.rol === 'Administrador' && (
                              <button
                                onClick={() => handleDelete(item.id, item.nombre)}
                                title="Eliminar producto"
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
