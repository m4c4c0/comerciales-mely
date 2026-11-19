import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../context/AuthContext";

export default function Layout({ title, subtitle, children, allowedRoles }) {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-muted">Comprobando sesión…</div>;
  }
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-muted">No tienes permiso para ver este módulo.</div>;
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar rol={user?.rol} />

      {menuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
          <div className="relative z-50 w-64 bg-brand-900 p-4">
            <button className="mb-4 text-white/70" onClick={() => setMenuOpen(false)}>
              <X size={20} />
            </button>
            <Sidebar rol={user?.rol} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} onMenuClick={() => setMenuOpen(true)} />
        <main className="fade-in flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
