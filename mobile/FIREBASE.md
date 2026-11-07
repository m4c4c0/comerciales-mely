# Firebase en la app móvil (Foro 2)

La app usa **Firebase Authentication** (correo/contraseña y Google) y **Cloud Firestore**
(proyecto `comerciales-mely`, el mismo de la web). Los datos de productos, movimientos y facturas
se comparten con la web y cada movimiento/factura guarda el `usuarioId` del usuario autenticado.

## Configuración única en Firebase Console

1. **Authentication → Sign-in method**: habilitar *Correo electrónico/contraseña* y *Google*.
2. **Firestore → Reglas**: pegar el contenido de [`firestore.rules`](firestore.rules) y publicar.
3. **Google en Android** (opcional, solo para el botón «Continuar con Google»):
   - Authentication → Google → copiar el **Web client ID** (termina en `.apps.googleusercontent.com`).
   - Project settings → *Your apps* → agregar app Android con el paquete `com.anonymous.comercialesmelymovil`
     y la huella **SHA-1** de la llave con la que se firma la app (`gradlew signingReport` o `keytool`).
   - Crear `mobile/.env` con:
     ```
     EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=XXXXXXXX.apps.googleusercontent.com
     ```
   - El inicio con Google necesita módulo nativo: funciona en el APK / `expo run:android`, **no en Expo Go**.

El inicio por correo no necesita nada más.

## Modelo de datos (Firestore)

| Colección | Documento | Campos principales |
| --- | --- | --- |
| `usuarios` | `{uid}` | nombre, email, usuario, rol (`Administrador`/`Empleado`/`Facturador`), proveedor |
| `productos` | id | nombre, codigo, categoria, precio, precioCentavos, stock, stockMinimo, activo |
| `movimientos` | id | productoId, nombre, tipo, cantidad, nota/motivo, usuario, usuarioId, fecha |
| `facturas` | id | numero, cliente, items, subtotal, iva, total, usuario, usuarioId, fecha |

## Cuentas

Ya no existen cuentas de demostración locales. Crea tu cuenta desde **Crear cuenta** (empleado o cajero)
o entra con Google. Para tener un administrador, cambia el campo `rol` a `Administrador`
en `usuarios/{uid}` desde Firestore Console.

