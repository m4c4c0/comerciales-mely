import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Opt-in acceptance test: writes one sale to the explicitly named QA product.
// Only platform bindings are substituted. database.js and business.mjs run intact;
// Authentication, Firestore and production security rules remain real.
test('mobile data adapter: email, roles, shared stock and atomic sale', {
  skip: !process.env.MELY_QA_ACCOUNT_FILE,
  timeout: 90000,
}, async () => {
  process.loadEnvFile(new URL('../.env', import.meta.url));
  assert.equal(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID, process.env.MELY_QA_PROJECT_ID || 'comerciales-mely');
  const account = JSON.parse(await readFile(process.env.MELY_QA_ACCOUNT_FILE, 'utf8'));
  const sdk = Object.fromEntries(['app', 'auth', 'firestore'].map((name) => [name, import.meta.resolve(`firebase/${name}`)]));
  const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  const config = Object.fromEntries(['apiKey', 'authDomain', 'projectId'].map((key) => [key, process.env[{
    apiKey: 'EXPO_PUBLIC_FIREBASE_API_KEY', authDomain: 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', projectId: 'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  }[key]]]));
  const firebaseUrl = moduleUrl(`
    import { initializeApp } from ${JSON.stringify(sdk.app)};
    import { getAuth } from ${JSON.stringify(sdk.auth)};
    import { getFirestore } from ${JSON.stringify(sdk.firestore)};
    const app = initializeApp(${JSON.stringify(config)}, 'mobile-adapter-qa');
    export const auth = getAuth(app), db = getFirestore(app), GOOGLE_WEB_CLIENT_ID = '';
  `);
  const filename = new URL('../src/services/database.js', import.meta.url);
  const source = (await readFile(filename, 'utf8'))
    .replace('import * as Crypto from "expo-crypto";', 'import * as Crypto from "node:crypto";')
    .replace('import { Platform, TurboModuleRegistry } from "react-native";', 'const Platform = { OS: "android" }, TurboModuleRegistry = { get: () => null };')
    .replace('"../domain/business.mjs"', JSON.stringify(new URL('../src/domain/business.mjs', import.meta.url).href))
    .replace('"./firebase"', JSON.stringify(firebaseUrl))
    .replace('"firebase/auth"', JSON.stringify(sdk.auth))
    .replace('"firebase/firestore"', JSON.stringify(sdk.firestore));
  const mobile = await import(moduleUrl(source));
  const { auth, db } = await import(firebaseUrl);
  const { getDocFromServer, doc, terminate } = await import(sdk.firestore);
  const { deleteApp } = await import(sdk.app);
  try {
    const productName = 'QA original web movil 20261122';
    if (process.env.MELY_QA_EMPLOYEE_FILE) {
      const employee = JSON.parse(await readFile(process.env.MELY_QA_EMPLOYEE_FILE, 'utf8'));
      const employeeSession = await mobile.login({ usuario: employee.email, password: employee.password, expectedRole: 'empleado' });
      assert.equal(employeeSession.user.rol, 'empleado');
      let product = employeeSession.state.productos.find((p) => p.nombre === productName);
      if (!product) {
        const created = await mobile.mutate('product', { nombre: productName, categoria: 'Hogar', precio: 10, stock: 20, stockMinimo: 5 });
        product = created.productos.find((p) => p.nombre === productName);
        assert.equal(product.stock, 20);
        const entered = await mobile.mutate('movement', { productoId: product.id, tipo: 'entrada', cantidad: 5, nota: 'QA original entrada adaptador movil' });
        assert.equal(entered.productos.find((p) => p.id === product.id).stock, 25);
      }
      await assert.rejects(mobile.mutate('invoice', { cliente: 'QA rol empleado', items: [{ productoId: product.id, cantidad: 1 }] }), /permiso/);
      await mobile.logout();
    }
    await assert.rejects(mobile.login({ usuario: account.email, password: account.password, expectedRole: 'administrador' }), /perfil seleccionado/);
    assert.equal(auth.currentUser, null);
    const session = await mobile.login({ usuario: account.email, password: account.password, expectedRole: 'facturador' });
    assert.equal(session.user.rol, 'facturador');
    const product = session.state.productos.find((p) => p.nombre === productName);
    assert.ok(product?.stock > 1, 'Se requiere el producto exclusivo QA con existencias.');
    await assert.rejects(mobile.mutate('invoice', { cliente: 'QA stock insuficiente', items: [{ productoId: product.id, cantidad: product.stock + 1 }] }), /Stock insuficiente/);
    const state = await mobile.mutate('invoice', { cliente: 'QA adaptador movil Node', items: [{ productoId: product.id, cantidad: 1 }] });
    const invoice = state.facturas[0];
    assert.equal(invoice.total, 1130);
    assert.equal((await getDocFromServer(doc(db, 'productos', product.id))).data().stock, product.stock - 1);
    assert.equal((await getDocFromServer(doc(db, 'facturas', invoice.id))).data().cliente, 'QA adaptador movil Node');
    const refreshed = await mobile.refresh();
    assert.equal(refreshed.productos.find((p) => p.id === product.id).stock, product.stock - 1);
    assert.ok(refreshed.facturas.some((f) => f.id === invoice.id));
    console.log(JSON.stringify({ adapter: 'mobile/src/services/database.js', role: 'facturador', invoice: invoice.numero, stockBefore: product.stock, stockAfter: product.stock - 1, total: invoice.total }));
    await mobile.logout();
    assert.equal(await mobile.load(), null);
  } finally {
    await mobile.logout();
    await terminate(db);
    await deleteApp(auth.app);
  }
});
