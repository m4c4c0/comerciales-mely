'use client';

/**
 * Capa unificada de servicios Firestore para la Web de Comerciales Mely.
 * Compatible 100 % con la App Móvil (React Native) y con las reglas de
 * seguridad de Firestore (lastMovementId, facturaId, itemIndex, precioCentavos).
 */
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { auth, db, firebaseConfig } from '@/lib/firebase';

export interface Actor {
  id: string;
  nombre: string;
}

export interface ProductItem {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  precioCentavos: number;
  stock: number;
  stockMinimo: number;
  imagenUrl?: string;
  activo: boolean;
}

export interface MovementItem {
  id: string;
  productoId: string;
  nombreProducto: string;
  codigoProducto?: string;
  tipo: 'Entrada' | 'Salida' | 'Ajuste' | 'Entrada Inicial';
  cantidad: number;
  stockAnterior?: number;
  stockResultante?: number;
  motivo?: string;
  usuario: string;
  usuarioId?: string;
  facturaId?: string;
  fecha: string;
}

export interface InvoiceLine {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  precioCentavos: number;
  subtotal: number;
  subtotalCentavos: number;
}

export interface InvoiceItem {
  id: string;
  numero: string;
  cliente: string;
  items: InvoiceLine[];
  subtotal: number;
  iva: number;
  total: number;
  fecha: string;
  usuario: string;
  usuarioId?: string;
}

function toIso(value: unknown): string {
  if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return typeof value === 'string' && value ? value : new Date().toISOString();
}

export function localDay(dateInput: string | Date): string {
  const d = new Date(dateInput);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function resolveActor(actor?: Actor): Actor {
  const uid = auth.currentUser?.uid || actor?.id || 'sistema';
  const nombre = actor?.nombre || auth.currentUser?.displayName || auth.currentUser?.email || 'Usuario';
  return { id: uid, nombre };
}

/* ------------------------------ PRODUCTOS ------------------------------ */

export async function getProducts(): Promise<ProductItem[]> {
  const snap = await getDocs(collection(db, 'productos'));
  return snap.docs
    .map((d) => {
      const data = d.data();
      const cents = Number.isFinite(data.precioCentavos)
        ? Number(data.precioCentavos)
        : Math.round(Number(data.precio || 0) * 100);
      return {
        id: d.id,
        codigo: data.codigo || `MELY-${d.id.slice(0, 6).toUpperCase()}`,
        nombre: data.nombre || 'Producto',
        categoria: data.categoria || 'General',
        precio: Math.round(cents) / 100,
        precioCentavos: Math.round(cents),
        stock: Math.trunc(Number(data.stock) || 0),
        stockMinimo: Number.isFinite(data.stockMinimo) ? Math.trunc(Number(data.stockMinimo)) : 5,
        imagenUrl: data.imagenUrl || '',
        activo: data.activo !== false,
      };
    })
    .filter((p) => p.activo)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

export async function createProduct(
  data: {
    nombre: string;
    codigo: string;
    categoria?: string;
    precio: number;
    stock: number;
    stockMinimo?: number;
  },
  actor?: Actor
): Promise<string> {
  const who = resolveActor(actor);
  const nombre = String(data.nombre || '').trim();
  const codigo = String(data.codigo || '').trim() || `MELY-${Date.now().toString().slice(-5)}`;
  const categoria = String(data.categoria || 'General').trim() || 'General';
  const precio = Number(data.precio);
  const stock = Math.trunc(Number(data.stock) || 0);
  const stockMinimo = Number.isFinite(data.stockMinimo) ? Math.trunc(Number(data.stockMinimo)) : 5;

  if (!nombre || isNaN(precio) || precio <= 0 || stock < 0) {
    throw new Error('Nombre, código, precio mayor a 0 y stock válido son requeridos');
  }

  const prodRef = doc(collection(db, 'productos'));
  const movRef = stock > 0 ? doc(collection(db, 'movimientos')) : null;
  const fecha = new Date().toISOString();

  await runTransaction(db, async (tx) => {
    tx.set(prodRef, {
      nombre,
      codigo,
      categoria,
      precio,
      precioCentavos: Math.round(precio * 100),
      stock,
      stockMinimo,
      imagenUrl: '',
      activo: true,
      ...(movRef ? { lastMovementId: movRef.id } : {}),
      creadoPorId: who.id,
      creadoPor: who.nombre,
      fechaCreacion: serverTimestamp(),
    });

    if (movRef) {
      tx.set(movRef, {
        productoId: prodRef.id,
        nombre,
        nombreProducto: nombre,
        codigoProducto: codigo,
        tipo: 'Entrada',
        cantidad: stock,
        stockAnterior: 0,
        stockResultante: stock,
        nota: 'Existencias iniciales',
        motivo: 'Existencias iniciales',
        usuarioId: who.id,
        usuario: who.nombre,
        fecha,
      });
    }
  });

  return prodRef.id;
}

export async function updateProduct(
  id: string,
  data: {
    nombre?: string;
    codigo?: string;
    categoria?: string;
    precio?: number;
    stock?: number;
    stockMinimo?: number;
  },
  actor?: Actor
): Promise<void> {
  const who = resolveActor(actor);
  const prodRef = doc(db, 'productos', id);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(prodRef);
    if (!snap.exists()) throw new Error('El producto no existe');
    const current = snap.data();

    const nombre = data.nombre !== undefined ? String(data.nombre).trim() : current.nombre;
    const codigo = data.codigo !== undefined ? String(data.codigo).trim() : current.codigo || '';
    const categoria = data.categoria !== undefined ? String(data.categoria).trim() : current.categoria || 'General';
    const precio = data.precio !== undefined ? Number(data.precio) : Number(current.precio);
    const stockMinimo =
      data.stockMinimo !== undefined
        ? Math.trunc(Number(data.stockMinimo))
        : Number.isFinite(current.stockMinimo)
          ? Math.trunc(Number(current.stockMinimo))
          : 5;
    const prevStock = Math.trunc(Number(current.stock) || 0);
    const nextStock = data.stock !== undefined ? Math.trunc(Number(data.stock)) : prevStock;
    const diff = nextStock - prevStock;

    let lastMovementId = current.lastMovementId;
    if (diff !== 0) {
      const movRef = doc(collection(db, 'movimientos'));
      lastMovementId = movRef.id;
      tx.set(movRef, {
        productoId: id,
        nombre,
        nombreProducto: nombre,
        codigoProducto: codigo,
        tipo: diff > 0 ? 'Entrada' : 'Salida',
        cantidad: Math.abs(diff),
        stockAnterior: prevStock,
        stockResultante: nextStock,
        nota: 'Ajuste de inventario desde CRUD',
        motivo: 'Ajuste de inventario desde CRUD',
        usuarioId: who.id,
        usuario: who.nombre,
        fecha: new Date().toISOString(),
      });
    }

    const updatePayload: Record<string, unknown> = {
      nombre,
      codigo,
      categoria,
      precio,
      precioCentavos: Math.round(precio * 100),
      stock: nextStock,
      stockMinimo,
      activo: current.activo !== false,
    };
    if (lastMovementId) updatePayload.lastMovementId = lastMovementId;

    tx.update(prodRef, updatePayload);
  });
}

export async function deleteProduct(id: string): Promise<void> {
  const prodRef = doc(db, 'productos', id);
  try {
    await deleteDoc(prodRef);
  } catch {
    await updateDoc(prodRef, { activo: false });
  }
}

/* ----------------------------- MOVIMIENTOS ----------------------------- */

export async function getMovements(max = 150): Promise<MovementItem[]> {
  const snap = await getDocs(collection(db, 'movimientos'));
  const list = snap.docs.map((d) => {
    const data = d.data();
    const rawTipo = String(data.tipo || 'Entrada');
    const tipoNorm: MovementItem['tipo'] = rawTipo.toLowerCase().startsWith('salida')
      ? 'Salida'
      : rawTipo === 'Entrada Inicial'
        ? 'Entrada Inicial'
        : 'Entrada';
    return {
      id: d.id,
      productoId: data.productoId || '',
      nombreProducto: data.nombreProducto || data.nombre || 'Producto',
      codigoProducto: data.codigoProducto || '',
      tipo: tipoNorm,
      cantidad: Number(data.cantidad) || 0,
      stockAnterior: data.stockAnterior,
      stockResultante: data.stockResultante,
      motivo: data.motivo || data.nota || '',
      usuario: data.usuario || 'Sistema',
      usuarioId: data.usuarioId || '',
      facturaId: data.facturaId,
      fecha: toIso(data.fecha),
    };
  });
  list.sort((a, b) => b.fecha.localeCompare(a.fecha));
  return list.slice(0, max);
}

export async function createMovement(
  input: { productoId: string; tipo: string; cantidad: number; motivo?: string },
  actor?: Actor
): Promise<{ id: string; nuevoStock: number }> {
  const who = resolveActor(actor);
  const cantidad = Math.trunc(Number(input.cantidad));
  if (!input.productoId || !input.tipo || !cantidad || cantidad <= 0) {
    throw new Error('Producto, tipo y cantidad entera mayor a 0 son requeridos');
  }

  const isEntrada = input.tipo.toLowerCase().startsWith('entrada');
  const tipoGuardar = isEntrada ? 'Entrada' : 'Salida';
  const motivo =
    (input.motivo || '').trim() || (isEntrada ? 'Reabastecimiento de almacén' : 'Salida de almacén');

  const prodRef = doc(db, 'productos', input.productoId);
  const movRef = doc(collection(db, 'movimientos'));
  const fecha = new Date().toISOString();

  const nuevoStock = await runTransaction(db, async (tx) => {
    const snap = await tx.get(prodRef);
    if (!snap.exists()) throw new Error('El producto seleccionado no existe');
    const p = snap.data();
    const actual = Math.trunc(Number(p.stock) || 0);
    let nuevo = actual;

    if (isEntrada) {
      nuevo = actual + cantidad;
    } else {
      if (cantidad > actual) {
        throw new Error(`No hay suficiente stock. Disponible: ${actual}, Solicitado: ${cantidad}`);
      }
      nuevo = actual - cantidad;
    }

    const precio = Number(p.precio) || Math.round(Number(p.precioCentavos || 0)) / 100;
    const stockMinimo = Number.isFinite(p.stockMinimo) ? Math.trunc(Number(p.stockMinimo)) : 5;

    tx.update(prodRef, {
      nombre: p.nombre,
      precio,
      precioCentavos: Math.round(precio * 100),
      stock: nuevo,
      stockMinimo,
      lastMovementId: movRef.id,
    });

    tx.set(movRef, {
      productoId: input.productoId,
      nombre: p.nombre,
      nombreProducto: p.nombre,
      codigoProducto: p.codigo || '',
      tipo: tipoGuardar,
      cantidad,
      stockAnterior: actual,
      stockResultante: nuevo,
      nota: motivo,
      motivo,
      usuarioId: who.id,
      usuario: who.nombre,
      fecha,
    });

    return nuevo;
  });

  return { id: movRef.id, nuevoStock };
}

/* ----------------------------- FACTURACIÓN ----------------------------- */

export async function getInvoices(): Promise<InvoiceItem[]> {
  const snap = await getDocs(collection(db, 'facturas'));
  const list = snap.docs.map((d) => {
    const data = d.data();
    const rawItems = Array.isArray(data.items) ? data.items : [];
    const items: InvoiceLine[] = rawItems.map((it: Record<string, unknown>) => {
      const cents = Number.isFinite(it.precioCentavos)
        ? Number(it.precioCentavos)
        : Math.round(Number(it.precioUnitario || 0) * 100);
      const qty = Math.trunc(Number(it.cantidad) || 0);
      const subCents = Number.isFinite(it.subtotalCentavos) ? Number(it.subtotalCentavos) : cents * qty;
      return {
        productoId: String(it.productoId || ''),
        nombre: String(it.nombre || 'Producto'),
        cantidad: qty,
        precioUnitario: cents / 100,
        precioCentavos: cents,
        subtotal: subCents / 100,
        subtotalCentavos: subCents,
      };
    });

    const isCents =
      rawItems.some((it: Record<string, unknown>) => Number.isFinite(it?.precioCentavos)) ||
      Number(data.total) > 1000;
    const scale = isCents ? 100 : 1;
    const subtotal = (Number(data.subtotal) || 0) / scale;
    const iva = (Number(data.iva) || 0) / scale;
    const total = (Number(data.total) || 0) / scale;

    return {
      id: d.id,
      numero: data.numero || `MELY-${d.id.slice(0, 6).toUpperCase()}`,
      cliente: data.cliente || 'Consumidor final',
      items,
      subtotal,
      iva,
      total,
      fecha: toIso(data.fecha),
      usuario: data.usuario || 'Facturador',
      usuarioId: data.usuarioId || '',
    };
  });

  list.sort((a, b) => b.fecha.localeCompare(a.fecha));
  return list;
}

export async function createInvoice(
  input: {
    cliente?: string;
    items: Array<{ productoId: string; cantidad: number }>;
  },
  actor?: Actor
): Promise<InvoiceItem> {
  const who = resolveActor(actor);
  const cliente = String(input.cliente || 'Consumidor final').trim() || 'Consumidor final';

  const grouped = new Map<string, number>();
  for (const item of input.items || []) {
    const qty = Math.trunc(Number(item.cantidad) || 0);
    if (!item.productoId || qty <= 0) continue;
    grouped.set(item.productoId, (grouped.get(item.productoId) || 0) + qty);
  }
  if (grouped.size === 0) {
    throw new Error('Agrega al menos un producto válido a la factura');
  }

  const existingInvoices = await getDocs(collection(db, 'facturas'));
  const invoiceRef = doc(collection(db, 'facturas'));
  const entries = [...grouped.entries()];
  const productRefs = entries.map(([productoId]) => doc(db, 'productos', productoId));
  const movementRefs = entries.map(() => doc(collection(db, 'movimientos')));
  const numero = `MELY-${String(existingInvoices.size + 1).padStart(6, '0')}`;
  const fecha = new Date().toISOString();

  let createdInvoice: InvoiceItem | null = null;

  await runTransaction(db, async (tx) => {
    const productSnaps = await Promise.all(productRefs.map((ref) => tx.get(ref)));

    const lines: Array<{
      productoId: string;
      nombre: string;
      codigo: string;
      stockActual: number;
      cantidad: number;
      precioCentavos: number;
      precioUnitario: number;
      subtotalCentavos: number;
      subtotal: number;
    }> = [];

    entries.forEach(([productoId, cantidad], idx) => {
      const snap = productSnaps[idx];
      if (!snap.exists() || snap.data().activo === false) {
        throw new Error('Uno de los productos seleccionados ya no está disponible');
      }
      const p = snap.data();
      const stockActual = Math.trunc(Number(p.stock) || 0);
      if (cantidad > stockActual) {
        throw new Error(
          `Stock insuficiente para "${p.nombre}". Disponible: ${stockActual}, solicitado: ${cantidad}`
        );
      }
      const cents = Number.isFinite(p.precioCentavos)
        ? Math.round(Number(p.precioCentavos))
        : Math.round(Number(p.precio || 0) * 100);
      const subCents = cents * cantidad;
      lines.push({
        productoId,
        nombre: p.nombre || 'Producto',
        codigo: p.codigo || '',
        stockActual,
        cantidad,
        precioCentavos: cents,
        precioUnitario: cents / 100,
        subtotalCentavos: subCents,
        subtotal: subCents / 100,
      });
    });

    const subtotalCentavos = lines.reduce((acc, l) => acc + l.subtotalCentavos, 0);
    const ivaCentavos = Math.round((subtotalCentavos * 13) / 100);
    const totalCentavos = subtotalCentavos + ivaCentavos;

    lines.forEach((line, index) => {
      const nuevoStock = line.stockActual - line.cantidad;
      tx.update(productRefs[index], {
        stock: nuevoStock,
        lastMovementId: movementRefs[index].id,
      });

      tx.set(movementRefs[index], {
        productoId: line.productoId,
        nombre: line.nombre,
        nombreProducto: line.nombre,
        codigoProducto: line.codigo,
        tipo: 'Salida',
        cantidad: line.cantidad,
        stockAnterior: line.stockActual,
        stockResultante: nuevoStock,
        facturaId: invoiceRef.id,
        itemIndex: index,
        nota: `Venta ${numero}`,
        motivo: `Venta ${numero} (${cliente})`,
        usuario: who.nombre,
        usuarioId: who.id,
        fecha,
      });
    });

    const firestoreDoc = {
      id: invoiceRef.id,
      numero,
      cliente,
      items: lines.map((l) => ({
        productoId: l.productoId,
        nombre: l.nombre,
        cantidad: l.cantidad,
        precioCentavos: l.precioCentavos,
        subtotalCentavos: l.subtotalCentavos,
      })),
      subtotal: subtotalCentavos,
      iva: ivaCentavos,
      total: totalCentavos,
      fecha,
      usuario: who.nombre,
      usuarioId: who.id,
    };

    tx.set(invoiceRef, firestoreDoc);

    createdInvoice = {
      id: invoiceRef.id,
      numero,
      cliente,
      items: lines.map((l) => ({
        productoId: l.productoId,
        nombre: l.nombre,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
        precioCentavos: l.precioCentavos,
        subtotal: l.subtotal,
        subtotalCentavos: l.subtotalCentavos,
      })),
      subtotal: subtotalCentavos / 100,
      iva: ivaCentavos / 100,
      total: totalCentavos / 100,
      fecha,
      usuario: who.nombre,
      usuarioId: who.id,
    };
  });

  if (!createdInvoice) throw new Error('No se pudo emitir la factura');
  return createdInvoice;
}

/* -------------------------- DASHBOARD Y REPORTES -------------------------- */

export async function getDashboard() {
  const [products, recentMovements, invoices] = await Promise.all([
    getProducts(),
    getMovements(8).catch(() => [] as MovementItem[]),
    getInvoices().catch(() => [] as InvoiceItem[]),
  ]);

  let totalStockUnits = 0;
  let totalInventoryValue = 0;
  const lowStockItems: ProductItem[] = [];
  const categoryMap: Record<string, { count: number; totalStock: number }> = {};

  for (const p of products) {
    const stock = Number(p.stock) || 0;
    const precio = Number(p.precio) || 0;
    const cat = (p.categoria || '').trim() || 'General';
    totalStockUnits += stock;
    totalInventoryValue += stock * precio;
    if (stock <= (p.stockMinimo || 5)) lowStockItems.push(p);
    categoryMap[cat] = categoryMap[cat] || { count: 0, totalStock: 0 };
    categoryMap[cat].count += 1;
    categoryMap[cat].totalStock += stock;
  }
  lowStockItems.sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0));

  const today = localDay(new Date());
  const salesToday = invoices
    .filter((inv) => localDay(inv.fecha) === today)
    .reduce((acc, inv) => acc + inv.total, 0);

  // Ventas de los últimos 7 días calendario
  const days = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const fecha = localDay(d);
    const label = d.toLocaleDateString('es-SV', { day: '2-digit', month: 'short' });
    return { fecha, label, total: 0, facturasCount: 0 };
  });

  const soldMap = new Map<string, { productoId: string; nombre: string; cantidad: number; ingresos: number }>();
  const namesMap = new Map(products.map((p) => [p.id, p.nombre]));

  for (const inv of invoices) {
    const dayEntry = days.find((d) => d.fecha === localDay(inv.fecha));
    if (dayEntry) {
      dayEntry.total = Number((dayEntry.total + inv.total).toFixed(2));
      dayEntry.facturasCount += 1;
    }
    for (const line of inv.items) {
      const current = soldMap.get(line.productoId) || {
        productoId: line.productoId,
        nombre: namesMap.get(line.productoId) || line.nombre || 'Producto',
        cantidad: 0,
        ingresos: 0,
      };
      current.cantidad += line.cantidad;
      current.ingresos = Number((current.ingresos + line.subtotal).toFixed(2));
      soldMap.set(line.productoId, current);
    }
  }

  const topSoldProducts = [...soldMap.values()]
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 6);

  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.total, 0);

  return {
    totalProducts: products.length,
    totalStockUnits,
    totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
    lowStockCount: lowStockItems.length,
    lowStockItems: lowStockItems.slice(0, 6),
    categories: Object.entries(categoryMap).map(([name, d]) => ({
      name,
      productsCount: d.count,
      totalStock: d.totalStock,
    })),
    recentMovements,
    salesToday: Number(salesToday.toFixed(2)),
    totalInvoices: invoices.length,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    salesByDay: days,
    topSoldProducts,
    recentInvoices: invoices.slice(0, 6),
  };
}

/* ------------------------------- USUARIOS ------------------------------- */

export async function getUsers() {
  const snap = await getDocs(collection(db, 'usuarios'));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      nombre: data.nombre || 'Sin nombre',
      email: data.email || 'Sin correo',
      rol: data.rol || 'Empleado',
      proveedor: data.proveedor || 'password',
      fechaCreacion: data.fechaCreacion || null,
    };
  });
}

export async function createUserAsAdmin(data: {
  nombre: string;
  email: string;
  password: string;
  rol: 'Administrador' | 'Empleado' | 'Facturador';
}) {
  const name = `secondary-${Date.now()}`;
  const secondary = initializeApp(firebaseConfig, name);
  try {
    const sAuth = getAuth(secondary);
    const cleanEmail = data.email.trim().toLowerCase();
    const cred = await createUserWithEmailAndPassword(sAuth, cleanEmail, data.password);
    await updateProfile(cred.user, { displayName: data.nombre.trim() });
    await setDoc(doc(db, 'usuarios', cred.user.uid), {
      nombre: data.nombre.trim(),
      usuario: cleanEmail.split('@')[0].replace(/[^a-z0-9._-]/g, ''),
      email: cleanEmail,
      rol: data.rol,
      proveedor: 'password',
      fechaCreacion: serverTimestamp(),
    });
    await signOut(sAuth);
  } finally {
    await deleteApp(secondary);
  }
}
