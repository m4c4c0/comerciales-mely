/* Identidad vectorial original: bolsa comercial y monograma M. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const sharp = require(process.env.MELY_SHARP || 'sharp');
const mark = (mono=false) => `<g fill="none" stroke="${mono?'#FFFFFF':'#F9B44D'}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"><path d="M405 403v-30a107 107 0 0 1 214 0v30"/><path d="M370 409h284l25 284H345z"/></g><path d="M414 624V485l98 89 98-89v139" fill="none" stroke="${mono?'#FFFFFF':'#FFFFFF'}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>`;
const svg = (kind) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${kind==='icon'?'<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#1E304A"/><stop offset="1" stop-color="#0B1424"/></linearGradient></defs><path fill="url(#bg)" d="M0 0h1024v1024H0z"/><circle cx="850" cy="120" r="350" fill="#FFF" opacity=".025"/>':''}${mark(kind==='monochrome')}</svg>`;
(async()=>{
 for(const [kind,file] of [['icon','mely-icon'],['foreground','mely-adaptive-foreground'],['monochrome','mely-monochrome']]){
  fs.writeFileSync(path.join(root,'assets',file+'.svg'),svg(kind));
  await sharp(Buffer.from(svg(kind))).png().toFile(path.join(root,'assets',file+'.png'));
 }
 await sharp(Buffer.from(svg('icon'))).resize(64).png().toFile(path.join(root,'assets','favicon.png'));
 console.log('Identidad Mely: SVG originales y PNG de 1024 px generados.');
})();
