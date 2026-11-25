'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getProducts,
  getInvoices,
  createInvoice,
  ProductItem,
  InvoiceItem,
} from '@/lib/services';

interface CartLine {
  productoId: string;
  codigo: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  stockDisponible: number;
}

const IVA_RATE = 0.13;

export default function FacturacionPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [search, setSearch] = useState('');
  const [cliente, setCliente] = useState('Consumidor final');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<InvoiceItem | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [prods, invs] = await Promise.all([getProducts(), getInvoices()]);
      setProducts(prods);
      setInvoices(invs);
    } catch (e: unknown) {
      setToast({
        type: 'error',
        text: (e as { message?: string })?.message || 'Error al cargar catálogo y facturas',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadAll();
  }, [user?.id]);

  const availableProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.stock > 0 &&
        (!q ||
          p.nombre.toLowerCase().includes(q) ||
          p.codigo.toLowerCase().includes(q) ||
          (p.categoria || '').toLowerCase().includes(q))
    );
  }, [products, search]);

  const addToCart = (p: ProductItem) => {
    setToast(null);
    setCart((prev) => {
      const existing = prev.find((it) => it.productoId === p.id);
      if (existing) {
        if (existing.cantidad + 1 > p.stock) {
          setToast({
            type: 'error',
            text: `Solo hay ${p.stock} unidades disponibles de "${p.nombre}".`,
          });
          return prev;
        }
        return prev.map((it) =>
          it.productoId === p.id ? { ...it, cantidad: it.cantidad + 1 } : it
        );
      }
      return [
        ...prev,
        {
          productoId: p.id,
          codigo: p.codigo,
          nombre: p.nombre,
          precioUnitario: p.precio,
          cantidad: 1,
          stockDisponible: p.stock,
        },
      ];
    });
  };

  const changeQty = (productoId: string, delta: number) => {
    setToast(null);
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.productoId !== productoId) return it;
          const next = it.cantidad + delta;
          if (next > it.stockDisponible) {
            setToast({
              type: 'error',
              text: `Stock máximo disponible para "${it.nombre}": ${it.stockDisponible} uds.`,
            });
            return it;
          }
          return { ...it, cantidad: next };
        })
        .filter((it) => it.cantidad > 0)
    );
  };

  const removeLine = (productoId: string) => {
    setCart((prev) => prev.filter((it) => it.productoId !== productoId));
  };

  const subtotal = useMemo(
    () => cart.reduce((acc, it) => acc + it.precioUnitario * it.cantidad, 0),
    [cart]
  );
  const iva = Number((subtotal * IVA_RATE).toFixed(2));
  const total = Number((subtotal + iva).toFixed(2));

  const handleEmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setToast({ type: 'error', text: 'Agrega al menos un producto al carrito de venta.' });
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      const created = await createInvoice(
        {
          cliente: cliente.trim() || 'Consumidor final',
          items: cart.map((it) => ({ productoId: it.productoId, cantidad: it.cantidad })),
        },
        { id: user?.id || '', nombre: user?.nombre || 'Facturador' }
      );
      setLastInvoice(created);
      setCart([]);
      setCliente('Consumidor final');
      setToast({
        type: 'success',
        text: `Factura ${created.numero} emitida con éxito. Stock actualizado en Firestore.`,
      });
      await loadAll();
    } catch (err: unknown) {
      setToast({
        type: 'error',
        text: (err as { message?: string })?.message || 'Error al emitir la factura',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const printReceipt = (inv: InvoiceItem) => {
    const win = window.open('', '_blank', 'width=720,height=800');
    if (!win) return;
    const rows = inv.items
      .map(
        (it) =>
          `<tr>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${it.nombre}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${it.cantidad}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">$${it.precioUnitario.toFixed(2)}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;">$${it.subtotal.toFixed(2)}</td>
          </tr>`
      )
      .join('');

    win.document.write(`<!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Comprobante ${inv.numero} - Comerciales Mely</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; padding: 32px; }
          .header { display:flex; justify-content:space-between; border-bottom:2px solid #0f766e; padding-bottom:16px; }
          table { width:100%; border-collapse:collapse; margin-top:20px; font-size:14px; }
          th { background:#f1f5f9; text-align:left; padding:10px 8px; }
          .totals { margin-top:20px; text-align:right; font-size:14px; }
          .totals h2 { color:#0f766e; margin:8px 0 0; }
          footer { margin-top:36px; font-size:12px; color:#64748b; border-top:1px solid #e2e8f0; padding-top:12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 style="margin:0;color:#0f766e;">COMERCIALES MELY</h1>
            <p style="margin:4px 0 0;font-size:13px;color:#475569;">Comprobante de Venta y Facturación</p>
          </div>
          <div style="text-align:right;">
            <h2 style="margin:0;">${inv.numero}</h2>
            <p style="margin:4px 0 0;font-size:12px;color:#64748b;">${new Date(inv.fecha).toLocaleString('es-SV')}</p>
          </div>
        </div>
        <p style="margin-top:16px;font-size:14px;"><strong>Cliente:</strong> ${inv.cliente} &nbsp;|&nbsp; <strong>Atendido por:</strong> ${inv.usuario}</p>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th style="text-align:center;">Cant.</th>
              <th style="text-align:right;">P. Unitario</th>
              <th style="text-align:right;">Importe</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="totals">
          <p>Subtotal: <strong>$${inv.subtotal.toFixed(2)}</strong></p>
          <p>IVA (13%): <strong>$${inv.iva.toFixed(2)}</strong></p>
          <h2>TOTAL A PAGAR: $${inv.total.toFixed(2)}</h2>
        </div>
        <footer>Comprobante sincronizado en Cloud Firestore · Comerciales Mely</footer>
        <script>window.print();</script>
      </body>
      </html>`);
    win.document.close();
  };

  return (
    <AppLayout
      allowedRoles={['Administrador', 'Facturador']}
      title="Facturación y Punto de Venta (POS)"
      subtitle="Emisión de facturas con cálculo de IVA (13%), descuento atómico de stock y comprobante PDF"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/reportes"
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl transition"
          >
            <span>Ver Reportes de Ventas</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl transition"
          >
            <span>Dashboard</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {toast && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between text-sm font-semibold border ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <span>{toast.text}</span>
            <button onClick={() => setToast(null)} className="text-xs underline ml-4">
              Cerrar
            </button>
          </div>
        )}

        {lastInvoice && (
          <div className="bg-gradient-to-r from-teal-900 to-emerald-800 text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-1 rounded-full">
                Última factura emitida
              </span>
              <h3 className="text-lg font-extrabold mt-1.5">
                {lastInvoice.numero} — Cliente: {lastInvoice.cliente}
              </h3>
              <p className="text-xs text-teal-100 mt-0.5">
                Subtotal: ${lastInvoice.subtotal.toFixed(2)} + IVA (13%): ${lastInvoice.iva.toFixed(2)} ={' '}
                <strong className="text-white">Total: ${lastInvoice.total.toFixed(2)}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => printReceipt(lastInvoice)}
              className="bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs px-4 py-2.5 rounded-xl shadow transition shrink-0"
            >
              Imprimir / Guardar PDF
            </button>
          </div>
        )}

        {/* Grilla Principal POS: Catálogo a la izquierda y Carrito/Factura a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selección de Productos con Stock */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Catálogo Disponible para Venta</h3>
                <p className="text-xs text-slate-500">
                  Haz clic en un producto para añadirlo al comprobante
                </p>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto o código..."
                className="w-full sm:w-64 p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">Cargando catálogo...</div>
            ) : availableProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No hay productos con stock disponible para ese criterio.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {availableProducts.map((p) => {
                  const inCart = cart.find((c) => c.productoId === p.id)?.cantidad || 0;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addToCart(p)}
                      className="text-left p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {p.codigo}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">{p.categoria}</span>
                        </div>
                        <p className="font-bold text-slate-800 text-sm truncate mt-1 group-hover:text-teal-800">
                          {p.nombre}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Disponible: <strong className="text-slate-700">{p.stock} uds.</strong>
                          {inCart > 0 && (
                            <span className="ml-2 text-teal-700 font-bold">({inCart} en carrito)</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-teal-700">
                          ${p.precio.toFixed(2)}
                        </span>
                        <span className="block text-[10px] font-bold text-teal-600 mt-1">
                          + Agregar
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Carrito y Resumen de Factura */}
          <form
            onSubmit={handleEmitInvoice}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Detalle de Factura</h3>
              <p className="text-xs text-slate-500 mb-4">
                Cálculo automático con IVA del 13 %
              </p>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Consumidor final"
                  required
                />
              </div>

              {cart.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                  Selecciona productos del catálogo para armar la venta.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.productoId}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.nombre}</p>
                        <p className="text-[11px] text-slate-500">
                          ${item.precioUnitario.toFixed(2)} c/u · Subtotal:{' '}
                          <strong className="text-slate-700">
                            ${(item.precioUnitario * item.cantidad).toFixed(2)}
                          </strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => changeQty(item.productoId, -1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => changeQty(item.productoId, 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLine(item.productoId)}
                          className="ml-1 text-red-600 hover:text-red-800 text-xs font-bold px-1"
                          title="Quitar"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>IVA (13%):</span>
                <span className="font-semibold">${iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total a Pagar:</span>
                <span className="text-teal-700">${total.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className="w-full mt-3 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition shadow-md text-sm"
              >
                {submitting ? 'Procesando venta...' : 'Confirmar y Emitir Factura'}
              </button>
            </div>
          </form>
        </div>

        {/* Historial de Facturas Emitidas (Sincronizado con App Móvil) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                Historial de Facturas Emitidas (Web y App Móvil)
              </h4>
              <p className="text-xs text-slate-500">
                Comprobantes almacenados en Cloud Firestore asociados al usuario autenticado
              </p>
            </div>
            <span className="text-xs font-semibold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-lg border border-teal-200">
              {invoices.length} facturas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase bg-slate-50/40">
                  <th className="py-3 px-4">N.º Factura</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Artículos</th>
                  <th className="py-3 px-4">Subtotal / IVA</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Emitida por</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4 text-right">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      Cargando facturas desde Firestore...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                      Aún no hay facturas registradas.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-teal-800">
                        {inv.numero}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{inv.cliente}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {inv.items.map((it) => `${it.cantidad}x ${it.nombre}`).join(', ')}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        ${inv.subtotal.toFixed(2)} + ${inv.iva.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ${inv.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{inv.usuario}</td>
                      <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                        {new Date(inv.fecha).toLocaleString('es-SV')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => printReceipt(inv)}
                          className="text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition"
                        >
                          PDF / Imprimir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
