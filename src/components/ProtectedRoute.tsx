'use client';

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
        router.push('/dashboard');
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
