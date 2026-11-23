import { AuthProvider } from "../context/AuthContext";
import { InventarioProvider } from "../context/InventarioContext";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="font-sans">
      <AuthProvider>
        <InventarioProvider>
          <Component {...pageProps} />
        </InventarioProvider>
      </AuthProvider>
    </div>
  );
}
