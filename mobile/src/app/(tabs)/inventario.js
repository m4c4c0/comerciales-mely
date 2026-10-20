import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Modal,
  Alert,
  RefreshControl,
  Pressable,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { File, Paths } from "expo-file-system";
import { useApp } from "../../context/AppContext";
import { allowed, money } from "../../domain/business.mjs";
import FigmaImage from "../../components/FigmaImage";
import {
  Screen,
  Field,
  Button,
  ErrorText,
  Empty,
  useTask,
} from "../../components/UI";
import { styles as s, colors } from "../../theme/theme";

const blank = {
  nombre: "",
  categoria: "",
  precio: "",
  stock: "0",
  stockMinimo: "5",
  imagenUrl: "",
};
const editForm = (p) => ({
  ...p,
  precio: String(p.precioCentavos / 100),
  stock: String(p.stock),
  stockMinimo: String(p.stockMinimo),
});

export default function Inventario() {
  const { user, state, mutate, refresh } = useApp();
  const { edit } = useLocalSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [form, setForm] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const task = useTask();
  useEffect(() => {
    if (!edit || !allowed(user, "product")) return;
    const p = state.productos.find((p) => p.id === edit && p.activo);
    if (p) Promise.resolve().then(() => setForm(editForm(p)));
    router.setParams({ edit: undefined });
  }, [edit, state.productos, user]);
  const change = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const categories = [
    "Todos",
    ...new Set(state.productos.filter((p) => p.activo).map((p) => p.categoria)),
  ];
  const products = state.productos
    .filter(
      (p) =>
        p.activo &&
        (category === "Todos" || p.categoria === category) &&
        `${p.nombre} ${p.categoria}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => Number(!!b.imagenKey) - Number(!!a.imagenKey));
  async function picture(camera) {
    await task.run(async () => {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted)
          throw new Error(
            "Autoriza el acceso a la cámara desde Ajustes para tomar una foto.",
          );
      }
      const result = await (
        camera
          ? ImagePicker.launchCameraAsync
          : ImagePicker.launchImageLibraryAsync
      )({
        mediaTypes: ["images"],
        quality: 0.65,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        const extension =
          asset.mimeType === "image/png"
            ? "png"
            : asset.mimeType === "image/heic"
              ? "heic"
              : "jpg";
        const target = new File(
          Paths.document,
          `producto-${Date.now()}.${extension}`,
        );
        new File(asset.uri).copy(target);
        change("imagenUrl", target.uri);
      }
    });
  }
  return (
    <SafeAreaView edges={["top"]} style={s.screen}>
      <View style={{ padding: 20, paddingBottom: 12, gap: 12 }}>
        <View style={s.row}>
          <Text style={s.title}>Catálogo Mely</Text>
          {allowed(user, "product") && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Nuevo producto"
              onPress={() => setForm({ ...blank })}
              style={{
                minHeight: 44,
                minWidth: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 30, color: colors.primary }}>+</Text>
            </Pressable>
          )}
        </View>
        <View style={[s.input, s.row, { minHeight: 44, paddingVertical: 0 }]}>
          <Image
            source={require("../../../assets/figma/s1-imgVector.svg")}
            style={{ width: 16, height: 16 }}
          />
          <View style={{ flex: 1 }}>
            <Field
              label="Buscar producto o categoría"
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar producto o categoría..."
              compact
            />
          </View>
        </View>
        <ErrorText text={task.error} />
      </View>
      <View style={{ height: 48 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            gap: 8,
            paddingBottom: 12,
          }}
        >
          {categories.map((c) => (
            <Pressable
              key={c}
              accessibilityRole="button"
              accessibilityState={{ selected: category === c }}
              onPress={() => setCategory(c)}
              style={{
                minHeight: 36,
                paddingHorizontal: 16,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: category === c ? colors.primary : "white",
                borderWidth: 1,
                borderColor: colors.line,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: category === c ? "white" : colors.ink,
                }}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 0,
          paddingBottom: 24,
          gap: 12,
        }}
        ListEmptyComponent={
          <Empty text="No se encontraron productos. Cambia tu búsqueda o registra uno nuevo." />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              task.run(async () => {
                setRefreshing(true);
                try {
                  await refresh();
                } finally {
                  setRefreshing(false);
                }
              })
            }
          />
        }
        renderItem={({ item: p }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver ${p.nombre}`}
            onPress={() =>
              router.push({ pathname: "/producto", params: { id: p.id } })
            }
            style={[
              s.card,
              { padding: 12, borderRadius: 12, flexDirection: "row", gap: 12 },
            ]}
          >
            {p.imagenUrl || p.imagenKey ? (
              <FigmaImage product={p} style={s.image} />
            ) : (
              <View
                style={[
                  s.image,
                  { alignItems: "center", justifyContent: "center" },
                ]}
              >
                <Text style={{ fontSize: 24, color: colors.primary }}>▦</Text>
              </View>
            )}
            <View style={{ flex: 1, gap: 5 }}>
              <View style={s.row}>
                <Text
                  style={[
                    s.small,
                    { textTransform: "uppercase", fontSize: 11 },
                  ]}
                >
                  {p.categoria}
                </Text>
                <Text
                  style={{ color: colors.ink, fontWeight: "700", fontSize: 15 }}
                >
                  {money(p.precioCentavos)}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                style={{ color: colors.ink, fontWeight: "600", fontSize: 14 }}
              >
                {p.nombre}
              </Text>
              <View style={s.row}>
                <Text style={s.small}>{p.stock} uds</Text>
                <View
                  style={{
                    backgroundColor:
                      p.stock === 0
                        ? "#FEE2E2"
                        : p.stock <= p.stockMinimo
                          ? "#FEF3C7"
                          : "#D1FAE5",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 99,
                  }}
                >
                  <Text
                    style={{
                      color:
                        p.stock === 0
                          ? "#991B1B"
                          : p.stock <= p.stockMinimo
                            ? "#92400E"
                            : "#065F46",
                      fontWeight: "700",
                      fontSize: 11,
                    }}
                  >
                    {p.stock === 0
                      ? "Agotado"
                      : p.stock <= p.stockMinimo
                        ? "Stock bajo"
                        : "En stock"}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
      />
      <Modal
        visible={!!form}
        animationType="slide"
        onRequestClose={() => !task.busy && setForm(null)}
      >
        {form && (
          <Screen
            title={form.id ? "Editar producto" : "Nuevo producto"}
            subtitle="Completa los datos. Los movimientos conservan el historial de stock."
          >
            <Field
              label="Nombre"
              value={form.nombre}
              onChangeText={(v) => change("nombre", v)}
              autoCapitalize="sentences"
            />
            <Field
              label="Categoría"
              value={form.categoria}
              onChangeText={(v) => change("categoria", v)}
              autoCapitalize="words"
            />
            <Field
              label="Precio sin IVA ($)"
              value={form.precio}
              onChangeText={(v) => change("precio", v.replace(",", "."))}
              keyboardType="decimal-pad"
            />
            <Field
              label={
                form.id
                  ? "Stock actual (usar Bodega para modificar)"
                  : "Stock inicial"
              }
              value={form.stock}
              editable={!form.id}
              onChangeText={(v) => change("stock", v)}
              keyboardType="number-pad"
            />
            <Field
              label="Stock mínimo"
              value={form.stockMinimo}
              onChangeText={(v) => change("stockMinimo", v)}
              keyboardType="number-pad"
            />
            {!!form.imagenUrl && (
              <Image
                source={{ uri: form.imagenUrl }}
                style={{ width: 140, height: 140, borderRadius: 16 }}
              />
            )}
            <Button
              secondary
              title="Elegir imagen"
              disabled={task.busy}
              onPress={() => picture(false)}
            />
            <Button
              secondary
              title="Tomar foto"
              disabled={task.busy}
              onPress={() => picture(true)}
            />
            <ErrorText text={task.error} />
            <Button
              title={task.busy ? "Guardando…" : "Guardar producto"}
              disabled={task.busy}
              onPress={() =>
                task.run(async () => {
                  await mutate("product", form);
                  setForm(null);
                })
              }
            />
            {form.id && allowed(user, "remove") && (
              <Button
                danger
                title="Archivar producto"
                disabled={task.busy}
                onPress={() =>
                  Alert.alert(
                    "Archivar producto",
                    "El historial se conserva.",
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Archivar",
                        style: "destructive",
                        onPress: () =>
                          task.run(async () => {
                            await mutate("remove", { id: form.id });
                            setForm(null);
                          }),
                      },
                    ],
                  )
                }
              />
            )}
            <Button
              title="Cancelar"
              secondary
              disabled={task.busy}
              onPress={() => setForm(null)}
            />
          </Screen>
        )}
      </Modal>
    </SafeAreaView>
  );
}
