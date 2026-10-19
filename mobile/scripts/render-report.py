from pathlib import Path
from html import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import re
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/pdf';OUT.mkdir(parents=True,exist_ok=True)
fontdir=Path('C:/Windows/Fonts')
for name,file in [('TimesNewRoman','times.ttf'),('TimesNewRoman-Bold','timesbd.ttf'),('TimesNewRoman-Italic','timesi.ttf')]:
 pdfmetrics.registerFont(TTFont(name,str(fontdir/file)))
body=ParagraphStyle('body',fontName='TimesNewRoman',fontSize=12,leading=24,firstLineIndent=36,spaceAfter=0,alignment=TA_LEFT,splitLongWords=True)
head=ParagraphStyle('heading',parent=body,fontName='TimesNewRoman-Bold',firstLineIndent=0,alignment=TA_CENTER,spaceBefore=12,spaceAfter=12,keepWithNext=True)
cover=ParagraphStyle('cover',parent=body,firstLineIndent=0,alignment=TA_CENTER)
ref=ParagraphStyle('ref',parent=body,leftIndent=36,firstLineIndent=-36,spaceAfter=12)
caption=ParagraphStyle('caption',parent=body,fontName='TimesNewRoman-Italic',firstLineIndent=0,leading=18,fontSize=11,spaceAfter=12)
source=(ROOT/'docs/INFORME_ETAPA3_AVANCE1.md').read_text(encoding='utf-8').replace('\u2011','-').replace('\u2013','-').replace('\u2014','-')
first,*parts=source.split('\n## ')
blocks=first.strip().split('\n\n');story=[Spacer(1,72)]
for i,block in enumerate(blocks):
 block=block.lstrip('# ').strip()
 story.append(Paragraph(escape(block).replace('\n','<br/>'),head if i==0 else cover))
 story.append(Spacer(1,12))
story.append(PageBreak())
for part in parts:
 title,_,content=part.partition('\n')
 if title=='Referencias':story.append(PageBreak())
 story.append(Paragraph(escape(title),head))
 for paragraph in re.split(r'\n\s*\n',content.strip()):
  if paragraph.strip():story.append(Paragraph(escape(paragraph.strip()).replace('\n',' '),ref if title=='Referencias' else body))
figures=[p for p in sorted((ROOT/'output/evidence').glob('*.png')) if re.match(r'^\d\d-',p.name)]
if figures:
 story.extend([PageBreak(),Paragraph('Anexo: evidencias de ejecución Android',head)])
 for i,p in enumerate(figures):
  if i:story.append(PageBreak())
  from PIL import Image as PILImage
  with PILImage.open(p) as im:w,h=im.size
  maxw,maxh=350,525;scale=min(maxw/w,maxh/h)
  story.append(Paragraph(f'Figura {i+1}',head))
  story.append(Image(str(p),width=w*scale,height=h*scale))
  story.append(Spacer(1,10))
  story.append(Paragraph(escape(p.stem[3:].replace('-',' ').capitalize())+'. Nota. Captura de la aplicación ejecutada en Android. Elaboración propia.',caption))
def page(canvas,doc):
 canvas.setFont('TimesNewRoman',12);canvas.drawRightString(letter[0]-72,letter[1]-40,str(doc.page))
path=OUT/'Informe_Etapa3_Avance1_Comerciales_Mely.pdf'
doc=SimpleDocTemplate(str(path),pagesize=letter,rightMargin=72,leftMargin=72,topMargin=72,bottomMargin=72,title='Comerciales Mely: desarrollo móvil con React Native y diseño UX/UI',author='Equipo R.E.F.E.S')
doc.build(story,onFirstPage=page,onLaterPages=page)
print(path)
