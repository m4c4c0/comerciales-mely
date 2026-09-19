'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface DashboardStats {
  totalProducts: number;
  totalStockUnits: number;
  totalInventoryValue: number;
  lowStockCount: number;
  lowStockItems: Array<{
    id: string;
    codigo: string;
    nombre: string;
    categoria?: string;
    stock: number;
    precio: number;
  }>;
  categories: Array<{
    name: string;
    productsCount: number;
    totalStock: number;
  }>;
  recentMovements: Array<{
    id: string;
    nombreProducto?: string;
    tipo?: string;
    cantidad?: number;
    usuario?: string;
    fecha?: string;
    motivo?: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Error al consultar datos del dashboard');
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AppLayout
      title="Dashboard General"
      subtitle="Panel de control e indicadores clave de Comerciales Mely"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/inventario"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-xl transition shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Ir al CRUD de Inventario</span>
          </Link>
          <button
            onClick={fetchStats}
            title="Recargar datos"
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner de Bienvenida */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-teal-900/60 text-teal-200 text-xs font-semibold px-2.5 py-1 rounded-full mb-3 border border-teal-600/40">
              Etapa 2: Aplicación Web Multiplataforma
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bienvenido, {user?.nombre || 'Usuario'}
            </h2>
            <p className="text-teal-100 text-sm mt-1.5 leading-relaxed">
              Monitorea el estado actual del inventario, productos con existencias críticas y
              trazabilidad en tiempo real para <strong>Comerciales Mely</strong>.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/inventario"
                className="bg-white text-teal-800 hover:bg-teal-50 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow"
              >
                Abrir Gestión de Inventario ➔
              </Link>
              <Link
                href="/movimientos"
                className="bg-teal-900/80 hover:bg-teal-950 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-teal-600/50 transition"
              >
                Ver Movimientos y Entradas
              </Link>
            </div>
          </div>

          <div className="absolute -right-8 -bottom-10 opacity-10 text-white pointer-events-none hidden sm:block">
            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>

        {/* Tarjetas KPI (Indicadores Clave) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Total Productos */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Productos Registrados
              </span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {loading ? '...' : stats?.totalProducts ?? 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">ítems activos</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Categorías registradas:</span>
              <span className="font-semibold text-slate-700">{stats?.categories?.length ?? 0}</span>
            </div>
          </div>

          {/* KPI 2: Stock Bajo */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Stock Bajo / Crítico
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-3xl font-black ${(stats?.lowStockCount ?? 0) > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {loading ? '...' : stats?.lowStockCount ?? 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">≤ 5 unidades</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Estado del almacén:</span>
              <span className={`font-semibold ${(stats?.lowStockCount ?? 0) > 0 ? 'text-amber-700' : 'text-emerald-600'}`}>
                {(stats?.lowStockCount ?? 0) > 0 ? 'Requiere reposición' : 'Al día'}
              </span>
            </div>
          </div>

          {/* KPI 3: Valor Total de Inventario */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Valor en Inventario
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                ${loading ? '...' : stats?.totalInventoryValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Cálculo:</span>
              <span className="font-semibold text-slate-700">Stock × Precio Unitario</span>
            </div>
          </div>

          {/* KPI 4: Unidades Totales */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Unidades Físicas
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {loading ? '...' : stats?.totalStockUnits ?? 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">piezas en total</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Disponibilidad:</span>
              <span className="font-semibold text-teal-600">Stock activo</span>
            </div>
          </div>
        </div>

        {/* Sección Central: Gráfica de Categorías y Tabla de Alertas de Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfica de distribución por categoría */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Distribución por Categorías</h3>
                <p className="text-xs text-slate-500">Existencias físicas acumuladas</p>
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                {stats?.categories?.length || 0} categorías
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">Cargando gráfico...</div>
            ) : !stats?.categories || stats.categories.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No hay categorías registradas aún.
              </div>
            ) : (
              <div className="space-y-4">
                {stats.categories.map((cat, idx) => {
                  const maxStock = Math.max(...stats.categories.map(c => c.totalStock), 1);
                  const percentage = Math.round((cat.totalStock / (stats.totalStockUnits || 1)) * 100);
                  const barWidth = Math.max(8, Math.round((cat.totalStock / maxStock) * 100));

                  const colors = [
                    'bg-teal-500',
                    'bg-emerald-500',
                    'bg-blue-500',
                    'bg-indigo-500',
                    'bg-purple-500',
                    'bg-amber-500',
                  ];
                  const color = colors[idx % colors.length];

                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-medium">
                        <span className="text-slate-700 font-semibold truncate max-w-[150px]">{cat.name}</span>
                        <div className="text-slate-500">
                          <strong className="text-slate-800">{cat.totalStock}</strong> uds. ({percentage}%)
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full ${color} transition-all duration-500`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tabla de Alertas de Stock Bajo / Reposición */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Productos con Stock Bajo o Crítico
                  </h3>
                  <p className="text-xs text-slate-500">
                    Items con existencias iguales o menores a 5 unidades que ameritan pedido
                  </p>
                </div>
                <Link
                  href="/inventario"
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition"
                >
                  Gestionar en CRUD ➔
                </Link>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400 text-sm">Verificando inventario...</div>
              ) : !stats?.lowStockItems || stats.lowStockItems.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">¡Inventario en buen nivel!</p>
                  <p className="text-xs text-slate-500 mt-0.5">No hay productos con stock menor a 5 unidades.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase">
                        <th className="pb-3">Código</th>
                        <th className="pb-3">Producto</th>
                        <th className="pb-3">Categoría</th>
                        <th className="pb-3 text-center">Stock Actual</th>
                        <th className="pb-3 text-right">Precio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.lowStockItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80">
                          <td className="py-3 font-mono text-xs text-slate-600">{item.codigo}</td>
                          <td className="py-3 font-medium text-slate-800">{item.nombre}</td>
                          <td className="py-3 text-slate-500 text-xs">{item.categoria || 'General'}</td>
                          <td className="py-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                                item.stock === 0
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {item.stock === 0 ? 'Agotado (0)' : `${item.stock} unidades`}
                            </span>
                          </td>
                          <td className="py-3 text-right font-semibold text-slate-800">
                            ${Number(item.precio).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total en alerta: <strong className="text-amber-700">{stats?.lowStockCount ?? 0} ítems</strong></span>
              <Link href="/inventario" className="text-teal-700 hover:underline font-medium">
                Actualizar stock en inventario →
              </Link>
            </div>
          </div>
        </div>

        {/* Sección Inferior: Últimos Movimientos y Trazabilidad */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Últimos Movimientos de Inventario (Trazabilidad)
              </h3>
              <p className="text-xs text-slate-500">
                Historial de operaciones registradas con usuario responsable
              </p>
            </div>
            <Link
              href="/movimientos"
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition"
            >
              Ver todos los movimientos ➔
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Cargando movimientos...</div>
          ) : !stats?.recentMovements || stats.recentMovements.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Aún no se han registrado movimientos de inventario.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase">
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Producto</th>
                    <th className="pb-3">Cantidad</th>
                    <th className="pb-3">Usuario Responsable</th>
                    <th className="pb-3 text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentMovements.map((mov, i) => (
                    <tr key={mov.id || i} className="hover:bg-slate-50/80">
                      <td className="py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                            mov.tipo?.includes('Entrada')
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {mov.tipo || 'Operación'}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-slate-800">
                        {mov.nombreProducto || 'Producto'}
                      </td>
                      <td className="py-3 font-semibold text-slate-700">
                        {mov.cantidad ? `${mov.cantidad} uds.` : '-'}
                      </td>
                      <td className="py-3 text-xs text-slate-600 font-medium">
                        {mov.usuario || 'Sistema'}
                      </td>
                      <td className="py-3 text-right text-xs text-slate-400 font-mono">
                        {mov.fecha ? new Date(mov.fecha).toLocaleString() : 'Reciente'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
