import { useState } from "react";
import { FormField, inputClass } from "./Panel";
import { Alert } from "./Feedback";
import Button from "./Button";
import { ImagePlus } from "lucide-react";

const CATEGORIAS = ["Hogar", "Ferretería", "Bisutería", "Juguetería", "Belleza", "Electrónica", "Otros"];

export default function ProductoForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial || { nombre: "", categoria: "Hogar", precio: "", stock: "", stockMinimo: "5", imagenUrl: "" }
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleImagen(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError("La imagen debe pesar menos de 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("imagenUrl", reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-line bg-cream">
          {form.imagenUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imagenUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={20} className="text-faint" />
          )}
        </div>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink">Fotografía (opcional)</span>
          <input type="file" accept="image/*" onChange={handleImagen} className="block text-xs text-muted" />
        </label>
      </div>

      <FormField label="Nombre del producto">
        <input className={inputClass} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} required minLength={2} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Categoría">
          <select className={inputClass} value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Precio (USD)">
          <input
            type="number"
            step="0.01"
            min="0.01"
            className={inputClass}
            value={form.precio}
            onChange={(e) => set("precio", e.target.value)}
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Stock inicial">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            required
          />
        </FormField>
        <FormField label="Stock mínimo" hint="Umbral de alerta">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={form.stockMinimo}
            onChange={(e) => set("stockMinimo", e.target.value)}
            required
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando…" : "Guardar producto"}
        </Button>
      </div>
    </form>
  );
}
