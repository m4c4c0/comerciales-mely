import { Redirect } from "expo-router";
import { useApp } from "../context/AppContext";
export default function Index() {
  const { user } = useApp();
  return <Redirect href={user ? "/(tabs)/inventario" : "/login"} />;
}
