/* Bit Bazaar v0.26 — 48 original art items, 129 physical displays, compact paginated gallery.
   Purchases sacrifice ONLY currently perfect rows. Never adds/removes figure IDs.
   Shared across standard and Low FX engines; nothing runs per frame except draw. */
(()=>{
'use strict';
const catalog=window.BIT_BAZAAR_DECOR;
if(!catalog)throw Error('Decor artwork must load before its runtime');
function create(api){
 const owned=new Set(),placed=new Map(),byId=new Map(catalog.items.map(x=>[x.id,x]));
 const mounts=Object.freeze(Object.fromEntries(['wall','floor','rug','ceiling','shelf']
  .map(kind=>[kind,catalog.slots.filter(s=>s.kind===kind)])));
 const PAGE_SIZE=12;let page=0;
 const newArrivals=new Set(catalog.items.slice(-12).map(item=>item.id));
 const itemOrder=new Map(catalog.items.map((item,i)=>[item.id,i]));
 let sortOrder='original';
 const workshop=window.BIT_BAZAAR_WORKSHOP.create({catalog,api,owned,placed,rerender:()=>render()});
 const room=window.BIT_BAZAAR_ROOM.create({api,rerender:()=>render()});
 let wallSlot=0,floorSlot=16,rugSlot=28,ceilingSlot=36,shelfSlot=44,activeFilter='all';
 const validSlot=slot=>Number.isInteger(slot)&&slot>=0&&slot<catalog.slots.length;
 const mountFor=id=>byId.get(id)?.mount||'wall';
 const compatible=(id,slot)=>validSlot(slot)&&byId.has(id)&&
  catalog.slots[slot].kind===mountFor(id);
 const available=(slot,except=null)=>validSlot(slot)&&
  ![...placed].some(([id,s])=>s===slot&&id!==except);
 const desired=id=>mountFor(id)==='shelf'?shelfSlot:mountFor(id)==='ceiling'?ceilingSlot:mountFor(id)==='rug'?rugSlot:mountFor(id)==='floor'?floorSlot:wallSlot;
 function nextOpen(kind){
  const sites=mounts[kind];if(!sites||!sites.length)return false;
  const selected=kind==='wall'?wallSlot:kind==='floor'?floorSlot:kind==='rug'?rugSlot:
   kind==='ceiling'?ceilingSlot:shelfSlot;
  const current=sites.findIndex(x=>x.id===selected);
  for(let offset=1;offset<=sites.length;offset++){
   const site=sites[(current+offset+sites.length)%sites.length];
   if(!available(site.id))continue;
   if(kind==='wall')wallSlot=site.id;
   else if(kind==='floor')floorSlot=site.id;
   else if(kind==='rug')rugSlot=site.id;
   else if(kind==='ceiling')ceilingSlot=site.id;
   else shelfSlot=site.id;
   render();return true;
  }
  api.notify('NO OPEN '+kind.toUpperCase()+' DISPLAY POSITIONS',true);return false;
 }
 const state=()=>({owned:[...owned],placed:[...placed],adjustments:workshop.snapshot(),room:room.state()});
 const load=raw=>{
  owned.clear();placed.clear();workshop.resetAll();wallSlot=0;floorSlot=16;rugSlot=28;ceilingSlot=36;shelfSlot=44;activeFilter='all';sortOrder='original';page=0;
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
  workshop.load(raw);
  room.load(raw);
 };
 const clean=()=>{owned.clear();placed.clear();workshop.resetAll();room.reset();wallSlot=0;floorSlot=16;rugSlot=28;ceilingSlot=36;shelfSlot=44;activeFilter='all';sortOrder='original';page=0};
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
  workshop.onMove(id,placed.get(id),slot);
  placed.set(id,slot);api.save();render();api.notify('ART MOVED · NO SACRIFICE NEEDED');return true;
 }
 function store(id){
  if(!owned.has(id)||!placed.has(id))return false;
  placed.delete(id);workshop.onStore(id);api.save();render();api.notify('ART STORED · STILL PERMANENTLY OWNED');return true;
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
   ceilings:catalog.items.filter(item=>item.category==='Ceilings').length,
   trims:catalog.items.filter(item=>item.category==='Shelf Trims').length,
   curios:catalog.items.filter(item=>item.category==='Curios').length
  };
  const filters=[['all','ALL '+catalog.items.length],['new','✦ NEW 12'],['wall','FRAMED '+counts.wall],['statues','STATUES '+counts.statues],['plants','PLANTS '+counts.plants],['lights','LIGHTS '+counts.lights],['rugs','RUGS '+counts.rugs],['architecture','ARCHITECTURE '+counts.architecture],['ceilings','CEILINGS '+counts.ceilings],['trims','SHELF TRIMS '+counts.trims],['curios','CURIOS '+counts.curios],['owned','★ OWNED '+owned.size]];
  let html='<div class="decor-intro"><span>PHASE 4 · THE ARTISAN GALLERY</span>'+
   '<h3>THE SACRIFICE CATALOG</h3>'+
   '<p>Exchange properly sorted shelves for permanent art, not currency. Only currently PERFECT rows pay for purchases. Every sacrificed figure returns to a real floor position. Your historic achievements remain intact.</p>'+
   '<strong>'+availablePerfect+' PERFECT ROWS · '+owned.size+' / '+catalog.items.length+' DECORATIONS OWNED</strong>'+
   '<div class="decor-space-summary">'+
   ['wall','floor','rug','ceiling','shelf'].map(kind=>
    '<span>'+kind.toUpperCase()+' '+mounts[kind].filter(site=>available(site.id)).length+
    ' / '+mounts[kind].length+' OPEN</span>').join('')+
   '</div></div>'+
   '<div class="decor-filters" role="group" aria-label="Decoration categories">'+
   filters.map(([id,label])=>'<button type="button" data-decor-filter="'+id+'" aria-pressed="'+
    (activeFilter===id)+'" class="'+(activeFilter===id?'selected':'')+'">'+label+'</button>').join('')+
   '</div><div class="decor-sort-row" role="group" aria-label="Catalog sorting">'+
    '<strong>ARRANGE COLLECTION:</strong>'+
    [['original','ORIGINAL ORDER'],['cheap','LOWEST COST'],['rare','HIGHEST COST']].map(([key,label])=>
     '<button type="button" data-decor-sort="'+key+'" aria-pressed="'+(sortOrder===key)+
     '" class="'+(sortOrder===key?'selected':'')+'">'+label+'</button>').join('')+
    '</div>'+room.render()+'<section class="decor-position-tools"><strong>CHOOSE WHERE YOUR ART WILL LIVE</strong>'+
   '<p>Frames and architecture use wall hooks; freestanding curios join plants, lamps and statues on floor display pads. Rugs lie flat, ornaments hang from the ceiling, and shelf finishes attach to actual numbered display faces.</p>'+
   '<div class="decor-position-row"><label for="decorWallSlot">WALL HANGING POINT</label><select id="decorWallSlot">';
  for(const s of mounts.wall){
   const hit=[...placed].find(p=>p[1]===s.id);
   const label=s.name+(hit?' · '+byId.get(hit[0]).name+' INSTALLED':' · OPEN');
   html+='<option value="'+s.id+'"'+(s.id===wallSlot?' selected':'')+'>'+
    label.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>';
  }
  html+='</select><button type="button" class="decor-next-open" data-next-open="wall">⌖ NEXT OPEN WALL HOOK</button></div><div class="decor-position-row"><label for="decorFloorSlot">FLOOR DISPLAY PAD</label><select id="decorFloorSlot">';
  for(const s of mounts.floor){
   const hit=[...placed].find(p=>p[1]===s.id);
   const label=s.name+(hit?' · '+byId.get(hit[0]).name+' INSTALLED':' · OPEN');
   html+='<option value="'+s.id+'"'+(s.id===floorSlot?' selected':'')+'>'+
    label.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>';
  }
  html+='</select><button type="button" class="decor-next-open" data-next-open="floor">⌖ NEXT OPEN FLOOR PAD</button></div><div class="decor-mini-map" role="group" aria-label="Quick-select interior display pads">';
  for(const s of mounts.floor){
   const taken=[...placed].some(([id,slot])=>slot===s.id);
   html+='<button type="button" data-pad="'+s.id+'" class="'+(s.id===floorSlot?'selected ':'')+
    (taken?'occupied':'')+'" aria-pressed="'+(s.id===floorSlot)+
    '" title="'+s.name+'" aria-label="'+s.name+(taken?', occupied':'')+'">'+
    String(mounts.floor.indexOf(s)+1).padStart(2,'0')+'</button>';
  }
  html+='</div><div class="decor-position-row"><label for="decorRugSlot">RUG LOCATION · FLOOR TEXTILES</label><select id="decorRugSlot">';
  for(const s of mounts.rug){
   const hit=[...placed].find(([id,slot])=>slot===s.id);
   const label=s.name+(hit?' · '+byId.get(hit[0]).name+' INSTALLED':' · OPEN');
   html+='<option value="'+s.id+'"'+(s.id===rugSlot?' selected':'')+'>'+
    label.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>';
  }
  html+='</select><button type="button" class="decor-next-open" data-next-open="rug">⌖ NEXT OPEN RUG SITE</button></div><div class="decor-rug-pads" role="group" aria-label="Quick-select carpet sites">';
  for(const s of mounts.rug){
   const taken=[...placed].some(([id,slot])=>slot===s.id);
   html+='<button type="button" data-rug-pad="'+s.id+'" class="'+(s.id===rugSlot?'selected ':'')+
    (taken?'occupied':'')+'" aria-pressed="'+(s.id===rugSlot)+'" title="'+s.name+
    '" aria-label="'+s.name+(taken?', occupied':'')+'">R'+(mounts.rug.indexOf(s)+1)+'</button>';
  }
  html+='</div><div class="decor-position-row"><label for="decorCeilingSlot">CEILING HANGING POINT</label><select id="decorCeilingSlot">';
  for(const s of mounts.ceiling){
   const hit=[...placed].find(([id,slot])=>slot===s.id);
   const label=s.name+(hit?' · '+byId.get(hit[0]).name+' INSTALLED':' · OPEN');
   html+='<option value="'+s.id+'"'+(s.id===ceilingSlot?' selected':'')+'>'+
    label.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>';
  }
  html+='</select><button type="button" class="decor-next-open" data-next-open="ceiling">⌖ NEXT OPEN CEILING HOOK</button></div><div class="decor-ceiling-hooks" role="group" aria-label="Quick-select ceiling hooks">';
  for(const s of mounts.ceiling){
   const taken=[...placed].some(([id,slot])=>slot===s.id);
   html+='<button type="button" data-ceiling-hook="'+s.id+'" class="'+(s.id===ceilingSlot?'selected ':'')+
    (taken?'occupied':'')+'" aria-pressed="'+(s.id===ceilingSlot)+'" title="'+s.name+
    '" aria-label="'+s.name+(taken?', occupied':'')+'">C'+(mounts.ceiling.indexOf(s)+1)+'</button>';
  }
  html+='</div><div class="decor-position-row"><label for="decorShelfSlot">SHELF FACE · RAIL FINISH LOCATION</label><select id="decorShelfSlot">';
  for(const s of mounts.shelf){
   const hit=[...placed].find(([id,slot])=>slot===s.id);
   const label=s.name+(hit?' · '+byId.get(hit[0]).name+' INSTALLED':' · OPEN');
   html+='<option value="'+s.id+'"'+(s.id===shelfSlot?' selected':'')+'>'+
    label.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>';
  }
  html+='</select><button type="button" class="decor-next-open" data-next-open="shelf">⌖ NEXT OPEN SHELF FACE</button><div class="decor-shelf-navigation"><button type="button" data-shelf-step="-1">‹ PREVIOUS FACE</button>'+
   '<button type="button" data-shelf-step="1">NEXT FACE ›</button></div>'+
   '<button type="button" class="decor-map-shelf" id="decorLocateShelf">⌖ LOCATE SELECTED SHELF ON STORE MAP</button>'+
   '<small>The finish decorates the rails of one actual physical shelf face, including its five tiers, without disturbing the figurines or cleaning progress.</small></div>'+
   '<small>All items remain nonblocking. Every decoration costs only currently perfect rows, never money.</small></section>';
  const filtered=catalog.items.filter(item=>activeFilter==='all'||activeFilter==='new'&&newArrivals.has(item.id)||activeFilter==='owned'&&owned.has(item.id)||
   activeFilter==='wall'&&(item.mount||'wall')==='wall'||
   activeFilter==='statues'&&item.category==='Statues'||
   activeFilter==='plants'&&item.category==='Plants'||
   activeFilter==='lights'&&item.category==='Lighting'||
   activeFilter==='rugs'&&item.category==='Rugs'||
   activeFilter==='architecture'&&item.category==='Architecture'||
   activeFilter==='ceilings'&&item.category==='Ceilings'||
   activeFilter==='trims'&&item.category==='Shelf Trims'||
   activeFilter==='curios'&&item.category==='Curios');
  if(sortOrder==='cheap')filtered.sort((a,b)=>a.price-b.price||itemOrder.get(a.id)-itemOrder.get(b.id));
  if(sortOrder==='rare')filtered.sort((a,b)=>b.price-a.price||itemOrder.get(a.id)-itemOrder.get(b.id));
  const pageCount=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  page=Math.min(Math.max(0,page),pageCount-1);
  const currentItems=filtered.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
  const pager=()=>pageCount===1?'':'<nav class="decor-pager" aria-label="Decoration pages">'+
   '<button type="button" data-decor-page="-1"'+(page===0?' disabled':'')+'>‹ PREVIOUS</button>'+
   '<span>PAGE '+(page+1)+' / '+pageCount+' · '+(page*PAGE_SIZE+1)+'–'+
     Math.min((page+1)*PAGE_SIZE,filtered.length)+' OF '+filtered.length+'</span>'+
   '<button type="button" data-decor-page="1"'+(page===pageCount-1?' disabled':'')+'>NEXT ›</button></nav>';
  html+='<div class="decor-count" id="decorCardStart">'+filtered.length+' DISTINCT DECORATIONS'+
   (activeFilter==='new'?' · JUST ARRIVED':'')+'</div>'+pager();
  for(const item of currentItems){
   const isOwned=owned.has(item.id),at=placed.get(item.id),wanted=desired(item.id),
    free=compatible(item.id,wanted)&&available(wanted,item.id);
   const label=mountFor(item.id)==='shelf'?'PATTERNED SHELF FASCIA · FIVE TIERS':item.category==='Curios'?'COLLECTOR FLOOR CURIO':mountFor(item.id)==='ceiling'?'CEILING-HUNG ORNAMENT':item.category==='Architecture'?'ARCHITECTURAL WALL FEATURE':mountFor(item.id)==='rug'?'FLAT FLOOR TEXTILE':item.category==='Lighting'?'DECORATIVE FLOOR LAMP':mountFor(item.id)==='floor'?'FLOOR SCULPTURE / PLANT':'FRAMED WALL ART';
   html+='<article class="decor-item"><div class="decor-art '+(mountFor(item.id)==='shelf'?'decor-trim':item.category==='Curios'?'decor-curio':mountFor(item.id)==='ceiling'?'decor-ceiling':item.category==='Architecture'?'decor-architecture':mountFor(item.id)==='rug'?'decor-textile':mountFor(item.id)==='floor'?'decor-standing':'')+
    '"><img src="'+catalog.thumbnail(item.id)+
    '" width="96" height="120" alt="'+item.name+' original pixel art"></div>'+
    '<div class="decor-copy"><span class="decor-kind">'+label+(newArrivals.has(item.id)?' · ✦ NEW':'')+'</span><h4>'+item.name+'</h4><p>'+item.description+'</p>'+
    '<strong class="decor-price">'+(isOwned?'PERMANENTLY OWNED':item.price+' PERFECT ROWS = '+(item.price*10)+' FIGURES RETURNED')+
    '</strong><small>'+(isOwned?(at===undefined?'STORED · READY TO PLACE':catalog.slots[at].name):
     availablePerfect<item.price?'NEED '+(item.price-availablePerfect)+' MORE PERFECT ROWS':!free?'SELECT AN OPEN '+(mountFor(item.id)==='shelf'?'SHELF FACE':mountFor(item.id)==='ceiling'?'CEILING HOOK':mountFor(item.id)==='rug'?'RUG SITE':mountFor(item.id)==='floor'?'FLOOR PAD':'WALL HOOK'):'AVAILABLE TO CLAIM')+
    '</small><div class="decor-actions">';
   if(isOwned){
    html+='<button type="button" data-move-art="'+item.id+'"'+(free?'':' disabled')+'>PLACE / MOVE</button>'+
     '<button type="button" data-store-art="'+item.id+'"'+(at===undefined?' disabled':'')+'>STORE</button>';
   }else{
    html+='<button type="button" data-buy-art="'+item.id+'"'+(availablePerfect>=item.price&&free?'':' disabled')+'>SACRIFICE & CLAIM</button>';
   }
   html+='</div>'+(isOwned?workshop.controls(item):'')+'</div></article>';
  }
  if(!filtered.length)html+='<p class="decor-none">NOTHING IN THIS CATEGORY YET · KEEP COLLECTING!</p>';
  html+=pager();
  html+='<div class="decor-future"><strong>'+catalog.items.length+' / 180 ORIGINAL DECORATIONS · MORE COMING</strong>';
  for(let i=0;i<catalog.quotas.length;i++){
   const [name,quota]=catalog.quotas[i];
   const count=i===0?counts.wall-counts.architecture:i===1?counts.statues:i===2?counts.plants:i===3?counts.lights:i===4?counts.rugs:i===5?counts.architecture:i===6?counts.ceilings:i===7?counts.trims:i===8?counts.curios:0;
   html+='<span>'+name+' · '+count+' / '+quota+'</span>';
  }
  html+='<p>Full freeform furnishing, more object types, and all 180 unique items are still in development.</p></div>';
  body.innerHTML=html;body.scrollTop=scroll;
  body.querySelector('#decorWallSlot').onchange=e=>{wallSlot=Number(e.target.value);render();};
  body.querySelector('#decorFloorSlot').onchange=e=>{floorSlot=Number(e.target.value);render();};
  body.querySelector('#decorRugSlot').onchange=e=>{rugSlot=Number(e.target.value);render();};
  body.querySelector('#decorCeilingSlot').onchange=e=>{ceilingSlot=Number(e.target.value);render();};
  body.querySelector('#decorShelfSlot').onchange=e=>{shelfSlot=Number(e.target.value);render();};
  body.querySelectorAll('[data-shelf-step]').forEach(el=>el.onclick=()=>{shelfSlot=44+(shelfSlot-44+60+Number(el.getAttribute('data-shelf-step')))%60;render();});
  body.querySelector('#decorLocateShelf').onclick=()=>api.locateShelf(shelfSlot-44);
  body.querySelectorAll('[data-next-open]').forEach(el=>el.onclick=()=>nextOpen(el.getAttribute('data-next-open')));
  body.querySelectorAll('[data-pad]').forEach(el=>el.onclick=()=>{floorSlot=Number(el.getAttribute('data-pad'));render();});
  body.querySelectorAll('[data-rug-pad]').forEach(el=>el.onclick=()=>{rugSlot=Number(el.getAttribute('data-rug-pad'));render();});
  body.querySelectorAll('[data-ceiling-hook]').forEach(el=>el.onclick=()=>{ceilingSlot=Number(el.getAttribute('data-ceiling-hook'));render();});
  body.querySelectorAll('[data-decor-filter]').forEach(el=>el.onclick=()=>{
   activeFilter=el.getAttribute('data-decor-filter');page=0;render();
  });
  body.querySelectorAll('[data-decor-sort]').forEach(el=>el.onclick=()=>{
   sortOrder=el.getAttribute('data-decor-sort');page=0;render();
  });
  body.querySelectorAll('[data-decor-page]').forEach(el=>el.onclick=()=>{
   page=Math.min(pageCount-1,Math.max(0,page+Number(el.getAttribute('data-decor-page'))));
   render();
   const anchor=api.body().querySelector('#decorCardStart');
   if(anchor&&typeof anchor.scrollIntoView==='function')
    anchor.scrollIntoView({block:'start',behavior:'auto'});
  });
  body.querySelectorAll('[data-buy-art]').forEach(el=>el.onclick=()=>buy(el.getAttribute('data-buy-art')));
  body.querySelectorAll('[data-move-art]').forEach(el=>el.onclick=()=>move(el.getAttribute('data-move-art')));
  body.querySelectorAll('[data-store-art]').forEach(el=>el.onclick=()=>store(el.getAttribute('data-store-art')));
  workshop.bind(body);
  room.bind(body);
 }

 // Each installed shelf finish is drawn on its actual 3D shelf front, after
 // the original boards and figurines, without modifying any shelf row logic.
 // This method uses bounded existing shelf geometry; it never creates a canvas.
 function drawShelfFinish(face,f,facing,front,depth,panel,beam){
  if(depth<.38||depth>19)return false;
  const target=44+face;
  let art=null,itemId=null;
  for(const [id,slot] of placed)if(slot===target){itemId=id;art=byId.get(id)?.art;break;}
  if(!art)return false;
  const palettes={
   astral:['#323b58','#f2c987','#a9c8d0'],
   ivy:['#70523e','#bdd89b','#5e9773'],
   tidal:['#27647b','#cbe8dc','#92bace'],
   arcade:['#733b53','#f4c47e','#bd8b9b']
  };
  const [base,originalGold,originalAccent]=palettes[art]||palettes.astral;
  const tone=workshop.tone(itemId);
  const gold=tone===1?'#e1e9ee':tone===2?'#e3b18e':originalGold;
  const accent=tone===1?'#9cb4c9':tone===2?'#ae7364':originalAccent;
  const d=front+facing*.11,w=f.w/2;
  for(let row=0;row<5;row++){
   const top=.46+row*.72;
   // The entire fascia is below the miniatures' supporting surface.
   panel(f,d,top-.105,top-.016,base);
   beam(f,-w,d+facing*.013,top-.015,w,d+facing*.013,top-.015,gold,depth<8?2:1);
   if(depth>15)continue;
   for(let n=0;n<5;n++){
    const x=-w+(n+.5)*f.w/5,y=top-.073;
    if(art==='astral'){
     beam(f,x-.075,d,y,x+.075,d,y,gold,1.5);
     beam(f,x,d,y-.023,x,d,y+.025,accent,1.5);
     beam(f,x+.12,d,y,x+.16,d,y+.02,gold,.8);
    }else if(art==='ivy'){
     beam(f,x-.19,d,y-.005,x+.17,d,y+.027,accent,1.2);
     beam(f,x-.10,d,y,x-.03,d,y+.03,gold,1.6);
     beam(f,x+.04,d,y-.01,x+.12,d,y-.04,accent,1.6);
    }else if(art==='tidal'){
     beam(f,x-.19,d,y-.01,x-.04,d,y+.024,accent,1.7);
     beam(f,x-.04,d,y+.024,x+.12,d,y-.01,accent,1.7);
     beam(f,x+.12,d,y-.01,x+.19,d,y+.013,accent,1.7);
     beam(f,x,d,y+.02,x,d,y+.032,gold,2.1);
    }else{
     beam(f,x-.19,d,y-.018,x-.07,d,y+.035,gold,1.5);
     beam(f,x-.07,d,y+.035,x+.05,d,y-.018,gold,1.5);
     beam(f,x+.05,d,y-.018,x+.17,d,y+.035,gold,1.5);
     beam(f,x,d,y+.018,x,d,y-.017,accent,1.5);
    }
   }
  }
  return true;
 }
 function visibleDecor(cameraDepth,cameraSide,visibleSlope){
  const result=[];
  for(const [itemId,slot] of placed){
   const wall=catalog.slots[slot];if(wall?.kind==='shelf')continue;
   const pos=workshop.pos(itemId,slot),d=cameraDepth(pos.x,pos.z),side=cameraSide(pos.x,pos.z);
   if(d>.3&&d<34&&Math.abs(side)<d*visibleSlope+2)
    result.push({type:'decor',depth:d,itemId,slot});
  }
  return result;
 }
 function draw(itemId,slot,project,ctx,yaw=0){
  const point=workshop.pos(itemId,slot),texture=catalog.texture(itemId);
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
   const angle=workshop.rotation(itemId)*Math.PI/2;
   const ux=Math.cos(angle),uz=Math.sin(angle),vx=-uz,vz=ux;
   ctx.save();ctx.imageSmoothingEnabled=false;
   for(let i=0;i<steps;i++){
    const v0=-halfDepth+2*halfDepth*i/steps;
    const v1=-halfDepth+2*halfDepth*(i+1)/steps;
    const a=project(point.x-ux*halfWidth+vx*v0,point.z-uz*halfWidth+vz*v0,height);
    const b=project(point.x+ux*halfWidth+vx*v0,point.z+uz*halfWidth+vz*v0,height);
    const d=project(point.x-ux*halfWidth+vx*v1,point.z-uz*halfWidth+vz*v1,height);
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
 return {load,clean,state,render,buy,move,store,nextOpen,perfectRows,visibleDecor,draw,drawShelfFinish,workshop,room,
  catalog,placedSlots:()=>[...placed],ownedIds:()=>[...owned]};
}
window.BIT_BAZAAR_PHASE4=Object.freeze({create});
})();
