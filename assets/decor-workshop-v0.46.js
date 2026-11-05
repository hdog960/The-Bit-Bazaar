/* Bit Bazaar v0.46 — staged precision workshop, safe multi-piece spacing.
 * Preserve the historical decor.adjustments tuples [id, dx, dz, turn, tone].
 * Never save intermediate touch moves. The UI shows a 5×5 physical placement
 * preview; only explicit APPLY writes one save. Shared by all iPhone engines. */
(()=>{
'use strict';
function create({catalog,api,owned,placed,rerender}){
 const settings=new Map(),drafts=new Map();
 const idKnown=new Set(catalog.items.map(item=>item.id));
 const byId=new Map(catalog.items.map(item=>[item.id,item]));
 let expandedId=null;
 const base=()=>({dx:0,dz:0,turn:0,tone:0});
 const current=id=>settings.get(id)||base();
 const candidate=id=>drafts.get(id)||current(id);
 const kindAt=slot=>catalog.slots[slot]?.kind;
 const mounted=id=>placed.get(id);
 const equal=(a,b)=>a.dx===b.dx&&a.dz===b.dz&&a.turn===b.turn&&a.tone===b.tone;
 const limit=kind=>kind==='floor'||kind==='rug'||kind==='ceiling'?4:kind==='wall'?2:0;
 const bounds=n=>Number.isInteger(n)&&n>=-4&&n<=4;
 const offset=(site,a)=>({x:site.x+a.dx*.25,z:site.z+a.dz*.25});
 const rectOf=(kind,a)=>kind==='rug'?
  (a.turn%2?{hx:1.48,hz:2.2}:{hx:2.2,hz:1.48}):
  {hx:.86,hz:.86};
 function overlaps(id,slot,a){
  const site=catalog.slots[slot],kind=site.kind;
  if(!['floor','rug','ceiling'].includes(kind))return false;
  const p=offset(site,a),bounds=rectOf(kind,a);
  for(const [otherId,otherSlot] of placed){
   if(otherId===id)continue;
   const other=catalog.slots[otherSlot];
   if(!other)continue;
   const otherKind=other.kind;
   // Ceiling ornaments live above floor sprites; wall and shelf art cannot
   // collide with standing items in the room's real draw layers.
   if(kind==='ceiling'&&otherKind!=='ceiling')continue;
   if(kind!=='ceiling'&&!['floor','rug'].includes(otherKind))continue;
   const saved=current(otherId),q=offset(other,saved),otherBounds=rectOf(otherKind,saved);
   const dx=Math.abs(p.x-q.x),dz=Math.abs(p.z-q.z);
   if(kind==='ceiling'){
    if(Math.hypot(dx,dz)<2.05)return true;
   }else if(kind==='floor'&&otherKind==='floor'){
    if(Math.hypot(dx,dz)<1.9)return true;
   }else{
    // Real rug quads are 4.4 × 2.96 units, and rotate by right angles.
    // Reserve a thin outline so independent decorations never visually merge.
    if(dx<bounds.hx+otherBounds.hx+.1&&
       dz<bounds.hz+otherBounds.hz+.1)return true;
   }
  }
  return false;
 }
 function valid(id,slot,a,legacy=false){
  const item=byId.get(id),site=catalog.slots[slot];
  if(!item||!Number.isInteger(slot)||!site||
    (item.mount||'wall')!==site.kind||!a||!bounds(a.dx)||!bounds(a.dz)||
    !Number.isInteger(a.turn)||a.turn<0||a.turn>3||
    !Number.isInteger(a.tone)||a.tone<0||a.tone>2)return false;
  const kind=site.kind,L=limit(kind);
  if(Math.abs(a.dx)>L||Math.abs(a.dz)>L)return false;
  if(kind==='shelf')return a.dx===0&&a.dz===0&&a.turn===0;
  if(a.tone!==0||(kind!=='rug'&&a.turn!==0))return false;
  if(kind==='wall'){
   if(site.profile==='endcap')return a.dx===0&&a.dz===0;
   if((site.side==='EAST'||site.side==='WEST')?a.dx!==0:a.dz!==0)
    return false;
   return true;
  }
  const p=offset(site,a);
  if(kind==='floor'){
   if(api.blocked?.(p.x,p.z,.38))return false;
  }else if(kind==='rug'){
   // Historical eight rug mounts are grandfathered at unchanged origin.
   if(a.dx!==0||a.dz!==0||a.turn!==0){
    const {hx,hz}=rectOf(kind,a);
    for(const xi of [-1,0,1])for(const zi of [-1,0,1])
     if(api.blocked?.(p.x+xi*hx,p.z+zi*hz,.08))return false;
   }
  }else if(kind==='ceiling'&&!legacy&&api.blocked?.(p.x,p.z,.25)){
   // Keep hanging mobile silhouettes out of the shelves' pickup corridors.
   return false;
  }
  // Old, potentially hand-tuned installations must never be silently erased
  // or normalized by a newer clearance rule during save restoration.
  if(!legacy&&overlaps(id,slot,a))return false;
  return true;
 }
 function load(raw){
  settings.clear();drafts.clear();expandedId=null;
  const arr=raw?.decor?.adjustments;
  if(!Array.isArray(arr))return;
  const seen=new Set();
  for(const entry of arr){
   if(!Array.isArray(entry)||entry.length!==5)continue;
   const [id,dx,dz,turn,tone]=entry,slot=mounted(id);
   if(!idKnown.has(id)||!owned.has(id)||slot===undefined||seen.has(id))continue;
   const a={dx,dz,turn,tone};
   // Keep old valid ±0.5 positions even when new artwork occupies a nearby pad.
   if(valid(id,slot,a,true)){settings.set(id,a);seen.add(id);}
  }
 }
 function snapshot(){
  return [...settings].filter(([id])=>owned.has(id))
   .map(([id,a])=>[id,a.dx,a.dz,a.turn,a.tone]);
 }
 function resetAll(){settings.clear();drafts.clear();expandedId=null;}
 function cancelAll(){const had=drafts.size>0;drafts.clear();expandedId=null;return had;}
 function onMove(id,from,to){
  drafts.delete(id);
  if(expandedId===id)expandedId=null;
  if(from!==to)settings.delete(id);
 }
 function onStore(id){
  settings.delete(id);drafts.delete(id);
  if(expandedId===id)expandedId=null;
 }
 // The world renders only COMMITTED settings. Draft coordinates appear in
 // the on-screen mini placement grid until the player confirms them.
 function pos(id,slot){
  const point=catalog.slots[slot],a=current(id);
  return {...point,x:point.x+a.dx*.25,z:point.z+a.dz*.25};
 }
 const reject=()=>{api.notify('CLEARANCE LIMIT · TRY A DIFFERENT SAFE POSITION',true);return false};
 function stage(id,a){
  if(!owned.has(id)||!placed.has(id))return false;
  if(!valid(id,mounted(id),a))return reject();
  if(equal(a,current(id)))drafts.delete(id);
  else drafts.set(id,a);
  rerender();return true;
 }
 function shift(id,axis,dir){
  if(!owned.has(id)||!placed.has(id)||!['dx','dz'].includes(axis)||
     ![-1,1].includes(dir))return false;
  const a=candidate(id);
  return stage(id,{...a,[axis]:a[axis]+dir});
 }
 function choose(id,dx,dz){
  if(!Number.isInteger(dx)||!Number.isInteger(dz))return false;
  const a=candidate(id);
  return stage(id,{...a,dx,dz});
 }
 function rotate(id,dir){
  if(!owned.has(id)||!placed.has(id)||kindAt(mounted(id))!=='rug'||
     ![-1,1].includes(dir))return false;
  const a=candidate(id);
  return stage(id,{...a,turn:(a.turn+dir+4)%4});
 }
 function material(id,tone){
  if(!owned.has(id)||!placed.has(id)||kindAt(mounted(id))!=='shelf'||
     !Number.isInteger(tone)||tone<0||tone>2)return false;
  return stage(id,{...candidate(id),tone});
 }
 function reset(id){
  if(!owned.has(id)||!placed.has(id))return false;
  return stage(id,base()); // Preview default; no destructive save.
 }
 function apply(id){
  if(!owned.has(id)||!placed.has(id)||!drafts.has(id))return false;
  const a=drafts.get(id);
  if(!valid(id,mounted(id),a))return reject();
  const prior=settings.get(id),had=settings.has(id);
  if(equal(a,base()))settings.delete(id);
  else settings.set(id,{...a});
  let written=false;
  try{written=api.save()!==false;}catch(_){}
  if(!written){
   if(had)settings.set(id,prior);else settings.delete(id);
   // Preserve the user's unsaved selection so they can retry or cancel.
   rerender();api.notify('POSITION NOT SAVED · STORAGE FAILED · RETRY OR CANCEL',true);
   return false;
  }
  drafts.delete(id);
  rerender();api.notify('✓ ART POSITION SAVED · NO SACRIFICE');
  return true;
 }
 function cancel(id){
  if(!drafts.has(id))return false;
  drafts.delete(id);rerender();return true;
 }
 function grid(id,a,slot){
  if(!['floor','rug','ceiling'].includes(kindAt(slot))||expandedId!==id)
   return '';
  let html='<div class="decor-precision-legend"><span>WEST ← X → EAST</span>'+
   '<span>NORTH ↑ Z ↓ SOUTH</span></div>'+
   '<div class="decor-precision-grid" role="group" aria-label="Top-down positioning grid">';
  for(const z of [-4,-2,0,2,4]){
   for(const x of [-4,-2,0,2,4]){
    const legal=valid(id,slot,{...a,dx:x,dz:z});
    const active=a.dx===x&&a.dz===z;
    html+='<button type="button" data-w-pick="'+id+'" data-dx="'+x+
     '" data-dz="'+z+'" aria-label="X '+(x*.25).toFixed(2)+', Z '+(z*.25).toFixed(2)+
     (legal?', available':', blocked')+'" aria-pressed="'+active+
     '" class="'+(active?'selected ':'')+(legal?'open':'blocked')+
     '"'+(legal?'':' disabled')+'>'+(active?'◆':legal?'·':'×')+'</button>';
   }
  }
  return html+'</div><small class="decor-precision-legend">Each grid step = 0.5 world unit. Arrow buttons make finer 0.25-unit steps. ◆ is your preview position, × means blocked.</small>';
 }
 function actions(id,dirty){
  return '<div class="decor-workshop-commit">'+
   '<button type="button" data-w-apply="'+id+'"'+(!dirty?' disabled':'')+
   '>✓ APPLY POSITION · FREE</button>'+
   '<button type="button" data-w-cancel="'+id+'"'+(!dirty?' disabled':'')+
   '>✕ CANCEL PREVIEW</button></div>';
 }
 function controls(item){
  const id=item.id,slot=mounted(id);
  if(!owned.has(id)||slot===undefined)return '';
  const kind=kindAt(slot),point=catalog.slots[slot],a=candidate(id),
   committed=current(id),dirty=drafts.has(id),tag=dirty?'PREVIEW ONLY · NOT SAVED':'POSITION SAVED';
  if(point.profile==='endcap')return '<section class="decor-workshop decor-endcap-note">'+
   '<strong>FIXED SHELF-END GALLERY HOOK</strong>'+
   '<p>This artwork is hung on a real solid end panel. It stays aligned away from miniature pickup bays. To move it, use another gallery hook.</p></section>';
  if(kind==='shelf')return '<section class="decor-workshop"><strong>RAIL MATERIAL · '+tag+'</strong>'+
   '<p>Choose a metal-accent preview here, then apply it to the actual five-tier shelf at no cost.</p>'+
   '<div class="decor-workshop-modes">'+['ORIGINAL GOLD','PEARL SILVER','AGED COPPER'].map((name,i)=>
    '<button type="button" data-w-tone="'+id+'" data-tone="'+i+'" aria-pressed="'+(i===a.tone)+
    '" class="'+(i===a.tone?'selected':'')+'">'+name+'</button>').join('')+
   '</div>'+actions(id,dirty)+'</section>';
  const lateral=(point.side==='EAST'||point.side==='WEST')?'dz':'dx';
  const dxEnabled=kind!=='wall'||lateral==='dx',dzEnabled=kind!=='wall'||lateral==='dz';
  const title=kind==='rug'?'RUG POSITION & ORIENTATION':kind==='wall'?'WALL ART ALIGNMENT':
    kind==='ceiling'?'CEILING SUSPENSION POSITION':'FLOOR DISPLAY POSITION';
  const max=limit(kind)*.25;
  let html='<section class="decor-workshop"><strong>PRECISION PLACEMENT · '+title+'</strong>'+
   '<p>Preview safe positions up to ±'+max.toFixed(2)+
    ' units in 0.25-unit steps. Changing this preview does not spend rows or save anything until you apply.</p>'+
   '<div class="decor-workshop-coords">X '+(a.dx*.25).toFixed(2)+' · Z '+(a.dz*.25).toFixed(2)+
    (kind==='rug'?' · TURN '+(a.turn*90)+'°':'')+
    '<small>'+tag+'</small></div>'+
   '<div class="decor-workshop-arrows">'+
   '<button type="button" data-w-move="'+id+'" data-axis="dx" data-step="-1"'+(dxEnabled?'':' disabled')+'>← WEST</button>'+
   '<button type="button" data-w-move="'+id+'" data-axis="dz" data-step="-1"'+(dzEnabled?'':' disabled')+'>↑ NORTH</button>'+
   '<button type="button" data-w-move="'+id+'" data-axis="dz" data-step="1"'+(dzEnabled?'':' disabled')+'>↓ SOUTH</button>'+
   '<button type="button" data-w-move="'+id+'" data-axis="dx" data-step="1"'+(dxEnabled?'':' disabled')+'>→ EAST</button>'+
   '</div>';
  if(['floor','rug','ceiling'].includes(kind)){
   html+='<button type="button" class="decor-workshop-grid-toggle" data-w-grid="'+id+
    '" aria-expanded="'+(expandedId===id)+'">'+
    (expandedId===id?'▴ HIDE POSITION GRID':'⌖ OPEN TOP-DOWN POSITION GRID')+'</button>'+
    grid(id,a,slot);
  }
  if(kind==='rug')html+='<div class="decor-workshop-modes">'+
    '<button type="button" data-w-rotate="'+id+'" data-dir="-1">↶ ROTATE LEFT</button>'+
    '<button type="button" data-w-rotate="'+id+'" data-dir="1">↷ ROTATE RIGHT</button></div>';
  html+='<button type="button" class="decor-workshop-reset" data-w-reset="'+id+
   '"'+(equal(a,base())?' disabled':'')+'>↶ PREVIEW ORIGINAL POSITION</button>'+
   actions(id,dirty)+'</section>';
  return html;
 }
 function expand(id){
  if(!owned.has(id)||!placed.has(id))return false;
  if(!['floor','rug','ceiling'].includes(kindAt(mounted(id))))return false;
  expandedId=expandedId===id?null:id;rerender();return true;
 }
 function bind(body){
  body.querySelectorAll('[data-w-move]').forEach(el=>el.onclick=()=>shift(el.getAttribute('data-w-move'),
    el.getAttribute('data-axis'),Number(el.getAttribute('data-step'))));
  body.querySelectorAll('[data-w-rotate]').forEach(el=>el.onclick=()=>rotate(el.getAttribute('data-w-rotate'),
    Number(el.getAttribute('data-dir'))));
  body.querySelectorAll('[data-w-tone]').forEach(el=>el.onclick=()=>material(el.getAttribute('data-w-tone'),
    Number(el.getAttribute('data-tone'))));
  body.querySelectorAll('[data-w-reset]').forEach(el=>el.onclick=()=>reset(el.getAttribute('data-w-reset')));
  body.querySelectorAll('[data-w-pick]').forEach(el=>el.onclick=()=>choose(el.getAttribute('data-w-pick'),
    Number(el.getAttribute('data-dx')),Number(el.getAttribute('data-dz'))));
  body.querySelectorAll('[data-w-grid]').forEach(el=>el.onclick=()=>expand(el.getAttribute('data-w-grid')));
  body.querySelectorAll('[data-w-apply]').forEach(el=>el.onclick=()=>apply(el.getAttribute('data-w-apply')));
  body.querySelectorAll('[data-w-cancel]').forEach(el=>el.onclick=()=>cancel(el.getAttribute('data-w-cancel')));
 }
 return {load,snapshot,resetAll,cancelAll,onMove,onStore,pos,rotation:id=>current(id).turn,
  tone:id=>current(id).tone,get:id=>({...current(id)}),candidate:id=>({...candidate(id)}),
  pending:id=>drafts.has(id),valid,shift,choose,rotate,material,reset,apply,cancel,expand,
  controls,bind,clearance:id=>valid(id,mounted(id),candidate(id))};
}
window.BIT_BAZAAR_WORKSHOP=Object.freeze({create});
})();