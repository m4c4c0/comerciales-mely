import { requireRole } from "../../../lib/auth";
import { findProducto, updateProducto, deleteProducto } from "../../../lib/db";
import { productoSchema, zodErrorToMessage } from "../../../lib/validators";

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    const session = requireRole(req, res, ["administrador", "empleado", "facturador"]);
    if (!session) return;
    const producto = findProducto(id);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado." });
    return res.status(200).json({ producto });
  }

  if (req.method === "PUT") {
    const session = requireRole(req, res, ["administrador", "empleado"]);
    if (!session) return;

    const parsed = productoSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: zodErrorToMessage(parsed.error) });
    }
    const producto = updateProducto(id, parsed.data);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado." });
    return res.status(200).json({ producto });
  }

  if (req.method === "DELETE") {
    // Eliminar productos es una acción sensible: solo el administrador.
    const session = requireRole(req, res, ["administrador"]);
    if (!session) return;
    const ok = deleteProducto(id);
    if (!ok) return res.status(404).json({ error: "Producto no encontrado." });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).json({ error: "Método no permitido." });
}
