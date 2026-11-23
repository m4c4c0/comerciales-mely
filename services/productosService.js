import { apiRequest } from "./apiClient";

export const productosService = {
  listar: () => apiRequest("/api/productos"),
  crear: (data) => apiRequest("/api/productos", { method: "POST", body: data }),
  actualizar: (id, data) => apiRequest(`/api/productos/${id}`, { method: "PUT", body: data }),
  eliminar: (id) => apiRequest(`/api/productos/${id}`, { method: "DELETE" }),
};
