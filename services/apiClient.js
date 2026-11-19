// Mantiene los nombres de las operaciones usadas por las pantallas, pero los
// ejecuta con Firebase Authentication y Cloud Firestore desde el cliente.
export async function apiRequest(path, options = {}) {
  try {
    const { auth } = await import("../lib/firebase");
    await auth.authStateReady();
    const { firebaseApi } = await import("./firebaseApi");
    return await firebaseApi(path, options);
  } catch (error) {
    const messages = {
      "auth/invalid-credential": "Correo o contraseña incorrectos.",
      "auth/user-not-found": "Correo o contraseña incorrectos.",
      "auth/wrong-password": "Correo o contraseña incorrectos.",
      "auth/email-already-in-use": "Ya existe una cuenta con este correo.",
      "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
      "auth/operation-not-allowed": "Habilita este método de acceso en Firebase Authentication.",
      "auth/popup-closed-by-user": "Se canceló el inicio de sesión.",
      "permission-denied": "Firestore rechazó la operación. Revisa el rol y las reglas publicadas.",
      unavailable: "Firestore no está disponible. Revisa tu conexión.",
    };
    throw new Error(messages[error?.code] || error?.message || "No se pudo completar la operación.");
  }
}
