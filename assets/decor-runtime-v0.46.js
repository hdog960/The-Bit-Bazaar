/* Bit Bazaar v0.46 — four-lane near-decoration clipping and reticle-matched exposure.
   Purchases sacrifice ONLY currently perfect rows. Never adds/removes figure IDs.
   Shared across standard and Low FX engines; nothing runs per frame except draw. */
(()=>{
'use strict';
const catalog=window.BIT_BAZAAR_DECOR;
const SHELF_PALETTES=Object.freeze({
   astral:['#323b58','#f2c987','#a9c8d0'],
   ivy:['#70523e','#bdd89b','#5e9773'],
   tidal:['#27647b','#cbe8dc','#92bace'],
   arcade:['#733b53','#f4c47e','#bd8b9b'],
   violet:['#613f70','#e3c1d9','#bb9fd8'],
   briar:['#4d5544','#e3c087','#8cbb89'],
   neon:['#2c3455','#f4a3d8','#72d6e4'],
   pearl:['#284b65','#e8d4af','#8dbbbd'],
   cedar:['#4d3940','#e1c18b','#92aa7f'],
   glassleaf:['#3c5268','#cfe2dd','#8dbec8'],
   frostwalnut:['#3a3e4e','#d8dfeb','#8b9faf'],
   opalwave:['#2d6477','#b9e3dc','#8dbbd0'],
   embervine:['#42374b','#eac39a','#d08178'],
   royalcheck:['#394e81','#efdbb3','#abb8dc'],
   silvertide:['#335a6b','#e5c5a0','#80b9bc']
  });
if(!catalog)throw Error('Decor artwork must load before its runtime');
function create(api){
 const owned=new Set(),placed=new Map(),byId=new Map(catalog.items.map(x=>[x.id,x]));
 let renderCache=null;
 let lastChosenFar=new Set();
 const displayStats={installed:0,examined:0,frustum:0,near:0,shown:0,
  skippedBudget:0,hiddenByFixtures:0,partiallyVisible:0,
  ghostShown:false,ghostBlocked:false,partialGhost:false};
 const renderStats=()=>({...displayStats});
 function invalidateRenderCache(){renderCache=null;lastChosenFar.clear();}
 function renderSnapshot(){
  if(renderCache)return renderCache;
  const world=[],shelf=Array(60).fill(null);
  for(const [itemId,slot] of placed){
   const site=catalog.slots[slot];if(!site)continue;
   if(site.kind==='shelf'){
    const face=slot-44;
    if(face>=0&&face<60)shelf[face]={itemId,art:byId.get(itemId)?.art};
    continue;
   }
   const pos=workshop.pos(itemId,slot);
   if(pos&&Number.isFinite(pos.x)&&Number.isFinite(pos.z))
    world.push({itemId,slot,x:pos.x,z:pos.z});
  }
  renderCache={world,shelf};
  return renderCache;
 }
 const mounts=Object.freeze(Object.fromEntries(['wall','floor','rug','ceiling','shelf']
  .map(kind=>[kind,catalog.slots.filter(s=>s.kind===kind)])));
 const PAGE_SIZE=12;let page=0;
 const newArrivals=new Set(catalog.items.slice(-20).map(item=>item.id));
 let spotlightId=null,scrollSpotlight=false;
 let ghost=null; // Only in RAM; never serialized with player progress.
 const itemOrder=new Map(catalog.items.map((item,i)=>[item.id,i]));
 let sortOrder='original';
 let searchQuery='',searchDraft=''; // View state only, never included in saveData().
 const matchesSearch=(item,q)=>!q||
  (item.name+' '+item.description+' '+item.category+' '+item.mount).toLowerCase().includes(q);
 const searchMatches=query=>{
  const q=String(query||'').trim().toLowerCase();
  return catalog.items.filter(item=>matchesSearch(item,q)).map(item=>item.id);
 };
 const workshop=window.BIT_BAZAAR_WORKSHOP.create({catalog,api,owned,placed,rerender:()=>{invalidateRenderCache();render()}});
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
 function canPreview(id,slot){
  return owned.has(id)&&placed.has(id)&&placed.get(id)!==slot&&
   compatible(id,slot)&&available(slot,id);
 }
 function previewMove(id,slot){
  if(!canPreview(id,slot))return false;
  ghost={id,slot};return true;
 }
 function previewOptions(){
  if(!ghost)return {index:0,total:0};
  const options=mounts[mountFor(ghost.id)].filter(s=>canPreview(ghost.id,s.id));
  return {index:options.findIndex(s=>s.id===ghost.slot)+1,total:options.length};
 }
 function cyclePreview(step){
  if(!ghost||![-1,1].includes(step))return false;
  const options=mounts[mountFor(ghost.id)].filter(s=>canPreview(ghost.id,s.id));
  if(options.length<2)return false;
  const current=options.findIndex(s=>s.id===ghost.slot);
  if(current<0)return false;
  ghost={id:ghost.id,slot:options[(current+step+options.length)%options.length].id};
  return true; // No purchase, movement or save when cycling.
 }
 const previewState=()=>ghost?{
  id:ghost.id,slot:ghost.slot,from:placed.get(ghost.id),
  name:byId.get(ghost.id)?.name||'OWNED ARTWORK',
  destination:catalog.slots[ghost.slot]?.name||'DISPLAY',
  kind:mountFor(ghost.id),x:catalog.slots[ghost.slot]?.x,z:catalog.slots[ghost.slot]?.z
 }:null;
 function cancelPreview(){const had=!!ghost;ghost=null;return had;}
 function commitPreview(){
  if(!ghost||!canPreview(ghost.id,ghost.slot))return false;
  return move(ghost.id,ghost.slot);
 }
 function focusOwned(id){
  if(!owned.has(id)||!placed.has(id))return false;
  const list=catalog.items.filter(item=>owned.has(item.id));
  const target=list.findIndex(item=>item.id===id);
  if(target<0)return false;
  activeFilter='owned';sortOrder='original';page=Math.floor(target/PAGE_SIZE);
  spotlightId=id;scrollSpotlight=true;
  return true; // Open the drawer separately. Never mutates inventory or saves.
 }
 function selectSite(kind,id){
  if(!mounts[kind]||!validSlot(id)||catalog.slots[id].kind!==kind)return false;
  // Only sets catalog selection; never changes the save or buys art.
  if(kind==='wall')wallSlot=id;
  else if(kind==='floor')floorSlot=id;
  else if(kind==='rug')rugSlot=id;
  else if(kind==='ceiling')ceilingSlot=id;
  else shelfSlot=id;
  if(kind==='rug')activeFilter='rugs';
  else if(kind==='ceiling')activeFilter='ceilings';
  else if(kind==='shelf')activeFilter='trims';
  else if(kind==='wall')activeFilter='wall';
  else activeFilter='all';
  page=0;
  return true;
 }
 const state=()=>({owned:[...owned],placed:[...placed],adjustments:workshop.snapshot(),room:room.state()});
 const load=raw=>{
  invalidateRenderCache();
  owned.clear();placed.clear();ghost=null;spotlightId=null;scrollSpotlight=false;workshop.resetAll();wallSlot=0;floorSlot=16;rugSlot=28;ceilingSlot=36;shelfSlot=44;activeFilter='all';sortOrder='original';searchQuery='';searchDraft='';page=0;
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
 const clean=()=>{invalidateRenderCache();owned.clear();placed.clear();ghost=null;spotlightId=null;scrollSpotlight=false;workshop.resetAll();room.reset();wallSlot=0;floorSlot=16;rugSlot=28;ceilingSlot=36;shelfSlot=44;activeFilter='all';sortOrder='original';searchQuery='';searchDraft='';page=0};
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
     if(!Number.isFinite(x)||!Number.isFinite(z)||
        api.blocked(x,z,.32)||api.crowded(x,z)||
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
   owned.add(id);placed.set(id,slot);invalidateRenderCache();
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
  if(placed.get(id)===slot){api.notify('ALREADY DISPLAYED HERE');return false;}
  // A free move can destroy hand-tuned offsets. Protect the entire current
  // decor state and roll back memory when the browser refuses to save.
  const previous=state(),from=placed.get(id);
  workshop.onMove(id,from,slot);
  placed.set(id,slot);
  let written=false;
  try{written=api.save()!==false;}catch(_){}
  if(!written){
   // Restore the original Map insertion order as well as the exact mount.
   placed.clear();for(const [oldId,oldSlot] of previous.placed)placed.set(oldId,oldSlot);
   workshop.load({decor:previous});
   invalidateRenderCache();render();
   api.notify('ART MOVE CANCELLED · SAVE STORAGE FAILED',true);return false;
  }
  invalidateRenderCache();if(ghost?.id===id)ghost=null;
  render();api.notify('ART MOVED · NO SACRIFICE NEEDED');return true;
 }
 function store(id){
  if(!owned.has(id)||!placed.has(id))return false;
  // Storing a piece also clears its original fine-position adjustments.
  // Treat an unavailable save as a rejected transaction, not success.
  const previous=state(),from=placed.get(id);
  placed.delete(id);workshop.onStore(id);
  let written=false;
  try{written=api.save()!==false;}catch(_){}
  if(!written){
   // Restore the original Map insertion order as well as the exact mount.
   placed.clear();for(const [oldId,oldSlot] of previous.placed)placed.set(oldId,oldSlot);
   workshop.load({decor:previous});
   invalidateRenderCache();render();
   api.notify('ART STORAGE CANCELLED · SAVE STORAGE FAILED',true);return false;
  }
  invalidateRenderCache();if(ghost?.id===id)ghost=null;
  render();api.notify('ART STORED · STILL PERMANENTLY OWNED');return true;
 }
 function findOpenFor(id){
  const kind=mountFor(id);
  if(!byId.has(id)||!mounts[kind])return false;
  const open=mounts[kind].find(s=>available(s.id,id)&&s.id!==placed.get(id));
  if(!open){api.notify('NO FREE '+kind.toUpperCase()+' SITES',true);return false;}
  // Catalog-only selection: not saved and does not alter installed artwork.
  selectSite(kind,open.id);
  // Keep the exact requested item in view even if it was on page 7.
  if(newArrivals.has(id)){
   activeFilter='new';
   page=Math.floor(catalog.items.slice(-20).findIndex(item=>item.id===id)/PAGE_SIZE);
  }else{
   activeFilter='all';
   page=Math.floor(itemOrder.get(id)/PAGE_SIZE);
  }
  spotlightId=id;scrollSpotlight=true;render();return true;
 }
 function affordables(perfect){
  return catalog.items.filter(item=>!owned.has(item.id)&&item.price<=perfect&&
   mounts[mountFor(item.id)]?.some(site=>available(site.id))).length;
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
  const filters=[['all','ALL '+catalog.items.length],['new','✦ NEW 20'],
    ['unowned','◇ UNOWNED '+(catalog.items.length-owned.size)],
    ['affordable','✦ CAN CLAIM '+affordables(availablePerfect)],['wall','WALL ART '+counts.wall],['statues','STATUES '+counts.statues],['plants','PLANTS '+counts.plants],['lights','LIGHTS '+counts.lights],['rugs','RUGS '+counts.rugs],['architecture','ARCHITECTURE '+counts.architecture],['ceilings','CEILINGS '+counts.ceilings],['trims','SHELF TRIMS '+counts.trims],['curios','CURIOS '+counts.curios],['owned','★ OWNED '+owned.size]];
  const safeDraft=searchDraft.replace(/&/g,'&amp;').replace(/"/g,'&quot;')
   .replace(/</g,'&lt;').replace(/>/g,'&gt;');
  let html='<div class="decor-intro"><span>PHASE 4 · THE ARTISAN GALLERY</span>'+
   '<h3>THE SACRIFICE CATALOG</h3>'+
   '<p>Exchange properly sorted shelves for permanent art, not currency. Only currently PERFECT rows pay for purchases. Every sacrificed figure returns to a real floor position. Your historic achievements remain intact.</p>'+
   '<strong>'+availablePerfect+' PERFECT ROWS · '+owned.size+' / '+catalog.items.length+' DECORATIONS OWNED</strong>'+
   '<div class="decor-completion-meter" role="progressbar" aria-label="Permanently owned original decorations" aria-valuemin="0" aria-valuemax="180" aria-valuenow="'+owned.size+'">'+
   '<div class="decor-completion-fill" style="width:'+(100*owned.size/180).toFixed(2)+'%"></div></div>'+
   (owned.size===180?'<p class="decor-all-collected">★ ALL 180 ORIGINAL ARTWORKS PERMANENTLY COLLECTED</p>':'')+
   '<div class="decor-space-summary">'+
   ['wall','floor','rug','ceiling','shelf'].map(kind=>
    '<span>'+kind.toUpperCase()+' '+mounts[kind].filter(site=>available(site.id)).length+
    ' / '+mounts[kind].length+' OPEN</span>').join('')+
   '</div></div>'+
   '<button type="button" class="decor-open-map" data-decor-map-open="1">⌖ VISUAL DECORATION MAP · CHOOSE A LOCATION</button>'+
   '<div class="decor-search-area" role="search"><label for="decorSearch">FIND ART BY NAME OR STORY</label>'+
   '<div class="decor-search-controls"><input id="decorSearch" type="search" maxlength="80" autocomplete="off" spellcheck="false" placeholder="Try fox, lamp, clock..." value="'+safeDraft+'" aria-label="Search all decorations">'+
   '<button type="button" data-decor-search-apply="1">⌕ FIND</button>'+
   '<button type="button" data-decor-search-clear="1"'+(!searchQuery?' disabled':'')+'>✕ CLEAR</button></div>'+
   (searchQuery?'<small>SEARCH ACTIVE · CATEGORY FILTERS STILL APPLY</small>':'')+
   '</div>'+
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
    activeFilter==='unowned'&&!owned.has(item.id)||
    activeFilter==='affordable'&&!owned.has(item.id)&&item.price<=availablePerfect&&
     mounts[mountFor(item.id)]?.some(site=>available(site.id))||
   activeFilter==='wall'&&(item.mount||'wall')==='wall'||
   activeFilter==='statues'&&item.category==='Statues'||
   activeFilter==='plants'&&item.category==='Plants'||
   activeFilter==='lights'&&item.category==='Lighting'||
   activeFilter==='rugs'&&item.category==='Rugs'||
   activeFilter==='architecture'&&item.category==='Architecture'||
   activeFilter==='ceilings'&&item.category==='Ceilings'||
   activeFilter==='trims'&&item.category==='Shelf Trims'||
   activeFilter==='curios'&&item.category==='Curios')
    .filter(item=>matchesSearch(item,searchQuery));
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
   (activeFilter==='new'?' · JUST ARRIVED':'')+(searchQuery?' · SEARCH RESULTS':'')+'</div>'+pager();
  for(const item of currentItems){
   const isOwned=owned.has(item.id),at=placed.get(item.id),wanted=desired(item.id),
    free=compatible(item.id,wanted)&&available(wanted,item.id)&&at!==wanted,
     alternate=!free&&mounts[mountFor(item.id)].some(site=>available(site.id,item.id)&&site.id!==at);
   const label=mountFor(item.id)==='shelf'?'PATTERNED SHELF FASCIA · FIVE TIERS':item.category==='Curios'?'COLLECTOR FLOOR CURIO':mountFor(item.id)==='ceiling'?'CEILING-HUNG ORNAMENT':item.category==='Architecture'?'ARCHITECTURAL WALL FEATURE':mountFor(item.id)==='rug'?'FLAT FLOOR TEXTILE':item.category==='Lighting'?'DECORATIVE FLOOR LAMP':mountFor(item.id)==='floor'?'FLOOR SCULPTURE / PLANT':'FRAMED WALL ART';
   html+='<article class="decor-item'+(spotlightId===item.id?' decor-spotlight':'')+
    '"'+(spotlightId===item.id?' id="decorSpotlightCard"':'')+'><div class="decor-art '+(mountFor(item.id)==='shelf'?'decor-trim':item.category==='Curios'?'decor-curio':mountFor(item.id)==='ceiling'?'decor-ceiling':item.category==='Architecture'?'decor-architecture':mountFor(item.id)==='rug'?'decor-textile':mountFor(item.id)==='floor'?'decor-standing':'')+
    '"><img src="'+catalog.thumbnail(item.id)+
    '" width="96" height="120" alt="'+item.name+' original pixel art"></div>'+
    '<div class="decor-copy"><span class="decor-kind">'+label+(newArrivals.has(item.id)?' · ✦ NEW':'')+'</span><h4>'+item.name+'</h4><p>'+item.description+'</p>'+
    '<strong class="decor-price">'+(isOwned?'PERMANENTLY OWNED':item.price+' PERFECT ROWS = '+(item.price*10)+' FIGURES RETURNED')+
    '</strong><small>'+(isOwned?(at===undefined?'STORED · READY TO PLACE':catalog.slots[at].name):
     availablePerfect<item.price?'NEED '+(item.price-availablePerfect)+' MORE PERFECT ROWS':!free?'SELECT AN OPEN '+(mountFor(item.id)==='shelf'?'SHELF FACE':mountFor(item.id)==='ceiling'?'CEILING HOOK':mountFor(item.id)==='rug'?'RUG SITE':mountFor(item.id)==='floor'?'FLOOR PAD':'WALL HOOK'):'AVAILABLE TO CLAIM')+
    '</small><div class="decor-actions">';
   if(isOwned){
    html+='<button type="button" data-move-art="'+item.id+'"'+(free?'':' disabled')+'>PLACE / MOVE</button>'+
     (alternate?'<button type="button" data-find-art="'+item.id+'">⌖ FIND OPEN SITE</button>':'')+
     '<button type="button" data-plan-art="'+item.id+'"'+(at===undefined?' disabled':'')+'>⌖ MAP MOVE</button>'+ 
      '<button type="button" data-store-art="'+item.id+'"'+(at===undefined?' disabled':'')+'>STORE</button>';
   }else{
    html+='<button type="button" data-buy-art="'+item.id+'"'+(availablePerfect>=item.price&&free?'':' disabled')+'>SACRIFICE & CLAIM</button>'+
     (alternate&&availablePerfect>=item.price?'<button type="button" data-find-art="'+item.id+'">⌖ FIND OPEN SITE</button>':'');
   }
   html+='</div>'+(isOwned?workshop.controls(item):'')+'</div></article>';
  }
  if(!filtered.length)html+='<p class="decor-none">'+
   (searchQuery?'NO MATCHING ART · TRY ANOTHER TERM OR CLEAR SEARCH':'NOTHING IN THIS CATEGORY YET · KEEP COLLECTING!')+'</p>';
  html+=pager();
  html+='<div class="decor-future"><strong>ALL 180 ORIGINAL DECORATIONS · NINE CATEGORIES COMPLETE</strong>';
  for(let i=0;i<catalog.quotas.length;i++){
   const [name,quota]=catalog.quotas[i];
   const count=i===0?counts.wall-counts.architecture:i===1?counts.statues:i===2?counts.plants:i===3?counts.lights:i===4?counts.rugs:i===5?counts.architecture:i===6?counts.ceilings:i===7?counts.trims:i===8?counts.curios:0;
   html+='<span>'+name+' · '+count+' / '+quota+'</span>';
  }
  html+='<p>The original artwork library is complete. Arrange, recolor, store or relocate permanently owned decorations freely. More flexible placement and final polish remain in development.</p></div>';
  body.innerHTML=html;body.scrollTop=scroll;
  if(scrollSpotlight){
   scrollSpotlight=false;
   const target=body.querySelector('#decorSpotlightCard');
   if(target&&typeof target.scrollIntoView==='function'){
    target.scrollIntoView({block:'center',behavior:'auto'});
    if(typeof target.focus==='function')target.focus({preventScroll:true});
   }
  }
  body.querySelector('#decorWallSlot').onchange=e=>{wallSlot=Number(e.target.value);render();};
  body.querySelector('#decorFloorSlot').onchange=e=>{floorSlot=Number(e.target.value);render();};
  body.querySelector('#decorRugSlot').onchange=e=>{rugSlot=Number(e.target.value);render();};
  body.querySelector('#decorCeilingSlot').onchange=e=>{ceilingSlot=Number(e.target.value);render();};
  body.querySelector('#decorShelfSlot').onchange=e=>{shelfSlot=Number(e.target.value);render();};
  body.querySelectorAll('[data-shelf-step]').forEach(el=>el.onclick=()=>{shelfSlot=44+(shelfSlot-44+60+Number(el.getAttribute('data-shelf-step')))%60;render();});
  body.querySelector('#decorLocateShelf').onclick=()=>api.locateShelf(shelfSlot-44);
  const mapOpen=body.querySelector('[data-decor-map-open]');
  if(mapOpen)mapOpen.onclick=()=>{
   const kind=({rugs:'rug',ceilings:'ceiling',trims:'shelf',wall:'wall'})[activeFilter]||'floor';
   api.openDecorMap(kind);
  };
  body.querySelectorAll('[data-next-open]').forEach(el=>el.onclick=()=>nextOpen(el.getAttribute('data-next-open')));
  body.querySelectorAll('[data-pad]').forEach(el=>el.onclick=()=>{floorSlot=Number(el.getAttribute('data-pad'));render();});
  body.querySelectorAll('[data-rug-pad]').forEach(el=>el.onclick=()=>{rugSlot=Number(el.getAttribute('data-rug-pad'));render();});
  body.querySelectorAll('[data-ceiling-hook]').forEach(el=>el.onclick=()=>{ceilingSlot=Number(el.getAttribute('data-ceiling-hook'));render();});
  const searchInput=body.querySelector('#decorSearch');
  const applySearch=()=>{
   searchDraft=searchInput.value.slice(0,80);
   searchQuery=searchDraft.trim().toLowerCase();page=0;render();
  };
  searchInput.oninput=()=>{searchDraft=searchInput.value.slice(0,80);};
  searchInput.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();applySearch();}};
  body.querySelector('[data-decor-search-apply]').onclick=()=>applySearch();
  body.querySelector('[data-decor-search-clear]').onclick=()=>{
   searchQuery='';searchDraft='';page=0;render();
  };
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
  body.querySelectorAll('[data-find-art]').forEach(el=>el.onclick=()=>findOpenFor(el.getAttribute('data-find-art')));
  body.querySelectorAll('[data-plan-art]').forEach(el=>el.onclick=()=>{
   const id=el.getAttribute('data-plan-art');
   if(owned.has(id)&&placed.has(id))api.openDecorMove(id);
  });
  workshop.bind(body);
  room.bind(body);
 }

 // Each installed shelf finish is drawn on its actual 3D shelf front, after
 // the original boards and figurines, without modifying any shelf row logic.
 // This method uses bounded existing shelf geometry; it never creates a canvas.
 function drawGhost(itemId,slot,project,ctx,yaw=0,bands=null){
  if(!ghost||ghost.id!==itemId||ghost.slot!==slot)return;
  ctx.save();ctx.globalAlpha*=.58;
  draw(itemId,slot,project,ctx,yaw,true,bands);
  ctx.restore();
 }
 function drawShelfFinish(face,f,facing,front,depth,panel,beam){
  if(depth<.38||depth>19)return false;
  const target=44+face;
  const original=renderSnapshot().shelf[face];
  let art=original?.art||null,itemId=original?.itemId||null;
  if(ghost&&ghost.slot===target){
   itemId=ghost.id;art=byId.get(itemId)?.art||art;
  }
  if(!art)return false;
  const [base,originalGold,originalAccent]=SHELF_PALETTES[art]||SHELF_PALETTES.astral;
  const tone=ghost?.slot===target?0:workshop.tone(itemId); // simulate reset of workshop finish
  const gold=tone===1?'#e1e9ee':tone===2?'#e3b18e':originalGold;
  const accent=tone===1?'#9cb4c9':tone===2?'#ae7364':originalAccent;
  const d=front+facing*.11,w=f.w/2;
  for(let row=0;row<5;row++){
   const top=.46+row*.72;
   // The entire fascia is below the miniatures' supporting surface.
   panel(f,d,top-.105,top-.016,base);
   beam(f,-w,d+facing*.013,top-.015,w,d+facing*.013,top-.015,gold,depth<8?2:1);
   if(depth>15)continue;
   // Preserve fine inlays at close range; reduce distant subpixel beams.
   for(let n=0;n<5;n+=depth>10?2:1){
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
    }else if(art==='violet'){
     // Overlapping scrolls, silver floral leaves and violet jewel.
     beam(f,x-.18,d,y-.018,x-.09,d,y+.025,gold,1.4);
     beam(f,x-.09,d,y+.025,x+.01,d,y-.02,gold,1.4);
     beam(f,x+.01,d,y-.02,x+.11,d,y+.021,gold,1.4);
     beam(f,x+.11,d,y+.021,x+.19,d,y-.013,gold,1.4);
     beam(f,x-.045,d,y-.04,x+.038,d,y+.04,accent,2);
     beam(f,x-.07,d,y-.02,x+.07,d,y-.02,accent,1.4);
    }else if(art==='briar'){
     // Botanical lattice with pointed leaf stems at alternating joins.
     beam(f,x-.19,d,y+.021,x+.17,d,y-.017,gold,1.4);
     beam(f,x-.13,d,y+.005,x-.07,d,y+.045,accent,1.7);
     beam(f,x+.02,d,y-.01,x+.06,d,y+.042,accent,1.7);
     beam(f,x+.1,d,y-.008,x+.18,d,y-.037,accent,1.4);
    }else if(art==='neon'){
     // Staggered arcade herringbone lit from behind.
     beam(f,x-.17,d,y-.03,x-.07,d,y+.025,accent,2);
     beam(f,x-.07,d,y+.025,x+.02,d,y-.03,gold,2);
     beam(f,x+.02,d,y-.03,x+.11,d,y+.025,accent,2);
     beam(f,x+.11,d,y+.025,x+.18,d,y-.03,gold,2);
     beam(f,x,d,y-.031,x,d,y+.031,accent,1);
    }else if(art==='pearl'){
     // Deepwater scallops and paired pearl inset.
     beam(f,x-.18,d,y-.012,x-.08,d,y+.032,accent,1.6);
     beam(f,x-.08,d,y+.032,x+.01,d,y-.012,accent,1.6);
     beam(f,x+.01,d,y-.012,x+.1,d,y+.032,gold,1.6);
     beam(f,x+.1,d,y+.032,x+.19,d,y-.012,gold,1.6);
     beam(f,x-.012,d,y+.008,x+.012,d,y+.008,gold,3);
    }else if(art==='cedar'){
     // Carved cedar branch; copper seed bracts in warm amber resin.
     beam(f,x-.19,d,y+.016,x+.16,d,y-.017,gold,1.35);
     beam(f,x-.11,d,y+.011,x-.07,d,y-.04,accent,1.5);
     beam(f,x+.02,d,y-.008,x+.085,d,y+.044,accent,1.5);
     beam(f,x+.135,d,y-.016,x+.18,d,y-.044,gold,1.4);
     beam(f,x-.014,d,y+.026,x+.014,d,y+.026,gold,2.2);
    }else if(art==='glassleaf'){
     // Mint glass leaves branch from a frosted silver rail.
     beam(f,x-.19,d,y-.015,x+.19,d,y+.015,gold,1.25);
     beam(f,x-.125,d,y-.026,x-.068,d,y+.03,accent,2.1);
     beam(f,x-.068,d,y+.03,x-.009,d,y-.023,gold,1.7);
     beam(f,x+.018,d,y-.021,x+.076,d,y+.037,accent,2.1);
     beam(f,x+.076,d,y+.037,x+.143,d,y-.024,gold,1.7);
     beam(f,x-.004,d,y+.008,x+.004,d,y+.036,accent,1.5);
    }else if(art==='frostwalnut'){
     // Silver fern with ice-veined buds and raised moonstone joints.
     beam(f,x-.18,d,y-.014,x+.18,d,y+.012,gold,1.25);
     beam(f,x-.14,d,y-.014,x-.09,d,y+.032,accent,2.0);
     beam(f,x-.06,d,y-.008,x-.015,d,y-.04,gold,1.5);
     beam(f,x+.018,d,y+.007,x+.069,d,y+.041,accent,1.9);
     beam(f,x+.096,d,y+.009,x+.149,d,y-.038,gold,1.65);
     beam(f,x-.018,d,y+.028,x+.018,d,y+.028,accent,2.1);
    }else if(art==='opalwave'){
     // Twin opposing curls, opalescent crests and an inset coral gem.
     beam(f,x-.19,d,y-.012,x-.11,d,y+.026,accent,1.8);
     beam(f,x-.11,d,y+.026,x-.02,d,y-.021,gold,1.8);
     beam(f,x-.02,d,y-.021,x+.07,d,y+.025,accent,1.8);
     beam(f,x+.07,d,y+.025,x+.18,d,y-.011,gold,1.8);
     beam(f,x-.016,d,y+.008,x+.016,d,y+.008,gold,3);
    }else if(art==='embervine'){
     // Copper bramble, pointed leaves and intermittent red-glass berries.
     beam(f,x-.19,d,y+.02,x+.16,d,y-.021,gold,1.5);
     beam(f,x-.11,d,y+.01,x-.08,d,y-.039,accent,1.8);
     beam(f,x+.02,d,y-.001,x+.09,d,y+.046,accent,1.9);
     beam(f,x+.14,d,y-.012,x+.18,d,y-.044,gold,1.5);
     beam(f,x-.016,d,y+.028,x+.016,d,y+.028,accent,2.2);
    }else if(art==='royalcheck'){
     // Blue enamel diamonds, ivory rosettes and gilded corner edges.
     beam(f,x-.19,d,y-.03,x-.08,d,y+.03,gold,1.55);
     beam(f,x-.08,d,y+.03,x+.025,d,y-.03,accent,1.55);
     beam(f,x+.025,d,y-.03,x+.14,d,y+.03,gold,1.55);
     beam(f,x+.14,d,y+.03,x+.19,d,y-.015,accent,1.55);
     beam(f,x-.017,d,y+.012,x+.017,d,y+.012,gold,2.25);
     beam(f,x,d,y-.016,x,d,y+.037,accent,1.5);
    }else if(art==='silvertide'){
     // Hammered metal seashell loops and turquoise cabochons.
     beam(f,x-.19,d,y+.018,x-.105,d,y-.028,gold,1.65);
     beam(f,x-.105,d,y-.028,x-.02,d,y+.018,accent,1.65);
     beam(f,x-.02,d,y+.018,x+.07,d,y-.028,gold,1.65);
     beam(f,x+.07,d,y-.028,x+.18,d,y+.018,accent,1.65);
     beam(f,x-.016,d,y+.01,x+.016,d,y+.01,accent,2.5);
     beam(f,x+.11,d,y+.012,x+.145,d,y+.012,gold,1.25);
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
 function visibleDecor(cameraDepth,cameraSide,visibleSlope,maxVisible=36,isHidden=null,bandVisibility=null,yaw=0){
  // Current world sites are indexed until ownership or precision changes.
  // Every nearby piece stays drawn, even when the gallery is full.
  const world=renderSnapshot().world,near=[],far=[];
  const limit=Math.max(8,Math.min(48,Math.floor(Number(maxVisible)||36)));
  displayStats.installed=placed.size;
  displayStats.examined=world.length;
  displayStats.frustum=0;displayStats.near=0;
  displayStats.shown=0;displayStats.skippedBudget=0;displayStats.hiddenByFixtures=0;
  displayStats.partiallyVisible=0;
  displayStats.ghostShown=false;displayStats.ghostBlocked=false;
  displayStats.partialGhost=false;
  for(const piece of world){
   const d=cameraDepth(piece.x,piece.z);
   if(d<=.3||d>=34)continue;
   // Skip costly side projection when well outside useful draw distance.
   const side=cameraSide(piece.x,piece.z);
   if(Math.abs(side)>=d*visibleSlope+2)continue;
   displayStats.frustum++;
   // A decoration entirely behind an opaque shelf must not show through
   // the shelf's solid front/back. Core figure and cleaning focus are
   // resolved first in the game and take priority over this art layer.
   // Sample four separate artwork columns only within 16 world units.
   // Distant artwork retains the cheap v0.40 center-ray test.
   const bands=bandVisibility&&d<=16?
    bandVisibility(piece.itemId,piece.slot,piece,yaw,workshop.rotation(piece.itemId)):null;
   if(bands){
    if(!bands.some(Boolean)){displayStats.hiddenByFixtures++;continue;}
   }else if(isHidden&&isHidden(piece.itemId,piece.slot,piece)){
    displayStats.hiddenByFixtures++;continue;
   }
   const partial=bands&&bands.some(exposed=>!exposed);
   if(partial)displayStats.partiallyVisible++;
   const candidate={type:'decor',depth:d,itemId:piece.itemId,slot:piece.slot,
    bands:partial?bands:null};
   if(d<=12)near.push(candidate);
   else far.push(candidate);
  }
  // Two-unit hysteresis bias resists distracting frame-to-frame pop when
  // panning around a densely filled collection. Painter depth is unchanged.
  far.sort((a,b)=>(a.depth-(lastChosenFar.has(a.itemId)?2:0))-
                     (b.depth-(lastChosenFar.has(b.itemId)?2:0))||
                     a.slot-b.slot);
  const accepted=far.slice(0,Math.max(0,limit-near.length));
  lastChosenFar=new Set(accepted.map(x=>x.itemId));
  const result=near.concat(accepted);
  displayStats.near=near.length;
  displayStats.skippedBudget=Math.max(0,far.length-accepted.length);
  displayStats.shown=result.length;
  // A relocation ghost must never disappear due to the distant-art limit.
  if(ghost&&catalog.slots[ghost.slot]?.kind!=='shelf'){
   const site=catalog.slots[ghost.slot],d=cameraDepth(site.x,site.z);
   if(d>.3&&d<34&&Math.abs(cameraSide(site.x,site.z))<d*visibleSlope+2){
    // The confirmation HUD remains usable even if another rack blocks
    // the physical destination from this camera location.
    const bands=bandVisibility&&d<=16?
     bandVisibility(ghost.id,ghost.slot,site,yaw,0):null;
    if(bands?!bands.some(Boolean):(isHidden&&isHidden(ghost.id,ghost.slot,site)))
     displayStats.ghostBlocked=true;
    else{
     const partial=bands&&bands.some(exposed=>!exposed);
     result.push({type:'decor-ghost',depth:d,itemId:ghost.id,slot:ghost.slot,
      bands:partial?bands:null});
     displayStats.ghostShown=true;
     displayStats.partialGhost=!!partial;
    }
   }
  }
  return result;
 }
 function draw(itemId,slot,project,ctx,yaw=0,isGhost=false,bands=null){
  // Actual moves reset prior fine offsets and rug orientation.
  const point=isGhost?catalog.slots[slot]:workshop.pos(itemId,slot),
   texture=catalog.texture(itemId);
  if(!point||!texture)return;
  // Render only exposed horizontal strips from the original native artwork.
  // Fully visible decorations stay a single drawImage operation.
  function paintVisibleBands(){
   if(!bands||bands.every(Boolean)){ctx.drawImage(texture,0,0);return;}
   for(let lane=0;lane<bands.length;lane++){
    if(!bands[lane])continue;
    const x=texture.width*lane/bands.length,w=texture.width/bands.length;
    ctx.drawImage(texture,x,0,w,texture.height,x,0,w,texture.height);
   }
  }
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
   ctx.imageSmoothingEnabled=false;paintVisibleBands();ctx.restore();
   return;
  }
  if(point.kind==='rug'){
   // A carpet lies on the real shop floor. Eight affine depth slices approximate
   // perspective mapping with no new canvases, geometry or collision objects.
   const halfWidth=2.2,halfDepth=1.48,height=.034;
   // Exact texture, fewer affine perspective slices at greater distances.
   const atDepth=project(point.x,point.z,height).depth;
   const steps=atDepth>25?2:atDepth>14?4:8;
   const angle=(isGhost?0:workshop.rotation(itemId))*Math.PI/2;
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
    if(!bands||bands.every(Boolean))
    ctx.drawImage(texture,0,srcY,texture.width,srcH,0,0,texture.width,srcH);
   else for(let lane=0;lane<bands.length;lane++){
    if(!bands[lane])continue;
    const sx=texture.width*lane/bands.length,sw=texture.width/bands.length;
    ctx.drawImage(texture,sx,srcY,sw,srcH,sx,0,sw,srcH);
   }
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
   const vertical=point.side==='WEST'||point.side==='EAST',
    architecture=byId.get(itemId)?.category==='Architecture',
    endcap=point.profile==='endcap',
    // Two-sided floor-rack end panels are only 1.72 world units deep.
    // A narrower framed 1.36-unit portrait fits entirely on the real
    // side quad without hiding the collectible bays on front or reverse.
    radius=endcap?.68:architecture?1.42:.99,
    top=endcap?3.54:architecture?4.2:3.67,
    bottom=endcap?1.30:architecture?.65:1.16;
   a=vertical?project(point.x,point.z-radius,top):project(point.x-radius,point.z,top);
   b=vertical?project(point.x,point.z+radius,top):project(point.x+radius,point.z,top);
   d=vertical?project(point.x,point.z-radius,bottom):project(point.x-radius,point.z,bottom);
  }
  if(Math.min(a.depth,b.depth,d.depth)<.24||Math.max(a.depth,b.depth,d.depth)>34)return;
  ctx.save();
  ctx.transform((b.x-a.x)/texture.width,(b.y-a.y)/texture.width,
    (d.x-a.x)/texture.height,(d.y-a.y)/texture.height,a.x,a.y);
  ctx.imageSmoothingEnabled=false;paintVisibleBands();ctx.restore();
 }
 return {load,clean,state,render,buy,move,store,nextOpen,selectSite,findOpenFor,affordables,searchMatches,focusOwned,perfectRows,visibleDecor,renderStats,draw,drawGhost,drawShelfFinish,previewMove,previewState,previewOptions,cyclePreview,cancelPreview,commitPreview,workshop,room,
  catalog,placedSlots:()=>[...placed],ownedIds:()=>[...owned]};
}
window.BIT_BAZAAR_PHASE4=Object.freeze({create});
})();
