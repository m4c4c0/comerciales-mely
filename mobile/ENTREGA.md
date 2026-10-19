# Entrega móvil de Comerciales Mely

## Instalar en Android

Abrir `output/android/Comerciales-Mely-etapa3.apk` desde el teléfono. Permitir la instalación desde la aplicación usada para abrir el archivo cuando Android lo solicite. No hace falta ejecutar Expo ni mantener una computadora encendida.

| Perfil seleccionado | Usuario | Contraseña de prueba |
| --- | --- | --- |
| Admin | admin | admin123 |
| Empleado | empleado | empleado123 |
| Cajero | facturador | factura123 |

Los datos se guardan en cada dispositivo. Son cuentas de demostración.

## Archivos para entregar

- APK, código fuente ZIP, informe PDF y video técnico: https://github.com/m4c4c0/comerciales-mely/releases/tag/etapa3-avance1-android-v1.0.0
- Código del equipo: https://github.com/m4c4c0/comerciales-mely/tree/etapa3/avance1-movil-20261018/mobile
- Informe local: output/pdf/Informe_Etapa3_Avance1_Comerciales_Mely.pdf
- Guion de explicación: docs/GUION_VIDEO.md
- Resultados reales y capturas: output/evidence/VERIFICACION.md
- Criterios y alcance: docs/CRITERIOS.md

## Estado

La compilación universal y las once comprobaciones del recorrido completo pasaron en Android 14. También se compiló ARM64 en Windows. Se exportaron los bundles finales Android e iOS y se prepararon perfiles EAS, permisos e instrucciones para iOS; no se generó un IPA.

La entrega está organizada para el primer avance de la etapa 3. El video automático de apoyo muestra operaciones reales y no tiene voz del equipo: los integrantes deben grabar su explicación de máximo 15 minutos con el guion. Para los avances posteriores quedan Firebase Authentication, Google, Firestore y sincronización con la web, según la matriz de criterios. Los commits y explicaciones de cada integrante deben corresponder a su participación real.
