import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { Search, Plus, Minus, Trash2, Receipt, CheckCircle2 } from "lucide-react";
import Layout from "../components/Layout";
import { Panel } from "../components/Panel";
import { Alert, EmptyState } from "../components/Feedback";
import Button from "../components/Button";
import { useInventario } from "../context/InventarioContext";
import { facturasService } from "../services/facturasService";


const IVA_RATE = 0.13;

export default function Facturacion() {
  const { productos, cargar, aplicarDescuentoLocal } = useInventario();
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]); // [{ productoId, nombre, precioUnitario, cantidad, stockDisponible }]
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [ultimaFactura, setUltimaFactura] = useState(null);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    cargar();
    facturasService
      .listar()
      .then((data) => setHistorial(data.facturas))
      .catch(() => {});
  }, [cargar]);

  const sugerencias = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return [];
    return productos.filter((p) => p.stock > 0 && p.nombre.toLowerCase().includes(q)).slice(0, 6);
  }, [busqueda, productos]);

  function agregarProducto(p) {
    setError("");
    setCarrito((prev) => {
      const existente = prev.find((it) => it.productoId === p.id);
      if (existente) {
        if (existente.cantidad + 1 > p.stock) {
          setError(`Solo hay ${p.stock} unidades disponibles de "${p.nombre}".`);
          return prev;
        }
        return prev.map((it) => (it.productoId === p.id ? { ...it, cantidad: it.cantidad + 1 } : it));
      }
      return [...prev, { productoId: p.id, nombre: p.nombre, precioUnitario: p.precio, cantidad: 1, stockDisponible: p.stock }];
    });
    setBusqueda("");
  }

  function cambiarCantidad(productoId, delta) {
    setError("");
    setCarrito((prev) =>
      prev
        .map((it) => {
          if (it.productoId !== productoId) return it;
          const nuevaCantidad = it.cantidad + delta;
          if (nuevaCantidad > it.stockDisponible) {
            setError(`Solo hay ${it.stockDisponible} unidades disponibles de "${it.nombre}".`);
            return it;
          }
          return { ...it, cantidad: nuevaCantidad };
        })
        .filter((it) => it.cantidad > 0)
    );
  }

  function quitarProducto(productoId) {
    setCarrito((prev) => prev.filter((it) => it.productoId !== productoId));
  }

  const subtotal = useMemo(() => carrito.reduce((s, it) => s + it.precioUnitario * it.cantidad, 0), [carrito]);
  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;

  async function generarFactura() {
    setError("");
    if (carrito.length === 0) {
      setError("Agrega al menos un producto a la venta.");
      return;
    }
    setEnviando(true);
    try {
      const items = carrito.map(({ productoId, cantidad }) => ({ productoId, cantidad }));
      const { factura } = await facturasService.crear(items);
      aplicarDescuentoLocal(items);
      setHistorial((prev) => [factura, ...prev]);
      setUltimaFactura(factura);
      setCarrito([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Head>
        <title>Facturación · Comerciales Mely</title>
      </Head>
      <Layout title="Facturación" subtitle="Arma la venta y genera el comprobante conectado al inventario" allowedRoles={["administrador", "facturador"]}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Panel title="Buscar producto">
              <div className="relative">
                <div className="flex items-center gap-2 rounded-md border border-line bg-cream px-3 py-2">
                  <Search size={16} className="text-faint" />
                  <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Escribe el nombre del producto…"
                    className="w-full bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none"
                  />
                </div>
                {sugerencias.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-line bg-surface shadow-panel">
                    {sugerencias.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => agregarProducto(p)}
                          className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-cream"
                        >
                          <span className="text-ink">{p.nombre}</span>
                          <span className="text-muted">${p.precio.toFixed(2)} · stock {p.stock}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Panel>

            <Panel title="Detalle de venta">
              {error && <Alert tone="error" className="mb-4">{error}</Alert>}

              {carrito.length === 0 ? (
                <EmptyState title="Aún no hay productos en la venta" description="Busca un producto arriba para agregarlo al detalle." />
              ) : (
                <div className="table-scroll overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-faint">
                        <th className="py-2 pr-3">Producto</th>
                        <th className="py-2 pr-3">Cantidad</th>
                        <th className="py-2 pr-3">Precio</th>
                        <th className="py-2 pr-3">Subtotal</th>
                        <th className="py-2 pr-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {carrito.map((it) => (
                        <tr key={it.productoId}>
                          <td className="py-2.5 pr-3 text-ink">{it.nombre}</td>
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => cambiarCantidad(it.productoId, -1)}
                                className="rounded-md border border-line p-1 text-muted hover:bg-cream"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-6 text-center text-ink">{it.cantidad}</span>
                              <button
                                onClick={() => cambiarCantidad(it.productoId, 1)}
                                className="rounded-md border border-line p-1 text-muted hover:bg-cream"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 pr-3 text-ink">${it.precioUnitario.toFixed(2)}</td>
                          <td className="py-2.5 pr-3 font-medium text-ink">${(it.precioUnitario * it.cantidad).toFixed(2)}</td>
                          <td className="py-2.5 pr-3 text-right">
                            <button onClick={() => quitarProducto(it.productoId)} className="rounded-md p-1.5 text-muted hover:bg-brick-100 hover:text-brick-600">
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Resumen">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>IVA (13%)</span>
                  <span>${iva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-line pt-2 font-display text-base font-bold text-ink">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Button onClick={generarFactura} disabled={enviando} className="mt-4 w-full">
                <Receipt size={16} /> {enviando ? "Generando…" : "Generar factura"}
              </Button>
            </Panel>

            {ultimaFactura && (
              <Panel className="border-moss-500/40 bg-moss-100/40">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-moss-600" />
                  <div className="text-sm">
                    <p className="font-semibold text-ink">Factura {ultimaFactura.numero} generada</p>
                    <p className="text-muted">Total ${ultimaFactura.total.toFixed(2)} · stock del inventario actualizado.</p>
                  </div>
                </div>
              </Panel>
            )}

            <Panel title="Últimas facturas">
              {historial.length === 0 ? (
                <p className="text-sm text-muted">Todavía no se han generado facturas.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {historial.slice(0, 6).map((f) => (
                    <li key={f.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-ink">{f.numero}</span>
                      <span className="text-muted">${f.total.toFixed(2)}</span>
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
