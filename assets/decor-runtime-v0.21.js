/* Bit Bazaar v0.21 — Phase 4 wall architecture, ceiling ornaments, and existing decor (28 items).
   Purchases sacrifice ONLY currently perfect rows. Never adds/removes figure IDs.
   Shared across standard and Low FX engines; nothing runs per frame except draw. */
(()=>{
'use strict';
const catalog=window.BIT_BAZAAR_DECOR;
if(!catalog)throw Error('Decor artwork must load before its runtime');
function create(api){
 const owned=new Set(),placed=new Map(),byId=new Map(catalog.items.map(x=>[x.id,x]));
 let wallSlot=0,floorSlot=16,rugSlot=28,ceilingSlot=36,activeFilter='all';
 const validSlot=slot=>Number.isInteger(slot)&&slot>=0&&slot<catalog.slots.length;
 const mountFor=id=>byId.get(id)?.mount||'wall';
 const compatible=(id,slot)=>validSlot(slot)&&byId.has(id)&&
  catalog.slots[slot].kind===mountFor(id);
 const available=(slot,except=null)=>validSlot(slot)&&
  ![...placed].some(([id,s])=>s===slot&&id!==except);
 const desired=id=>mountFor(id)==='ceiling'?ceilingSlot:mountFor(id)==='rug'?rugSlot:mountFor(id)==='floor'?floorSlot:wallSlot;
 const state=()=>({owned:[...owned],placed:[...placed]});
 const load=raw=>{
  owned.clear();placed.clear();wallSlot=0;floorSlot=16;rugSlot=28;ceilingSlot=36;activeFilter='all';
  const value=raw&&raw.decor;
  if(!value||typeof value!=='object')return;
  for(const id of Array.isArray(value.owned)?value.owned:[])
   if(byId.has(id))owned.add(id);
  const used=new Set();
  for(const p of Array.isArray(value.placed)?value.placed:[]){
   if(!Array.isArray(p)||p.length!==2)continue;
   const [id,slot]=p;
   if(!owned.has(id)||placed.has(id)||!compatible(id,slot)||used.has(slot))continue;
   placed.set(id,slot);used.add(slot);
  }
 };
 const clean=()=>{owned.clear();placed.clear();wallSlot=0;floorSlot=16;rugSlot=28;ceilingSlot=36;activeFilter='all'};
 function perfectRows(){
  const rows=[];
  for(let face=0;face<60;face++)for(let row=0;row<5;row++)
   if(api.isPerfect(face,row))rows.push({face,row,ids:api.rowSlots(face,row).slice()});
  return rows;
 }
 function findScatteredSlots(rows){
  const occupied=[],positions=[];
  for(const group of rows){
   const shelf=api.shelf(group.face),f=shelf.fixture;
   const face=shelf.face;
   for(const id of group.ids){
    let position=null;
    for(let tries=0;tries<1200;tries++){
     let x,z;
     if(tries<340){
      const lateral=(Math.random()-.5)*8,forward=1.3+Math.random()*5.2;
      x=f.x+f.nx*face*(f.depth/2+forward)+f.ux*lateral;
      z=f.z+f.nz*face*(f.depth/2+forward)+f.uz*lateral;
     }else{x=2.3+Math.random()*65.4;z=2.3+Math.random()*69.4;}
     if(api.blocked(x,z,.32)||api.crowded(x,z)||
         occupied.some(p=>(p.x-x)**2+(p.z-z)**2<.28))continue;
     position={x,z};break;
    }
    if(!position)return null;
    occupied.push(position);
    positions.push({id,x:position.x,z:position.z});
   }
  }
  return positions;
 }
 function buy(id,slot=null,skipConfirmation=false){
  const item=byId.get(id);
  if(!item||owned.has(id))return false;
  if(slot===null||slot===undefined)slot=desired(id);
  if(!compatible(id,slot)||!available(slot))return false;
  const perfect=perfectRows();
  if(perfect.length<item.price){
   api.notify('NEED '+item.price+' PERFECT ROWS · CURRENTLY '+perfect.length,true);return false;
  }
  for(let i=0;i<item.price;i++){
   const j=i+Math.floor(Math.random()*(perfect.length-i));
   [perfect[i],perfect[j]]=[perfect[j],perfect[i]];
  }
  const selected=perfect.slice(0,item.price),points=findScatteredSlots(selected);
  if(!points||points.length!==item.price*10){
   api.notify('NOT ENOUGH OPEN FLOOR SPACE FOR SAFE SCATTER',true);return false;
  }
  if(!skipConfirmation){
   const message='CLAIM '+item.name.toUpperCase()+'?\n\n'+item.price+
     ' randomly chosen PERFECT shelf rows will be emptied. '+points.length+
     ' separate figurines return to open floor positions.\n\nThe decoration stays yours forever. Lifetime set mastery stays intact. Move or store the art without any further cost.';
   if(!window.confirm(message))return false;
  }
  // Construct the complete new save FIRST. If localStorage fails, do not
  // mutate the running world, shelf rows, or ownership at all.
  const before=api.snapshot(),next=JSON.parse(JSON.stringify(before));
  if(!next.decor)next.decor=state();
  next.decor.owned.push(id);next.decor.placed.push([id,slot]);
  for(const group of selected){
   next.rows[group.face][group.row]=[];
   next.slots[group.face][group.row]=Array(10).fill(null);
  }
  for(const p of points)next.ground.push([p.id,p.x,p.z]);
  try{
   const key='bit-bazaar-v3-before-first-sacrifice';
   if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(before));
   localStorage.setItem('bit-bazaar-save-v3',JSON.stringify(next));
  }catch(e){api.notify('PURCHASE STOPPED · SAVE STORAGE FAILED',true);return false;}
  try{
   for(const group of selected)api.clearRow(group.face,group.row);
   for(const p of points)api.scatter(p.id,p.x,p.z);
   owned.add(id);placed.set(id,slot);
   api.clearUndo();api.refresh();
   render();
   api.notify('★ '+item.name+' OWNED · '+points.length+' FIGURES RESCATTERED');
  }catch(e){
   // Saved next-state is already consistent. Recover it rather than allowing
   // the partially mutated old in-memory layout to overwrite the new save.
   window.BitBazaarImportInProgress=true;
   window.location.reload();
  }
  return true;
 }
 function move(id,slot=null){
  if(!owned.has(id))return false;
  if(slot===null||slot===undefined)slot=desired(id);
  if(!compatible(id,slot)||!available(slot,id))return false;
  placed.set(id,slot);api.save();render();api.notify('ART MOVED · NO SACRIFICE NEEDED');return true;
 }
 function store(id){
  if(!owned.has(id)||!placed.has(id))return false;
  placed.delete(id);api.save();render();api.notify('ART STORED · STILL PERMANENTLY OWNED');return true;
 }
 function render(){
  if(!api.isOpen())return;
  const body=api.body(),scroll=body.scrollTop,availablePerfect=api.perfectCount();
  const counts={
   wall:catalog.items.filter(item=>(item.mount||'wall')==='wall').length,
   statues:catalog.items.filter(item=>item.category==='Statues').length,
   plants:catalog.items.filter(item=>item.category==='Plants').length,
   lights:catalog.items.filter(item=>item.category==='Lighting').length,
   rugs:catalog.items.filter(item=>item.category==='Rugs').length,
   architecture:catalog.items.filter(item=>item.category==='Architecture').length,
   ceilings:catalog.items.filter(item=>item.category==='Ceilings').length
  };
  const filters=[['all','ALL '+catalog.items.length],['wall','FRAMED '+counts.wall],['statues','STATUES '+counts.statues],['plants','PLANTS '+counts.plants],['lights','LIGHTS '+counts.lights],['rugs','RUGS '+counts.rugs],['architecture','ARCHITECTURE '+counts.architecture],['ceilings','CEILINGS '+counts.ceilings],['owned','★ OWNED '+owned.size]];
  let html='<div class="decor-intro"><span>PHASE 4 · THE ARTISAN GALLERY</span>'+
   '<h3>THE SACRIFICE CATALOG</h3>'+
   '<p>Exchange properly sorted shelves for permanent art, not currency. Only currently PERFECT rows pay for purchases. Every sacrificed figure returns to a real floor position. Your historic achievements remain intact.</p>'+
   '<strong>'+availablePerfect+' PERFECT ROWS · '+owned.size+' / '+catalog.items.length+' DECORATIONS OWNED</strong></div>'+
   '<div class="decor-filters" role="group" aria-label="Decoration categories">'+
   filters.map(([id,label])=>'<button type="button" data-decor-filter="'+id+'" aria-pressed="'+
    (activeFilter===id)+'" class="'+(activeFilter===id?'selected':'')+'">'+label+'</button>').join('')+
   '</div><section class="decor-position-tools"><strong>CHOOSE WHERE YOUR ART WILL LIVE</strong>'+
   '<p>Wall frames and architectural features share wall slots; statues, plants and lights use display pads. Rugs lie flat on carpet sites, while ornaments hang from dedicated ceiling hooks. Choose all four destinations independently.</p>'+
   '<div class="decor-position-row"><label for="decorWallSlot">WALL HANGING POINT</label><select id="decorWallSlot">';
  for(const s of catalog.slots.filter(x=>x.kind==='wall')){
   const hit=[...placed].find(p=>p[1]===s.id);
   const label=s.name+(hit?' · '+byId.get(hit[0]).name+' INSTALLED':' · OPEN');
   html+='<option value="'+s.id+'"'+(s.id===wallSlot?' selected':'')+'>'+
    label.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>';
  }
  html+='</select></div><div class="decor-position-row"><label for="decorFloorSlot">FLOOR DISPLAY PAD</label><select id="decorFloorSlot">';
  for(const s of catalog.slots.filter(x=>x.kind==='floor')){
   const hit=[...placed].find(p=>p[1]===s.id);
   const label=s.name+(hit?' · '+byId.get(hit[0]).name+' INSTALLED':' · OPEN');
   html+='<option value="'+s.id+'"'+(s.id===floorSlot?' selected':'')+'>'+
    label.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>';
  }
  html+='</select></div><div class="decor-mini-map" role="group" aria-label="Quick-select interior display pads">';
  for(const s of catalog.slots.filter(x=>x.kind==='floor')){
   const taken=[...placed].some(([id,slot])=>slot===s.id);
   html+='<button type="button" data-pad="'+s.id+'" class="'+(s.id===floorSlot?'selected ':'')+
    (taken?'occupied':'')+'" aria-pressed="'+(s.id===floorSlot)+
    '" title="'+s.name+'" aria-label="'+s.name+(taken?', occupied':'')+'">'+
    String(s.id-15).padStart(2,'0')+'</button>';
  }
  html+='</div><div class="decor-position-row"><label for="decorRugSlot">RUG LOCATION · FLOOR TEXTILES</label><select id="decorRugSlot">';
  for(const s of catalog.slots.filter(x=>x.kind==='rug')){
   const hit=[...placed].find(([id,slot])=>slot===s.id);
   const label=s.name+(hit?' · '+byId.get(hit[0]).name+' INSTALLED':' · OPEN');
   html+='<option value="'+s.id+'"'+(s.id===rugSlot?' selected':'')+'>'+
    label.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>';
  }
  html+='</select></div><div class="decor-rug-pads" role="group" aria-label="Quick-select eight carpet sites">';
  for(const s of catalog.slots.filter(x=>x.kind==='rug')){
   const taken=[...placed].some(([id,slot])=>slot===s.id);
   html+='<button type="button" data-rug-pad="'+s.id+'" class="'+(s.id===rugSlot?'selected ':'')+
    (taken?'occupied':'')+'" aria-pressed="'+(s.id===rugSlot)+'" title="'+s.name+
    '" aria-label="'+s.name+(taken?', occupied':'')+'">R'+(s.id-27)+'</button>';
  }
  html+='</div><div class="decor-position-row"><label for="decorCeilingSlot">CEILING HANGING POINT</label><select id="decorCeilingSlot">';
  for(const s of catalog.slots.filter(x=>x.kind==='ceiling')){
   const hit=[...placed].find(([id,slot])=>slot===s.id);
   const label=s.name+(hit?' · '+byId.get(hit[0]).name+' INSTALLED':' · OPEN');
   html+='<option value="'+s.id+'"'+(s.id===ceilingSlot?' selected':'')+'>'+
    label.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>';
  }
  html+='</select></div><div class="decor-ceiling-hooks" role="group" aria-label="Quick-select ceiling hooks">';
  for(const s of catalog.slots.filter(x=>x.kind==='ceiling')){
   const taken=[...placed].some(([id,slot])=>slot===s.id);
   html+='<button type="button" data-ceiling-hook="'+s.id+'" class="'+(s.id===ceilingSlot?'selected ':'')+
    (taken?'occupied':'')+'" aria-pressed="'+(s.id===ceilingSlot)+'" title="'+s.name+
    '" aria-label="'+s.name+(taken?', occupied':'')+'">C'+(s.id-35)+'</button>';
  }
  html+='</div><small>All wall, floor and ceiling displays are nonblocking. Rugs can be walked across. Decorations never require coins.</small></section>';
  const filtered=catalog.items.filter(item=>activeFilter==='all'||activeFilter==='owned'&&owned.has(item.id)||
   activeFilter==='wall'&&(item.mount||'wall')==='wall'||
   activeFilter==='statues'&&item.category==='Statues'||
   activeFilter==='plants'&&item.category==='Plants'||
   activeFilter==='lights'&&item.category==='Lighting'||
   activeFilter==='rugs'&&item.category==='Rugs'||
   activeFilter==='architecture'&&item.category==='Architecture'||
   activeFilter==='ceilings'&&item.category==='Ceilings');
  html+='<div class="decor-count">'+filtered.length+' DISTINCT DECORATIONS</div>';
  for(const item of filtered){
   const isOwned=owned.has(item.id),at=placed.get(item.id),wanted=desired(item.id),
    free=compatible(item.id,wanted)&&available(wanted,item.id);
   const label=mountFor(item.id)==='ceiling'?'CEILING-HUNG ORNAMENT':item.category==='Architecture'?'ARCHITECTURAL WALL FEATURE':mountFor(item.id)==='rug'?'FLAT FLOOR TEXTILE':item.category==='Lighting'?'DECORATIVE FLOOR LAMP':mountFor(item.id)==='floor'?'FLOOR SCULPTURE / PLANT':'FRAMED WALL ART';
   html+='<article class="decor-item"><div class="decor-art '+(mountFor(item.id)==='ceiling'?'decor-ceiling':item.category==='Architecture'?'decor-architecture':mountFor(item.id)==='rug'?'decor-textile':mountFor(item.id)==='floor'?'decor-standing':'')+
    '"><img src="'+catalog.thumbnail(item.id)+
    '" width="96" height="120" alt="'+item.name+' original pixel art"></div>'+
    '<div class="decor-copy"><span class="decor-kind">'+label+'</span><h4>'+item.name+'</h4><p>'+item.description+'</p>'+
    '<strong class="decor-price">'+(isOwned?'PERMANENTLY OWNED':item.price+' PERFECT ROWS = '+(item.price*10)+' FIGURES RETURNED')+
    '</strong><small>'+(isOwned?(at===undefined?'STORED · READY TO PLACE':catalog.slots[at].name):
     availablePerfect<item.price?'NEED '+(item.price-availablePerfect)+' MORE PERFECT ROWS':!free?'SELECT AN OPEN '+(mountFor(item.id)==='ceiling'?'CEILING HOOK':mountFor(item.id)==='rug'?'RUG SITE':mountFor(item.id)==='floor'?'FLOOR PAD':'WALL HOOK'):'AVAILABLE TO CLAIM')+
    '</small><div class="decor-actions">';
   if(isOwned){
    html+='<button type="button" data-move-art="'+item.id+'"'+(free?'':' disabled')+'>PLACE / MOVE</button>'+
     '<button type="button" data-store-art="'+item.id+'"'+(at===undefined?' disabled':'')+'>STORE</button>';
   }else{
    html+='<button type="button" data-buy-art="'+item.id+'"'+(availablePerfect>=item.price&&free?'':' disabled')+'>SACRIFICE & CLAIM</button>';
   }
   html+='</div></div></article>';
  }
  if(!filtered.length)html+='<p class="decor-none">NOTHING IN THIS CATEGORY YET · KEEP COLLECTING!</p>';
  html+='<div class="decor-future"><strong>'+catalog.items.length+' / 180 ORIGINAL DECORATIONS · MORE COMING</strong>';
  for(let i=0;i<catalog.quotas.length;i++){
   const [name,quota]=catalog.quotas[i];
   const count=i===0?counts.wall-counts.architecture:i===1?counts.statues:i===2?counts.plants:i===3?counts.lights:i===4?counts.rugs:i===5?counts.architecture:i===6?counts.ceilings:0;
   html+='<span>'+name+' · '+count+' / '+quota+'</span>';
  }
  html+='<p>Full freeform furnishing, more object types, and all 180 unique items are still in development.</p></div>';
  body.innerHTML=html;body.scrollTop=scroll;
  body.querySelector('#decorWallSlot').onchange=e=>{wallSlot=Number(e.target.value);render();};
  body.querySelector('#decorFloorSlot').onchange=e=>{floorSlot=Number(e.target.value);render();};
  body.querySelector('#decorRugSlot').onchange=e=>{rugSlot=Number(e.target.value);render();};
  body.querySelector('#decorCeilingSlot').onchange=e=>{ceilingSlot=Number(e.target.value);render();};
  body.querySelectorAll('[data-pad]').forEach(el=>el.onclick=()=>{floorSlot=Number(el.getAttribute('data-pad'));render();});
  body.querySelectorAll('[data-rug-pad]').forEach(el=>el.onclick=()=>{rugSlot=Number(el.getAttribute('data-rug-pad'));render();});
  body.querySelectorAll('[data-ceiling-hook]').forEach(el=>el.onclick=()=>{ceilingSlot=Number(el.getAttribute('data-ceiling-hook'));render();});
  body.querySelectorAll('[data-decor-filter]').forEach(el=>el.onclick=()=>{
   activeFilter=el.getAttribute('data-decor-filter');render();
  });
  body.querySelectorAll('[data-buy-art]').forEach(el=>el.onclick=()=>buy(el.getAttribute('data-buy-art')));
  body.querySelectorAll('[data-move-art]').forEach(el=>el.onclick=()=>move(el.getAttribute('data-move-art')));
  body.querySelectorAll('[data-store-art]').forEach(el=>el.onclick=()=>store(el.getAttribute('data-store-art')));
 }
 function visibleDecor(cameraDepth,cameraSide,visibleSlope){
  const result=[];
  for(const [itemId,slot] of placed){
   const wall=catalog.slots[slot],d=cameraDepth(wall.x,wall.z),side=cameraSide(wall.x,wall.z);
   if(d>.3&&d<34&&Math.abs(side)<d*visibleSlope+2)
    result.push({type:'decor',depth:d,itemId,slot});
  }
  return result;
 }
 function draw(itemId,slot,project,ctx,yaw=0){
  const point=catalog.slots[slot],texture=catalog.texture(itemId);
  if(!point||!texture)return;
  if(point.kind==='ceiling'){
   // Suspended, fully transparent 2.5D artwork. World ceiling height is 4.8.
   // No collision geometry, dynamic lighting, or additional canvas allocations.
   const radius=1.03,rightX=Math.cos(yaw),rightZ=Math.sin(yaw);
   const top=4.59,bottom=2.35;
   const a=project(point.x-rightX*radius,point.z-rightZ*radius,top);
   const b=project(point.x+rightX*radius,point.z+rightZ*radius,top);
   const d=project(point.x-rightX*radius,point.z-rightZ*radius,bottom);
   if(Math.min(a.depth,b.depth,d.depth)<.24||Math.max(a.depth,b.depth,d.depth)>34)return;
   ctx.save();
   ctx.transform((b.x-a.x)/texture.width,(b.y-a.y)/texture.width,
     (d.x-a.x)/texture.height,(d.y-a.y)/texture.height,a.x,a.y);
   ctx.imageSmoothingEnabled=false;ctx.drawImage(texture,0,0);ctx.restore();
   return;
  }
  if(point.kind==='rug'){
   // A carpet lies on the real shop floor. Eight affine depth slices approximate
   // perspective mapping with no new canvases, geometry or collision objects.
   const halfWidth=2.2,halfDepth=1.48,height=.034,steps=8;
   ctx.save();ctx.imageSmoothingEnabled=false;
   for(let i=0;i<steps;i++){
    const z0=point.z-halfDepth+2*halfDepth*i/steps;
    const z1=point.z-halfDepth+2*halfDepth*(i+1)/steps;
    const a=project(point.x-halfWidth,z0,height);
    const b=project(point.x+halfWidth,z0,height);
    const d=project(point.x-halfWidth,z1,height);
    if(Math.min(a.depth,b.depth,d.depth)<.27||Math.max(a.depth,b.depth,d.depth)>37)continue;
    const srcY=texture.height*i/steps,srcH=texture.height/steps;
    ctx.save();
    ctx.transform((b.x-a.x)/texture.width,(b.y-a.y)/texture.width,
      (d.x-a.x)/srcH,(d.y-a.y)/srcH,a.x,a.y);
    ctx.drawImage(texture,0,srcY,texture.width,srcH,0,0,texture.width,srcH);
    ctx.restore();
   }
   ctx.restore();return;
  }
  let a,b,d;
  if(point.kind==='floor'){
   // A transparent 2.5D sprite always faces the observer, with feet on floor.
   const radius=.86,rightX=Math.cos(yaw),rightZ=Math.sin(yaw);
   const top=2.55,bottom=.075;
   a=project(point.x-rightX*radius,point.z-rightZ*radius,top);
   b=project(point.x+rightX*radius,point.z+rightZ*radius,top);
   d=project(point.x-rightX*radius,point.z-rightZ*radius,bottom);
  }else{
   const vertical=point.side==='WEST'||point.side==='EAST',architecture=byId.get(itemId)?.category==='Architecture',radius=architecture?1.42:.99,top=architecture?4.2:3.67,bottom=architecture?.65:1.16;
   a=vertical?project(point.x,point.z-radius,top):project(point.x-radius,point.z,top);
   b=vertical?project(point.x,point.z+radius,top):project(point.x+radius,point.z,top);
   d=vertical?project(point.x,point.z-radius,bottom):project(point.x-radius,point.z,bottom);
  }
  if(Math.min(a.depth,b.depth,d.depth)<.24||Math.max(a.depth,b.depth,d.depth)>34)return;
  ctx.save();
  ctx.transform((b.x-a.x)/texture.width,(b.y-a.y)/texture.width,
    (d.x-a.x)/texture.height,(d.y-a.y)/texture.height,a.x,a.y);
  ctx.imageSmoothingEnabled=false;ctx.drawImage(texture,0,0);ctx.restore();
 }
 return {load,clean,state,render,buy,move,store,perfectRows,visibleDecor,draw,
  catalog,placedSlots:()=>[...placed],ownedIds:()=>[...owned]};
}
window.BIT_BAZAAR_PHASE4=Object.freeze({create});
})();
