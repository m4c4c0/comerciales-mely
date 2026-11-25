# Integración de Firebase Authentication y Cloud Firestore en React Native: Sistema Móvil Comerciales Mely

**Universidad Don Bosco**  
Facultad de Ingeniería · Escuela de Computación  
**Asignatura:** Diseño y Programación de Software Multiplataforma (DPS941)  
**Ciclo:** II-2026 · **Equipo:** R.E.F.E.S  
**Evaluación:** Etapa 3 — Segunda Entrega de Avance (Foro de Discusión 2)  
**Docente:** Ing. Alexander Alberto Siguenza Campos  
**Fecha:** 7 de noviembre de 2026  

**Integrantes del equipo:**
- Cerón Contreras, Edwin Wilfredo — CC060761
- Moreno Hernández, Jorge Steven — MH222714
- Mulato Vasquez, Raúl Adalberto — MV222715
- López Torres, Fernando Raúl — LT172001
- Rivera Cubias, Edwin Vladimir — RC232947

---

## Resumen

El presente informe técnico y de investigación documenta la integración de servicios en la nube mediante Google Firebase (Firebase Authentication y Cloud Firestore) dentro de la aplicación móvil multiplataforma **Comerciales Mely**, desarrollada con React Native (v0.88) y Expo SDK 58. En la primera entrega de la etapa móvil, el sistema operaba bajo un esquema de persistencia estrictamente local basado en SQLite y sesiones locales en SecureStore, lo cual impedía la sincronización de inventario entre dispositivos y la centralización de cuentas de usuario. En este segundo avance se sustituye dicha capa local por una arquitectura Backend-as-a-Service (BaaS) en la nube, incorporando autenticación mediante correo electrónico/contraseña y proveedor federado de Google OAuth 2.0, persistencia de sesión nativa con `AsyncStorage`, almacenamiento documental en Cloud Firestore asociado al identificador único (`UID`) del usuario autenticado, transacciones atómicas para el control de inventario y facturación, visualización cronológica de historiales de auditoría y reglas declarativas de seguridad. Asimismo, se presenta una investigación fundamentada bajo normativa APA 7.ª edición sobre la arquitectura de Firebase aplicada a React Native y un análisis reflexivo sobre las decisiones técnicas adoptadas en el proyecto.

**Palabras clave:** React Native, Firebase Authentication, Cloud Firestore, OAuth 2.0, persistencia en la nube, transacciones atómicas, Expo.

---

## Introducción

El desarrollo de aplicaciones móviles empresariales orientadas al control de inventarios, movimientos de bodega y facturación exige que la información operativa se mantenga íntegra, disponible en tiempo real y trazable por usuario responsable. Cuando múltiples operadores —administradores, empleados de bodega y cajeros facturadores— interactúan simultáneamente sobre un mismo catálogo de productos desde distintos teléfonos móviles o desde la plataforma web administrativa, el almacenamiento aislado en el dispositivo deja de ser suficiente (Google, 2026a).

Durante el primer avance de la Etapa 3 del proyecto **Comerciales Mely**, el equipo construyó la interfaz móvil en React Native respetando el prototipo de Figma y la lógica de negocio del sistema, pero utilizando una base de datos SQLite local (`expo-sqlite`). Si bien dicho enfoque permitió validar las pantallas y reglas de dominio sin conexión, presentaba tres limitaciones estructurales identificadas en las conclusiones del avance anterior: (a) las cuentas creadas en un teléfono no existían en otros dispositivos, (b) los ajustes de existencias y ventas no se reflejaban en la base de datos remota del negocio, y (c) no existía recuperación de credenciales ni inicio de sesión federado.

Para resolver esta problemática en la segunda entrega de avance (Foro 2), se integró **Firebase Authentication** y **Cloud Firestore** sobre el proyecto compartido en la nube `comerciales-mely`. Esta integración mantiene intacta la separación arquitectónica en capas del proyecto —interfaz de usuario (`src/app`), contexto de estado (`src/context/AppContext.js`), lógica pura de dominio (`src/domain/business.mjs`) y servicios de datos (`src/services/database.js` y `src/services/firebase.js`)—, reemplazando el motor local por operaciones remotas seguras, transaccionales y vinculadas al usuario autenticado.

---

## Objetivos

### Objetivo General

Integrar los servicios en la nube de **Firebase Authentication** y **Cloud Firestore** en la aplicación móvil React Native de **Comerciales Mely**, reemplazando el módulo de autenticación y persistencia local por una arquitectura remota segura, transaccional y asociada a la identidad de cada usuario autenticado.

### Objetivos Específicos

1. Implementar el flujo de autenticación en la nube con **Firebase Authentication** mediante correo electrónico/contraseña y proveedor federado de **Google**, garantizando la persistencia de sesión en el dispositivo con `AsyncStorage` y el control de acceso basado en roles (`Administrador`, `Empleado` y `Facturador`).
2. Diseñar e implementar el modelo de datos documental en **Cloud Firestore** (`usuarios`, `productos`, `movimientos` y `facturas`), asociando cada registro creado al identificador único (`UID`) y nombre del usuario autenticado.
3. Conectar los módulos secundarios de la aplicación (catálogo de inventario, entradas y salidas de bodega, alertas de stock crítico, carrito de facturación con IVA del 13 % y reportes estadísticos de siete días) mediante transacciones atómicas en Firestore (`runTransaction`).
4. Implementar la visualización cronológica del historial de movimientos de bodega y de comprobantes de facturación almacenados en la base de datos remota, junto con reglas de seguridad (`firestore.rules`) que garanticen la inmutabilidad de la auditoría.
5. Analizar críticamente las ventajas, limitaciones y decisiones técnicas derivadas del uso de Firebase en el ecosistema React Native con Expo SDK 58.

---

## 1. Marco Teórico: Investigación sobre Firebase Aplicado a React Native

### 1.1. Arquitectura Backend-as-a-Service (BaaS) de Firebase en Aplicaciones Móviles

Firebase es una plataforma de desarrollo de aplicaciones móviles y web respaldada por Google Cloud que opera bajo el paradigma *Backend-as-a-Service* (BaaS). A diferencia de una arquitectura tradicional de tres capas —donde el equipo debe programar, desplegar y asegurar un servidor intermedio de aplicaciones (por ejemplo, en Node.js o .NET) conectado a un motor relacional—, Firebase proporciona SDKs cliente que se comunican directamente con servicios gestionados de identidad, bases de datos NoSQL, almacenamiento de archivos y mensajería mediante conexiones seguras sobre TLS (Google, 2026a).

En el contexto de **React Native**, esta arquitectura resulta particularmente ventajosa porque traslada la validación de identidad al servicio **Firebase Authentication** y delega el control de autorización directamente al motor de reglas de **Cloud Firestore** (*Security Rules*). De este modo, el cliente móvil conserva una huella ligera mientras la plataforma en la nube gestiona el escalamiento horizontal, la replicación geográfica y la sincronización de estado entre plataformas Android, iOS y Web (Meta Platforms, 2026).

### 1.2. Enfoques de Integración en React Native: SDK Modular JS vs. Módulos Nativos

En el ecosistema actual de React Native con **Expo**, existen dos alternativas técnicas principales para integrar Firebase (Expo, 2026a):

1. **Firebase JS SDK modular (`firebase` v10/v12):** Es la biblioteca oficial en JavaScript/TypeScript mantenida por Google bajo un diseño funcional (*tree-shakeable*). Funciones como `initializeApp`, `signInWithEmailAndPassword`, `getDocs` o `runTransaction` se importan de manera individual, reduciendo el tamaño del paquete JavaScript compilado por Metro Bundler. Es 100 % compatible con proyectos Expo y con compilación multiplataforma (Android, iOS y Web).
2. **React Native Firebase (`@react-native-firebase/*`):** Envuelve los SDKs nativos de Android (Kotlin/Java) e iOS (Objective-C/Swift) mediante puentes nativos (*TurboModules*).

Para **Comerciales Mely** se adoptó una **estrategia híbrida óptima** recomendada por la documentación de Expo (2026a): se utiliza el **SDK modular de Firebase (`firebase` v12)** para toda la lógica de `firebase/auth` y `firebase/firestore` —lo que asegura compatibilidad total entre Android, iOS y la vista web de prueba—, complementado con el módulo nativo **`@react-native-google-signin/google-signin`** y su *Config Plugin* en `app.json` para invocar el selector nativo de cuentas de Google Play Services en el archivo `.APK` de Android.

### 1.3. Firebase Authentication y Persistencia de Sesión en React Native

Firebase Authentication gestiona el ciclo completo de identidad del usuario: registro con hash criptográfico (scrypt), verificación de credenciales, emisión de *JSON Web Tokens* (JWT) firmados por Google con vigencia de una hora y renovación automática mediante *refresh tokens* de larga duración (Google, 2026b).

Una diferencia crítica entre un navegador web y **React Native** radica en dónde se almacenan dichos tokens:
- En un navegador web, Firebase utiliza `IndexedDB` o `localStorage` de forma predeterminada.
- En React Native no existe `localStorage` ni `IndexedDB` del DOM. Si se inicializa Firebase únicamente con `getAuth(app)` en un dispositivo móvil, la sesión queda solo en memoria RAM y se pierde al cerrar la aplicación.

Por ello, en React Native es obligatorio inicializar el servicio mediante `initializeAuth` inyectando el adaptador `getReactNativePersistence(AsyncStorage)` provisto por `firebase/auth` junto con el paquete `@react-native-async-storage/async-storage` (Google, 2026b). De esta manera, el *refresh token* se almacena de forma persistente en el sistema de archivos privado del teléfono y el método `auth.authStateReady()` restaura automáticamente la sesión del usuario al reabrir la aplicación.

### 1.4. Autenticación Federada con Google (OAuth 2.0 y OpenID Connect)

La autenticación con Google en dispositivos Android nativos implementa el flujo de **OpenID Connect (OIDC)** sobre OAuth 2.0 en dos etapas (Google, 2026c):
1. **Obtención del `idToken` desde Google Play Services:** La aplicación invoca `GoogleSignin.signIn()` indicando el `webClientId` configurado en Google Cloud / Firebase Console. El sistema operativo Android verifica que el nombre de paquete (`com.anonymous.comercialesmelymovil`) y la huella digital del certificado **SHA-1** del APK coincidan con la aplicación registrada en Firebase, presenta el selector nativo de cuentas del teléfono y devuelve un `idToken` firmado por Google.
2. **Intercambio de credencial en Firebase Auth:** Con dicho token se construye una credencial mediante `GoogleAuthProvider.credential(idToken)` y se entrega a `signInWithCredential(auth, credential)`. Firebase valida criptográficamente el token, crea o recupera el registro del usuario con su `UID` único y abre la sesión autenticada.

### 1.5. Cloud Firestore: Modelo NoSQL Documental, Consultas y Transacciones

**Cloud Firestore** es una base de datos NoSQL orientada a documentos que organiza la información en **colecciones** compuestas por **documentos** identificables por una clave única (`id`), los cuales contienen pares clave-valor tipados (cadenas, números, booleanos, arreglos, mapas y marcas de tiempo `Timestamp`) (Google, 2026d).

Sus características técnicas aplicadas a un sistema de inventario y facturación son:
- **Consultas indexadas (`query`, `orderBy`, `limit`, `where`):** Todas las consultas en Firestore se apoyan en índices automáticos por campo, garantizando que el tiempo de respuesta dependa del tamaño del conjunto de resultados y no del volumen total de la colección.
- **Transacciones atómicas (`runTransaction`):** Cuando una operación comercial requiere leer el stock actual de uno o varios productos, verificar que existan unidades suficientes, descontar la cantidad vendida y registrar simultáneamente el movimiento de auditoría y la factura, una escritura simple (`setDoc` o `updateDoc`) sería insegura ante accesos concurrentes de dos empleados. `runTransaction(db, updateFunction)` ejecuta primero todas las lecturas bloqueando optimísticamente la versión de los documentos leídos; si otro dispositivo modifica el stock de alguno de esos productos antes de que la transacción confirme, Firestore aborta o reintenta la operación de forma atómica (Google, 2026e).
- **Reglas de Seguridad Declarativas (`firestore.rules`):** Evalúan cada solicitud de lectura o escritura en los servidores de Google verificando la identidad del cliente (`request.auth != null`, `request.auth.uid`) y el contenido del documento entrante (`request.resource.data`), impidiendo que un usuario suplante el `usuarioId` de otro o elimine registros históricos de auditoría (Google, 2026f).

---

## 2. Desarrollo e Integración Técnica en el Proyecto Comerciales Mely

### 2.1. Configuración del Proyecto y del Cliente Firebase (`src/services/firebase.js`)

El proyecto móvil se conectó a la instancia en la nube **`comerciales-mely`** (compartida con la aplicación web del equipo). En el archivo `mobile/src/services/firebase.js` se centralizó la inicialización del SDK modular garantizando la compatibilidad tanto en dispositivos nativos Android/iOS (mediante `AsyncStorage`) como en el entorno web de desarrollo:

```javascript
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCGTLDar3ConqwOHD7Ex8ZLdvuUMTLjznQ",
  authDomain: "comerciales-mely.firebaseapp.com",
  projectId: "comerciales-mely",
  storageBucket: "comerciales-mely.firebasestorage.app",
  messagingSenderId: "945325242075",
  appId: "1:945325242075:web:5872a9b3b4bc123b4ebefe",
};

export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  "945325242075-1s2ssfk2jqfsh0l28u90tb7a81nn8j1i.apps.googleusercontent.com";

const existing = getApps().length > 0;
export const app = existing ? getApp() : initializeApp(firebaseConfig);

export const auth =
  existing || typeof getReactNativePersistence !== "function"
    ? getAuth(app)
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export const db = getFirestore(app);
```

Adicionalmente, en Firebase Console se habilitaron los proveedores **Correo electrónico/contraseña** y **Google**, y se registró la aplicación Android `com.anonymous.comercialesmelymovil` junto con la huella digital del certificado **SHA-1** (`5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`).

### 2.2. Flujo de Autenticación y Gestión de Sesiones (Requerimiento 1)

El flujo de autenticación implementado en `mobile/src/services/database.js`, `mobile/src/context/AppContext.js`, `mobile/src/app/login.js` y `mobile/src/app/registro.js` cubre cuatro escenarios completos:

| Escenario | Funciones de Firebase utilizadas | Validación y vinculación con el proyecto |
| --- | --- | --- |
| **1. Registro por correo** | `createUserWithEmailAndPassword(auth, email, password)`, `updateProfile`, `setDoc(doc(db, "usuarios", uid))` | Valida con Zod (`registerSchema`) nombre (mín. 3 caracteres), correo válido, alias de usuario, contraseña (mín. 8 caracteres y confirmación coincidente) y rol (`empleado` o `facturador`). Impide que el registro público escale privilegios a `administrador`. |
| **2. Inicio de sesión por correo** | `signInWithEmailAndPassword(auth, email, password)` y lectura de `usuarios/{uid}` | Comprueba formato de correo, autentica en Firebase Auth, recupera el perfil en Firestore y verifica que el rol almacenado en la nube coincida con el perfil de trabajo seleccionado en la pantalla de Login (`expectedRole`). |
| **3. Inicio de sesión con Google** | `GoogleSignin.signIn()`, `GoogleAuthProvider.credential(idToken)`, `signInWithCredential` (y `signInWithPopup` en web) | Obtiene el `idToken` de la cuenta de Google del dispositivo, autentica en Firebase Auth y crea automáticamente el documento `usuarios/{uid}` en Firestore con `proveedor: "google.com"` y rol inicial `Empleado` si es su primer ingreso. |
| **4. Recuperación y cierre de sesión** | `sendPasswordResetEmail(auth, email)`, `GoogleSignin.signOut()`, `signOut(auth)` | Envía enlace real de restablecimiento al correo corporativo y, al cerrar sesión, limpia tanto el estado de `AppContext` como la credencial persistida en `AsyncStorage`, redirigiendo automáticamente a `/login` mediante `Stack.Protected` de Expo Router. |

Asimismo, la función `traducir(error)` intercepta los códigos nativos de Firebase (`auth/invalid-credential`, `auth/email-already-in-use`, `auth/weak-password`, `auth/too-many-requests`, `auth/network-request-failed`, `permission-denied`) y los transforma en mensajes claros en español dentro de los formularios.

### 2.3. Arquitectura y Modelo de Datos en Cloud Firestore Asociado al Usuario (Requerimiento 2)

Toda la información del sistema se estructura en **cuatro colecciones principales** en Cloud Firestore. Cada operación de escritura asocia explícitamente el documento al `UID` (`request.auth.uid`) y al nombre del usuario autenticado en Firebase Authentication:

| Colección | ID del Documento | Campos almacenados | Asociación con el usuario autenticado |
| --- | --- | --- | --- |
| `usuarios` | `{uid}` (UID de Firebase Auth) | `nombre`, `email`, `usuario`, `rol` (`Administrador`, `Empleado`, `Facturador`), `proveedor`, `fechaCreacion` | El propio ID del documento es el `uid` emitido por Firebase Authentication (`doc(db, "usuarios", fbUser.uid)`). |
| `productos` | `{productoId}` (UUID / semilla) | `nombre`, `codigo`, `categoria`, `precio`, `precioCentavos`, `stock`, `stockMinimo`, `imagenUrl`, `activo`, `fechaCreacion` | Guarda `creadoPorId: fb.uid` y `creadoPor: user.nombre` al registrar cada producto nuevo. |
| `movimientos` | `{movimientoId}` (UUID) | `productoId`, `nombre`, `nombreProducto`, `tipo` (`Entrada` / `Salida`), `cantidad`, `nota`, `motivo`, `fecha` | Guarda `usuarioId: fb.uid` y `usuario: user.nombre` para auditoría inmutable de quién ejecutó la entrada, salida o venta. |
| `facturas` | `{facturaId}` (UUID) | `numero` (`MELY-000001`), `cliente`, `items` (arreglo de líneas), `subtotal`, `iva`, `total`, `fecha` | Guarda `usuarioId: fb.uid` y `usuario: user.nombre` del facturador o administrador que emitió el comprobante. |

Cabe destacar que los documentos de `productos` y `movimientos` almacenan tanto los campos requeridos por la aplicación móvil (`precioCentavos`, `nombre`, `nota`) como los utilizados por la aplicación web (`precio`, `codigo`, `nombreProducto`, `motivo`), logrando **interoperabilidad en tiempo real** entre ambas plataformas sobre la misma base de datos Firestore.

### 2.4. Módulos Secundarios y Transacciones Atómicas (Requerimiento 3)

La función `mutate(action, input)` en `mobile/src/services/database.js` articula la lógica pura de negocio (`transition` en `src/domain/business.mjs`) con una transacción atómica `runTransaction(db, ...)` en Firestore:

1. **Módulo de Catálogo e Inventario (`inventario.js` y `producto.js`):** Permite buscar productos por texto, filtrar por categoría (`Hogar`, `Ferretería`, `Bisutería`, `Juguetería`, `Belleza`, `Electrónica`, `Plásticos`), crear productos con fotografía desde cámara o galería (`expo-image-picker`) y editar metadatos. Por regla de trazabilidad, no permite alterar el stock editando la ficha del producto; obliga a registrar un movimiento de bodega.
2. **Módulo de Movimientos de Bodega (`movimientos.js`):** Registra entradas de abastecimiento y salidas de almacén exigiendo un motivo de al menos 3 caracteres. Antes de confirmar en Firestore, la transacción lee la versión fresca del producto (`tx.get(doc(db, "productos", p.id))`), verifica que el stock no haya sido modificado concurrentemente por otro dispositivo y rechaza salidas que superen la existencia disponible.
3. **Módulo de Alertas de Stock (`alertas.js`):** Evalúa en tiempo real los productos activos cuyo `stock <= stockMinimo`, clasificándolos visualmente en estado *Agotado* (`stock === 0`) o *Stock bajo*, con acceso directo para abastecerlos.
4. **Módulo de Ventas y Facturación (`facturacion.js`):** Accesible para los roles `Facturador` y `Administrador`. Agrupa productos repetidos en el carrito, valida existencias de todas las líneas antes de aplicar cambios, calcula importes en centavos con **IVA del 13 %** (`totals`), descuenta el stock de cada artículo, genera automáticamente un movimiento de salida por cada línea vendida, guarda el documento en la colección `facturas` y permite exportar/compartir el comprobante en formato **PDF** mediante `expo-print` y `expo-sharing`.
5. **Módulo de Resumen y Reportes (`index.js` y `reportes.js`):** Calcula el valor total del inventario en almacén, el número de productos con stock crítico, las ventas acumuladas del día y genera la gráfica comparativa de los últimos siete días calendario locales.

### 2.5. Visualización de Historial y Reglas de Seguridad (Requerimiento 4)

La recuperación del historial almacenado se realiza en `readState()` mediante consultas ordenadas descendentemente por fecha:

```javascript
const [movSnap, facSnap] = await Promise.all([
  getDocs(query(collection(db, "movimientos"), orderBy("fecha", "desc"), limit(300))),
  getDocs(query(collection(db, "facturas"), orderBy("fecha", "desc"))),
]);
```

- En la pantalla **Movimientos (`movimientos.js`)**, el usuario visualiza el listado cronológico de todas las entradas, salidas y descuentos por venta almacenados en Firestore, mostrando el nombre del producto, el signo y cantidad (`+` en verde para entradas, `-` en rojo para salidas), el motivo, el nombre del usuario responsable (`m.usuario`) y la marca de tiempo formateada para El Salvador (`es-SV`).
- En la pantalla **Facturación (`facturacion.js`)**, se despliega el historial de comprobantes emitidos (`MELY-000001`, cliente, fecha, usuario emisor, total con IVA y botón para regenerar y compartir el PDF).

Para proteger la integridad del historial en la nube, se definieron las reglas de seguridad en `mobile/firestore.rules`, donde las colecciones `movimientos` y `facturas` permiten lectura y creación autenticada, pero establecen `allow update, delete: if false;`, garantizando que ningún operador pueda alterar ni borrar el rastro de auditoría una vez registrado.

---

## 3. Evidencias de Implementación (Espacio para Capturas en el Documento Final)

*(Nota para la edición en Word: insertar aquí las capturas que ya tomaste de tu proyecto)*

- **Figura 1.** *Proveedores de autenticación habilitados en Firebase Console (Correo electrónico/contraseña y Google).*  
  *Nota.* Captura de la consola oficial del proyecto `comerciales-mely`. Elaboración propia.
- **Figura 2.** *Reglas de seguridad publicadas en Cloud Firestore (`firestore.rules`) para las colecciones `usuarios`, `productos`, `movimientos` y `facturas`.*  
  *Nota.* Elaboración propia.
- **Figura 3.** *Registro de aplicación Android (`com.anonymous.comercialesmelymovil`) y huella digital SHA-1 en la configuración del proyecto Firebase.*  
  *Nota.* Elaboración propia.
- **Figura 4.** *Pantallas de Inicio de Sesión (correo/contraseña y botón «Continuar con Google») y Registro de Cuenta en la aplicación móvil React Native.*  
  *Nota.* Elaboración propia.
- **Figura 5.** *Colección `usuarios` en Cloud Firestore mostrando los documentos indexados por el `UID` del usuario autenticado y su rol asignado.*  
  *Nota.* Elaboración propia.
- **Figura 6.** *Módulos secundarios en ejecución (Inventario, Registro de Movimientos, Alertas de Stock, Facturación con IVA 13 % y Reportes) sincronizados con las colecciones `productos`, `movimientos` y `facturas` en Firestore.*  
  *Nota.* Elaboración propia.

---

## 4. Análisis Reflexivo y Decisiones Técnicas sobre el Uso de Firebase en React Native

La migración del sistema **Comerciales Mely** desde SQLite local hacia **Firebase Authentication** y **Cloud Firestore** permitió contrastar en la práctica las diferencias entre el almacenamiento embebido y una arquitectura en la nube dentro de React Native:

1. **Desacoplamiento arquitectónico como factor clave de éxito:**  
   Haber separado en el primer avance la lógica de dominio (`src/domain/business.mjs`) del servicio de persistencia (`src/services/database.js`) permitió que las 14 pruebas unitarias de reglas de negocio (`npm test`) y las pantallas de la interfaz permanecieran estables mientras se sustituía por completo el motor SQLite por Firestore. `database.js` conservó exactamente el mismo contrato de métodos (`load`, `refresh`, `login`, `register`, `logout`, `mutate`), demostrando el valor del patrón *Repository / Service Layer* en aplicaciones móviles.
2. **Diferencias entre Expo Go y compilaciones nativas (`.APK`) para autenticación con Google:**  
   Durante la integración se comprobó empíricamente una limitación importante del entorno de desarrollo móvil: el cliente genérico **Expo Go** no incluye el módulo nativo `RNGoogleSignin` requerido por `@react-native-google-signin/google-signin`. Si se invoca `require("@react-native-google-signin/google-signin")` de forma directa en Expo Go, el registro `TurboModuleRegistry` lanza una excepción fatal. Para resolverlo con calidad de producción, se implementó una verificación preventiva mediante `TurboModuleRegistry.get("RNGoogleSignin")` antes de cargar el módulo nativo, un flujo alternativo con `signInWithPopup` cuando se ejecuta en entorno web y la generación automatizada del `.APK` autónomo mediante **GitHub Actions** (`npx expo prebuild` + `./gradlew assembleRelease`).
3. **Consistencia transaccional en bases de datos NoSQL:**  
   A diferencia de SQLite en un solo teléfono —donde bastaba con serializar una cola de promesas en memoria—, en Firestore varios dispositivos pueden vender el mismo artículo al mismo tiempo. El uso de `runTransaction` verificando que el stock leído coincida con el estado previo antes de confirmar la escritura evita sobreescrituras silenciosas (*lost updates*) y garantiza que cada factura tenga siempre su movimiento de salida correspondiente.
4. **Compatibilidad de esquemas entre la plataforma Web y la App Móvil:**  
   Dado que la base de datos Firestore `comerciales-mely` ya contenía documentos creados desde la aplicación web en Next.js, los adaptadores `fromProduct`, `toProductDoc`, `fromMovement` y `toMovementDoc` se diseñaron para normalizar ambos formatos (manejando tanto precios en dólares como en centavos para evitar errores de coma flotante IEEE 754 en el cálculo del IVA).

---

## Conclusiones

1. La integración de **Firebase Authentication** en React Native mediante el SDK modular y `getReactNativePersistence(AsyncStorage)` permitió dotar a **Comerciales Mely** de un sistema de identidad robusto en la nube con soporte para correo electrónico/contraseña, inicio federado con Google y recuperación de contraseña, manteniendo la sesión activa entre reinicios del dispositivo y aplicando control de acceso por rol (`Administrador`, `Empleado` y `Facturador`).
2. El modelo documental implementado en **Cloud Firestore** sobre las colecciones `usuarios`, `productos`, `movimientos` y `facturas` cumple con vincular cada operación al identificador único (`UID`) y nombre del usuario autenticado (`usuarioId` / `creadoPorId`), permitiendo compartir el mismo catálogo e historial en tiempo real entre múltiples dispositivos móviles y la plataforma web.
3. El uso de transacciones atómicas (`runTransaction`) junto con la función pura de transición de dominio asegura que los módulos secundarios —inventario, entradas y salidas de bodega, alertas de stock crítico, facturación con IVA del 13 % y reportes de 7 días— operen sin inconsistencias de stock ni registros huérfanos.
4. La combinación del historial cronológico en la aplicación y las reglas de seguridad en `firestore.rules` (que prohíben la edición o borrado de documentos en `movimientos` y `facturas`) garantiza una trazabilidad auditable y confiable para el negocio.

---

## Referencias

Equipo R.E.F.E.S. (2026). *Comerciales Mely: Sistema de gestión de inventario y facturación multiplataforma en React Native y Next.js* [Código fuente]. GitHub. https://github.com/m4c4c0/comerciales-mely

Expo. (2026a). *Using Firebase in Expo*. Expo Documentation. https://docs.expo.dev/guides/using-firebase/

Expo. (2026b). *Authentication in Expo Router*. Expo Documentation. https://docs.expo.dev/router/advanced/authentication/

Google. (2026a). *Documentación oficial de Firebase*. Firebase. https://firebase.google.com/docs

Google. (2026b). *Introducción a Firebase Authentication en sitios web y React Native*. Firebase Documentation. https://firebase.google.com/docs/auth/web/start

Google. (2026c). *Autenticar con Firebase usando cuentas de Google en JavaScript y Android*. Firebase Documentation. https://firebase.google.com/docs/auth/web/google-signin

Google. (2026d). *Cloud Firestore: Almacenamiento y sincronización de datos NoSQL en tiempo real*. Firebase Documentation. https://firebase.google.com/docs/firestore

Google. (2026e). *Transacciones y escrituras por lotes en Cloud Firestore*. Firebase Documentation. https://firebase.google.com/docs/firestore/manage-data/transactions

Google. (2026f). *Cómo comenzar a usar las reglas de seguridad de Cloud Firestore*. Firebase Documentation. https://firebase.google.com/docs/firestore/security/get-started

Meta Platforms. (2026). *React Native Documentation: Core Components and APIs*. React Native. https://reactnative.dev/docs/components-and-apis

React Native Google Sign-In. (2026). *Google Sign-In for React Native and Expo (`@react-native-google-signin/google-signin`)* [Documentación técnica]. https://react-native-google-signin.github.io/docs/install

Universidad Don Bosco. (2026). *Ruta de aprendizaje y rúbrica de evaluación: Etapa 3 Foro 2 — Integración Firebase en React Native (DPS941, Ciclo II-2026)* [Material de cátedra]. Dirección de Educación a Distancia.

