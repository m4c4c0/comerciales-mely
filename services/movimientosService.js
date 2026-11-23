import { apiRequest } from "./apiClient";

export const movimientosService = {
  listar: () => apiRequest("/api/movimientos"),
  crear: (data) => apiRequest("/api/movimientos", { method: "POST", body: data }),
};
