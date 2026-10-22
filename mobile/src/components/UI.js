import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles as s, colors } from "../theme/theme";
export function Button({
  title,
  onPress,
  secondary = false,
  danger = false,
  disabled = false,
  testID,
  icon,
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        icon && { flexDirection: "row", gap: 8 },
        secondary && s.secondary,
        danger && { backgroundColor: colors.red },
        (disabled || pressed) && { opacity: 0.55 },
      ]}
    >
      {icon}
      <Text style={[s.buttonText, secondary && s.secondaryText]}>{title}</Text>
    </Pressable>
  );
}
export const Field = React.forwardRef(function Field(
  {
    label,
    value,
    onChangeText,
    secureTextEntry = false,
    compact = false,
    ...props
  },
  ref,
) {
  return (
    <View>
      {!compact && <Text style={s.label}>{label}</Text>}
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          s.input,
          compact && {
            borderWidth: 0,
            paddingHorizontal: 0,
            minHeight: 44,
            paddingVertical: 8,
            fontSize: 14,
          },
        ]}
        {...props}
      />
    </View>
  );
});
export function Screen({ title, subtitle, children, scroll = true }) {
  const body = (
    <View style={s.content}>
      {title && (
        <Text accessibilityRole="header" style={s.title}>
          {title}
        </Text>
      )}
      {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      {children}
    </View>
  );
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={s.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView keyboardShouldPersistTaps="handled">{body}</ScrollView>
        ) : (
          body
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Card({ children }) {
  return <View style={s.card}>{children}</View>;
}
export function Empty({ text }) {
  return <Text style={s.empty}>{text}</Text>;
}
export function ErrorText({ text }) {
  return text ? (
    <Text accessibilityRole="alert" style={s.error}>
      {text}
    </Text>
  ) : null;
}
export function Choice({ values, value, onChange }) {
  return (
    <View style={s.wrap}>
      {values.map(([id, label]) => (
        <Pressable
          key={id}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === id }}
          onPress={() => onChange(id)}
          style={[s.button, s.secondary, value === id && s.selected]}
        >
          <Text style={[s.secondaryText, value === id && { color: "#92400E" }]}>
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
export function useTask() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function run(task) {
    setError("");
    setBusy(true);
    try {
      return await task();
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, run };
}
export function Loading() {
  return (
    <View
      style={[
        s.screen,
        { alignItems: "center", justifyContent: "center", gap: 16 },
      ]}
    >
      <ActivityIndicator size="large" color={colors.navy} />
      <Text style={s.subtitle}>Preparando Comerciales Mely…</Text>
    </View>
  );
}

export function Quantity({ label, value, onChange }) {
  return (
    <View>
      <Text style={s.label}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Disminuir cantidad"
          onPress={() =>
            onChange(String(Math.max(1, (Number(value) || 1) - 1)))
          }
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.line,
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 22 }}>−</Text>
        </Pressable>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChange}
          keyboardType="number-pad"
          style={[
            s.input,
            {
              width: 80,
              textAlign: "center",
              borderColor: colors.primary,
              fontSize: 18,
              fontWeight: "700",
            },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Aumentar cantidad"
          onPress={() => onChange(String((Number(value) || 0) + 1))}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.line,
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 22 }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
