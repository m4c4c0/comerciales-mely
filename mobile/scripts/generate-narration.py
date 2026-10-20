"""Guion de narración alineado con los clips reales y el montaje final."""
from pathlib import Path
import json,re,subprocess
import imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'output/demo'
ff=imageio_ffmpeg.get_ffmpeg_exe()
def duration(p):
 s=subprocess.run([ff,'-hide_banner','-i',str(p)],capture_output=True,text=True,errors='replace').stderr
 h,m,sec=map(float,re.search(r'Duration: (\d+):(\d+):([\d.]+)',s).groups());return h*3600+m*60+sec
segments=json.loads((BASE/'segmentos.json').read_text(encoding='utf-8-sig'));events=json.loads((BASE/'tiempos.json').read_text(encoding='utf-8-sig'))
acc=75
for seg in segments:
 seg['montaje']=acc;seg['duracion']=duration(BASE/'clips'/seg['archivo']);acc+=seg['duracion']
def stamp(t):return f'{int(t)//60:02}:{int(t)%60:02}'
def mapped(t):
 for seg in segments:
  if seg['inicio']<=t<=seg['fin']:return seg['montaje']+min(seg['duracion'],t-seg['inicio'])
 return acc
mapped_events=[(mapped(e['segundos']),e['accion']) for e in events]
def at(text,default):return next((s for s,t in mapped_events if text.lower() in t.lower()),default)
blocks=[
(0,'Proyecto y compilación','Presentamos Comerciales Mely, la versión móvil del proyecto desarrollada con React Native y Expo para la etapa tres de DPS941. Conservamos como referencia la aplicación web y los mockups de Figma. En pantalla se muestran comandos y resultados del registro real de compilación en GitHub Actions. Primero se instalan las dependencias con npm ci. Después se ejecutan las once pruebas de negocio, lint y la revisión del proyecto. Expo genera el proyecto nativo Android con prebuild y Gradle produce un APK para teléfonos ARM64 y emuladores x86_64. El resultado BUILD SUCCESSFUL confirma que la compilación terminó. El APK incluye los recursos y el código de la aplicación; una vez instalado no depende de Metro. El manual adjunto explica cómo repetir la compilación y cómo instalar el resultado.'),
(75,'Icono, acceso y validaciones','Este es el icono instalado de Comerciales Mely: una bolsa comercial con la letra M. Abrimos la aplicación y comprobamos el acceso. Primero enviamos el formulario vacío; el sistema pide los datos obligatorios. Después utilizamos una contraseña incorrecta y el acceso es rechazado. Estos errores están controlados y no cierran la aplicación. Para continuar elegimos el perfil Admin y usamos la cuenta de demostración. El selector comprueba el perfil guardado; no concede permisos adicionales.'),
(at('Autenticación y catálogo',130),'Catálogo, navegación y movimientos','Después del acceso aparece el catálogo con las imágenes, los colores y la navegación de Figma. Consultamos una ficha con fotografía, precio y existencias. Las pestañas enlazan Inventario, Movimientos, Alertas y Perfil. Ahora seleccionamos el set de vasos para registrar una entrada de dos unidades, con su justificación. Al guardar, el stock aumenta en dos y la operación queda en el historial. Las reglas del dominio validan cantidades enteras y rechazan salidas excesivas; estos casos también se comprueban en las pruebas automatizadas.'),
(at('Entrada de bodega persistida',215),'Venta, comprobante y reportes','Desde el perfil del administrador entramos a Ventas y facturación. Agregamos una unidad del mismo producto y confirmamos la venta. El sistema genera el comprobante, descuenta la unidad y registra el movimiento relacionado como una sola operación. Los importes se calculan en centavos para evitar errores de redondeo. Después consultamos los reportes: la venta aparece en el resumen y en la gráfica. Así comprobamos que los módulos trabajan con los mismos datos.'),
(at('Reportes y gráfica',280),'Persistencia y permisos','Cerramos y volvemos a abrir la aplicación para comprobar la persistencia. La sesión y las existencias siguen disponibles. Luego revisamos los perfiles Empleado y Cajero. El empleado puede trabajar con inventario y movimientos; el cajero dispone de ventas y reportes. La base local es SQLite y cada instalación conserva sus propios datos. SecureStore protege la referencia de sesión. En este avance no existe sincronización con la web ni se utiliza Firebase como si ya estuviera implementado.'),
(at('Registro vacío',370),'Registro con datos inválidos','Volvemos al acceso y abrimos Crear cuenta. Probamos primero el formulario vacío. Luego completamos los datos pero escribimos una confirmación de contraseña diferente. La aplicación rechaza ambos casos y permite corregirlos. El registro público ofrece perfiles de empleado y facturador, pero no permite crear administradores.'),
(at('Registro correcto de empleado',435),'Registro válido y reingreso','Corregimos la confirmación y registramos la cuenta. El perfil muestra que la cuenta fue creada y autenticada. Cerramos sesión y volvemos a ingresar con sus credenciales para comprobar que el usuario quedó guardado. Este flujo comprueba registro, acceso, persistencia y cierre de sesión con una cuenta nueva.'),
(at('Alertas de existencias',490),'Alertas y cierre','Revisamos las alertas de stock y cerramos sesión. Entregamos código, APK, informe y manual. iOS está preparado para Xcode o EAS, pero todavía no se ha compilado ni probado en un iPhone.')]
blocks.sort(key=lambda x:x[0]);out=['# Guion para grabar la narración','',f'Video: Comerciales-Mely-Android.mp4. Duración aproximada: {stamp(acc)}. Sin audio ni textos superpuestos.','', 'Lee únicamente los párrafos entre comillas. Los títulos y tiempos son referencias para la grabación y no se incorporan al video. Ajusta las pausas al recorrido; no hace falta hablar durante todas las esperas. El tramo inicial es una visualización del registro real de compilación, con las esperas resumidas, y el resto es una captura real del APK en Android 14.','']
for i,(start,title,words) in enumerate(blocks):
 end=blocks[i+1][0] if i+1<len(blocks) else acc
 out.extend([f'## {stamp(start)} - {stamp(end)} | {title}','',f'"{words}"',''])
out.extend(['## Incorporar tu voz al final','','1. Abre el MP4 en tu editor de video y conserva su velocidad original.','2. Graba tu voz por bloques, con audífonos para evitar eco; puedes repetir un bloque sin volver a grabar todo.','3. Coloca cada grabación en el tiempo indicado y conserva silencios donde lo necesites.','4. Ajusta el volumen y exporta MP4 con la pista de voz. Revisa imagen, voz y duración máxima de 15 minutos.','5. Publica el video narrado y comparte el enlace solicitado por el aula. La versión muda se conserva como base.','','No afirmes haber probado un iPhone, sincronizado Firebase o realizado aportes de otro integrante. La explicación debe corresponder a la versión demostrada.','', '## Índice de acciones observadas',''])
for s,t in mapped_events:out.append(f'- {stamp(s)}: {t}.')
p=ROOT/'docs/GUION_NARRACION_VIDEO.md';p.write_text('\n'.join(out)+'\n',encoding='utf-8');print(p,stamp(acc))
