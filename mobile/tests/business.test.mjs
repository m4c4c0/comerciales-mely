import test from "node:test";
import assert from "node:assert/strict";
import {
  transition,
  seedProducts,
  totals,
  report,
  allowed,
  parse,
  registerSchema,
  productSchema,
} from "../src/domain/business.mjs";
const admin = { id: "a", nombre: "Admin", rol: "administrador" },
  employee = { id: "e", nombre: "Empleado", rol: "empleado" },
  cashier = { id: "c", nombre: "Facturador", rol: "facturador" };
const store = () => ({
  productos: seedProducts(),
  movimientos: [],
  facturas: [],
});
test("role permissions protect reports and administrative actions", () => {
  const permissions = [
    [
      admin,
      {
        read: true,
        product: true,
        remove: true,
        movement: true,
        invoice: true,
        reports: true,
        users: true,
      },
    ],
    [
      employee,
      {
        read: true,
        product: true,
        remove: false,
        movement: true,
        invoice: false,
        reports: false,
        users: false,
      },
    ],
    [
      cashier,
      {
        read: true,
        product: false,
        remove: false,
        movement: false,
        invoice: true,
        reports: true,
        users: false,
      },
    ],
  ];

  for (const [user, actions] of permissions)
    for (const [action, expected] of Object.entries(actions))
      assert.equal(allowed(user, action), expected, `${user.rol}: ${action}`);

  assert.equal(allowed(null, "read"), false);
  assert.equal(allowed(admin, "unknown"), false);
});
test("invoice uses cents and rounds tax once", () => {
  assert.deepEqual(
    totals([
      { precioCentavos: 350, cantidad: 2 },
      { precioCentavos: 525, cantidad: 1 },
    ]),
    { subtotal: 1225, iva: 159, total: 1384 },
  );
});
test("sale changes stock, audit and invoice together without modifying original", () => {
  const original = store();
  const next = transition(
    original,
    cashier,
    "invoice",
    {
      cliente: "Cliente de prueba",
      items: [{ productoId: "p1", cantidad: 2 }],
    },
    "f1",
  );
  assert.equal(original.productos[0].stock, 42);
  assert.equal(next.productos[0].stock, 40);
  assert.equal(next.facturas[0].total, 791);
  assert.equal(next.movimientos[0].cantidad, 2);
});
test("aggregates repeated products before checking stock", () => {
  const original = store();
  assert.throws(
    () =>
      transition(
        original,
        admin,
        "invoice",
        {
          cliente: "Cliente",
          items: [
            { productoId: "p1", cantidad: 30 },
            { productoId: "p1", cantidad: 30 },
          ],
        },
        "f1",
      ),
    /Stock insuficiente/,
  );
  assert.equal(original.productos[0].stock, 42);
  assert.equal(original.facturas.length, 0);
});
test("invalid second line leaves all original stock intact", () => {
  const original = store();
  assert.throws(() =>
    transition(
      original,
      admin,
      "invoice",
      {
        cliente: "Cliente",
        items: [
          { productoId: "p1", cantidad: 2 },
          { productoId: "p2", cantidad: 99 },
        ],
      },
      "f1",
    ),
  );
  assert.equal(original.productos[0].stock, 42);
  assert.equal(original.movimientos.length, 0);
});
test("employee cannot invoice; cashier cannot mutate stock", () => {
  assert.throws(
    () =>
      transition(
        store(),
        employee,
        "invoice",
        { cliente: "Cliente", items: [{ productoId: "p1", cantidad: 1 }] },
        "x",
      ),
    /permiso/,
  );
  assert.throws(
    () =>
      transition(
        store(),
        cashier,
        "movement",
        { productoId: "p1", tipo: "entrada", cantidad: 1, nota: "Compra" },
        "x",
      ),
    /permiso/,
  );
});
test("rejects fractional, zero and excessive withdrawal quantities", () => {
  for (const cantidad of [0, -1, 1.5, 99999])
    assert.throws(() =>
      transition(
        store(),
        employee,
        "movement",
        { productoId: "p1", tipo: "salida", cantidad, nota: "Ajuste" },
        "x",
      ),
    );
});
test("public registration cannot elevate role to administrator", () => {
  assert.throws(() =>
    parse(registerSchema, {
      nombre: "Persona",
      usuario: "persona",
      password: "12345678",
      rol: "administrador",
    }),
  );
});
test("cannot change stock through product editing", () => {
  assert.throws(
    () =>
      transition(
        store(),
        admin,
        "product",
        {
          id: "p1",
          nombre: "Vasos",
          categoria: "Hogar",
          precio: 3.5,
          stock: 99,
          stockMinimo: 5,
        },
        "x",
      ),
    /Movimientos/,
  );
});
test("archive preserves history and blocks subsequent sales", () => {
  const original = store();
  const next = transition(original, admin, "remove", { id: "p1" }, "x");
  assert.equal(next.productos[0].activo, false);
  assert.throws(
    () =>
      transition(
        next,
        cashier,
        "invoice",
        { cliente: "Cliente", items: [{ productoId: "p1", cantidad: 1 }] },
        "x",
      ),
    /disponible/,
  );
});
test("report includes last 7 local calendar dates and sales", () => {
  const date = new Date(2026, 9, 18, 12);
  const state = transition(
    store(),
    admin,
    "invoice",
    { cliente: "Cliente", items: [{ productoId: "p1", cantidad: 1 }] },
    "f",
    date.toISOString(),
  );
  const r = report(state, date);
  assert.equal(r.days.length, 7);
  assert.equal(r.days[6].fecha, "2026-10-18");
  assert.equal(r.ventasHoy, 396);
  assert.equal(r.bajos.length, 5);
});
test("rejects blank names, missing prices and sub-cent amounts", () => {
  for (const precio of ["", 0, 0.001, -1])
    assert.throws(() =>
      parse(productSchema, {
        nombre: "Vasos",
        categoria: "Hogar",
        precio,
        stock: 0,
        stockMinimo: 0,
      }),
    );
});
