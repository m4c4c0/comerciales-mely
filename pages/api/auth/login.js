import bcrypt from "bcryptjs";
import { findUserByUsuario } from "../../../lib/db";
import { signSession, setSessionCookie } from "../../../lib/auth";
import { loginSchema, zodErrorToMessage } from "../../../lib/validators";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Método no permitido." });
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: zodErrorToMessage(parsed.error) });
  }

  const { usuario, password } = parsed.data;
  const user = findUserByUsuario(usuario);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
  }

  const token = signSession({ id: user.id, usuario: user.usuario, rol: user.rol, nombre: user.nombre });
  setSessionCookie(res, token);
  return res.status(200).json({
    usuario: { id: user.id, usuario: user.usuario, rol: user.rol, nombre: user.nombre },
  });
}
