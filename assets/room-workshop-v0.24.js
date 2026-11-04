/* Bit Bazaar v0.24 — non-destructive room finishes and walk-around preview.
   Four independent, optional room-material indexes; no new decor IDs or currency. */
(()=>{
'use strict';
const surfaces=['FLOOR','WALLS','CEILING','SHELVES'];
const labels=[
 ['HEIRLOOM SLATE','WARM HONEY TILES','SEA GLASS STONE','TERRACOTTA MOSAIC'],
 ['MULBERRY PLASTER','MORNING CREAM','LAGOON TEAL','OLD-BRICK ROSE'],
 ['MIDNIGHT VIOLET','CLOUDLINEN','SAPPHIRE NIGHT','COPPER GLOW'],
 ['HERITAGE WALNUT','GOLDEN OAK','PAINTED SAGE','INKWOOD & BRASS']
];
const palettes=Object.freeze({
 floor:[
  [63,50,70,71,59,78,20,19,36],
  [110,80,60,124,91,68,40,30,24],
  [54,91,94,64,107,108,21,39,46],
  [115,64,58,129,78,68,45,24,25]
 ],
 walls:[
  ['#433347','#49374e','#2d2638','#6d5365'],
  ['#8c7c75','#a49683','#5d5557','#d2bc9b'],
  ['#2c5963','#326673','#20434e','#8badaf'],
  ['#84565b','#975f64','#593a46','#c48f86']
 ],
 ceiling:[
  ['#252137','#252036','#29233b'],
  ['#6b6470','#747176','#84807d'],
  ['#243650','#1e3049','#344863'],
  ['#493243','#553548','#694958']
 ],
 shelves:[
  ['#594254','#62465a','#34283c','#b78668','#a77861','#f0c18c'],
  ['#79634d','#896b4e','#433b39','#d5a571','#bf9164','#f4d49b'],
  ['#405d58','#506f64','#263c41','#9db9a1','#85a893','#d3e1bd'],
  ['#373849','#3d4153','#24283a','#8a8494','#777184','#dcbb84']
 ]
});
const hexes=[
 ['#413344','#a77754','#568f8b','#ae6255'],
 ['#49374e','#a49683','#326673','#975f64'],
 ['#252036','#84807d','#344863','#694958'],
 ['#594254','#896b4e','#506f64','#373849']
];
function create({api,rerender}){
 let saved=[0,0,0,0],draft=[0,0,0,0],previewing=false;
 const valid=v=>Array.isArray(v)&&v.length===4&&v.every(x=>Number.isInteger(x)&&x>=0&&x<4);
 const state=()=>saved.slice();
 function load(raw){
  const room=raw?.decor?.room;
  saved=valid(room)?room.slice():[0,0,0,0];
  draft=saved.slice();previewing=false;
 }
 function reset(){saved=[0,0,0,0];draft=saved.slice();previewing=false;}
 const effective=()=>previewing?draft:saved;
 function floor(){return palettes.floor[effective()[0]];}
 function wall(){return palettes.walls[effective()[1]];}
 function ceiling(){return palettes.ceiling[effective()[2]];}
 function shelf(){return palettes.shelves[effective()[3]];}
 function select(surface,style){
  if(previewing||!Number.isInteger(surface)||surface<0||surface>=4||
     !Number.isInteger(style)||style<0||style>=4)return false;
  draft[surface]=style;rerender();return true;
 }
 function begin(){
  if(previewing)return false;
  previewing=true;api.enterPreview();
  return true;
 }
 function apply(){
  const changing=!saved.every((v,i)=>v===draft[i]);
  saved=draft.slice();previewing=false;
  if(changing)api.save();
  if(api.isPreviewOpen())api.exitPreview();
  else rerender();
  return true;
 }
 function cancel(){
  const wasPreview=previewing;
  previewing=false;draft=saved.slice();
  if(wasPreview&&api.isPreviewOpen())api.exitPreview();
  else rerender();
  return true;
 }
 function back(){
  if(!previewing)return false;
  previewing=false;api.exitPreview();return true;
 }
 function render(){
  const changes=draft.some((v,i)=>v!==saved[i]);
  let html='<section class="room-finishes" aria-label="Room surface materials">'+
   '<div class="room-finishes-title"><strong>✦ THE INTERIOR WORKSHOP</strong>'+
   '<small>NO PERFECT ROWS TO SPEND · 4 INDEPENDENT SURFACES</small></div>'+
   '<p>Customize the actual store floors, walls, ceiling and shelf bodies. Choose four different finishes, then walk around the shop before deciding to keep them.</p>'+
   '<div class="room-surface-grid">';
  for(let surface=0;surface<4;surface++){
   html+='<div class="room-surface"><strong>'+surfaces[surface]+'</strong>'+
    '<div class="room-material-list" role="group" aria-label="'+surfaces[surface]+' material">';
   for(let style=0;style<4;style++){
    const chosen=draft[surface]===style,active=saved[surface]===style;
    html+='<button type="button" data-room-surface="'+surface+'" data-room-style="'+style+
     '" aria-pressed="'+chosen+'" class="'+(chosen?'selected':'')+'">'+
     '<span class="room-swatch" style="background:'+hexes[surface][style]+'"></span>'+
     '<span>'+labels[surface][style]+'</span>'+(active?'<em>CURRENT</em>':'')+'</button>';
   }
   html+='</div></div>';
  }
  html+='</div><div class="room-finishes-actions">'+
   '<button type="button" data-room-preview="1">⌕ WALK-AROUND PREVIEW</button>'+
   '<button type="button" data-room-apply="1"'+(changes?'':' disabled')+'>✓ APPLY FINISHES</button>'+
   '<button type="button" data-room-cancel="1"'+(changes?'':' disabled')+'>↶ REVERT CHOICES</button>'+
   '</div><small class="room-finish-note">Preview changes are temporary until applied. Canceling restores your saved room; moving and collecting stay available outside the preview.</small></section>';
  return html;
 }
 function bind(body){
  body.querySelectorAll('[data-room-surface]').forEach(el=>el.onclick=()=>select(
   Number(el.getAttribute('data-room-surface')),Number(el.getAttribute('data-room-style'))));
  const preview=body.querySelector('[data-room-preview]');
  if(preview)preview.onclick=()=>begin();
  const commit=body.querySelector('[data-room-apply]');
  if(commit)commit.onclick=()=>apply();
  const revert=body.querySelector('[data-room-cancel]');
  if(revert)revert.onclick=()=>cancel();
 }
 return {state,load,reset,select,begin,apply,cancel,back,render,bind,
  floor,wall,ceiling,shelf,effective,changes:()=>draft.some((v,i)=>v!==saved[i]),
  isPreviewing:()=>previewing};
}
window.BIT_BAZAAR_ROOM=Object.freeze({create});
})();