"""Verifica registro y reingreso sin borrar datos; requiere un emulador con el APK instalado."""
import importlib.util
import json
import shutil
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('android_smoke', ROOT / 'scripts/android-smoke.py')
ui = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ui)
ui.OUT = ROOT / 'output/evidence/registro-local'
ui.OUT.mkdir(parents=True, exist_ok=True)
ui.steps = []
ui.started = time.monotonic()
username = 'registro_' + str(int(time.time()))
password = 'Demo2026x'
try:
    ui.adb('shell', 'am', 'start', '-n', ui.PACKAGE + '/.MainActivity')
    ui.wait('Rol de acceso', 90)
    ui.navigate('Crear cuenta de empleado o cajero', 'Crear cuenta')
    ui.fill('Nombre completo', 'Registro de prueba')
    ui.fill('Usuario', username)
    ui.fill('Contraseña (mínimo 8 caracteres)', password)
    ui.fill('Confirmar contraseña', password)
    ui.screenshot('10-registro.png')
    try:
        ui.tap('Registrarme')
    except RuntimeError:
        ui.scroll()
        ui.tap('Registrarme')
    ui.wait('Catálogo Mely', 60)
    ui.profile()
    ui.wait(username)
    ui.screenshot('11-registro-creado.png')
    ui.record('Registro nativo de empleado y acceso automático')
    ui.logout()
    ui.login(username, password, 'Empleado')
    ui.profile()
    ui.wait(username)
    ui.tap('Alertas', contains=True)
    ui.wait('Alertas de Stock')
    ui.screenshot('12-alertas.png')
    ui.record('Cuenta conservada y autenticada nuevamente')
    ui.logout()
    ui.record('Cierre de sesión de la cuenta registrada')
    evidence = ROOT / 'output/evidence'
    for photo in ui.OUT.glob('[0-9][0-9]-*.png'):
        shutil.copy2(photo, evidence / photo.name)
    (evidence / 'registro.json').write_text(json.dumps(ui.steps, ensure_ascii=False, indent=2), encoding='utf-8')
    (evidence / 'REGISTRO_OK.txt').write_text('Registro, reingreso y cierre verificados en Android. Usuario local de prueba: ' + username + '\n', encoding='utf-8')
except Exception:
    try:
        ui.screenshot('registro-failure.png')
    except Exception:
        pass
    raise
