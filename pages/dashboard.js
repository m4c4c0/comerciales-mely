import { useEffect, useState } from "react";
import Head from "next/head";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AlertTriangle, TrendingUp } from "lucide-react";
import Layout from "../components/Layout";
import { Panel, StatInline } from "../components/Panel";
import { Alert, EmptyState } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { reportesService } from "../services/reportesService";


function formatMoneda(n) {
  return `$${Number(n).toFixed(2)}`;
}

function formatFechaCorta(fecha) {
  const d = new Date(fecha + "T00:00:00");
  return d.toLocaleDateString("es-SV", { day: "2-digit", month: "short" });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    reportesService
      .resumen()
      .then(setResumen)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <Head>
        <title>Dashboard · Comerciales Mely</title>
      </Head>
      <Layout title="Dashboard" subtitle={`Bienvenido(a), ${user?.nombre || ""}`} allowedRoles={["administrador", "empleado", "facturador"]}>
        {error && <Alert tone="error" className="mb-5">{error}</Alert>}

        {!resumen ? (
          <p className="text-sm text-muted">Cargando información…</p>
        ) : (
          <div className="space-y-6">
            <Panel className="overflow-x-auto">
              <div className="flex divide-x divide-line">
                <StatInline label="Productos activos" value={resumen.productosActivos} />
                <StatInline
                  label="Stock bajo"
                  value={resumen.stockBajo}
                  tone={resumen.stockBajo > 0 ? "brick" : "ink"}
                  hint={resumen.stockBajo > 0 ? "Requieren reabastecimiento" : "Todo en orden"}
                />
                <StatInline label="Ventas de hoy" value={formatMoneda(resumen.ventasHoy)} tone="clay" />
                <StatInline label="Facturas emitidas" value={resumen.totalFacturas} />
              </div>
            </Panel>

            <div className="grid gap-6 lg:grid-cols-3">
              <Panel title="Ventas de los últimos 7 días" className="lg:col-span-2">
                {resumen.ventasPorDia.every((d) => d.total === 0) ? (
                  <EmptyState title="Aún no hay ventas registradas" description="Las ventas facturadas aparecerán aquí día por día." />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={resumen.ventasPorDia}>
                      <defs>
                        <linearGradient id="ventasFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2CA6A4" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#2CA6A4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#E4E1D9" />
                      <XAxis
                        dataKey="fecha"
                        tickFormatter={formatFechaCorta}
                        tick={{ fontSize: 12, fill: "#5B6472" }}
                        axisLine={{ stroke: "#E4E1D9" }}
                        tickLine={false}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#5B6472" }} axisLine={false} tickLine={false} width={44} />
                      <Tooltip
                        formatter={(v) => formatMoneda(v)}
                        labelFormatter={formatFechaCorta}
                        contentStyle={{ borderRadius: 10, borderColor: "#E4E1D9", fontSize: 13 }}
                      />
                      <Area type="monotone" dataKey="total" stroke="#2CA6A4" strokeWidth={2.5} fill="url(#ventasFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Panel>

              <Panel title="Productos más vendidos">
                {resumen.masVendidos.length === 0 ? (
                  <EmptyState title="Sin ventas todavía" description="Aparecerán aquí los productos con más unidades vendidas." />
                ) : (
                  <ul className="space-y-3">
                    {resumen.masVendidos.map((p, i) => (
                      <li key={p.productoId} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                            {i + 1}
                          </span>
                          <span className="text-sm text-ink">{p.nombre}</span>
                        </div>
                        <span className="flex items-center gap-1 text-sm font-semibold text-moss-600">
                          <TrendingUp size={14} /> {p.cantidad}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>

            <Panel title="Alertas de inventario">
              {resumen.productosStockBajo.length === 0 ? (
                <EmptyState title="No hay alertas" description="Ningún producto está por debajo de su stock mínimo." />
              ) : (
                <ul className="divide-y divide-line">
                  {resumen.productosStockBajo.map((p) => (
                    <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="flex items-center gap-2 text-ink">
                        <AlertTriangle size={15} className="text-brick-500" />
                        {p.nombre}
                      </span>
                      <span className="text-muted">
                        Quedan <strong className="text-brick-600">{p.stock}</strong> (mínimo {p.stockMinimo})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        )}
      </Layout>
    </>
  );
}
