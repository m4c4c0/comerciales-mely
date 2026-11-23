import { requireRole } from "../../../lib/auth";
import { resumenReportes } from "../../../lib/db";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Método no permitido." });
  }
  const session = requireRole(req, res, ["administrador", "empleado", "facturador"]);
  if (!session) return;
  return res.status(200).json(resumenReportes());
}
