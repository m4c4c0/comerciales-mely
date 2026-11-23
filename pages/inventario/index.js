import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { Plus, Pencil, Trash2, ArrowLeftRight, Search, PackageX } from "lucide-react";
import Layout from "../../components/Layout";
import { Panel } from "../../components/Panel";
import { Alert, EmptyState } from "../../components/Feedback";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import ProductoForm from "../../components/ProductoForm";
import MovimientoForm from "../../components/MovimientoForm";
import { useInventario } from "../../context/InventarioContext";
import { useAuth } from "../../context/AuthContext";


export default function Inventario() {
  const { user } = useAuth();
  const { productos, cargando, error, cargar, crearProducto, actualizarProducto, eliminarProducto, registrarMovimiento } =
    useInventario();

  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(null); // { type: 'crear' | 'editar' | 'movimiento', producto? }
  const [accionError, setAccionError] = useState("");

  useEffect(() => {
    cargar();
  }, [cargar]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter((p) => p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
  }, [productos, busqueda]);

  async function handleCrear(data) {
    await crearProducto(data);
    setModal(null);
  }

  async function handleEditar(data) {
    await actualizarProducto(modal.producto.id, data);
    setModal(null);
  }

  async function handleEliminar(producto) {
    setAccionError("");
    if (!confirm(`¿Eliminar "${producto.nombre}" del inventario? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarProducto(producto.id);
    } catch (err) {
      setAccionError(err.message);
    }
  }

  async function handleMovimiento(data) {
    await registrarMovimiento(data);
    setModal(null);
  }

  return (
    <>
      <Head>
        <title>Inventario · Comerciales Mely</title>
      </Head>
      <Layout title="Inventario" subtitle="Consulta, registra y controla las existencias de productos" allowedRoles={["administrador", "empleado"]}>
        {(error || accionError) && <Alert tone="error" className="mb-5">{error || accionError}</Alert>}

        <Panel
          title="Listado de productos"
          action={
            <Button onClick={() => setModal({ type: "crear" })}>
              <Plus size={16} /> Nuevo producto
            </Button>
          }
        >
          <div className="mb-4 flex items-center gap-2 rounded-md border border-line bg-cream px-3 py-2">
            <Search size={16} className="text-faint" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o categoría…"
              className="w-full bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none"
            />
          </div>

          {cargando ? (
            <p className="py-8 text-center text-sm text-muted">Cargando inventario…</p>
          ) : filtrados.length === 0 ? (
            <EmptyState
              title="No se encontraron productos"
              description={busqueda ? "Prueba con otro término de búsqueda." : "Registra el primer producto de Comerciales Mely."}
            />
          ) : (
            <div className="table-scroll overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-faint">
                    <th className="py-2.5 pr-3">Producto</th>
                    <th className="py-2.5 pr-3">Categoría</th>
                    <th className="py-2.5 pr-3">Stock</th>
                    <th className="py-2.5 pr-3">Precio</th>
                    <th className="py-2.5 pr-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtrados.map((p) => {
                    const bajo = p.stock <= p.stockMinimo;
                    return (
                      <tr key={p.id}>
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-cream">
                              {p.imagenUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.imagenUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <PackageX size={14} className="text-faint" />
                              )}
                            </div>
                            <span className="font-medium text-ink">{p.nombre}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 text-muted">{p.categoria}</td>
                        <td className="py-2.5 pr-3">
                          <span className={bajo ? "font-semibold text-brick-600" : "text-ink"}>{p.stock}</span>
                          {bajo && <span className="ml-1.5 rounded-pill bg-brick-100 px-2 py-0.5 text-[10px] font-medium text-brick-600">bajo</span>}
                        </td>
                        <td className="py-2.5 pr-3 text-ink">${p.precio.toFixed(2)}</td>
                        <td className="py-2.5 pr-3">
                          <div className="flex justify-end gap-1">
                            <button
                              title="Registrar entrada/salida"
                              onClick={() => setModal({ type: "movimiento", producto: p })}
                              className="rounded-md p-1.5 text-muted hover:bg-brand-100 hover:text-brand-700"
                            >
                              <ArrowLeftRight size={15} />
                            </button>
                            <button
                              title="Editar"
                              onClick={() => setModal({ type: "editar", producto: p })}
                              className="rounded-md p-1.5 text-muted hover:bg-brand-100 hover:text-brand-700"
                            >
                              <Pencil size={15} />
                            </button>
                            {user?.rol === "administrador" && (
                              <button
                                title="Eliminar"
                                onClick={() => handleEliminar(p)}
                                className="rounded-md p-1.5 text-muted hover:bg-brick-100 hover:text-brick-600"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </Layout>

      <Modal open={modal?.type === "crear"} onClose={() => setModal(null)} title="Nuevo producto">
        <ProductoForm onSubmit={handleCrear} onCancel={() => setModal(null)} />
      </Modal>

      <Modal open={modal?.type === "editar"} onClose={() => setModal(null)} title="Editar producto">
        {modal?.producto && (
          <ProductoForm
            initial={{ ...modal.producto, precio: String(modal.producto.precio), stock: String(modal.producto.stock), stockMinimo: String(modal.producto.stockMinimo) }}
            onSubmit={handleEditar}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      <Modal open={modal?.type === "movimiento"} onClose={() => setModal(null)} title="Registrar movimiento">
        {modal?.producto && <MovimientoForm producto={modal.producto} onSubmit={handleMovimiento} onCancel={() => setModal(null)} />}
      </Modal>
    </>
  );
}
