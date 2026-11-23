import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { ensureUserProfile, registerWithProfile } from '../lib/firebase-profile.mjs';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';

let environment;
before(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'demo-mely-rules',
    firestore: { host: '127.0.0.1', port: 8089, rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8') },
  });
});
after(async () => { await environment?.cleanup(); });
beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      ...Object.entries({ admin: 'Administrador', empleado: 'Empleado', caja: 'Facturador' })
        .map(([uid, rol]) => setDoc(doc(db, 'usuarios', uid), { nombre: uid, rol })),
      setDoc(doc(db, 'productos', 'p1'), { nombre: 'Producto QA', precio: 10, precioCentavos: 1000, stock: 10, stockMinimo: 2, activo: true }),
    ]);
  });
});

function dbFor(uid) { return environment.authenticatedContext(uid).firestore(); }
test('dos accesos simultáneos crean un único perfil Google sin elevar permisos', async () => {
  const user = { uid: 'google-nuevo', email: 'google@example.test', displayName: 'Prueba Google', providerData: [{ providerId: 'google.com' }] };
  const profiles = await Promise.all([
    ensureUserProfile(dbFor(user.uid), user),
    ensureUserProfile(dbFor(user.uid), user),
  ]);
  assert.deepEqual(profiles.map((profile) => profile.rol), ['Empleado', 'Empleado']);
  const saved = await getDoc(doc(dbFor(user.uid), 'usuarios', user.uid));
  assert.equal(saved.data().proveedor, 'google.com');
  assert.equal(saved.data().rol, 'Empleado');
});
test('el acceso conserva el rol del perfil existente', async () => {
  assert.equal((await ensureUserProfile(dbFor('admin'), { uid: 'admin' })).rol, 'Administrador');
});
test('el observador espera al perfil del registro por correo y conserva sus datos', async () => {
  const user = { uid: 'nuevo-correo', email: 'registro@example.test' };
  const db = dbFor(user.uid);
  let observed;
  await registerWithProfile(async () => {
    observed = ensureUserProfile(db, user);
    await setDoc(doc(db, 'usuarios', user.uid), { nombre: 'Nombre del formulario', rol: 'Facturador', email: user.email });
  });
  const profile = await observed;
  assert.equal(profile.nombre, 'Nombre del formulario');
  assert.equal(profile.rol, 'Facturador');
});
function sale(uid, overrides = {}) {
  const db = dbFor(uid);
  const batch = writeBatch(db);
  batch.update(doc(db, 'productos', 'p1'), { stock: 9, lastMovementId: 'm1', ...overrides.product });
  batch.set(doc(db, 'movimientos', 'm1'), {
    productoId: 'p1', tipo: 'Salida', cantidad: 1, usuarioId: uid, facturaId: 'f1', itemIndex: 0, ...overrides.movement,
  });
  if (!overrides.skipInvoice) batch.set(doc(db, 'facturas', 'f1'), {
    usuarioId: uid, subtotal: 1000, iva: 130, total: 1130,
    items: [{ productoId: 'p1', cantidad: 1, precioCentavos: 1000 }], ...overrides.invoice,
  });
  return batch.commit();
}
function entry(uid) {
  const db = dbFor(uid);
  const batch = writeBatch(db);
  batch.update(doc(db, 'productos', 'p1'), { stock: 12, lastMovementId: 'entrada' });
  batch.set(doc(db, 'movimientos', 'entrada'), { productoId: 'p1', tipo: 'Entrada', cantidad: 2, usuarioId: uid });
  return batch.commit();
}

test('administrador puede registrar entradas y sus existencias', async () => { await assertSucceeds(entry('admin')); });
test('empleado puede registrar entradas y sus existencias', async () => { await assertSucceeds(entry('empleado')); });
test('facturador puede facturar y descontar stock en la misma operación', async () => { await assertSucceeds(sale('caja')); });
test('administrador conserva la facturación', async () => { await assertSucceeds(sale('admin')); });
test('facturador no puede editar stock sin movimiento', async () => {
  await assertFails(updateDoc(doc(dbFor('caja'), 'productos', 'p1'), { stock: 9 }));
});
test('facturador no puede registrar entradas manuales', async () => { await assertFails(entry('caja')); });
test('facturador no puede editar el precio dentro de una venta', async () => { await assertFails(sale('caja', { product: { precio: 1 } })); });
test('facturador no puede descontar stock sin factura nueva', async () => { await assertFails(sale('caja', { skipInvoice: true })); });
test('una factura anterior no autoriza otro descuento de stock', async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'facturas', 'f1'), { usuarioId: 'caja', items: [{ productoId: 'p1', cantidad: 1 }] });
  });
  await assertFails(sale('caja', { skipInvoice: true }));
});
test('la factura puede descontar dos productos distintos en el mismo lote', async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'productos', 'p2'), { nombre: 'Segundo QA', precio: 5, precioCentavos: 500, stock: 5, stockMinimo: 1 });
  });
  const db = dbFor('caja'), batch = writeBatch(db);
  const items = [{ productoId: 'p1', cantidad: 1, precioCentavos: 1000 }, { productoId: 'p2', cantidad: 2, precioCentavos: 500 }];
  for (const [index, item] of items.entries()) {
    const movementId = `multi-${index}`;
    batch.update(doc(db, 'productos', item.productoId), { stock: index === 0 ? 9 : 3, lastMovementId: movementId });
    batch.set(doc(db, 'movimientos', movementId), { ...item, tipo: 'Salida', usuarioId: 'caja', facturaId: 'multi', itemIndex: index });
  }
  batch.set(doc(db, 'facturas', 'multi'), { usuarioId: 'caja', subtotal: 2000, iva: 260, total: 2260, items });
  await assertSucceeds(batch.commit());
});
test('facturador no puede vincular una factura de otro usuario', async () => { await assertFails(sale('caja', { invoice: { usuarioId: 'admin' } })); });
test('el descuento debe coincidir con la cantidad facturada', async () => {
  await assertFails(sale('caja', { invoice: { items: [{ productoId: 'p1', cantidad: 2 }] } }));
});
test('la venta no permite stock negativo', async () => { await assertFails(sale('caja', { product: { stock: -1 }, movement: { cantidad: 11 }, invoice: { items: [{ productoId: 'p1', cantidad: 11 }] } })); });
test('empleado no puede facturar', async () => { await assertFails(sale('empleado')); });
test('un usuario no puede autoasignarse Administrador', async () => {
  await assertFails(updateDoc(doc(dbFor('caja'), 'usuarios', 'caja'), { rol: 'Administrador' }));
});
test('un visitante sin sesión no puede leer productos', async () => {
  await assertFails(getDoc(doc(environment.unauthenticatedContext().firestore(), 'productos', 'p1')));
});
