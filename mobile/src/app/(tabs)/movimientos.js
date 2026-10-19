import React, { useState } from "react";
import { View, Text, Modal, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../../context/AppContext";
import { allowed } from "../../domain/business.mjs";
import {
  Screen,
  Card,
  Field,
  Button,
  Choice,
  Quantity,
  ErrorText,
  Empty,
  useTask,
} from "../../components/UI";
import { Image } from "expo-image";
import { styles as s } from "../../theme/theme";
export default function Movimientos() {
  const { user, state, mutate } = useApp();
  const [selected, setSelected] = useState(null),
    [picker, setPicker] = useState(false),
    [query, setQuery] = useState(""),
    [tipo, setTipo] = useState("entrada"),
    [cantidad, setCantidad] = useState(""),
    [nota, setNota] = useState("");
  const task = useTask();
  const product = state.productos.find((p) => p.id === selected);
  return (
    <Screen
      title="Registrar Movimiento"
      subtitle="Cada entrada y salida queda registrada."
    >
      {allowed(user, "movement") && (
        <View style={{ gap: 20 }}>
          <View>
            <Text style={s.label}>Producto</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Seleccionar producto"
              onPress={() => setPicker(true)}
              style={[s.input, s.row]}
            >
              <Text numberOfLines={1} style={{ flex: 1 }}>
                {product ? product.nombre : "Seleccionar producto"}
              </Text>
              <Image
                source={require("../../../assets/figma/s3-imgVector.svg")}
                style={{ width: 14, height: 14 }}
              />
            </Pressable>
            {product && (
              <Text style={{ color: "#92400E", fontSize: 12, marginTop: 6 }}>
                Stock actual en sala: {product.stock} unidades
              </Text>
            )}
          </View>
          <Choice
            values={[
              ["entrada", "Entrada (Ingreso)"],
              ["salida", "Salida (Egreso)"],
            ]}
            value={tipo}
            onChange={setTipo}
          />
          <Quantity
            label="Cantidad de Unidades"
            value={cantidad}
            onChange={setCantidad}
          />
          <Field
            label="Notas / Justificación"
            multiline
            style={[s.input, { height: 80, textAlignVertical: "top" }]}
            value={nota}
            onChangeText={setNota}
            autoCapitalize="sentences"
          />
          <ErrorText text={task.error} />
          <Button
            title={task.busy ? "Registrando…" : "Registrar Movimiento"}
            disabled={task.busy}
            onPress={() =>
              task.run(async () => {
                await mutate("movement", {
                  productoId: selected || "",
                  tipo,
                  cantidad,
                  nota,
                });
                setCantidad("");
                setNota("");
              })
            }
          />
        </View>
      )}
      <Text style={s.heading}>Historial de movimientos</Text>
      {!state.movimientos.length && (
        <Empty text="Aún no hay movimientos. Registra una entrada o realiza una venta." />
      )}
      {state.movimientos.map((m) => (
        <Card key={m.id}>
          <View style={s.row}>
            <Text style={[s.heading, { flex: 1 }]}>{m.nombre}</Text>
            <Text style={s.pillText}>
              {m.tipo === "entrada" ? "+" : "−"}
              {m.cantidad}
            </Text>
          </View>
          <Text style={s.subtitle}>{m.nota}</Text>
          <Text style={s.small}>
            {m.usuario} · {new Date(m.fecha).toLocaleString("es-SV")}
          </Text>
        </Card>
      ))}
      <Modal
        visible={picker}
        animationType="slide"
        onRequestClose={() => setPicker(false)}
      >
        <SafeAreaView style={s.screen}>
          <View style={s.content}>
            <Text style={s.title}>Elige un producto</Text>
            <Field label="Buscar" value={query} onChangeText={setQuery} />
            <Button secondary title="Cerrar" onPress={() => setPicker(false)} />
          </View>
          <FlatList
            data={state.productos.filter(
              (p) =>
                p.activo &&
                p.nombre.toLowerCase().includes(query.toLowerCase()),
            )}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ padding: 20, gap: 12 }}
            ListEmptyComponent={
              <Empty text="No hay productos que coincidan." />
            }
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Seleccionar ${item.nombre}`}
                onPress={() => {
                  setSelected(item.id);
                  setPicker(false);
                }}
              >
                <Card>
                  <Text style={s.heading}>{item.nombre}</Text>
                  <Text style={s.subtitle}>{item.stock} disponibles</Text>
                </Card>
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}
