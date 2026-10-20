import React from "react";
import { Text, Alert } from "react-native";
import { router } from "expo-router";
import { allowed } from "../../domain/business.mjs";
import { useApp } from "../../context/AppContext";
import { Screen, Card, Button, ErrorText, useTask } from "../../components/UI";
import { styles as s } from "../../theme/theme";

export default function Cuenta() {
  const { user, logout } = useApp();
  const task = useTask();
  return (
    <Screen title="Mi perfil" subtitle="Tu cuenta y sesión de trabajo.">
      <Card>
        <Text style={s.heading}>{user.nombre}</Text>
        <Text style={s.subtitle}>Usuario: {user.usuario}</Text>
        <Text style={s.pillText}>Perfil: {user.rol}</Text>
      </Card>
      <Button
        secondary
        title="Resumen del negocio"
        onPress={() => router.push("/(tabs)")}
      />
      {allowed(user, "invoice") && (
        <Button
          title="Ventas y facturación"
          onPress={() => router.push("/facturacion")}
        />
      )}
      {allowed(user, "reports") && (
        <Button
          secondary
          title="Reportes y estadísticas"
          onPress={() => router.push("/reportes")}
        />
      )}
      <Card>
        <Text style={s.heading}>Acerca de esta versión</Text>
        <Text style={s.subtitle}>
          Comerciales Mely · Etapa 3, Avance 1. React Native, Expo, Context API,
          Zod y SQLite.
        </Text>
        <Text style={s.subtitle}>
          Las cuentas, productos, imágenes y ventas permanecen en este
          dispositivo. La sincronización con Firebase se incorporará en el
          siguiente avance.
        </Text>
        <Text style={s.small}>
          Sesión de hasta 8 horas. El cierre elimina el token del almacén seguro
          y revoca su acceso en SQLite.
        </Text>
      </Card>
      <ErrorText text={task.error} />
      <Button
        title={task.busy ? "Cerrando…" : "Cerrar sesión"}
        danger
        disabled={task.busy}
        onPress={() =>
          Alert.alert(
            "Cerrar sesión",
            "Podrás volver a ingresar con tu usuario y contraseña.",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Cerrar sesión", onPress: () => task.run(logout) },
            ],
          )
        }
      />
    </Screen>
  );
}
