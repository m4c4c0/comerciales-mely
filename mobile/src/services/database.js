import * as Crypto from "expo-crypto";
import { Platform, TurboModuleRegistry } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
  runTransaction,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import {
  seedProducts,
  transition,
  parse,
  loginSchema,
  registerSchema,
  normalizeAuthUser,
} from "../domain/business.mjs";
import { auth, db, GOOGLE_WEB_CLIENT_ID } from "./firebase";

/*
 * Capa de datos con Firebase (reemplaza la persistencia local en SQLite).
 *  - Autenticación: Firebase Authentication (correo/contraseña y Google).
 *  - Datos: Cloud Firestore, compartidos con la web (colecciones usuarios,
 *    productos, movimientos y facturas). Cada movimiento/factura guarda el
 *    usuarioId (uid) del usuario autenticado que la realizó.
 * La API exportada es la misma que usaba AppContext (load, login, register...).
 */

const ROL_ETIQUETA = {
  administrador: "Administrador",
  empleado: "Empleado",
  facturador: "Facturador",
};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ----------------------------- utilidades ----------------------------- */

function traducir(error) {
  const code = error?.code || "";
  const map = {
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/wrong-password": "Correo o contraseña incorrectos.",
    "auth/user-not-found": "Correo o contraseña incorrectos.",
    "auth/invalid-email": "El correo no tiene un formato válido.",
    "auth/email-already-in-use": "Ya existe una cuenta con este correo.",
    "auth/weak-password": "La contraseña es demasiado débil (mínimo 6 caracteres).",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
    "auth/network-request-failed": "Sin conexión con Firebase. Revisa tu internet.",
    "auth/operation-not-allowed":
      "Este método de acceso no está habilitado en Firebase Console.",
    "permission-denied":
      "Firestore rechazó la operación (reglas de seguridad). Verifica que las reglas estén publicadas.",
    unavailable: "Firestore no está disponible. Revisa tu conexión.",
  };
  return new Error(map[code] || error?.message || "Error inesperado.");
}

async function guard(fn) {
  try {
    return await fn();
  } catch (e) {
    throw e?.code ? traducir(e) : e;
  }
}

const iso = (v) =>
  v && typeof v.toDate === "function" ? v.toDate().toISOString() : v || "";

/* --------------------------- mapeo de documentos --------------------------- */

function fromProduct(snap) {
  const d = snap.data();
  return {
    id: snap.id,
    codigo: d.codigo || "",
    nombre: d.nombre || "",
    categoria: d.categoria || "General",
    precioCentavos: Number.isFinite(d.precioCentavos)
      ? d.precioCentavos
      : Math.round(Number(d.precio || 0) * 100),
    stock: Number(d.stock) || 0,
    stockMinimo: Number.isFinite(d.stockMinimo) ? d.stockMinimo : 5,
    imagenUrl: d.imagenUrl || "",
    imagenKey: d.imagenKey,
    activo: d.activo !== false,
  };
}

const clean = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

function toProductDoc(p) {
  return clean({
    nombre: p.nombre,
    codigo: p.codigo || `MELY-${String(p.id).slice(0, 6).toUpperCase()}`,
    categoria: p.categoria,
    // Campos compatibles con la web (precio en dólares) y propios de la app móvil.
    precio: p.precioCentavos / 100,
    precioCentavos: p.precioCentavos,
    stock: p.stock,
    stockMinimo: p.stockMinimo,
    imagenUrl: p.imagenUrl || "",
    imagenKey: p.imagenKey,
    activo: p.activo !== false,
  });
}

function fromMovement(snap) {
  const d = snap.data();
  const tipo = String(d.tipo || "").toLowerCase();
  return {
    id: snap.id,
    productoId: d.productoId || "",
    nombre: d.nombre || d.nombreProducto || "",
    tipo: tipo.startsWith("entrada") ? "entrada" : "salida",
    cantidad: Number(d.cantidad) || 0,
    nota: d.nota || d.motivo || "",
    usuario: d.usuario || "Sistema",
    fecha: iso(d.fecha),
  };
}

function toMovementDoc(m, uid) {
  return {
    productoId: m.productoId,
    nombre: m.nombre,
    nombreProducto: m.nombre,
    tipo: m.tipo === "entrada" ? "Entrada" : "Salida",
    cantidad: m.cantidad,
    nota: m.nota,
    motivo: m.nota,
    usuario: m.usuario,
    usuarioId: uid,
    fecha: m.fecha,
  };
}

function fromInvoice(snap) {
  const d = snap.data();
  return {
    id: snap.id,
    numero: d.numero,
    cliente: d.cliente,
    items: d.items || [],
    subtotal: d.subtotal,
    iva: d.iva,
    total: d.total,
    fecha: iso(d.fecha),
    usuario: d.usuario,
  };
}

/* -------------------------------- perfil -------------------------------- */

async function loadProfile(fbUser, rolInicial = "Empleado", nombreInicial) {
  const ref = doc(db, "usuarios", fbUser.uid);
  const snap = await getDoc(ref);
  let data;
  if (snap.exists()) {
    data = snap.data();
  } else {
    data = {
      nombre:
        nombreInicial ||
        fbUser.displayName ||
        (fbUser.email || "Usuario").split("@")[0],
      email: (fbUser.email || "").toLowerCase(),
      usuario: (fbUser.email || "").split("@")[0].toLowerCase(),
      rol: rolInicial,
      proveedor: fbUser.providerData?.[0]?.providerId || "password",
    };
    await setDoc(ref, { ...data, fechaCreacion: serverTimestamp() });
  }
  return normalizeAuthUser({
    id: fbUser.uid,
    nombre: data.nombre || fbUser.displayName || fbUser.email,
    usuario: data.email || fbUser.email || data.usuario,
    email: data.email || fbUser.email,
    rol: data.rol || "Empleado",
  });
}

/* --------------------------------- datos --------------------------------- */

async function readState() {
  let prodSnap = await getDocs(collection(db, "productos"));
  if (prodSnap.empty) {
    // Primera ejecución sobre una base vacía: se cargan los productos de ejemplo.
    const batch = writeBatch(db);
    for (const p of seedProducts())
      batch.set(doc(db, "productos", p.id), {
        ...toProductDoc(p),
        fechaCreacion: serverTimestamp(),
      });
    await batch.commit();
    prodSnap = await getDocs(collection(db, "productos"));
  }
  const productos = prodSnap.docs
    .map(fromProduct)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const [movSnap, facSnap] = await Promise.all([
    getDocs(query(collection(db, "movimientos"), orderBy("fecha", "desc"), limit(300))),
    getDocs(query(collection(db, "facturas"), orderBy("fecha", "desc"))),
  ]);
  return {
    productos,
    movimientos: movSnap.docs.map(fromMovement),
    facturas: facSnap.docs.map(fromInvoice),
  };
}

function currentFirebaseUser() {
  const u = auth.currentUser;
  if (!u) throw new Error("Tu sesión caducó. Inicia sesión nuevamente.");
  return u;
}

/* ------------------------------ API pública ------------------------------ */

export async function load() {
  return guard(async () => {
    await auth.authStateReady();
    const fb = auth.currentUser;
    if (!fb) return null;
    const user = await loadProfile(fb);
    return { user, state: await readState() };
  });
}

export async function refresh() {
  return guard(async () => {
    currentFirebaseUser();
    return readState();
  });
}

async function establish(fb, rolInicial, nombreInicial) {
  const user = await loadProfile(fb, rolInicial, nombreInicial);
  return { user, state: await readState() };
}

export async function login(data) {
  return guard(async () => {
    const input = parse(loginSchema, data);
    if (!emailRegex.test(input.usuario))
      throw new Error("Ingresa tu correo electrónico completo.");
    const cred = await signInWithEmailAndPassword(auth, input.usuario, input.password);
    const result = await establish(cred.user);
    if (data.expectedRole && data.expectedRole !== result.user.rol) {
      await signOut(auth);
      throw new Error("El perfil seleccionado no corresponde a esta cuenta.");
    }
    return result;
  });
}

export async function register(data) {
  return guard(async () => {
    const input = parse(registerSchema, data);
    const email = String(data.email || "").trim().toLowerCase();
    if (!emailRegex.test(email))
      throw new Error("Ingresa un correo electrónico válido.");
    const cred = await createUserWithEmailAndPassword(auth, email, input.password);
    await updateProfile(cred.user, { displayName: input.nombre });
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      nombre: input.nombre,
      email,
      usuario: input.usuario,
      rol: ROL_ETIQUETA[input.rol],
      proveedor: "password",
      fechaCreacion: serverTimestamp(),
    });
    return establish(cred.user);
  });
}

async function googleIdToken() {
  if (!TurboModuleRegistry.get("RNGoogleSignin")) {
    throw new Error(
      "En Expo Go no está disponible el módulo nativo de Google. Para probar Google usa el navegador (npm run web) o instala el APK compilado.",
    );
  }
  if (!GOOGLE_WEB_CLIENT_ID)
    throw new Error(
      "Falta configurar EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (ver mobile/FIREBASE.md).",
    );
  const { GoogleSignin } = require("@react-native-google-signin/google-signin");
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const res = await GoogleSignin.signIn();
  const idToken = res?.data?.idToken ?? res?.idToken;
  if (!idToken) throw new Error("Se canceló el inicio de sesión con Google.");
  return idToken;
}

export async function loginGoogle() {
  return guard(async () => {
    if (Platform.OS === "web") {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const cred = await signInWithPopup(auth, provider);
      return establish(cred.user);
    }
    const idToken = await googleIdToken();
    const cred = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
    return establish(cred.user);
  });
}

export async function resetPassword(email) {
  return guard(async () => {
    const clean = String(email || "").trim().toLowerCase();
    if (!emailRegex.test(clean))
      throw new Error("Escribe tu correo electrónico en el campo de usuario.");
    await sendPasswordResetEmail(auth, clean);
  });
}

export async function logout() {
  try {
    if (Platform.OS !== "web" && TurboModuleRegistry.get("RNGoogleSignin")) {
      const mod = require("@react-native-google-signin/google-signin");
      await mod.GoogleSignin.signOut();
    }
  } catch {
    // Sin sesión de Google o módulo nativo no disponible.
  }
  await signOut(auth);
}

/**
 * Aplica una operación de negocio (producto, movimiento, venta). Las reglas de
 * permisos y validaciones viven en business.mjs (transition). La escritura en
 * Firestore usa una transacción que verifica que el stock no haya cambiado
 * desde otro dispositivo mientras tanto.
 */
export async function mutate(action, input) {
  return guard(async () => {
    const fb = currentFirebaseUser();
    const user = await loadProfile(fb);
    const before = await readState();
    const next = transition(before, user, action, input, Crypto.randomUUID());

    const prevById = new Map(before.productos.map((p) => [p.id, p]));
    const changed = next.productos.filter(
      (p) => JSON.stringify(p) !== JSON.stringify(prevById.get(p.id)),
    );
    const prevMov = new Set(before.movimientos.map((m) => m.id));
    const prevFac = new Set(before.facturas.map((f) => f.id));
    const newMovs = next.movimientos.filter((m) => !prevMov.has(m.id));
    const newFacs = next.facturas.filter((f) => !prevFac.has(f.id));

    await runTransaction(db, async (tx) => {
      // Lecturas primero: se verifica que los productos existentes no cambiaron.
      for (const p of changed) {
        const old = prevById.get(p.id);
        if (!old) continue;
        const fresh = await tx.get(doc(db, "productos", p.id));
        if (!fresh.exists()) throw new Error("El producto ya no existe.");
        const f = fromProduct(fresh);
        if (f.stock !== old.stock || f.activo !== old.activo)
          throw new Error(
            "Los datos cambiaron desde otro dispositivo. Actualiza e inténtalo de nuevo.",
          );
      }
      for (const p of changed) {
        const isNew = !prevById.has(p.id);
        tx.set(
          doc(db, "productos", p.id),
          isNew
            ? { ...toProductDoc(p), creadoPorId: fb.uid, creadoPor: user.nombre, fechaCreacion: serverTimestamp() }
            : toProductDoc(p),
          { merge: true },
        );
      }
      for (const m of newMovs)
        tx.set(doc(db, "movimientos", m.id), toMovementDoc(m, fb.uid));
      for (const f of newFacs)
        tx.set(doc(db, "facturas", f.id), { ...f, usuarioId: fb.uid });
    });
    return next;
  });
}
