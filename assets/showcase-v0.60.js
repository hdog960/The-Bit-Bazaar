/* Bit Bazaar v0.60 — photo and overhead showcase.
   Pure drawing/pose helpers; no save fields, world mutations, collection hints,
   extra 3D sprites, network services or per-frame overview allocation. */
(()=>{
'use strict';
const WIDTH=760,HEIGHT=900,SCALE=10,LEFT=30,TOP=63,SETS=300;
const validFigure=x=>Number.isInteger(x)&&x>=0&&x<3000;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const safeAngle=(yaw,target)=>{
 let diff=(target-yaw)%(2*Math.PI);
 if(diff>Math.PI)diff-=2*Math.PI;
 if(diff< -Math.PI)diff+=2*Math.PI;
 return diff;
};
function ease(pose,target,dt){
 const speed=1-Math.exp(-12*clamp(Number.isFinite(dt)?dt:0,0,.1));
 return {yaw:pose.yaw+safeAngle(pose.yaw,target.yaw)*speed,
  pitch:clamp(pose.pitch+(target.pitch-pose.pitch)*speed,-.95,.95)};
}
function metrics(slots){
 let shelved=0,perfect=0,assigned=0,unsorted=0;
 const faces=[];
 for(let face=0;face<60;face++){
  const lines=slots?.[face]||[],data={shelved:0,perfect:0,assigned:0,unsorted:0};
  for(let row=0;row<5;row++){
   const line=lines[row]||[];
   if(!Array.isArray(line)||line.length!==10)continue;
   const real=line.filter(validFigure);
   data.shelved+=real.length;
   if(real.length)data.assigned++;
   if(real.length===10){
    const sid=Math.floor(real[0]/10);
    if(line.every((id,i)=>id===sid*10+i))data.perfect++;
    else data.unsorted++;
   }
  }
  shelved+=data.shelved;perfect+=data.perfect;
  assigned+=data.assigned;unsorted+=data.unsorted;
  faces.push(data);
 }
 return {shelved,perfect,assigned,unsorted,faces};
}
function renderOverhead(canvas,model){
 if(!canvas||!canvas.getContext)return null;
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return null;
 if(canvas.width!==WIDTH)canvas.width=WIDTH;
 if(canvas.height!==HEIGHT)canvas.height=HEIGHT;
 ctx.imageSmoothingEnabled=false;
 const slots=model?.slots||[],data=metrics(slots);
 const fixtures=Array.isArray(model?.fixtures)?model.fixtures:[];
 const faces=model?.faceCleaning||[],player=model?.player||{x:35,z:68,yaw:0};
 const art=Array.isArray(model?.decor)?model.decor:[];
 const wall=(_x,_y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(_x,_y,w,h)};
 ctx.fillStyle='#161626';ctx.fillRect(0,0,WIDTH,HEIGHT);
 // Original 16-bit/pixel character of the game: tiled floor, bronze
 // shelf frames and muted mint/gold status strips — not vector gradients.
 wall(16,44,728,772,'#8e7181');
 wall(23,51,714,758,'#30283c');
 for(let z=51;z<809;z+=30){
  for(let x=23;x<737;x+=30){
   wall(x,z,28,28,((Math.floor(x/30)+Math.floor(z/30))%2)?'#352d43':'#322b40');
  }
 }
 wall(21,49,5,762,'#d0a878');wall(734,49,5,762,'#d0a878');
 wall(21,49,719,5,'#d0a878');wall(21,804,719,5,'#d0a878');
 const point=(x,z)=>({x:LEFT+x*SCALE,y:TOP+z*SCALE});
 // Every real fixture (20 double-sided floor racks and 20 wall units).
 for(const f of fixtures){
  if(!Number.isInteger(f?.id)||f.id<0||f.id>=40)continue;
  const cx=LEFT+f.x*SCALE,cy=TOP+f.z*SCALE,
   w=f.w*SCALE,h=f.depth*SCALE;
  const localFaces=f.id<20?[f.id*2,f.id*2+1]:[40+f.id-20];
  const selected=localFaces.map(id=>data.faces[id]||{perfect:0,assigned:0,unsorted:0});
  const perfect=selected.reduce((n,o)=>n+o.perfect,0),
        active=selected.reduce((n,o)=>n+o.assigned,0),
        nrows=localFaces.length*5,
        dirty=localFaces.some(id=>faces[id]!==3);
  ctx.save();ctx.translate(cx,cy);
  ctx.transform(f.ux,f.uz,f.nx,f.nz,0,0);
  wall(-w/2-3,-h/2-3,w+6,h+6,'#121526');
  wall(-w/2,-h/2,w,h,dirty?'#6e586b':perfect===nrows?'#a4d8ab':active?'#b5a1a0':'#8f7182');
  wall(-w/2+4,-h/2+4,w-8,h-8,'#42384b');
  if(f.kind==='floor'){
   wall(-w/2+4,-2,w-8,4,'#d4b586');
   for(let side=0;side<2;side++){
    const rowY=side?-h/2+1:h/2-5;
    for(let k=0;k<5;k++){
     const x=-w/2+7+k*(w-15)/5;
     wall(x,rowY,(w-16)/5-2,3,
      k<selected[side].perfect?'#bce6ac':k<selected[side].assigned?'#dcb982':'#6b596a');
    }
   }
  }else{
   for(let k=0;k<5;k++){
    const x=-w/2+7+k*(w-15)/5;
    wall(x,-h/2+2,(w-15)/5-2,3,k<perfect?'#bce6ac':k<active?'#dcb982':'#786476');
   }
  }
  ctx.restore();
 }
 // Commemorate actual installed décor only, never all possible vacant sites.
 for(const entry of art.slice(0,180)){
  const site=entry?.site;
  if(!site||!Number.isFinite(site.x)||!Number.isFinite(site.z))continue;
  const p=point(site.x,site.z);
  if(p.x<24||p.x>736||p.y<52||p.y>807)continue;
  wall(p.x-4,p.y-4,8,8,'#2a283b');
  wall(p.x-2,p.y-2,4,4,'#f7d691');
 }
 // Player's actual in-store pose, not a guessed shop-wide location.
 if(Number.isFinite(player.x)&&Number.isFinite(player.z)){
  const p=point(clamp(player.x,0,70),clamp(player.z,0,74)),yaw=Number(player.yaw)||0;
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(yaw);
  ctx.fillStyle='#a7f0e5';ctx.strokeStyle='#19454d';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(0,-15);ctx.lineTo(-9,10);ctx.lineTo(0,5);
  ctx.lineTo(9,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
 }
 // Leave the door gap open in the existing southern wall.
 wall(316,795,128,18,'#30283c');
 wall(316,805,5,16,'#b5ddc1');wall(440,805,5,16,'#b5ddc1');
 ctx.textAlign='center';
 ctx.fillStyle='#f7dfb5';ctx.font='bold 22px monospace';
 ctx.fillText('THE BIT BAZAAR',WIDTH/2,31);
 ctx.font='bold 13px monospace';ctx.fillStyle='#c2e0d6';
 ctx.fillText('N ↑',WIDTH/2,70);
 ctx.fillText('ENTRANCE',WIDTH/2,838);
 wall(17,849,726,44,'#282436');
 ctx.font='bold 14px monospace';ctx.fillStyle='#f6dbab';
 ctx.fillText(data.shelved.toLocaleString()+' / 3,000 ON SHELVES   ·   '+
  data.perfect+' / 300 PERFECT   ·   '+art.length+' DISPLAYED ART',WIDTH/2,877);
 ctx.textAlign='start';
 return {...data,installedArt:art.length,width:WIDTH,height:HEIGHT};
}
function makePhotoCanvas(source){
 if(!source||source.width!==480||source.height!==270)return null;
 const canvas=document.createElement('canvas');
 canvas.width=960;canvas.height=540;
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return null;
 ctx.imageSmoothingEnabled=false;
 ctx.drawImage(source,0,0,960,540);
 return canvas;
}
function pngBlob(canvas){
 return new Promise((resolve,reject)=>{
  if(!canvas||typeof canvas.toBlob!=='function'){reject(new Error('PNG export unavailable'));return;}
  canvas.toBlob(blob=>blob?.size>0?resolve(blob):reject(new Error('PNG encoding failed')),'image/png');
 });
}
window.BIT_BAZAAR_SHOWCASE=Object.freeze({
 WIDTH,HEIGHT,ease,metrics,renderOverhead,makePhotoCanvas,pngBlob});
})();