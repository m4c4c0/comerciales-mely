import { apiRequest } from "./apiClient";

export const usuariosService = {
  listar: () => apiRequest("/api/usuarios"),
  crear: (data) => apiRequest("/api/usuarios", { method: "POST", body: data }),
};
