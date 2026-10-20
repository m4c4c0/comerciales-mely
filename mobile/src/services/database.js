import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import bcrypt from "bcryptjs";
import {
  seedProducts,
  transition,
  parse,
  loginSchema,
  registerSchema,
} from "../domain/business.mjs";
bcrypt.setRandomFallback((length) => Array.from(Crypto.getRandomBytes(length)));
let ready;
let queue = Promise.resolve();
const key = "mely.session.v1";
const publicUser = ({ passwordHash, ...user }) => user;
async function init() {
  const db = await SQLite.openDatabaseAsync("comerciales-mely-v1.db");
  await db.execAsync(
    "PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK(id=1), payload TEXT NOT NULL);",
  );
  const row = await db.getFirstAsync(
    "SELECT payload FROM app_state WHERE id=1",
  );
  if (!row) {
    const usuarios = [];
    for (const [usuario, password, nombre, rol] of [
      ["admin", "admin123", "Edwin Cerón", "administrador"],
      ["empleado", "empleado123", "María Pérez", "empleado"],
      ["facturador", "factura123", "Carlos Ramírez", "facturador"],
    ])
      usuarios.push({
        id: Crypto.randomUUID(),
        usuario,
        nombre,
        rol,
        passwordHash: await bcrypt.hash(password, 10),
      });
    const initial = {
      usuarios,
      productos: seedProducts(),
      movimientos: [],
      facturas: [],
      sessions: [],
    };
    await db.runAsync(
      "INSERT OR IGNORE INTO app_state(id,payload) VALUES(1,?)",
      JSON.stringify(initial),
    );
  }
  return db;
}
function database() {
  if (!ready)
    ready = init().catch((e) => {
      ready = null;
      throw e;
    });
  return ready;
}
async function read(db) {
  return JSON.parse(
    (await db.getFirstAsync("SELECT payload FROM app_state WHERE id=1"))
      .payload,
  );
}
// Serialize all writes and use SQLite's exclusive transaction for stock, audit and invoice.
function update(callback) {
  const operation = queue.then(async () => {
    const db = await database();
    let result;
    await db.withExclusiveTransactionAsync(async (tx) => {
      const state = await read(tx);
      const changed = await callback(state);
      await tx.runAsync(
        "UPDATE app_state SET payload=? WHERE id=1",
        JSON.stringify(changed.state),
      );
      result = changed.result;
    });
    return result;
  });
  queue = operation.catch(() => {});
  return operation;
}
function sessionUser(state, token) {
  const session = state.sessions.find(
    (s) => s.token === token && s.expires > Date.now(),
  );
  const user = session && state.usuarios.find((u) => u.id === session.userId);
  if (!user) throw new Error("Tu sesión caducó. Inicia sesión nuevamente.");
  return user;
}
export async function load() {
  const token = await SecureStore.getItemAsync(key);
  if (!token) return null;
  const db = await database();
  const state = await read(db);
  try {
    return {
      user: publicUser(sessionUser(state, token)),
      state: snapshot(state),
    };
  } catch {
    await SecureStore.deleteItemAsync(key);
    return null;
  }
}
function snapshot(state) {
  return {
    productos: state.productos,
    movimientos: state.movimientos,
    facturas: state.facturas,
  };
}
export async function refresh() {
  const token = await SecureStore.getItemAsync(key);
  const db = await database();
  const state = await read(db);
  sessionUser(state, token);
  return snapshot(state);
}
async function establish(user) {
  const token = Crypto.randomUUID() + Crypto.randomUUID();
  const result = await update((state) => {
    state.sessions = state.sessions.filter((s) => s.expires > Date.now());
    state.sessions.push({
      token,
      userId: user.id,
      expires: Date.now() + 8 * 60 * 60 * 1000,
    });
    return {
      state,
      result: { user: publicUser(user), state: snapshot(state) },
    };
  });
  await SecureStore.setItemAsync(key, token);
  return result;
}
export async function login(data) {
  const input = parse(loginSchema, data);
  const state = await read(await database());
  const user = state.usuarios.find(
    (u) =>
      u.usuario.toLowerCase() === input.usuario.toLowerCase() ||
      {
        admin: "administrador@mely.com",
        empleado: "empleado@mely.com",
        facturador: "facturador@mely.com",
      }[u.usuario] === input.usuario.toLowerCase(),
  );
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash)))
    throw new Error("Usuario o contraseña incorrectos.");
  if (data.expectedRole && data.expectedRole !== user.rol)
    throw new Error("El perfil seleccionado no corresponde a esta cuenta.");
  return establish(user);
}
export async function register(data) {
  const input = parse(registerSchema, data);
  const user = {
    id: Crypto.randomUUID(),
    nombre: input.nombre,
    usuario: input.usuario,
    rol: input.rol,
    passwordHash: await bcrypt.hash(input.password, 10),
  };
  await update((state) => {
    if (
      state.usuarios.some(
        (u) => u.usuario.toLowerCase() === user.usuario.toLowerCase(),
      )
    )
      throw new Error("Ese usuario ya está registrado.");
    state.usuarios.push(user);
    return { state, result: null };
  });
  return establish(user);
}
export async function logout() {
  const token = await SecureStore.getItemAsync(key);
  await update((state) => {
    state.sessions = state.sessions.filter((s) => s.token !== token);
    return { state, result: null };
  });
  await SecureStore.deleteItemAsync(key);
}
export async function mutate(action, input) {
  const token = await SecureStore.getItemAsync(key);
  return update((state) => {
    const user = sessionUser(state, token);
    const next = transition(state, user, action, input, Crypto.randomUUID());
    return { state: next, result: snapshot(next) };
  });
}
