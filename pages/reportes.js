import { useEffect, useState } from "react";
import Head from "next/head";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Layout from "../components/Layout";
import { Panel } from "../components/Panel";
import { Alert, EmptyState } from "../components/Feedback";
import { reportesService } from "../services/reportesService";
import { movimientosService } from "../services/movimientosService";
import { facturasService } from "../services/facturasService";


function formatFechaHora(fecha) {
  return new Date(fecha).toLocaleString("es-SV", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function formatFechaCorta(fecha) {
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-SV", { day: "2-digit", month: "short" });
}

export default function Reportes() {
  const [resumen, setResumen] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([reportesService.resumen(), movimientosService.listar()])
      .then(([r, m]) => {
        setResumen(r);
        setMovimientos(m.movimientos);
      })
      .catch((err) => setError(err.message));

    facturasService
      .listar()
      .then((data) => setFacturas(data.facturas))
      .catch(() => {
        // El facturador/administrador tienen acceso; otros roles no ven facturas y no es un error crítico.
      });
  }, []);

  return (
    <>
      <Head>
        <title>Reportes · Comerciales Mely</title>
      </Head>
      <Layout title="Reportes" subtitle="Ventas, movimientos de inventario y facturación" allowedRoles={["administrador", "empleado", "facturador"]}>
        {error && <Alert tone="error" className="mb-5">{error}</Alert>}

        <div className="space-y-6">
          <Panel title="Ventas por día (últimos 7 días)">
            {!resumen ? (
              <p className="text-sm text-muted">Cargando…</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={resumen.ventasPorDia}>
                  <CartesianGrid vertical={false} stroke="#E4E1D9" />
                  <XAxis dataKey="fecha" tickFormatter={formatFechaCorta} tick={{ fontSize: 12, fill: "#5B6472" }} axisLine={{ stroke: "#E4E1D9" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#5B6472" }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} labelFormatter={formatFechaCorta} contentStyle={{ borderRadius: 10, borderColor: "#E4E1D9", fontSize: 13 }} />
                  <Bar dataKey="total" fill="#DD8A3E" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Movimientos de inventario">
              {movimientos.length === 0 ? (
                <EmptyState title="Sin movimientos registrados" description="Las entradas y salidas de inventario aparecerán aquí." />
              ) : (
                <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                  {movimientos.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <div className="flex items-center gap-2">
                        {m.tipo === "entrada" ? (
                          <ArrowUpCircle size={16} className="text-moss-600" />
                        ) : (
                          <ArrowDownCircle size={16} className="text-brick-600" />
                        )}
                        <div>
                          <p className="text-ink">{m.nota || (m.tipo === "entrada" ? "Entrada de mercadería" : "Salida de mercadería")}</p>
                          <p className="text-xs text-muted">{formatFechaHora(m.fecha)}</p>
                        </div>
                      </div>
                      <span className={m.tipo === "entrada" ? "font-semibold text-moss-600" : "font-semibold text-brick-600"}>
                        {m.tipo === "entrada" ? "+" : "-"}
                        {m.cantidad}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Facturas emitidas">
              {facturas.length === 0 ? (
                <EmptyState title="Sin facturas todavía" description="Las ventas generadas desde Facturación aparecerán aquí." />
              ) : (
                <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                  {facturas.map((f) => (
                    <li key={f.id} className="flex items-center justify-between py-2.5 text-sm">
                      <div>
                        <p className="text-ink">{f.numero}</p>
                        <p className="text-xs text-muted">{formatFechaHora(f.fecha)} · {f.items.length} producto(s)</p>
                      </div>
                      <span className="font-semibold text-ink">${f.total.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      </Layout>
    </>
  );
}
