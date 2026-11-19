# Firebase compartido

La web y la app móvil usan el proyecto `comerciales-mely` con Firebase Authentication y Cloud Firestore. El código adaptado de la implementación móvil del equipo conserva la atribución a [m4c4c0/comerciales-mely, commit `ed18d69`](docs/COLABORACION.md). Las reglas incluidas aquí restringen perfiles, catálogo, movimientos y facturas por rol.

## Variables locales

1. Copia `mobile/.env.example` como `mobile/.env` y completa los seis valores públicos de configuración de app que da Firebase Console → Project settings → Your apps.
2. Copia la misma configuración web a la raíz como `.env.local`, usando las variables `NEXT_PUBLIC_FIREBASE_*` de `.env.example`.
3. Para Google en Android, define `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` con el ID de cliente OAuth tipo Web de Firebase Authentication. Estos archivos están ignorados por Git.

## Firebase Console

1. Authentication → Sign-in method: habilita **Email/Password** y **Google**.
2. Authentication → Settings → Authorized domains: agrega `localhost` y el dominio Vercel una vez publicado.
3. Project settings → Your apps: registra Android con paquete `com.anonymous.comercialesmelymovil` y registra iOS si vas a compilar para iPhone.
4. Agrega la huella SHA-1 del certificado usado para compilar Android a la app Android de Firebase/Google Cloud. El Google Sign-In nativo requiere una compilación de desarrollo o APK; Expo Go no contiene su módulo nativo.
5. Publica las reglas de este repositorio:

```powershell
npx firebase-tools deploy --only firestore:rules --project comerciales-mely
```

El proyecto y las reglas también están definidos en `.firebaserc`, `firebase.json` y `firestore.rules`. La regla de stock exige que cada cambio de existencias vaya acompañado, en la misma operación Firestore, por el movimiento correspondiente.

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
