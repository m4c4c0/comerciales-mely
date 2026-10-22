import React, { useRef, useState } from "react";
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
  const usernameInput = useRef(null),
    passwordInput = useRef(null),
    confirmationInput = useRef(null);
  const [data, setData] = useState({
      nombre: "",
      usuario: "",
      password: "",
      rol: "empleado",
    }),
    [confirmation, setConfirmation] = useState("");
  const task = useTask();
  const change = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const submit = () =>
    task.run(() => {
      if (confirmation !== data.password)
        throw new Error("Las contraseñas no coinciden.");
      return authenticate("register", data);
    });
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
            testID="register-name"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => usernameInput.current?.focus()}
          />
          <Field
            ref={usernameInput}
            label="Usuario"
            value={data.usuario}
            onChangeText={(v) => change("usuario", v)}
            testID="register-username"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordInput.current?.focus()}
          />
          <Field
            ref={passwordInput}
            label="Contraseña (mínimo 8 caracteres)"
            value={data.password}
            onChangeText={(v) => change("password", v)}
            secureTextEntry
            testID="register-password"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => confirmationInput.current?.focus()}
          />
          <Field
            ref={confirmationInput}
            label="Confirmar contraseña"
            value={confirmation}
            onChangeText={setConfirmation}
            secureTextEntry
            testID="register-confirm-password"
            returnKeyType="done"
            onSubmitEditing={submit}
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
            onPress={submit}
          />
          <Link href="/login" style={s.link}>
            Ya tengo una cuenta
          </Link>
        </Card>
      </Screen>
    </SafeAreaView>
  );
}
