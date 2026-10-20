import React, { useState } from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
import { useApp } from "../context/AppContext";
import {
  Screen,
  Card,
  Field,
  Button,
  Choice,
  ErrorText,
  useTask,
} from "../components/UI";
import { styles as s } from "../theme/theme";
export default function Registro() {
  const { authenticate } = useApp();
  const [data, setData] = useState({
      nombre: "",
      usuario: "",
      password: "",
      rol: "empleado",
    }),
    [confirmation, setConfirmation] = useState("");
  const task = useTask();
  const change = (key, value) => setData((d) => ({ ...d, [key]: value }));
  return (
    <SafeAreaView style={s.screen}>
      <Screen
        title="Crear cuenta"
        subtitle="Elige tu perfil de trabajo para comenzar."
      >
        <Card>
          <Field
            label="Nombre completo"
            value={data.nombre}
            onChangeText={(v) => change("nombre", v)}
            autoCapitalize="words"
          />
          <Field
            label="Usuario"
            value={data.usuario}
            onChangeText={(v) => change("usuario", v)}
          />
          <Field
            label="Contraseña (mínimo 8 caracteres)"
            value={data.password}
            onChangeText={(v) => change("password", v)}
            secureTextEntry
          />
          <Field
            label="Confirmar contraseña"
            value={confirmation}
            onChangeText={setConfirmation}
            secureTextEntry
          />
          <Choice
            values={[
              ["empleado", "Empleado"],
              ["facturador", "Facturador"],
            ]}
            value={data.rol}
            onChange={(v) => change("rol", v)}
          />
          <Text style={s.small}>
            El registro público no permite crear administradores.
          </Text>
          <ErrorText text={task.error} />
          <Button
            title={task.busy ? "Creando…" : "Registrarme"}
            disabled={task.busy}
            onPress={() =>
              task.run(() => {
                if (confirmation !== data.password)
                  throw new Error("Las contraseñas no coinciden.");
                return authenticate("register", data);
              })
            }
          />
          <Link href="/login" style={s.link}>
            Ya tengo una cuenta
          </Link>
        </Card>
      </Screen>
    </SafeAreaView>
  );
}
