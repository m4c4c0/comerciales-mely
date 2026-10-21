# Guía de Trabajo: Edwin Cerón
## Módulo Asignado: Diferenciación de Vistas y Permisos por Rol en el Dashboard

### 🎯 Objetivo de tu rama
Hacer que la diferencia entre entrar como **Administrador** y entrar como **Empleado** sea inmediata y evidente a simple vista en el Dashboard:
1. El **Administrador** tiene acceso al resumen financiero (Valor en Inventario en dólares `$`) y accesos de administración.
2. El **Empleado** tiene una vista puramente operativa de almacén (unidades físicas, productos que necesitan reposición, movimientos de stock), manteniendo ocultos los datos financieros confidenciales de la empresa.

---

### 🌿 Paso 1: Crear tu rama en Git
Abre tu terminal en la carpeta del proyecto y ejecuta:
```bash
git checkout -b feature/dashboard-roles-edwin-ceron
```

---

### 📁 Paso 2: Actualizar `src/app/dashboard/page.tsx`
Abre el archivo:
`src/app/dashboard/page.tsx`

Reemplaza su contenido con el siguiente código completo con renderizado condicional por rol:

```tsx
'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface DashboardStats {
  totalProducts: number;
  totalStockUnits: number;
  totalInventoryValue: number;
  lowStockCount: number;
  lowStockItems: Array<{
    id: string;
    codigo: string;
    nombre: string;
    categoria?: string;
    stock: number;
    precio: number;
  }>;
  categories: Array<{
    name: string;
    productsCount: number;
    totalStock: number;
  }>;
  recentMovements: Array<{
    id: string;
    nombreProducto?: string;
    tipo?: string;
    cantidad?: number;
    usuario?: string;
    fecha?: string;
    motivo?: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.rol === 'Administrador';

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Error al consultar datos del dashboard');
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AppLayout
      title={isAdmin ? 'Dashboard Gerencial (Administrador)' : 'Panel Operativo de Almacén (Empleado)'}
      subtitle={`Sesión iniciada con permisos de: ${user?.rol || 'Usuario'}`}
      actions={
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/usuarios"
              className="hidden sm:inline-flex items-center gap-1.5 bg-purple-700 hover:bg-purple-800 text-white font-medium text-xs sm:text-sm px-3.5 py-2 rounded-xl transition shadow-xs"
            >
              <span>Gestionar Personal</span>
            </Link>
          )}
          <Link
            href="/inventario"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-xl transition shadow-xs"
          >
            <span>Ir al Inventario (CRUD)</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner diferenciado por Rol */}
        <div
          className={`text-white rounded-2xl p-6 shadow-md relative overflow-hidden ${
            isAdmin
              ? 'bg-gradient-to-r from-slate-900 via-teal-900 to-slate-800'
              : 'bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-800'
          }`}
        >
          <div className="relative z-10 max-w-2xl">
            <span
              className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 border ${
                isAdmin
                  ? 'bg-purple-900/60 text-purple-200 border-purple-500/40'
                  : 'bg-emerald-900/60 text-emerald-200 border-emerald-500/40'
              }`}
            >
              Nivel de Acceso: {user?.rol?.toUpperCase()}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bienvenido, {user?.nombre || 'Usuario'}
            </h2>
            <p className="text-slate-200 text-sm mt-1.5 leading-relaxed">
              {isAdmin
                ? 'Tienes control total del sistema: auditoría de costos, gestión de usuarios, catálogo de precios y eliminación de registros.'
                : 'Tienes acceso operativo para registrar ingresos de mercancía, despacho de pedidos y control de existencias en tiempo real.'}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/inventario"
                className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow"
              >
                Abrir Catálogo de Inventario ➔
              </Link>
              <Link
                href="/movimientos"
                className="bg-slate-800/80 hover:bg-slate-900 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-600 transition"
              >
                Registrar Entradas / Salidas
              </Link>
              {isAdmin && (
                <Link
                  href="/usuarios"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl transition"
                >
                  Administrar Usuarios
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tarjetas KPI Diferenciadas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Total Productos */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Artículos
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {loading ? '...' : stats?.totalProducts ?? 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">en catálogo</span>
            </div>
          </div>

          {/* KPI 2: Alertas de Stock Bajo */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Stock Crítico
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-600">
                {loading ? '...' : stats?.lowStockCount ?? 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">≤ 5 unidades</span>
            </div>
          </div>

          {/* KPI 3: VALOR EN INVENTARIO (Solo visible para Administrador) */}
          {isAdmin ? (
            <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-xs bg-gradient-to-br from-purple-50/40 to-white">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  Valor Financiero (Admin)
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-bold">
                  Confidencial
                </span>
              </div>
              <div className="mt-2">
                <span className="text-3xl font-black text-slate-900">
                  ${loading ? '...' : stats?.totalInventoryValue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Suma de stock × precio de venta</p>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Estado de Almacén
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-600">Operativo</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Listo para surtir y despachar</p>
            </div>
          )}

          {/* KPI 4: Unidades Físicas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Unidades Físicas
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {loading ? '...' : stats?.totalStockUnits ?? 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">piezas totales</span>
            </div>
          </div>
        </div>

        {/* Sección de Categorías y Alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-3">Distribución por Categorías</h3>
            <div className="space-y-3">
              {stats?.categories?.map((cat) => (
                <div key={cat.name} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">{cat.name}</span>
                  <span className="text-slate-500 font-bold">{cat.totalStock} unidades</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-slate-800">Alertas de Reposición Urgente</h3>
              <Link href="/inventario" className="text-xs font-semibold text-teal-700 hover:underline">
                Ver en Inventario →
              </Link>
            </div>
            {stats?.lowStockItems?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No hay productos en nivel crítico.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-slate-400 uppercase">
                      <th className="py-2">Código</th>
                      <th className="py-2">Producto</th>
                      <th className="py-2 text-center">Stock</th>
                      {isAdmin && <th className="py-2 text-right">Precio</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {stats?.lowStockItems?.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 font-mono text-slate-500">{p.codigo}</td>
                        <td className="py-2 font-semibold text-slate-800">{p.nombre}</td>
                        <td className="py-2 text-center font-bold text-amber-700">{p.stock} uds</td>
                        {isAdmin && <td className="py-2 text-right">${p.precio}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
```

---

### 🚀 Paso 3: Probar y Subir tu rama a GitHub
1. Inicia sesión como **Admin** y nota que aparece la tarjeta púrpura con el valor financiero en dólares `$`.
2. Cierra sesión e inicia sesión como **Empleado** y nota que la tarjeta financiera desaparece y el modo cambia a operativo de almacén.
3. Ejecuta en tu terminal:
```bash
git add src/app/dashboard/page.tsx
git commit -m "feat(dashboard): diferenciar vistas y permisos financieros entre Administrador y Empleado"
git push origin feature/dashboard-roles-edwin-ceron
```
