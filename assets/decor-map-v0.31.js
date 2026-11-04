/* The Bit Bazaar v0.31 — map-to-world ghost previews before moving owned art.
   Overlay renders only inside the paused map drawer, never per world frame.
   Original shelf map, item purchases, figure saves and anchor IDs are untouched. */
(()=>{
'use strict';
function create({catalog,getPlaced,setDestination,returnToCatalog,moveOwned,closePlanner,previewOwned}){
 const types=[
  ['off','SHELF MAP'],['wall','WALLS + ENDCAPS'],['floor','FLOOR DISPLAYS'],
  ['rug','RUGS'],['ceiling','CEILING'],['shelf','SHELF TRIMS']
 ];
 let kind='off',selected=null,movingId=null;
 const byId=new Map(catalog.items.map(item=>[item.id,item]));
 const group=Object.fromEntries(types.slice(1).map(([k])=>[k,catalog.slots.filter(s=>s.kind===k)]));
 const placed=()=>new Map(getPlaced().map(([id,slot])=>[slot,id]));
 const valid=id=>Number.isInteger(id)&&id>=0&&id<catalog.slots.length;
 const mountFor=id=>byId.get(id)?.mount||'wall';
 const originSlot=()=>getPlaced().find(([id])=>id===movingId)?.[1];
 function beginMove(id){
  const found=getPlaced().find(([art])=>art===id);
  if(!byId.has(id)||!found)return false; // Installed and owned only.
  movingId=id;kind=mountFor(id);selected=null;
  return true; // No save mutation before confirmation.
 }
 function cancelMove(){
  const active=movingId!==null;
  movingId=null;selected=null;
  if(active)kind='off';
  return active;
 }
 function previewSelected(){
  const site=catalog.slots[selected],from=originSlot();
  if(movingId===null||!site||site.kind!==mountFor(movingId)||
     site.id===from||placed().has(site.id))return false;
  if(typeof previewOwned!=='function'||!previewOwned(movingId,site.id))return false;
  cancelMove();
  if(typeof closePlanner==='function')closePlanner();
  return true; // World ghost is transient; NO save or purchase.
 }
 function moveSelected(){
  const site=catalog.slots[selected],from=originSlot();
  if(movingId===null||!site||site.kind!==mountFor(movingId)||
     site.id===from||placed().has(site.id))return false;
  if(typeof moveOwned!=='function'||!moveOwned(movingId,site.id))return false;
  cancelMove();
  if(typeof closePlanner==='function')closePlanner();
  return true;
 }
 function mode(next){
  if(movingId!==null)return kind;
  if(!types.some(([key])=>key===next))next='off';
  if(next!==kind)selected=null;
  kind=next;
  return kind;
 }
 function point(slot,shelves){
  if(slot.kind==='shelf'){
   const f=shelves[slot.face];
   if(f?.fixture){
    const fx=f.fixture;
    const face=f.face===-1?-1:1;
    return {x:fx.x+fx.nx*face*1.5,z:fx.z+fx.nz*face*1.5};
   }
  }
  const x=slot.x,z=slot.z;
  return {x,z};
 }
 function svg(shelves){
  if(kind==='off')return '';
  const occupied=placed();
  const items=group[kind]||[];
  return '<g class="decor-map-pins" aria-label="Decoration display locations">'+
   items.map((s,index)=>{
    const at=point(s,shelves),x=Math.min(683,Math.max(17,at.x*10)),
      y=Math.min(723,Math.max(17,at.z*10));
    const owned=occupied.has(s.id),active=s.id===selected;
    return '<g class="decor-map-pin'+(owned?' occupied':' open')+
     (active?' selected':'')+
      (movingId!==null&&occupied.get(s.id)===movingId?' move-origin':'')+
      (movingId!==null&&active&&!owned?' move-preview':'')+
      '" role="button" tabindex="0" data-decor-site="'+s.id+
     '" aria-label="'+escape(s.name)+(owned?', occupied by '+escape(byId.get(occupied.get(s.id))?.name||'an item'):', open display')+
     '" aria-pressed="'+active+'" transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+')">'+
     '<title>'+escape(s.name)+(owned?' · OCCUPIED':' · AVAILABLE')+'</title>'+
     '<circle class="decor-map-hit" r="22"></circle>'+
     '<circle class="decor-map-disc" r="13"></circle>'+
      (movingId!==null&&active&&!owned?'<text class="decor-map-ghost" text-anchor="middle" y="-17">✦</text>':'')+
     '<text class="decor-map-pin-label" y="3.7" text-anchor="middle">'+(index+1)+'</text>'+
     '</g>';
   }).join('')+'</g>';
 }
 const escape=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 function controls(){
  const spots=group[kind]||[],installed=placed(),free=spots.filter(s=>!installed.has(s.id)).length;
  const slot=valid(selected)?catalog.slots[selected]:null,
    chosen=slot?.kind===kind?slot:null;
  const occupant=chosen?installed.get(chosen.id):null;
  if(movingId!==null){
   const item=byId.get(movingId),from=catalog.slots[originSlot()],
    validDest=!!chosen&&!occupant&&chosen.id!==from?.id;
   if(!item||!from)return '';
   const status=!chosen?'SELECT A GREEN PIN TO PREVIEW THE MOVE':
    chosen.id===from.id?'THIS IS THE CURRENT LOCATION · PICK ANOTHER PIN':
    occupant?'OCCUPIED · PICK A GREEN PIN':'✓ FREE LOCATION · READY TO CONFIRM';
   return '<section class="decor-map-panel decor-move-planner" aria-label="Move owned decoration">'+
    '<div class="decor-map-title"><strong>↔ MOVE OWNED ARTWORK</strong><small>FREE · NO FIGURES SCATTERED</small></div>'+
    '<div class="decor-move-preview"><img src="'+catalog.thumbnail(item.id)+'" width="56" height="72" alt="'+escape(item.name)+' artwork preview">'+
    '<div><strong>'+escape(item.name)+'</strong><small>FROM: '+escape(from.name)+'</small>'+
    '<p>Tap a green pin to preview this artwork at another compatible location. The original remains installed until you confirm.</p></div></div>'+
    '<div class="decor-map-stats">'+free+' / '+spots.length+' '+kind.toUpperCase()+' OPEN LOCATIONS</div>'+
    '<div class="decor-map-current" aria-live="polite"><strong>DESTINATION PREVIEW</strong>'+
    '<span>'+(chosen?escape(chosen.name):'NO DESTINATION SELECTED')+'</span>'+
    '<small class="decor-move-status">'+status+'</small></div>'+
    '<div class="decor-map-actions decor-preview-actions">'+
    '<button type="button" data-decor-map-preview="1"'+(validDest?'':' disabled')+'>👁 PREVIEW IN STORE</button>'+
    '<button type="button" data-decor-map-apply="1"'+(validDest?'':' disabled')+'>✓ MOVE NOW · FREE</button>'+
    '<button type="button" data-decor-map-cancel="1">✕ CANCEL MOVE</button></div>'+
    '<p>Moving purchased artwork costs no perfect rows. Cancel at any time without changing your save.</p>'+
    '</section>';
  }
  return '<section class="decor-map-panel" aria-label="Decoration display planner">'+
   '<div class="decor-map-title"><strong>✦ DECORATION MAP</strong>'+
   '<small>PLAN FIRST · NO ITEMS MOVED</small></div>'+
   '<p>Choose a category, then tap a numbered pin on the overhead store plan. Open pins can be sent to the DECOR catalog for buying or positioning an owned item.</p>'+
   '<div class="decor-map-tabs" role="group" aria-label="Decoration location types">'+
   types.map(([key,label])=>
    '<button type="button" data-decor-map-mode="'+key+'" aria-pressed="'+(kind===key)+
    '" class="'+(kind===key?'selected':'')+'">'+label+'</button>').join('')+'</div>'+
   (kind==='off'?
    '<p class="decor-map-help">The original shelf task map is active. Select WALL ART, FLOOR DISPLAYS, RUGS, CEILING or SHELF TRIMS to show their positions.</p>':
    '<div class="decor-map-stats">'+free+' / '+spots.length+' '+kind.toUpperCase()+' LOCATIONS AVAILABLE</div>'+
    '<div class="decor-map-current">'+(chosen?
      '<strong>'+escape(chosen.name)+'</strong>'+
      (chosen.profile==='endcap'?'<small class="decor-endcap-detail">SHELF-END GALLERY · FIXED TO RACK SIDE</small>':'')+
      '<span>'+
      (occupant?'INSTALLED: '+escape(byId.get(occupant)?.name||'OWNED ITEM'):'✓ AVAILABLE FOR PLACEMENT')+
      '</span>':
      '<strong>SELECT AN OPEN OR OCCUPIED PIN</strong><span>Green = open · Amber = occupied</span>')+
    '</div>'+
    '<div class="decor-map-actions">'+
    '<button type="button" data-decor-map-apply="1"'+(!chosen||occupant?' disabled':'')+'>USE SELECTED LOCATION</button>'+
    '<button type="button" data-decor-map-return="1">RETURN TO DECOR</button></div>')+
   '</section>';
 }
 function choose(id){
  if(!valid(id)||catalog.slots[id].kind!==kind)return false;
  selected=id;return true;
 }
 function useSelected(){
  if(movingId!==null)return moveSelected();
  if(!valid(selected)||catalog.slots[selected].kind!==kind||placed().has(selected))return false;
  if(!setDestination(kind,selected))return false;
  returnToCatalog();return true;
 }
 function bind(body,repaint){
  body.querySelectorAll('[data-decor-map-mode]').forEach(el=>el.onclick=()=>{
   mode(el.getAttribute('data-decor-map-mode'));repaint();
  });
  const chooseSite=e=>{
   const el=e.target.closest('[data-decor-site]');if(!el)return;
   const id=Number(el.getAttribute('data-decor-site'));
   if(choose(id))repaint();
  };
  body.querySelectorAll('[data-decor-site]').forEach(el=>{
   el.addEventListener('click',chooseSite);
   el.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();chooseSite(e);}
   });
  });
  const use=body.querySelector('[data-decor-map-apply]');
  if(use)use.onclick=()=>useSelected();
  const preview=body.querySelector('[data-decor-map-preview]');
  if(preview)preview.onclick=()=>previewSelected();
  const back=body.querySelector('[data-decor-map-return]');
  if(back)back.onclick=()=>returnToCatalog();
  const cancel=body.querySelector('[data-decor-map-cancel]');
  if(cancel)cancel.onclick=()=>{cancelMove();if(typeof closePlanner==='function')closePlanner();};
 }
 return {mode,choose,svg,controls,bind,useSelected,previewSelected,beginMove,cancelMove,
  moving:()=>movingId!==null,
  state:()=>({kind,selected,movingId}),types:()=>types.map(([key])=>key)};
}
window.BIT_BAZAAR_DECOR_MAP=Object.freeze({create});
})();