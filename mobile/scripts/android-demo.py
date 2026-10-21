"""Graba operaciones reales, sin audio ni rótulos, en un emulador desechable.
Reutiliza el recorrido probado y conserva tiempos para el guion de voz.
"""
import importlib.util, json, subprocess, threading, time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('mely_ui',ROOT/'scripts/android-smoke.py')
ui=importlib.util.module_from_spec(spec);spec.loader.exec_module(ui)
BASE=ROOT/'output/demo'; VIDEO=BASE/'clips'; VIDEO.mkdir(parents=True,exist_ok=True)
ui.OUT=BASE/'evidence';ui.OUT.mkdir(parents=True,exist_ok=True)
events=[];segments=[];stop=threading.Event();start=time.monotonic()
def event(title):
 events.append({'segundos':round(time.monotonic()-start,2),'accion':title})
 (BASE/'tiempos.json').write_text(json.dumps(events,ensure_ascii=False,indent=2),encoding='utf-8')
 print(title,flush=True)
def recorder():
 i=0
 while not stop.is_set():
  i+=1;remote=f'/sdcard/mely-{i:02}.mp4';at=time.monotonic()-start
  p=subprocess.Popen([ui.ADB,'-s',ui.opts.device,'shell','screenrecord','--size','720x1280','--bit-rate','2500000','--time-limit','150',remote],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  while p.poll() is None:
   if stop.wait(.5):
    ui.adb('shell','pkill','-INT','screenrecord');break
  p.wait(timeout=20)
  file=VIDEO/f'{i:02}.mp4';ui.adb('pull',remote,str(file),timeout=90)
  segments.append({'archivo':file.name,'inicio':round(at,2),'fin':round(time.monotonic()-start,2)})
  (BASE/'segmentos.json').write_text(json.dumps(segments,indent=2),encoding='utf-8')
def replace(label,value):
 ui.tap(label,editable=True)
 ui.adb('shell','input','keyevent','123')
 ui.adb('shell','input','keyevent',*(['67']*55))
 ui.adb('shell','input','text',value.replace(' ','%s'))
 ui.adb('shell','input','keyevent','4');time.sleep(.4)
def submit_register():
 try:ui.tap('Registrarme')
 except RuntimeError:ui.scroll();ui.tap('Registrarme')
if not ui.opts.device.startswith('emulator-'):raise RuntimeError('Solo emulador desechable.')
ui.adb('shell','pm','clear',ui.PACKAGE)
thread=threading.Thread(target=recorder,daemon=True);thread.start()
try:
 ui.adb('shell','input','keyevent','3');time.sleep(2)
 size=ui.adb('shell','wm','size').decode();w,h=map(int,ui.re.search(r'(\d+)x(\d+)',size).groups())
 ui.adb('shell','input','swipe',str(w//2),str(int(h*.92)),str(w//2),str(int(h*.18)),'500')
 ui.wait('Comerciales Mely',30);ui.screenshot('00-icono-launcher.png');time.sleep(4)
 event('Abrir APK instalado desde el icono Mely')
 ui.tap('Comerciales Mely',contains=True);ui.wait('Rol de acceso',90)
 event('Login vacío: rechazo de datos obligatorios');ui.tap('Iniciar sesión');ui.wait('usuario:');ui.screenshot('13-login-vacio.png');time.sleep(4)
 event('Credenciales incorrectas: acceso rechazado');ui.fill('Usuario','admin');ui.fill('Contraseña','claveerronea');ui.tap('Iniciar sesión');ui.wait('Usuario o contraseña incorrectos.');ui.screenshot('14-login-incorrecto.png');time.sleep(4)
 # Reiniciar únicamente la actividad elimina campos transitorios; no modifica la base.
 ui.adb('shell','am','force-stop',ui.PACKAGE);ui.adb('shell','am','start','-n',ui.PACKAGE+'/.MainActivity');ui.wait('Rol de acceso')
 ui.opts.reset_demo=False;ui.opts.record=False
 original=ui.record
 def note(message):original(message);event(message)
 ui.record=note
 event('Recorrido de acceso, catálogo, movimientos, ventas, reportes y roles')
 ui.main()
 event('Registro vacío: rechazo de datos obligatorios')
 ui.navigate('Crear cuenta de empleado o cajero','Crear cuenta');submit_register();ui.wait('nombre:');time.sleep(4)
 username='video_'+str(int(time.time()))
 ui.fill('Nombre completo','Prueba de registro');ui.fill('Usuario',username);ui.fill('Contraseña (mínimo 8 caracteres)','Demo2026x');ui.fill('Confirmar contraseña','NoCoincide1')
 event('Registro con confirmación diferente: rechazo');submit_register();ui.wait('Las contraseñas no coinciden.');ui.screenshot('15-registro-invalido.png');time.sleep(4)
 event('Registro correcto de empleado');replace('Confirmar contraseña','Demo2026x');ui.screenshot('10-registro.png');submit_register();ui.wait('Catálogo Mely',60)
 ui.profile();ui.wait(username);ui.screenshot('11-registro-creado.png');time.sleep(4)
 event('Cerrar sesión y volver a ingresar con la cuenta creada');ui.logout();ui.login(username,'Demo2026x','Empleado');ui.wait('Catálogo Mely');time.sleep(3)
 event('Alertas de existencias y navegación');ui.tap('Alertas',contains=True);ui.wait('Alertas de Stock');ui.screenshot('12-alertas.png');time.sleep(5)
 event('Cierre de sesión y fin del recorrido');ui.logout();time.sleep(4)
 (BASE/'DEMO_OK.txt').write_text('Recorrido real grabado sin audio ni textos superpuestos.\n',encoding='utf-8')
finally:
 stop.set();thread.join(timeout=120)
