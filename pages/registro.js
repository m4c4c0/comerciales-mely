import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/Feedback";
import { inputClass, FormField } from "../components/Panel";
import Button from "../components/Button";

const initialForm = { nombre: "", usuario: "", password: "", rol: "empleado" };

export default function Registro() {
  const { registro } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await registro(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Crear cuenta · Comerciales Mely</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-900 text-white">
              <ShoppingBag size={18} />
            </span>
            <span className="font-display text-sm font-bold text-ink">Comerciales Mely</span>
          </div>

          <h1 className="font-display text-2xl font-extrabold text-ink">Crear cuenta</h1>
          <p className="mt-1 text-sm text-muted">
            El registro público asigna el rol de Empleado o Facturador. Las cuentas de administrador se crean desde
            el módulo de Usuarios.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <Alert tone="error">{error}</Alert>}

            <FormField label="Nombre completo">
              <input className={inputClass} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} required />
            </FormField>

            <FormField label="Correo electrónico">
              <input type="email" autoComplete="email" className={inputClass} value={form.email || ""} onChange={(e) => set("email", e.target.value)} required />
            </FormField>

            <FormField label="Usuario">
              <input className={inputClass} value={form.usuario} onChange={(e) => set("usuario", e.target.value)} required />
            </FormField>

            <FormField label="Contraseña" hint="Mínimo 8 caracteres.">
              <input type="password" minLength={8} autoComplete="new-password" className={inputClass} value={form.password} onChange={(e) => set("password", e.target.value)} required />
            </FormField>

            <FormField label="Rol">
              <select className={inputClass} value={form.rol} onChange={(e) => set("rol", e.target.value)}>
                <option value="empleado">Empleado</option>
                <option value="facturador">Facturador</option>
              </select>
            </FormField>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creando cuenta…" : "Crear cuenta"}
              {!loading && <ArrowRight size={16} />}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
