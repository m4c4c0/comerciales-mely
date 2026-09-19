'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface UserItem {
  id: string;
  nombre: string;
  email: string;
  rol: 'Administrador' | 'Empleado' | 'Facturador';
}

export default function UsuariosPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'Empleado' as 'Administrador' | 'Empleado' | 'Facturador',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear usuario');

      setToast({ type: 'success', text: `Usuario ${form.nombre} creado con éxito` });
      setForm({ nombre: '', email: '', password: '', rol: 'Empleado' });
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      setToast({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout
      allowedRoles={['Administrador']}
      title="Gestión de Usuarios y Personal"
      subtitle="Módulo exclusivo para Administradores: control de roles y accesos"
      actions={
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-xl transition shadow"
        >
          <span>+ Registrar Nuevo Usuario</span>
        </button>
      }
    >
      <div className="space-y-6">
        {toast && (
          <div
            className={`p-4 rounded-xl text-sm ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {toast.text}
          </div>
        )}

        {/* Modal de Creación */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center pb-3 border-b mb-4">
                <h3 className="font-bold text-slate-800 text-base">Crear Usuario del Sistema</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                    placeholder="ej. Ana Martínez"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                    placeholder="ana@mely.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña Inicial *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                    placeholder="Mínimo 4 caracteres"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rol a Asignar *</label>
                  <select
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value as any })}
                    className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="Administrador">Administrador (Acceso total, precios y usuarios)</option>
                    <option value="Empleado">Empleado (Gestión de stock en inventario)</option>
                    <option value="Facturador">Facturador (Ventas y facturación)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm px-5 py-2 rounded-xl transition"
                  >
                    {saving ? 'Guardando...' : 'Guardar Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabla de Usuarios */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Lista de Usuarios con Acceso al Sistema
            </span>
            <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
              {users.length} usuarios
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs font-semibold text-slate-500 uppercase bg-slate-50/30">
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Rol Asignado</th>
                  <th className="py-3 px-4">Nivel de Acceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400">Cargando usuarios...</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{u.nombre}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.rol === 'Administrador'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : u.rol === 'Empleado'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {u.rol}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {u.rol === 'Administrador'
                          ? 'Acceso total y configuración'
                          : u.rol === 'Empleado'
                          ? 'Operación de almacén y stock'
                          : 'Caja y mostrador'}
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
