import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/Feedback";
import { inputClass } from "../components/Panel";
import Button from "../components/Button";

export default function Login() {
  const { login, loginGoogle, resetPassword } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ usuario: "", password: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      await login(form.usuario.trim(), form.password);
      const next = typeof router.query.next === "string" ? router.query.next : "/dashboard";
      router.push(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    setError("");
    setNotice("");
    setLoading(true);
    try {
      await resetPassword(form.usuario);
      setNotice("Si existe una cuenta para ese correo, recibirás instrucciones para cambiar la contraseña.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Iniciar sesión · Comerciales Mely</title>
      </Head>
      <div className="grid min-h-screen md:grid-cols-2">
        {/* Panel de marca */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-900 p-10 text-white md:flex">
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
            <defs>
              <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
                <rect width="6" height="6" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          <div className="relative flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-500">
              <ShoppingBag size={18} />
            </span>
            <span className="font-display text-sm font-bold">Comerciales Mely</span>
          </div>

          <div className="relative max-w-sm">
            <p className="font-display text-3xl font-extrabold leading-tight">
              Tu inventario, tus ventas y tu facturación, en un solo lugar.
            </p>
            <p className="mt-4 text-sm text-white/60">
              Del control manual en Excel a un sistema que descuenta el stock al vender, avisa cuando un producto se
              agota y te muestra qué se vendió hoy.
            </p>
          </div>

          <p className="relative text-xs text-white/40">DPS941 · Entrega final — Proyecto multiplataforma</p>
        </div>

        {/* Panel de formulario */}
        <div className="flex items-center justify-center bg-cream px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center gap-2.5 md:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-900 text-white">
                <ShoppingBag size={18} />
              </span>
              <span className="font-display text-sm font-bold text-ink">Comerciales Mely</span>
            </div>

            <h1 className="font-display text-2xl font-extrabold text-ink">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-muted">Ingresa con tu correo electrónico o cuenta de Google.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && <Alert tone="error">{error}</Alert>}
              {notice && <Alert tone="success">{notice}</Alert>}

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Correo electrónico</span>
                <input
                  className={inputClass}
                  value={form.usuario}
                  onChange={(e) => setForm((f) => ({ ...f, usuario: e.target.value }))}
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="nombre@correo.com"
                  autoFocus
                  required
                />
              </label>

              <button type="button" onClick={handlePasswordReset} disabled={loading} className="text-sm font-medium text-brand-600 hover:underline disabled:opacity-50">
                ¿Olvidaste tu contraseña?
              </button>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">Contraseña</span>
                <input
                  type="password"
                  className={inputClass}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                />
              </label>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Ingresando…" : "Ingresar"}
                {!loading && <ArrowRight size={16} />}
              </Button>
            </form>

            <Button type="button" variant="secondary" className="mt-3 w-full" onClick={async () => {
              setError(""); setLoading(true);
              try { await loginGoogle(); router.push("/dashboard"); }
              catch (err) { setError(err.message); }
              finally { setLoading(false); }
            }} disabled={loading}>
              Continuar con Google
            </Button>

            <p className="mt-5 text-center text-sm text-muted">
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="font-medium text-brand-600 hover:underline">
                Regístrate
              </Link>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}
