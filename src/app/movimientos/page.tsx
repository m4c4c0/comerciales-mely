'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Product {
  id: string;
  nombre: string;
  codigo: string;
  stock: number;
}

interface Movement {
  id: string;
  productoId: string;
  nombreProducto: string;
  codigoProducto?: string;
  tipo: 'Entrada' | 'Salida' | 'Ajuste' | 'Entrada Inicial';
  cantidad: number;
  stockAnterior?: number;
  stockResultante?: number;
  motivo?: string;
  usuario: string;
  fecha: string;
}

export default function MovimientosPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Formulario
  const [selectedProductId, setSelectedProductId] = useState('');
  const [tipo, setTipo] = useState<'Entrada' | 'Salida'>('Entrada');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, movRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/movements'),
      ]);

      const prods = await prodRes.json();
      const movs = await movRes.json();

      if (Array.isArray(prods)) setProducts(prods);
      if (Array.isArray(movs)) setMovements(movs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegisterMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !cantidad) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productoId: selectedProductId,
          tipo,
          cantidad: Number(cantidad),
          motivo,
          usuario: user?.nombre || 'Usuario',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrar el movimiento');

      setNotification({ type: 'success', text: data.message });
      setCantidad('');
      setMotivo('');
      loadData();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <AppLayout
      title="Trazabilidad y Movimientos de Inventario"
      subtitle="Módulo de lógica central: registro de entradas, salidas y auditoría de existencias"
      actions={
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Ir al Dashboard</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between text-sm shadow-xs ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span>{notification.text}</span>
            <button onClick={() => setNotification(null)} className="text-xs font-bold underline ml-4">
              Cerrar
            </button>
          </div>
        )}

        {/* Formulario de Registro de Movimiento */}
        {user?.rol !== 'Facturador' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                ⇄
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Registrar Nuevo Movimiento de Stock</h3>
                <p className="text-xs text-slate-500">
                  Aplica reglas de validación: no permite salidas mayores al stock actual
                </p>
              </div>
            </div>

            <form onSubmit={handleRegisterMovement} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Producto *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                >
                  <option value="">-- Seleccionar Producto --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} - {p.nombre} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Movimiento *</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as 'Entrada' | 'Salida')}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Entrada">Entrada (+) Reabastecimiento</option>
                  <option value="Salida">Salida (-) Despacho / Venta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cantidad de Unidades *</label>
                <input
                  type="number"
                  min="1"
                  max={tipo === 'Salida' && selectedProduct ? selectedProduct.stock : undefined}
                  placeholder="ej. 10"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
                {tipo === 'Salida' && selectedProduct && (
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Máximo disponible: {selectedProduct.stock} uds.
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo / Observación</label>
                <input
                  placeholder="ej. Compra proveedor, merma, despacho"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow transition"
                >
                  {submitting ? 'Procesando...' : 'Aplicar Movimiento al Almacén'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Historial Completo de Movimientos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Historial de Auditoría de Movimientos</h4>
              <p className="text-xs text-slate-500">Registro cronológico de entradas y salidas de existencias</p>
            </div>
            <span className="text-xs font-semibold bg-slate-200/70 text-slate-700 px-2.5 py-1 rounded-lg">
              {movements.length} movimientos registrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase bg-slate-50/30">
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4 text-center">Cantidad</th>
                  <th className="py-3 px-4">Motivo</th>
                  <th className="py-3 px-4">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Cargando historial de movimientos...
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Aún no hay movimientos registrados.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 text-xs font-mono text-slate-500">
                        {m.fecha ? new Date(m.fecha).toLocaleString() : 'Reciente'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            m.tipo === 'Entrada' || m.tipo === 'Entrada Inicial'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {m.tipo === 'Entrada' || m.tipo === 'Entrada Inicial' ? '▲ Entrada' : '▼ Salida'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {m.nombreProducto}
                      </td>
                      <td className="py-3 px-4 text-center font-black text-slate-800">
                        {m.cantidad} uds.
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {m.motivo || 'Operación de almacén'}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">
                        {m.usuario || 'Sistema'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
