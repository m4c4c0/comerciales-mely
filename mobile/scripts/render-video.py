"""Monta video mudo sin rótulos: salida real de compilación y capturas Android."""
from pathlib import Path
import json,re,subprocess,textwrap,shutil,sys
from PIL import Image,ImageDraw,ImageFont
import imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'output/demo';TMP=BASE/'montaje';TMP.mkdir(parents=True,exist_ok=True)
FF=imageio_ffmpeg.get_ffmpeg_exe();W,H=1080,1920
FONT=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',20)
def run(args):
 subprocess.run([FF,'-hide_banner','-loglevel','error','-y',*map(str,args)],check=True)
def getstrings(value):
 if isinstance(value,str):yield value
 elif isinstance(value,dict):
  for v in value.values():yield from getstrings(v)
 elif isinstance(value,list):
  for v in value:yield from getstrings(v)
source=BASE/'compilacion-logs.json'
if not source.exists():source=BASE/'compilacion.log'
content=source.read_text(encoding='utf-8-sig')
try:raw=json.loads(content)
except json.JSONDecodeError:raw={'log':content}
log=max(getstrings(raw),key=len)
# Conservar únicamente líneas originales relacionadas con comandos y su resultado.
lines=[]
for line in log.splitlines():
 line=re.sub(r'^\d{4}-\d\d-\d\dT\S+\s*','',line)
 line=re.sub(r'\x1b\[[0-9;]*m','',line)
 line=line.lstrip('✔✓ℹ› ').replace('\ufe0f','')
 lines.append(line)
selected=[]
# Los comandos y resultados se extraen de su posición real en el log, sin inventar salida.
needles=['Run npm ci','added ','Run npm test','> comerciales-mely','> node --test','✔','tests ','pass ','fail ','> expo lint','> tsc','Run npx expo prebuild','Created native','Updated package','Finished prebuild','Run chmod','chmod +x android/gradlew','cd android','./gradlew assembleRelease','> Task :app:createBundleReleaseJsAndAssets','> Task :app:processReleaseMainManifest','> Task :app:mergeReleaseResources','> Task :app:packageRelease','> Task :app:assembleRelease','BUILD SUCCESSFUL','actionable tasks:','cp android/app/build/outputs/apk/release/app-release.apk','sha256sum output/android','adb install -r mobile/output/android','Success','npm run lint','npm run typecheck','npx expo prebuild --platform android --no-install']
for line in lines:
 if line.startswith('script:') or 'Successfully initialized netsim' in line:continue
 if any(n in line for n in needles):
  line=re.sub(r'##\[(?:group|endgroup)\]','',line)
  if line.strip() and line not in selected:selected.append(line)
if not any('BUILD SUCCESSFUL' in x for x in selected):raise RuntimeError('Falta resultado real de compilación exitosa.')
(BASE/'compilacion-resumen.log').write_text('\n'.join(selected)+'\n',encoding='utf-8')
# El formato visual es un visor de salida de terminal; no hay narraciones ni rótulos.
wrapped=[]
for line in selected:wrapped.extend(textwrap.wrap(line,85,replace_whitespace=False,drop_whitespace=False) or [''])
# Mostrar progresivamente el registro original, con las esperas de compilación resumidas.
frames=[]
for i in range(1,len(wrapped)+1):
 im=Image.new('RGB',(W,H),'#0C1017');d=ImageDraw.Draw(im)
 for j,line in enumerate(wrapped[max(0,i-56):i]):d.text((24,32+j*31),line,font=FONT,fill='#DCE4ED')
 frame=TMP/f'log-{i:03}.png';im.save(frame);frames.append(frame)
 if i==len(wrapped):im.save(TMP/'terminal-00.png')
timeline=TMP/'terminal-frames.txt';entries=[]
for i,frame in enumerate(frames):
 entries.append("file '"+str(frame.resolve()).replace('\\','/')+"'")
 entries.append('duration '+str(60/len(frames)+(15 if i==len(frames)-1 else 0)))
entries.append("file '"+str(frames[-1].resolve()).replace('\\','/')+"'")
timeline.write_text('\n'.join(entries),encoding='utf-8')
clip=TMP/'terminal-00.mp4'
run(['-f','concat','-safe','0','-i',timeline,'-t','75','-vf','fps=15,format=yuv420p','-c:v','libx264','-preset','veryfast','-crf','22','-threads','2','-an',clip]);terminal=[clip]
normalized=list(terminal)
for i,file in enumerate(sorted((BASE/'clips').glob('*.mp4'))):
 out=TMP/f'android-{i:02}.mp4'
 if '--reuse-clips' in sys.argv and out.exists() and out.stat().st_size>1000:
  normalized.append(out);continue
 run(['-i',file,'-vf',f'scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:black,fps=15,setsar=1,format=yuv420p','-c:v','libx264','-preset','veryfast','-crf','22','-threads','2','-an',out]);normalized.append(out)
if len(normalized)==len(terminal):raise RuntimeError('Faltan clips reales del dispositivo.')
listing=TMP/'lista.txt';listing.write_text('\n'.join("file '"+str(x.resolve()).replace('\\','/')+"'" for x in normalized),encoding='utf-8')
output=ROOT/'output/video/Comerciales-Mely-Android.mp4'
run(['-f','concat','-safe','0','-i',listing,'-c','copy','-an','-movflags','+faststart',output])
shutil.copy2(output,ROOT/'docs/demo/Comerciales-Mely-Android.mp4')
print(output,output.stat().st_size)
