'use client';

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/context/AuthContext';

export default function UsuariosPage() {
  const { user } = useAuth();

  return (
    <AppLayout
      allowedRoles={['Administrador']}
      title="Gestión de Usuarios"
      subtitle="Administración de personal, permisos y accesos del sistema"
    >
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-700 via-violet-700 to-indigo-800 text-white rounded-2xl p-6 shadow-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-100 mb-2">
            Módulo restringido
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Bienvenido, {user?.nombre || 'Administrador'}
          </h2>
          <p className="mt-2 text-sm text-purple-100 max-w-2xl">
            Desde aquí podrás crear, editar, activar o desactivar usuarios de la plataforma,
            definir sus roles y mantener el control del acceso del personal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Administradores</p>
            <p className="mt-3 text-3xl font-black text-slate-900">1</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Empleados</p>
            <p className="mt-3 text-3xl font-black text-slate-900">12</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Facturadores</p>
            <p className="mt-3 text-3xl font-black text-slate-900">4</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Usuarios del sistema</h3>
            <button
              type="button"
              className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
            >
              + Nuevo usuario
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Correo</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Rol</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <tr>
                  <td className="px-4 py-3 text-slate-800">{user?.nombre || 'Administrador'}</td>
                  <td className="px-4 py-3 text-slate-600">{user?.email || 'admin@mely.com'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-purple-100 text-purple-800 px-2.5 py-1 text-[11px] font-bold border border-purple-200">
                      Administrador
                    </span>
                  </td>
                  <td className="px-4 py-3 text-emerald-700 font-semibold">Activo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
