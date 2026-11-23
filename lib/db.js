// -----------------------------------------------------------------------------
// "Backend propio" — capa de datos en memoria para el prototipo académico.
//
// Cumple el requerimiento de la Etapa 2 ("Integración con API REST — JSON
// Server, mock o backend propio") sin depender de servicios externos.
// Se usa un singleton en globalThis para que los datos sobrevivan al hot
// reload de Next.js durante el desarrollo.
//
// Nota de producción: al desplegar en Vercel, cada instancia serverless es
// efímera (los datos se reinician en un cold start). Para producción real se
// recomienda sustituir este módulo por una base de datos persistente (por
// ejemplo Firebase Firestore, tal como se planteó para la app móvil en la
// Etapa 1, o Vercel Postgres). La interfaz de funciones exportadas abajo se
// mantendría igual, por lo que el resto de la aplicación no tendría que
// cambiar.
// -----------------------------------------------------------------------------

import bcrypt from "bcryptjs";

function seed() {
  const now = new Date().toISOString();

  const usuarios = [
    {
      id: "u1",
      nombre: "Edwin Cerón",
      usuario: "admin",
      passwordHash: bcrypt.hashSync("admin123", 8),
      rol: "administrador",
      creadoEn: now,
    },
    {
      id: "u2",
      nombre: "María Pérez",
      usuario: "empleado",
      passwordHash: bcrypt.hashSync("empleado123", 8),
      rol: "empleado",
      creadoEn: now,
    },
    {
      id: "u3",
      nombre: "Carlos Ramírez",
      usuario: "facturador",
      passwordHash: bcrypt.hashSync("factura123", 8),
      rol: "facturador",
      creadoEn: now,
    },
  ];

  const productos = [
    { id: "p1", nombre: "Set de 6 vasos plásticos", categoria: "Hogar", precio: 3.5, stock: 42, stockMinimo: 10, imagenUrl: "" },
    { id: "p2", nombre: "Juego de destornilladores (8 pzs)", categoria: "Ferretería", precio: 5.25, stock: 18, stockMinimo: 5, imagenUrl: "" },
    { id: "p3", nombre: "Set de aretes de fantasía", categoria: "Bisutería", precio: 2.0, stock: 60, stockMinimo: 15, imagenUrl: "" },
    { id: "p4", nombre: "Carrito de juguete a friccion", categoria: "Juguetería", precio: 4.75, stock: 8, stockMinimo: 10, imagenUrl: "" },
    { id: "p5", nombre: "Organizador plástico apilable", categoria: "Hogar", precio: 6.9, stock: 25, stockMinimo: 8, imagenUrl: "" },
    { id: "p6", nombre: "Set de brochas de maquillaje", categoria: "Belleza", precio: 7.5, stock: 14, stockMinimo: 6, imagenUrl: "" },
    { id: "p7", nombre: "Cargador USB doble puerto", categoria: "Electrónica", precio: 6.25, stock: 30, stockMinimo: 10, imagenUrl: "" },
    { id: "p8", nombre: "Figura de acción coleccionable", categoria: "Juguetería", precio: 5.5, stock: 5, stockMinimo: 10, imagenUrl: "" },
    { id: "p9", nombre: "Set de cucharas medidoras", categoria: "Hogar", precio: 2.75, stock: 33, stockMinimo: 10, imagenUrl: "" },
    { id: "p10", nombre: "Collar bañado en oro (fantasía)", categoria: "Bisutería", precio: 3.25, stock: 3, stockMinimo: 10, imagenUrl: "" },
  ].map((p) => ({ ...p, creadoEn: now }));

  const movimientos = [
    { id: "m1", productoId: "p1", tipo: "entrada", cantidad: 50, usuarioId: "u2", nota: "Compra inicial a proveedor", fecha: now },
    { id: "m2", productoId: "p4", tipo: "entrada", cantidad: 15, usuarioId: "u2", nota: "Compra inicial a proveedor", fecha: now },
  ];

  const facturas = [];

  return { usuarios, productos, movimientos, facturas, seq: 100 };
}

function getStore() {
  if (!globalThis.__MELY_DB__) {
    globalThis.__MELY_DB__ = seed();
  }
  return globalThis.__MELY_DB__;
}

function nextId(prefix) {
  const store = getStore();
  store.seq += 1;
  return `${prefix}${store.seq}`;
}

// ---------------------------------------------------------------------------
// Usuarios
// ---------------------------------------------------------------------------
export function findUserByUsuario(usuario) {
  return getStore().usuarios.find((u) => u.usuario.toLowerCase() === String(usuario).toLowerCase());
}
export function findUserById(id) {
  return getStore().usuarios.find((u) => u.id === id);
}
export function listUsuarios() {
  return getStore().usuarios.map(({ passwordHash, ...rest }) => rest);
}
export function createUsuario({ nombre, usuario, password, rol }) {
  const store = getStore();
  if (findUserByUsuario(usuario)) {
    throw new Error("Ya existe un usuario con ese nombre de usuario.");
  }
  const nuevo = {
    id: nextId("u"),
    nombre,
    usuario,
    passwordHash: bcrypt.hashSync(password, 8),
    rol,
    creadoEn: new Date().toISOString(),
  };
  store.usuarios.push(nuevo);
  const { passwordHash, ...rest } = nuevo;
  return rest;
}

// ---------------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------------
export function listProductos() {
  return [...getStore().productos].sort((a, b) => a.nombre.localeCompare(b.nombre));
}
export function findProducto(id) {
  return getStore().productos.find((p) => p.id === id);
}
export function createProducto(data) {
  const store = getStore();
  const nuevo = {
    id: nextId("p"),
    nombre: data.nombre,
    categoria: data.categoria,
    precio: Number(data.precio),
    stock: Number(data.stock) || 0,
    stockMinimo: Number(data.stockMinimo) || 5,
    imagenUrl: data.imagenUrl || "",
    creadoEn: new Date().toISOString(),
  };
  store.productos.push(nuevo);
  return nuevo;
}
export function updateProducto(id, data) {
  const store = getStore();
  const producto = store.productos.find((p) => p.id === id);
  if (!producto) return null;
  Object.assign(producto, {
    nombre: data.nombre ?? producto.nombre,
    categoria: data.categoria ?? producto.categoria,
    precio: data.precio !== undefined ? Number(data.precio) : producto.precio,
    stock: data.stock !== undefined ? Number(data.stock) : producto.stock,
    stockMinimo: data.stockMinimo !== undefined ? Number(data.stockMinimo) : producto.stockMinimo,
    imagenUrl: data.imagenUrl ?? producto.imagenUrl,
  });
  return producto;
}
export function deleteProducto(id) {
  const store = getStore();
  const idx = store.productos.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  store.productos.splice(idx, 1);
  return true;
}

// ---------------------------------------------------------------------------
// Movimientos de inventario (entrada / salida)
// ---------------------------------------------------------------------------
export function listMovimientos() {
  return [...getStore().movimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}
export function crearMovimiento({ productoId, tipo, cantidad, usuarioId, nota }) {
  const store = getStore();
  const producto = store.productos.find((p) => p.id === productoId);
  if (!producto) throw new Error("El producto indicado no existe.");
  const cant = Number(cantidad);
  if (!Number.isFinite(cant) || cant <= 0) throw new Error("La cantidad debe ser un número mayor a cero.");

  if (tipo === "salida" && cant > producto.stock) {
    throw new Error(`Stock insuficiente. Existen ${producto.stock} unidades de "${producto.nombre}".`);
  }

  producto.stock = tipo === "entrada" ? producto.stock + cant : producto.stock - cant;

  const movimiento = {
    id: nextId("m"),
    productoId,
    tipo,
    cantidad: cant,
    usuarioId,
    nota: nota || "",
    fecha: new Date().toISOString(),
  };
  store.movimientos.push(movimiento);
  return { movimiento, producto };
}

// ---------------------------------------------------------------------------
// Facturación (módulo con lógica de negocio conectada al inventario)
// ---------------------------------------------------------------------------
const IVA_RATE = 0.13;

export function listFacturas() {
  return [...getStore().facturas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

export function crearFactura({ items, facturadoPor }) {
  const store = getStore();
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("La factura debe incluir al menos un producto.");
  }

  // 1) Validar existencias ANTES de aplicar ningún cambio (operación atómica)
  const detalles = items.map(({ productoId, cantidad }) => {
    const producto = store.productos.find((p) => p.id === productoId);
    if (!producto) throw new Error("Uno de los productos de la factura ya no existe.");
    const cant = Number(cantidad);
    if (!Number.isFinite(cant) || cant <= 0) {
      throw new Error(`Cantidad inválida para "${producto.nombre}".`);
    }
    if (cant > producto.stock) {
      throw new Error(`Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock}).`);
    }
    return { producto, cantidad: cant };
  });

  // 2) Calcular totales
  const detallesConTotales = detalles.map(({ producto, cantidad }) => {
    const subtotal = Math.round(producto.precio * cantidad * 100) / 100;
    return {
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad,
      precioUnitario: producto.precio,
      subtotal,
    };
  });
  const subtotal = Math.round(detallesConTotales.reduce((s, d) => s + d.subtotal, 0) * 100) / 100;
  const iva = Math.round(subtotal * IVA_RATE * 100) / 100;
  const total = Math.round((subtotal + iva) * 100) / 100;

  // 3) Aplicar el descuento de inventario (regla de negocio: factura <-> inventario)
  detalles.forEach(({ producto, cantidad }) => {
    producto.stock -= cantidad;
  });

  const factura = {
    id: nextId("f"),
    numero: `F-${String(store.seq).padStart(6, "0")}`,
    items: detallesConTotales,
    subtotal,
    iva,
    total,
    facturadoPor,
    fecha: new Date().toISOString(),
  };
  store.facturas.push(factura);
  return factura;
}

// ---------------------------------------------------------------------------
// Reportes
// ---------------------------------------------------------------------------
export function resumenReportes() {
  const store = getStore();
  const productos = store.productos;
  const facturas = store.facturas;

  const productosActivos = productos.length;
  const stockBajo = productos.filter((p) => p.stock <= p.stockMinimo).length;

  const hoyStr = new Date().toISOString().slice(0, 10);
  const ventasHoy = facturas
    .filter((f) => f.fecha.slice(0, 10) === hoyStr)
    .reduce((s, f) => s + f.total, 0);

  // Ventas por día (últimos 7 días)
  const porDia = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    porDia[d.toISOString().slice(0, 10)] = 0;
  }
  facturas.forEach((f) => {
    const key = f.fecha.slice(0, 10);
    if (key in porDia) porDia[key] += f.total;
  });
  const ventasPorDia = Object.entries(porDia).map(([fecha, total]) => ({ fecha, total: Math.round(total * 100) / 100 }));

  // Productos más vendidos
  const vendidos = {};
  facturas.forEach((f) =>
    f.items.forEach((it) => {
      vendidos[it.productoId] = (vendidos[it.productoId] || 0) + it.cantidad;
    })
  );
  const masVendidos = Object.entries(vendidos)
    .map(([productoId, cantidad]) => {
      const p = productos.find((pp) => pp.id === productoId);
      return { productoId, nombre: p ? p.nombre : "Producto eliminado", cantidad };
    })
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  const productosStockBajo = productos
    .filter((p) => p.stock <= p.stockMinimo)
    .map((p) => ({ id: p.id, nombre: p.nombre, stock: p.stock, stockMinimo: p.stockMinimo }));

  return {
    productosActivos,
    stockBajo,
    ventasHoy: Math.round(ventasHoy * 100) / 100,
    totalFacturas: facturas.length,
    ventasPorDia,
    masVendidos,
    productosStockBajo,
  };
}
