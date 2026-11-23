# APK Android — Firebase original

Compilaciones **Release de demostración** del código móvil `c0ae962`, generadas en [GitHub Actions 45114795051](https://github.com/wilfredo409/comerciales-mely-web/actions/runs/45114795051). Ambas incluyen JavaScript y recursos, apuntan a `comerciales-mely` y no necesitan Metro. La verificación del contenido y las firmas terminó correctamente.

| Dispositivo | APK | Tamaño |
|---|---|---|
| Teléfono Android ARM64 | [Descargar APK ARM64](Comerciales-Mely-final-telefono-arm64.apk) | 42,577,971 bytes |
| Emulador Android x86_64 | [Descargar APK x86_64](Comerciales-Mely-final-emulador-x86_64.apk) | 44,137,146 bytes |

Para instalar: descarga el archivo correspondiente desde GitHub (botón **Download raw file**), ábrelo en Android y permite la instalación desde esa aplicación cuando Android lo solicite. En un emulador preparado puedes usar `adb install -r RUTA_APK`. El teléfono requiere conexión a Internet para Firebase. La APK ARM64 no se instala en un emulador x86_64.

La firma usa el keystore de demostración Android, con SHA-1 `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`, registrado en el Firebase original. No se presenta como una publicación de Play Store. Para distribuir en producción se requiere una clave privada propia y registrar su huella.

Huellas de los archivos: [SHA256SUMS.txt](SHA256SUMS.txt). Estado de las pruebas reales: [verificación del Firebase original](../evidence/PRUEBAS-FIREBASE-ORIGINAL-20261122.md). Las capturas de entornos anteriores no sustituyen la aceptación de estas APK.

La APK Release x86_64 se instaló y probó en Android 14: correo Empleado/Cajero, entrada de stock, venta con IVA, PDF, reportes y sincronización con Vercel. La ARM64 fue compilada y su firma/bundle verificados; no se afirma haberla instalado en un teléfono físico. Google nativo espera completar la cuenta en el emulador.
