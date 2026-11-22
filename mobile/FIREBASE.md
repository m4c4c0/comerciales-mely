# Firebase compartido

La web y la app móvil usan el proyecto Firebase `comerciales-mely-final` (plan Spark) con Firebase Authentication y Cloud Firestore en `us-central1`. La app web y la app Android están registradas. Email/Password y Google están habilitados, y `comerciales-mely-web.vercel.app` está autorizado para OAuth. Las reglas de `../firestore.rules` fueron publicadas el 22 de noviembre de 2026. El código adaptado de la implementación móvil del equipo conserva la atribución a [m4c4c0/comerciales-mely, commit `ed18d69`](docs/COLABORACION.md).

## Variables locales

1. Copia `mobile/.env.example` como `mobile/.env` y `../.env.example` como `../.env.local`; completa ambos con la configuración de la app web que entrega Firebase Console → Project settings → Your apps.
2. En `mobile/.env`, completa `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` con el cliente OAuth tipo Web que muestra Authentication → Sign-in method → Google → Web SDK configuration.
3. Los dos archivos locales están ignorados por Git. La configuración Firebase de cliente se entrega a la app, pero no reemplaza las reglas de seguridad; nunca guardes contraseñas ni credenciales de servicio en ellos.

## Firebase Console

1. Authentication → Sign-in method: **Email/Password** y **Google** ya están habilitados.
2. Authentication → Settings → Authorized domains: ya incluye `localhost` y `comerciales-mely-web.vercel.app`. Agrega otros dominios de producción si se configuran.
3. Project settings → Your apps: Android está registrado con paquete `com.anonymous.comercialesmelymovil`; también hay una app web registrada.
4. La huella SHA-1 de depuración del equipo quedó agregada al registro Android de Firebase. Si firmas con otro keystore o publicas una APK, agrega también la huella SHA-1 de esa clave. Google Sign-In nativo requiere una compilación de desarrollo o APK; Expo Go no contiene su módulo nativo.
5. Las reglas ya están publicadas. Para publicar cambios futuros, usa:

```powershell
npx firebase-tools deploy --only firestore:rules --project comerciales-mely-final
```

El ID del proyecto se guarda en `../.firebaserc`; la definición de reglas está en `../firestore.rules`. Las reglas comprueban que los cambios de existencias y sus movimientos de entrada/salida se guarden juntos en la misma operación Firestore, también permiten registrar el movimiento inicial al crear un producto con existencias y validan cantidades, importes y roles.

## Primer administrador y datos iniciales

No hay cuentas ni contraseñas de demostración compartidas. Registra una cuenta real con correo y contraseña. Para el primer administrador, localiza su UID en Authentication y cambia `usuarios/{uid}.rol` a `Administrador` en Firestore Console. Luego administra las otras cuentas desde el módulo web **Usuarios**. Las reglas no permiten que el usuario cambie su propio rol.

Al entrar por primera vez en una base sin productos, una cuenta Empleado o Administrador puede inicializar el catálogo del prototipo móvil; la operación registra cada existencia como movimiento inicial. Un Facturador no puede inicializar ni editar inventario.

## Modelo compatible entre web y móvil

| Colección | Documento | Datos compartidos |
| --- | --- | --- |
| `usuarios` | UID de Firebase Auth | nombre, correo, nombre de usuario, rol, proveedor |
| `productos` | ID de producto | nombre, categoría, precio, centavos, stock, stock mínimo, estado, imagen |
| `movimientos` | ID de movimiento | producto, tipo, cantidad, motivo, usuario/UID, fecha |
| `facturas` | ID de factura | número, cliente, detalle, subtotal, IVA, total, usuario/UID, fecha |

Ventas y movimientos actualizan existencias dentro de transacciones Firestore. Cada venta escribe su factura, descuento de stock y movimientos de salida juntos. Los formularios de ambas plataformas leen y escriben las mismas colecciones.

## Revisión de colaboración

`mobile/src/services/database.js` se adaptó de la implementación del equipo en el repositorio colaborador. Se retiró la dependencia de almacenamiento local SQLite para autenticación e inventario. La procedencia se registra en [`docs/COLABORACION.md`](docs/COLABORACION.md); revisa ese archivo y los commits de cada integrante antes de la defensa.
