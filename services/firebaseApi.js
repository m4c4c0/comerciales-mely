import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { initializeApp as initializeFirebaseApp, getApp, deleteApp } from "firebase/app";
import { createUserWithEmailAndPassword as createSecondaryUser, getAuth, signOut as signOutSecondary, updateProfile as updateSecondaryProfile } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { facturaSchema, movimientoSchema, productoSchema, registroPublicoSchema, registroSchema } from "../lib/validators";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const roles = {
  read: ["administrador", "empleado", "facturador"],
  products: ["administrador", "empleado"],
  movements: ["administrador", "empleado"],
  invoices: ["administrador", "facturador"],
  users: ["administrador"],
};

function publicUser(uid, data) {
  return {
    id: uid,
    nombre: data.nombre || data.displayName || data.email?.split("@")[0] || "Usuario",
    usuario: data.email || data.usuario || "",
    email: data.email || "",
    rol: String(data.rol || "empleado").toLowerCase(),
  };
}

export async function getProfile(user = auth.currentUser) {
  if (!user) return null;
  const profileRef = doc(db, "usuarios", user.uid);
  const snapshot = await import("firebase/firestore").then(({ getDoc }) => getDoc(profileRef));
  if (snapshot.exists()) return publicUser(user.uid, snapshot.data());

  const profile = {
    nombre: user.displayName || user.email?.split("@")[0] || "Usuario",
    email: (user.email || "").toLowerCase(),
    usuario: (user.email || "").toLowerCase(),
    rol: "Empleado",
    proveedor: user.providerData?.[0]?.providerId || "password",
    fechaCreacion: serverTimestamp(),
  };
  await setDoc(profileRef, profile);
  return publicUser(user.uid, profile);
}

function requireRole(user, action) {
  if (!user) throw new Error("Inicia sesión para continuar.");
  if (!roles[action]?.includes(user.rol)) throw new Error("No tienes permiso para realizar esta operación.");
}

async function currentProfile(action) {
  const user = await getProfile();
  requireRole(user, action);
  return user;
}

function firstError(result) {
  return result.error.errors?.[0]?.message || "Revisa los datos ingresados.";
}

const iso = (value) => {
  if (value?.toDate) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return value ? new Date(value).toISOString() : new Date().toISOString();
};

function mapProduct(snapshot) {
  const value = snapshot.data();
  return { ...value, id: snapshot.id, activo: value.activo !== false, precio: Number(value.precio) || 0, stock: Number(value.stock) || 0, stockMinimo: Number(value.stockMinimo) || 0 };
}

function mapMovement(snapshot) {
  const value = snapshot.data();
  return { ...value, id: snapshot.id, fecha: iso(value.fecha), tipo: String(value.tipo || "").toLowerCase() };
}

function mapInvoice(snapshot) {
  const value = snapshot.data();
  const amount = (cents, legacy) => cents != null
    ? (Number(cents) || 0) / 100
    : Number.isInteger(Number(legacy))
      ? (Number(legacy) || 0) / 100
      : Number(legacy) || 0;
  return {
    ...value,
    id: snapshot.id,
    fecha: iso(value.fecha),
    subtotal: amount(value.subtotalCentavos, value.subtotal),
    iva: amount(value.ivaCentavos, value.iva),
    total: amount(value.totalCentavos, value.total),
    items: (value.items || []).map((item) => ({
      ...item,
      precioUnitario: item.precioCentavos != null
        ? Number(item.precioCentavos) / 100
        : Number(item.precioUnitario) || 0,
      subtotal: item.subtotalCentavos != null
        ? Number(item.subtotalCentavos) / 100
        : item.subtotal != null
          ? (Number.isInteger(Number(item.subtotal)) ? Number(item.subtotal) / 100 : Number(item.subtotal))
          : ((Number(item.precioCentavos) || 0) / 100) * (Number(item.cantidad) || 0),
    })),
  };
}

async function products() {
  const result = await getDocs(collection(db, "productos"));
  return result.docs.map(mapProduct).filter((item) => item.activo).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

async function movements() {
  const result = await getDocs(collection(db, "movimientos"));
  return result.docs.map(mapMovement).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

async function invoices() {
  const result = await getDocs(collection(db, "facturas"));
  return result.docs.map(mapInvoice).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

function validated(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) throw new Error(firstError(result));
  return result.data;
}

async function login(body) {
  const email = String(body.email || body.usuario || "").trim().toLowerCase();
  if (!emailPattern.test(email)) throw new Error("Ingresa tu correo electrónico completo.");
  const credential = await signInWithEmailAndPassword(auth, email, body.password || "");
  const user = await getProfile(credential.user);
  if (body.expectedRole && body.expectedRole !== user.rol) {
    await signOut(auth);
    throw new Error("El perfil seleccionado no corresponde a esta cuenta.");
  }
  return { usuario: user };
}

async function register(body) {
  const payload = validated(registroPublicoSchema, body);
  const email = String(body.email || body.usuario || "").trim().toLowerCase();
  if (!emailPattern.test(email)) throw new Error("Ingresa un correo electrónico válido.");
  const credential = await createUserWithEmailAndPassword(auth, email, payload.password);
  await updateProfile(credential.user, { displayName: payload.nombre });
  const profile = {
    nombre: payload.nombre,
    usuario: payload.usuario,
    email,
    rol: payload.rol === "facturador" ? "Facturador" : "Empleado",
    proveedor: "password",
    fechaCreacion: serverTimestamp(),
  };
  await setDoc(doc(db, "usuarios", credential.user.uid), profile);
  return { usuario: publicUser(credential.user.uid, profile) };
}

async function createAdminUser(body) {
  const admin = await currentProfile("users");
  const payload = validated(registroSchema, body);
  const email = String(body.email || body.usuario || "").trim().toLowerCase();
  if (!emailPattern.test(email)) throw new Error("Ingresa un correo electrónico válido.");
  const secondaryApp = initializeFirebaseApp(getApp().options, `admin-create-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const credential = await createSecondaryUser(secondaryAuth, email, payload.password);
    await updateSecondaryProfile(credential.user, { displayName: payload.nombre });
    const profile = {
      nombre: payload.nombre,
      usuario: payload.usuario,
      email,
      rol: payload.rol === "administrador" ? "Administrador" : payload.rol === "facturador" ? "Facturador" : "Empleado",
      proveedor: "password",
      creadoPor: admin.id,
      fechaCreacion: serverTimestamp(),
    };
    await setDoc(doc(db, "usuarios", credential.user.uid), profile);
    return { usuario: publicUser(credential.user.uid, profile) };
  } finally {
    await signOutSecondary(secondaryAuth).catch(() => {});
    await deleteApp(secondaryApp);
  }
}

async function createProduct(body) {
  const user = await currentProfile("products");
  const product = validated(productoSchema, body);
  const ref = doc(collection(db, "productos"));
  const fecha = new Date().toISOString();
  const movementRef = product.stock > 0 ? doc(collection(db, "movimientos")) : null;
  await runTransaction(db, async (transaction) => {
    transaction.set(ref, {
      ...product,
      precioCentavos: Math.round(product.precio * 100),
      activo: true,
      ...(movementRef ? { lastMovementId: movementRef.id } : {}),
      creadoPorId: user.id,
      creadoPor: user.nombre,
      fechaCreacion: serverTimestamp(),
    });
    if (movementRef) transaction.set(movementRef, {
      productoId: ref.id,
      nombre: product.nombre,
      nombreProducto: product.nombre,
      tipo: "Entrada",
      cantidad: product.stock,
      nota: "Existencias iniciales",
      motivo: "Existencias iniciales",
      usuario: user.nombre,
      usuarioId: user.id,
      fecha,
    });
  });
  return { producto: { ...product, id: ref.id, activo: true } };
}

async function updateProduct(id, body) {
  await currentProfile("products");
  const input = validated(productoSchema, body);
  const ref = doc(db, "productos", id);
  await updateDoc(ref, { ...input, precioCentavos: Math.round(input.precio * 100) });
  return { producto: { ...input, id, activo: true } };
}

async function archiveProduct(id) {
  const user = await getProfile();
  requireRole(user, "users");
  await updateDoc(doc(db, "productos", id), { activo: false, archivadoPor: user.id, archivadoEn: serverTimestamp() });
  return { ok: true };
}

async function createMovement(body) {
  const user = await currentProfile("movements");
  const movement = validated(movimientoSchema, body);
  const productRef = doc(db, "productos", movement.productoId);
  const movementRef = doc(collection(db, "movimientos"));
  let savedProduct;
  const fecha = new Date().toISOString();
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(productRef);
    if (!snapshot.exists() || snapshot.data().activo === false) throw new Error("El producto no está disponible.");
    const product = mapProduct(snapshot);
    if (movement.tipo === "salida" && movement.cantidad > product.stock) throw new Error(`Stock insuficiente. Disponible: ${product.stock}.`);
    const stock = product.stock + (movement.tipo === "entrada" ? movement.cantidad : -movement.cantidad);
    savedProduct = { ...product, stock };
    transaction.update(productRef, { stock, lastMovementId: movementRef.id });
    transaction.set(movementRef, {
      ...movement,
      nombre: product.nombre,
      nombreProducto: product.nombre,
      tipo: movement.tipo === "entrada" ? "Entrada" : "Salida",
      motivo: movement.nota || "",
      usuario: user.nombre,
      usuarioId: user.id,
      fecha,
    });
  });
  return { movimiento: { ...movement, id: movementRef.id, nombre: savedProduct.nombre, usuario: user.nombre, fecha }, producto: savedProduct };
}

async function createInvoice(body) {
  const user = await currentProfile("invoices");
  const input = validated(facturaSchema, body);
  const grouped = new Map();
  for (const item of input.items) grouped.set(item.productoId, (grouped.get(item.productoId) || 0) + item.cantidad);
  const lines = [...grouped].map(([productoId, cantidad]) => ({ productoId, cantidad }));
  const productRefs = lines.map((line) => doc(db, "productos", line.productoId));
  const invoiceRef = doc(collection(db, "facturas"));
  const movementRefs = lines.map(() => doc(collection(db, "movimientos")));
  const fecha = new Date().toISOString();
  let invoice;
  await runTransaction(db, async (transaction) => {
    const snapshots = [];
    for (const ref of productRefs) snapshots.push(await transaction.get(ref));
    const details = lines.map((line, index) => {
      const snapshot = snapshots[index];
      if (!snapshot.exists() || snapshot.data().activo === false) throw new Error("Uno de los productos ya no está disponible.");
      const product = mapProduct(snapshot);
      if (line.cantidad > product.stock) throw new Error(`Stock insuficiente para ${product.nombre}: ${product.stock} unidades.`);
      return { product, ...line, precioUnitario: product.precio, precioCentavos: Math.round(product.precio * 100), subtotal: Math.round(product.precio * line.cantidad * 100) / 100 };
    });
    const subtotal = Math.round(details.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100;
    const iva = Math.round(subtotal * 13) / 100;
    const total = Math.round((subtotal + iva) * 100) / 100;
    const numero = `MELY-${Date.now().toString().slice(-8)}`;
    const sharedInvoice = {
      id: invoiceRef.id,
      numero,
      cliente: body.cliente || "Consumidor final",
      items: details.map(({ product, ...item }) => ({
        productoId: item.productoId,
        nombre: product.nombre,
        cantidad: item.cantidad,
        precioCentavos: item.precioCentavos,
        subtotalCentavos: Math.round(item.subtotal * 100),
      })),
      subtotal: Math.round(subtotal * 100),
      iva: Math.round(iva * 100),
      total: Math.round(total * 100),
      fecha,
      usuario: user.nombre,
      usuarioId: user.id,
    };
    invoice = { ...sharedInvoice, subtotal, iva, total, items: details.map(({ product, ...item }) => ({ ...item, nombre: product.nombre })) };
    details.forEach(({ product, productoId, cantidad }, index) => {
      transaction.update(productRefs[index], { stock: product.stock - cantidad, lastMovementId: movementRefs[index].id });
      transaction.set(movementRefs[index], { productoId, nombre: product.nombre, nombreProducto: product.nombre, tipo: "Salida", cantidad, facturaId: invoiceRef.id, itemIndex: index, nota: `Venta ${numero}`, motivo: `Venta ${numero}`, usuario: user.nombre, usuarioId: user.id, fecha });
    });
    transaction.set(invoiceRef, sharedInvoice);
  });
  return { factura: invoice };
}

async function report() {
  await currentProfile("read");
  const [productsList, invoiceList] = await Promise.all([products(), invoices()]);
  const today = new Date().toISOString().slice(0, 10);
  const salesToday = invoiceList.filter((invoice) => invoice.fecha.slice(0, 10) === today).reduce((sum, invoice) => sum + invoice.total, 0);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - 6 + index);
    const key = date.toISOString().slice(0, 10);
    return { fecha: key, total: invoiceList.filter((invoice) => invoice.fecha.slice(0, 10) === key).reduce((sum, invoice) => sum + invoice.total, 0) };
  });
  const sold = new Map();
  for (const invoice of invoiceList) {
    for (const item of invoice.items) {
      const current = sold.get(item.productoId) || { productoId: item.productoId, nombre: item.nombre || "Producto", cantidad: 0 };
      current.cantidad += Number(item.cantidad) || 0;
      sold.set(item.productoId, current);
    }
  }
  const names = new Map(productsList.map((item) => [item.id, item.nombre]));
  const low = productsList.filter((item) => item.stock <= item.stockMinimo);
  return {
    productosActivos: productsList.length,
    stockBajo: low.length,
    productosStockBajo: low,
    ventasHoy: Math.round(salesToday * 100) / 100,
    totalFacturas: invoiceList.length,
    ventasPorDia: days,
    masVendidos: [...sold.values()]
      .map((item) => ({ ...item, nombre: names.get(item.productoId) || item.nombre }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5),
  };
}

export async function firebaseApi(path, { method = "GET", body } = {}) {
  if (path === "/api/auth/me") return { usuario: await getProfile() };
  if (path === "/api/auth/login" && method === "POST") return login(body || {});
  if (path === "/api/auth/register" && method === "POST") return register(body || {});
  if (path === "/api/auth/logout" && method === "POST") { await signOut(auth); return { ok: true }; }
  if (path === "/api/productos" && method === "GET") { await currentProfile("read"); return { productos: await products() }; }
  if (path === "/api/productos" && method === "POST") return createProduct(body || {});
  if (path.startsWith("/api/productos/")) {
    const id = decodeURIComponent(path.split("/").pop());
    if (method === "PUT") return updateProduct(id, body || {});
    if (method === "DELETE") return archiveProduct(id);
  }
  if (path === "/api/movimientos" && method === "GET") { await currentProfile("read"); return { movimientos: await movements() }; }
  if (path === "/api/movimientos" && method === "POST") return createMovement(body || {});
  if (path === "/api/facturas" && method === "GET") { await currentProfile("invoices"); return { facturas: await invoices() }; }
  if (path === "/api/facturas" && method === "POST") return createInvoice(body || {});
  if (path === "/api/reportes/resumen" && method === "GET") return { resumen: await report() };
  if (path === "/api/usuarios" && method === "GET") {
    await currentProfile("users");
    const result = await getDocs(collection(db, "usuarios"));
    return { usuarios: result.docs.map((snapshot) => ({ ...publicUser(snapshot.id, snapshot.data()), creadoEn: iso(snapshot.data().fechaCreacion) })) };
  }
  if (path === "/api/usuarios" && method === "POST") return createAdminUser(body || {});
  throw new Error("La operación solicitada no está disponible.");
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const credential = await signInWithPopup(auth, provider);
  return { usuario: await getProfile(credential.user) };
}

export async function resetPassword(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!emailPattern.test(normalizedEmail)) throw new Error("Ingresa un correo electrónico válido.");
  await sendPasswordResetEmail(auth, normalizedEmail);
}
