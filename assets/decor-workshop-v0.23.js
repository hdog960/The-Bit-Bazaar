/* The Bit Bazaar v0.23: non-destructive, grid-fine decoration workshop.
   The installed 36 original art assets remain untouched. All settings optional. */
(()=>{
'use strict';
function create({catalog,api,owned,placed,rerender}){
 const settings=new Map(),idKnown=new Set(catalog.items.map(item=>item.id));
 const base=()=>({dx:0,dz:0,turn:0,tone:0});
 const current=id=>settings.get(id)||base();
 const kindAt=slot=>catalog.slots[slot]?.kind;
 const mounted=id=>placed.get(id);
 const validNum=n=>Number.isInteger(n)&&n>=-2&&n<=2;
 function valid(id,slot,a){
  const item=catalog.items.find(x=>x.id===id);
  if(!item||!Number.isInteger(slot)||!catalog.slots[slot]||
     (item.mount||'wall')!==kindAt(slot)||!a||!validNum(a.dx)||!validNum(a.dz)||
     !Number.isInteger(a.turn)||a.turn<0||a.turn>3||
     !Number.isInteger(a.tone)||a.tone<0||a.tone>2)return false;
  const place=catalog.slots[slot],kind=place.kind;
  if(kind==='shelf')return a.dx===0&&a.dz===0&&a.turn===0;
  if(a.tone!==0||kind!=='rug'&&a.turn!==0)return false;
  if(kind==='wall'){
   if((place.side==='EAST'||place.side==='WEST')?a.dx!==0:a.dz!==0)return false;
   return true;
  }
  const x=place.x+a.dx*.25,z=place.z+a.dz*.25;
  if(kind==='floor')return !api.blocked(x,z,.38);
  if(kind==='rug'){
   // v0.20's original eight rug anchors are grandfathered at their
   // unchanged central orientation. Only *new* moves/turns need clearance.
   if(a.dx===0&&a.dz===0&&a.turn===0)return true;
   const rotated=a.turn%2!==0,halfX=rotated?1.48:2.2,halfZ=rotated?2.2:1.48;
   // Nine-point bounded footprint check; never allow carpet beneath a rack.
   for(const xi of [-1,0,1])for(const zi of [-1,0,1])
    if(api.blocked(x+xi*halfX,z+zi*halfZ,.08))return false;
  }
  return true;
 }
 function load(raw){
  settings.clear();
  const arr=raw?.decor?.adjustments;
  if(!Array.isArray(arr))return;
  const seen=new Set();
  for(const entry of arr){
   if(!Array.isArray(entry)||entry.length!==5)continue;
   const [id,dx,dz,turn,tone]=entry,slot=mounted(id);
   if(!idKnown.has(id)||!owned.has(id)||slot===undefined||seen.has(id))continue;
   const a={dx,dz,turn,tone};
   if(valid(id,slot,a)){settings.set(id,a);seen.add(id);}
  }
 }
 function snapshot(){
  return [...settings].filter(([id])=>owned.has(id)).map(([id,a])=>[id,a.dx,a.dz,a.turn,a.tone]);
 }
 function resetAll(){settings.clear();}
 function onMove(id,from,to){
  if(from!==to)settings.delete(id);
 }
 function onStore(id){settings.delete(id);}
 function pos(id,slot){
  const point=catalog.slots[slot],a=current(id);
  return {...point,x:point.x+a.dx*.25,z:point.z+a.dz*.25};
 }
 function commit(id,a){
  settings.set(id,a);api.save();rerender();return true;
 }
 function shift(id,axis,dir){
  if(!owned.has(id)||!placed.has(id)||!['dx','dz'].includes(axis)||![-1,1].includes(dir))return false;
  const a=current(id),next={...a,[axis]:a[axis]+dir};
  if(!valid(id,mounted(id),next)){
   api.notify('PLACEMENT LIMIT OR SHELF COLLISION · TRY ANOTHER DIRECTION',true);
   return false;
  }
  return commit(id,next);
 }
 function rotate(id,dir){
  if(!owned.has(id)||!placed.has(id)||kindAt(mounted(id))!=='rug'||![-1,1].includes(dir))return false;
  const a=current(id),next={...a,turn:(a.turn+dir+4)%4};
  if(!valid(id,mounted(id),next)){
   api.notify('ROTATION BLOCKED BY THE NEARBY SHELVES',true);return false;
  }
  return commit(id,next);
 }
 function material(id,tone){
  if(!owned.has(id)||!placed.has(id)||kindAt(mounted(id))!=='shelf'||
     !Number.isInteger(tone)||tone<0||tone>2)return false;
  const next={...current(id),tone};
  if(!valid(id,mounted(id),next))return false;
  return commit(id,next);
 }
 function reset(id){
  if(!owned.has(id)||!placed.has(id))return false;
  settings.delete(id);api.save();rerender();return true;
 }
 function controls(item){
  const id=item.id,slot=mounted(id);
  if(!owned.has(id)||slot===undefined)return '';
  const kind=kindAt(slot),point=catalog.slots[slot],a=current(id);
  if(kind==='shelf')return '<section class="decor-workshop"><strong>RAIL MATERIAL</strong>'+
   '<p>Pick a metallic accent. This changes the actual five-tier shelf fascia at no additional cost.</p>'+
   '<div class="decor-workshop-modes">'+['ORIGINAL GOLD','PEARL SILVER','AGED COPPER'].map((name,i)=>
    '<button type="button" data-w-tone="'+id+'" data-tone="'+i+'" aria-pressed="'+(i===a.tone)+
    '" class="'+(i===a.tone?'selected':'')+'">'+name+'</button>').join('')+
   '</div></section>';
  const lateral=(point.side==='EAST'||point.side==='WEST')?'dz':'dx';
  const dxEnabled=kind!=='wall'||lateral==='dx',dzEnabled=kind!=='wall'||lateral==='dz';
  const title=kind==='rug'?'RUG POSITION & ORIENTATION':kind==='wall'?'WALL ART ALIGNMENT':
    kind==='ceiling'?'CEILING SUSPENSION POSITION':'FLOOR DISPLAY POSITION';
  return '<section class="decor-workshop"><strong>FINE POSITION · '+title+'</strong>'+
   '<p>Position ±0.5 units, moving in 0.25-unit increments. Only safe nearby positions are allowed.</p>'+
   '<div class="decor-workshop-coords">X '+(a.dx*.25).toFixed(2)+' · Z '+(a.dz*.25).toFixed(2)+
    (kind==='rug'?' · ROTATION '+(a.turn*90)+'°':'')+'</div>'+
   '<div class="decor-workshop-arrows">'+
    '<button type="button" data-w-move="'+id+'" data-axis="dx" data-step="-1"'+(dxEnabled?'':' disabled')+'>← WEST</button>'+
    '<button type="button" data-w-move="'+id+'" data-axis="dz" data-step="-1"'+(dzEnabled?'':' disabled')+'>↑ NORTH</button>'+
    '<button type="button" data-w-move="'+id+'" data-axis="dz" data-step="1"'+(dzEnabled?'':' disabled')+'>↓ SOUTH</button>'+
    '<button type="button" data-w-move="'+id+'" data-axis="dx" data-step="1"'+(dxEnabled?'':' disabled')+'>→ EAST</button>'+
   '</div>'+
   (kind==='rug'?'<div class="decor-workshop-modes">'+
    '<button type="button" data-w-rotate="'+id+'" data-dir="-1">↶ ROTATE LEFT</button>'+
    '<button type="button" data-w-rotate="'+id+'" data-dir="1">↷ ROTATE RIGHT</button></div>':'')+
   '<button type="button" class="decor-workshop-reset" data-w-reset="'+id+'">RESET PLACEMENT</button></section>';
 }
 function bind(body){
  body.querySelectorAll('[data-w-move]').forEach(el=>el.onclick=()=>shift(el.getAttribute('data-w-move'),
    el.getAttribute('data-axis'),Number(el.getAttribute('data-step'))));
  body.querySelectorAll('[data-w-rotate]').forEach(el=>el.onclick=()=>rotate(el.getAttribute('data-w-rotate'),
    Number(el.getAttribute('data-dir'))));
  body.querySelectorAll('[data-w-tone]').forEach(el=>el.onclick=()=>material(el.getAttribute('data-w-tone'),
    Number(el.getAttribute('data-tone'))));
  body.querySelectorAll('[data-w-reset]').forEach(el=>el.onclick=()=>reset(el.getAttribute('data-w-reset')));
 }
 return {load,snapshot,resetAll,onMove,onStore,pos,rotation:id=>current(id).turn,
  tone:id=>current(id).tone,get:id=>({...current(id)}),valid,shift,rotate,material,reset,controls,bind};
}
window.BIT_BAZAAR_WORKSHOP=Object.freeze({create});
})();