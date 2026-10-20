import React from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { useApp } from "../../context/AppContext";
import { allowed, money } from "../../domain/business.mjs";
import FigmaImage from "../../components/FigmaImage";
import { Screen, Card, Button, Empty } from "../../components/UI";
import { styles as s, colors } from "../../theme/theme";
export default function Producto() {
  const { id } = useLocalSearchParams();
  const { user, state } = useApp();
  const p = state.productos.find((p) => p.id === id && p.activo);
  const edit = () =>
    router.replace({ pathname: "/inventario", params: { edit: p.id } });
  return (
    <Screen>
      <View style={[s.row, { minHeight: 56 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver al inventario"
          onPress={() => router.replace("/inventario")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            minHeight: 48,
          }}
        >
          <Image
            source={require("../../../assets/figma/s2-imgVector.svg")}
            style={{ width: 16, height: 16 }}
          />
          <Text style={{ color: colors.primary, fontWeight: "600" }}>
            Inventario
          </Text>
        </Pressable>
        <Text style={[s.heading, { fontSize: 16 }]}>Ficha Técnica</Text>
        <View style={{ width: 32 }} />
      </View>
      {!p ? (
        <Empty text="Este producto no está disponible." />
      ) : (
        <>
          <FigmaImage
            product={p}
            detail
            style={{
              height: 220,
              width: "100%",
              borderRadius: 16,
              backgroundColor: "white",
            }}
          />
          <View style={s.row}>
            <View
              style={{
                backgroundColor: "#FEF3C7",
                padding: 8,
                borderRadius: 6,
              }}
            >
              <Text
                style={{ fontSize: 12, color: "#92400E", fontWeight: "700" }}
              >
                {p.categoria.toUpperCase()}
              </Text>
            </View>
            <Text style={[s.heading, { fontSize: 24 }]}>
              {money(p.precioCentavos)} USD
            </Text>
          </View>
          <Text style={[s.heading, { fontSize: 20 }]}>{p.nombre}</Text>
          <Card>
            <View style={s.row}>
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={s.small}>Stock Actual</Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.primary,
                  }}
                >
                  {p.stock} unidades
                </Text>
              </View>
              <View
                style={{ width: 1, height: 40, backgroundColor: colors.line }}
              />
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={s.small}>Umbral Mínimo</Text>
                <Text style={s.heading}>{p.stockMinimo} unidades</Text>
              </View>
            </View>
          </Card>
          <Text style={s.label}>Descripción del Catálogo</Text>
          <Text style={s.subtitle}>
            {p.imagenKey === "espejo"
              ? "Espejo con luz led incorporada, regulador de intensidad táctil, batería recargable vía USB. Ideal para maquillaje profesional y cuidado facial."
              : `${p.nombre}. Producto de la categoría ${p.categoria}, disponible en Comerciales Mely.`}
          </Text>
          {allowed(user, "product") && (
            <View style={{ gap: 12, marginTop: 24 }}>
              <Button
                secondary
                title="Actualizar Fotografía"
                icon={
                  <Image
                    source={require("../../../assets/figma/s2-imgVector1.svg")}
                    style={{ width: 18, height: 18 }}
                  />
                }
                onPress={edit}
              />
              <Button title="Editar Producto" onPress={edit} />
            </View>
          )}
        </>
      )}
    </Screen>
  );
}
