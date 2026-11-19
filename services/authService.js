import { apiRequest } from "./apiClient";

export const authService = {
  me: () => apiRequest("/api/auth/me"),
  login: (usuario, password) => apiRequest("/api/auth/login", { method: "POST", body: { usuario, password } }),
  registro: (data) => apiRequest("/api/auth/register", { method: "POST", body: data }),
  logout: () => apiRequest("/api/auth/logout", { method: "POST" }),
  google: async () => {
    const { signInWithGoogle } = await import("./firebaseApi");
    return signInWithGoogle();
  },
  resetPassword: async (email) => {
    const { resetPassword } = await import("./firebaseApi");
    return resetPassword(email);
  },
};
