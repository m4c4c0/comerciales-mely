import React from "react";
import { Tabs } from "expo-router";
import { Image } from "expo-image";
import { colors } from "../../theme/theme";
const icons = {
  inventario: require("../../../assets/figma/s1-imgIconBox.svg"),
  movimientos: require("../../../assets/figma/s1-imgIconBox1.svg"),
  alertas: require("../../../assets/figma/s1-imgIconBox2.svg"),
  cuenta: require("../../../assets/figma/s1-imgIconBox3.svg"),
};
const icon = (name) =>
  function TabIcon({ color }) {
    return (
      <Image
        source={icons[name]}
        style={{ width: 24, height: 24 }}
        tintColor={color}
      />
    );
  };
export default function Layout() {
  return (
    <Tabs
      initialRouteName="inventario"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { height: 85, paddingBottom: 18, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="inventario"
        options={{ title: "Inventario", tabBarIcon: icon("inventario") }}
      />
      <Tabs.Screen
        name="movimientos"
        options={{ title: "Movimientos", tabBarIcon: icon("movimientos") }}
      />
      <Tabs.Screen
        name="alertas"
        options={{ title: "Alertas", tabBarIcon: icon("alertas") }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{ title: "Perfil", tabBarIcon: icon("cuenta") }}
      />
      {["index", "facturacion", "reportes", "producto"].map((name) => (
        <Tabs.Screen key={name} name={name} options={{ tabBarButton: () => null, tabBarItemStyle: { display: "none" } }} />
      ))}
    </Tabs>
  );
}
