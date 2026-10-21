import React from "react";
import { Image } from "expo-image";
const images = {
  cesta: require("../../assets/figma/s1-imgProductThumbnail.png"),
  espejo: require("../../assets/figma/s1-imgProductThumbnail1.png"),
  pulsera: require("../../assets/figma/s1-imgProductThumbnail2.png"),
  vasos: require("../../assets/figma/s1-imgProductThumbnail3.png"),
};
export default function FigmaImage({ product, style, detail = false }) {
  const source = product.imagenUrl
    ? { uri: product.imagenUrl }
    : detail && product.imagenKey === "espejo"
      ? require("../../assets/figma/s2-imgLargeProductPhoto.png")
      : images[product.imagenKey];
  return source ? (
    <Image
      accessibilityLabel={product.nombre}
      source={source}
      style={style}
      contentFit="cover"
    />
  ) : null;
}
