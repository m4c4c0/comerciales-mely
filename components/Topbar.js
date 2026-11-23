import { LogOut, Menu } from "lucide-react";
import RoleBadge from "./RoleBadge";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title, subtitle, onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-line bg-surface px-5 py-4 md:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="text-ink md:hidden" aria-label="Abrir menú">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-display text-lg font-bold text-ink">{title}</h1>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-ink">{user.nombre}</p>
            <RoleBadge rol={user.rol} />
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-brick-100 hover:text-brick-600"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
