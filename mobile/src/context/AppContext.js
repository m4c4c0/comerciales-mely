import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { AppState } from "react-native";
import * as database from "../services/database";
const Context = createContext(null);
export function AppProvider({ children }) {
  const [user, setUser] = useState(null),
    [state, setState] = useState({
      productos: [],
      movimientos: [],
      facturas: [],
    }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const pending = useRef(false);
  const restore = useCallback(async () => {
    try {
      const result = await database.load();
      if (result) {
        setUser(result.user);
        setState(result.state);
      } else setUser(null);
      setError("");
    } catch (e) {
      setError(`No se pudo abrir la base de datos: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    Promise.resolve().then(restore);
    const subscription = AppState.addEventListener("change", (s) => {
      if (s === "active") restore();
    });
    return () => subscription.remove();
  }, [restore]);
  async function authenticate(method, data) {
    const result = await (method === "login"
      ? database.login(data)
      : database.register(data));
    setState(result.state);
    setUser(result.user);
  }
  async function logout() {
    await database.logout();
    setUser(null);
    setState({ productos: [], movimientos: [], facturas: [] });
  }
  async function mutate(action, input) {
    if (pending.current)
      throw new Error("Espera a que finalice la operación actual.");
    pending.current = true;
    try {
      const next = await database.mutate(action, input);
      setState(next);
      return next;
    } finally {
      pending.current = false;
    }
  }
  async function refresh() {
    try {
      setState(await database.refresh());
    } catch (e) {
      await restore();
      throw e;
    }
  }
  return (
    <Context.Provider
      value={{
        user,
        state,
        loading,
        error,
        restore,
        authenticate,
        logout,
        mutate,
        refresh,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error("AppProvider no está disponible.");
  return value;
}
