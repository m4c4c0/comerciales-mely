import { z } from "zod";
z.config(z.locales.es());
export const money = (n) => `$${(Number(n) / 100).toFixed(2)}`;
export const roles = ["administrador", "empleado", "facturador"];
const text = (min) => z.string().trim().min(min).max(120);
const integer = z.coerce.number().int().min(0).max(1000000);
export const loginSchema = z.object({
  usuario: text(1),
  password: z.string().min(1).max(72),
});
export const registerSchema = z.object({
  nombre: text(3),
  usuario: text(3).regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(8).max(72),
  rol: z.enum(["empleado", "facturador"]),
});
export const productSchema = z.object({
  nombre: text(2),
  categoria: text(2),
  precio: z.coerce.number().min(0.01).max(100000),
  stock: integer,
  stockMinimo: integer,
  imagenUrl: z.string().max(2000).default(""),
});
export const movementSchema = z.object({
  productoId: text(1),
  tipo: z.enum(["entrada", "salida"]),
  cantidad: z.coerce.number().int().positive().max(1000000),
  nota: z.string().trim().min(3).max(250),
});
export function parse(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new Error(
      result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("\n"),
    );
  return result.data;
}
export function allowed(user, action) {
  const access = {
    read: roles,
    product: ["administrador", "empleado"],
    remove: ["administrador"],
    movement: ["administrador", "empleado"],
    invoice: ["administrador", "facturador"],
    reports: ["administrador", "facturador"],
    users: ["administrador"],
  };
  return !!user && (access[action] || []).includes(user.rol);
}
export function requireRole(user, action) {
  if (!allowed(user, action))
    throw new Error("No tienes permiso para realizar esta operación.");
}
export function totals(items) {
  const subtotal = items.reduce((n, i) => n + i.precioCentavos * i.cantidad, 0);
  const iva = Math.round((subtotal * 13) / 100);
  return { subtotal, iva, total: subtotal + iva };
}
export function localDay(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function seedProducts() {
  const web = [
    ["Set de 6 vasos plásticos", "Hogar", 350, 42, 10],
    ["Juego de destornilladores (8 pzs)", "Ferretería", 525, 18, 5],
    ["Set de aretes de fantasía", "Bisutería", 200, 60, 15],
    ["Carrito de juguete a fricción", "Juguetería", 475, 8, 10],
    ["Organizador plástico apilable", "Hogar", 690, 25, 8],
    ["Set de brochas de maquillaje", "Belleza", 750, 14, 6],
    ["Cargador USB doble puerto", "Electrónica", 625, 30, 10],
    ["Figura de acción coleccionable", "Juguetería", 550, 5, 10],
    ["Set de cucharas medidoras", "Hogar", 275, 33, 10],
    ["Collar de fantasía", "Bisutería", 325, 3, 10],
  ].map((p, i) => ({
    id: `p${i + 1}`,
    nombre: p[0],
    categoria: p[1],
    precioCentavos: p[2],
    stock: p[3],
    stockMinimo: p[4],
    imagenUrl: "",
    activo: true,
  }));
  const figma = [
    ["cesta", "Cesta de Plástico Multiusos", "Plásticos", 250, 140, 10],
    ["espejo", "Espejo de Tocador LED", "Belleza", 899, 12, 15],
    ["pulsera", "Pulsera de Fantasía Dorada", "Bisutería", 150, 0, 10],
    ["vasos", "Juego de Vasos de Vidrio", "Hogar", 575, 45, 10],
  ].map((p) => ({
    id: `figma-${p[0]}`,
    imagenKey: p[0],
    nombre: p[1],
    categoria: p[2],
    precioCentavos: p[3],
    stock: p[4],
    stockMinimo: p[5],
    imagenUrl: "",
    activo: true,
  }));
  return [...web, ...figma];
}
// Pure transition: all validation occurs before a new state is returned.
export function transition(
  original,
  user,
  action,
  input,
  id,
  now = new Date().toISOString(),
) {
  const state = JSON.parse(JSON.stringify(original));
  if (action === "product") {
    requireRole(user, "product");
    const p = parse(productSchema, input);
    const existing = input.id
      ? state.productos.find((p) => p.id === input.id && p.activo)
      : null;
    if (input.id && !existing) throw new Error("El producto ya no existe.");
    if (existing && Number(p.stock) !== existing.stock)
      throw new Error(
        "Cambia las existencias desde Movimientos para conservar la trazabilidad.",
      );
    const value = {
      ...p,
      id: existing?.id || id,
      precioCentavos: Math.round(p.precio * 100),
      activo: true,
    };
    delete value.precio;
    if (existing) Object.assign(existing, value);
    else {
      state.productos.push(value);
      if (p.stock > 0)
        state.movimientos.unshift({
          id: `${id}-inicial`,
          productoId: id,
          nombre: p.nombre,
          tipo: "entrada",
          cantidad: p.stock,
          nota: "Existencias iniciales",
          usuario: user.nombre,
          fecha: now,
        });
    }
  } else if (action === "remove") {
    requireRole(user, "remove");
    const p = state.productos.find((p) => p.id === input.id && p.activo);
    if (!p) throw new Error("Producto no encontrado.");
    p.activo = false;
  } else if (action === "movement") {
    requireRole(user, "movement");
    const m = parse(movementSchema, input);
    const p = state.productos.find((p) => p.id === m.productoId && p.activo);
    if (!p) throw new Error("Producto no encontrado.");
    if (m.tipo === "salida" && m.cantidad > p.stock)
      throw new Error(`Stock insuficiente: ${p.stock} unidades.`);
    p.stock += m.tipo === "entrada" ? m.cantidad : -m.cantidad;
    state.movimientos.unshift({
      ...m,
      id,
      nombre: p.nombre,
      usuario: user.nombre,
      fecha: now,
    });
  } else if (action === "invoice") {
    requireRole(user, "invoice");
    const schema = z.object({
      items: z
        .array(
          z.object({
            productoId: text(1),
            cantidad: z.coerce.number().int().positive().max(1000000),
          }),
        )
        .min(1),
      cliente: text(2),
    });
    const data = parse(schema, input);
    const grouped = new Map();
    for (const item of data.items)
      grouped.set(
        item.productoId,
        (grouped.get(item.productoId) || 0) + item.cantidad,
      );
    const details = [...grouped].map(([productoId, cantidad]) => {
      const p = state.productos.find((p) => p.id === productoId && p.activo);
      if (!p) throw new Error("Uno de los productos ya no está disponible.");
      if (cantidad > p.stock)
        throw new Error(
          `Stock insuficiente para ${p.nombre}: ${p.stock} unidades.`,
        );
      return {
        productoId,
        nombre: p.nombre,
        cantidad,
        precioCentavos: p.precioCentavos,
      };
    });
    for (const item of details) {
      const p = state.productos.find((p) => p.id === item.productoId);
      p.stock -= item.cantidad;
      state.movimientos.unshift({
        id: `${id}-${p.id}`,
        productoId: p.id,
        nombre: p.nombre,
        tipo: "salida",
        cantidad: item.cantidad,
        nota: `Venta ${String(state.facturas.length + 1).padStart(6, "0")}`,
        usuario: user.nombre,
        fecha: now,
      });
    }
    state.facturas.unshift({
      id,
      numero: `MELY-${String(state.facturas.length + 1).padStart(6, "0")}`,
      cliente: data.cliente,
      items: details,
      ...totals(details),
      fecha: now,
      usuario: user.nombre,
    });
  } else {
    throw new Error("Operación desconocida.");
  }
  return state;
}
export function report(state, now = new Date()) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 6 + i);
    return { fecha: localDay(d), total: 0 };
  });
  for (const f of state.facturas) {
    const d = days.find((d) => d.fecha === localDay(f.fecha));
    if (d) d.total += f.total;
  }
  const productos = state.productos.filter((p) => p.activo);
  return {
    days,
    productos: productos.length,
    bajos: productos.filter((p) => p.stock <= p.stockMinimo),
    ventasHoy: days[6].total,
    facturas: state.facturas.length,
    valor: productos.reduce((n, p) => n + p.stock * p.precioCentavos, 0),
  };
}
