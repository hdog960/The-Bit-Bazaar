/* 0.3: Bounded, lazy 32x40 pixel recolors. Never allocate a full 3,000-sprite atlas.
   All 2,000 new figurines reuse the hand-drawn originals as source artwork. */
window.createBitBazaarSprites=function(db,baseImage){
 'use strict';
 const LIMIT=112, CACHE=new Map();
 const COLORS=[[105,236,215],[86,108,176],[249,202,106],[170,134,241],
  [195,98,212],[211,138,91],[155,137,195],[248,211,163]];
 let budget=2,created=0,evicted=0;
 function frameStart(){budget=2;}
 function original(id){
  const f=db.figures[id],src=(f.sourceId===undefined?f:db.figures[f.sourceId]);
  return {image:baseImage,x:src.atlasX,y:src.atlasY};
 }
 function cached(id,force){
  if(id<1000 || !baseImage.complete || !baseImage.naturalWidth)return original(id);
  let item=CACHE.get(id);
  if(item){CACHE.delete(id);CACHE.set(id,item);return {image:item.canvas,x:0,y:0,item};}
  if(!force && budget<=0)return original(id);
  if(!force)budget--;
  const fig=db.figures[id],src=db.figures[fig.sourceId],variant=fig.editionVariant|0;
  const c=document.createElement('canvas');c.width=32;c.height=40;
  const g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;
  g.drawImage(baseImage,src.atlasX,src.atlasY,32,40,0,0,32,40);
  const data=g.getImageData(0,0,32,40),p=data.data,tone=COLORS[variant%8];
  for(let i=0;i<p.length;i+=4){
   if(p[i+3]<50)continue;
   const brightness=p[i]+p[i+1]+p[i+2];if(brightness<115)continue;
   const tint=brightness>490?.36:.24;
   p[i]=Math.min(255,p[i]*(1-tint)+tone[0]*tint);
   p[i+1]=Math.min(255,p[i+1]*(1-tint)+tone[1]*tint);
   p[i+2]=Math.min(255,p[i+2]*(1-tint)+tone[2]*tint);
  }
  g.putImageData(data,0,0);
  const ink='#21172f',bright='rgb('+tone.join(',')+')',light='#ffe3a2',shade='#775576';
  const mode=(variant+id%5)%8;
  g.fillStyle=ink;
  if(mode===0){g.fillRect(1,16,7,3);g.fillRect(24,16,7,3);g.fillStyle=bright;g.fillRect(2,14,5,6);g.fillRect(25,14,5,6);}
  else if(mode===1){g.fillRect(9,3,14,7);g.fillRect(8,0,3,6);g.fillRect(15,1,3,5);g.fillRect(21,0,3,6);g.fillStyle=light;g.fillRect(10,5,12,3);g.fillRect(16,1,2,3);}
  else if(mode===2){g.fillRect(17,1,2,10);g.fillRect(14,0,7,3);g.fillStyle=bright;g.fillRect(15,0,4,3);g.fillRect(18,4,2,3);}
  else if(mode===3){g.fillRect(24,19,7,13);g.fillStyle=shade;g.fillRect(25,20,5,9);g.fillStyle=bright;g.fillRect(26,21,3,5);g.fillRect(27,30,1,3);}
  else if(mode===4){g.fillRect(5,10,4,12);g.fillRect(23,10,4,12);g.fillStyle=bright;g.fillRect(5,12,3,9);g.fillRect(24,12,3,9);}
  else if(mode===5){g.fillRect(7,2,4,8);g.fillRect(21,2,4,8);g.fillStyle=light;g.fillRect(8,2,2,6);g.fillRect(22,2,2,6);}
  else if(mode===6){g.fillRect(24,23,7,8);g.fillStyle=bright;g.fillRect(25,24,5,6);g.fillStyle=light;g.fillRect(27,19,2,3);g.fillRect(26,18,4,1);}
  else{g.fillRect(3,15,8,7);g.fillRect(21,15,8,7);g.fillStyle=bright;g.fillRect(5,15,6,3);g.fillRect(22,15,6,3);}
  g.fillStyle=light;g.fillRect(10+id%11,30,2,3);
  item={canvas:c,url:null};CACHE.set(id,item);created++;
  if(CACHE.size>LIMIT){CACHE.delete(CACHE.keys().next().value);evicted++;}
  return {image:c,x:0,y:0,item};
 }
 function draw(ctx,id,x,y,w,h){
  if(!baseImage.complete || !baseImage.naturalWidth)return;
  const v=cached(id,false);
  ctx.drawImage(v.image,v.x,v.y,32,40,x,y,w,h);
 }
 function cssIcon(id){
  const f=db.figures[id];
  if(id<1000)return '-'+f.atlasX+'px -'+f.atlasY+'px';
  const s=cached(id,true);
  if(!s.item)return '0 0';
  if(!s.item.url)s.item.url=s.item.canvas.toDataURL('image/png');
  return `0 0;background-image:url("${s.item.url}")`;
 }
 function stats(){return {cacheSize:CACHE.size,maxCache:LIMIT,created,evicted,budget};}
 return {frameStart,draw,cssIcon,stats};
};
