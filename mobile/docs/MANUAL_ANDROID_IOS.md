# Manual de instalación y ejecución
Comerciales Mely | Android e iOS | Versión 1.0.1

## 1. Elige cómo ejecutar la app
Para usar Android sin preparar herramientas, instala el APK de la entrega. El APK contiene la aplicación y funciona sin Metro. Para modificar el código, utiliza la ejecución desde fuentes. Para iOS necesitas un Mac con Xcode si vas a ejecutar el simulador local; también puedes compilar en EAS y ejecutar el resultado en un Mac. Un iPhone físico requiere la firma y el aprovisionamiento correspondientes.

Esta entrega incluye un APK Android probado. iOS está preparado en el proyecto, pero no se entrega un IPA ni se afirma haber probado un iPhone. La base SQLite es local a cada instalación: las operaciones no se sincronizan con la web.

## 2. Instalar Android desde el APK
1. Abre la publicación del equipo y descarga Comerciales-Mely-etapa3.apk en el teléfono. Usa el archivo APK, no el ZIP de fuentes.
2. Abre Descargas y toca el APK. Cuando Android solicite autorización, permite temporalmente instalar aplicaciones desde ese navegador o gestor de archivos. La ubicación de esta opción cambia según el fabricante.
3. Confirma Instalar. Si ya tienes esta app con la misma firma, Android debe ofrecer actualizarla y conservar sus datos. No desinstales la versión anterior como primer intento: desinstalar elimina su base local.
4. Toca Abrir. Busca la bolsa ámbar con la letra M sobre fondo azul oscuro. La aplicación se llama Comerciales Mely.
5. Elige Admin y entra con admin / admin123. Debe aparecer Catálogo Mely. No hace falta conectar la computadora ni iniciar Metro.
6. Al terminar la instalación puedes retirar el permiso de instalar aplicaciones desconocidas al navegador.

Publicación: https://github.com/m4c4c0/comerciales-mely/releases/tag/etapa3-avance1-android-v1.0.1
Requisito de esta compilación: Android 7.0 / API 24 o posterior; arquitecturas ARM64 y x86_64. La prueba automatizada se realiza en Android 14 / API 34.

## 3. Instalar por USB o en un emulador Android
1. Instala Android Studio y su SDK Platform-Tools. En un teléfono activa Opciones de desarrollador > Depuración USB. Conecta un cable de datos y acepta la autorización RSA que aparece en el teléfono.
2. En un emulador, abre Device Manager de Android Studio, crea un dispositivo con una imagen Google APIs x86_64 y arráncalo. La entrega se verificó con Android 14.
3. Abre PowerShell y comprueba la conexión. Si adb no está en PATH, utiliza la ruta completa del SDK como en estos comandos.

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb devices
& $adb install -r "C:\proy\mely\output\android\Comerciales-Mely-etapa3.apk"
& $adb shell am start -n com.anonymous.comercialesmelymovil/.MainActivity
```

4. Debe verse Success al instalar y la pantalla de acceso al abrir. Si hay varios dispositivos, agrega -s seguido del identificador que muestra adb devices antes de install o shell.
5. Una actualización compatible conserva SQLite. Si Android informa INSTALL_FAILED_UPDATE_INCOMPATIBLE, las firmas difieren: conserva la instalación y sus datos antes de decidir si puedes eliminarla. El APK académico no es una publicación de Play Store.

## 4. Obtener y preparar el código
1. Instala Git y Node.js 22.13 o posterior; este proyecto fue verificado con Node.js 24. Descarga las fuentes del ZIP o clona la rama de entrega. Si usas el ZIP, entra directamente en su carpeta de fuentes; no necesitas ejecutar git clone ni git switch.
2. El repositorio también contiene la web. Ejecuta los comandos móviles dentro de mobile, donde están app.json y package.json.

```powershell
git clone https://github.com/m4c4c0/comerciales-mely.git
cd comerciales-mely
git switch etapa3/avance1-movil-20261018
cd mobile
npm ci
npm test
npm run lint
npm run typecheck
```

3. Si trabajas con la carpeta ya preparada de este PC, usa cd C:\proy\mely en lugar de volver a clonar. No copies node_modules desde otra máquina.
4. Conserva el lockfile. El proyecto usa Expo SDK 58 y sus versiones compatibles. No cambies dependencias al azar para resolver un error de instalación.

## 5. Ejecutar y compilar Android desde fuentes
1. En Android Studio instala los componentes solicitados por el proyecto: SDK Platform 37, Build-Tools 37.0.0, Platform-Tools, NDK 27.1.12297006 y CMake 3.22.1. Acepta las licencias del SDK. Abre un emulador o conecta el teléfono.
2. En Windows selecciona el JDK de Android Studio. El proyecto se verificó con Java 25; Java 27 global ocasionó incompatibilidades. Si Android Studio está en otra carpeta, adapta JAVA_HOME.

```powershell
$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
npm run android
```

3. Expo genera el proyecto Android, compila la app, la instala e inicia Metro para desarrollo. Acepta los permisos solicitados. Para reabrir el servidor en otra sesión usa npm start. El teléfono debe poder alcanzar el servidor de desarrollo.
4. Para producir un APK autónomo, desde la misma carpeta ejecuta el script de entrega. Este prepara Ninja 1.13.2 dentro de tools/native, para resolver las rutas largas de CMake en Windows; necesita Internet la primera vez.

```powershell
npm run build:android
```

5. El resultado se copia a output/android/Comerciales-Mely-etapa3.apk. Instálalo con el procedimiento de la página anterior. La compilación inicial puede tardar bastante y necesita espacio libre.
6. El repositorio incluye el flujo de GitHub Actions Comerciales Mely - APK Android: compila ante cambios de la app en la rama configurada. El disparo manual requiere que el archivo del flujo también exista en la rama predeterminada del repositorio. Como referencia reproducible, consulta la ejecución 39256275087 del repositorio wilfredo409/comerciales-mely-web. Conserva el APK y las evidencias del mismo run. No confundas expo export con una compilación APK.

## 6. Ejecutar iOS en un Mac
1. Instala Xcode, abre la aplicación una vez y completa la instalación de sus componentes y licencias. En Xcode > Settings > Platforms descarga un runtime de iOS Simulator compatible con el SDK. Instala Node.js 22.13 o posterior y Git.
2. Clona la misma rama de entrega y abre una terminal dentro de mobile. Instala las dependencias de JavaScript y comprueba el código.

```bash
npm ci
npm test
npm run lint
npm run typecheck
npm run ios
```

3. Expo genera ios, instala las dependencias nativas de CocoaPods y compila en el simulador de Xcode. Completa la instalación de CocoaPods si la herramienta lo solicita. Debe abrirse Comerciales Mely con Metro activo.
4. Para elegir otro simulador ejecuta npx expo run:ios --device y selecciona uno de los simuladores disponibles.
5. Prueba acceso, registro, teclado, pestañas, formularios, persistencia, fotos y comprobantes. Cámara y compartición deben comprobarse también en un iPhone físico; el simulador no reproduce todo el hardware.
6. No se puede ejecutar Xcode ni iOS Simulator en Windows. El código compartido y el bundle iOS no equivalen a una app nativa firmada.

## 7. Compilar iOS con EAS e instalar en iPhone
1. EAS permite solicitar la compilación desde Windows o Mac. Necesitas una cuenta Expo del equipo. Inicia sesión en tu propia terminal y asocia el proyecto; no publiques credenciales.

```powershell
npx eas-cli@latest login
npx eas-cli@latest init
```

2. Para un simulador de Mac utiliza el perfil ya incluido en eas.json. No exige el aprovisionamiento de un iPhone.

```powershell
npx eas-cli@latest build --platform ios --profile ios-simulator
```

3. Al terminar, desde un Mac con Xcode y un simulador abierto instala el resultado con el asistente de EAS. Un build de simulador no se instala en un teléfono.

```bash
npx eas-cli@latest build:run --platform ios
```

4. Para distribución interna en un iPhone prepara una membresía Apple Developer válida, acceso a su equipo y el UDID del dispositivo. Registra primero el teléfono siguiendo el enlace que proporciona EAS.

```powershell
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile preview
```

5. Sigue los pasos de firma y selección del dispositivo. Abre el enlace de instalación del build en el iPhone autorizado. Los dispositivos agregados después requieren actualizar el aprovisionamiento y recompilar o volver a firmar.
6. Si compilas localmente para un iPhone con Xcode, conecta el equipo, habilita Developer Mode cuando iOS lo solicite y configura Signing & Capabilities con tu Apple Team. Este procedimiento depende de la cuenta y firma disponibles; no se ha validado en esta entrega.

## 8. Primer acceso y pruebas de aceptación
Usa exclusivamente estas cuentas de demostración con datos ficticios. El selector de perfil debe coincidir con la cuenta: elegir Admin no convierte otra cuenta en administradora.

Administrador: usuario admin, contraseña admin123, selector Admin.
Empleado: usuario empleado, contraseña empleado123, selector Empleado.
Cajero: usuario facturador, contraseña factura123, selector Cajero.

1. Sin escribir nada, toca Iniciar sesión. Deben aparecer errores de campos obligatorios.
2. Escribe admin y una contraseña incorrecta. Debe rechazarse el acceso. Corrige la contraseña y entra como Admin.
3. Abre Inventario, busca un producto y consulta su ficha. Revisa imagen, precio y existencias.
4. En Movimientos selecciona Set de 6 vasos plásticos, Entrada (Ingreso), cantidad 2 y una justificación. Guarda y comprueba que aumenta el stock.
5. En Perfil > Ventas y facturación agrega una unidad del mismo producto, emite el comprobante y confirma. Revisa el descuento de una unidad y el reporte de ventas.
6. Cierra y vuelve a abrir la app. Comprueba que las existencias y la sesión se conservan. No borres los datos de la aplicación durante esta prueba.
7. Cierra sesión. En Crear cuenta prueba campos vacíos y contraseñas diferentes. Corrige los datos, registra un empleado y comprueba su perfil. No es posible crear administradores desde el registro público.
8. Cierra sesión y vuelve a entrar con la nueva cuenta. Revisa Alertas y verifica que un empleado no dispone de Ventas y facturación. Repite el acceso con Cajero y comprueba sus opciones.

## 9. Resolver problemas frecuentes
APK no se instala: verifica Android/API y arquitectura, descarga completa y espacio libre. Si la firma no coincide, no borres datos sin decidir cómo conservarlos.

adb muestra unauthorized: desbloquea el teléfono y acepta la autorización RSA. Si no aparece, cambia cable o puerto y vuelve a conectar. Si hay varios equipos, selecciona su identificador con -s.

Metro no conecta: inicia npm start dentro de mobile y revisa la misma red Wi-Fi y el acceso al firewall. En Android conectado por USB puede utilizarse adb reverse tcp:8081 tcp:8081. El APK de entrega es autónomo y no necesita estos pasos.

Icono antiguo tras instalar: confirma que abriste la versión 1.0.1 y reinicia el launcher o el teléfono. Cambiar app.json no actualiza el icono de un APK que ya estaba compilado.

Error de CMake o Ninja en Windows: usa npm run build:android y la ruta corta C:\proy\mely. El script prepara su Ninja local. No reemplaces manualmente los ejecutables del SDK.

iOS pide credenciales o rechaza el dispositivo: comprueba el perfil utilizado. ios-simulator es para Mac; preview utiliza distribución interna y requiere el iPhone incluido en el aprovisionamiento.

Los datos no aparecen en otro teléfono: es el comportamiento de la base SQLite local. Firebase y sincronización corresponden al siguiente avance.

## 10. Referencias de instalación
Expo. App config, SDK 58: https://docs.expo.dev/versions/v58.0.0/config/app/
Expo. Compilación local: https://docs.expo.dev/guides/local-app-development/
Expo. iOS Simulator: https://docs.expo.dev/workflow/ios-simulator/
Expo. Builds de simulador: https://docs.expo.dev/build-reference/simulators/
Expo. Distribución interna: https://docs.expo.dev/build/internal-distribution/
Android Developers. ADB: https://developer.android.com/tools/adb
Apple Developer. Developer Mode: https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device

Consultado el 19 de octubre de 2026. iOS se presenta como procedimiento preparado, pendiente de ejecución y firma con las cuentas del equipo.
