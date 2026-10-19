import React from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useApp } from "../../context/AppContext";
import { report } from "../../domain/business.mjs";
import { Screen, Empty } from "../../components/UI";
import { styles as s, colors } from "../../theme/theme";
export default function Alertas() {
  const { state } = useApp();
  const { bajos } = report(state);
  return (
    <Screen>
      <View style={s.row}>
        <View>
          <Text style={s.title}>Alertas de Stock</Text>
          <Text style={s.subtitle}>Atención urgente requerida</Text>
        </View>
        <Image
          source={require("../../../assets/figma/s4-imgBellIconWrap.svg")}
          style={{ width: 40, height: 40 }}
        />
      </View>
      {bajos.length ? (
        bajos.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            onPress={() =>
              router.push({ pathname: "/producto", params: { id: p.id } })
            }
            style={[
              s.card,
              {
                padding: 14,
                borderColor: p.stock === 0 ? "#FECACA" : "#FED7AA",
                gap: 12,
              },
            ]}
          >
            <View style={s.row}>
              <View
                style={{
                  backgroundColor: colors.paper,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text style={s.small}>{p.categoria}</Text>
              </View>
              <View
                style={{
                  backgroundColor: p.stock === 0 ? "#FEE2E2" : "#FEF3C7",
                  borderRadius: 20,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: p.stock === 0 ? "#991B1B" : "#92400E",
                  }}
                >
                  {p.stock === 0 ? "Crítico" : "Advertencia"}
                </Text>
              </View>
            </View>
            <Text style={[s.heading, { fontSize: 15 }]}>{p.nombre}</Text>
            <Text style={s.subtitle}>
              Cantidad en Bodega:{" "}
              <Text
                style={{
                  fontWeight: "700",
                  color: p.stock === 0 ? colors.red : colors.amber,
                }}
              >
                {p.stock} uds
              </Text>{" "}
              de un límite de {p.stockMinimo} uds
            </Text>
          </Pressable>
        ))
      ) : (
        <Empty text="No hay productos con stock bajo. Tu inventario está al día." />
      )}
    </Screen>
  );
}
