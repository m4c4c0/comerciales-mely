import { useState } from "react";
import { FormField, inputClass } from "./Panel";
import { Alert } from "./Feedback";
import Button from "./Button";

export default function MovimientoForm({ producto, onSubmit, onCancel }) {
  const [tipo, setTipo] = useState("entrada");
  const [cantidad, setCantidad] = useState("");
  const [nota, setNota] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({ productoId: producto.id, tipo, cantidad, nota });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="rounded-md bg-cream px-3.5 py-2.5 text-sm">
        <span className="font-medium text-ink">{producto.nombre}</span>
        <span className="text-muted"> · stock actual: {producto.stock}</span>
      </div>

      <FormField label="Tipo de movimiento">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTipo("entrada")}
            className={`rounded-md border px-3 py-2 text-sm font-medium ${
              tipo === "entrada" ? "border-moss-500 bg-moss-100 text-moss-600" : "border-line text-muted"
            }`}
          >
            Entrada
          </button>
          <button
            type="button"
            onClick={() => setTipo("salida")}
            className={`rounded-md border px-3 py-2 text-sm font-medium ${
              tipo === "salida" ? "border-brick-500 bg-brick-100 text-brick-600" : "border-line text-muted"
            }`}
          >
            Salida
          </button>
        </div>
      </FormField>

      <FormField label="Cantidad">
        <input
          type="number"
          min="1"
          className={inputClass}
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
          autoFocus
        />
      </FormField>

      <FormField label="Nota (opcional)">
        <input className={inputClass} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej. compra a proveedor" />
      </FormField>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Registrando…" : "Registrar movimiento"}
        </Button>
      </div>
    </form>
  );
}
