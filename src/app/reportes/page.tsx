'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getDashboard, InvoiceItem } from '@/lib/services';

interface ReportData {
  totalProducts: number;
  totalStockUnits: number;
  totalInventoryValue: number;
  lowStockCount: number;
  salesToday: number;
  totalInvoices: number;
  totalRevenue: number;
  salesByDay: Array<{
    fecha: string;
    label: string;
    total: number;
    facturasCount: number;
  }>;
  topSoldProducts: Array<{
    productoId: string;
    nombre: string;
    cantidad: number;
    ingresos: number;
  }>;
  recentInvoices: InvoiceItem[];
}

export default function ReportesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await getDashboard();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadReport();
  }, [user?.id]);

  const maxDaySale = Math.max(...(data?.salesByDay?.map((d) => d.total) || [0]), 1);

  return (
    <AppLayout
      title="Reportes y Analítica de Ventas"
      subtitle="Indicadores comerciales de los últimos 7 días sincronizados entre Web y App Móvil"
      actions={
        <div className="flex items-center gap-2">
          {(user?.rol === 'Administrador' || user?.rol === 'Facturador') && (
            <Link
              href="/facturacion"
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl transition"
            >
              <span>+ Nueva Factura</span>
            </Link>
          )}
          <button
            onClick={loadReport}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl transition"
          >
            <span>Actualizar</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPIs de Ventas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ventas de Hoy
            </span>
            <p className="text-3xl font-black text-teal-700 mt-2">
              ${loading ? '...' : (data?.salesToday ?? 0).toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Ingresos facturados en la fecha actual</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Facturación Acumulada
            </span>
            <p className="text-3xl font-black text-slate-900 mt-2">
              ${loading ? '...' : (data?.totalRevenue ?? 0).toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Total histórico con IVA 13 % incluido</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Comprobantes Emitidos
            </span>
            <p className="text-3xl font-black text-purple-700 mt-2">
              {loading ? '...' : data?.totalInvoices ?? 0}
            </p>
            <p className="text-xs text-slate-400 mt-1">Facturas registradas en Cloud Firestore</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Valor de Inventario
            </span>
            <p className="text-3xl font-black text-slate-900 mt-2">
              ${loading ? '...' : (data?.totalInventoryValue ?? 0).toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {data?.totalStockUnits ?? 0} unidades en {data?.totalProducts ?? 0} productos
            </p>
          </div>
        </div>

        {/* Gráfica de Ventas últimos 7 días + Productos más vendidos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Comportamiento de Ventas (Últimos 7 Días)
                </h3>
                <p className="text-xs text-slate-500">
                  Ingresos diarios acumulados por fecha local
                </p>
              </div>
              <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg">
                7 días calendario
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 text-sm">Cargando gráfica...</div>
            ) : (
              <div className="grid grid-cols-7 gap-3 items-end h-56 pt-6 px-2 border-b border-slate-100">
                {data?.salesByDay.map((d) => {
                  const heightPct = d.total > 0 ? Math.max(12, Math.round((d.total / maxDaySale) * 100)) : 4;
                  return (
                    <div key={d.fecha} className="flex flex-col items-center h-full justify-end">
                      <span className="text-[11px] font-bold text-slate-700 mb-1">
                        ${d.total.toFixed(0)}
                      </span>
                      <div className="w-full max-w-[44px] bg-slate-100 rounded-t-xl h-40 flex items-end overflow-hidden">
                        <div
                          className={`w-full rounded-t-xl transition-all duration-500 ${
                            d.total > 0
                              ? 'bg-gradient-to-t from-teal-700 to-emerald-400'
                              : 'bg-slate-200'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 mt-2">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ranking de Productos más vendidos */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-1">Productos Más Vendidos</h3>
            <p className="text-xs text-slate-500 mb-4">
              Ranking por unidades despachadas en facturación
            </p>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">Calculando ranking...</div>
            ) : !data?.topSoldProducts || data.topSoldProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Aún no se registran ventas facturadas.
              </div>
            ) : (
              <div className="space-y-3">
                {data.topSoldProducts.map((p, idx) => (
                  <div
                    key={p.productoId}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 font-black text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{p.nombre}</p>
                        <p className="text-[11px] text-slate-500">
                          Ingresos: ${p.ingresos.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">
                      {p.cantidad} uds.
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
