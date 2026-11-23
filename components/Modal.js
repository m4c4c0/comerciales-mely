import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, widthClass = "max-w-md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className={`fade-in w-full ${widthClass} rounded-lg bg-surface shadow-panel`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-display text-base font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="text-faint hover:text-ink" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
