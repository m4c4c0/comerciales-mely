# Regenerar entregables

Estos pasos son opcionales para editar el informe o repetir el video; no se necesitan para usar el APK.

## PDF

En Windows, instala las dependencias Python de scripts/requirements-artifacts.txt y ejecuta python scripts/render-report.py desde la raíz móvil. Utiliza fuentes Times New Roman, Segoe UI y Consolas de Windows. Las fuentes de texto son docs/INFORME_ETAPA3_AVANCE1.md y docs/MANUAL_ANDROID_IOS.md; las capturas numeradas están en output/evidence. Se producen ambos PDF en output/pdf. Revisa las páginas renderizadas antes de publicarlas.

## Iconos

Los SVG originales y los PNG finales están en assets/mely-*. No es necesario regenerarlos. scripts/generate-brand.cjs requiere Sharp si deseas exportar nuevamente los recursos; también acepta la ruta del módulo mediante MELY_SHARP. La app utiliza los PNG ya incluidos y no necesita Sharp.

## Video sin audio ni rótulos

1. Instala el APK en un emulador Android 14 desechable. El script borra exclusivamente los datos del paquete en ese emulador; no utilices una instalación con información que necesites conservar.
2. Ejecuta python scripts/android-demo.py. La captura se divide en segmentos continuos para respetar el límite de screenrecord. Conserva output/demo/clips, tiempos.json, segmentos.json y el marcador DEMO_OK.txt. Este marcador solo existe al terminar el recorrido.
3. El montaje de esta entrega usa el registro real de la compilación 39256275087 del repositorio de referencia. El JSON de su salida se conserva como output/demo/compilacion-logs.json en el entorno de trabajo; contiene datos de la ejecución, no credenciales. Para repetir con otra compilación, también puedes guardar el log de GitHub CLI como output/demo/compilacion.log: gh run view NUMERO --repo PROPIETARIO/REPOSITORIO --log. Guárdalo con codificación UTF-8 y actualiza las referencias del informe. El renderizador acepta JSON o un log de texto.
4. Ejecuta python scripts/render-video.py y python scripts/generate-narration.py. El montaje genera un visor del registro real de compilación y concatena las capturas de la app. Elimina audio con -an. No añade subtítulos, títulos ni explicaciones sobre las capturas.
5. Revisa la duración, la ausencia de audio y los empalmes, y utiliza docs/GUION_NARRACION_VIDEO.md para grabar la voz aparte.

El repositorio del equipo contiene el flujo mobile-android.yml; sus próximas ejecuciones conservan también los segmentos crudos del recorrido en output/demo. El entorno que produjo esta entrega ejecutó adicionalmente mobile-demo.yml en wilfredo409/comerciales-mely-web; la procedencia exacta se documenta en output/evidence/VERIFICACION.md. La voz posterior y su publicación corresponden al equipo.
