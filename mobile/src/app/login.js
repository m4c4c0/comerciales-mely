import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { Button, ErrorText, useTask } from "../components/UI";
import { styles as s, colors } from "../theme/theme";
const mail = require("../../assets/figma/s0-imgMailIcon.svg"),
  lock = require("../../assets/figma/s0-imgLockIcon.svg"),
  eye = require("../../assets/figma/s0-imgEyeIcon.svg");
const profiles = [
  ["administrador", "Admin", require("../../assets/figma/s0-imgVector.svg")],
  ["empleado", "Empleado", require("../../assets/figma/s0-imgVector1.svg")],
  ["facturador", "Cajero", require("../../assets/figma/s0-imgVector2.svg")],
];
export default function Login() {
  const { authenticate } = useApp();
  const [usuario, setUsuario] = useState(""),
    [password, setPassword] = useState(""),
    [expectedRole, setExpectedRole] = useState("administrador"),
    [visible, setVisible] = useState(false);
  const task = useTask();
  return (
    <SafeAreaView style={s.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            padding: 20,
            gap: 30,
          }}
        >
          <View style={{ gap: 32 }}>
            <View style={{ alignItems: "center", paddingTop: 36, gap: 16 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 18,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 38, fontWeight: "800" }}
                >
                  CM
                </Text>
              </View>
              <View style={{ alignItems: "center", gap: 4 }}>
                <Text style={[s.title, { fontSize: 26 }]}>
                  Comerciales Mely
                </Text>
                <Text style={s.subtitle}>Sistema de Ventas y Facturación</Text>
              </View>
            </View>
            <View style={{ gap: 20 }}>
              <View>
                <Text style={s.label}>Usuario o correo electrónico</Text>
                <View style={[s.input, s.row, { paddingVertical: 0 }]}>
                  <Image source={mail} style={{ width: 16, height: 16 }} />
                  <TextInput
                    accessibilityLabel="Usuario"
                    style={{
                      flex: 1,
                      minHeight: 48,
                      fontSize: 15,
                      color: colors.ink,
                    }}
                    value={usuario}
                    onChangeText={setUsuario}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="username"
                    placeholder="administrador@mely.com"
                  />
                </View>
              </View>
              <View>
                <View style={s.row}>
                  <Text style={s.label}>Contraseña</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      Alert.alert(
                        "Recuperación de acceso",
                        "En este avance local, solicita ayuda al administrador. Para las pruebas puedes usar las cuentas indicadas en Soporte. La recuperación por correo se integrará con Firebase.",
                      )
                    }
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#92400E",
                        fontWeight: "600",
                      }}
                    >
                      ¿Olvidó la clave?
                    </Text>
                  </Pressable>
                </View>
                <View style={[s.input, s.row, { paddingVertical: 0 }]}>
                  <Image source={lock} style={{ width: 16, height: 16 }} />
                  <TextInput
                    accessibilityLabel="Contraseña"
                    style={{
                      flex: 1,
                      minHeight: 48,
                      fontSize: 15,
                      color: colors.ink,
                    }}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!visible}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      visible ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onPress={() => setVisible((v) => !v)}
                    style={{
                      minHeight: 48,
                      minWidth: 32,
                      justifyContent: "center",
                    }}
                  >
                    <Image source={eye} style={{ width: 16, height: 16 }} />
                  </Pressable>
                </View>
              </View>
              <View>
                <Text style={s.label}>Rol de acceso</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {profiles.map(([id, label, icon]) => (
                    <Pressable
                      key={id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: expectedRole === id }}
                      onPress={() => setExpectedRole(id)}
                      style={{
                        flex: 1,
                        minHeight: 44,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor:
                          expectedRole === id ? colors.primary : colors.line,
                        backgroundColor:
                          expectedRole === id ? "#FEF3C7" : "white",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        gap: 4,
                      }}
                    >
                      <Image source={icon} style={{ width: 12, height: 12 }} />
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: expectedRole === id ? "#92400E" : colors.ink,
                        }}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <ErrorText text={task.error} />
            </View>
          </View>
          <View style={{ gap: 12 }}>
            <Button
              testID="login-submit"
              title={task.busy ? "Ingresando…" : "Iniciar sesión"}
              disabled={task.busy}
              onPress={() =>
                task.run(() =>
                  authenticate("login", { usuario, password, expectedRole }),
                )
              }
            />
            <Link href="/registro" style={s.link}>
              Crear cuenta de empleado o cajero
            </Link>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={s.small}>Uso exclusivo del personal. </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  Alert.alert(
                    "Soporte de demostración",
                    "Administrador: admin / admin123\nEmpleado: empleado / empleado123\nCajero: facturador / factura123\n\nDatos locales en SQLite. No se sincronizan con la web.",
                  )
                }
              >
                <Text
                  style={{ fontSize: 12, color: "#92400E", fontWeight: "600" }}
                >
                  Soporte
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
