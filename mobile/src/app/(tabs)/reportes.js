import React from "react";
import { View, Text } from "react-native";
import { Redirect } from "expo-router";
import { useApp } from "../../context/AppContext";
import { report, money, allowed } from "../../domain/business.mjs";
import { Screen, Card, Empty } from "../../components/UI";
import { styles as s, colors } from "../../theme/theme";
export default function Reportes() {
  const { user, state } = useApp();
  if (!allowed(user, "reports")) return <Redirect href="/" />;
  const r = report(state);
  const max = Math.max(1, ...r.days.map((d) => d.total));
  return (
    <Screen
      title="Tu negocio en cifras"
      subtitle="Ventas y existencias · Últimos siete días."
    >
      <Card>
        <Text style={s.subtitle}>Ventas de hoy</Text>
        <Text style={s.number}>{money(r.ventasHoy)}</Text>
        <Text style={s.subtitle}>{r.facturas} comprobantes emitidos</Text>
      </Card>
      <Card>
        <Text style={s.heading}>Ventas diarias ($ con IVA)</Text>
        <View
          accessibilityLabel="Gráfica de ventas de los últimos siete días"
          style={{
            flexDirection: "row",
            height: 210,
            gap: 6,
            alignItems: "flex-end",
          }}
        >
          {r.days.map((d) => (
            <View
              key={d.fecha}
              style={{ flex: 1, alignItems: "center", gap: 6 }}
              accessible
              accessibilityLabel={`${d.fecha}: ${money(d.total)}`}
            >
              <Text numberOfLines={1} adjustsFontSizeToFit style={s.small}>
                {money(d.total)}
              </Text>
              <View
                style={{
                  height: Math.max(3, (d.total / max) * 150),
                  width: "70%",
                  backgroundColor: colors.teal,
                  borderTopLeftRadius: 5,
                  borderTopRightRadius: 5,
                }}
              />
              <Text style={s.small}>{d.fecha.slice(5)}</Text>
            </View>
          ))}
        </View>
        {r.days.every((d) => !d.total) && (
          <Empty text="La gráfica mostrará los importes cuando registres ventas." />
        )}
      </Card>
      <Card>
        <Text style={s.heading}>Valor del inventario</Text>
        <Text style={s.number}>{money(r.valor)}</Text>
        <Text style={s.small}>
          Valor a precio de venta sin IVA; no representa utilidad.
        </Text>
      </Card>
      <Card>
        <Text style={s.heading}>Reposición prioritaria</Text>
        {r.bajos.length ? (
          r.bajos.map((p) => (
            <View key={p.id} style={s.row}>
              <Text style={{ flex: 1 }}>{p.nombre}</Text>
              <Text style={s.error}>
                {p.stock} / {p.stockMinimo}
              </Text>
            </View>
          ))
        ) : (
          <Empty text="No hay alertas de stock." />
        )}
      </Card>
    </Screen>
  );
}
