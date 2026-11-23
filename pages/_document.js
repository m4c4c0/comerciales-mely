import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta name="description" content="Sistema de gestión de inventario, ventas y facturación para Comerciales Mely." />
        <meta name="theme-color" content="#0E2439" />
        {/* Tipografías cargadas por el navegador del usuario (no en build time),
            con la pila de fuentes del sistema como respaldo inmediato si la
            red no está disponible — ver tailwind.config.js */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
