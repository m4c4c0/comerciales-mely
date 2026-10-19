"""Recorrido de humo sobre un emulador Android con datos de demostración.
Requiere el APK instalado. --reset-demo borra SOLO los datos del paquete en un emulador.
"""
import argparse, subprocess, time, re, json, shutil
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
args = argparse.ArgumentParser()
args.add_argument('--device', default='emulator-5554')
args.add_argument('--reset-demo', action='store_true')
args.add_argument('--record', action='store_true')
opts = args.parse_args()
ADB = shutil.which('adb') or str(Path.home()/'AppData/Local/Android/Sdk/platform-tools/adb.exe')
PACKAGE = json.loads((ROOT/'app.json').read_text(encoding='utf-8'))['expo']['android']['package']
OUT = ROOT/'output/evidence'
OUT.mkdir(parents=True, exist_ok=True)
steps = []
(OUT/'ANDROID_SMOKE_OK.txt').unlink(missing_ok=True)
started = time.monotonic()
recording = None

def adb(*parts, timeout=45):
    result = subprocess.run([ADB, '-s', opts.device, *parts], capture_output=True, timeout=timeout)
    if result.returncode: raise RuntimeError(result.stderr.decode('utf-8', errors='replace'))
    return result.stdout

def dump():
    adb('shell','uiautomator','dump','/sdcard/mely-window.xml')
    raw = adb('shell','cat','/sdcard/mely-window.xml').decode('utf-8', errors='replace')
    (OUT/'last-window.xml').write_text(raw, encoding='utf-8')
    return ET.fromstring(raw)

def label(node): return node.attrib.get('content-desc','') or node.attrib.get('text','')

def find(text, editable=False, contains=False):
    nodes = list(dump().iter('node'))
    matches = [n for n in nodes if ((text.casefold() in label(n).casefold()) if contains else label(n).casefold()==text.casefold()) and (not editable or n.attrib.get('class')=='android.widget.EditText')]
    matches.sort(key=lambda n: n.attrib.get('clickable')!='true')
    if not matches: raise RuntimeError(f'Control no encontrado: {text}')
    return matches[0]

def tap(text, editable=False, contains=False):
    node=find(text, editable, contains)
    values=list(map(int,re.findall(r'\d+',node.attrib['bounds'])))
    x1,y1,x2,y2=values
    x,y=str((x1+x2)//2),str((y1+y2)//2)
    adb('shell','input','swipe',x,y,x,y,'120')
    time.sleep(.4)

def navigate(control, expected):
    for attempt in range(3):
        tap(control)
        try:
            return wait(expected, 12)
        except RuntimeError:
            if attempt == 2: raise
            print('Reintentando interacción:', control, flush=True)

def fill(text, value):
    tap(text, editable=True)
    adb('shell','input','text',value.replace(' ','%s'))
    adb('shell','input','keyevent','4')
    time.sleep(.3)

def wait(text, seconds=35):
    deadline=time.monotonic()+seconds
    while time.monotonic()<deadline:
        try:
            root=dump()
            if any(text.casefold() in label(n).casefold() for n in root.iter('node')): return root
        except (RuntimeError,ET.ParseError): pass
        time.sleep(.8)
    raise RuntimeError(f'No apareció: {text}')

def screenshot(name):
    (OUT/name).write_bytes(adb('exec-out','screencap','-p'))

def record(message):
    steps.append({'paso':message,'resultado':'OK','segundos':round(time.monotonic()-started,2)})
    print('OK:',message,flush=True)
    (OUT/'android-smoke.json').write_text(json.dumps(steps,ensure_ascii=False,indent=2),encoding='utf-8')

def profile(): tap('Perfil',contains=True); wait('Mi perfil')

def logout():
    profile();tap('Cerrar sesión');tap('Cerrar sesión');wait('Rol de acceso')

def login(user,password,role):
    tap(role)
    fill('Usuario',user);fill('Contraseña',password);tap('Iniciar sesión');wait('Catálogo Mely',60)

def scroll():
    size=adb('shell','wm','size').decode()
    w,h=map(int,re.search(r'(\d+)x(\d+)',size).groups())
    adb('shell','input','swipe',str(w//2),str(int(h*.78)),str(w//2),str(int(h*.30)),'450');time.sleep(.4)

try:
    if opts.reset_demo:
        if not opts.device.startswith('emulator-'): raise RuntimeError('--reset-demo solo se permite en emuladores.')
        adb('shell','pm','clear',PACKAGE)
    if opts.record:
        recording = subprocess.Popen([ADB,'-s',opts.device,'shell','screenrecord','--size','720x1280','--bit-rate','2000000','--time-limit','180','/sdcard/mely-demo.mp4'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        time.sleep(1)
        started = time.monotonic()
    adb('shell','am','force-stop',PACKAGE)
    adb('shell','am','start','-n',PACKAGE+'/.MainActivity')
    wait('Rol de acceso',90);screenshot('01-login.png');record('Inicio autónomo del APK y pantalla de acceso')
    tap('Iniciar sesión');wait('usuario:');record('Validación de formulario vacío')
    login('admin','admin123','Admin');screenshot('02-inventario.png');record('Autenticación y catálogo con recursos de Figma')
    navigate('Ver Espejo de Tocador LED','Ficha Técnica');screenshot('03-producto.png');record('Navegación a ficha técnica con fotografía')
    tap('Volver al inventario');tap('Movimientos',contains=True);wait('Registrar Movimiento')
    tap('Seleccionar producto');tap('Seleccionar Set de 6 vasos plásticos');wait('Stock actual en sala:')
    root=dump();stock_text=' '.join(label(n) for n in root.iter('node'))
    initial=int(re.search(r'Stock actual en sala: (\d+)',stock_text).group(1))
    fill('Cantidad de Unidades','2');fill('Notas / Justificación','Compra de prueba');tap('Registrar Movimiento')
    wait(f'Stock actual en sala: {initial+2}');screenshot('04-movimientos.png');record('Entrada de bodega persistida y stock actualizado')
    profile();tap('Ventas y facturación');wait('Nueva venta')
    tap('+ Agregar producto');tap('Agregar Set de 6 vasos plásticos');wait('Cantidad: Set de 6 vasos plásticos')
    tap('Emitir comprobante');tap('Confirmar');wait('Venta registrada');tap('OK');record('Venta confirmada con descuento transaccional de inventario')
    screenshot('05-ventas.png')
    profile();tap('Reportes y estadísticas');wait('Ventas diarias');screenshot('06-reportes.png');record('Reportes y gráfica actualizados con la venta')
    adb('shell','am','force-stop',PACKAGE);adb('shell','am','start','-n',PACKAGE+'/.MainActivity');wait('Catálogo Mely')
    fill('Buscar producto o categoría','vasos');wait(f'{initial+1} uds');screenshot('07-persistencia.png');record('Datos y sesión conservados tras cerrar y reabrir la app')
    logout();login('empleado','empleado123','Empleado');profile()
    root=dump();all_text=' '.join(label(n) for n in root.iter('node'))
    assert 'Ventas y facturación' not in all_text,'El empleado no debe acceder a ventas'
    screenshot('08-permisos-empleado.png');record('Permisos diferenciados del empleado')
    logout();login('facturador','factura123','Cajero');profile();wait('Ventas y facturación');screenshot('09-permisos-cajero.png');record('Permisos diferenciados del cajero')
    logout();record('Cierre de sesión revocado y retorno al acceso público')
    (OUT/'ANDROID_SMOKE_OK.txt').write_text('Recorrido Android completado: '+str(len(steps))+' comprobaciones.\n',encoding='utf-8')
except Exception as exc:
    try:
        screenshot('smoke-failure.png')
        pid=adb('shell','pidof',PACKAGE).decode().strip()
        (OUT/'logcat.txt').write_bytes(adb('logcat','-d','--pid='+pid))
    except Exception:pass
    try:
        tap('Perfil',contains=True);time.sleep(2);screenshot('diagnostico-perfil.png')
        (OUT/'diagnostico-perfil.xml').write_bytes(adb('shell','uiautomator','dump','/dev/tty'))
    except Exception:pass
    steps.append({'paso':'Recorrido interrumpido','resultado':'ERROR','detalle':str(exc)})
    (OUT/'android-smoke.json').write_text(json.dumps(steps,ensure_ascii=False,indent=2),encoding='utf-8')
    raise

finally:
    if recording is not None:
        try:
            adb('shell','pkill','-INT','screenrecord')
        except Exception: pass
        try: recording.wait(timeout=15)
        except subprocess.TimeoutExpired: recording.terminate()
        video=ROOT/'output/video';video.mkdir(parents=True,exist_ok=True)
        name='Comerciales-Mely-Android' if (OUT/'ANDROID_SMOKE_OK.txt').exists() else 'Demostracion-parcial'
        try:
            adb('pull','/sdcard/mely-demo.mp4',str(video/(name+'.mp4')),timeout=90)
            def stamp(value):
                total=int(value*1000);h,total=divmod(total,3600000);m,total=divmod(total,60000);sec,ms=divmod(total,1000);return f'{h:02}:{m:02}:{sec:02},{ms:03}'
            subtitles=[]
            for i,step in enumerate(steps):
                at=step.get('segundos',181)
                if at>=178:continue
                subtitles.append(f'{len(subtitles)+1}\n{stamp(max(0,at-1))} --> {stamp(min(179,at+5))}\n{step["paso"]}\n')
            (video/(name+'.srt')).write_text(chr(10).join(subtitles).replace(chr(92)+'n',chr(10)),encoding='utf-8')
        except Exception as error: print('Video no recuperado:',error,flush=True)
