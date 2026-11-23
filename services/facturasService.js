import { apiRequest } from "./apiClient";

export const facturasService = {
  listar: () => apiRequest("/api/facturas"),
  crear: (items) => apiRequest("/api/facturas", { method: "POST", body: { items } }),
};
