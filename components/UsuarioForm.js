import { useState } from "react";
import { FormField, inputClass } from "./Panel";
import { Alert } from "./Feedback";
import Button from "./Button";

export default function UsuarioForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ nombre: "", email: "", usuario: "", password: "", rol: "empleado" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
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

      <FormField label="Nombre completo">
        <input className={inputClass} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} required />
      </FormField>
      <FormField label="Correo electrónico">
        <input type="email" autoComplete="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} required />
      </FormField>
      <FormField label="Usuario">
        <input className={inputClass} value={form.usuario} onChange={(e) => set("usuario", e.target.value)} required />
      </FormField>
      <FormField label="Contraseña" hint="Mínimo 8 caracteres.">
        <input type="password" className={inputClass} value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={8} />
      </FormField>
      <FormField label="Rol">
        <select className={inputClass} value={form.rol} onChange={(e) => set("rol", e.target.value)}>
          <option value="empleado">Empleado</option>
          <option value="facturador">Facturador</option>
          <option value="administrador">Administrador</option>
        </select>
      </FormField>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creando…" : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
}
