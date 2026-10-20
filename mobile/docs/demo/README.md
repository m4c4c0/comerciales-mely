# Video de etapa 3 y voz pendiente

El video final se entrega sin audio, sin subtítulos y sin explicaciones superpuestas, conforme a lo solicitado. Su primer tramo presenta un visor del registro real de compilación Android; se seleccionan comandos y resultados de la ejecución de GitHub Actions, resumiendo las esperas. El resto proviene de grabaciones continuas de la aplicación instalada en un emulador Android 14. No se simulan las interacciones ni se atribuye participación a integrantes.

El guion de voz separado es docs/GUION_NARRACION_VIDEO.md. Graba la narración con el video como referencia y añade esa pista de audio al montaje final. La rúbrica exige un video de demostración de máximo 15 minutos; el guion no sustituye la participación real del equipo.

El proceso es reproducible con scripts/android-demo.py y scripts/render-video.py. La grabación utiliza screenrecord sin audio. El montaje elimina cualquier pista de audio con -an. El registro de tiempos permite ubicar cada caso probado.
