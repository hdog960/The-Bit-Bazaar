/* Bit Bazaar v0.18 — Phase 4 first gallery: three permanent framed decorations.
   Purchases sacrifice ONLY currently perfect rows. Never adds/removes figure IDs.
   Shared across standard and Low FX engines; nothing runs per frame except draw. */
(()=>{
'use strict';
const catalog=window.BIT_BAZAAR_DECOR;
if(!catalog)throw Error('Decor artwork must load before its runtime');
function create(api){
 const owned=new Set(),placed=new Map(),byId=new Map(catalog.items.map(x=>[x.id,x]));
 let chosenSlot=0;
 const validSlot=slot=>Number.isInteger(slot)&&slot>=0&&slot<catalog.slots.length;
 const available=(slot,except=null)=>validSlot(slot)&&![...placed].some(([id,s])=>s===slot&&id!==except);
 const state=()=>({owned:[...owned],placed:[...placed]});
 const load=raw=>{
  owned.clear();placed.clear();chosenSlot=0;
  const value=raw&&raw.decor;
  if(!value||typeof value!=='object')return;
  for(const id of Array.isArray(value.owned)?value.owned:[])
   if(byId.has(id))owned.add(id);
  const used=new Set();
  for(const p of Array.isArray(value.placed)?value.placed:[]){
   if(!Array.isArray(p)||p.length!==2)continue;
   const [id,slot]=p;
   if(!owned.has(id)||placed.has(id)||!validSlot(slot)||used.has(slot))continue;
   placed.set(id,slot);used.add(slot);
  }
 };
 const clean=()=>{owned.clear();placed.clear();chosenSlot=0};
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
 function buy(id,slot=chosenSlot,skipConfirmation=false){
  const item=byId.get(id);
  if(!item||owned.has(id)||!available(slot))return false;
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
 function move(id,slot=chosenSlot){
  if(!owned.has(id)||!available(slot,id))return false;
  placed.set(id,slot);api.save();render();api.notify('ART MOVED · NO SACRIFICE NEEDED');return true;
 }
 function store(id){
  if(!owned.has(id)||!placed.has(id))return false;
  placed.delete(id);api.save();render();api.notify('ART STORED · STILL PERMANENTLY OWNED');return true;
 }
 function render(){
  if(!api.isOpen())return;
  const body=api.body(),scroll=body.scrollTop,availablePerfect=api.perfectCount();
  let html='<div class="decor-intro"><span>PHASE 4 · FIRST GALLERY OPENING</span>'+
   '<h3>THE SACRIFICE CATALOG</h3>'+
   '<p>Exchange properly sorted shelves for permanent art, not currency. Only PERFECT rows can be selected; their figurines are redistributed into safe floor spaces. Your historic achievements and all 3,000 figure identities remain yours.</p>'+
   '<strong>'+availablePerfect+' PERFECT ROWS · '+owned.size+' / 3 ARTWORKS OWNED</strong></div>'+
   '<div class="decor-location"><label for="decorWallSlot">CHOOSE A GALLERY HANG POINT</label>'+
   '<select id="decorWallSlot">';
  for(const s of catalog.slots){
   const hit=[...placed].find(p=>p[1]===s.id);
   const label=s.name+(hit?' · '+byId.get(hit[0]).name+' INSTALLED':' · AVAILABLE');
   html+='<option value="'+s.id+'"'+(s.id===chosenSlot?' selected':'')+'>'+
    label.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>';
  }
  html+='</select><small>Sixteen unobstructed wall hanging points. More decoration categories and freeform interior placement are scheduled for later milestones.</small></div>';
  for(const item of catalog.items){
   const isOwned=owned.has(item.id),at=placed.get(item.id),free=available(chosenSlot,item.id);
   html+='<article class="decor-item"><div class="decor-art"><img src="'+catalog.thumbnail(item.id)+
    '" width="96" height="120" alt="'+item.name+' original pixel-art picture"></div>'+
    '<div class="decor-copy"><h4>'+item.name+'</h4><p>'+item.description+'</p>'+
    '<strong class="decor-price">'+(isOwned?'PERMANENTLY OWNED':item.price+' PERFECT ROWS = '+(item.price*10)+' FIGURES RETURNED')+
    '</strong><small>'+(isOwned?(at===undefined?'STORED':catalog.slots[at].name):
     availablePerfect<item.price?'NEED '+(item.price-availablePerfect)+' MORE PERFECT ROWS':'AVAILABLE TO CLAIM')+
    '</small><div class="decor-actions">';
   if(isOwned){
    html+='<button type="button" data-move-art="'+item.id+'"'+(free?'':' disabled')+'>PLACE / MOVE</button>'+
     '<button type="button" data-store-art="'+item.id+'"'+(at===undefined?' disabled':'')+'>STORE</button>';
   }else{
    html+='<button type="button" data-buy-art="'+item.id+'"'+(availablePerfect>=item.price&&free?'':' disabled')+'>SACRIFICE & CLAIM</button>';
   }
   html+='</div></div></article>';
  }
  html+='<div class="decor-future"><strong>180 DECORATIONS AT FULL RELEASE</strong>';
  for(let i=0;i<catalog.quotas.length;i++){
   const [name,quota]=catalog.quotas[i];
   html+='<span>'+name+' · '+(i===0?catalog.items.length:0)+' / '+quota+'</span>';
  }
  html+='<p>This is the first playable framed-art slice (3 of 180), not the completed catalog.</p></div>';
  body.innerHTML=html;body.scrollTop=scroll;
  body.querySelector('#decorWallSlot').onchange=e=>{chosenSlot=Number(e.target.value);render();};
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
 function draw(itemId,slot,project,ctx){
  const wall=catalog.slots[slot],texture=catalog.texture(itemId);
  if(!wall||!texture)return;
  const vertical=wall.side==='WEST'||wall.side==='EAST',radius=.99,top=3.67,bottom=1.16;
  const a=vertical?project(wall.x,wall.z-radius,top):project(wall.x-radius,wall.z,top);
  const b=vertical?project(wall.x,wall.z+radius,top):project(wall.x+radius,wall.z,top);
  const d=vertical?project(wall.x,wall.z-radius,bottom):project(wall.x-radius,wall.z,bottom);
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
