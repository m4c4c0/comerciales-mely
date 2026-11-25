'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type Rol = 'Administrador' | 'Empleado' | 'Facturador';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  proveedor?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User, redirectUrl?: string) => void;
  loginEmail: (email: string, password: string) => Promise<void>;
  registerEmail: (nombre: string, email: string, password: string, rol: Rol) => Promise<void>;
  loginGoogle: () => Promise<void>;
  loginDemo: (rol: Rol) => void;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizarRol(raw?: string): Rol {
  const r = String(raw || '').trim().toLowerCase();
  if (r === 'administrador' || r === 'admin') return 'Administrador';
  if (r === 'facturador' || r === 'cajero') return 'Facturador';
  return 'Empleado';
}

export function traducirErrorAuth(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  const message = (err as { message?: string })?.message || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos';
    case 'auth/invalid-email':
      return 'El correo no tiene un formato válido';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta registrada con este correo';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Intenta más tarde';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Se cerró la ventana de Google antes de completar el acceso';
    case 'auth/operation-not-allowed':
      return 'Este método de acceso no está habilitado en Firebase Console';
    case 'auth/unauthorized-domain':
      return 'Dominio no autorizado en Firebase Console (Authentication > Settings > Authorized domains)';
    case 'auth/network-request-failed':
      return 'Sin conexión de red con Firebase';
    default:
      return message || 'Error de autenticación';
  }
}

async function cargarPerfil(
  fb: FirebaseUser,
  rolPorDefecto: Rol = 'Empleado',
  nombreInicial?: string
): Promise<User> {
  const ref = doc(db, 'usuarios', fb.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const d = snap.data();
    return {
      id: fb.uid,
      nombre: d.nombre || fb.displayName || fb.email || 'Usuario',
      email: d.email || fb.email || '',
      rol: normalizarRol(d.rol),
      proveedor: d.proveedor,
    };
  }
  const rolGuardar: Rol = rolPorDefecto === 'Facturador' ? 'Facturador' : 'Empleado';
  const perfil = {
    nombre: nombreInicial || fb.displayName || fb.email?.split('@')[0] || 'Usuario',
    usuario: (fb.email || 'usuario').split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, ''),
    email: (fb.email || '').toLowerCase(),
    rol: rolGuardar,
    proveedor: fb.providerData[0]?.providerId || 'password',
    fechaCreacion: serverTimestamp(),
  };
  await setDoc(ref, perfil);
  return {
    id: fb.uid,
    nombre: perfil.nombre,
    email: perfil.email,
    rol: rolGuardar,
    proveedor: perfil.proveedor,
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const registrando = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fb) => {
      if (registrando.current) return;
      if (!fb) {
        try {
          const storedUser = localStorage.getItem('mely_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setLoading(false);
            return;
          }
        } catch {
          // ignore
        }
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const perfil = await cargarPerfil(fb);
        localStorage.setItem('mely_user', JSON.stringify(perfil));
        setUser(perfil);
      } catch (e) {
        console.error('Error cargando perfil de Firebase:', e);
        const fallback: User = {
          id: fb.uid,
          nombre: fb.displayName || fb.email?.split('@')[0] || 'Usuario',
          email: fb.email || '',
          rol: 'Empleado',
        };
        setUser(fallback);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const login = (token: string, userData: User, redirectUrl: string = '/dashboard') => {
    localStorage.setItem('mely_token', token);
    localStorage.setItem('mely_user', JSON.stringify(userData));
    setUser(userData);
    router.push(redirectUrl);
  };

  const loginEmail = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const perfil = await cargarPerfil(cred.user);
    localStorage.setItem('mely_user', JSON.stringify(perfil));
    setUser(perfil);
    router.push('/dashboard');
  };

  const registerEmail = async (nombre: string, email: string, password: string, rol: Rol) => {
    registrando.current = true;
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(cred.user, { displayName: nombre.trim() });
      const perfil = await cargarPerfil(cred.user, rol, nombre.trim());
      localStorage.setItem('mely_user', JSON.stringify(perfil));
      setUser(perfil);
      router.push('/dashboard');
    } finally {
      registrando.current = false;
    }
  };

  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    const perfil = await cargarPerfil(cred.user);
    localStorage.setItem('mely_user', JSON.stringify(perfil));
    setUser(perfil);
    router.push('/dashboard');
  };

  const loginDemo = (rol: Rol) => {
    const demoUser: User = {
      id: `demo-${rol.toLowerCase()}`,
      nombre: `Usuario ${rol}`,
      email: `${rol.toLowerCase()}@mely.com`,
      rol,
    };
    login(`token-demo-${rol.toLowerCase()}`, demoUser, '/dashboard');
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  };

  const logout = async () => {
    localStorage.removeItem('mely_token');
    localStorage.removeItem('mely_user');
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginEmail,
        registerEmail,
        loginGoogle,
        loginDemo,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
