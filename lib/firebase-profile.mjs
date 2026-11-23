import { doc, runTransaction, serverTimestamp } from "firebase/firestore";

let registrationPending = null;

// Auth notifies its observer before the registration form finishes writing
// the chosen name and profile. Let that write finish before loading a profile.
export async function registerWithProfile(register) {
  if (registrationPending) throw new Error("Ya hay un registro en curso.");
  let finish;
  registrationPending = new Promise((resolve) => { finish = resolve; });
  try {
    return await register();
  } finally {
    registrationPending = null;
    finish();
  }
}

// Authentication's observer and the login action can arrive together. A
// transaction creates the profile once and preserves any existing role.
export async function ensureUserProfile(db, user) {
  if (registrationPending) await registrationPending;
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
