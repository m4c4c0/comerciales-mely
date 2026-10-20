"""Genera informe académico y manual con identidad Mely y evidencias reales."""
from pathlib import Path
from html import escape
import re,sys
from reportlab.platypus import (BaseDocTemplate,PageTemplate,Frame,Paragraph,Spacer,PageBreak,Image,Table,TableStyle,KeepTogether,Preformatted)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER,TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus.tableofcontents import TableOfContents
from PIL import Image as PILImage
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/pdf';OUT.mkdir(parents=True,exist_ok=True)
NAVY=colors.HexColor('#111D30');AMBER=colors.HexColor('#D97706');GRAY=colors.HexColor('#526174');PAPER=colors.HexColor('#F3F5F8')
for name,file in [('Body','times.ttf'),('BodyBold','timesbd.ttf'),('BodyItalic','timesi.ttf'),('UI','segoeui.ttf'),('UIBold','segoeuib.ttf'),('Code','consola.ttf')]:pdfmetrics.registerFont(TTFont(name,'C:/Windows/Fonts/'+file))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='BodyBold',italic='BodyItalic',boldItalic='BodyBold')
body=ParagraphStyle('Body',fontName='Body',fontSize=12,leading=24,firstLineIndent=36,spaceAfter=5,allowWidows=0,allowOrphans=0)
heading=ParagraphStyle('Heading',parent=body,fontName='BodyBold',firstLineIndent=0,alignment=TA_CENTER,spaceBefore=12,spaceAfter=12,keepWithNext=True)
ref=ParagraphStyle('Reference',parent=body,leftIndent=36,firstLineIndent=-36,spaceAfter=12)
ui=ParagraphStyle('UI',fontName='UI',fontSize=10.5,leading=16,textColor=NAVY,spaceAfter=10)
uih=ParagraphStyle('UIHeading',parent=ui,fontName='UIBold',fontSize=18,leading=24,spaceAfter=18,keepWithNext=True)
small=ParagraphStyle('Small',parent=ui,fontSize=8.5,leading=12,textColor=GRAY,spaceAfter=6)
cap=ParagraphStyle('Caption',fontName='BodyItalic',fontSize=10,leading=14,spaceBefore=8,textColor=NAVY)
class Document(BaseDocTemplate):
 def __init__(self,path,label,academic=False):
  super().__init__(str(path),pagesize=letter,leftMargin=60,rightMargin=60,topMargin=66,bottomMargin=58,title=label+' - Comerciales Mely',author='Equipo R.E.F.E.S',pageCompression=1)
  self.label=label;self.academic=academic
  if academic:self.leftMargin=self.rightMargin=72
  self.addPageTemplates(PageTemplate(id='Mely',frames=[Frame(self.leftMargin,self.bottomMargin,612-self.leftMargin-self.rightMargin,792-self.topMargin-self.bottomMargin,id='normal',leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)],onPage=self.decorate))
 def decorate(self,c,d):
  if d.page==1:
   c.setFillColor(NAVY);c.rect(0,0,612,792,fill=1,stroke=0)
   c.setFillColor(colors.HexColor('#1A2B44'));c.circle(575,720,220,fill=1,stroke=0)
   c.drawImage(str(ROOT/'assets/mely-icon.png'),60,608,110,110,mask='auto')
   c.setFillColor(colors.HexColor('#F9B44D'));c.setFont('UIBold',11);c.drawString(60,578,'COMERCIALES MELY')
   c.setFillColor(colors.white);c.setFont('UIBold',32)
   lines=['Desarrollo móvil','con React Native'] if self.academic else ['Manual de instalación','y ejecución']
   for y,text in zip([532,490],lines):c.drawString(60,y,text)
   c.setFont('UI',12);c.setFillColor(colors.HexColor('#D2DAE5'))
   c.drawString(60,454,'DPS941  /  CICLO II 2026  /  ETAPA 3 - AVANCE 1')
   c.setStrokeColor(AMBER);c.setLineWidth(3);c.line(60,424,150,424)
   c.setFont('UI',11)
   details=['Universidad Don Bosco · Facultad de Ingeniería','Equipo R.E.F.E.S','Docente: Alexander Alberto Siguenza Campos'] if self.academic else ['Android: instalación y compilación del APK','iOS: ejecución en Mac y preparación de firma','Guía paso a paso · Versión 1.0.1']
   for i,t in enumerate(details):c.drawString(60,391-i*21,t)
   if self.academic:
    c.setFont('UI',10)
    names=['Edwin Wilfredo Cerón Contreras | CC060761','Jorge Steven Moreno Hernández | MH222714','Raúl Adalberto Mulato Vasquez | MV222715','Fernando Raúl López Torres | LT172001','Edwin Vladimir Rivera Cubias | RC232947']
    for i,t in enumerate(names):c.drawString(60,280-i*21,t)
   else:
    c.setFont('UI',10);c.drawString(60,290,'Incluye cuentas de prueba y solución de problemas.');c.drawString(60,269,'iOS pendiente de compilación y prueba nativa.')
   c.setFont('UI',9);c.drawString(60,70,'20 DE OCTUBRE DE 2026');c.drawRightString(552,70,'R.E.F.E.S  /  1.0.1')
   return
  c.setFillColor(NAVY);c.rect(0,774,612,18,fill=1,stroke=0)
  c.setFont('UIBold',8);c.setFillColor(GRAY);c.drawString(self.leftMargin,750,'COMERCIALES MELY')
  c.setFont('UI',8);c.drawRightString(612-self.rightMargin,750,self.label.upper())
  c.setStrokeColor(colors.HexColor('#DDE3EA'));c.line(self.leftMargin,46,612-self.rightMargin,46)
  c.setFont('UI',8);c.drawString(self.leftMargin,31,'DPS941 · Equipo R.E.F.E.S · 2026')
  if not self.academic:c.drawRightString(612-self.rightMargin,31,str(d.page))
  if self.academic:
   c.setFont('Body',12);c.setFillColor(colors.black);c.drawRightString(612-self.rightMargin,726,str(d.page-1))
 def afterFlowable(self,f):
  if isinstance(f,Paragraph) and f.style.name=='Heading':
   key='section-'+str(self.seq.nextf('section'));self.canv.bookmarkPage(key);self.canv.addOutlineEntry(f.getPlainText(),key,0,False);self.notify('TOCEntry',(0,f.getPlainText(),self.page-1 if self.academic else self.page,key))
def p(t,style=ui):
 text=escape(t).replace('\n','<br/>').replace('&lt;br/&gt;','<br/>')
 text=re.sub(r'https?://[^\s<]+',lambda m:'<link href="'+m.group(0)+'" color="#365F8C">'+m.group(0)+'</link>',text)
 return Paragraph(text,style)
def reference(text):
 match=re.match(r'^(.*?\([^)]*\)\.\s*)(.*)$',text)
 if not match:return p(text,ref)
 title,sep,rest=match.group(2).partition('. ')
 ann=''
 if ' [' in title:title,ann=title.split(' [',1);ann=' ['+ann
 markup=escape(match.group(1))+'<i>'+escape(title)+'</i>'+escape(ann+sep+rest)
 markup=re.sub(r'https?://[^\s<]+',lambda m:'<link href="'+m.group(0)+'">'+m.group(0)+'</link>',markup)
 return Paragraph(markup,ref)
def image(path,maxw,maxh):
 with PILImage.open(path) as im:w,h=im.size
 k=min(maxw/w,maxh/h);return Image(str(path),width=w*k,height=h*k)
def box(rows,widths):
 t=Table([[p(str(x),small) for x in row] for row in rows],colWidths=widths,hAlign='LEFT')
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),PAPER),('LINEBELOW',(0,0),(-1,0),1,AMBER),('LINEBELOW',(0,1),(-1,-1),.4,colors.HexColor('#DDE3EA')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),7)]));return t
source=(ROOT/'docs/INFORME_ETAPA3_AVANCE1.md').read_text(encoding='utf-8-sig')
parts=source.split('\n## ')[1:];story=[Spacer(1,560),PageBreak(),p('Contenido',uih)]

toc=TableOfContents();toc.levelStyles=[ParagraphStyle('TOC',fontName='UI',fontSize=10,leading=19,firstLineIndent=0,leftIndent=0,textColor=NAVY)]
story.extend([toc,Spacer(1,20),box([['Alcance de esta entrega','Evidencia disponible'],['Android','APK autónomo, icono Mely y pruebas en Android 14.'],['iOS','Configuración y manual preparados; sin IPA ni prueba de iPhone.'],['Datos','SQLite local. Firebase y sincronización: siguiente avance.']],[145,323]),PageBreak()])
for part in parts:
 title,_,content=part.partition('\n')
 if title=='Referencias':story.append(PageBreak())
 story.append(p(title,heading))
 for para in re.split(r'\n\s*\n',content.strip()):
  if para.strip().startswith('|'):
   rows=[[c.strip() for c in line.strip().strip('|').split('|')] for line in para.strip().splitlines() if not re.match(r'^\s*\|?\s*:?-{3}',line)]
   story.extend([Spacer(1,12),box(rows,[96,96,276]),Spacer(1,12)])
  elif para.strip():story.append(reference(para.strip().replace('\n',' ')) if title=='Referencias' else p(para.strip().replace('\n',' '),body))
captions={1:('Acceso','Pantalla de autenticación y selector de perfil.'),2:('Inventario','Catálogo con imágenes, precios y existencias.'),3:('Ficha de producto','Detalle nativo del producto seleccionado.'),4:('Movimiento de entrada','La operación aumenta las existencias y deja historial.'),5:('Venta registrada','Comprobante emitido mediante la operación transaccional.'),6:('Reporte de ventas','El reporte refleja la operación confirmada.'),7:('Persistencia','Las existencias se conservan al cerrar y reabrir.'),8:('Perfil de empleado','Opciones correspondientes a su rol.'),9:('Perfil de cajero','Acceso a ventas y reportes de su perfil.'),10:('Registro','Formulario para crear una cuenta local.'),11:('Cuenta creada','Perfil autenticado después del registro.'),12:('Alertas de stock','Pantalla distinta del perfil; muestra el seguimiento de existencias.'),13:('Formulario vacío','La validación rechaza el acceso sin campos obligatorios.'),14:('Credenciales incorrectas','El sistema no permite acceder con contraseña inválida.'),15:('Registro inválido','La confirmación de contraseña debe coincidir.')}
figs=[]
for f in sorted((ROOT/'output/evidence').glob('[0-9][0-9]-*.png')):
 n=int(f.name[:2])
 if f.name=='12-registro-reingreso.png':continue
 if n in captions:figs.append((n,f))
story.extend([PageBreak(),p('Anexo. Evidencias de ejecución Android',heading),p('Capturas originales del APK 1.0.1. Las figuras 1 a 12 corresponden a la ejecución 39256275087; las figuras 13 a 15 provienen de la grabación 39259351843 sobre el mismo APK. Las figuras 11 y 12 muestran funciones diferentes: perfil y alertas. Los registros permiten contrastar las comprobaciones.',ui)])
for offset in range(0,len(figs),2):
 if offset:story.append(PageBreak())
 pair=figs[offset:offset+2];cells=[]
 for n,f in pair:
  title,note=captions[n];cells.append([p(f'Figura {n}',ParagraphStyle('Fig',parent=ui,fontName='UIBold',fontSize=11)),image(f,212,408),p(title,cap),p('Nota. '+note+' Captura de elaboración propia.',small)])
 if len(cells)==1:cells.append([])
 t=Table([cells],colWidths=[234,234]);t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7)]));story.append(t)
Document(OUT/'Informe_Etapa3_Avance1_Comerciales_Mely.pdf','Informe técnico',True).multiBuild(story)
if '--report-only' in sys.argv:
 print('Informe actualizado:',OUT/'Informe_Etapa3_Avance1_Comerciales_Mely.pdf')
 raise SystemExit(0)
# Manual con secciones navegables, pasos y comandos preservados.
manual=(ROOT/'docs/MANUAL_ANDROID_IOS.md').read_text(encoding='utf-8-sig')
ms=[Spacer(1,560),PageBreak(),p('Antes de comenzar',uih),p('Elige la ruta según el equipo disponible. El APK Android funciona de manera autónoma; el modo de desarrollo requiere herramientas y Metro. Los procedimientos de iOS están preparados y pendientes de validación nativa.',ui),box([['Tu objetivo','Ruta recomendada'],['Usar la app en Android','Sección 2: instalar APK.'],['Conectar Android por USB','Sección 3: instalar con ADB.'],['Cambiar el código Android','Secciones 4 y 5.'],['Probar iOS en un Mac','Sección 6: Xcode y simulador.'],['Compilar iOS en la nube','Sección 7: EAS y firma.'],['Comprobar el funcionamiento','Sección 8: recorrido de aceptación.']],[170,322]),Spacer(1,20),p('Archivos de entrega',uih),p('APK: Comerciales-Mely-etapa3.apk<br/>Video final: Comerciales-Mely-Android-con-voz.mp4 (8:25)<br/>Guion del montaje base: GUION_NARRACION_VIDEO.md',ui)]
for section in manual.split('\n## ')[1:]:
 title,_,text=section.partition('\n');ms.extend([PageBreak(),p(title,uih)])
 chunks=re.split(r'(```[^\n]*\n[\s\S]*?```)',text)
 for chunk in chunks:
  if chunk.startswith('```'):
   code=chunk.split('\n',1)[1].rsplit('```',1)[0].strip('\n')
   maxlen=max(map(len,code.splitlines()),default=1);size=min(9,470/(maxlen*.6))
   pre=Preformatted(code,ParagraphStyle('Cmd',fontName='Code',fontSize=size,leading=13,textColor=NAVY,spaceAfter=5,allowWidows=0,allowOrphans=0))
   t=Table([[pre]],colWidths=[492]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),PAPER),('BOX',(0,0),(-1,-1),.5,colors.HexColor('#DDE3EA')),('LEFTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),12),('BOTTOMPADDING',(0,0),(-1,-1),10)]));ms.extend([t,Spacer(1,12)])
  else:
   for para in re.split(r'\n\s*\n',chunk.strip()):
    for line in para.splitlines():
     if line.strip():ms.append(p(line.strip(),ui))
Document(OUT/'Manual_Android_iOS_Comerciales_Mely.pdf','Manual Android e iOS').build(ms)
print('Informe y manual generados en',OUT)
