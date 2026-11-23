const ROL_LABEL = {
  administrador: "Administrador",
  empleado: "Empleado",
  facturador: "Facturador",
};

const ROL_TONE = {
  administrador: "bg-brand-100 text-brand-700",
  empleado: "bg-moss-100 text-moss-600",
  facturador: "bg-clay-100 text-clay-600",
};

export default function RoleBadge({ rol, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium ${ROL_TONE[rol] || "bg-line text-muted"} ${className}`}>
      {ROL_LABEL[rol] || rol}
    </span>
  );
}
