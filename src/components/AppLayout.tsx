'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface AppLayoutProps {
  children: React.ReactNode;
  allowedRoles?: Array<'Administrador' | 'Empleado' | 'Facturador'>;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function AppLayout({
  children,
  allowedRoles = ['Administrador', 'Empleado', 'Facturador'],
  title,
  subtitle,
  actions,
}: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
        {/* Barra lateral / Menú */}
        <Sidebar
          isOpenMobile={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Topbar / Cabecera superior */}
          <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Abrir menú"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                  {title || 'Comerciales Mely'}
                </h1>
                {subtitle && (
                  <p className="text-xs text-slate-500 font-normal">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Acciones del encabezado o acceso rápido */}
            <div className="flex items-center gap-3">
              {actions}
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-slate-500 font-medium">
                  {user?.rol}: <strong className="text-slate-700">{user?.nombre}</strong>
                </span>
              </div>
            </div>
          </header>

          {/* Cuerpo de la vista */}
          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
