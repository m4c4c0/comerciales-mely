import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { money } from "../domain/business.mjs";
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export async function shareReceipt(invoice) {
  const rows = invoice.items
    .map(
      (i) =>
        `<tr><td>${escape(i.nombre)}</td><td>${i.cantidad}</td><td>${money(i.precioCentavos)}</td><td>${money(i.precioCentavos * i.cantidad)}</td></tr>`,
    )
    .join("");
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><style>body{font:16px Arial;color:#1E3A5F;padding:36px}table{border-collapse:collapse;width:100%;margin:24px 0}td,th{padding:12px;border-bottom:1px solid #ddd;text-align:left}footer{font-size:12px;color:#526171;margin-top:30px}</style></head><body><h1>Comerciales Mely</h1><h2>${escape(invoice.numero)}</h2><p>Cliente: ${escape(invoice.cliente)}</p><p>${escape(new Date(invoice.fecha).toLocaleString("es-SV"))}</p><table><thead><tr><th>Producto</th><th>Unidades</th><th>Precio</th><th>Importe</th></tr></thead><tbody>${rows}</tbody></table><p>Subtotal: ${money(invoice.subtotal)}</p><p>IVA 13 %: ${money(invoice.iva)}</p><h2>Total: ${money(invoice.total)}</h2><footer>Comprobante académico de demostración. No constituye un documento tributario electrónico autorizado. Emitido por ${escape(invoice.usuario)}.</footer></body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("Este dispositivo no permite compartir archivos.");
  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
    dialogTitle: invoice.numero,
  });
}
