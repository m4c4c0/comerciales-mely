import { requireRole } from "../../../lib/auth";
import { listMovimientos, crearMovimiento } from "../../../lib/db";
import { movimientoSchema, zodErrorToMessage } from "../../../lib/validators";

export default function handler(req, res) {
  if (req.method === "GET") {
    const session = requireRole(req, res, ["administrador", "empleado", "facturador"]);
    if (!session) return;
    return res.status(200).json({ movimientos: listMovimientos() });
  }

  if (req.method === "POST") {
    // El facturador no gestiona inventario directamente.
    const session = requireRole(req, res, ["administrador", "empleado"]);
    if (!session) return;

    const parsed = movimientoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: zodErrorToMessage(parsed.error) });
    }

    try {
      const { movimiento, producto } = crearMovimiento({ ...parsed.data, usuarioId: session.id });
      return res.status(201).json({ movimiento, producto });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Método no permitido." });
}
