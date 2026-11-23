import Link from "next/link";
import { useRouter } from "next/router";
import { LayoutDashboard, Boxes, Receipt, BarChart3, Users, ShoppingBag } from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["administrador", "empleado", "facturador"] },
  { href: "/inventario", label: "Inventario", icon: Boxes, roles: ["administrador", "empleado"] },
  { href: "/facturacion", label: "Facturación", icon: Receipt, roles: ["administrador", "facturador"] },
  { href: "/reportes", label: "Reportes", icon: BarChart3, roles: ["administrador", "empleado", "facturador"] },
  { href: "/usuarios", label: "Usuarios", icon: Users, roles: ["administrador"] },
];

export default function Sidebar({ rol, mobile = false, onNavigate }) {
  const router = useRouter();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(rol));

  return (
    <aside className={clsx("shrink-0 flex-col bg-brand-900 px-4 py-6", mobile ? "flex h-full w-full" : "hidden w-60 md:flex")}>
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-500 text-sm font-bold text-white">
          <ShoppingBag size={18} />
        </span>
        <div className="leading-tight">
          <p className="font-display text-sm font-bold text-white">Comerciales Mely</p>
          <p className="text-[11px] text-brand-500">Sistema de gestión</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = router.pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={clsx(
                "flex items-center gap-3 rounded-pill px-3.5 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-brand-500 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-md bg-white/5 px-3.5 py-3 text-[11px] leading-relaxed text-white/50">
        Ciclo II-2026 · DPS941
        <br />
        Equipo R.E.F.E.S
      </div>
    </aside>
  );
}
