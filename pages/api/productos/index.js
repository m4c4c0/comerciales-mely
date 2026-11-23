import { requireRole } from "../../../lib/auth";
import { listProductos, createProducto } from "../../../lib/db";
import { productoSchema, zodErrorToMessage } from "../../../lib/validators";

export default function handler(req, res) {
  if (req.method === "GET") {
    // Cualquier rol autenticado puede consultar el inventario.
    const session = requireRole(req, res, ["administrador", "empleado", "facturador"]);
    if (!session) return;
    return res.status(200).json({ productos: listProductos() });
  }

  if (req.method === "POST") {
    // Solo administrador y empleado pueden registrar productos nuevos.
    const session = requireRole(req, res, ["administrador", "empleado"]);
    if (!session) return;

    const parsed = productoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: zodErrorToMessage(parsed.error) });
    }
    const producto = createProducto(parsed.data);
    return res.status(201).json({ producto });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Método no permitido." });
}
