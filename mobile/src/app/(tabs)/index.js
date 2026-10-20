import React from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { useApp } from "../../context/AppContext";
import { report, money, allowed } from "../../domain/business.mjs";
import { Screen, Card, Button } from "../../components/UI";
import { styles as s } from "../../theme/theme";
export default function Dashboard() {
  const { user, state } = useApp();
  const r = report(state);
  return (
    <Screen
      title={`Hola, ${user.nombre.split(" ")[0]}`}
      subtitle="Este es el estado de tu negocio."
    >
      <View style={s.hero}>
        <Text style={s.heroCaption}>
          COMERCIALES MELY · {user.rol.toUpperCase()}
        </Text>
        <Text style={s.heroText}>Cada producto cuenta.</Text>
        <Text style={s.heroCaption}>
          Gestiona tus existencias y mantén tu operación al día.
        </Text>
      </View>
      <View style={s.wrap}>
        {[
          ["Productos", r.productos],
          ["Stock bajo", r.bajos.length],
          ...(allowed(user, "reports")
            ? [
                ["Ventas de hoy", money(r.ventasHoy)],
                ["Comprobantes", r.facturas],
              ]
            : []),
        ].map(([label, value]) => (
          <View key={label} style={[s.card, { flexGrow: 1, minWidth: "44%" }]}>
            <Text style={s.subtitle}>{label}</Text>
            <Text style={s.number}>{value}</Text>
          </View>
        ))}
      </View>
      <Text style={s.heading}>Accesos rápidos</Text>
      <Button
        title="Consultar inventario"
        onPress={() => router.push("/inventario")}
      />
      {allowed(user, "invoice") && (
        <Button
          title="Registrar una venta"
          secondary
          onPress={() => router.push("/facturacion")}
        />
      )}
      <Card>
        <Text style={s.heading}>Atención a existencias</Text>
        {r.bajos.length ? (
          r.bajos.map((p) => (
            <View key={p.id} style={s.row}>
              <Text style={{ flex: 1 }}>{p.nombre}</Text>
              <Text style={s.error}>
                {p.stock} / mín. {p.stockMinimo}
              </Text>
            </View>
          ))
        ) : (
          <Text style={s.subtitle}>
            Todos los productos tienen stock suficiente.
          </Text>
        )}
      </Card>
      <Text style={s.small}>
        Datos locales en este dispositivo. Las ventas generan comprobantes
        académicos.
      </Text>
    </Screen>
  );
}
