import React, { useState, useRef } from "react";
import { View, Text, Modal, FlatList, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { useApp } from "../../context/AppContext";
import { allowed, money, totals } from "../../domain/business.mjs";
import { shareReceipt } from "../../services/receipt";
import {
  Screen,
  Card,
  Field,
  Button,
  ErrorText,
  Empty,
  useTask,
} from "../../components/UI";
import { styles as s } from "../../theme/theme";
export default function Facturacion() {
  const { user, state, mutate } = useApp();
  const [cart, setCart] = useState([]),
    [cliente, setCliente] = useState("Consumidor final"),
    [picker, setPicker] = useState(false),
    [query, setQuery] = useState("");
  const task = useTask();
  const emitting = useRef(false);
  if (!allowed(user, "invoice")) return <Redirect href="/" />;
  const details = cart.map((i) => ({
    ...i,
    ...state.productos.find((p) => p.id === i.productoId),
  }));
  const total = totals(details);
  function add(product) {
    setCart((items) => {
      const found = items.find((i) => i.productoId === product.id);
      return found
        ? items.map((i) =>
            i.productoId === product.id
              ? { ...i, cantidad: i.cantidad + 1 }
              : i,
          )
        : [...items, { productoId: product.id, cantidad: 1 }];
    });
    setPicker(false);
  }
  async function emit() {
    if (emitting.current) return;
    emitting.current = true;
    try {
      await mutate("invoice", { cliente, items: cart });
      setCart([]);
      Alert.alert(
        "Venta registrada",
        "Se descontaron las existencias y se guardó el comprobante.",
      );
    } finally {
      emitting.current = false;
    }
  }
  return (
    <Screen
      title="Nueva venta"
      subtitle="Precios sin IVA · Impuesto calculado al emitir."
    >
      <Field
        label="Nombre del cliente"
        value={cliente}
        onChangeText={setCliente}
        autoCapitalize="words"
      />
      <Button title="+ Agregar producto" onPress={() => setPicker(true)} />
      {!cart.length && (
        <Empty text="Tu venta está vacía. Agrega productos disponibles para comenzar." />
      )}
      {details.map((item) => (
        <Card key={item.productoId}>
          <Text style={s.heading}>
            {item.nombre || "Producto no disponible"}
          </Text>
          <Text style={s.subtitle}>
            {money(item.precioCentavos)} · Stock: {item.stock}
          </Text>
          <Field
            label={`Cantidad: ${item.nombre}`}
            value={String(item.cantidad)}
            onChangeText={(value) =>
              setCart((items) =>
                items.map((i) =>
                  i.productoId === item.productoId
                    ? {
                        ...i,
                        cantidad: /^\d+$/.test(value) ? Number(value) : 0,
                      }
                    : i,
                ),
              )
            }
            keyboardType="number-pad"
          />
          <Button
            secondary
            title="Quitar producto"
            onPress={() =>
              setCart((items) =>
                items.filter((i) => i.productoId !== item.productoId),
              )
            }
          />
        </Card>
      ))}
      <Card>
        {[
          ["Subtotal", total.subtotal],
          ["IVA (13 %)", total.iva],
          ["Total", total.total],
        ].map(([label, value]) => (
          <View key={label} style={s.row}>
            <Text style={s.heading}>{label}</Text>
            <Text style={s.heading}>{money(value)}</Text>
          </View>
        ))}
        <ErrorText text={task.error} />
        <Button
          title={task.busy ? "Procesando…" : "Emitir comprobante"}
          disabled={!cart.length || task.busy}
          onPress={() =>
            Alert.alert(
              "Confirmar venta",
              `Total ${money(total.total)}. Se descontará el inventario.`,
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Confirmar", onPress: () => task.run(emit) },
              ],
            )
          }
        />
      </Card>
      <Text style={s.heading}>Comprobantes emitidos</Text>
      {!state.facturas.length && <Empty text="Aún no hay comprobantes." />}
      {state.facturas.map((f) => (
        <Card key={f.id}>
          <View style={s.row}>
            <Text style={s.heading}>{f.numero}</Text>
            <Text style={s.heading}>{money(f.total)}</Text>
          </View>
          <Text style={s.subtitle}>
            {f.cliente} · {f.items.reduce((n, i) => n + i.cantidad, 0)} unidades
          </Text>
          <Text style={s.small}>
            {new Date(f.fecha).toLocaleString("es-SV")} · {f.usuario}
          </Text>
          <Button
            title="Compartir comprobante PDF"
            secondary
            disabled={task.busy}
            onPress={() => task.run(() => shareReceipt(f))}
          />
        </Card>
      ))}
      <Modal
        visible={picker}
        animationType="slide"
        onRequestClose={() => setPicker(false)}
      >
        <SafeAreaView style={s.screen}>
          <View style={s.content}>
            <Text style={s.title}>Productos disponibles</Text>
            <Field
              label="Buscar producto"
              value={query}
              onChangeText={setQuery}
            />
            <Button secondary title="Cerrar" onPress={() => setPicker(false)} />
          </View>
          <FlatList
            data={state.productos.filter(
              (p) =>
                p.activo &&
                p.stock > 0 &&
                p.nombre.toLowerCase().includes(query.toLowerCase()),
            )}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ padding: 20, gap: 12 }}
            ListEmptyComponent={
              <Empty text="No hay productos disponibles con esa búsqueda." />
            }
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Agregar ${item.nombre}`}
                onPress={() => add(item)}
              >
                <Card>
                  <Text style={s.heading}>{item.nombre}</Text>
                  <Text style={s.subtitle}>
                    {money(item.precioCentavos)} · {item.stock} disponibles
                  </Text>
                </Card>
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}
