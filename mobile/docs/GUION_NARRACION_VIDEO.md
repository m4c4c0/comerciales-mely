# Guion para grabar la narración

Video: Comerciales-Mely-Android.mp4. Duración aproximada: 07:35. Sin audio ni textos superpuestos.

Lee únicamente los párrafos entre comillas. Los títulos y tiempos son referencias para la grabación y no se incorporan al video. Ajusta las pausas al recorrido; no hace falta hablar durante todas las esperas. El tramo inicial es una visualización del registro real de compilación, con las esperas resumidas, y el resto es una captura real del APK en Android 14.

## 00:00 - 01:15 | Proyecto y compilación

"Presentamos Comerciales Mely, la versión móvil del proyecto desarrollada con React Native y Expo para la etapa tres de DPS941. Conservamos como referencia la aplicación web y los mockups de Figma. En pantalla se muestran comandos y resultados del registro real de compilación en GitHub Actions. Primero se instalan las dependencias con npm ci. Después se ejecutan las once pruebas de negocio, lint y la revisión del proyecto. Expo genera el proyecto nativo Android con prebuild y Gradle produce un APK para teléfonos ARM64 y emuladores x86_64. El resultado BUILD SUCCESSFUL confirma que la compilación terminó. El APK incluye los recursos y el código de la aplicación; una vez instalado no depende de Metro. El manual adjunto explica cómo repetir la compilación y cómo instalar el resultado."

## 01:15 - 02:51 | Icono, acceso y validaciones

"Este es el icono instalado de Comerciales Mely: una bolsa comercial con la letra M. Abrimos la aplicación y comprobamos el acceso. Primero enviamos el formulario vacío; el sistema pide los datos obligatorios. Después utilizamos una contraseña incorrecta y el acceso es rechazado. Estos errores están controlados y no cierran la aplicación. Para continuar elegimos el perfil Admin y usamos la cuenta de demostración. El selector comprueba el perfil guardado; no concede permisos adicionales."

## 02:51 - 03:27 | Catálogo, navegación y movimientos

"Después del acceso aparece el catálogo con las imágenes, los colores y la navegación de Figma. Consultamos una ficha con fotografía, precio y existencias. Las pestañas enlazan Inventario, Movimientos, Alertas y Perfil. Ahora seleccionamos el set de vasos para registrar una entrada de dos unidades, con su justificación. Al guardar, el stock aumenta en dos y la operación queda en el historial. Las reglas del dominio validan cantidades enteras y rechazan salidas excesivas; estos casos también se comprueban en las pruebas automatizadas."

## 03:27 - 04:01 | Venta, comprobante y reportes

"Desde el perfil del administrador entramos a Ventas y facturación. Agregamos una unidad del mismo producto y confirmamos la venta. El sistema genera el comprobante, descuenta la unidad y registra el movimiento relacionado como una sola operación. Los importes se calculan en centavos para evitar errores de redondeo. Después consultamos los reportes: la venta aparece en el resumen y en la gráfica. Así comprobamos que los módulos trabajan con los mismos datos."

## 04:01 - 05:36 | Persistencia y permisos

"Cerramos y volvemos a abrir la aplicación para comprobar la persistencia. La sesión y las existencias siguen disponibles. Luego revisamos los perfiles Empleado y Cajero. El empleado puede trabajar con inventario y movimientos; el cajero dispone de ventas y reportes. La base local es SQLite y cada instalación conserva sus propios datos. SecureStore protege la referencia de sesión. En este avance no existe sincronización con la web ni se utiliza Firebase como si ya estuviera implementado."

## 05:36 - 06:16 | Registro con datos inválidos

"Volvemos al acceso y abrimos Crear cuenta. Probamos primero el formulario vacío. Luego completamos los datos pero escribimos una confirmación de contraseña diferente. La aplicación rechaza ambos casos y permite corregirlos. El registro público ofrece perfiles de empleado y facturador, pero no permite crear administradores."

## 06:16 - 07:13 | Registro válido y reingreso

"Corregimos la confirmación y registramos la cuenta. El perfil muestra que la cuenta fue creada y autenticada. Cerramos sesión y volvemos a ingresar con sus credenciales para comprobar que el usuario quedó guardado. Este flujo comprueba registro, acceso, persistencia y cierre de sesión con una cuenta nueva."

## 07:13 - 07:35 | Alertas y cierre

"Revisamos las alertas de stock y cerramos sesión. Entregamos código, APK, informe y manual. iOS está preparado para Xcode o EAS, pero todavía no se ha compilado ni probado en un iPhone."

## Incorporar tu voz al final

1. Abre el MP4 en tu editor de video y conserva su velocidad original.
2. Graba tu voz por bloques, con audífonos para evitar eco; puedes repetir un bloque sin volver a grabar todo.
3. Coloca cada grabación en el tiempo indicado y conserva silencios donde lo necesites.
4. Ajusta el volumen y exporta MP4 con la pista de voz. Revisa imagen, voz y duración máxima de 15 minutos.
5. Publica el video narrado y comparte el enlace solicitado por el aula. La versión muda se conserva como base.

No afirmes haber probado un iPhone, sincronizado Firebase o realizado aportes de otro integrante. La explicación debe corresponder a la versión demostrada.

## Índice de acciones observadas

- 01:31: Abrir APK instalado desde el icono Mely.
- 01:39: Login vacío: rechazo de datos obligatorios.
- 01:48: Credenciales incorrectas: acceso rechazado.
- 02:22: Recorrido de acceso, catálogo, movimientos, ventas, reportes y roles.
- 02:28: Inicio autónomo del APK y pantalla de acceso.
- 02:33: Validación de formulario vacío.
- 02:51: Autenticación y catálogo con recursos de Figma.
- 02:57: Navegación a ficha técnica con fotografía.
- 03:27: Entrada de bodega persistida y stock actualizado.
- 03:52: Venta confirmada con descuento transaccional de inventario.
- 04:01: Reportes y gráfica actualizados con la venta.
- 04:13: Datos y sesión conservados tras cerrar y reabrir la app.
- 04:48: Permisos diferenciados del empleado.
- 05:24: Permisos diferenciados del cajero.
- 05:36: Cierre de sesión revocado y retorno al acceso público.
- 05:36: Registro vacío: rechazo de datos obligatorios.
- 06:08: Registro con confirmación diferente: rechazo.
- 06:16: Registro correcto de empleado.
- 06:39: Cerrar sesión y volver a ingresar con la cuenta creada.
- 07:13: Alertas de existencias y navegación.
- 07:23: Cierre de sesión y fin del recorrido.
