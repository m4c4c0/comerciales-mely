import { useEffect, useState } from "react";
import Head from "next/head";
import { UserPlus } from "lucide-react";
import Layout from "../components/Layout";
import { Panel } from "../components/Panel";
import { Alert } from "../components/Feedback";
import Modal from "../components/Modal";
import Button from "../components/Button";
import RoleBadge from "../components/RoleBadge";
import UsuarioForm from "../components/UsuarioForm";
import { usuariosService } from "../services/usuariosService";


export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  function cargar() {
    usuariosService
      .listar()
      .then((data) => setUsuarios(data.usuarios))
      .catch((err) => setError(err.message));
  }

  useEffect(cargar, []);

  async function handleCrear(data) {
    const { usuario } = await usuariosService.crear(data);
    setUsuarios((prev) => [...prev, usuario]);
    setModalOpen(false);
  }

  return (
    <>
      <Head>
        <title>Usuarios · Comerciales Mely</title>
      </Head>
      <Layout title="Usuarios" subtitle="Gestión de cuentas y roles del sistema" allowedRoles={["administrador"]}>
        {error && <Alert tone="error" className="mb-5">{error}</Alert>}

        <Panel
          title="Cuentas registradas"
          action={
            <Button onClick={() => setModalOpen(true)}>
              <UserPlus size={16} /> Nuevo usuario
            </Button>
          }
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-faint">
                <th className="py-2.5 pr-3">Nombre</th>
                <th className="py-2.5 pr-3">Usuario</th>
                <th className="py-2.5 pr-3">Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="py-2.5 pr-3 text-ink">{u.nombre}</td>
                  <td className="py-2.5 pr-3 text-muted">{u.usuario}</td>
                  <td className="py-2.5 pr-3">
                    <RoleBadge rol={u.rol} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </Layout>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo usuario">
        <UsuarioForm onSubmit={handleCrear} onCancel={() => setModalOpen(false)} />
      </Modal>
    </>
  );
}
