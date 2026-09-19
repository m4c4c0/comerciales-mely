'use client';

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
  login: (token: string, userData: User, redirectUrl?: string) => void;
  loginDemo: (rol: 'Administrador' | 'Empleado' | 'Facturador') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('mely_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Error loading session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (token: string, userData: User, redirectUrl: string = '/dashboard') => {
    localStorage.setItem('mely_token', token);
    localStorage.setItem('mely_user', JSON.stringify(userData));
    setUser(userData);
    router.push(redirectUrl);
  };

  const loginDemo = (rol: 'Administrador' | 'Empleado' | 'Facturador') => {
    const demoUser: User = {
      id: `demo-${rol.toLowerCase()}`,
      nombre: `Usuario ${rol}`,
      email: `${rol.toLowerCase()}@mely.com`,
      rol,
    };
    login(`token-demo-${rol.toLowerCase()}`, demoUser, '/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('mely_token');
    localStorage.removeItem('mely_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
