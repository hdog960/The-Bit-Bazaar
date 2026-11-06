/* Bit Bazaar v0.61 — optional collector postcards, on-demand only.
 * Prints REAL Photo Studio canvas pixels inside a wholly original 16-bit
 * illustrated frame. No remote uploads, saved settings, extra figures or
 * fabricated collection totals. Plain export remains completely unchanged. */
(()=>{
'use strict';
const STYLES=Object.freeze([
 Object.freeze({id:'plain',name:'ORIGINAL PHOTO',metal:'#f5d9a6',ink:'#252037',paper:'#43394b'}),
 Object.freeze({id:'hearthwood',name:'HEARTHWOOD KEEPSAKE',metal:'#edc58d',ink:'#231b29',paper:'#6e4b43'}),
 Object.freeze({id:'night',name:'MIDNIGHT CABINET',metal:'#b8e2d0',ink:'#191b32',paper:'#393752'}),
 Object.freeze({id:'crown',name:'COLLECTOR’S CROWN',metal:'#ffe1a3',ink:'#291c38',paper:'#674765'})
]);
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const count=(n,max)=>{
 if(!Number.isFinite(n))return 0;
 return clamp(Math.floor(n),0,max);
};
function facts(input={}){
 return Object.freeze({
  shelved:count(input.shelved,3000),
  perfect:count(input.perfect,300),
  mastered:count(input.mastered,300),
  decorations:count(input.decorations,180)
 });
}
function styleAt(value){
 const id=typeof value==='string'?value:STYLES[Number.isInteger(value)?((value%STYLES.length)+STYLES.length)%STYLES.length:0]?.id;
 return STYLES.find(s=>s.id===id)||STYLES[0];
}
function nextStyle(value){
 const i=STYLES.findIndex(s=>s.id===styleAt(value).id);
 return STYLES[(i+1)%STYLES.length];
}
function compose(source,styleValue,input){
 if(!source||!Number.isInteger(source.width)||!Number.isInteger(source.height)||
  source.width<320||source.height<200||source.width>1400||source.height>1400)
  throw new Error('Invalid photographic source');
 const style=styleAt(styleValue);
 if(style.id==='plain')return source;
 const w=source.width+96,h=source.height+200;
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)throw new Error('Pixel postcard canvas unavailable');
 ctx.imageSmoothingEnabled=false;
 const f=facts(input),rect=(x,y,cw,ch,color)=>{
  ctx.fillStyle=color;ctx.fillRect(x,y,cw,ch);
 };
 rect(0,0,w,h,style.ink);
 rect(8,8,w-16,h-16,style.metal);
 rect(15,15,w-30,h-30,style.paper);
 rect(21,21,w-42,h-42,style.ink);
 // Four inset corners and repeating hand-inked pixel embellishments.
 for(const dx of [0,1])for(const dy of [0,1]){
  const x=dx?w-44:26,y=dy?h-44:26,ex=dx?-1:1,ey=dy?-1:1;
  rect(x,y,18,5,style.metal);rect(x,y,5,18,style.metal);
  rect(x+ex*10,y+ey*10,6,6,style.metal);
 }
 const imageX=48,imageY=68;
 rect(imageX-5,imageY-5,source.width+10,source.height+10,style.metal);
 rect(imageX-2,imageY-2,source.width+4,source.height+4,style.ink);
 ctx.drawImage(source,imageX,imageY,source.width,source.height);
 // A thin ruled top and footer, with ornamental 8-bit stitch pattern.
 rect(46,51,w-92,3,style.metal);
 const footerTop=imageY+source.height+17;
 rect(46,footerTop,w-92,3,style.metal);
 for(let x=55;x<w-50;x+=18){
  rect(x,39,8,3,style.metal);
  rect(x,footerTop+9,8,3,style.metal);
 }
 ctx.fillStyle=style.metal;ctx.textAlign='center';
 ctx.font='bold 21px monospace';
 ctx.fillText('THE BIT BAZAAR',Math.floor(w/2),43);
 // The four statistics are always sourced from currently owned/shelved
 // physical state. Never show unseen figure names, lore, or positions.
 ctx.font='bold 12px monospace';
 ctx.fillText(
  f.shelved.toLocaleString('en-US')+'/3,000 SHELVED  ·  '+
  f.perfect+'/300 PERFECT',Math.floor(w/2),footerTop+36
 );
 ctx.font='bold 10px monospace';
 ctx.fillText(
  f.mastered+'/300 LIFETIME SETS  ·  '+f.decorations+'/180 OWNED ART',
  Math.floor(w/2),footerTop+54
 );
 ctx.fillStyle=style.ink;ctx.textAlign='center';
 ctx.font='bold 9px monospace';
 rect(Math.floor(w/2)-110,h-27,220,14,style.metal);
 ctx.fillText(style.name,Math.floor(w/2),h-17);
 ctx.textAlign='start';
 return canvas;
}
window.BIT_BAZAAR_POSTCARDS=Object.freeze({STYLES,styleAt,nextStyle,facts,compose});
})();