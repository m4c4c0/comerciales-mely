import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { productosService } from "../services/productosService";
import { movimientosService } from "../services/movimientosService";

const InventarioContext = createContext(null);

export function InventarioProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const data = await productosService.listar();
      setProductos(data.productos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  // Cada operación actualiza el estado en memoria de inmediato (sin recargar
  // la página), cumpliendo el requisito de "actualización dinámica de datos
  // durante la ejecución".
  const crearProducto = useCallback(async (data) => {
    const { producto } = await productosService.crear(data);
    setProductos((prev) => [...prev, producto].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    return producto;
  }, []);

  const actualizarProducto = useCallback(async (id, data) => {
    const { producto } = await productosService.actualizar(id, data);
    setProductos((prev) => prev.map((p) => (p.id === id ? producto : p)));
    return producto;
  }, []);

  const eliminarProducto = useCallback(async (id) => {
    await productosService.eliminar(id);
    setProductos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const registrarMovimiento = useCallback(async (data) => {
    const { producto } = await movimientosService.crear(data);
    setProductos((prev) => prev.map((p) => (p.id === producto.id ? producto : p)));
    return producto;
  }, []);

  // Usado por el módulo de Facturación para reflejar de inmediato el
  // descuento de stock sin tener que volver a llamar a /api/productos.
  const aplicarDescuentoLocal = useCallback((items) => {
    setProductos((prev) =>
      prev.map((p) => {
        const item = items.find((it) => it.productoId === p.id);
        return item ? { ...p, stock: p.stock - item.cantidad } : p;
      })
    );
  }, []);

  const value = useMemo(
    () => ({ productos, cargando, error, cargar, crearProducto, actualizarProducto, eliminarProducto, registrarMovimiento, aplicarDescuentoLocal }),
    [productos, cargando, error, cargar, crearProducto, actualizarProducto, eliminarProducto, registrarMovimiento, aplicarDescuentoLocal]
  );

  return <InventarioContext.Provider value={value}>{children}</InventarioContext.Provider>;
}

export function useInventario() {
  const ctx = useContext(InventarioContext);
  if (!ctx) throw new Error("useInventario debe usarse dentro de <InventarioProvider>.");
  return ctx;
}
