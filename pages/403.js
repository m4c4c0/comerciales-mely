import Head from "next/head";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import Button from "../components/Button";

export default function Forbidden() {
  return (
    <>
      <Head>
        <title>Acceso denegado · Comerciales Mely</title>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream px-6 text-center">
        <ShieldAlert size={34} className="text-brick-500" strokeWidth={1.5} />
        <h1 className="font-display text-xl font-bold text-ink">No tienes permisos para ver esta página</h1>
        <p className="max-w-sm text-sm text-muted">
          Tu rol actual no tiene acceso a este módulo. Si crees que esto es un error, contacta al administrador del
          sistema.
        </p>
        <Button as={Link} href="/dashboard" className="mt-2">
          Volver al dashboard
        </Button>
      </div>
    </>
  );
}
