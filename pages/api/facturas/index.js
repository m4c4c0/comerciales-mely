import { requireRole } from "../../../lib/auth";
import { listFacturas, crearFactura } from "../../../lib/db";
import { facturaSchema, zodErrorToMessage } from "../../../lib/validators";

export default function handler(req, res) {
  if (req.method === "GET") {
    const session = requireRole(req, res, ["administrador", "facturador"]);
    if (!session) return;
    return res.status(200).json({ facturas: listFacturas() });
  }

  if (req.method === "POST") {
    const session = requireRole(req, res, ["administrador", "facturador"]);
    if (!session) return;

    const parsed = facturaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: zodErrorToMessage(parsed.error) });
    }

    try {
      const factura = crearFactura({ items: parsed.data.items, facturadoPor: session.id });
      return res.status(201).json({ factura });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Método no permitido." });
}
