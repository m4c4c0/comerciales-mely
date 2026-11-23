import { createUsuario } from "../../../lib/db";
import { signSession, setSessionCookie } from "../../../lib/auth";
import { registroPublicoSchema, zodErrorToMessage } from "../../../lib/validators";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Método no permitido." });
  }

  const parsed = registroPublicoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: zodErrorToMessage(parsed.error) });
  }

  try {
    const usuario = createUsuario(parsed.data);
    const token = signSession({ id: usuario.id, usuario: usuario.usuario, rol: usuario.rol, nombre: usuario.nombre });
    setSessionCookie(res, token);
    return res.status(201).json({ usuario });
  } catch (err) {
    return res.status(409).json({ error: err.message });
  }
}
