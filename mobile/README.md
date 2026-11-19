# Comerciales Mely - aplicación multiplataforma móvil

Guía rápida de instalación y entrega: [ENTREGA.md](ENTREGA.md).

Proyecto React Native/Expo para DPS941, Universidad Don Bosco, Ciclo II-2026. Etapa 3, Avance 1. Equipo R.E.F.E.S.

Repositorio compartido: https://github.com/m4c4c0/comerciales-mely

Referencia web adicional: https://github.com/wilfredo409/comerciales-mely-web

Prototipo original: https://www.figma.com/proto/11GPTpTj3RrHusfOA9qqOr/?node-id=4-1226

## Instalación

Requiere Node.js >=22.13, npm y, para compilación local Android, Android Studio con SDK, NDK y JDK compatibles con Expo SDK 58. El script utiliza el JDK de Android Studio y prepara Ninja 1.13.2 dentro de tools/native, verificando la huella oficial para admitir rutas largas de Windows. No es necesario cambiar el Java global de Windows.

```powershell
npm ci
npm run start
```

`npm run start` sirve para desarrollo con Expo Go compatible o con una compilación de desarrollo. Para entregar una app autónoma utiliza el APK release:

```powershell
npm run build:android
```

Resultado esperado: `output/android/Comerciales-Mely-etapa3.apk`. Incluye JavaScript y recursos; funciona sin Metro. Firma de demostración, no preparada para publicación en Play Store. ABI: arm64-v8a para teléfonos modernos y x86_64 para emuladores.

```powershell
adb install -r output/android/Comerciales-Mely-etapa3.apk
```

## iOS

En Mac: instalar Xcode y ejecutar `npm run ios`. Desde Windows, iniciar sesión en Expo con `npx eas-cli@latest login`, vincular el proyecto mediante `npx eas-cli@latest init` y ejecutar `npm run build:ios`. El perfil `preview` requiere credenciales y dispositivos Apple para un IPA instalable. El perfil `ios-simulator` genera una compilación para simulador de Mac; no se instala en iPhone.

```powershell
npx eas-cli@latest build --platform ios --profile ios-simulator
```

La exportación de JavaScript para iOS no equivale a una compilación firmada ni a una prueba en iPhone. Consultar el estado real en `docs/CRITERIOS.md` y `output/evidence/VERIFICACION.md`.

## Cuentas y acceso

La app usa Firebase Authentication con correo y contraseña o Google. No incluye contraseñas de demostración. El registro móvil permite crear cuentas de Empleado o Facturador; no permite elevarse a Administrador. Para el primer administrador, consulta [FIREBASE.md](FIREBASE.md). El selector en la pantalla de login comprueba el rol de la cuenta; no concede permisos.

## Funcionalidad

- Login, registro, sesión persistida por Firebase, recuperación de contraseña por correo, Google Sign-In y cierre de sesión.
- Catálogo con búsqueda, filtros por categoría, detalle, creación/edición y archivo por administrador.
- Selección de imágenes o captura con cámara, con copia al almacenamiento persistente.
- Bodega: entradas/salidas con motivo, validación de existencias y trazabilidad.
- Ventas: carrito, IVA del 13 % de la propuesta académica, control de stock, comprobante y exportación PDF.
- Alertas de stock, dashboard y reportes con gráfica de siete días.
- Context API para el estado de interfaz; Firebase Authentication y Cloud Firestore para la persistencia compartida con la web.

La barra principal conserva Inventario, Movimientos, Alertas y Perfil del Figma. Desde Perfil se accede al resumen, ventas y reportes. Las pantallas adicionales son extensiones funcionales de la propuesta. Sus botones se ocultan con `tabBarButton` y `tabBarItemStyle`: en Router 58, `href: null` redirige y no sirve para estas rutas accesibles desde Perfil.

## Arquitectura

| Capa | Ubicación | Responsabilidad |
| --- | --- | --- |
| UI | src/app, src/components | Rutas, formularios, listas, mensajes y presentación |
| Estado | src/context/AppContext.js | Sesión y datos compartidos, actualización después de operaciones |
| Lógica | src/domain/business.mjs | Validación Zod, permisos, stock, impuestos e informes |
| Datos | src/services/database.js | Firebase Authentication, perfiles y transacciones de Cloud Firestore |
| Exportación | src/services/receipt.js | Creación y compartición del comprobante académico |
| Diseño | src/theme, assets/figma | Tokens y recursos originales descargados de Figma |

Las ventas validan todas las líneas y agrupan productos repetidos. Una transacción Firestore guarda descuentos de stock, movimientos y factura juntos. Los cambios se ven en la web y el móvil al actualizar sus datos. La autorización se comprueba en la lógica de negocio y en [firestore.rules](../firestore.rules). Se usan centavos para importes y fechas ISO para los reportes diarios.

La configuración y el modelo común están en [FIREBASE.md](FIREBASE.md). El código Firebase móvil fue adaptado de la implementación del equipo y lleva su atribución en [`docs/COLABORACION.md`](docs/COLABORACION.md). Los recursos de imagen elegidos en un teléfono pueden seguir siendo locales; para compartirlos entre dispositivos se necesita habilitar Firebase Storage y cargar imágenes allí.

## Verificación

```powershell
npm test
npm run lint
npm run typecheck
npm run export:mobile
```

Los tests verifican reglas de negocio. El proyecto está escrito en JavaScript; `typecheck` usa TypeScript para revisión sintáctica de los archivos, sin afirmar cobertura completa de tipos. Las evidencias de compilación y ejecución se registran por separado.

## Documentación y entrega

- `docs/INFORME_ETAPA3_AVANCE1.md`: fuente editable del informe técnico.
- `output/pdf/Informe_Etapa3_Avance1_Comerciales_Mely.pdf`: informe generado con formato APA 7.
- `docs/GUION_VIDEO.md`: recorrido sugerido de 12-14 minutos y preguntas de defensa.
- `docs/CRITERIOS.md`: matriz de evaluación con evidencias y pendientes.
- `output/evidence/`: capturas y resultados reales de validación.

El enlace de video debe publicarse y comprobarse antes de entregar en Aula Digital. Los integrantes deben participar y registrar sus commits reales. No se fabrican contribuciones ni resultados de iPhone.

## Diseño verificado

Archivo Figma: `11GPTpTj3RrHusfOA9qqOr`.

| Pantalla | Nodo |
| --- | --- |
| Login móvil | 4:1226 |
| Inventario móvil | 4:1275 |
| Ficha de producto | 4:1363 |
| Movimiento | 4:1406 |
| Alertas | 4:1467 |

Se conservan fondo #F3F4F6, naranja #D97706, texto #111827, bordes #E5E7EB, Inter y los recursos originales locales. Las barras del sistema se delegan a Android/iOS. La app añade registro y operaciones que el prototipo representa visualmente; el usuario/correo admite compatibilidad con las cuentas de la web.


## Repositorio del equipo

Código móvil: https://github.com/m4c4c0/comerciales-mely/tree/etapa3/avance1-movil-20261018/mobile

Los cinco colaboradores ya tienen acceso. Sus cuentas y ramas reales están documentadas en `docs/COLABORACION.md`. La portada y docente se contrastaron con el README compartido. Guía para completar la plataforma Apple: `docs/IOS_PREPARACION.md`.


## Estado de compilación y verificación

La versión actual usa Firebase y requiere que estén desplegadas las reglas de Firestore. `npm test`, `npm run lint`, `npm run typecheck` y `npm run export:mobile` validan el código y los bundles, pero la exportación JavaScript no es una APK instalable ni sustituye una prueba en Android.

La compilación Android actual necesita Android Studio, su SDK/NDK, JDK y Ninja. El script obtiene Ninja si aún no está instalado; si la red está restringida, instálalo por un canal confiable y vuelve a ejecutar `npm run build:android`. La ejecución realizada durante esta entrega no pudo descargar Ninja por falta de conexión al host, por lo que el APK legado de `output/android` no debe usarse para probar Firebase.

Las capturas, APK y registros de `output/evidence` y `output/android` corresponden a la entrega anterior con SQLite y cuentas locales. Se conservan como historial académico; no son pruebas de la implementación Firebase actual. Repite el recorrido con una APK recién compilada antes de presentar el estado móvil como probado. iOS requiere macOS/Xcode o EAS y credenciales de firma Apple para generar una IPA instalable.
