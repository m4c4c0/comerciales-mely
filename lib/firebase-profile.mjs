import { doc, runTransaction, serverTimestamp } from "firebase/firestore";

// Authentication's observer and the login action can arrive together. A
// transaction creates the profile once and preserves any existing role.
export function ensureUserProfile(db, user) {
  const ref = doc(db, "usuarios", user.uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (snapshot.exists()) return snapshot.data();
    const profile = {
      nombre: user.displayName || user.email?.split("@")[0] || "Usuario",
      email: (user.email || "").toLowerCase(),
      usuario: (user.email || "").toLowerCase(),
      rol: "Empleado",
      proveedor: user.providerData?.[0]?.providerId || "password",
      fechaCreacion: serverTimestamp(),
    };
    transaction.set(ref, profile);
    return profile;
  });
}
