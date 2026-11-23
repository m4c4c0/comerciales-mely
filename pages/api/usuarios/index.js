import { requireRole } from "../../../lib/auth";
import { listUsuarios, createUsuario } from "../../../lib/db";
import { registroSchema, zodErrorToMessage } from "../../../lib/validators";

export default function handler(req, res) {
  if (req.method === "GET") {
    const session = requireRole(req, res, ["administrador"]);
    if (!session) return;
    return res.status(200).json({ usuarios: listUsuarios() });
  }

  if (req.method === "POST") {
    // Único punto donde se puede crear un usuario con rol "administrador".
    const session = requireRole(req, res, ["administrador"]);
    if (!session) return;

    const parsed = registroSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: zodErrorToMessage(parsed.error) });
    }

    try {
      const usuario = createUsuario(parsed.data);
      return res.status(201).json({ usuario });
    } catch (err) {
      return res.status(409).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Método no permitido." });
}
