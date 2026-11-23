import { getSessionFromReq } from "../../../lib/auth";
import { findUserById } from "../../../lib/db";

export default function handler(req, res) {
  const session = getSessionFromReq(req);
  if (!session) return res.status(401).json({ usuario: null });

  const user = findUserById(session.id);
  if (!user) return res.status(401).json({ usuario: null });

  return res.status(200).json({
    usuario: { id: user.id, usuario: user.usuario, rol: user.rol, nombre: user.nombre },
  });
}
