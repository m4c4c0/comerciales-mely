import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const data = await authService.me();
      setUser(data.usuario || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribe;
    let active = true;
    Promise.all([import("../lib/firebase"), import("firebase/auth"), import("../services/firebaseApi")])
      .then(([firebase, authSdk, profileService]) => {
        if (!active) return;
        unsubscribe = authSdk.onAuthStateChanged(firebase.auth, async (firebaseUser) => {
          try {
            setUser(firebaseUser ? await profileService.getProfile(firebaseUser) : null);
          } catch {
            setUser(null);
          } finally {
            setLoading(false);
          }
        });
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const login = useCallback(async (usuario, password) => {
    const data = await authService.login(usuario, password);
    setUser(data.usuario);
    return data.usuario;
  }, []);

  const registro = useCallback(async (payload) => {
    const data = await authService.registro(payload);
    setUser(data.usuario);
    return data.usuario;
  }, []);

  const loginGoogle = useCallback(async () => {
    const data = await authService.google();
    setUser(data.usuario);
    return data.usuario;
  }, []);

  const resetPassword = useCallback((email) => authService.resetPassword(email), []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(() => ({ user, loading, login, loginGoogle, resetPassword, registro, logout, refresh }), [user, loading, login, loginGoogle, resetPassword, registro, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  return ctx;
}
