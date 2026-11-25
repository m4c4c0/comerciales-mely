'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = user?.rol === 'Administrador';
  const canInvoice = user?.rol === 'Administrador' || user?.rol === 'Facturador';

  const baseNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      description: 'Resumen e indicadores',
    },
    {
      name: 'Inventario (CRUD)',
      href: '/inventario',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      description: 'Gestión de productos',
    },
    {
      name: 'Movimientos',
      href: '/movimientos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      description: 'Entradas y salidas de stock',
    },
    ...(canInvoice
      ? [
          {
            name: 'Facturación (POS)',
            href: '/facturacion',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            ),
            description: 'Ventas, IVA 13% y facturas',
          },
        ]
      : []),
    {
      name: 'Reportes de Ventas',
      href: '/reportes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Gráfica 7 días y más vendidos',
    },
  ];

  const adminNavigation = [
    {
      name: 'Gestión de Usuarios',
      href: '/usuarios',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      description: 'Crear y administrar personal',
    },
  ];

  return (
    <>
      {isOpenMobile && (
        <div onClick={onCloseMobile} className="fixed inset-0 bg-black/40 z-40 lg:hidden" />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:static'
        }`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-xl shadow-md">
              M
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide text-white">Comerciales Mely</h1>
              <p className="text-[11px] text-teal-400 font-medium">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navegación General
          </div>

          {baseNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div>{item.icon}</div>
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  <span className="text-[11px] text-slate-400 font-normal">{item.description}</span>
                </div>
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-purple-400">
                Administración
              </div>
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-purple-700 text-white shadow-md'
                        : 'text-purple-200 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div>{item.icon}</div>
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      <span className="text-[11px] text-purple-300 font-normal">{item.description}</span>
                    </div>
                  </Link>
                );
              })}
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-400">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.nombre || 'Usuario'}</p>
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mt-0.5 ${
                  isAdmin
                    ? 'bg-purple-900/60 text-purple-300 border-purple-700'
                    : user?.rol === 'Facturador'
                      ? 'bg-blue-900/60 text-blue-300 border-blue-700'
                      : 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                }`}
              >
                {user?.rol || 'Invitado'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-900/80 hover:text-red-200 text-slate-300 text-xs font-medium py-2 px-3 rounded-lg border border-slate-700 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
