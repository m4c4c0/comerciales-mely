const fs = require('fs');
const path = require('path');

console.log('Iniciando configuración automática de Comerciales Mely...');

// 1. Corregir y limpiar carpeta errónea src/src si existe
const wrongSrc = path.join(__dirname, 'src', 'src');
if (fs.existsSync(wrongSrc)) {
  fs.rmSync(wrongSrc, { recursive: true, force: true });
  console.log('✔ Carpeta duplicada src/src eliminada.');
}

// 2. Definir rutas y contenidos de los archivos
const files = {
  // src/lib/firebase.ts
  'src/lib/firebase.ts': `import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
`,

  // src/context/AuthContext.tsx
  'src/context/AuthContext.tsx': `'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'Administrador' | 'Empleado' | 'Facturador';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('mely_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('mely_token', token);
    localStorage.setItem('mely_user', JSON.stringify(userData));
    setUser(userData);
    router.push('/inventario');
  };

  const logout = () => {
    localStorage.removeItem('mely_token');
    localStorage.removeItem('mely_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
`,

  // src/components/ProtectedRoute.tsx
  'src/components/ProtectedRoute.tsx': `'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
  allowedRoles?: Array<'Administrador' | 'Empleado' | 'Facturador'>;
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.rol)) {
        router.push('/inventario');
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center font-medium text-teal-600">
        Cargando Comerciales Mely...
      </div>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.rol))) return null;

  return <>{children}</>;
}
`,

  // src/app/layout.tsx
  'src/app/layout.tsx': `import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Comerciales Mely - Gestión',
  description: 'Sistema de Inventario y Ventas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
`,

  // src/app/page.tsx
  'src/app/page.tsx': `import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
`,

  // src/app/login/page.tsx
  'src/app/login/page.tsx': `'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-teal-800">COMERCIALES MELY</h1>
          <p className="text-sm text-gray-500 mt-1">Control de Inventario y Facturación</p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="admin@mely.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg transition shadow-md"
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </main>
  );
}
`,

  // src/app/inventario/page.tsx
  'src/app/inventario/page.tsx': `'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

interface Product {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
}

export default function InventarioPage() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ nombre: '', codigo: '', categoria: '', precio: '', stock: '' });
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, usuario: user?.nombre }),
      });
      if (res.ok) {
        setForm({ nombre: '', codigo: '', categoria: '', precio: '', stock: '' });
        fetchProducts();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    await fetch(\`/api/products/\${id}\`, { method: 'DELETE' });
    fetchProducts();
  };

  const filtered = products.filter(p =>
    p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={['Administrador', 'Empleado', 'Facturador']}>
      <header className="bg-teal-800 text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Comerciales Mely</h1>
            <p className="text-xs text-teal-200">Usuario: {user?.nombre} ({user?.rol})</p>
          </div>
          <button
            onClick={logout}
            className="bg-teal-900 hover:bg-teal-950 px-4 py-2 rounded-lg text-sm transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Módulo de Inventario</h2>
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2.5 rounded-lg w-full sm:w-72 bg-white shadow-sm"
          />
        </div>

        {user?.rol !== 'Facturador' && (
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3">Registrar Nuevo Producto</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input
                placeholder="Código (ej. P-001)"
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                className="border p-2 rounded-lg"
                required
              />
              <input
                placeholder="Nombre del Producto"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="border p-2 rounded-lg"
                required
              />
              <input
                placeholder="Categoría"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="border p-2 rounded-lg"
              />
              <input
                type="number"
                placeholder="Precio ($)"
                step="0.01"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className="border p-2 rounded-lg"
                required
              />
              <input
                type="number"
                placeholder="Stock inicial"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="border p-2 rounded-lg"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="md:col-span-5 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {loading ? 'Guardando...' : '+ Guardar Producto en Inventario'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm border-b">
                <th className="p-3.5">Código</th>
                <th className="p-3.5">Nombre</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Precio</th>
                {user?.rol === 'Administrador' && <th className="p-3.5">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">
                    No hay productos registrados aún.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 text-sm">
                    <td className="p-3.5 font-mono">{item.codigo}</td>
                    <td className="p-3.5 font-medium text-gray-800">{item.nombre}</td>
                    <td className="p-3.5 text-gray-600">{item.categoria}</td>
                    <td className="p-3.5">
                      <span className={\`px-2.5 py-1 rounded-full text-xs font-semibold \${item.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}\`}>
                        {item.stock} unidades
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-gray-800">\${Number(item.precio).toFixed(2)}</td>
                    {user?.rol === 'Administrador' && (
                      <td className="p-3.5">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </ProtectedRoute>
  );
}
`,

  // src/app/api/auth/login/route.ts
  'src/app/api/auth/login/route.ts': `import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const usersRef = collection(db, 'usuarios');
    const q = query(usersRef, where('email', '==', email), where('password', '==', password));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }

    const docUser = querySnapshot.docs[0];
    const data = docUser.data();

    return NextResponse.json({
      token: \`token-\${docUser.id}\`,
      user: {
        id: docUser.id,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error interno en el servidor', error: error.message }, { status: 500 });
  }
}
`,

  // src/app/api/products/route.ts
  'src/app/api/products/route.ts': `import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, 'productos'));
    const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { nombre, codigo, categoria, precio, stock, usuario } = data;

    if (!nombre || !codigo || stock === undefined || precio === undefined) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }

    const docRef = await addDoc(collection(db, 'productos'), {
      nombre,
      codigo,
      categoria: categoria || 'General',
      precio: Number(precio),
      stock: Number(stock),
      fechaCreacion: serverTimestamp(),
    });

    await addDoc(collection(db, 'movimientos'), {
      productoId: docRef.id,
      nombreProducto: nombre,
      tipo: 'Entrada Inicial',
      cantidad: Number(stock),
      usuario: usuario || 'Sistema',
      fecha: new Date().toISOString(),
    });

    return NextResponse.json({ id: docRef.id, message: 'Producto registrado' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al guardar producto' }, { status: 500 });
  }
}
`,

  // src/app/api/products/[id]/route.ts
  'src/app/api/products/[id]/route.ts': `import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteDoc(doc(db, 'productos', id));
    return NextResponse.json({ message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al eliminar producto' }, { status: 500 });
  }
}
`
};

// 3. Escribir los archivos en disco
for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, relPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✔ Archivo creado: ${relPath}`);
}

console.log('\\n ¡Todos los archivos se han generado y organizado correctamente!');