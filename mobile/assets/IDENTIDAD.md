# Identidad Comerciales Mely

Icono vectorial original para el proyecto: bolsa comercial y monograma M. Fondo azul oscuro #111D30, acento ámbar #F9B44D y trazo blanco. Se conservan los SVG editables y sus exportaciones PNG de 1024 px.

- mely-icon: icono general e iOS, fondo opaco.
- mely-adaptive-foreground: capa transparente de Android, marca dentro de la zona central segura.
- mely-monochrome: máscara monocromática de Android.
- favicon: exportación pequeña para web.

El proyecto utiliza estos recursos en app.json. Los archivos del template quedan sin referencia; la compilación utiliza exclusivamente la identidad Mely. Para regenerar PNG desde los SVG con scripts/generate-brand.cjs se necesita Sharp disponible en el entorno, o indicar su ruta mediante MELY_SHARP. Regenerar es opcional: los recursos finales ya están incluidos. El proyecto móvil no depende de Sharp en tiempo de ejecución.
