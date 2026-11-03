/* Bit Bazaar v0.7.0: close-up miniature inspection, perfect-set celebration, and persistent first-perfections. */
/* THE BIT BAZAAR — no framework, no remote services, no external dependencies.
   First-person software projection; 3,000 real, separate collectibles.
   World coordinates are in store floor units. Figures never respawn when shelved. */
(() => {
'use strict';
const DB = window.BIT_COLLECTION;
if (!DB || DB.figures.length !== 3000 || DB.sets.length !== 300) {
 document.body.innerHTML = '<p style="color:white;padding:30px">Collection asset could not load. Keep the assets folder beside index.html.</p>';return;
}
const $ = id => document.getElementById(id);
const canvas = $('world'), ctx = canvas.getContext('2d',{alpha:false});
const W=480, H=270, FOCAL=360, HORIZON=133, EYE=1.64;
ctx.imageSmoothingEnabled=false;
const img=new Image();img.decoding='async';img.src='assets/figurines.png';
const sprites=window.createBitBazaarSprites(DB,img);
if(!sprites)throw Error('Optimized sprite system not loaded');
const NUM_FLOOR=20,NUM_WALL=20,NUM_RACKS=60,ROWS=5,PER_ROW=10,MAX_TOTE=1;
const STORE_KEY='bit-bazaar-save-v3';
const LEGACY_KEY='bit-bazaar-save-v1';
const SW=70,SD=74;
const {fixtures,shelves}=makeFixtures();

// Immutable shelf bounds, with mutable camera-local coordinates refreshed per frame.
// A ray into a solid shelf must NOT allow a figure behind that shelf to render.
const sightBlockers=fixtures.map(f=>({
 id:f.id,x:f.x,z:f.z,ux:f.ux,uz:f.uz,nx:f.nx,nz:f.nz,
 halfU:f.w/2+.06,halfN:f.depth/2+.06,
 radius2:(f.w*f.w+f.depth*f.depth)/4+.6,camU:0,camN:0,vx:0,vz:0
}));
let occlusionChecks=0,occludedCandidates=0;
function prepareOcclusion(){
 for(const b of sightBlockers){
  const dx=player.x-b.x,dz=player.z-b.z;
  b.camU=dx*b.ux+dz*b.uz;
  b.camN=dx*b.nx+dz*b.nz;
  b.vx=b.x-player.x;b.vz=b.z-player.z;
 }
 occlusionChecks=0;occludedCandidates=0;
}
// Broad-phase ray-to-bounding-circle, then exact segment-to-oriented-box slabs.
function shelfOccludes(fig,excludeFixtureId=-1){
 const dx=fig.x-player.x,dz=fig.z-player.z,ray2=dx*dx+dz*dz;
 if(ray2<.0001)return false;
 for(const b of sightBlockers){
  if(b.id===excludeFixtureId)continue;
  occlusionChecks++;
  const t=(b.vx*dx+b.vz*dz)/ray2;
  if(t<=0||t>=1)continue;
  const px=b.vx-t*dx,pz=b.vz-t*dz;
  if(px*px+pz*pz>b.radius2)continue;
  const u=b.camU,n=b.camN;
  const du=dx*b.ux+dz*b.uz,dn=dx*b.nx+dz*b.nz;
  let lo=0,hi=1;
  if(Math.abs(du)<.000001){
   if(Math.abs(u)>b.halfU)continue;
  }else{
   let a=(-b.halfU-u)/du,c=(b.halfU-u)/du;
   if(a>c){const q=a;a=c;c=q;}
   if(a>lo)lo=a;if(c<hi)hi=c;
   if(lo>hi)continue;
  }
  if(Math.abs(dn)<.000001){
   if(Math.abs(n)>b.halfN)continue;
  }else{
   let a=(-b.halfN-n)/dn,c=(b.halfN-n)/dn;
   if(a>c){const q=a;a=c;c=q;}
   if(a>lo)lo=a;if(c<hi)hi=c;
  }
  if(lo>.001&&lo<.995&&lo<=hi){
   // Floor sprites (0.71 units high) cannot be seen through solid
   // four-unit-tall shelf bodies, independent of painter's sort order.
   occludedCandidates++;return true;
  }
 }
 return false;
}
let player={x:35,z:68,yaw:0,pitch:0};
let tote=[],rows=[],slots=[],selected=null, floor=[],figureById=DB.figures;
// Each row has ten physical positions. rows[][] remains a compact membership
// index for backward-compatible saves and the 3,000-figure catalog.
const EMPTY_ROW=()=>Array(PER_ROW).fill(null);
const isFigure=id=>Number.isInteger(id)&&id>=0&&id<DB.figures.length;
const setNumber=id=>figure(id).number;
const rowCount=(s,r)=>rows[s][r].length;
function syncRow(s,r){rows[s][r]=slots[s][r].filter(isFigure);}
function isPerfectRow(s,r){
 const line=slots[s][r];if(!line||line.some(id=>!isFigure(id)))return false;
 const sid=figure(line[0]).setId;
 return line.every((id,i)=>figure(id).setId===sid&&setNumber(id)===i+1);
}
function completedRowCount(){let c=0;for(let s=0;s<NUM_RACKS;s++)for(let r=0;r<ROWS;r++)if(isPerfectRow(s,r))c++;return c}
function rowStatus(s,r){
 const count=rowCount(s,r);
 return !count?'EMPTY':isPerfectRow(s,r)?'PERFECT':count===PER_ROW?'FULL — SORT 1–10':count+'/10 COLLECTED';
}

const groundPositions=new Map();
let migratedCarryCount=0,lastPlacement=null;
let lifetimePerfect=new Set(),inspectionReturn='',inspectedId=null;
let perfectBannerTimer=0,slotPulse=null;
const CELL=6,floorGrid=new Map(),distantGrid=new Map();
// Small bounded sets remember actual selected FIGURE IDs from the previous frame.
// No persistent canvas allocations, and no full-collection sorting during gameplay.
let previousNear=new Set(),previousMid=new Set(),previousFar=new Set();
let retainedNear=0,retainedMid=0,retainedFar=0;
const stableHash=id=>Math.imul(id+1,2654435761)>>>0;
// In portrait, object-fit:cover crops most of the 480x270 world canvas.
// Culling to a fixed 16:9 FOV spent the figure budget on OFFSCREEN objects.
let visibleSlope=W/(2*FOCAL);
function updateVisibleSlope(){
 const width=Math.max(1,window.innerWidth||W),height=Math.max(1,window.innerHeight||H);
 const visibleHalfWidth=Math.min(W/2,(H*width/height)/2);
 visibleSlope=visibleHalfWidth/FOCAL;
}
const DISTANT_COLORS=['#78d9b8','#bd8cdf','#f2bf75','#b27d9d','#72afc6','#df8d8b','#c6ce76','#ae8dd1'];
const DARK_PIXEL='#20172f',LIGHT_PIXEL='#edd6a7';
let renderLimit=70,viewDistance=19,midStart=9,midLimit=30,midDistance=29,farLimit=65,farDistance=39,renderFrames=0,lastDrawMs=-1e6,drawInterval=1000/24,slowFrames=0,extremeFrames=0,lastRuntimeMs=0,nearbyExamined=0,farCandidatesExamined=0,renderedFigures=0,midRendered=0,farRendered=0;
const cellKey=(x,z)=>Math.floor(x/CELL)+','+Math.floor(z/CELL);
let modal='', focus=null, playing=false, shift=false, activeSet=0, albumQuery='';
let lastSave=0,lastFrame=performance.now(), toastTimer=0;
const keys=new Set(), touch={lookId:null,lastX:0,lastY:0,joyId:null,axisX:0,axisY:0};
let floorBuffer=ctx.createImageData(W,H);
let aimKind='none';
const allUsed=()=>new Set([...tote,...rows.flat(2)]);
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const sqr=n=>n*n;
function srand(seed){ let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;}; }
const rng=srand(20261102);
function setupFloor(){
 floor=[];floorGrid.clear();distantGrid.clear();previousNear.clear();previousMid.clear();previousFar.clear();
 const used=allUsed(),random=srand(20261102);
 for(let i=0;i<DB.figures.length;i++){
  let x,z,tries=0;
  do{x=2.5+random()*65;z=3+random()*67;tries++;}
  while(tries<32 && (blocked(x,z,.26)||(sqr(x-35)+sqr(z-68)<5)));
  const custom=groundPositions.get(i);
  if(custom && !blocked(custom.x,custom.z,.23)){x=custom.x;z=custom.z;}
  const f={id:i,x,z,onFloor:!used.has(i)};
  floor.push(f);
  const key=cellKey(x,z);let bucket=floorGrid.get(key);
  if(!bucket){bucket=[];floorGrid.set(key,bucket);}bucket.push(f);
 }
 // Up to seven representatives per tile for distant visibility. These refer
 // to real figure objects, not new sprites or copies of the collection.
 for(const [key,bucket] of floorGrid){
  const choices=[];
  const step=bucket.length/Math.min(7,bucket.length);
  for(let j=0;j<Math.min(7,bucket.length);j++)choices.push(bucket[Math.floor(j*step)]);
  distantGrid.set(key,choices);
 }
}
// Only nearby spatial buckets are scanned. This avoids a 3,000-object scan each frame.
function nearbyFloor(radius,angleCull){
 const out=[],cx=player.x,cz=player.z,r2=radius*radius;
 const minx=Math.floor((cx-radius)/CELL),maxx=Math.floor((cx+radius)/CELL),
  minz=Math.floor((cz-radius)/CELL),maxz=Math.floor((cz+radius)/CELL);
 nearbyExamined=0;
 const sy=Math.sin(player.yaw),cy=Math.cos(player.yaw);
 for(let gx=minx;gx<=maxx;gx++)for(let gz=minz;gz<=maxz;gz++){
  const group=floorGrid.get(gx+','+gz);if(!group)continue;
  for(const f of group){
   nearbyExamined++;
   if(!f.onFloor)continue;
   const dx=f.x-cx,dz=f.z-cz;
   if(dx*dx+dz*dz>r2)continue;
   if(angleCull){
    const dep=dx*sy-dz*cy,side=dx*cy+dz*sy;
    if(dep<.22||dep>radius||Math.abs(side)>dep*visibleSlope+1.45)continue;
   }
   out.push(f);
  }
 }
 return out;
}
// Distant visibility scans a tiny capped subset of each nearby tile.
// No new textures, extra canvases, or full-collection scan is needed.
function distantFloor(radius){
 const out=[],cx=player.x,cz=player.z,r2=radius*radius;
 const minx=Math.floor((cx-radius)/CELL),maxx=Math.floor((cx+radius)/CELL),
  minz=Math.floor((cz-radius)/CELL),maxz=Math.floor((cz+radius)/CELL);
 const sy=Math.sin(player.yaw),cy=Math.cos(player.yaw);
 farCandidatesExamined=0;
 for(let gx=minx;gx<=maxx;gx++)for(let gz=minz;gz<=maxz;gz++){
  const group=distantGrid.get(gx+','+gz);if(!group)continue;
  for(const f of group){
   farCandidatesExamined++;
   if(!f.onFloor)continue;
   const dx=f.x-cx,dz=f.z-cz;
   if(dx*dx+dz*dz>r2)continue;
   const depth=dx*sy-dz*cy,side=dx*cy+dz*sy;
   if(depth<=midStart || depth>radius || Math.abs(side)>depth*visibleSlope+1.1)continue;
   out.push({type:depth<=midDistance?'mid':'far',depth,piece:f});
  }
 }
 return out;
}

function resetState(){
 rows=Array.from({length:NUM_RACKS},()=>Array.from({length:ROWS},()=>[]));
 slots=Array.from({length:NUM_RACKS},()=>Array.from({length:ROWS},EMPTY_ROW));
 tote=[];selected=null;groundPositions.clear();migratedCarryCount=0;lastPlacement=null;lifetimePerfect.clear();slotPulse=null;player={x:35,z:68,yaw:0,pitch:0};setupFloor();save();stats();
}
function restore(){
 let raw;try{raw=JSON.parse(localStorage.getItem(STORE_KEY)||localStorage.getItem(LEGACY_KEY)||'null')}catch(e){raw=null}
 if(!raw||raw.version!==1 || !Array.isArray(raw.rows)||![20,60].includes(raw.rows.length)){resetState();return}
 // Migrate the legacy 1,000-figure save once into a NEW save key; the safety build remains untouched.
 // Original twenty one-sided shelves become the FRONT faces of the same fixtures.
 const previous=raw.rows.length===20;
 // Non-destructive v0.6 migration. Preserve the original compact shelf save
 // before adding physical slot positions, so the user can always recover it.
 if(!raw.slots){
  try{
   if(!localStorage.getItem('bit-bazaar-v3-before-ordered-slots'))
    localStorage.setItem('bit-bazaar-v3-before-ordered-slots',JSON.stringify(raw));
  }catch(_){}
 }
 rows=Array.from({length:NUM_RACKS},(_,a)=>Array.from({length:ROWS},(_,b)=>{
  const oldIndex=previous?(a<40&&a%2===0?a/2:-1):a;
  const v=oldIndex>=0&&raw.rows[oldIndex]&&raw.rows[oldIndex][b];
  return Array.isArray(v)?v.filter(Number.isInteger).filter(id=>id>=0&&id<DB.figures.length).slice(0,PER_ROW):[];
 }));
 const used=new Set();
 for(const rack of rows)for(const row of rack){
  const setId=row.length?Math.floor(row[0]/10):-1;
  for(let k=row.length-1;k>=0;k--){
   const id=row[k];if(used.has(id)||(id/10|0)!==setId)row.splice(k,1);else used.add(id);
  }
 }
 slots=Array.from({length:NUM_RACKS},(_,si)=>Array.from({length:ROWS},(_,ri)=>{
  const member=rows[si][ri],saved=raw.slots?.[si]?.[ri];
  if(Array.isArray(saved)&&saved.length===PER_ROW){
   const compact=saved.filter(isFigure),expected=[...member].sort((a,b)=>a-b);
   if(compact.length===member.length &&
      compact.every((id,i,all)=>all.indexOf(id)===i) &&
      compact.slice().sort((a,b)=>a-b).every((id,i)=>id===expected[i]))
    return saved.map(id=>isFigure(id)?id:null);
  }
  const place=EMPTY_ROW();
  for(let i=0;i<Math.min(PER_ROW,member.length);i++)place[i]=member[i];
  return place;
 }));
 for(let si=0;si<NUM_RACKS;si++)for(let ri=0;ri<ROWS;ri++)syncRow(si,ri);
 // Older saves predate lifetime mastery. Preserve and infer perfection
 // from their existing physical rows, never revoke mastered sets on reload.
 lifetimePerfect=new Set((Array.isArray(raw.lifetimePerfect)?raw.lifetimePerfect:[])
   .filter(id=>Number.isInteger(id)&&id>=0&&id<DB.sets.length));
 for(let ss=0;ss<NUM_RACKS;ss++)for(let rr=0;rr<ROWS;rr++)
  if(isPerfectRow(ss,rr))lifetimePerfect.add(figure(slots[ss][rr][0]).setId);
 const old=Array.isArray(raw.tote)?raw.tote:[];
 const validCarry=old.filter(id=>Number.isInteger(id)&&id>=0&&id<DB.figures.length&&!used.has(id));
 const preferred=validCarry.includes(raw.selected)?raw.selected:validCarry[0];
 tote=preferred===undefined?[]:[preferred];
 migratedCarryCount=Math.max(0,validCarry.length-tote.length);
 lastPlacement=null;
 if(migratedCarryCount){
  try{
   if(!localStorage.getItem('bit-bazaar-v3-before-single-carry'))
    localStorage.setItem('bit-bazaar-v3-before-single-carry',JSON.stringify(raw));
  }catch(_){}
 }
 for(const id of tote)used.add(id);
 selected=tote[0]??null;
 groundPositions.clear();
 for(const item of (Array.isArray(raw.ground)?raw.ground:[])){
  if(!Array.isArray(item)||item.length!==3)continue;
  const [id,x,z]=item;
  if(!Number.isInteger(id)||id<0||id>=DB.figures.length||used.has(id))continue;
  if(!Number.isFinite(x)||!Number.isFinite(z)||blocked(x,z,.23))continue;
  groundPositions.set(id,{x,z});
 }
 if(raw.player && isFinite(raw.player.x)&&isFinite(raw.player.z)&&isFinite(raw.player.yaw)&&!blocked(raw.player.x,raw.player.z,0.2)){
  player={x:clamp(raw.player.x,2,68),z:clamp(raw.player.z,2,72),yaw:raw.player.yaw,pitch:clamp(Number(raw.player.pitch)||0,-.95,.95)};
 }else player={x:35,z:68,yaw:0,pitch:0};
 setupFloor();stats();
 // Copy the 1,000-figure save once; leave emergency recovery progress untouched.
 if(migratedCarryCount||!raw.slots||!Array.isArray(raw.lifetimePerfect)||!localStorage.getItem(STORE_KEY))save();
}
function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify({version:1,tote,rows,slots,lifetimePerfect:[...lifetimePerfect],selected,player,ground:[...groundPositions].map(([id,p])=>[id,p.x,p.z])}))}catch(e){}}
function blocked(x,z,pad=.3){
 if(x<1.4+pad||x>SW-1.4-pad||z<1.4+pad||z>SD-1.4-pad)return true;
 for(const f of fixtures){const dx=x-f.x,dz=z-f.z;
  if(Math.abs(dx*f.ux+dz*f.uz)<f.w/2+pad && Math.abs(dx*f.nx+dz*f.nz)<f.depth/2+pad)return true}
 return false;
}
function stats(){
 const placed=rows.flat(2).length;
 const completed=completedRowCount();
 $('placed').textContent=placed.toLocaleString();$('complete').textContent=completed;
 const holding=tote.length>0,id=holding?tote[0]:null;
 $('carryTitle').textContent=holding?'CARRYING 1 / 1':'EMPTY HANDS';
 $('carryDetail').textContent=holding?figure(id).name+' · #'+setNumber(id)+'/10':'PICK UP ONE FIGURE';
 $('carrySet').textContent=holding?DB.sets[figure(id).setId].name:'WALK UP TO A FIGURINE';
 $('carryThumb').innerHTML=holding?iconHTML(id):'<span class="empty-hand-icon">✦</span>';
 $('putDownBtn').hidden=!holding&&!lastPlacement;
 $('putDownBtn').textContent=holding?'PUT DOWN':'UNDO';
 $('putDownBtn').setAttribute('aria-label',holding?'Put held figurine on floor':'Undo last shelf placement');
 $('progress-fill').style.width=`${placed/DB.figures.length*100}%`;
 $('aisleLabel').textContent=`${nearestAisle()} · ${Math.max(0,DB.figures.length-placed)} TO SHELVE`;
 if(completed===NUM_RACKS*ROWS){setTimeout(()=>showVictory(),1200)}
}
function nearestAisle(){const i=clamp(Math.round((player.x-11)/16),0,3);return `AISLE ${'ABCD'[i]}`;}
function showVictory(){if(!playing)return;playing=false;$('screen').classList.add('shown');
 $('screen').querySelector('.title-card').innerHTML='<div class="eyebrow">★ PERFECT COLLECTION ★</div><h1>ALL<br><em>SORTED!</em></h1><p>Every unique figurine has a home. You organized all 300 sets across 300 shelf rows. THE BIT BAZAAR is now a collector’s dream.</p><button id="victoryBtn" class="primary large">EXPLORE YOUR STORE →</button>';
 $('victoryBtn').onclick=()=>{playing=true;$('screen').classList.remove('shown')};
}
function notify(s,kind='normal'){
 $('toast').textContent=s;$('toast').classList.add('visible');
 if(kind==='bad')$('toast').style.borderColor='#fb8188';else $('toast').style.borderColor='#dbab64';
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2200);
}
function countSet(sid){let count=0;for(const rack of rows)for(const row of rack)for(const id of row)if(figure(id).setId===sid)count++;return count;}
function rowForSet(sid){for(let s=0;s<NUM_RACKS;s++)for(let r=0;r<ROWS;r++)if(rows[s][r].length&&figure(rows[s][r][0]).setId===sid)return [s,r];return null;}
function isSetPerfect(sid){const where=rowForSet(sid);return !!where&&isPerfectRow(where[0],where[1]);}
const figure=id=>figureById[id];
const iconHTML=id=>`<span class="sprite" aria-hidden="true" style="background-position:${sprites.cssIcon(id)}"></span>`;
// Collection browsing is the ONLY remaining modal. Physical shelves are used in-world.
function openDrawer(kind){
 if(kind!=='album')return;
 modal='album';
 $('drawer').classList.add('open');$('drawerShade').classList.add('show');
 $('drawer').setAttribute('aria-hidden','false');
 $('drawerKicker').textContent='3,000 MINIATURE TREASURES';
 $('drawerTitle').textContent='COLLECTION ALMANAC';
 renderAlbum();
}
function closeDrawer(){
 modal='';$('drawer').classList.remove('open');$('drawerShade').classList.remove('show');
 $('drawer').setAttribute('aria-hidden','true');
}
function currentSelected(){return tote[0]??null;}
// The targeted physical row decides placement. An empty row accepts a new
// set even if that set has figures on other shelves; occupied rows accept
// ONLY the matching set. Mixing sets in one row remains prohibited.
function placementPlan(shelfId,rowId,slotId,id){
 if(id===null||id===undefined)return {ok:false,message:'PICK UP ONE FIGURE FIRST'};
 if(!Number.isInteger(shelfId)||shelfId<0||shelfId>=NUM_RACKS||
    !Number.isInteger(rowId)||rowId<0||rowId>=ROWS ||
    !Number.isInteger(slotId)||slotId<0||slotId>=PER_ROW)
  return {ok:false,message:'AIM AT ONE OF TEN POSITIONS'};
 const target=slots[shelfId][rowId],old=target[slotId],setId=figure(id).setId;
 if(rows[shelfId][rowId].length && figure(rows[shelfId][rowId][0]).setId!==setId)
  return {ok:false,message:'WRONG SET · '+DB.sets[figure(rows[shelfId][rowId][0]).setId].name};
 if(old!==null&&figure(old).setId!==setId)
  return {ok:false,message:'WRONG SET · NO MIXING'};
 const assigned=rowForSet(setId);
 const relocate=(!rows[shelfId][rowId].length&&assigned&&
  (assigned[0]!==shelfId||assigned[1]!==rowId))?assigned:null;
 if(relocate&&rowCount(assigned[0],assigned[1])>=PER_ROW)
  return {ok:false,message:'SET ALREADY FULL · PICK ONE UP TO REORDER'};
 return {ok:true,row:rowId,slot:slotId,exchange:old!==null,relocate};
}
function placeFig(shelfId,rowId,slotId){
 const id=currentSelected(),plan=placementPlan(shelfId,rowId,slotId,id);
 if(!plan.ok){notify(plan.message,'bad');return false;}
 const wasPerfect=isPerfectRow(shelfId,rowId);
 const target=slots[shelfId][rowId],targetBefore=target.slice();
 const from=plan.relocate?slots[plan.relocate[0]][plan.relocate[1]]:null;
 const fromBefore=from?from.slice():null;
 if(from){
  const moved=from.filter(isFigure);
  if(moved.length>=PER_ROW){notify('NO ROOM TO MOVE THIS SET','bad');return false;}
  // Preserve old positions wherever possible. The aimed target slot is
  // reserved for the single held piece, never silently moved elsewhere.
  const next=from.slice(),displaced=next[slotId];
  next[slotId]=null;
  if(isFigure(displaced)){
   const empty=next.findIndex((v,i)=>i!==slotId&&v===null);
   if(empty<0){notify('THIS ROW HAS NO ROOM','bad');return false;}
   next[empty]=displaced;
  }
  for(let i=0;i<PER_ROW;i++){target[i]=next[i];from[i]=null;}
  syncRow(plan.relocate[0],plan.relocate[1]);
 }
 const displaced=target[slotId];
 target[slotId]=id;
 syncRow(shelfId,rowId);
 slotPulse={shelfId,rowId,slotId,at:performance.now()};
 const nowPerfect=isPerfectRow(shelfId,rowId);
 if(nowPerfect&&!wasPerfect){
  const firstTime=!lifetimePerfect.has(figure(id).setId);
  lifetimePerfect.add(figure(id).setId);
  showPerfectBanner(figure(id).setId,firstTime);
 }
 if(isFigure(displaced)){
  // The occupied figure goes directly into the single hand; never use a tote.
  tote[0]=displaced;selected=displaced;lastPlacement=null;
  notify('SWAPPED · #'+setNumber(id)+' FOR #'+setNumber(displaced));
 }else{
  tote.length=0;selected=null;
  lastPlacement={shelfId,rowId,slotId,id,targetBefore,
   source:plan.relocate?plan.relocate.slice():null,sourceBefore:fromBefore};
  if(nowPerfect)
   notify('★ PERFECT 1–10! '+DB.sets[figure(id).setId].name);
  else if(rowCount(shelfId,rowId)===PER_ROW)
   notify('FULL BUT UNSORTED · ARRANGE 1–10');
  else notify('PLACED #'+setNumber(id)+'/10 · POSITION '+(slotId+1));
 }
 groundPositions.delete(id);save();stats();
 return true;
}
function placeDirect(shelfId,rowId,slotId){
 // Reticle-driven play always passes both row and exact slot.
 // QA may supply the shelf alone for older automated tests.
 const id=currentSelected();
 if(rowId===undefined){
  if(id===null)return false;
  rowId=rows[shelfId]?.findIndex(r=>r.length>0&&figure(r[0]).setId===figure(id).setId&&r.length<PER_ROW);
  if(rowId<0)rowId=rows[shelfId]?.findIndex(r=>r.length===0);
 }
 if(slotId===undefined&&rows[shelfId]?.[rowId])
  slotId=slots[shelfId][rowId].findIndex(v=>v===null);
 return placeFig(shelfId,rowId,slotId);
}
function grabShelfFig(shelfId,rowId,slotId){
 if(tote.length){notify('YOUR HAND IS FULL','bad');return false;}
 const row=slots[shelfId]?.[rowId],id=row?.[slotId];
 if(!isFigure(id))return false;
 row[slotId]=null;syncRow(shelfId,rowId);
 slotPulse={shelfId,rowId,slotId,at:performance.now()};
 tote[0]=id;selected=id;lastPlacement=null;
 save();stats();notify('LIFTED #'+setNumber(id)+'/10 · '+DB.sets[figure(id).setId].name);
 return true;
}
function undoLastPlacement(){
 if(tote.length||!lastPlacement)return false;
 const {shelfId,rowId,slotId,id,targetBefore,source,sourceBefore}=lastPlacement;
 if(slots[shelfId]?.[rowId]?.[slotId]!==id){lastPlacement=null;stats();return false;}
 const target=slots[shelfId][rowId];
 for(let i=0;i<PER_ROW;i++)target[i]=targetBefore[i];
 syncRow(shelfId,rowId);
 if(source){
  const from=slots[source[0]][source[1]];
  for(let i=0;i<PER_ROW;i++)from[i]=sourceBefore[i];
  syncRow(source[0],source[1]);
 }
 tote[0]=id;selected=id;lastPlacement=null;
 slotPulse={shelfId,rowId,slotId,at:performance.now()};
 save();stats();notify('BACK IN HAND · #'+setNumber(id));
 return true;
}

function putDown(){
 const id=currentSelected();if(id===null)return false;
 const dir=forward(),right={x:Math.cos(player.yaw),z:Math.sin(player.yaw)};
 const locations=[];
 for(const dist of [1.15,1.55,1.95,2.3]){
  for(let i=0;i<8;i++){
   const theta=i*Math.PI/4,co=Math.cos(theta),si=Math.sin(theta);
   locations.push([dir.x*co+right.x*si,dir.z*co+right.z*si,dist]);
  }
 }
 let spot=null;
 for(const [dx,dz,dist] of locations){
  const x=player.x+dx*dist,z=player.z+dz*dist;
  if(blocked(x,z,.3))continue;
  const overlaps=nearbyFloor(2.5,false).some(f=>f.id!==id&&Math.hypot(f.x-x,f.z-z)<.42);
  if(overlaps)continue;
  spot={x,z};break;
 }
 if(!spot){notify('MOVE TO AN OPEN AISLE TO PUT THIS DOWN','bad');return false;}
 const f=floor[id],oldKey=cellKey(f.x,f.z),newKey=cellKey(spot.x,spot.z);
 const oldBucket=floorGrid.get(oldKey);
 if(oldBucket){const i=oldBucket.indexOf(f);if(i>=0)oldBucket.splice(i,1);}
 f.x=spot.x;f.z=spot.z;f.onFloor=true;
 let bucket=floorGrid.get(newKey);
 if(!bucket){bucket=[];floorGrid.set(newKey,bucket);}bucket.push(f);
 for(const key of new Set([oldKey,newKey])){
  const group=floorGrid.get(key)||[],choices=[];
  const count=Math.min(7,group.length),step=count?group.length/count:0;
  for(let i=0;i<count;i++)choices.push(group[Math.floor(i*step)]);
  if(key===newKey&&!choices.includes(f)){
   if(choices.length<7)choices.push(f);else choices[choices.length-1]=f;
  }
  distantGrid.set(key,choices);
 }
 groundPositions.set(id,spot);
 tote.length=0;selected=null;lastPlacement=null;save();stats();
 notify('PUT DOWN · '+figure(id).name);
 return true;
}
function renderAlbum(){
 let html=`<div class="info-strip">300 collectible series × 10 unique figurines. Search by a series name, or inspect any series to see what you have shelved.</div><div class="album-toolbar"><input id="albumSearch" class="search" placeholder="Search 300 collectible sets..." type="search" value="${albumQuery.replace(/["<>&]/g,'')}" /></div>`;
 html+='<div id="albumResults"></div><div class="footer-actions"><button class="reset-button" id="resetBtn">RESET SAVED STORE</button><span class="label">PROGRESS SAVES AUTOMATICALLY</span></div>';
 $('drawerBody').innerHTML=html;
 const search=$('albumSearch');search.oninput=()=>{albumQuery=search.value;paintAlbumList()};
 $('resetBtn').onclick=()=>$('confirm').hidden=false;
 paintAlbumList();
}
function paintAlbumList(){const dest=$('albumResults');if(!dest)return;
 const filter=albumQuery.toLowerCase().trim();let html='';
 for(const set of DB.sets){if(filter&&!`${set.name} ${set.theme} ${set.id+1}`.toLowerCase().includes(filter))continue;
  const cnt=countSet(set.id),perfect=isSetPerfect(set.id);
   const status=perfect?'★ PERFECT':cnt===10?'10/10 · SORT!':cnt+'/10';
   html+=`<button class="album-card" data-albumset="${set.id}"><div><b>${String(set.id+1).padStart(3,'0')} · ${set.name}</b><span>${set.theme} miniatures</span></div><div class="meter">${status}</div></button>`;
 }
 dest.innerHTML=html||'<div class="empty">No matching collectible series.</div>';
 dest.querySelectorAll('[data-albumset]').forEach(el=>el.onclick=()=>renderSetDetail(+el.dataset.albumset));
}
function renderSetDetail(sid){
 activeSet=sid;const set=DB.sets[sid],place=rowForSet(sid);
 const perfect=isSetPerfect(sid),state=perfect?'★ PERFECT 1–10':countSet(sid)===10?'FULL · STILL NEEDS SORTING':countSet(sid)+'/10 COLLECTED';
 let html=`<button class="back" id="backAlbum">← BACK TO 300 SETS</button><div class="info-strip"><b>${set.name}</b><br>${state} · ${place?`Shelf ${place[0]+1}, Row ${place[1]+1}`:'No display row assigned yet'}<br>Place figures in ANY slot and arrange their numbers 1–10 to complete the row.</div><div class="album-detail-grid">`;
 for(const id of set.memberIds){
  let status='SCATTERED ON FLOOR';if(tote.includes(id))status='IN HAND';
  else for(let ss=0;ss<NUM_RACKS;ss++)for(let rr=0;rr<ROWS;rr++){
    const at=slots[ss][rr].indexOf(id);
    if(at>=0)status='ON DISPLAY · SLOT '+(at+1);
   }
  html+=`<div class="detail-figure">${iconHTML(id)}<div><b>#${setNumber(id)}/10 · ${figure(id).role}</b><span>${set.name}</span><div class="status">${status}</div></div></div>`;
 }
 html+='</div><div class="info-strip">A row is PERFECT only after the 10 figures are in numerical order from left to right, 1–10.</div>';
 $('drawerBody').innerHTML=html;
 $('backAlbum').onclick=()=>renderAlbum();
}
function grabFig(id){
 if(tote.length>=MAX_TOTE){notify('HANDS FULL — PLACE OR PUT DOWN YOUR FIGURE FIRST','bad');return}
 const f=floor[id];if(!f||!f.onFloor)return;
 f.onFloor=false;tote.push(id);selected=id;lastPlacement=null;
 stats();save();notify('PICKED UP · '+figure(id).name+' · TAKE IT TO A SHELF');
}
function forward(){return {x:Math.sin(player.yaw),z:-Math.cos(player.yaw)}}
// Depth-aware perspective is required when a shelf corner passes the camera.
function project(x,z,h){
 const dx=x-player.x,dz=z-player.z,sy=Math.sin(player.yaw),cy=Math.cos(player.yaw);
 const dep=dx*sy-dz*cy,side=dx*cy+dz*sy,d=Math.max(.18,dep);
 return {x:W/2+side*FOCAL/d,y:cameraHorizon()+(EYE-h)*FOCAL/d,depth:dep,side,height:h};
}
const cameraHorizon=()=>HORIZON-Math.tan(player.pitch||0)*FOCAL;
function screenPoint(v){const d=Math.max(.18,v.depth);return {x:W/2+v.side*FOCAL/d,y:cameraHorizon()+(EYE-v.height)*FOCAL/d};}
function cameraDepth(x,z){return (x-player.x)*Math.sin(player.yaw)-(z-player.z)*Math.cos(player.yaw)}
function cameraSide(x,z){return (x-player.x)*Math.cos(player.yaw)+(z-player.z)*Math.sin(player.yaw)}
// Choose what is actually UNDER the fixed central reticle. No
// proximity-only pickup, and no selecting an entire shelf by standing near it.
const AIM_X=W/2,AIM_Y=H/2;
function pointInQuad(cx,cy,points){
 let sign=0;
 for(let i=0;i<points.length;i++){
  const p=points[i],q=points[(i+1)%points.length];
  const cross=(q.x-p.x)*(cy-p.y)-(q.y-p.y)*(cx-p.x);
  if(Math.abs(cross)<.00001)continue;
  const current=Math.sign(cross);
  if(sign&&sign!==current)return false;
  sign=current;
 }
 return true;
}
// For a double-sided rack, local positions run in opposite world-space
// directions so slot #1 is LEFT for someone standing at either face.
const slotEdge=(f,face,k)=>face*(-f.w/2+k*f.w/PER_ROW);
const slotCenter=(f,face,k)=>face*(-f.w/2+(k+.5)*f.w/PER_ROW);
function findFocus(){
 let shelfFocus=null;
 for(const shelf of shelves){
  const f=shelf.fixture,dx=player.x-f.x,dz=player.z-f.z;
  const u=dx*f.ux+dz*f.uz,front=(dx*f.nx+dz*f.nz)*shelf.face;
  if(Math.abs(u)>f.w/2+.25||front<f.depth/2-.2||front>f.depth/2+5.9)continue;
  const dd=shelf.face*(f.depth/2+.11),pos=shelfAt(f,0,dd);
  if(shelfOccludes(pos,f.id))continue;
  const depth=cameraDepth(pos.x,pos.z);
  if(depth<=.2)continue;
  for(let r=0;r<ROWS;r++){
   const bottom=.44+r*.72,top=bottom+.68;
   const pts=[
    shelfProject(f,-f.w/2,dd,bottom),
    shelfProject(f,f.w/2,dd,bottom),
    shelfProject(f,f.w/2,dd,top),
    shelfProject(f,-f.w/2,dd,top)
   ];
   if(pts.some(p=>p.depth<.2)||!pointInQuad(AIM_X,AIM_Y,pts))continue;
   let aimedSlot=-1;
   // No extra textures; ten small perspective quads are tested only for
   // the shelf row actually crossing the center reticle.
   for(let k=0;k<PER_ROW;k++){
    const left=slotEdge(f,shelf.face,k),right=slotEdge(f,shelf.face,k+1);
    const corners=[
     shelfProject(f,left,dd,bottom),shelfProject(f,right,dd,bottom),
     shelfProject(f,right,dd,top),shelfProject(f,left,dd,top)
    ];
    if(pointInQuad(AIM_X,AIM_Y,corners)){aimedSlot=k;break;}
   }
   if(aimedSlot<0)continue;
   const displayed=slots[shelf.id][r][aimedSlot];
   const candidate={
    kind:!tote.length&&isFigure(displayed)?'shelf-figure':'shelf',
    id:shelf.id,row:r,slot:aimedSlot,dist:depth,figureId:displayed
   };
   if(!shelfFocus||depth<shelfFocus.dist)shelfFocus=candidate;
  }
 }
 if(tote.length)return shelfFocus;
 let nearestFloor=null;
 for(const f of nearbyFloor(3.9,false)){
  if(shelfOccludes(f))continue;
  const d=cameraDepth(f.x,f.z);if(d<.25||d>3.65)continue;
  const p=project(f.x,f.z,0),h=.71*FOCAL/d,w=h*.80;
  if(AIM_X<p.x-w*.5-5||AIM_X>p.x+w*.5+5||
     AIM_Y<p.y-h-5||AIM_Y>p.y+5)continue;
  if(!nearestFloor||d<nearestFloor.dist)
   nearestFloor={kind:'figure',id:f.id,dist:d};
 }
 if(nearestFloor&&(!shelfFocus||nearestFloor.dist<=shelfFocus.dist+.1))
  return nearestFloor;
 return shelfFocus;
}
function interact(){
 if(modal){closeDrawer();return;}
 prepareOcclusion();focus=findFocus();
 if(!focus){notify(tote.length?'AIM AT A SHELF SLOT':'AIM AT A FIGURINE','bad');return;}
 if(focus.kind==='figure')grabFig(focus.id);
 else if(focus.kind==='shelf-figure')grabShelfFig(focus.id,focus.row,focus.slot);
 else if(tote.length)placeDirect(focus.id,focus.row,focus.slot);
 else notify('EMPTY SLOT · PICK UP A FIGURINE FIRST');
}
function updateFocus(){
 focus=findFocus();const box=$('interact'),reticle=$('crosshair');
 reticle.classList.remove('aim-pick','aim-place','aim-denied');
 if(!focus||modal||!playing){
  box.classList.add('hidden');
  $('actionLabel').textContent=tote.length?'PLACE':'PICK UP';return;
 }
 box.classList.remove('hidden');
 if(focus.kind==='figure'){
  const f=figure(focus.id);
  $('interactName').textContent=f.name.toUpperCase()+' · #'+setNumber(focus.id)+'/10';
  $('interactDescription').textContent=DB.sets[f.setId].name+' · PICK UP';
  $('actionLabel').textContent='PICK UP';
  reticle.classList.add('aim-pick');
 }else if(focus.kind==='shelf-figure'){
  const id=focus.figureId,f=figure(id);
  $('interactName').textContent=DB.sets[f.setId].name+' · #'+setNumber(id)+'/10';
  $('interactDescription').textContent='ROW '+(focus.row+1)+' · SLOT '+(focus.slot+1)+' · LIFT TO REARRANGE';
  $('actionLabel').textContent='LIFT';
  reticle.classList.add('aim-pick');
 }else{
  const plan=placementPlan(focus.id,focus.row,focus.slot,currentSelected());
  const row=rows[focus.id][focus.row],id=currentSelected();
  $('interactName').textContent=shelves[focus.id].name+' · ROW '+(focus.row+1)+' · SLOT '+(focus.slot+1);
  $('interactDescription').textContent=plan.ok?
    (plan.exchange?'SWAP #'+setNumber(id)+' WITH #'+setNumber(slots[focus.id][focus.row][focus.slot]):
     plan.relocate?'MOVE SET HERE':row.length?'MATCHING SET':'EMPTY ROW')+' · '+rowStatus(focus.id,focus.row):
    plan.message;
  $('actionLabel').textContent=plan.ok?(plan.exchange?'SWAP':'PLACE'):'NO MATCH';
  reticle.classList.add(plan.ok?'aim-place':'aim-denied');
 }
}

// Software-rendered, gently patterned 16-bit style tile floor.
// Pitch changes the floor horizon. Render only the below-horizon dirty rows,
// using one reused 480 x 270 buffer; no per-frame memory allocation.
function drawFloor(){
 const dat=floorBuffer.data,sy=Math.sin(player.yaw),cy=Math.cos(player.yaw);
 const horizon=cameraHorizon(),start=clamp(Math.floor(horizon)+1,0,H);
 for(let y=start;y<H;y++){
  const depth=EYE*FOCAL/Math.max(.75,y-horizon);
  const fog=clamp((depth-8)/95,0,.65);
  const cx=player.x+sy*depth,cz=player.z-cy*depth;
  const incrX=cy*depth/FOCAL,incrZ=sy*depth/FOCAL;
  let wx=cx-incrX*W/2,wz=cz-incrZ*W/2,i=y*W*4;
  for(let x=0;x<W;x++){
   const tx=Math.floor(wx*1.05),tz=Math.floor(wz*1.05);
   const grX=wx*1.05-tx,grZ=wz*1.05-tz;
   const grout=grX<.025||grZ<.025,check=(tx+tz)&1;
   const grain=(tx*13+tz*23+x*3+y*7)&7;
   let r=check?63:71,g=check?50:59,b=check?70:78;
   if(grout){r-=20;g-=17;b-=19;}
   if(grain===1){r+=7;g+=7;b+=9;}
   dat[i++]=r*(1-fog)+20*fog;
   dat[i++]=g*(1-fog)+19*fog;
   dat[i++]=b*(1-fog)+36*fog;
   dat[i++]=255;
   wx+=incrX;wz+=incrZ;
  }
 }
 if(start<H)ctx.putImageData(floorBuffer,0,0,0,start,W,H-start);
}
function solidQuad(a,b,c,d,color){
 const near=.24,poly=[a,b,c,d],clipped=[];
 for(let i=0;i<poly.length;i++){
  const curr=poly[i],prev=poly[(i+poly.length-1)%poly.length];
  const inside=curr.depth>=near,wasInside=prev.depth>=near;
  if(inside!==wasInside){
   const t=(near-prev.depth)/(curr.depth-prev.depth);
   clipped.push({side:prev.side+(curr.side-prev.side)*t,height:prev.height+(curr.height-prev.height)*t,depth:near});
  }
  if(inside)clipped.push(curr);
 }
 if(clipped.length<3)return;
 ctx.beginPath();const first=screenPoint(clipped[0]);ctx.moveTo(first.x,first.y);
 for(let i=1;i<clipped.length;i++){const v=screenPoint(clipped[i]);ctx.lineTo(v.x,v.y);}
 ctx.closePath();ctx.fillStyle=color;ctx.fill();
}
function line3(ax,az,ah,bx,bz,bh,col,w=1){
 let a=project(ax,az,ah),b=project(bx,bz,bh);const near=.24;
 if(a.depth<near&&b.depth<near)return;
 if(a.depth<near){const t=(near-a.depth)/(b.depth-a.depth);a={side:a.side+(b.side-a.side)*t,height:a.height+(b.height-a.height)*t,depth:near};}
 else if(b.depth<near){const t=(near-b.depth)/(a.depth-b.depth);b={side:b.side+(a.side-b.side)*t,height:b.height+(a.height-b.height)*t,depth:near};}
 const p=screenPoint(a),q=screenPoint(b);
 ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
}
function quadAt(x1,x2,z,h1,h2,col){solidQuad(project(x1,z,h2),project(x2,z,h2),project(x2,z,h1),project(x1,z,h1),col)}
function shelfAt(f,u,d){return {x:f.x+f.ux*u+f.nx*d,z:f.z+f.uz*u+f.nz*d}}
function shelfProject(f,u,d,h){const a=shelfAt(f,u,d);return project(a.x,a.z,h)}
function shelfPanel(f,d,lo,hi,color){
 solidQuad(shelfProject(f,-f.w/2,d,hi),shelfProject(f,f.w/2,d,hi),
  shelfProject(f,f.w/2,d,lo),shelfProject(f,-f.w/2,d,lo),color);
}
function shelfBeam(f,u1,d1,h1,u2,d2,h2,color,width=1){
 const a=shelfAt(f,u1,d1),b=shelfAt(f,u2,d2);
 line3(a.x,a.z,h1,b.x,b.z,h2,color,width);
}
function drawWall(wall){
 let {x1,z1,x2,z2}=wall;const d1=cameraDepth(x1,z1),d2=cameraDepth(x2,z2);
 if(d1<.15&&d2<.15)return;
 if(d1<.15){const t=(.15-d1)/(d2-d1);x1+=(x2-x1)*t;z1+=(z2-z1)*t;}
 else if(d2<.15){const t=(.15-d2)/(d1-d2);x2+=(x1-x2)*t;z2+=(z1-z2)*t;}
 solidQuad(project(x1,z1,4.8),project(x2,z2,4.8),project(x2,z2,0),project(x1,z1,0),
  wall.n%2?'#433347':'#49374e');
 for(const h of [.25,4.35])line3(x1,z1,h,x2,z2,h,h===.25?'#2d2638':'#6d5365',h===4.35?2.5:2);
 // Shelves now provide the environmental detail; no giant wall slogans.
}
function drawShelf(f){
 const rel=(player.x-f.x)*f.nx+(player.z-f.z)*f.nz;
 const facing=f.kind==='wall'?1:(rel>=0?1:-1);
 const d=facing*f.depth/2, depth=Math.max(.3,cameraDepth(f.x,f.z)),sz=FOCAL/Math.max(2.5,depth);
 const faceId=f.kind==='wall'?40+f.wallIndex:f.id*2+(facing===1?0:1);
 const back=-d;
 shelfPanel(f,back,.12,4.15,'#594254');
 shelfPanel(f,0,.15,4.11,'#62465a');
 const p1=shelfProject(f,-f.w/2,back,4.15),p2=shelfProject(f,-f.w/2,d,4.15),
   p3=shelfProject(f,-f.w/2,d,.12),p4=shelfProject(f,-f.w/2,back,.12);
 solidQuad(p1,p2,p3,p4,'#987053');
 solidQuad(shelfProject(f,f.w/2,d,4.15),shelfProject(f,f.w/2,back,4.15),
  shelfProject(f,f.w/2,back,.12),shelfProject(f,f.w/2,d,.12),'#795466');
 shelfPanel(f,d,.12,4.12,'#34283c');
 const lineW=Math.max(1,sz*.018);
 for(let r=0;r<5;r++){
  const y=.46+r*.72,board=d+facing*.045;
  shelfPanel(f,board,y-.09,y,r%2?'#a77861':'#b78668');
  shelfBeam(f,-f.w/2,board+facing*.008,y,f.w/2,board+facing*.008,y,'#f0c18c',Math.max(1,sz*.014));
  shelfBeam(f,-f.w/2,d+facing*.008,y+.57,f.w/2,d+facing*.008,y+.57,'#7e5a61',Math.max(1,sz*.009));
  if(depth<23){
   for(let slot=1;slot<10;slot++){
    const u=-f.w/2+slot*f.w/10;
    shelfBeam(f,u,d+facing*.05,y+.10,u,d+facing*.05,y+.45,'#695066',Math.max(.6,sz*.006));
   }
   const items=slots[faceId][r];
   for(let k=0;k<PER_ROW;k++){
    const id=items[k];if(!isFigure(id))continue;
    const u=slotCenter(f,facing,k),dd=d+facing*.075;
    const foot=shelfProject(f,u,dd,y+.04),top=shelfProject(f,u,dd,y+.55);
    const width=Math.max(1,.42*FOCAL/Math.max(.4,foot.depth)),height=foot.y-top.y;
    if(height>=2&&width>1&&foot.depth>.3){
     const worldPos=shelfAt(f,u,dd);
     if(!shelfOccludes(worldPos,f.id)){
      sprites.draw(ctx,id,foot.x-width/2,top.y,width,height);
      // Small local collection number; canvas text uses no new sprite assets.
      if(foot.depth<10&&width>7&&height>12){
       ctx.fillStyle='#24182e';ctx.fillRect(foot.x-6,top.y-10,12,9);
       ctx.fillStyle='#fbe4b2';ctx.font='bold 8px monospace';
       ctx.textAlign='center';ctx.fillText(String(setNumber(id)),foot.x,top.y-3);
      }
     }
    }
   }
   if(isPerfectRow(faceId,r)){
    const marker=shelfProject(f,-f.w/2+.12,d+facing*.15,y+.08);
    if(marker.depth>0&&marker.depth<15){
     ctx.fillStyle='#f6cb76';ctx.fillRect(marker.x,marker.y,Math.min(30,FOCAL/marker.depth*.6),2);
    }
   }
  }
 }
 const edge=Math.max(1,sz*.06);
 for(const u of [-f.w/2,f.w/2]){
  shelfBeam(f,u,d,.1,u,d,4.2,u<0?'#d6a978':'#9f726d',edge);
  shelfBeam(f,u,back,.1,u,back,4.2,'#aa805f',edge*.7);
 }
 shelfBeam(f,-f.w/2-.12,d+facing*.06,4.18,f.w/2+.12,d+facing*.06,4.18,'#f6c986',Math.max(1,sz*.035));
 shelfBeam(f,-f.w/2-.12,d+facing*.06,.15,f.w/2+.12,d+facing*.06,.15,'#7f5366',Math.max(1,sz*.04));
 // Highlight exactly ONE cubby of the shelf row being targeted.
 if(focus&&['shelf','shelf-figure'].includes(focus.kind)&&focus.id===faceId){
  const r=focus.row,k=focus.slot,y=.44+r*.72,drawD=d+facing*.17,
   left=slotEdge(f,facing,k),right=slotEdge(f,facing,k+1);
  const plan=focus.kind==='shelf'?placementPlan(faceId,r,k,currentSelected()):{ok:true};
  const tint=plan.ok?'#9effc7':'#ff8f9f',width=Math.max(1.4,FOCAL/Math.max(3,depth)*.016);
  shelfBeam(f,left,drawD,y,right,drawD,y,tint,width);
  shelfBeam(f,left,drawD,y+.68,right,drawD,y+.68,tint,width);
  shelfBeam(f,left,drawD,y,left,drawD,y+.68,tint,width);
  shelfBeam(f,right,drawD,y,right,drawD,y+.68,tint,width);
 }
}
function drawFig(f){
 const d=cameraDepth(f.x,f.z);if(d<.22||d>viewDistance+1.75)return;
 const s=cameraSide(f.x,f.z);if(Math.abs(s)>d*1.25+1)return;
 const p=project(f.x,f.z,.0),ht=.71*FOCAL/d,wid=ht*.80;
 if(wid<1||p.x+wid<0||p.x-wid>W||p.y-ht>H)return;
 // Draw a grounded pixel shadow, then full original sprite cropped from atlas.
 ctx.fillStyle='#1b1424a2';ctx.beginPath();ctx.ellipse(p.x,p.y,Math.max(1,wid*.41),Math.max(1,ht*.065),0,0,Math.PI*2);ctx.fill();
 sprites.draw(ctx,f.id,Math.round(p.x-wid/2),Math.round(p.y-ht),Math.max(1,Math.round(wid)),Math.max(1,Math.round(ht)));
 if(focus&&focus.kind==='figure'&&focus.id===f.id){
  ctx.strokeStyle='#fff3b8';ctx.lineWidth=2;ctx.strokeRect(Math.round(p.x-wid/2)-2,Math.round(p.y-ht)-2,Math.max(4,Math.round(wid)+4),Math.max(4,Math.round(ht)+4));
 }
 // The center-aim system handles all figurine interaction.
}
// At medium range, use the ORIGINAL 32x40 sprite already in memory.
 // New-edition accessories load only when a figure gets close enough to matter.
function drawMediumFig(f){
 const d=cameraDepth(f.x,f.z);
 if(d<midStart-1.6 || d>midDistance+1.75 || !img.complete || !img.naturalWidth)return;
 const p=project(f.x,f.z,0),height=.71*FOCAL/d,width=height*.80;
 if(p.x+width<0||p.x-width>W||p.y-height>H||p.y<0)return;
 const fig=figure(f.id),source=fig.sourceId===undefined?fig:figure(fig.sourceId);
 ctx.drawImage(img,source.atlasX,source.atlasY,32,40,
  Math.round(p.x-width/2),Math.round(p.y-height),Math.max(2,Math.round(width)),Math.max(2,Math.round(height)));
}
// Beyond the medium range, a few colored pixel blocks represent the figure.
 // These are not new images: drawing them costs no texture decode or GPU allocation.
function drawFarFig(f){
 const d=cameraDepth(f.x,f.z);
 if(d<midDistance-1.75||d>farDistance+1.75)return;
 const p=project(f.x,f.z,0),height=Math.max(3,Math.round(.71*FOCAL/d));
 const width=Math.max(2,Math.round(height*.55));
 const x=Math.round(p.x-width/2),y=Math.round(p.y-height);
 if(x>W||x+width<0||y>H||y+height<0)return;
 const fig=figure(f.id),col=DISTANT_COLORS[fig.setId%8];
 // Deliberately retain the familiar dark outline / bright 16-bit silhouette.
 ctx.fillStyle=DARK_PIXEL;ctx.fillRect(x-1,y+Math.round(height*.36),width+2,Math.max(2,Math.round(height*.57)));
 ctx.fillStyle=col;ctx.fillRect(x,y+Math.round(height*.34),width,Math.max(2,Math.round(height*.38)));
 ctx.fillStyle=LIGHT_PIXEL;ctx.fillRect(x+Math.floor(width*.25),y,Math.max(2,Math.ceil(width*.5)),Math.max(2,Math.round(height*.31)));
}

// Stable slot allocation: previously visible figures keep their draw slots
// until they genuinely leave the viewing range. New slots fill with a fixed
// per-figure ID hash, round-robin across distance zones. No depth re-rolling.
function stableSelect(pool,previous,limit,bands,low,high,incoming){
 const kept=[],fresh=Array.from({length:bands},()=>[]);
 const unique=new Set();
 for(const item of pool){
  const id=item.piece.id;
  if(unique.has(id))continue;
  unique.add(id);
  if(previous.has(id)||incoming.has(id))kept.push(item);
  else{
   const band=Math.max(0,Math.min(bands-1,Math.floor((item.depth-low)/Math.max(.01,high-low)*bands)));
   fresh[band].push(item);
  }
 }
 kept.sort((a,b)=>{
  const ai=incoming.has(a.piece.id)?0:1,bi=incoming.has(b.piece.id)?0:1;
  if(ai!==bi)return ai-bi;
  return stableHash(a.piece.id)-stableHash(b.piece.id);
 });
 const chosen=kept.slice(0,limit);
 for(const arr of fresh)arr.sort((a,b)=>stableHash(a.piece.id)-stableHash(b.piece.id));
 const ix=Array(bands).fill(0);
 while(chosen.length<limit){
  let advanced=false;
  for(let k=0;k<bands && chosen.length<limit;k++){
   if(ix[k]>=fresh[k].length)continue;
   chosen.push(fresh[k][ix[k]++]);advanced=true;
  }
  if(!advanced)break;
 }
 return chosen;
}
function drawRoom(){
 updateVisibleSlope();
 ctx.fillStyle='#252137';ctx.fillRect(0,0,W,H);
 // Flat posterized ceiling tiles and warmly glowing neon ceiling bulbs.
 for(let y=0;y<Math.min(H,cameraHorizon());y+=18){ctx.fillStyle=y%36===0?'#252036':'#29233b';ctx.fillRect(0,y,W,1)}
 for(let i=0;i<12;i++){
  const sx=4+i*6,sz=6+(i%3)*24;
  const p=project(sx,sz,4.72);
  if(p.depth>0&&p.x>-30&&p.x<W+30&&p.y>-20&&p.y<200){
   const rad=clamp(90/p.depth,2,12);
   ctx.fillStyle='#aa8f92';ctx.fillRect(p.x-rad*2,p.y-rad*.6,rad*4,rad*1.2);
   ctx.fillStyle='#ffe1a0';ctx.fillRect(p.x-rad*1.5,p.y-rad*.45,rad*3,rad*.9);
  }
 }
 drawFloor();
 // Entity drawing is far-to-near to correctly occlude figurines behind racks.
 let entities=[];
 for(let n=0;n<4;n++){
  const wallSegments=7;for(let k=0;k<wallSegments;k++){
   let x1,z1,x2,z2;
   if(n===0){x1=1+k*68/7;x2=1+(k+1)*68/7;z1=z2=1;}
   if(n===1){x1=1+k*68/7;x2=1+(k+1)*68/7;z1=z2=73;}
   if(n===2){z1=1+k*72/7;z2=1+(k+1)*72/7;x1=x2=1;}
   if(n===3){z1=1+k*72/7;z2=1+(k+1)*72/7;x1=x2=69;}
   const depth=cameraDepth((x1+x2)/2,(z1+z2)/2);
   if(depth>-7&&depth<100)entities.push({type:'wall',depth,wall:{x1,z1,x2,z2,n:n*7+k}});
  }
 }
 for(const f of fixtures){
  const d=cameraDepth(f.x,f.z);
  if(d>-4&&d<32&&Math.abs(cameraSide(f.x,f.z))<Math.abs(d)*1.08+f.w/2+4)
   entities.push({type:'shelf',depth:d,rack:f});
 }
 // A 1.75-unit overlap avoids figures changing draw tier at a single step.
 // Keep the same ID's previous LOD when possible; only new items enter via
 // static ID hashing rather than nearest-first sorting.
 const viewPadding=1.75;
 const visible=nearbyFloor(viewDistance+viewPadding,true)
   .filter(f=>!shelfOccludes(f))
   .map(f=>({type:'fig',depth:cameraDepth(f.x,f.z),piece:f}))
   .filter(e=>e.depth<=viewDistance||previousNear.has(e.piece.id));
 // Nearby figures are always represented, even when a dense aisle has
 // already filled the longer-distance drawing budget.
 const close=visible.filter(e=>e.depth<=6.5)
   .sort((a,b)=>stableHash(a.piece.id)-stableHash(b.piece.id))
   .slice(0,24);
 const closeIDs=new Set(close.map(e=>e.piece.id));
 const remaining=stableSelect(visible.filter(e=>!closeIDs.has(e.piece.id)),
   previousNear,Math.max(0,renderLimit-close.length),3,6.5,viewDistance,new Set());
 const nearChosen=close.concat(remaining);
 const nearIds=new Set(nearChosen.map(e=>e.piece.id));
 for(const item of nearChosen)entities.push(item);
 renderedFigures=nearChosen.length;
 retainedNear=nearChosen.reduce((n,item)=>n+(previousNear.has(item.piece.id)?1:0),0);

 // The 7-per-cell representatives are deterministic and unchanged while
 // moving. Previously drawn IDs are carried into adjoining tiers even if
 // they weren't among those original 7 representatives.
 const candidates=new Map();
 for(const item of distantFloor(farDistance+viewPadding)){
  if(!nearIds.has(item.piece.id)&&!shelfOccludes(item.piece))candidates.set(item.piece.id,item);
 }
 const previousAll=new Set([...previousNear,...previousMid,...previousFar]);
 for(const id of previousAll){
  if(nearIds.has(id)||candidates.has(id))continue;
  const f=floor[id];if(!f||!f.onFloor||shelfOccludes(f))continue;
  const depth=cameraDepth(f.x,f.z),side=cameraSide(f.x,f.z);
  if(depth<midStart-1.6||depth>farDistance+viewPadding||Math.abs(side)>depth*visibleSlope+1.1)continue;
  candidates.set(id,{type:'mid',depth,piece:f});
 }
 const midPool=[],farPool=[],incomingMid=new Set(),incomingFar=new Set();
 for(const item of candidates.values()){
  const id=item.piece.id,d=item.depth;
  // Two-way hysteresis: a previously selected medium/far figure doesn't
  // switch just because the camera moved across one exact distance value.
  const remainFar=previousFar.has(id)&&d>midDistance-1.75;
  const remainMid=previousMid.has(id)&&d<midDistance+1.75;
  const useFar=remainFar?true:remainMid?false:d>midDistance;
  if(useFar){
   if(d<=farDistance || previousFar.has(id)){
    item.type='far';farPool.push(item);
    if(previousMid.has(id))incomingFar.add(id);
   }
  }else if(d>=midStart-1.6&&d<=midDistance+viewPadding){
   item.type='mid';midPool.push(item);
   if(previousNear.has(id))incomingMid.add(id);
  }
 }
 const medium=stableSelect(midPool,previousMid,midLimit,3,midStart,midDistance,incomingMid);
 const midIds=new Set(medium.map(e=>e.piece.id));
 const far=stableSelect(farPool,previousFar,farLimit,2,midDistance,farDistance,incomingFar)
   .filter(e=>!midIds.has(e.piece.id));
 const farIds=new Set(far.map(e=>e.piece.id));
 for(const item of medium)entities.push(item);
 for(const item of far)entities.push(item);
 midRendered=medium.length;farRendered=far.length;
 retainedMid=medium.reduce((n,e)=>n+(previousMid.has(e.piece.id)?1:0),0);
 retainedFar=far.reduce((n,e)=>n+(previousFar.has(e.piece.id)?1:0),0);
 previousNear=nearIds;previousMid=midIds;previousFar=farIds;
 if(focus&&focus.kind==='figure'&&!entities.some(e=>e.type==='fig'&&e.piece.id===focus.id)){
  const f=floor[focus.id];if(f&&f.onFloor&&!shelfOccludes(f))entities.push({type:'fig',depth:cameraDepth(f.x,f.z),piece:f});
 }
 entities.sort((a,b)=>b.depth-a.depth);
 for(const e of entities){if(e.type==='wall')drawWall(e.wall);else if(e.type==='shelf')drawShelf(e.rack);else if(e.type==='mid')drawMediumFig(e.piece);else if(e.type==='far')drawFarFig(e.piece);else drawFig(e.piece);}
 // Crisp screen-space scanline / colorband effect, sparse enough for mobile.
 ctx.fillStyle='#0a071210';for(let y=2;y<H;y+=4)ctx.fillRect(0,y,W,1);
}
function move(dt){
 if(modal||!playing)return;
 let f=0,s=0;
 if(keys.has('KeyW')||keys.has('ArrowUp'))f+=1;
 if(keys.has('KeyS')||keys.has('ArrowDown'))f-=1;
 if(keys.has('KeyD'))s+=1;
 if(keys.has('KeyA'))s-=1;
 f+=-touch.axisY;s+=touch.axisX;
 const len=Math.hypot(f,s);if(len>1){f/=len;s/=len}
 if(keys.has('ArrowLeft'))player.yaw-=dt*1.6;
 if(keys.has('ArrowRight'))player.yaw+=dt*1.6;
 const speed=shift?10.2:6.3;
 const dir=forward(),right={x:Math.cos(player.yaw),z:Math.sin(player.yaw)};
 const dx=(dir.x*f+right.x*s)*dt*speed,dz=(dir.z*f+right.z*s)*dt*speed;
 if(dx||dz){if(!blocked(player.x+dx,player.z,.32))player.x+=dx;if(!blocked(player.x,player.z+dz,.32))player.z+=dz;}
}
// Movement runs on animation ticks; expensive room rasterization is budgeted separately.
let frameNum=0;
function frame(now){
 const dt=Math.min(Math.max(0,(now-lastFrame)/1000),.055);lastFrame=now;
 if(playing){
  move(dt);
  if(!modal && now-lastDrawMs>=drawInterval){
   lastDrawMs=now;
   const begin=performance.now();
   prepareOcclusion();sprites.frameStart();updateFocus();drawRoom();renderFrames++;
   lastRuntimeMs=performance.now()-begin;
   // Safety valve: three extremely costly renders trigger the light recovery build.
   if(lastRuntimeMs>115)extremeFrames++;else extremeFrames=Math.max(0,extremeFrames-1);
   if(extremeFrames>=3){
    playing=false;save();
    try{window.location.replace('./baseline-v0.5.0.html?recovery=slot-perf')}catch(_){}
    return;
   }
   if(lastRuntimeMs>43)slowFrames=Math.min(16,slowFrames+2);
   else slowFrames=Math.max(0,slowFrames-1);
   if(slowFrames>=8){renderLimit=42;viewDistance=15;midLimit=12;midDistance=20;farLimit=20;farDistance=27;drawInterval=1000/20;}
   else if(slowFrames===0){renderLimit=70;viewDistance=19;midLimit=30;midDistance=29;farLimit=65;farDistance=39;drawInterval=1000/24;}
  }
 }
 if(++frameNum%600===0&&playing)save();
 requestAnimationFrame(frame);
}
// Desktop WASD, mouse drag (no pointer lock required); click/tap on rendered object.
window.addEventListener('keydown',e=>{
 if(e.code==='Escape'){if(modal)closeDrawer();else if($('confirm').hidden===false)$('confirm').hidden=true;return}
 if(e.target.tagName==='INPUT')return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Tab'].includes(e.code))e.preventDefault();
 keys.add(e.code);if(e.code==='ShiftLeft'||e.code==='ShiftRight')shift=true;
 if(e.repeat)return;
 if(e.code==='KeyE'||e.code==='Space')interact();
 if(e.code==='Tab')modal?closeDrawer():openDrawer('album');
 if(e.code==='KeyI')modal?closeDrawer():openDrawer('album');
});
window.addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='ShiftLeft'||e.code==='ShiftRight')shift=false});
let dragging=false,lastX=0,lastY=0,downX=0,downY=0,dragSum=0;
canvas.addEventListener('pointerdown',e=>{
 if(!playing||modal)return;
 if(e.pointerType==='touch'&&e.clientX<window.innerWidth*.27&&e.clientY>window.innerHeight*.60)return;
 dragging=true;lastX=downX=e.clientX;lastY=downY=e.clientY;dragSum=0;
 try{canvas.setPointerCapture(e.pointerId)}catch(_){}
});
canvas.addEventListener('pointermove',e=>{
 if(!dragging||modal||!playing)return;
 const dx=e.clientX-lastX,dy=e.clientY-lastY;
 lastX=e.clientX;lastY=e.clientY;dragSum+=Math.hypot(dx,dy);
 player.yaw+=dx*(2.5/Math.max(300,window.innerWidth));
 player.pitch=clamp((player.pitch||0)+dy*(2.15/Math.max(500,window.innerHeight)),-.95,.95);
});
canvas.addEventListener('pointerup',e=>{
 if(!dragging)return;dragging=false;
 // A quick tap on the view interacts with the CENTER RETICLE, never
 // with a different off-center object obscured by the player's finger.
 if(dragSum<10&&Math.abs(e.clientY-downY)<12&&playing&&!modal)interact();
});
canvas.addEventListener('pointercancel',()=>dragging=false);

const joy=$('joystick'),stick=$('stick');
joy.addEventListener('pointerdown',e=>{if(modal||!playing)return;e.preventDefault();touch.joyId=e.pointerId;joy.setPointerCapture(e.pointerId);joyMove(e)});
joy.addEventListener('pointermove',e=>{if(e.pointerId!==touch.joyId)return;joyMove(e)});
function joyMove(e){const rect=joy.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
 const max=rect.width*.34,dx=e.clientX-cx,dy=e.clientY-cy,len=Math.hypot(dx,dy),m=Math.min(max,len),x=len?dx/len*m:0,y=len?dy/len*m:0;
 touch.axisX=x/max;touch.axisY=y/max;
 stick.style.transform=`translate(${x}px,${y}px)`;
}
function joyEnd(e){if(e.pointerId!==touch.joyId)return;touch.axisX=touch.axisY=0;touch.joyId=null;stick.style.transform='translate(0,0)'}
joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);
$('actionBtn').addEventListener('click',()=>{if(playing)interact()});
$('putDownBtn').onclick=()=>tote.length?putDown():undoLastPlacement();
$('albumBtn').onclick=()=>modal?closeDrawer():openDrawer('album');
$('closeDrawer').onclick=closeDrawer;$('drawerShade').onclick=closeDrawer;
$('cancelReset').onclick=()=>$('confirm').hidden=true;
$('doReset').onclick=()=>{localStorage.removeItem(STORE_KEY);resetState();$('confirm').hidden=true;closeDrawer();notify('Store reset: 3,000 figures scattered.');};
$('startBtn').onclick=()=>{
 $('screen').classList.remove('shown');playing=true;save();
 if(migratedCarryCount)notify(migratedCarryCount+' EXTRA FIGURES RETURNED TO THE FLOOR — CARRY ONE AT A TIME');
 else notify('AIM AT A SLOT · PLACE, LIFT OR SWAP · PERFECT ORDER IS 1–10');
};
// Snapshot integrity API for QA and external automation.
window.BitBazaarQA={
 stats:()=>({floor:floor.filter(f=>f.onFloor).length,tote:tote.length,carrying:tote[0]??null,droppedPositions:groundPositions.size,migratedCarryCount,placed:rows.flat(2).length,completedRows:completedRowCount(),fullUnsortedRows:rows.flat(1).filter((r,i)=>r.length===PER_ROW&&!isPerfectRow(Math.floor(i/ROWS),i%ROWS)).length,capacity:NUM_RACKS*ROWS*PER_ROW,fixtures:fixtures.length,floorFixtures:NUM_FLOOR,wallFixtures:NUM_WALL,displayFaces:shelves.length,distinctAssets:DB.figures.length,renderedFigures,midRendered,farRendered,retainedNear,retainedMid,retainedFar,occlusionChecks,occludedCandidates,visibleSlope,midLimit,farLimit,midDistance,farDistance,nearbyExamined,farCandidatesExamined,renderFrames,renderLimit,viewDistance,drawInterval:Math.round(drawInterval),lastRuntimeMs,extremeFrames,sprites:sprites.stats()}),
 pick:(id)=>{if(!Number.isInteger(id)||id<0||id>=DB.figures.length||tote.length||!floor[id].onFloor)return false;grabFig(id);return tote[0]===id},
 place:(id,shelf,row,slot)=>{if(!isFigure(id))return false;if(!tote.length)grabFig(id);if(tote[0]!==id)return false;return placeDirect(shelf,row,slot)},
 directPlace:(shelf,row,slot)=>placeDirect(shelf,row,slot),putDown,undoLastPlacement,
 takeFromSlot:(shelf,row,slot)=>grabShelfFig(shelf,row,slot),
 rowContents:(shelf,row)=>[...(rows[shelf]?.[row]||[])],
 slotContents:(shelf,row)=>[...(slots[shelf]?.[row]||[])],
 rowStatus:(shelf,row)=>rowStatus(shelf,row),
 perfect:(shelf,row)=>isPerfectRow(shelf,row),
 figurePosition:id=>floor[id]?{x:floor[id].x,z:floor[id].z,onFloor:floor[id].onFloor}:null,
 reset:resetState, get player(){return player}, shelves, dataset:DB,
 target:()=>{prepareOcclusion();return findFocus()},
 horizon:()=>cameraHorizon(),aimPoint:()=>({x:AIM_X,y:AIM_Y}),
 visible:()=>({near:[...previousNear],mid:[...previousMid],far:[...previousFar]}),
 occludedAt:(x,z,excludeFixtureId=-1)=>shelfOccludes({x,z},excludeFixtureId),
 figurePosition:id=>floor[id]?{x:floor[id].x,z:floor[id].z,onFloor:floor[id].onFloor}:null,
 refreshOcclusion:prepareOcclusion
};
// The previous 4,800px-high atlas and its 2,000 synchronous pixel conversions are removed.

function makeFixtures(){
 const fixtures=[],shelves=[];
 for(let r=0;r<5;r++)for(let a=0;a<4;a++){
  const id=r*4+a,aisle=String.fromCharCode(65+a);
  const f={id,kind:'floor',x:11+a*16,z:11+r*12,w:7.7,depth:1.72,nx:0,nz:1,ux:1,uz:0,aisle};
  fixtures.push(f);
  for(let side=0;side<2;side++)shelves.push({
   id:id*2+side,fixture:f,face:side===0?1:-1,
   name:'AISLE '+aisle+' · '+(side?'REVERSE':'FRONT')+' DISPLAY',
   aisle
  });
 }
 const wallSpots=[];
 for(const x of [9,22,35,48,61])wallSpots.push({x,z:2.5,nx:0,nz:1,ux:1,uz:0,section:'NORTH'});
 for(const x of [9,22,35,48,61])wallSpots.push({x,z:71.5,nx:0,nz:-1,ux:-1,uz:0,section:'SOUTH'});
 for(const z of [10,23,36,49,62])wallSpots.push({x:2.5,z,nx:1,nz:0,ux:0,uz:-1,section:'WEST'});
 for(const z of [10,23,36,49,62])wallSpots.push({x:67.5,z,nx:-1,nz:0,ux:0,uz:1,section:'EAST'});
 for(let i=0;i<wallSpots.length;i++){
  const f={id:20+i,kind:'wall',wallIndex:i,w:10.5,depth:.85,aisle:'WALL',...wallSpots[i]};
  fixtures.push(f);
  shelves.push({id:40+i,fixture:f,face:1,name:f.section+' WALL DISPLAY',aisle:'WALL'});
 }
 return {fixtures,shelves};
}

restore();requestAnimationFrame(frame);
})();