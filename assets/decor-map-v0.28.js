/* The Bit Bazaar v0.28 — overhead physical wall and endcap art gallery placement map.
   Overlay renders only inside the paused map drawer, never per world frame.
   Original shelf map, item purchases, figure saves and anchor IDs are untouched. */
(()=>{
'use strict';
function create({catalog,getPlaced,setDestination,returnToCatalog}){
 const types=[
  ['off','SHELF MAP'],['wall','WALLS + ENDCAPS'],['floor','FLOOR DISPLAYS'],
  ['rug','RUGS'],['ceiling','CEILING'],['shelf','SHELF TRIMS']
 ];
 let kind='off',selected=null;
 const byId=new Map(catalog.items.map(item=>[item.id,item]));
 const group=Object.fromEntries(types.slice(1).map(([k])=>[k,catalog.slots.filter(s=>s.kind===k)]));
 const placed=()=>new Map(getPlaced().map(([id,slot])=>[slot,id]));
 const valid=id=>Number.isInteger(id)&&id>=0&&id<catalog.slots.length;
 function mode(next){
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
     (active?' selected':'')+'" role="button" tabindex="0" data-decor-site="'+s.id+
     '" aria-label="'+escape(s.name)+(owned?', occupied by '+escape(byId.get(occupied.get(s.id))?.name||'an item'):', open display')+
     '" aria-pressed="'+active+'" transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+')">'+
     '<title>'+escape(s.name)+(owned?' · OCCUPIED':' · AVAILABLE')+'</title>'+
     '<circle class="decor-map-hit" r="22"></circle>'+
     '<circle class="decor-map-disc" r="13"></circle>'+
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
  const back=body.querySelector('[data-decor-map-return]');
  if(back)back.onclick=()=>returnToCatalog();
 }
 return {mode,choose,svg,controls,bind,useSelected,
  state:()=>({kind,selected}),types:()=>types.map(([key])=>key)};
}
window.BIT_BAZAAR_DECOR_MAP=Object.freeze({create});
})();