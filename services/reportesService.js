import { apiRequest } from "./apiClient";

export const reportesService = {
  resumen: async () => (await apiRequest("/api/reportes/resumen")).resumen,
};
