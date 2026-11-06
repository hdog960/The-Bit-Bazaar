/* Bit Bazaar v0.62.0 LOW FX: in-store hunt tracker with lighter rendering and identical save format. */
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
const GLASSES=window.BIT_BAZAAR_GLASSES;
const HONORS=window.BIT_BAZAAR_HONORS;
const JOURNEYS=window.BIT_BAZAAR_JOURNEYS;
const ACHIEVEMENTS=window.BIT_BAZAAR_ACHIEVEMENTS;
const FINALE=window.BIT_BAZAAR_FINALE;
const POSTGAME=window.BIT_BAZAAR_POSTGAME;
const SHOWCASE=window.BIT_BAZAAR_SHOWCASE;
const POSTCARDS=window.BIT_BAZAAR_POSTCARDS;
const VIS=window.BIT_BAZAAR_VISIBILITY;
if(!VIS)throw Error('Physical shelf visibility module unavailable');
if(!POSTCARDS)throw Error('Collector postcard compositor unavailable');
if(!SHOWCASE)throw Error('Showcase / Photo Mode module unavailable');
if(!POSTGAME)throw Error('Collector’s Encore module unavailable');
if(!FINALE)throw Error('Collector’s Monument finale module unavailable');
if(!ACHIEVEMENTS)throw Error('Achievement catalog module unavailable');
if(!JOURNEYS)throw Error('Three Journeys module unavailable');
if(!HONORS)throw Error('Lifetime honors module unavailable');
if(!GLASSES)throw Error('Phase 5 glasses module unavailable');

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
  // Clamp the centre projection to the CAMERA→FIGURE segment. The
  // rack's centre can be behind the target while its near edge still
  // physically intersects a visible edge of a sprite.
  const t=clamp((b.vx*dx+b.vz*dz)/ray2,0,1);
  const px=b.vx-t*dx,pz=b.vz-t*dz;
  if(px*px+pz*pz>b.radius2)continue;
  const du=dx*b.ux+dz*b.uz,dn=dx*b.nx+dz*b.nz;
  if(VIS.slabSegment(b.camU,b.camN,du,dn,b.halfU,b.halfN)){
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
// Three small permanent restoration tasks per shelf face; every figure ID
// is part of the original 3,000-figure dataset, never spawned or duplicated.
const CLEAN_STEPS=['WIPE DUST','REMOVE COBWEBS','CLEAR PACKAGING'];
const HIDDEN_FACES=[1,4,7,10,13,16,19,22,25,28,31,34,37,40,43,46,51,56];
const HIDDEN_IDS=HIDDEN_FACES.map((_,i)=>(29+i*157)%3000);
const HIDDEN_SET=new Set(HIDDEN_IDS);
const SECRET_BY_FACE=new Map(HIDDEN_FACES.map((face,i)=>[face,HIDDEN_IDS[i]]));
let faceCleaning=Array(NUM_RACKS).fill(0),hiddenRevealed=new Set(),newlyRevealed=null,hiddenRevealMoment=0;
// Permanent environmental floor cleanup. The 45 patches are not figurines.
const AMBIENT_KINDS=['PAPER','CARTON','SCUFF'];
const AMBIENT_ACTIONS=[
 ['GATHER SCRAPS'],['FLATTEN CARDBOARD','REMOVE PACKING'],
 ['SWEEP GRIT','SCRUB STAIN','POLISH FLOOR']
];
function buildAmbientMess(){
 const out=[],random=srand(20261104);
 for(let row=0;row<9;row++)for(let col=0;col<5;col++){
  let x=6+col*14+(random()-.5)*2.2,z=6+row*7.5+(random()-.5)*2.2;
  if(blocked(x,z,1)){
   const ox=x,oz=z;
   const offsets=[[3.4,0],[-3.4,0],[0,3.4],[0,-3.4],[3.4,3.4],[-3.4,-3.4],
    [4.5,0],[-4.5,0],[0,4.5],[0,-4.5]];
   for(const [dx,dz] of offsets){
    if(!blocked(ox+dx,oz+dz,1)){x=ox+dx;z=oz+dz;break;}
   }
  }
  const id=row*5+col,kind=(id*7+row*2)%3;
  out.push({id,kind,x,z,angle:random()*Math.PI*2});
 }
 return out;
}
let floorCleaning=[],lastAmbientClean=null;
let lifetimePerfect=new Set(),inspectionReturn='',inspectedId=null;
let glassesEquipped=false,glassesTarget=null;
let honorTrim=0,honorWorld=[],honorPlates=false,honorSeal=false;
let lastJourneys=null;
let achievementData=ACHIEVEMENTS.makeData(),achievementPrior=null,achievementFilter='all';
let finaleUnlocked=false,finaleViewed=false,finaleChapter=0;
let encoreExpanded=false,encorePage=0;
let showcaseActive=false,showcaseOverhead=false,showcaseReturnPose=null,
 showcaseAim={yaw:0,pitch:0},showcaseBusy=false,postcardStyle='plain';
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
let renderLimit=42,viewDistance=15,midStart=9,midLimit=12,midDistance=20,farLimit=20,farDistance=27,renderFrames=0,lastDrawMs=-1e6,drawInterval=1000/20,slowFrames=0,extremeFrames=0,lastRuntimeMs=0,nearbyExamined=0,farCandidatesExamined=0,renderedFigures=0,midRendered=0,farRendered=0;
const cellKey=(x,z)=>Math.floor(x/CELL)+','+Math.floor(z/CELL);
let modal='', focus=null, playing=false, shift=false, activeSet=0, albumQuery='';
let albumFilter='all',albumSort='id',albumPage=0;
const ALBUM_PAGE_SIZE=48;
let seenFigures=new Set(),pinnedSets=new Set(),albumReturnScroll=0,trackedSetId=null,huntExpanded=false,huntFocusedNum=null;
let mapSelectedFixtureId=null,mapSelectedFaceId=null,mapHighlightedSet=null,mapZoom=false,mapPanTarget=null,cleanFxTimer=0,restoreBannerTimer=0;
let lastSave=0,lastFrame=performance.now(), toastTimer=0;
const keys=new Set(), touch={lookId:null,lastX:0,lastY:0,joyId:null,axisX:0,axisY:0};
let floorBuffer=ctx.createImageData(W,H);
let aimKind='none';
const allUsed=()=>new Set([...tote,...rows.flat(2)]);
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const sqr=n=>n*n;
function srand(seed){ let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;}; }
const rng=srand(20261102);
const ambientMess=buildAmbientMess();
floorCleaning=Array(ambientMess.length).fill(0);
function setupFloor(){
 floor=[];floorGrid.clear();distantGrid.clear();previousNear.clear();previousMid.clear();previousFar.clear();
 const used=allUsed(),random=srand(20261102);
 for(let i=0;i<DB.figures.length;i++){
  let x,z,tries=0;
  do{x=2.5+random()*65;z=3+random()*67;tries++;}
  while(tries<32 && (blocked(x,z,.26)||(sqr(x-35)+sqr(z-68)<5)));
  const custom=groundPositions.get(i);
  if(custom && !blocked(custom.x,custom.z,.23)){x=custom.x;z=custom.z;}
  const hidden=HIDDEN_SET.has(i)&&!hiddenRevealed.has(i);
   const f={id:i,x,z,onFloor:!used.has(i)&&!hidden,hidden};
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
// Hidden discoveries happen at most 18 times per save, never in a render
// loop. Reindex just the old/new local spatial cells after a figure pops out.
function updateDistantSample(key,required=null){
 const bucket=floorGrid.get(key)||[],choices=[];
 const count=Math.min(7,bucket.length),step=count?bucket.length/count:0;
 for(let i=0;i<count;i++)choices.push(bucket[Math.floor(i*step)]);
 if(required&&!choices.includes(required)){
  if(choices.length<7)choices.push(required);else choices[choices.length-1]=required;
 }
 distantGrid.set(key,choices);
}
function moveFigureToFloor(id,x,z){
 const fig=floor[id];if(!fig)return false;
 const previous=cellKey(fig.x,fig.z),next=cellKey(x,z);
 const bucket=floorGrid.get(previous);
 if(bucket){const ix=bucket.indexOf(fig);if(ix>=0)bucket.splice(ix,1);}
 fig.x=x;fig.z=z;fig.onFloor=true;fig.hidden=false;
 const group=floorGrid.get(next)||[];
 if(!floorGrid.has(next))floorGrid.set(next,group);
 group.push(fig);
 updateDistantSample(previous);
 updateDistantSample(next,fig);
 groundPositions.set(id,{x,z});
 return true;
}
function crowdedAt(x,z){
 for(let gx=Math.floor(x/CELL)-1;gx<=Math.floor(x/CELL)+1;gx++)
  for(let gz=Math.floor(z/CELL)-1;gz<=Math.floor(z/CELL)+1;gz++){
   const near=floorGrid.get(gx+','+gz)||[];
   for(const p of near)if(p.onFloor&&(p.x-x)**2+(p.z-z)**2<.20)return true;
  }
 return false;
}
function revealHiddenAtFace(faceId){
 const id=SECRET_BY_FACE.get(faceId);
 if(id===undefined||hiddenRevealed.has(id))return null;
 const shelf=shelves[faceId],f=shelf.fixture;
 let point=null,backup=null;
 // Seek a spot actually in front of the cleaned display, not some random
 // location elsewhere in the store. Placement uses no new figurine IDs.
 for(const distance of [1.1,1.4,1.75,2.2]){
  if(point)break;
  for(const shift of [0,-.7,.7,-1.5,1.5,-2.3,2.3]){
   const x=f.x+f.nx*shelf.face*(f.depth/2+distance)+f.ux*shift,
    z=f.z+f.nz*shelf.face*(f.depth/2+distance)+f.uz*shift;
   if(blocked(x,z,.35))continue;
   backup??={x,z};
   if(!crowdedAt(x,z)){point={x,z};break;}
  }
 }
 // An extreme clutter density cannot prevent a collectible being revealed.
 const where=point||backup||{x:floor[id].x,z:floor[id].z};
 hiddenRevealed.add(id);newlyRevealed=id;hiddenRevealMoment=performance.now();
 moveFigureToFloor(id,where.x,where.z);
 return id;
}
// Tactile but lightweight: show one CSS-only brush effect per action.
function showCleanEffect(action){
 const burst=$('cleanBurst');
 $('cleanBurstLabel').textContent=action;
 burst.classList.remove('visible');
 void burst.offsetWidth;
 burst.classList.add('visible');
 clearTimeout(cleanFxTimer);
 cleanFxTimer=setTimeout(()=>burst.classList.remove('visible'),760);
}
function showRestorationMilestone(title,caption){
 $('restoreBannerTitle').textContent=title;
 $('restoreBannerCaption').textContent=caption;
 const banner=$('restoreBanner');
 banner.classList.remove('show');
 void banner.offsetWidth;
 banner.classList.add('show');
 clearTimeout(restoreBannerTimer);
 restoreBannerTimer=setTimeout(()=>banner.classList.remove('show'),3300);
}
function checkRestorationMilestone(kind){
 if(kind==='shelf'&&cleanedFaceCount()===60)
  showRestorationMilestone('ALL SHELVES RESTORED',
   floorCleanedCount()===45?'THE ENTIRE SHOP IS SPOTLESS':'EVERY DISPLAY IS READY FOR YOUR COLLECTION');
 else if(kind==='floor'&&floorCleanedCount()===45)
  showRestorationMilestone('EVERY FLOOR MESS CLEARED',
   cleanedFaceCount()===60?'THE ENTIRE SHOP IS SPOTLESS':'THE SHOP FLOOR IS CLEAN');
}

function cleanedFaceCount(){return faceCleaning.reduce((n,p)=>n+(p===3?1:0),0)}
function cleanShelfFace(faceId){
 if(!Number.isInteger(faceId)||faceId<0||faceId>=NUM_RACKS)return false;
 if(tote.length){notify('EMPTY YOUR HANDS BEFORE CLEANING','bad');return false;}
 const level=faceCleaning[faceId];
 if(level>=CLEAN_STEPS.length){notify('THIS DISPLAY IS ALREADY RESTORED');return false;}
 faceCleaning[faceId]=level+1;
 showCleanEffect(CLEAN_STEPS[level]);
 const found=faceCleaning[faceId]===3?revealHiddenAtFace(faceId):null;
 if(found!==null){
  notify('✦ HIDDEN FIGURINE FOUND! #'+setNumber(found)+'/10 · '+DB.sets[figure(found).setId].name);
 }else if(faceCleaning[faceId]===3){
  notify('★ DISPLAY RESTORED · '+cleanedFaceCount()+'/60 CLEAN · READY FOR FIGURINES');
 }else{
  notify((level===0?'DUST CLEARED':level===1?'COBWEBS REMOVED':'PACKAGING CLEARED')+' · '+(3-faceCleaning[faceId])+' TASK(S) LEFT');
 }
 save();stats();if(faceCleaning[faceId]===3)checkRestorationMilestone('shelf');return true;
}
function faceTask(faceId){
 return faceCleaning[faceId]<3?CLEAN_STEPS[faceCleaning[faceId]]:'RESTORED';
}

// Each environmental mess is a physical, fixed position in the store.
// 1–3 interactions depending on type; no timers, respawns, or currency.
function ambientCompleted(m){
 return floorCleaning[m.id]>=AMBIENT_ACTIONS[m.kind].length;
}
function floorCleanedCount(){
 let n=0;for(const m of ambientMess)if(ambientCompleted(m))n++;
 return n;
}
function floorTask(id){
 const m=ambientMess[id];
 return m?AMBIENT_ACTIONS[m.kind][floorCleaning[id]]||'CLEAN':'';
}
function cleanAmbient(id){
 if(!Number.isInteger(id)||id<0||id>=ambientMess.length)return false;
 if(tote.length){notify('PUT DOWN YOUR FIGURINE BEFORE CLEANING','bad');return false;}
 const m=ambientMess[id],actions=AMBIENT_ACTIONS[m.kind],step=floorCleaning[id];
 if(step>=actions.length)return false;
 if(Math.hypot(player.x-m.x,player.z-m.z)>5.3){
  notify('MOVE CLOSER TO THE MESS TO CLEAN IT','bad');return false;
 }
 floorCleaning[id]=step+1;
 lastAmbientClean={id,at:performance.now()};
 showCleanEffect(actions[step]);
 if(floorCleaning[id]===actions.length){
  notify('★ '+(m.kind===0?'TRASH GATHERED':m.kind===1?'PACKAGING REMOVED':'FLOOR POLISHED')+
    ' · '+floorCleanedCount()+'/'+ambientMess.length+' FLOOR MESSES CLEAN');
 }else{
  notify('✓ '+actions[step]+' · '+(actions.length-floorCleaning[id])+' STEP(S) REMAIN');
 }
 save();stats();if(floorCleaning[id]===actions.length)checkRestorationMilestone('floor');return true;
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


const DECOR_RUNTIME=window.BIT_BAZAAR_PHASE4;
if(!DECOR_RUNTIME)throw Error('Sacrifice Catalog runtime could not load');
const decorEngine=DECOR_RUNTIME.create({
 isPerfect:(face,row)=>isPerfectRow(face,row),
 rowSlots:(face,row)=>slots[face][row],shelf:face=>shelves[face],
 blocked,crowded:crowdedAt,snapshot:()=>saveData(),
 clearRow:(face,row)=>{slots[face][row].fill(null);syncRow(face,row);},
 scatter:(id,x,z)=>moveFigureToFloor(id,x,z),
 clearUndo:()=>{lastPlacement=null;slotPulse=null},
 refresh:()=>stats(),notify:(message,bad)=>notify(message,bad?'bad':'normal'),
 save:()=>save(),perfectCount:()=>completedRowCount(),
 isOpen:()=>modal==='decor',body:()=>$('drawerBody'),
 locateShelf:face=>{openDrawer('map');return mapJumpToFace(face)},
 openDecorMap:kind=>{decorMap.mode(kind);openDrawer('map')},
 openDecorMove:id=>{
  // Direct owned catalog shortcut; no save or shelf sacrifice occurs here.
  if(!decorMap.beginMove(id))return false;
  openDrawer('map');return true;
 },
 enterPreview:()=>{closeDrawer();$('roomPreviewHud').hidden=false;$('game').classList.add('room-preview-active');},
 exitPreview:()=>{$('roomPreviewHud').hidden=true;$('game').classList.remove('room-preview-active');openDrawer('decor');},
 isPreviewOpen:()=>!$('roomPreviewHud').hidden
});
const decorMap=window.BIT_BAZAAR_DECOR_MAP.create({
 catalog:window.BIT_BAZAAR_DECOR,
 getPlaced:()=>decorEngine.placedSlots(),
 setDestination:(kind,id)=>decorEngine.selectSite(kind,id),
 returnToCatalog:()=>openDrawer('decor'),
 moveOwned:(id,slot)=>decorEngine.move(id,slot),
 previewOwned:(id,slot)=>decorEngine.previewMove(id,slot),
 closePlanner:()=>closeDrawer()
});
// The physical shelf occlusion rule is shared by world drawing and reticle
// inspection, without ever replacing miniature pickup/cleaning priority.
const decorSight=window.BIT_BAZAAR_DECOR_VISIBILITY.create({
 catalog:window.BIT_BAZAAR_DECOR,
 getCamera:()=>player,
 isBlocked:(point,exclude)=>shelfOccludes(point,exclude)
});
// World decoration interactions are separate from the figure pickup reticle.
// Fixed shelf faces keep their existing cleaning, sorting and pickup controls.
const worldDecor=window.BIT_BAZAAR_DECOR_WORLD.create({
 catalog:window.BIT_BAZAAR_DECOR,
 getPlaced:()=>decorEngine.placedSlots(),
 position:(id,slot)=>decorEngine.workshop.pos(id,slot),
 rotation:id=>decorEngine.workshop.rotation(id),
 project:(x,z,h)=>project(x,z,h),
 camera:()=>player,
 canSee:(id,site,pos,hit)=>decorSight.exposed(id,site.id,pos,
  hit?.u??.5,player.yaw,decorEngine.workshop.rotation(id))
});
let worldArtTarget=null;
function openArtFromWorld(){
 if(!worldArtTarget||!playing||modal||!$('roomPreviewHud').hidden)return false;
 const id=worldArtTarget.itemId;
 if(!decorEngine.focusOwned(id))return false;
 worldArtTarget=null;
 $('worldArtFocus').hidden=true;
 openDrawer('decor');
 return true;
}

function moveArtFromWorld(){
 if(!worldArtTarget||!playing||modal||!$('roomPreviewHud').hidden)return false;
 if(!decorMap.beginMove(worldArtTarget.itemId))return false;
 worldArtTarget=null;
 $('worldArtFocus').hidden=true;
 openDrawer('map');
 return true;
}
let previewHUDKey='';
function updateDecorPreviewHud(){
 const preview=decorEngine.previewState(),hud=$('decorPreviewHud');
 hud.hidden=!preview;
 if(!preview){previewHUDKey='';return;}
 const options=decorEngine.previewOptions();
 const key=preview.id+'@'+preview.slot+':'+options.total;
 // Updating names/buttons only when the destination changes prevents
 // repetitive layout churn at 20–24fps on iPhone Safari.
 if(previewHUDKey!==key){
  const name=preview.name.toUpperCase(),destination=preview.destination;
  if($('decorPreviewName').textContent!==name)$('decorPreviewName').textContent=name;
  if($('decorPreviewDestination').textContent!==destination)$('decorPreviewDestination').textContent=destination;
  $('decorPreviewCount').textContent='OPEN LOCATION '+options.index+' / '+options.total;
  const canCycle=options.total>1;
  $('decorPreviewPrevious').disabled=!canCycle;
  $('decorPreviewNext').disabled=!canCycle;
  previewHUDKey=key;
 }
 const distance=Math.round(Math.hypot(player.x-preview.x,player.z-preview.z));
 const depth=cameraDepth(preview.x,preview.z),side=cameraSide(preview.x,preview.z);
 const heading=depth<-.75?'BEHIND YOU':Math.abs(side)>Math.max(1,depth*.27)?
  (side>0?'TURN RIGHT':'TURN LEFT'):'STRAIGHT AHEAD';
 const label=distance+' UNITS · '+heading+' · LOOK TO INSPECT';
 if($('decorPreviewDistance').textContent!==label)$('decorPreviewDistance').textContent=label;
}
function cycleDecorPreview(step){
 if(!decorEngine.cyclePreview(step))return false;
 previewHUDKey='';updateDecorPreviewHud();return true;
}
function faceDecorPreview(){
 const preview=decorEngine.previewState();
 if(!preview||modal||!playing)return false;
 const dx=preview.x-player.x,dz=preview.z-player.z;
 if(Math.hypot(dx,dz)<.1)return false;
 // Camera yaw is measured from world north: forward = (sin yaw,-cos yaw).
 // Rotate the view only, never teleport the collector or shift artwork.
 player.yaw=Math.atan2(dx,-dz);
 updateDecorPreviewHud();return true;
}
function cancelDecorPreview(){
 const result=decorEngine.cancelPreview();updateDecorPreviewHud();
 return result;
}
function confirmDecorPreview(){
 if(!decorEngine.previewState())return false;
 const moved=decorEngine.commitPreview();
 updateDecorPreviewHud();return moved;
}
function editPreviewDestination(){
 const target=decorEngine.previewState();if(!target)return false;
 cancelDecorPreview();
 if(!decorMap.beginMove(target.id))return false;
 decorMap.choose(target.slot);
 openDrawer('map');return true;
}
function resetState(){
 achievementData=ACHIEVEMENTS.makeData();achievementPrior=null;achievementFilter='all';
 finaleUnlocked=false;finaleViewed=false;finaleChapter=0;$('finaleOverlay').hidden=true;
 encoreExpanded=false;encorePage=0;
 showcaseActive=false;showcaseOverhead=false;showcaseReturnPose=null;showcaseBusy=false;postcardStyle='plain';
 $('game').classList.remove('showcase-active');
 $('game').removeAttribute('data-postcard-style');$('showcaseBar').hidden=true;
 $('showcaseOverhead').hidden=true;
 rows=Array.from({length:NUM_RACKS},()=>Array.from({length:ROWS},()=>[]));
 slots=Array.from({length:NUM_RACKS},()=>Array.from({length:ROWS},EMPTY_ROW));
 tote=[];selected=null;groundPositions.clear();migratedCarryCount=0;lastPlacement=null;lifetimePerfect.clear();slotPulse=null;
 glassesEquipped=false;glassesTarget=null;honorTrim=0;honorWorld=[];honorPlates=false;honorSeal=false;
 decorEngine.clean();seenFigures.clear();pinnedSets.clear();trackedSetId=null;huntExpanded=false;huntFocusedNum=null;albumFilter='all';albumSort='id';albumQuery='';albumPage=0;albumReturnScroll=0;
 faceCleaning=Array(NUM_RACKS).fill(0);hiddenRevealed.clear();newlyRevealed=null;hiddenRevealMoment=0;
 floorCleaning=Array(ambientMess.length).fill(0);lastAmbientClean=null;player={x:35,z:68,yaw:0,pitch:0};setupFloor();save();stats();
}
function restore(){
 // Never turn an unreadable EXISTING save into a new shop automatically.
 // Keep the exact original bytes in storage; block every autosave and offer
 // the player an explicit Files / previous-backup recovery screen.
 const boot=window.BitBazaarBootRecovery?.inspect?.()||
  {kind:'blocked',reason:'The startup recovery checker could not load'};
 if(boot.kind==='blocked'){
  window.BitBazaarSaveHold=true;
  resetState(); // In-memory safe display only; save() now refuses to write.
  window.BitBazaarBootRecovery?.show(boot);
  return;
 }
 if(boot.kind==='fresh'){resetState();return;}
 const raw=boot.raw;
 // Restoring an existing saved shop must be atomic: suppress all autosaves
 // while artwork, shelf rows and physical floor figures are reconstructed.
 window.BitBazaarSaveHold=true;
 // Migrate the legacy 1,000-figure save once into a NEW save key; the safety build remains untouched.
 // Original twenty one-sided shelves become the FRONT faces of the same fixtures.
 decorEngine.load(raw);
 const previous=raw.rows.length===20;
 // Existing progress predates shelf cleaning: grandfather all faces as
 // restored and leave all existing figures discoverable on the floor.
 const oldCleaning=!Array.isArray(raw.cleaning)||raw.cleaning.length!==NUM_RACKS;
 if(oldCleaning){
  try{
   if(!localStorage.getItem('bit-bazaar-v3-before-cleaning'))
    localStorage.setItem('bit-bazaar-v3-before-cleaning',JSON.stringify(raw));
  }catch(_){}
 }
 faceCleaning=oldCleaning?Array(NUM_RACKS).fill(3):raw.cleaning.map(v=>clamp(Math.floor(Number(v)||0),0,3));
 hiddenRevealed=new Set(oldCleaning?HIDDEN_IDS:(Array.isArray(raw.revealed)?raw.revealed:[]).filter(id=>HIDDEN_SET.has(id)));
 for(const [face,id] of SECRET_BY_FACE)if(faceCleaning[face]===3)hiddenRevealed.add(id);
 newlyRevealed=null;
 // Older saves gain new ambient-floor restoration without disturbing any
 // shelf placement, figure, or earlier hidden-discovery progress.
 const oldAmbient=!Array.isArray(raw.floorCleaning)||raw.floorCleaning.length!==ambientMess.length;
 if(oldAmbient){
  try{
   if(!localStorage.getItem('bit-bazaar-v3-before-floor-cleaning'))
    localStorage.setItem('bit-bazaar-v3-before-floor-cleaning',JSON.stringify(raw));
  }catch(_){}
 }
 floorCleaning=oldAmbient?Array(ambientMess.length).fill(0):
  raw.floorCleaning.map((n,i)=>clamp(Math.floor(Number(n)||0),0,AMBIENT_ACTIONS[ambientMess[i].kind].length));
 lastAmbientClean=null;
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
 achievementData=ACHIEVEMENTS.normalize(raw.achievementData);
 finaleViewed=raw.finaleViewed===true;finaleChapter=0;finaleUnlocked=false;
 encoreExpanded=false;encorePage=0;
 achievementPrior=null;achievementFilter='all';
 glassesEquipped=raw.glassesEquipped===true&&GLASSES.unlocked(lifetimePerfect);
 honorTrim=HONORS.unlocked(lifetimePerfect,50)&&Number.isInteger(raw.honorTrim)&&
   raw.honorTrim>=0&&raw.honorTrim<=2?raw.honorTrim:0;
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
 for(const id of HIDDEN_IDS)if(used.has(id))hiddenRevealed.add(id);
 // v0.10 and older have no discovery ledger. Existing shelved or carried
 // figures remain discovered without guessing prior loose-figure pickups.
 const oldDiscovery=!Array.isArray(raw.seenFigures);
 seenFigures=new Set((oldDiscovery?[]:raw.seenFigures).filter(isFigure));
 // Bookmarks are optional set IDs, not figure progress.
 pinnedSets=new Set((Array.isArray(raw.pinnedSets)?raw.pinnedSets:[])
  .filter(id=>Number.isInteger(id)&&id>=0&&id<DB.sets.length));
 trackedSetId=Number.isInteger(raw.trackedSetId)&&pinnedSets.has(raw.trackedSetId)?raw.trackedSetId:null;
 huntExpanded=false;huntFocusedNum=null;
 albumReturnScroll=0;
 for(const id of used)seenFigures.add(id);
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
 setupFloor();
 for(const id of groundPositions.keys())seenFigures.add(id);
 stats();
 // A successful structural preflight is not enough: validate the fully
 // reconstructed 3,000-figure scene before any migration write.
 const validator=window.BitBazaarSaveTools?.validate;
 if(typeof validator!=='function')
  throw Error('Save validator unavailable after shop restoration');
 validator(saveData());
 const migrated=migratedCarryCount||oldCleaning||oldAmbient||oldDiscovery||
  !Array.isArray(raw.revealed)||!raw.slots||
  !Array.isArray(raw.lifetimePerfect)||raw.achievementData===undefined||!localStorage.getItem(STORE_KEY);
 window.BitBazaarSaveHold=false;
 // Startup's earlier stats() ran while saving was quarantined; release
 // the earned-equipment AND finale buttons after restoration ends.
 refreshGlasses();
 $('finaleBtn').disabled=!finaleUnlocked;
 $('encoreBtn').disabled=!finaleUnlocked;
 if(migrated&&!save())
  throw Error('Migrated shop could not be saved; original progress is protected');
}
function saveData(){return {version:1,tote,rows,slots,glassesEquipped,honorTrim,finaleViewed,achievementData:ACHIEVEMENTS.normalize(achievementData),lifetimePerfect:[...lifetimePerfect],seenFigures:[...seenFigures],pinnedSets:[...pinnedSets],trackedSetId,selected,player:showcaseReturnPose?{...showcaseReturnPose}:player,ground:[...groundPositions].map(([id,p])=>[id,p.x,p.z]),cleaning:faceCleaning,revealed:[...hiddenRevealed],floorCleaning,decor:decorEngine.state()}}
function save(){
 // Give the portable-backup tool a trustworthy success/failure signal.
 // Ordinary gameplay remains autosaved and keeps its existing UI contract.
 if(window.BitBazaarImportInProgress||window.BitBazaarSaveHold)return false;
 try{localStorage.setItem(STORE_KEY,JSON.stringify(saveData()));return true}
 catch(e){return false}
}
function blocked(x,z,pad=.3){
 if(x<1.4+pad||x>SW-1.4-pad||z<1.4+pad||z>SD-1.4-pad)return true;
 for(const f of fixtures){const dx=x-f.x,dz=z-f.z;
  if(Math.abs(dx*f.ux+dz*f.uz)<f.w/2+pad && Math.abs(dx*f.nx+dz*f.nz)<f.depth/2+pad)return true}
 return false;
}
function refreshGlasses(){
 const ready=GLASSES.unlocked(lifetimePerfect),button=$('glassesToggle');
 if(!ready)glassesEquipped=false;
 button.disabled=!ready||Boolean(window.BitBazaarSaveHold);
 button.setAttribute('aria-pressed',String(glassesEquipped));
 button.textContent=ready?(glassesEquipped?'◉ REMOVE GLASSES':'◎ EQUIP GLASSES'):'◎ GLASSES LOCKED';
 $('glassesProgress').textContent=ready?'150 SETS MASTERED · OPTIONAL GUIDANCE':
  lifetimePerfect.size+' / 150 LIFETIME PERFECT SETS';
 $('cowardBadge').hidden=!glassesEquipped;
 glassesTarget=glassesEquipped&&tote.length?
  GLASSES.target(tote[0],rows,shelves):null;
}
function toggleGlasses(){
 if(!GLASSES.unlocked(lifetimePerfect)||window.BitBazaarSaveHold||
    window.BitBazaarImportInProgress)return false;
 glassesEquipped=!glassesEquipped;
 ACHIEVEMENTS.event(achievementData,glassesEquipped?'wore':'removed');
 stats();save();
 notify(glassesEquipped?'COWARD\'S GLASSES ON · YOUR CHOICE, NO PENALTY':
  'GLASSES REMOVED · FIND THE FIGURES YOUR OWN WAY');
 return glassesEquipped;
}
function changeHonorTrim(next){
 if(!HONORS.unlocked(lifetimePerfect,50)||!Number.isInteger(next)||
    next<0||next>=HONORS.trimNames.length||
    window.BitBazaarSaveHold||window.BitBazaarImportInProgress)return false;
 const previous=honorTrim;
 honorTrim=next;
 if(!save()){honorTrim=previous;return false;}
 stats();
 const scroll=$('drawerBody').scrollTop||0;
 renderAlbum();$('drawerBody').scrollTop=scroll;
 notify('FREE GALLERY FINISH · '+HONORS.trimNames[honorTrim]);
 return true;
}
function journeyState(perfectRows=completedRowCount(),shelved=rows.flat(2).length){
 return JOURNEYS.evaluate({faceCleaning,floorCleaning,hiddenRevealed,hiddenIds:HIDDEN_IDS,
  lifetimePerfect,perfectRows,shelved,held:tote.length});
}
function achievementState(){
 return {slots,faceCleaning,floorCleaning,hiddenIds:HIDDEN_IDS,
  hiddenRevealed,seenFigures,lifetimePerfect,pinnedSets,
  ownedArt:decorEngine.ownedIds().length,placedArt:decorEngine.placedSlots().length,
  honorTrim,held:tote.length};
}
function trackAchievements(){
 const original=JSON.stringify(achievementData);
 const result=ACHIEVEMENTS.observe(achievementData,achievementState(),achievementPrior);
 achievementPrior=result.prior;
 if(JSON.stringify(achievementData)!==original&&!window.BitBazaarSaveHold&&
    !window.BitBazaarImportInProgress)save();
 $('achievementBtn').textContent='✦ MEDALS · '+achievementData.earned.length+'/30';
 if(playing&&result.newly.length)notify('✦ ACHIEVEMENT · '+
  ACHIEVEMENTS.medals.find(m=>m.id===result.newly[0]).title.toUpperCase()+
  (result.newly.length>1?' · +'+(result.newly.length-1)+' MORE':''));
 return result;
}
function postgameSource(){
 return {earned:achievementData.earned,slots,lifetimePerfect,pinnedSets,
  sacrificed:achievementData.sacrificed,sets:DB.sets,
  ownedArt:decorEngine.ownedIds().length,placedArt:decorEngine.placedSlots().length};
}
function postgameStatus(){return POSTGAME.evaluate(postgameSource());}
function openEncore(){
 if(!playing||!finaleUnlocked||window.BitBazaarSaveHold||
    window.BitBazaarImportInProgress)return false;
 if(modal==='inspect')closeInspection();
 if(modal==='finale')return false;
 encoreExpanded=true;
 openDrawer('album');
 const d=$('encoreDetails');
 if(!d)return false;
 d.open=true;
 d.scrollIntoView({block:'start',behavior:'auto'});
 return true;
}
function stats(){
 const placed=rows.flat(2).length;
 const completed=completedRowCount();
 $('restoredCount').textContent=cleanedFaceCount();
 $('hiddenCount').textContent=hiddenRevealed.size;
 $('floorCleanCount').textContent=floorCleanedCount();
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
 refreshHuntPanel();
 refreshGlasses();
 honorWorld=HONORS.world(lifetimePerfect);
 honorPlates=HONORS.unlocked(lifetimePerfect,25);
 honorSeal=HONORS.unlocked(lifetimePerfect,200);
 const journeys=journeyState(completed,placed);
 $('journeyBtn').textContent='✦ THREE JOURNEYS · '+journeys.completed+'/3';
 $('journeyBtn').title='The Restorer: '+(journeys.restorer.complete?'complete':'in progress')+
  ' · The Archivist: '+(journeys.archivist.metrics[0].count)+'/300'+
  ' · Perfect Bazaar: '+completed+'/300';
 if(playing&&lastJourneys){
  for(const id of ['restorer','archivist','perfect']){
   if(!lastJourneys[id].complete&&journeys[id].complete){
    notify('✦ JOURNEY COMPLETE · '+journeys[id].title.toUpperCase());break;
   }
  }
 }
 lastJourneys=journeys;
 trackAchievements();
 const hadMonument=finaleUnlocked;
 finaleUnlocked=FINALE.unlocked(achievementData.earned);
 const finaleButton=$('finaleBtn');
 finaleButton.hidden=!finaleUnlocked;
 finaleButton.textContent=finaleViewed?'♛ COLLECTOR’S MONUMENT · REPLAY FINALE':'♛ GRAND FINALE READY · VIEW';
 finaleButton.disabled=!finaleUnlocked||Boolean(window.BitBazaarSaveHold);
 const encoreButton=$('encoreBtn');
 encoreButton.hidden=!finaleUnlocked;
 encoreButton.disabled=!finaleUnlocked||Boolean(window.BitBazaarSaveHold);
 encoreButton.textContent='✦ COLLECTOR’S ENCORE · '+completed+'/300';
 if(playing&&!hadMonument&&finaleUnlocked)
  notify('♛ THE COLLECTOR’S MONUMENT IS YOURS · FINALE READY');
 // Phase 6.4 owns the optional finale; reaching 300 perfect rows does not
 // suspend play or force a modal. Sacrifice purchases remain usable.
 
}
function nearestAisle(){const i=clamp(Math.round((player.x-11)/16),0,3);return `AISLE ${'ABCD'[i]}`;}
// The optional finale is never forced on the player. Playing and autosaves
// remain active after it closes; purchases can still sacrifice completed rows.
function refreshFinaleScene(){
 $('finaleContent').innerHTML=FINALE.scene(finaleChapter);
 const last=finaleChapter===FINALE.chapters.length-1;
 $('finaleNext').hidden=last;
 $('finaleNext').textContent=finaleChapter===FINALE.chapters.length-2?'SEE THE MONUMENT →':'NEXT CHAPTER →';
 $('finaleSkip').hidden=last;
 $('finaleReplay').hidden=!last;
 if(last&&!finaleViewed){
  finaleViewed=true;
  if(!save())notify('CREDITS VIEWED · SAVE UNAVAILABLE · YOUR SHOP REMAINS PLAYABLE','bad');
  $('finaleBtn').textContent='♛ COLLECTOR’S MONUMENT · REPLAY FINALE';
 }
}
function openFinale(){
 if(!playing||!finaleUnlocked||window.BitBazaarSaveHold||
    window.BitBazaarImportInProgress||modal||decorEngine.previewState())return false;
 modal='finale';finaleChapter=0;
 $('finaleOverlay').hidden=false;
 refreshFinaleScene();
 $('finaleClose').focus({preventScroll:true});
 return true;
}
function advanceFinale(){
 if(modal!=='finale')return false;
 finaleChapter=Math.min(FINALE.chapters.length-1,finaleChapter+1);
 refreshFinaleScene();return true;
}
function skipFinale(){
 if(modal!=='finale')return false;
 finaleChapter=FINALE.chapters.length-1;
 refreshFinaleScene();return true;
}
function replayFinale(){
 if(modal!=='finale')return false;
 finaleChapter=0;refreshFinaleScene();return true;
}
function closeFinale(){
 if(modal!=='finale')return false;
 $('finaleOverlay').hidden=true;modal='';finaleChapter=0;
 $('finaleBtn').focus({preventScroll:true});
 return true;
}
function notify(s,kind='normal'){
 $('toast').textContent=s;$('toast').classList.add('visible');
 if(kind==='bad')$('toast').style.borderColor='#fb8188';else $('toast').style.borderColor='#dbab64';
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2200);
}
function markFigSeen(id){
 if(!isFigure(id)||seenFigures.has(id))return false;
 seenFigures.add(id);return true;
}
function setDiscovery(sid){
 let observed=0;
 for(const id of DB.sets[sid].memberIds)if(seenFigures.has(id))observed++;
 return observed;
}
function countSet(sid){let count=0;for(const rack of rows)for(const row of rack)for(const id of row)if(figure(id).setId===sid)count++;return count;}
function rowForSet(sid){for(let s=0;s<NUM_RACKS;s++)for(let r=0;r<ROWS;r++)if(rows[s][r].length&&figure(rows[s][r][0]).setId===sid)return [s,r];return null;}
function isSetPerfect(sid){const where=rowForSet(sid);return !!where&&isPerfectRow(where[0],where[1]);}
const figure=id=>figureById[id];
const iconHTML=id=>`<span class="sprite" aria-hidden="true" style="background-position:${sprites.cssIcon(id)}"></span>`;
// One close-up card at a time: the existing 32x40 artwork is magnified
// using CSS pixels, never an additional atlas or a large drawing buffer.
const safeText=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function figurineLore(id){
 const fig=figure(id),set=DB.sets[fig.setId];
 const leads=[
  'A quiet guardian of overlooked treasures','A bold explorer of unfamiliar shelves',
  'A dedicated keeper of miniature legends','A watchful wanderer of forgotten aisles',
  'A collector of stories no one else remembers','A champion of the smallest adventures',
  'A curious specialist in unlikely discoveries','A patient protector of lost objects',
  'A cheerful adventurer with a stubborn streak','A meticulous expert in secret routes'
 ];
 const quirks=[
  'always carries a lucky charm','never steps over a crack',
  'keeps a secret written in tiny letters','refuses to leave a friend behind',
  'can spot a misplaced detail from across a room','is convinced every dusty box hides a mystery',
  'counts every victory twice','likes to keep the team in numerical order',
  'travels with a map covered in sketches','takes special pride in a perfectly polished display'
 ];
 const legendary=[
  'Rumor says this miniature once solved a puzzle no one else could.',
  'The collection records mention one legendary rescue and a missing ribbon.',
  'Other figures know the story but never agree on its ending.',
  'Its greatest adventure is still waiting for the rest of the set.',
  'It is said the most important discovery happens on an ordinary day.',
  'According to old collector notes, this figure has never lost its way.'
 ];
 const a=leads[(fig.setId*7+fig.number*3)%leads.length];
 const b=quirks[(id*3+fig.setId)%quirks.length];
 const c=legendary[(id+fig.number*5)%legendary.length];
 return fig.name+', known to other collectors as '+(fig.codename||'a quiet curiosity')+', is '+a.toLowerCase()+' in the '+set.name+' stories. This '+fig.role.toLowerCase()+' '+b+'. '+c;
}
function figurineLocation(id){
 if(tote.includes(id))return 'IN YOUR HAND';
 for(let rack=0;rack<NUM_RACKS;rack++)for(let row=0;row<ROWS;row++){
  const slot=slots[rack][row].indexOf(id);
  if(slot>=0)return 'DISPLAY '+(rack+1)+' · ROW '+(row+1)+' · SLOT '+(slot+1);
 }
 return floor[id]?.hidden?'HIDDEN IN STORE MESS':floor[id]?.onFloor?'LOOSE IN THE SHOP':'NOT CURRENTLY ON DISPLAY';
}
function openInspection(id){
 if(!isFigure(id)||modal==='inspect')return false;
 // Browsing the book does not magically reveal a mystery figure.
 if(modal==='album'&&!seenFigures.has(id))return false;
 if(modal!=='album'&&markFigSeen(id))save();
 const fig=figure(id),set=DB.sets[fig.setId];
 inspectionReturn=modal==='album'?'album':'';
 inspectedId=id;modal='inspect';
 $('inspectFigureName').textContent=fig.name;
 $('inspectSeriesName').textContent=set.name;
 $('inspectFigureNumber').textContent='#'+fig.number+' / 10';
 $('inspectSeriesNumber').textContent='COLLECTION '+String(set.id+1).padStart(3,'0')+' / 300';
 $('inspectRole').textContent=fig.role+' · '+(fig.codename||'Collector’s curiosity');
 $('inspectStory').textContent=figurineLore(id);
 $('inspectStatus').textContent=figurineLocation(id);
 $('inspectProgress').textContent=countSet(set.id)+' / 10 SHELVED'+
  (isSetPerfect(set.id)?' · PERFECT 1–10':lifetimePerfect.has(set.id)?' · MASTERED BEFORE':'');
 $('inspectSprite').innerHTML=iconHTML(id);
 $('inspectReturn').textContent=inspectionReturn==='album'?'BACK TO COLLECTION':'RETURN TO SHOP';
 $('inspectOverlay').hidden=false;
 $('inspectOverlay').setAttribute('aria-hidden','false');
 return true;
}
function closeInspection(){
 if(modal!=='inspect')return false;
 $('inspectOverlay').hidden=true;$('inspectOverlay').setAttribute('aria-hidden','true');
 modal=inspectionReturn||'';inspectedId=null;inspectionReturn='';
 return true;
}
function inspectTarget(){
 if(!playing||modal)return false;
 prepareOcclusion();const target=findFocus();
 const id=tote[0]??(target?.kind==='figure'?target.id:
  target?.kind==='shelf-figure'?target.figureId:null);
 return id===null||id===undefined?false:openInspection(id);
}
// A CSS-only celebration (5 simple diamonds, no particles/canvases).
function pulseReticle(){
 const mark=$('crosshair');
 mark.classList.remove('interact-pop');
 void mark.offsetWidth;
 mark.classList.add('interact-pop');
}
function showPerfectBanner(setId,firstTime){
 const set=DB.sets[setId],banner=$('perfectBanner');
 $('perfectSetName').textContent=set.name;
 $('perfectFirst').textContent=firstTime?
  'NEW MASTERED SET · '+lifetimePerfect.size+' / 300':'PERFECTLY REORGANIZED';
 banner.classList.remove('show');
 // Restart the one-shot CSS animation; no recurring work.
 void banner.offsetWidth;
 banner.classList.add('show');
 clearTimeout(perfectBannerTimer);
 perfectBannerTimer=setTimeout(()=>banner.classList.remove('show'),2600);
}

// Collection browsing is the ONLY remaining modal. Physical shelves are used in-world.
function openDrawer(kind){
 if(showcaseActive)return;
 if(kind!=='album'&&kind!=='map'&&kind!=='decor')return;
 if(decorEngine.previewState())cancelDecorPreview();
 if(kind!=='map'&&decorMap.moving())decorMap.cancelMove();
 // Discard temporary positioning previews whenever another drawer replaces
 // the editor. Applied fine offsets remain in the original saved schema.
 if(modal==='decor'&&kind!=='decor')decorEngine.workshop.cancelAll();
 modal=kind;
 $('drawer').classList.add('open');$('drawerShade').classList.add('show');
 $('drawer').setAttribute('aria-hidden','false');
 if(kind==='decor'){
  $('drawerKicker').textContent='PHASE 4 · GALLERY';
  $('drawerTitle').textContent='SACRIFICE CATALOG';
  decorEngine.render();
 }else if(kind==='map'){
  $('drawerKicker').textContent='REAL-TIME 40-UNIT FLOOR PLAN';
  $('drawerTitle').textContent='THE STORE MAP';
  renderStoreMap();
 }else{
  $('drawerKicker').textContent='3,000 MINIATURE TREASURES';
  $('drawerTitle').textContent='COLLECTION ALMANAC';
  renderAlbum();
 }
}
function closeDrawer(){
 if(decorMap.moving())decorMap.cancelMove();
 // Never leak unconfirmed draft coordinates into a later catalog visit.
 decorEngine.workshop.cancelAll();
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
 if(faceCleaning[shelfId]<3)
  return {ok:false,message:'DIRTY DISPLAY · PUT DOWN FIGURE TO '+faceTask(shelfId)};
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
 slotPulse={shelfId,rowId,slotId,at:performance.now()};pulseReticle();
 const nowPerfect=isPerfectRow(shelfId,rowId);
 if(nowPerfect&&!wasPerfect){
  const firstTime=!lifetimePerfect.has(figure(id).setId);
  lifetimePerfect.add(figure(id).setId);
  showPerfectBanner(figure(id).setId,firstTime);
 }
 if(isFigure(displaced)){
  // The occupied figure goes directly into the single hand; never use a tote.
  tote[0]=displaced;selected=displaced;lastPlacement=null;
  ACHIEVEMENTS.event(achievementData,'swap');
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
 slotPulse={shelfId,rowId,slotId,at:performance.now()};pulseReticle();
 tote[0]=id;selected=id;lastPlacement=null;
 markFigSeen(id);
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
 if(!$('roomPreviewHud').hidden)return false;
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
// The Almanac is a browseable journal, not an omniscient GPS. New images,
// names, micro-lore and roles are revealed only after physically observing or
// carrying a specific figurine. Set names remain visible from the start.
function togglePinnedSet(sid){
 if(!Number.isInteger(sid)||sid<0||sid>=DB.sets.length)return false;
 if(pinnedSets.has(sid))pinnedSets.delete(sid);else pinnedSets.add(sid);
 if(!pinnedSets.has(trackedSetId)){trackedSetId=pinnedSets.size?[...pinnedSets].sort((a,b)=>a-b)[0]:null;huntFocusedNum=null;}
 stats();save();return pinnedSets.has(sid);
}
// Optional on-screen collector's hunt notebook. It NEVER finds figurines
// for the player: every shown state comes from observed IDs, hand and shelf
// slots. Rebuilt only when a pin/collection state changes (never per frame).
function huntTrackedId(){
 if(!pinnedSets.size)return null;
 if(!pinnedSets.has(trackedSetId))trackedSetId=[...pinnedSets].sort((a,b)=>a-b)[0];
 return trackedSetId;
}
function huntSnapshot(sid){
 if(!Number.isInteger(sid)||sid<0||sid>=DB.sets.length)return null;
 const set=DB.sets[sid],where=rowForSet(sid),
  current=where?slots[where[0]][where[1]]:null;
 const nums=set.memberIds.map((id,k)=>{
  const slot=current?current.indexOf(id):-1;
  const onShelf=slot>=0,held=tote.includes(id),seen=seenFigures.has(id)||onShelf||held;
  return {number:setNumber(id),seen,held,shelved:onShelf,correct:onShelf&&slot===setNumber(id)-1,slot:slot<0?null:slot+1};
 });
 return {id:sid,name:set.name,where,seen:nums.filter(n=>n.seen).length,
  shelved:nums.filter(n=>n.shelved).length,correct:nums.filter(n=>n.correct).length,
  perfect:isSetPerfect(sid),numbers:nums};
}
function huntCycle(direction){
 const ids=[...pinnedSets].sort((a,b)=>a-b);
 if(!ids.length){trackedSetId=null;huntFocusedNum=null;refreshHuntPanel();return null;}
 const i=ids.indexOf(huntTrackedId());
 trackedSetId=ids[(i+direction+ids.length)%ids.length];huntFocusedNum=null;
 save();refreshHuntPanel();$('huntBody').scrollTop=0;return trackedSetId;
}
function refreshHuntPanel(){
 const toggle=$('huntToggle'),body=$('huntBody'),count=pinnedSets.size;
 // Preserve user's place and keyboard focus on progress refreshes.
 const savedScroll=body.scrollTop||0;
 const focusedNumber=document.activeElement?.getAttribute?.('data-hunt-number');
 const active=huntTrackedId();
 toggle.textContent=count?'★ HUNT · '+count+(huntExpanded?' ▴':' ▾'):'☆ PIN A HUNT';
 toggle.setAttribute('aria-expanded',String(huntExpanded));
 body.hidden=!huntExpanded;
 if(!huntExpanded)return;
 if(active===null){
  body.innerHTML=`<p class="hunt-empty">PIN A COLLECTION IN THE ALMANAC TO TRACK ITS NUMBERS HERE.</p>
   <button type="button" class="hunt-open" id="huntFindCollection">OPEN COLLECTIONS</button>`;
  $('huntFindCollection').onclick=()=>openDrawer('album');
  return;
 }
 const ids=[...pinnedSets].sort((a,b)=>a-b),item=huntSnapshot(active);
 // Only an already-assigned shelf is eligible for the map shortcut.
 const displayRow=item.where?
  `<div class="hunt-display">
   <span class="hunt-display-kicker">YOUR ASSIGNED DISPLAY</span>
   <strong>${safeText(shelves[item.where[0]].name)} · ROW ${item.where[1]+1}</strong>
   <button type="button" id="huntShowShelf" class="hunt-map-jump">▦ SHOW SHELF ON MAP</button>
  </div>`:
  `<div class="hunt-display unassigned">
   <span class="hunt-display-kicker">YOUR ASSIGNED DISPLAY</span>
   <strong>NO SHELF ASSIGNED YET</strong>
   <small>Place the first figure in a clean, empty shelf row to claim it.</small>
  </div>`;
 const boxes=item.numbers.map(n=>{
  const kind=n.shelved?(n.correct?'correct':'misplaced'):n.held?'held':n.seen?'found':'unseen';
  const label=n.shelved?(n.correct?'CORRECT':'SLOT '+n.slot):n.held?'IN HAND':n.seen?'SEEN · UNSHELVED':'NOT FOUND';
  return `<button type="button" class="hunt-num ${kind}${huntFocusedNum===n.number?' selected':''}"
   data-hunt-number="${n.number}" aria-pressed="${huntFocusedNum===n.number}"
   aria-label="Figure ${n.number}: ${label}">${n.number}</button>`;
 }).join('');
 const focus=item.numbers.find(n=>n.number===huntFocusedNum);
 let detail='';
 if(focus){
  // Names remain hidden for unobserved figurines; no loose figure coordinates.
  const member=DB.sets[active].memberIds.find(id=>setNumber(id)===focus.number);
  const known=focus.seen&&isFigure(member);
  const title=known?figure(member).name:'UNDISCOVERED MINIATURE';
  const status=focus.correct?'CORRECTLY SORTED · SLOT '+focus.number:
   focus.shelved?'WRONG SLOT '+focus.slot+' · BELONGS IN SLOT '+focus.number:
   focus.held?'CURRENTLY IN YOUR HAND':focus.seen?'DISCOVERED · NOT SHELVED':'NOT YET DISCOVERED';
  const hint=focus.correct?'This number is in the right position.':
   focus.shelved?'Lift or swap this miniature into its numbered position.':
   focus.held?'Find this set\'s shelf or put this figure down to clean.':
   focus.seen?'You have seen this figure, but it is not on display.':'Find it in the shop to reveal its identity.';
  detail=`<div class="hunt-detail" role="status" aria-live="polite">
   <strong>#${focus.number} · ${safeText(title)}</strong><span>${safeText(status)}</span>
   <p>${safeText(hint)}</p></div>`;
 }
 body.innerHTML=`<div class="hunt-heading"><strong>${safeText(item.name)}</strong>
    <span>${ids.indexOf(active)+1} / ${ids.length} PINNED</span></div>
   <div class="hunt-metrics"><span>${item.seen}/10 SEEN</span><span>${item.shelved}/10 SHELVED</span>
     <span>${item.perfect?'★ PERFECT':item.shelved===10?'SORT YOUR ROW':item.correct+'/10 RIGHT'}</span></div>
   <div class="hunt-numbers" role="group" aria-label="Collection figure-number checklist">${boxes}</div>
   <div class="hunt-key">■ CORRECT · <b>!</b> WRONG SLOT · ◇ SEEN · ? UNKNOWN</div>
   ${displayRow}
   ${detail}
   <div class="hunt-actions">
    <button type="button" id="huntPrevious" aria-label="Previous pinned collection">‹</button>
    <button type="button" id="huntOpen" aria-label="Open selected set in collection book">COLLECTION ↗</button>
    <button type="button" id="huntNext" aria-label="Next pinned collection">›</button>
   </div>`;
 body.querySelectorAll('[data-hunt-number]').forEach(button=>button.onclick=()=>{
  const num=Number(button.getAttribute('data-hunt-number'));
  huntFocusedNum=huntFocusedNum===num?null:num;refreshHuntPanel();
 });
 $('huntPrevious').onclick=()=>huntCycle(-1);
 $('huntNext').onclick=()=>huntCycle(1);
 $('huntOpen').onclick=()=>{openDrawer('album');renderSetDetail(active)};
 if(item.where)$('huntShowShelf').onclick=()=>showCollectionShelfOnMap(active);
 body.scrollTop=savedScroll;
 if(focusedNumber){
  const next=body.querySelector('[data-hunt-number="'+focusedNumber+'"]');
  if(next)next.focus({preventScroll:true});
 }
}

function albumSetStatus(sid){
 const where=rowForSet(sid),shelved=countSet(sid),seen=setDiscovery(sid),
  perfect=where!==null&&isPerfectRow(where[0],where[1]);
 return {id:sid,where,shelved,seen,perfect,mastered:lifetimePerfect.has(sid),pinned:pinnedSets.has(sid)};
}
function albumSetFilter(progress){
 if(albumFilter==='pinned')return progress.pinned;
 if(albumFilter==='active')return progress.shelved>0&&!progress.perfect;
 if(albumFilter==='unsorted')return progress.shelved===10&&!progress.perfect;
 if(albumFilter==='perfect')return progress.perfect;
 if(albumFilter==='unseen')return progress.seen===0;
 if(albumFilter==='mastered')return progress.mastered;
 return true;
}
function albumCatalog(){
 const filter=albumQuery.toLowerCase().trim();
 const entries=[];
 for(const set of DB.sets){
  if(filter&&!String(set.name+' '+set.theme+' '+(set.id+1)).toLowerCase().includes(filter))continue;
  const p=albumSetStatus(set.id);
  if(albumSetFilter(p))entries.push(p);
 }
 entries.sort((a,b)=>{
  if(albumSort==='az')return DB.sets[a.id].name.localeCompare(DB.sets[b.id].name)||a.id-b.id;
  if(albumSort==='closest'){
   const rank=x=>x.shelved===10&&!x.perfect?100:
     !x.perfect?x.shelved*10+x.seen:0;
   return rank(b)-rank(a)||b.shelved-a.shelved||a.id-b.id;
  }
  if(albumSort==='discovered')return b.seen-a.seen||b.shelved-a.shelved||a.id-b.id;
  return a.id-b.id;
 });
 return entries;
}
function albumOverview(){
 const shelved=rows.flat(2).length,currentPerfect=completedRowCount();
 let started=0,fullUnsorted=0;
 for(const set of DB.sets){
  const where=rowForSet(set.id);if(!where)continue;
  started++;
  if(rowCount(where[0],where[1])===10&&!isPerfectRow(where[0],where[1]))fullUnsorted++;
 }
 return {found:seenFigures.size,shelved,currentPerfect,mastered:lifetimePerfect.size,
  started,fullUnsorted,pinned:pinnedSets.size};
}
function renderAlbum(){
 const snap=albumOverview();
 let html=`<div class="folio-head">
   <span class="folio-eyebrow">THE COLLECTOR'S ALMANAC · 300 COLLECTIONS</span>
   <div class="folio-overview">
    <div><strong>${snap.found.toLocaleString()}</strong><small>/ 3,000 DISCOVERED</small></div>
    <div><strong>${snap.shelved.toLocaleString()}</strong><small>/ 3,000 ON DISPLAY</small></div>
    <div><strong>${snap.currentPerfect}</strong><small>/ 300 PERFECT NOW</small></div>
    <div><strong>${snap.mastered}</strong><small>/ 300 MASTERED EVER</small></div>
   </div>
   <div class="folio-meter" title="${snap.found} of 3,000 figures physically discovered">
    <span style="width:${(snap.found/3000*100).toFixed(2)}%"></span>
   </div>
   <div class="folio-substats">${snap.started} STARTED SETS · ${snap.fullUnsorted} NEED SORTING · ★ ${snap.pinned} PINNED</div>
  </div>
  ${JOURNEYS.panel(journeyState())}
  ${finaleUnlocked?`<details id="encoreDetails" class="encore-details" ${encoreExpanded?'open':''}>
   <summary>✦ YOUR OPTIONAL ENCORE · SORT · DECORATE · RESTORE</summary>
   ${POSTGAME.panel(postgameStatus(),encorePage)}
  </details>`:''}
  <details id="achievementDetails" class="achievement-details">
   <summary>✦ THIRTY LITTLE LEGENDS · ${achievementData.earned.length} / 30 MEDALS</summary>
   ${ACHIEVEMENTS.panel(achievementData,achievementState(),achievementFilter)}
  </details>
  ${HONORS.panel(lifetimePerfect,honorTrim)}
  <div class="album-toolbar folio-toolbar">
   <label for="albumSearch" class="folio-input-label">FIND A COLLECTION</label>
   <input id="albumSearch" class="search" placeholder="Collection name, theme or number…" type="search" value="${safeText(albumQuery)}" />
   <label for="albumSort" class="folio-input-label">SORT THE SHELVES</label>
   <select id="albumSort" class="folio-sort" aria-label="Sort collector's sets">
    <option value="id" ${albumSort==='id'?'selected':''}>COLLECTION NUMBER</option>
    <option value="closest" ${albumSort==='closest'?'selected':''}>CLOSEST TO COMPLETION</option>
    <option value="discovered" ${albumSort==='discovered'?'selected':''}>MOST DISCOVERED</option>
    <option value="az" ${albumSort==='az'?'selected':''}>NAME A–Z</option>
   </select>
  </div>
  <div class="folio-filters" role="group" aria-label="Filter collections">
   ${[['all','ALL 300'],['pinned','★ PINNED'],['active','IN PROGRESS'],['unsorted','NEEDS SORTING'],
      ['perfect','PERFECT NOW'],['unseen','UNDISCOVERED'],['mastered','MASTERED EVER']]
    .map(([id,label])=>`<button type="button" data-album-filter="${id}"
      class="folio-chip${albumFilter===id?' active':''}" aria-pressed="${albumFilter===id}">${label}</button>`).join('')}
  </div>
  <div id="albumResults"></div>
  <section class="folio-backup" aria-label="Save backup and recovery">
     <strong>YOUR SHOP · SAVE PROTECTION</strong>
     <p>Protect your shop, download a verified JSON backup, or use your iPhone's native share sheet to choose Save to Files. Keep a backup before restoring another save.</p>
     <div class="folio-backup-actions">
      <button type="button" id="verifySaveFile">✓ VERIFY SAVE</button>
      <button type="button" id="auditFigureInventory">◇ AUDIT 3,000 FIGURES</button>
      <button type="button" id="downloadSaveFile">↓ DOWNLOAD SAVE</button>
       <button type="button" id="shareSaveFile">↥ SAVE TO FILES / SHARE</button>
      <button type="button" id="checkBackupFile">▣ CHECK BACKUP FROM FILES · NO RESTORE</button>
       <button type="button" id="chooseSaveFile">↑ RESTORE FILE</button>
      <button type="button" id="recoverSaveFile" ${window.BitBazaarSaveTools?.hasRecovery?.()?'':'disabled'}>
       ↶ UNDO LAST FILE RESTORE</button>
     </div>
     <input id="checkBackupInput" type="file" accept=".json,application/json" hidden
        aria-label="Choose a Bit Bazaar JSON backup to check without restoring" />
      <input id="saveFileInput" type="file" accept=".json,application/json" hidden
       aria-label="Select a Bit Bazaar save backup" />
     <small>Verification checks your live shop and all 3,000 figures before saving. A failed integrity check pauses autosave to protect your last saved shop.
       Check Backup From Files reads the chosen JSON and compares it with the open shop without saving or importing.
        File restore asks before replacing progress and keeps a recoverable local copy.</small>
     <p id="saveToolStatus" role="status" aria-live="polite"></p>
    </section>

  <section class="device-qa-panel" aria-label="Hands-on iPhone performance recording">
   <strong>◈ PHASE 4 · IPHONE DEVICE CHECK</strong>
   <p>Start a recording, close the Almanac and explore your busiest decorated aisles. Reopen here and finish. This test never moves figures, spends rows or edits your save.</p>
   <div class="device-qa-actions">
    <button type="button" id="deviceQaStart">▶ START DEVICE TEST</button>
    <button type="button" id="deviceQaStop" disabled>■ FINISH TEST</button>
    <button type="button" id="deviceQaCopy" disabled>▣ COPY REPORT</button>
   </div>
   <pre id="deviceQaReport" role="status" aria-live="polite">No device check recorded yet.</pre>
   <small>Record at least 30 seconds on your actual iPhone. A short or simulated test does not certify the game. Copy this report into your feedback.</small>
  </section>
  <div class="footer-actions"><button class="reset-button" id="resetBtn">RESET SAVED STORE</button>
    <span class="label">YOUR DISCOVERY JOURNAL SAVES AUTOMATICALLY</span></div>`;
 $('drawerBody').innerHTML=html;
 window.BitBazaarDeviceQA?.refresh();
 $('albumSearch').oninput=()=>{
  albumQuery=$('albumSearch').value;albumPage=0;paintAlbumList();
 };
 $('albumSort').onchange=()=>{albumSort=$('albumSort').value;albumPage=0;paintAlbumList()};
 $('drawerBody').querySelectorAll('[data-album-filter]').forEach(el=>el.onclick=()=>{
  albumFilter=el.getAttribute('data-album-filter');albumPage=0;
  $('drawerBody').querySelectorAll('[data-album-filter]').forEach(button=>{
   const active=button.getAttribute('data-album-filter')===albumFilter;
   button.classList.toggle('active',active);
   button.setAttribute('aria-pressed',String(active));
  });
  paintAlbumList();
 });
 bindAchievementFilters();
 bindEncore();
 $('drawerBody').querySelectorAll('[data-honor-finish]').forEach(button=>{
  button.onclick=()=>changeHonorTrim(Number(button.getAttribute('data-honor-finish')));
 });
 $('resetBtn').onclick=()=>$('confirm').hidden=false;
 paintAlbumList();
}
function bindEncore(){
 const gallery=$('encoreGallery');
 if(!gallery)return;
 const rerender=()=>{
  const existing=$('encoreGallery');if(!existing)return;
  existing.outerHTML=POSTGAME.panel(postgameStatus(),encorePage);
  bindEncore();
 };
 const details=$('encoreDetails');
 if(details)details.ontoggle=()=>{encoreExpanded=details.open};
 gallery.querySelectorAll('[data-encore-open]').forEach(button=>{
  button.onclick=()=>{
   const action=button.getAttribute('data-encore-open');
   if(action==='decor')openDrawer('decor');
   else if(action==='map'){mapHighlightedSet=null;openDrawer('map');}
  };
 });
 gallery.querySelectorAll('[data-encore-set]').forEach(button=>{
  button.onclick=()=>renderSetDetail(Number(button.getAttribute('data-encore-set')));
 });
 gallery.querySelectorAll('[data-encore-map]').forEach(button=>{
  button.onclick=()=>showCollectionShelfOnMap(Number(button.getAttribute('data-encore-map')));
 });
 gallery.querySelectorAll('[data-encore-pin]').forEach(button=>{
  button.onclick=()=>{
   const id=Number(button.getAttribute('data-encore-pin'));
   if(!Number.isInteger(id)||id<0||id>=DB.sets.length)return;
   togglePinnedSet(id);
   rerender();
  };
 });
 gallery.querySelectorAll('[data-encore-page]').forEach(button=>{
  button.onclick=()=>{
   encorePage=Math.max(0,encorePage+
    (button.getAttribute('data-encore-page')==='next'?1:-1));
   rerender();
  };
 });
}
function bindAchievementFilters(){
 const box=$('achievementGallery');if(!box)return;
 box.querySelectorAll('[data-achievement-filter]').forEach(button=>{
  button.onclick=()=>{
   achievementFilter=button.getAttribute('data-achievement-filter');
   const section=$('achievementGallery');
   section.outerHTML=ACHIEVEMENTS.panel(achievementData,achievementState(),achievementFilter);
   bindAchievementFilters();
  };
 });
}
function paintAlbumList(){
 const dest=$('albumResults');if(!dest)return;
 const found=albumCatalog(),shown=found.slice(0,(albumPage+1)*ALBUM_PAGE_SIZE);
 let html=`<div class="folio-result-total">${found.length} MATCHING COLLECTIONS · SHOWING ${shown.length}</div>`;
 for(const p of shown){
  const set=DB.sets[p.id],known=set.memberIds.find(id=>seenFigures.has(id)),
   previewId=known??set.memberIds[0],
   status=p.perfect?'★ PERFECT ORDER':
    p.shelved===10?'⚒ SORT 1–10':
    p.shelved?'IN PROGRESS':'NOT STARTED',
   sub=p.where?`${safeText(shelves[p.where[0]].name)} · ROW ${p.where[1]+1}`:'NO SHELF ASSIGNED';
  html+=`<button class="album-card folio-card" data-albumset="${p.id}"
     aria-label="${safeText(set.name)}, ${p.seen} of 10 discovered, ${p.shelved} of 10 displayed">
     <span class="folio-card-art${known===undefined?' mystery':''}">${iconHTML(previewId)}</span>
     <span class="folio-card-copy"><strong>${p.pinned?'★ ':''}${String(p.id+1).padStart(3,'0')} · ${safeText(set.name)}</strong>
      <span class="folio-card-theme">${safeText(set.theme)} · ${p.seen}/10 DISCOVERED</span>
      <span class="folio-card-location">${sub}</span>
      <span class="folio-card-meter"><i style="width:${p.shelved*10}%"></i></span>
     </span>
     <span class="folio-card-state${p.perfect?' perfect':''}${p.shelved===10&&!p.perfect?' unsorted':''}">
       ${status}<small>${p.shelved}/10</small>
     </span>
   </button>`;
 }
 if(found.length===0)html+='<div class="folio-empty">NO MATCHES · TRY A DIFFERENT FILTER OR SEARCH</div>';
 if(shown.length<found.length)html+=`<button id="albumMore" class="folio-more" type="button">
   SHOW ${Math.min(ALBUM_PAGE_SIZE,found.length-shown.length)} MORE COLLECTIONS</button>`;
 dest.innerHTML=html;
 dest.querySelectorAll('[data-albumset]').forEach(el=>el.onclick=()=>{
  albumReturnScroll=$('drawerBody').scrollTop||0;
  renderSetDetail(Number(el.getAttribute('data-albumset')));
 });
 if(shown.length<found.length)$('albumMore').onclick=()=>{
  albumPage++;paintAlbumList();
 };
}

// Phase 3's actual player-centered store plan. Nothing on the map ever
// discloses loose/hidden figurine coordinates: only the fixed 40 fixtures,
// their assigned set rows and the player's current x/z and facing direction.
function mapFaceIds(f){
 return f.kind==='floor'?[f.id*2,f.id*2+1]:[40+f.wallIndex];
}
function mapFixtureSummary(f){
 const faces=mapFaceIds(f);
 let occupied=0,perfect=0,cleaned=0;
 for(const face of faces){
  if(faceCleaning[face]===3)cleaned++;
  for(let row=0;row<ROWS;row++){
   if(rows[face][row].length)occupied++;
   if(isPerfectRow(face,row))perfect++;
  }
 }
 return {faces,occupied,perfect,cleaned,capacity:faces.length*ROWS};
}
function mapFixtureLabel(f){
 if(f.kind==='floor')return f.aisle+(Math.floor(f.id/4)+1);
 return f.section.charAt(0)+(f.wallIndex%5+1);
}
function mapFixturePoly(f){
 const u=f.w/2,n=f.depth/2;
 return [[-u,-n],[u,-n],[u,n],[-u,n]]
  .map(([a,b])=>((f.x+a*f.ux+b*f.nx)*10).toFixed(1)+','+
   ((f.z+a*f.uz+b*f.nz)*10).toFixed(1)).join(' ');
}
function mapPlayerPose(){
 return {x:player.x,z:player.z,heading:player.yaw};
}
function mapAssignedSets(){
 const out=[];
 for(const set of DB.sets){
  const place=rowForSet(set.id);
  if(place)out.push({id:set.id,name:set.name,face:place[0],row:place[1]});
 }
 return out.sort((a,b)=>Number(pinnedSets.has(b.id))-Number(pinnedSets.has(a.id))||a.name.localeCompare(b.name));
}
function mapRowAdvice(s,r){
 const contents=slots[s][r],ids=contents.filter(isFigure);
 if(!ids.length)return {missing:[],wrong:[],text:'EMPTY · READY FOR A COLLECTION'};
 const present=new Set(ids.map(setNumber));
 const missing=Array.from({length:10},(_,i)=>i+1).filter(n=>!present.has(n));
 const wrong=contents.map((id,i)=>isFigure(id)&&setNumber(id)!==i+1?i+1:null).filter(Boolean);
 return {missing,wrong,text:isPerfectRow(s,r)?'PERFECT · ALL TEN IN ORDER':
  !missing.length?'ALL FOUND · '+wrong.length+' OUT OF ORDER':
  'STILL NEED #'+missing.join(', #')};
}
// HUNT and Almanac share this exact map link for already-started collections.
// No loose or hidden figure coordinates are inspected or shown.
function showCollectionShelfOnMap(sid){
 if(!Number.isInteger(sid)||!DB.sets[sid])return false;
 const assigned=rowForSet(sid);
 if(!assigned)return false;
 const shelf=shelves[assigned[0]],fixture=shelf.fixture;
 mapHighlightedSet=sid;
 mapSelectedFaceId=assigned[0];
 mapSelectedFixtureId=fixture.id;
 mapPanTarget={x:fixture.x,z:fixture.z};
 mapZoom=true;
 openDrawer('map');
 return true;
}

function mapTaskCounts(){
 let dirtyFaces=0,unsortedRows=0;
 for(let face=0;face<NUM_RACKS;face++){
  if(faceCleaning[face]<3)dirtyFaces++;
  for(let row=0;row<ROWS;row++)if(rowCount(face,row)===PER_ROW&&!isPerfectRow(face,row))unsortedRows++;
 }
 return {dirtyFaces,unsortedRows};
}
function mapJumpToFace(face,highlightedSet=null){
 const shelf=shelves[face];if(!shelf)return false;
 mapSelectedFaceId=face;mapSelectedFixtureId=shelf.fixture.id;mapHighlightedSet=highlightedSet;
 centerMapOn(shelf.fixture.x,shelf.fixture.z);return true;
}
function mapNextDirtyFace(){
 const start=Number.isInteger(mapSelectedFaceId)?mapSelectedFaceId:-1;
 for(let i=1;i<=NUM_RACKS;i++){
  const face=(start+i+NUM_RACKS)%NUM_RACKS;
  if(faceCleaning[face]<3)return mapJumpToFace(face);
 }
 return false;
}
function mapNextUnsortedRow(){
 const start=Number.isInteger(mapSelectedFaceId)?mapSelectedFaceId:-1;
 for(let i=1;i<=NUM_RACKS;i++){
  const face=(start+i+NUM_RACKS)%NUM_RACKS;
  for(let r=0;r<ROWS;r++){
   if(rowCount(face,r)!==PER_ROW||isPerfectRow(face,r))continue;
   const id=rows[face][r][0],sid=isFigure(id)?figure(id).setId:null;
   return mapJumpToFace(face,sid);
  }
 }
 return false;
}
function mapBrowseUnit(delta){
 const at=Number.isInteger(mapSelectedFixtureId)?mapSelectedFixtureId:0;
 const next=fixtures[(at+delta+fixtures.length)%fixtures.length];
 mapSelectedFixtureId=next.id;mapSelectedFaceId=mapFaceIds(next)[0];mapHighlightedSet=null;
 if(mapZoom)centerMapOn(next.x,next.z);else paintStoreMap();
 return next.id;
}
function centerMapOn(x,z){
 mapZoom=true;mapPanTarget={x,z};paintStoreMap();
}
function renderStoreMap(){
 if(mapSelectedFixtureId===null){
  let best=fixtures[0],dist=Infinity;
  for(const f of fixtures){
   const d=(f.x-player.x)**2+(f.z-player.z)**2;
   if(d<dist){best=f;dist=d;}
  }
  mapSelectedFixtureId=best.id;
 }
 paintStoreMap();
}
function paintStoreMap(){
 const selected=fixtures[mapSelectedFixtureId]||fixtures[0];
 mapSelectedFixtureId=selected.id;
 const faceIds=mapFaceIds(selected);
 if(!faceIds.includes(mapSelectedFaceId))mapSelectedFaceId=faceIds[0];
 const selectedFace=mapSelectedFaceId;
 const previousMap=$('storeMapFrame'),
   oldScroll=previousMap?{left:previousMap.scrollLeft,top:previousMap.scrollTop}:null,
   oldDrawerTop=previousMap?$('drawerBody').scrollTop:0;
 const p=mapPlayerPose(),heading=p.heading*180/Math.PI;
 let pieces='';
 for(const f of fixtures){
  const status=mapFixtureSummary(f),
    active=f.id===selected.id,
    label=mapFixtureLabel(f);
  const type=status.perfect===status.capacity?'all-perfect':
   status.cleaned===0?'dirty':status.occupied?'occupied':'ready';
  pieces+=`<g class="map-fixture ${type}${active?' selected':''}" role="button" tabindex="0"
   data-map-fixture="${f.id}" aria-label="${safeText(label)}: ${status.occupied} occupied rows, ${status.perfect} perfect">
   <title>${safeText(f.kind==='floor'?'AISLE '+f.aisle:'WALL '+f.section)} · ${status.occupied}/${status.capacity} rows assigned</title>
   <polygon points="${mapFixturePoly(f)}"></polygon>
   <text x="${(f.x*10).toFixed(1)}" y="${(f.z*10+3).toFixed(1)}" text-anchor="middle">${label}</text>
  </g>`;
 }
 const svg=`<svg id="storeMapSvg" class="store-map-svg" viewBox="0 0 700 740"
   xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Interactive overhead floor plan. Tap a shelf to inspect both display faces.">
   <defs><pattern id="mapTiles" patternUnits="userSpaceOnUse" width="40" height="40">
    <rect width="40" height="40" fill="#2a2438"></rect>
    <path d="M40 0H0V40" stroke="#49364e" stroke-width="1" fill="none"></path>
   </pattern></defs>
   <rect x="8" y="8" width="684" height="724" rx="5" fill="url(#mapTiles)" stroke="#b98f77" stroke-width="8"></rect>
   <text class="map-compass" x="350" y="28" text-anchor="middle">N ↑</text>
   ${pieces}
   ${decorMap.svg(shelves)}
   <path d="M300 733 L300 711 L400 711 L400 733" fill="none" stroke="#d3ecb2" stroke-width="5"></path>
   <text class="map-entry" x="350" y="705" text-anchor="middle">ENTRANCE</text>
   <g class="map-player" transform="translate(${(p.x*10).toFixed(2)} ${(p.z*10).toFixed(2)}) rotate(${heading.toFixed(1)})">
    <circle r="22" fill="#9ff6db33" stroke="#a8f5d9" stroke-width="3"></circle>
    <path d="M0 -19 L-12 11 L0 5 L12 11Z" fill="#b9ffe4" stroke="#143542" stroke-width="3"></path>
   </g>
  </svg>`;
 const chosen=mapFixtureSummary(selected);
 const facesMarkup=faceIds.map(id=>{
  const shelf=shelves[id];
  return `<button class="map-face-switch${id===selectedFace?' active':''}"
     data-map-face="${id}" aria-pressed="${id===selectedFace}">
    ${safeText(selected.kind==='wall'?selected.section+' WALL':shelf.face===1?'FRONT FACE':'REAR FACE')}
    <small>${faceCleaning[id]===3?'CLEAN':'DIRTY · '+(faceCleaning[id]+'/3')}</small>
   </button>`;
 }).join('');
 let rowMarkup='';
 for(let r=0;r<ROWS;r++){
  const contents=slots[selectedFace][r],items=rows[selectedFace][r],
    sid=items.length?figure(items[0]).setId:null,
    status=isPerfectRow(selectedFace,r)?'perfect':items.length===10?'unsorted':items.length?'partial':'empty',
    name=sid!==null?DB.sets[sid].name:'UNASSIGNED ROW',
    slotList=contents.map((id,k)=>`<span class="map-slot${isFigure(id)?' occupied':''}${isFigure(id)&&setNumber(id)!==k+1?' wrong-order':''}"
      title="Position ${k+1}${isFigure(id)?', figure #'+setNumber(id):', empty'}">${isFigure(id)?setNumber(id):'·'}</span>`).join('');
  rowMarkup+=`<div class="map-row ${status}${sid===mapHighlightedSet?' highlighted':''}">
   <div class="map-row-head"><strong>ROW ${r+1}</strong>
     ${sid===null?`<span class="map-row-name">${name}</span>`:
      `<button class="map-row-name" data-map-set="${sid}" title="Open collection in almanac">
        ${pinnedSets.has(sid)?'★ ':''}${safeText(name)} <span aria-hidden="true">↗</span></button>`}
     <span class="map-row-status">${status==='perfect'?'★ PERFECT':status==='unsorted'?'SORT 1–10':items.length+'/10'}</span>
   </div><div class="map-slot-grid" aria-label="Shelf row slots left to right">${slotList}</div>
   ${sid!==null?`<div class="map-row-advice">${safeText(mapRowAdvice(selectedFace,r).text)}</div>`:''}
  </div>`;
 }
 const assigned=mapAssignedSets(),tasks=mapTaskCounts();
 const options=assigned.map(item=>`<option value="${item.id}"${item.id===mapHighlightedSet?' selected':''}>
  ${pinnedSets.has(item.id)?'★ ':''}${safeText(item.name)} · ${safeText(shelves[item.face].name)} · ROW ${item.row+1}</option>`).join('');
 const result=`<div class="map-note">Tap a shelf on the plan. View its front or rear face, then inspect any named collection. The map shows <b>your current location</b> but never reveals loose figurines.</div>
  <div class="map-info-strip">✦ YOU ARE IN ${safeText(nearestAisle())} · FACING ${((heading%360)+360)%360|0}°
    <span>SHELVES ${cleanedFaceCount()}/60 · FLOOR ${floorCleanedCount()}/45 · HIDDEN ${hiddenRevealed.size}/18</span></div>
  <div class="map-tools">
   <div class="map-task-summary" aria-label="Remaining work on display shelves">
    <span>${tasks.dirtyFaces} FACES NEED CLEANING</span>
    <span>${tasks.unsortedRows} FULL ROWS NEED SORTING</span>
   </div>
   <div class="map-task-actions" role="group" aria-label="Find a shelf task">
    <button type="button" id="mapNextDirty" ${tasks.dirtyFaces?'':'disabled'}>✧ FIND DIRTY SHELF</button>
    <button type="button" id="mapNextUnsorted" ${tasks.unsortedRows?'':'disabled'}>↔ FIND UNSORTED SET</button>
   </div>
   <div class="map-unit-nav" role="group" aria-label="Browse all forty shelf units">
    <button type="button" id="mapPreviousUnit">‹ PREV UNIT</button>
    <span>UNIT ${selected.id+1} / ${fixtures.length}</span>
    <button type="button" id="mapNextUnit">NEXT UNIT ›</button>
   </div>
   <label class="map-find-label" for="mapFindSet">FIND A SET ALREADY ON A SHELF</label>
   <select id="mapFindSet" class="map-find-set" aria-label="Find an assigned collection">
     <option value="">${assigned.length} STARTED COLLECTIONS · CHOOSE ONE</option>
     ${options}
   </select>
   <div class="map-zoom-controls" role="group" aria-label="Map zoom">
    <button class="map-zoom-btn${!mapZoom?' active':''}" data-map-zoom="fit" aria-pressed="${!mapZoom}">FIT STORE</button>
    <button class="map-zoom-btn${mapZoom?' active':''}" data-map-zoom="zoom" aria-pressed="${mapZoom}">ZOOM 2× · DRAG</button>
   </div>
   <div class="map-center-controls">
    <button type="button" id="mapCenterPlayer" class="map-center-btn">⌖ FIND ME</button>
    <button type="button" id="mapCenterShelf" class="map-center-btn">◉ CENTER SELECTED SHELF</button>
   </div>
  </div>
  ${decorMap.controls()}
  <div id="storeMapFrame" class="store-map-frame${mapZoom?' zoomed':''}">${svg}</div>
  <div class="map-legend"><span>▲ PLAYER</span><span>■ DIRTY</span><span>■ IN USE</span><span>★ PERFECT</span></div>
  <section class="map-detail">
   <h3>${selected.kind==='floor'?'AISLE '+selected.aisle+' · UNIT '+(Math.floor(selected.id/4)+1):
      selected.section+' WALL · DISPLAY '+(selected.wallIndex%5+1)}</h3>
   <div class="map-unit-total">${chosen.occupied}/${chosen.capacity} ROWS ASSIGNED · ${chosen.perfect} PERFECT</div>
   <div class="map-face-controls">${facesMarkup}</div>
   <div class="map-rows">${rowMarkup}</div>
  </section>`;
 $('drawerBody').innerHTML=result;
 const body=$('drawerBody');
 body.scrollTop=oldDrawerTop;
 const nowMap=$('storeMapFrame');
 if(nowMap){
  if(mapPanTarget&&mapZoom){
   const targetSvg=$('storeMapSvg'),width=targetSvg?.clientWidth||Math.max(600,(nowMap.clientWidth||300)*2),
    height=targetSvg?.clientHeight||width*740/700,
    viewportWidth=nowMap.clientWidth||300,viewportHeight=nowMap.clientHeight||340;
   nowMap.scrollLeft=Math.max(0,mapPanTarget.x/70*width-viewportWidth/2);
   nowMap.scrollTop=Math.max(0,mapPanTarget.z/74*height-viewportHeight/2);
  }else if(oldScroll){nowMap.scrollLeft=oldScroll.left;nowMap.scrollTop=oldScroll.top;}
 }
 mapPanTarget=null;
 $('mapPreviousUnit').onclick=()=>mapBrowseUnit(-1);
 $('mapNextUnit').onclick=()=>mapBrowseUnit(1);
 $('mapNextDirty').onclick=mapNextDirtyFace;
 $('mapNextUnsorted').onclick=mapNextUnsortedRow;
 $('mapCenterPlayer').onclick=()=>{
  const p=mapPlayerPose();
  let nearest=fixtures[0],best=Infinity;
  for(const f of fixtures){
   const d=(f.x-p.x)**2+(f.z-p.z)**2;
   if(d<best){best=d;nearest=f;}
  }
  mapSelectedFixtureId=nearest.id;mapSelectedFaceId=mapFaceIds(nearest)[0];mapHighlightedSet=null;
  centerMapOn(p.x,p.z);
 };
 $('mapCenterShelf').onclick=()=>centerMapOn(selected.x,selected.z);
 decorMap.bind(body,()=>paintStoreMap());
 $('mapFindSet').onchange=()=>{
  const value=$('mapFindSet').value;
  if(value==='')return;
  const id=Number(value);
  const selectedSet=assigned.find(x=>x.id===id);
  if(!selectedSet)return;
  mapSelectedFaceId=selectedSet.face;
  mapSelectedFixtureId=shelves[selectedSet.face].fixture.id;
  mapHighlightedSet=selectedSet.id;
  centerMapOn(shelves[selectedSet.face].fixture.x,shelves[selectedSet.face].fixture.z);
 };
 body.querySelectorAll('[data-map-zoom]').forEach(el=>el.onclick=()=>{
  mapZoom=el.getAttribute('data-map-zoom')==='zoom';
  paintStoreMap();
 });
 const selectFixture=e=>{
  const target=e.target.closest('[data-map-fixture]');if(!target)return;
  const id=Number(target.getAttribute('data-map-fixture'));
  if(!Number.isInteger(id)||!fixtures[id])return;
  mapSelectedFixtureId=id;mapSelectedFaceId=mapFaceIds(fixtures[id])[0];
  mapHighlightedSet=null;
  if(mapZoom)centerMapOn(fixtures[id].x,fixtures[id].z);else paintStoreMap();
 };
 body.querySelectorAll('[data-map-fixture]').forEach(el=>{
  el.addEventListener('click',selectFixture);
  el.addEventListener('keydown',e=>{
   if(e.key==='Enter'||e.key===' '){e.preventDefault();selectFixture(e);}
  });
 });
 body.querySelectorAll('[data-map-face]').forEach(el=>el.onclick=()=>{
  mapSelectedFaceId=Number(el.getAttribute('data-map-face'));paintStoreMap();
 });
 body.querySelectorAll('[data-map-set]').forEach(el=>el.onclick=()=>{
  const sid=Number(el.getAttribute('data-map-set'));
  if(!Number.isInteger(sid)||!DB.sets[sid])return;
  openDrawer('album');renderSetDetail(sid);
 });
}

function showAlbumListAtSavedPosition(){
 renderAlbum();
 $('drawerBody').scrollTop=albumReturnScroll;
}
function nextAlbumSet(sid,direction){
 const ids=albumCatalog().map(x=>x.id),i=ids.indexOf(sid);
 if(!ids.length)return false;
 const next=i<0?(direction<0?ids.length-1:0):(i+direction+ids.length)%ids.length;
 renderSetDetail(ids[next]);$('drawerBody').scrollTop=0;
 return true;
}
function renderSetDetail(sid){
 if(!Number.isInteger(sid)||!DB.sets[sid])return;
 activeSet=sid;
 const set=DB.sets[sid],place=rowForSet(sid),
  p=albumSetStatus(sid),status=p.perfect?'★ PERFECTLY ORDERED 1–10':
   p.shelved===10?'FULL · REARRANGE INTO 1–10':
   p.shelved?'COLLECTION IN PROGRESS':'COLLECTION NOT STARTED';
 const checklist=huntSnapshot(sid);
 const needToShelf=checklist.numbers.filter(n=>!n.shelved).map(n=>n.number);
 const outOfOrder=checklist.numbers.filter(n=>n.shelved&&!n.correct);
 const heading=`<div class="folio-detail-top">
  <div class="folio-detail-nav">
    <button class="back folio-back" id="backAlbum">← COLLECTION LIST</button>
    <button type="button" class="folio-pin${pinnedSets.has(sid)?' active':''}"
       id="pinCollection" aria-pressed="${pinnedSets.has(sid)}">${pinnedSets.has(sid)?'★ PINNED':'☆ PIN THIS SET'}</button>
   </div>
   <div class="folio-page-turn">
    <button type="button" id="prevCollection">‹ PREVIOUS SET</button>
    <span>${albumCatalog().some(x=>x.id===sid)?(albumCatalog().findIndex(x=>x.id===sid)+1)+' / '+albumCatalog().length+' IN FILTER':'OUTSIDE CURRENT FILTER'}</span>
    <button type="button" id="nextCollection">NEXT SET ›</button>
   </div>
  ${place?'<button id="showOnMap" class="map-jump">⌖ FIND THIS SHELF ON THE STORE MAP</button>':''}
  <span class="folio-eyebrow">COLLECTION ${String(sid+1).padStart(3,'0')} / 300</span>
  <h3>${safeText(set.name)}</h3>
  <div class="folio-detail-theme">${safeText(set.theme)} · ${p.seen} DISCOVERED / 10 · ${p.shelved} ON DISPLAY / 10</div>
  <div class="folio-detail-status${p.perfect?' mastered':''}">${status}
    ${p.mastered?'<span>✦ MASTERED AT LEAST ONCE</span>':''}
  </div>
  ${place?`<div class="folio-detail-place">${safeText(shelves[place[0]].name)} · ROW ${place[1]+1}</div>`:
   '<div class="folio-detail-place">NO DISPLAY ROW HAS BEEN STARTED</div>'}
  </div>`;
 let slotsPanel='';
 if(place){
  const current=slots[place[0]][place[1]];
  slotsPanel=`<div class="folio-order-panel"><strong>YOUR SHELF · LEFT TO RIGHT</strong>
   <div class="map-slot-grid">${current.map((id,k)=>`<span class="map-slot${isFigure(id)?' occupied':''}${isFigure(id)&&setNumber(id)!==k+1?' wrong-order':''}"
      title="Slot ${k+1}${isFigure(id)?' holds #'+setNumber(id):' is empty'}">${isFigure(id)?setNumber(id):'·'}</span>`).join('')}</div>
   <p>${p.perfect?'PERFECT! EVERY NUMBER IS IN ITS CORRECT SLOT.':
       'A full row only counts as complete when it reads 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.'}</p>
   </div>`;
 }
 const tasks=`<div class="folio-tasks">
   <strong class="folio-tasks-heading">YOUR COLLECTION CHECKLIST</strong>
   <div class="folio-tasks-grid">${checklist.numbers.map(n=>{
    const state=n.shelved?(n.correct?'correct':'misplaced'):n.held?'held':n.seen?'found':'unseen';
    const label=n.shelved?(n.correct?'IN RIGHT SLOT':'SHELVED IN SLOT '+n.slot):
      n.held?'IN HAND':n.seen?'DISCOVERED':'NOT YET SEEN';
    return `<div class="folio-task ${state}" title="#${n.number} · ${label}">
       <b>#${n.number}</b><small>${n.shelved?(n.correct?'✓':'↔'):n.held?'H':n.seen?'◇':'?'}</small></div>`;
    }).join('')}</div>
   <p>${checklist.perfect?'★ ALL TEN FIGURINES ARE PERFECTLY ARRANGED.':
    needToShelf.length?'NEED ON SHELF: #'+needToShelf.join(', #'):
    'ALL TEN ON SHELF · '+outOfOrder.length+' IN INCORRECT POSITIONS.'}</p>
   <div class="folio-task-key">✓ RIGHT SLOT · ↔ MOVE IT · H HELD · ◇ FOUND · ? UNKNOWN</div>
  </div>`;
 let html=heading+tasks+slotsPanel+`<div class="folio-figure-heading">THE TEN MINIATURES
  <small>DISCOVER A FIGURE BY FINDING OR INSPECTING IT IN THE SHOP</small></div>
 <div class="folio-figure-grid">`;
 for(const id of set.memberIds){
  const observed=seenFigures.has(id),num=setNumber(id),f=figure(id),
   location=figurineLocation(id),
   status=slots.some(rack=>rack.some(row=>row.includes(id)))?'ON SHELF':
    tote.includes(id)?'IN YOUR HAND':observed?'DISCOVERED · NOT SHELVED':'UNDISCOVERED';
  if(observed){
   html+=`<button type="button" class="folio-figure-card observed" data-inspect-figure="${id}"
     aria-label="Inspect #${num}, ${safeText(f.name)}">
    <span class="folio-figure-art">${iconHTML(id)}</span>
    <span class="folio-figure-copy"><b>#${num} · ${safeText(f.name)}</b>
     <small>${safeText(f.role)}</small><em>${status}</em></span>
    <span class="folio-figure-glass" aria-hidden="true">⌕</span>
   </button>`;
  }else{
   html+=`<div class="folio-figure-card unknown" aria-label="Figure #${num} not yet discovered">
    <span class="folio-figure-art">${iconHTML(id)}</span>
    <span class="folio-figure-copy"><b>#${num} · ???</b>
     <small>UNKNOWN MINIATURE</small><em>FIND IT IN THE SHOP</em></span>
    <span class="folio-figure-glass" aria-hidden="true">?</span>
   </div>`;
  }
 }
 html+='</div><div class="folio-footnote">A figure’s identity and collector note are revealed only after you find or inspect it in the shop. The book never shows loose figurine coordinates.</div>';
 $('drawerBody').innerHTML=html;
 $('backAlbum').onclick=showAlbumListAtSavedPosition;
 $('pinCollection').onclick=()=>{
  const pinned=togglePinnedSet(sid),btn=$('pinCollection');
  btn.textContent=pinned?'★ PINNED':'☆ PIN THIS SET';
  btn.classList.toggle('active',pinned);
  btn.setAttribute('aria-pressed',String(pinned));
 };
 $('prevCollection').onclick=()=>nextAlbumSet(sid,-1);
 $('nextCollection').onclick=()=>nextAlbumSet(sid,1);
 if(place)$('showOnMap').onclick=()=>showCollectionShelfOnMap(sid);
 $('drawerBody').querySelectorAll('[data-inspect-figure]').forEach(el=>
  el.onclick=()=>openInspection(Number(el.getAttribute('data-inspect-figure'))));
}

function grabFig(id){
 if(tote.length>=MAX_TOTE){notify('HANDS FULL — PLACE OR PUT DOWN YOUR FIGURE FIRST','bad');return}
 const f=floor[id];if(!f||!f.onFloor||f.hidden)return;
 // A previously dropped figure cannot remain in the saved floor-override
 // map after it becomes the one figure in the player's hand.
 // Otherwise backup validation sees a duplicated on-floor figure ID.
 f.onFloor=false;groundPositions.delete(id);tote.push(id);selected=id;lastPlacement=null;pulseReticle();
 const newFind=markFigSeen(id);
 stats();save();notify((newFind?'✦ NEW DISCOVERY · ':'PICKED UP · ')+figure(id).name+' · '+DB.sets[figure(id).setId].name);
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
    kind:!tote.length&&faceCleaning[shelf.id]<3?'mess':!tote.length&&isFigure(displayed)?'shelf-figure':'shelf',
    id:shelf.id,row:r,slot:aimedSlot,dist:depth,figureId:displayed
   };
   if(!shelfFocus||depth<shelfFocus.dist)shelfFocus=candidate;
  }
 }
 // The same center reticle targets floor rubbish, boxes and scuffs.
 // Only 45 fixed positions exist, and only those in a 5.3-unit radius
 // undergo projection. No sprite allocations or spatial-grid scans.
 let nearestMess=null;
 for(const m of ambientMess){
  if(ambientCompleted(m))continue;
  const dist=Math.hypot(m.x-player.x,m.z-player.z);
  if(dist>5.3||dist<.35||shelfOccludes(m))continue;
  const depth=cameraDepth(m.x,m.z);
  if(depth<.3||depth>5.3)continue;
  const stage=floorCleaning[m.id],height=m.kind===1&&stage===0?.3:.04;
  const point=project(m.x,m.z,height);
  const halfWidth=Math.max(9,Math.min(110,FOCAL/depth*(m.kind===1?.65:.85)));
  const halfHeight=Math.max(10,Math.min(85,FOCAL/depth*(m.kind===1?.35:.25)));
  if(Math.abs(AIM_X-point.x)>halfWidth||Math.abs(AIM_Y-point.y)>halfHeight)continue;
  if(!nearestMess||depth<nearestMess.dist)
   nearestMess={kind:'floor-mess',id:m.id,dist:depth};
 }
 if(tote.length){
  if(nearestMess&&(!shelfFocus||nearestMess.dist<shelfFocus.dist-.2))return nearestMess;
  return shelfFocus;
 }
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
 const groundFocus=nearestFloor&&(!nearestMess||nearestFloor.dist<=nearestMess.dist+.12)?
  nearestFloor:nearestMess;
 if(groundFocus&&(!shelfFocus||groundFocus.dist<=shelfFocus.dist+.1))return groundFocus;
 const monumentFocus=finaleUnlocked&&!shelfOccludes(FINALE.monument)?
  FINALE.target(player,project,AIM_X,AIM_Y):null;
 const normal=shelfFocus||groundFocus;
 if(monumentFocus&&(!normal||monumentFocus.dist<normal.dist-.2))return monumentFocus;
 return normal;
}
function interact(){
 if(showcaseActive)return;
 if(!$('roomPreviewHud').hidden||decorEngine.previewState())return;
 if(modal==='inspect'){closeInspection();return;}
 if(modal){closeDrawer();return;}
 prepareOcclusion();focus=findFocus();
 if(!focus){notify(tote.length?'AIM AT A SHELF SLOT OR PUT DOWN FIGURINE':'AIM AT A FIGURINE OR MESS','bad');return;}
 if(focus.kind==='monument')openFinale();
 else if(focus.kind==='figure')grabFig(focus.id);
 else if(focus.kind==='mess')cleanShelfFace(focus.id);
 else if(focus.kind==='floor-mess')cleanAmbient(focus.id);
 else if(focus.kind==='shelf-figure')grabShelfFig(focus.id,focus.row,focus.slot);
 else if(tote.length)placeDirect(focus.id,focus.row,focus.slot);
 else notify('EMPTY SLOT · PICK UP A FIGURINE FIRST');
}
function updateFocus(){
 focus=findFocus();const box=$('interact'),reticle=$('crosshair');
 reticle.classList.remove('aim-pick','aim-place','aim-denied');
 // Only when the collector reticle has no active pickup/clean/sort target:
 // never override a core figurine interaction or the room preview.
 worldArtTarget=(!modal&&!focus&&playing&&$('roomPreviewHud').hidden&&!decorEngine.previewState())?
  worldDecor.find():null;
 const worldArtPanel=$('worldArtFocus');
 worldArtPanel.hidden=!worldArtTarget;
 if(worldArtTarget){
  $('worldArtName').textContent=worldArtTarget.name.toUpperCase();
  $('worldArtLocation').textContent=worldArtTarget.siteName;
 }
 updateDecorPreviewHud();
 const cleaningFocus=focus&&(focus.kind==='mess'||focus.kind==='floor-mess');
 $('cleanStage').hidden=!cleaningFocus||!!modal||!playing;
 if(cleaningFocus){
  const n=focus.kind==='mess'?faceCleaning[focus.id]:floorCleaning[focus.id],
   max=focus.kind==='mess'?3:AMBIENT_ACTIONS[ambientMess[focus.id].kind].length;
  $('cleanStageLabel').textContent=(tote.length?'HANDS FULL · ':'')+'CLEANING '+n+'/'+max;
  $('cleanStageFill').style.width=Math.round(n/max*100)+'%';
 }
 const inspectable=!!tote.length||!!(focus&&(focus.kind==='figure'||focus.kind==='shelf-figure'));
 $('inspectBtn').hidden=!playing||!!modal||!inspectable;
 if(!focus||modal||!playing){
  box.classList.add('hidden');
  $('actionLabel').textContent=tote.length?'PLACE':'PICK UP';return;
 }
 box.classList.remove('hidden');
 if(focus.kind==='monument'){
  $('interactName').textContent='♛ COLLECTOR’S MONUMENT';
  $('interactDescription').textContent='EXCLUSIVE · EAST ENTRANCE · REPLAY YOUR FINALE';
  $('actionLabel').textContent='VIEW';
  reticle.classList.add('aim-pick');
 }else if(focus.kind==='figure'){
  const f=figure(focus.id);
  $('interactName').textContent=f.name.toUpperCase()+' · #'+setNumber(focus.id)+'/10';
  $('interactDescription').textContent=DB.sets[f.setId].name+' · PICK UP';
  $('actionLabel').textContent='PICK UP';
  reticle.classList.add('aim-pick');
 }else if(focus.kind==='floor-mess'){
  const m=ambientMess[focus.id],actions=AMBIENT_ACTIONS[m.kind];
  $('interactName').textContent=(m.kind===0?'LOOSE SCRAPS':m.kind===1?'DISCARDED CARTONS':'GRIMY FLOOR');
  $('interactDescription').textContent=floorTask(focus.id)+' · STEP '+(floorCleaning[m.id]+1)+'/'+actions.length+
    (tote.length?' · PUT DOWN HELD FIGURE FIRST':' · EMPTY HANDS');
  $('actionLabel').textContent=tote.length?'HANDS FULL':'CLEAN';
  reticle.classList.add(tote.length?'aim-denied':'aim-pick');
 }else if(focus.kind==='mess'){
  $('interactName').textContent='DIRTY · '+shelves[focus.id].name;
  $('interactDescription').textContent=faceTask(focus.id)+' · STEP '+(faceCleaning[focus.id]+1)+'/3 · EMPTY HANDS';
  $('actionLabel').textContent='CLEAN';
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
 const roomFloor=decorEngine.room.floor();
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
   let r=check?roomFloor[0]:roomFloor[3],g=check?roomFloor[1]:roomFloor[4],b=check?roomFloor[2]:roomFloor[5];
   if(grout){r-=20;g-=17;b-=19;}
   if(grain===1){r+=7;g+=7;b+=9;}
   dat[i++]=r*(1-fog)+roomFloor[6]*fog;
   dat[i++]=g*(1-fog)+roomFloor[7]*fog;
   dat[i++]=b*(1-fog)+roomFloor[8]*fog;
   dat[i++]=255;
   wx+=incrX;wz+=incrZ;
  }
 }
 if(start<H)ctx.putImageData(floorBuffer,0,0,0,start,W,H-start);
}
function solidQuad(a,b,c,d,color){
 const clipped=VIS.clipNear([a,b,c,d]);
 if(clipped.length<3)return;
 ctx.beginPath();const first=screenPoint(clipped[0]);ctx.moveTo(first.x,first.y);
 for(let i=1;i<clipped.length;i++){const v=screenPoint(clipped[i]);ctx.lineTo(v.x,v.y);}
 ctx.closePath();ctx.fillStyle=color;ctx.fill();
}
// The same near-plane polygon is used for shelf silhouettes AND the
// shelf-row sprites. At grazing angles, figurines cannot paint outside
// their physical facade or be drawn behind the viewer.
function clipShelfRow(f,front,bottom,top){
 const quad=VIS.clipNear([
  shelfProject(f,-f.w/2,front,top),shelfProject(f,f.w/2,front,top),
  shelfProject(f,f.w/2,front,bottom),shelfProject(f,-f.w/2,front,bottom)
 ]);
 if(quad.length<3)return false;
 ctx.beginPath();const first=screenPoint(quad[0]);ctx.moveTo(first.x,first.y);
 for(let i=1;i<quad.length;i++){const p=screenPoint(quad[i]);ctx.lineTo(p.x,p.y);}
 ctx.closePath();ctx.clip();return true;
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
 const roomWall=decorEngine.room.wall();
 let {x1,z1,x2,z2}=wall;const d1=cameraDepth(x1,z1),d2=cameraDepth(x2,z2);
 if(d1<.15&&d2<.15)return;
 if(d1<.15){const t=(.15-d1)/(d2-d1);x1+=(x2-x1)*t;z1+=(z2-z1)*t;}
 else if(d2<.15){const t=(.15-d2)/(d1-d2);x2+=(x1-x2)*t;z2+=(z1-z2)*t;}
 solidQuad(project(x1,z1,4.8),project(x2,z2,4.8),project(x2,z2,0),project(x1,z1,0),
  wall.n%2?roomWall[0]:roomWall[1]);
 for(const h of [.25,4.35])line3(x1,z1,h,x2,z2,h,h===.25?roomWall[2]:roomWall[3],h===4.35?2.5:2);
 // Shelves now provide the environmental detail; no giant wall slogans.
}
// Dust, cobweb and packaging are procedural lightweight world geometry.
// No atlas, texture, or canvas allocation is added to the renderer.
function drawShelfGrime(f,faceId,facing,front,depth){
 const progress=faceCleaning[faceId];
 if(progress>=3||depth>25)return;
 const dd=front+facing*.15,w=f.w/2;
 if(progress===0){
  ctx.globalAlpha=.31;
  shelfPanel(f,dd,.19,4.1,'#aaa0a8');
  ctx.globalAlpha=1;
  for(let r=0;r<5;r++)for(let n=0;n<4;n++){
   const u=-w+(n+.35+(r%2)*.2)*f.w/4,y=.49+r*.72;
   shelfBeam(f,u,dd+facing*.02,y,u+.31,dd+facing*.02,y+.016,
    n%2?'#b2aaa0':'#cab9a3',Math.max(1,FOCAL/Math.max(4,depth)*.012));
  }
 }
 if(progress<=1){
  for(const side of [-1,1]){
   const u=side*w,span=Math.min(1.35,f.w*.16);
   for(let t=1;t<=3;t++)
    shelfBeam(f,u,dd,4.08,u-side*span*t/3,dd,4.08-span*(4-t)/4,
     '#d5c6c7',Math.max(.8,FOCAL/Math.max(5,depth)*.009));
   for(let t=1;t<=2;t++)
    shelfBeam(f,u-side*span*t/3,dd,4.08,u-side*span,dd,4.08-span*t/3,
     '#afa7b5',Math.max(.75,FOCAL/Math.max(5,depth)*.007));
  }
 }
 if(progress<=2){
  for(let i=0;i<3;i++){
   const u=-w+(i+.65)*f.w/3,p=shelfProject(f,u,dd,.26);
   if(p.depth<=.3)continue;
   const size=Math.max(2,FOCAL/Math.max(5,p.depth)*.23);
   ctx.fillStyle=i%2?'#896d63':'#be9a70';
   ctx.fillRect(Math.round(p.x-size*.5),Math.round(p.y-size),size,size*.8);
   ctx.fillStyle='#dbbd88';
   ctx.fillRect(Math.round(p.x-size*.32),Math.round(p.y-size*.7),size*.54,Math.max(1,size*.08));
  }
 }
}
function drawShelf(f){
 const shelfMat=decorEngine.room.shelf();
 const rel=(player.x-f.x)*f.nx+(player.z-f.z)*f.nz;
 const facing=f.kind==='wall'?1:(rel>=0?1:-1);
 const d=facing*f.depth/2, depth=Math.max(.3,cameraDepth(f.x,f.z)),sz=FOCAL/Math.max(2.5,depth);
 const faceId=f.kind==='wall'?40+f.wallIndex:f.id*2+(facing===1?0:1);
 const back=-d;
 shelfPanel(f,back,.12,4.15,shelfMat[0]);
 shelfPanel(f,0,.15,4.11,shelfMat[1]);
 const p1=shelfProject(f,-f.w/2,back,4.15),p2=shelfProject(f,-f.w/2,d,4.15),
   p3=shelfProject(f,-f.w/2,d,.12),p4=shelfProject(f,-f.w/2,back,.12);
 solidQuad(p1,p2,p3,p4,'#987053');
 solidQuad(shelfProject(f,f.w/2,d,4.15),shelfProject(f,f.w/2,back,4.15),
  shelfProject(f,f.w/2,back,.12),shelfProject(f,f.w/2,d,.12),'#795466');
 shelfPanel(f,d,.12,4.12,shelfMat[2]);
 const lineW=Math.max(1,sz*.018);
 for(let r=0;r<5;r++){
  const y=.46+r*.72,board=d+facing*.045;
  shelfPanel(f,board,y-.09,y,r%2?shelfMat[4]:shelfMat[3]);
  shelfBeam(f,-f.w/2,board+facing*.008,y,f.w/2,board+facing*.008,y,shelfMat[5],Math.max(1,sz*.014));
  shelfBeam(f,-f.w/2,d+facing*.008,y+.57,f.w/2,d+facing*.008,y+.57,'#7e5a61',Math.max(1,sz*.009));
  if(depth<23){
   for(let slot=1;slot<10;slot++){
    const u=-f.w/2+slot*f.w/10;
    shelfBeam(f,u,d+facing*.05,y+.10,u,d+facing*.05,y+.45,'#695066',Math.max(.6,sz*.006));
   }
   const items=slots[faceId][r];
   if(items.some(isFigure)){
    ctx.save();
    if(clipShelfRow(f,d+facing*.075,y-.025,y+.70)){
     for(let k=0;k<PER_ROW;k++){
      const id=items[k];if(!isFigure(id))continue;
      const u=slotCenter(f,facing,k),dd=d+facing*.075;
      const foot=shelfProject(f,u,dd,y+.04),top=shelfProject(f,u,dd,y+.55);
      const width=Math.max(1,.42*FOCAL/Math.max(.4,foot.depth)),height=foot.y-top.y;
      if(height>=2&&width>1&&foot.depth>.3){
       const worldPos=shelfAt(f,u,dd);
       if(!shelfOccludes(worldPos,f.id)){
        sprites.draw(ctx,id,foot.x-width/2,top.y,width,height);
        if(foot.depth<10&&width>7&&height>12){
         ctx.fillStyle='#24182e';ctx.fillRect(foot.x-6,top.y-10,12,9);
         ctx.fillStyle='#fbe4b2';ctx.font='bold 8px monospace';
         ctx.textAlign='center';ctx.fillText(String(setNumber(id)),foot.x,top.y-3);
        }
       }
      }
     }
    }
    ctx.restore();
   }
   if(isPerfectRow(faceId,r)){
    const marker=shelfProject(f,-f.w/2+.12,d+facing*.15,y+.08);
    if(marker.depth>0&&marker.depth<15){
     ctx.fillStyle='#f6cb76';ctx.fillRect(marker.x,marker.y,Math.min(30,FOCAL/marker.depth*.6),2);
    }
   }
  }
 }
 // Draw purchased finishes on the *actual* five-tier fascia, not detached icons.
 // Transparent preview only; the real shelf material stays untouched.
 const pendingFinish=decorEngine.previewState()?.slot===44+faceId;
 if(pendingFinish){ctx.save();ctx.globalAlpha*=.56;}
 decorEngine.drawShelfFinish(faceId,f,facing,d,depth,shelfPanel,shelfBeam);
 if(pendingFinish)ctx.restore();
 const edge=Math.max(1,sz*.06);
 for(const u of [-f.w/2,f.w/2]){
  shelfBeam(f,u,d,.1,u,d,4.2,u<0?'#d6a978':'#9f726d',edge);
  shelfBeam(f,u,back,.1,u,back,4.2,'#aa805f',edge*.7);
 }
 shelfBeam(f,-f.w/2-.12,d+facing*.06,4.18,f.w/2+.12,d+facing*.06,4.18,'#f6c986',Math.max(1,sz*.035));
 shelfBeam(f,-f.w/2-.12,d+facing*.06,.15,f.w/2+.12,d+facing*.06,.15,'#7f5366',Math.max(1,sz*.04));
 // Low FX: shelf grime artwork suppressed while clean-state interactions remain intact.
 // Short-lived physical slot highlight; just four beams on the affected rack.
 if(slotPulse&&slotPulse.shelfId===faceId){
  const age=performance.now()-slotPulse.at;
  if(age>=0&&age<650){
   const r=slotPulse.rowId,k=slotPulse.slotId,y=.44+r*.72,
    dd=d+facing*.18,left=slotEdge(f,facing,k),right=slotEdge(f,facing,k+1),
    size=Math.max(1.5,(1-age/650)*4.2);
   shelfBeam(f,left,dd,y,right,dd,y,'#fff4b7',size);
   shelfBeam(f,left,dd,y+.68,right,dd,y+.68,'#8bffe0',size);
  }
 }
 // Highlight exactly ONE cubby of the shelf row being targeted.
 if(focus&&['shelf','shelf-figure','mess'].includes(focus.kind)&&focus.id===faceId){
  const r=focus.row,k=focus.slot,y=.44+r*.72,drawD=d+facing*.17,
   left=slotEdge(f,facing,k),right=slotEdge(f,facing,k+1);
  const plan=focus.kind==='shelf'?placementPlan(faceId,r,k,currentSelected()):{ok:true};
  const tint=focus.kind==='mess'?'#b9f7ee':plan.ok?'#9effc7':'#ff8f9f',width=Math.max(1.4,FOCAL/Math.max(3,depth)*.016);
  shelfBeam(f,left,drawD,y,right,drawD,y,tint,width);
  shelfBeam(f,left,drawD,y+.68,right,drawD,y+.68,tint,width);
  shelfBeam(f,left,drawD,y,left,drawD,y+.68,tint,width);
  shelfBeam(f,right,drawD,y,right,drawD,y+.68,tint,width);
 }
}
function beginFloorFigureMask(f,left,width,worldWidth){
 // Preserve the original renderer's small allocation and CPU budgets:
 // only ray-sample sprite edges near potential physical shelf silhouettes.
 if(!VIS.edgeRisk(player,f,worldWidth,sightBlockers))return 0;
 const samples=clamp(Math.round(width/5),3,7);
 const covered=VIS.figureSegments(player,f,worldWidth,p=>!shelfOccludes(p),samples);
 const visible=covered.filter(Boolean).length;
 if(!visible)return -1;
 if(visible===covered.length)return 0;
 ctx.save();ctx.beginPath();
 const step=width/covered.length;
 for(let i=0;i<covered.length;i++)if(covered[i])
  ctx.rect(left+i*step-.5,0,step+1,H);
 ctx.clip();return 1;
}
function drawFig(f){
 const d=cameraDepth(f.x,f.z);if(d<.22||d>viewDistance+1.75)return;
 const s=cameraSide(f.x,f.z);if(Math.abs(s)>d*1.25+1)return;
 const p=project(f.x,f.z,.0),ht=.71*FOCAL/d,wid=ht*.80;
 if(wid<1||p.x+wid<0||p.x-wid>W||p.y-ht>H)return;
 const mask=beginFloorFigureMask(f,Math.round(p.x-wid/2),
  Math.max(1,Math.round(wid)),.71*.80);
 if(mask<0)return;
 // Draw a grounded pixel shadow, then full original sprite cropped from atlas.
 ctx.fillStyle='#1b1424a2';ctx.beginPath();ctx.ellipse(p.x,p.y,Math.max(1,wid*.41),Math.max(1,ht*.065),0,0,Math.PI*2);ctx.fill();
 sprites.draw(ctx,f.id,Math.round(p.x-wid/2),Math.round(p.y-ht),Math.max(1,Math.round(wid)),Math.max(1,Math.round(ht)));
 if(f.id===newlyRevealed&&performance.now()-hiddenRevealMoment<4000){
  ctx.strokeStyle='#a8ffe2';ctx.lineWidth=2;
  ctx.strokeRect(Math.round(p.x-wid/2)-3,Math.round(p.y-ht)-4,
   Math.max(5,Math.round(wid)+6),Math.max(5,Math.round(ht)+7));
  ctx.fillStyle='#fff3bb';ctx.font='bold 12px monospace';ctx.textAlign='center';
  ctx.fillText('!',p.x,p.y-ht-9);
 }
 if(focus&&focus.kind==='figure'&&focus.id===f.id){
  ctx.strokeStyle='#fff3b8';ctx.lineWidth=2;ctx.strokeRect(Math.round(p.x-wid/2)-2,Math.round(p.y-ht)-2,Math.max(4,Math.round(wid)+4),Math.max(4,Math.round(ht)+4));
 }
 if(mask)ctx.restore();
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
 const mask=beginFloorFigureMask(f,Math.round(p.x-width/2),Math.max(2,Math.round(width)),.71*.80);
 if(mask<0)return;
 ctx.drawImage(img,source.atlasX,source.atlasY,32,40,
  Math.round(p.x-width/2),Math.round(p.y-height),Math.max(2,Math.round(width)),Math.max(2,Math.round(height)));
 if(mask)ctx.restore();
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
 const mask=beginFloorFigureMask(f,x,width,.71*.55);
 if(mask<0)return;
 // Deliberately retain the familiar dark outline / bright 16-bit silhouette.
 ctx.fillStyle=DARK_PIXEL;ctx.fillRect(x-1,y+Math.round(height*.36),width+2,Math.max(2,Math.round(height*.57)));
 ctx.fillStyle=col;ctx.fillRect(x,y+Math.round(height*.34),width,Math.max(2,Math.round(height*.38)));
 ctx.fillStyle=LIGHT_PIXEL;ctx.fillRect(x+Math.floor(width*.25),y,Math.max(2,Math.ceil(width*.5)),Math.max(2,Math.round(height*.31)));
 if(mask)ctx.restore();
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
// World-space 16-bit debris geometry; no images, canvases, or extra atlases.
// These are intentionally small, localized accents rather than full-screen FX.
function floorPatchQuad(x,z,w,d,h,color){
 solidQuad(project(x-w/2,z-d/2,h),project(x+w/2,z-d/2,h),
  project(x+w/2,z+d/2,h),project(x-w/2,z+d/2,h),color);
}
function drawCrate(x,z,w,h){
 const v=.55*w;
 const a=project(x-w/2,z-w/2,0),b=project(x+w/2,z-w/2,0),
  c=project(x+w/2,z+w/2,0),d=project(x-w/2,z+w/2,0),
  at=project(x-w/2,z-w/2,h),bt=project(x+w/2,z-w/2,h),
  ct=project(x+w/2,z+w/2,h),dt=project(x-w/2,z+w/2,h);
 solidQuad(dt,ct,c,d,'#886456');
 solidQuad(at,dt,d,a,'#a67d64');
 solidQuad(bt,ct,c,b,'#8d6458');
 solidQuad(at,bt,ct,dt,'#ca9d70');
 line3(x-w/2,z,h*.3,x+w/2,z,h*.3,'#d8ba85',Math.max(1,FOCAL/Math.max(5,cameraDepth(x,z))*.01));
 line3(x,z-w/2,h,x,z+w/2,h,'#edcc91',1.5);
}
function drawAmbientMess(m){
 if(ambientCompleted(m))return;
 const depth=cameraDepth(m.x,m.z);
 if(depth<.27||depth>20||shelfOccludes(m))return;
 const colors=['#cbb39e','#aa8562','#79616d'];
 floorPatchQuad(m.x,m.z,1.42,1.12,.036,colors[m.kind]);
 if(focus?.kind==='floor-mess'&&focus.id===m.id){
  const n=.9;
  for(const [ax,az,bx,bz] of [
   [-n,-n,n,-n],[n,-n,n,n],[n,n,-n,n],[-n,n,-n,-n]])
   line3(m.x+ax,m.z+az,.06,m.x+bx,m.z+bz,.06,'#b2fce4',1.6);
 }
}
function drawCleanFlash(){
 if(!lastAmbientClean)return;
 const age=performance.now()-lastAmbientClean.at;
 if(age>900)return;
 const m=ambientMess[lastAmbientClean.id];
 if(!m||cameraDepth(m.x,m.z)>.5+22)return;
 const radius=.5+age/1300,w=Math.max(1,3*(1-age/900));
 for(const [ax,az,bx,bz] of [
  [-radius,-radius,radius,-radius],[radius,-radius,radius,radius],
  [radius,radius,-radius,radius],[-radius,radius,-radius,-radius]])
  line3(m.x+ax,m.z+az,.09,m.x+bx,m.z+bz,.09,'#d3f8d7',w);
}

function drawRoom(){
 updateVisibleSlope();
 const roomCeiling=decorEngine.room.ceiling();
 ctx.fillStyle=roomCeiling[0];ctx.fillRect(0,0,W,H);
 // Flat posterized ceiling tiles and warmly glowing neon ceiling bulbs.
 for(let y=0;y<Math.min(H,cameraHorizon());y+=18){ctx.fillStyle=y%36===0?roomCeiling[1]:roomCeiling[2];ctx.fillRect(0,y,W,1)}
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
 if(honorSeal)HONORS.floorSeal(ctx,project,honorTrim);
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
  const view=VIS.view(player,f,visibleSlope,36);
  if(view)entities.push({type:'shelf',
   depth:Math.max(view.centerDepth,view.nearDepth),rack:f});
 }
 // Visible fixed ambient clutter is sorted with racks and miniatures so
 // it naturally passes behind foreground figures. No new sprite budget.
 for(const m of ambientMess){
  if(ambientCompleted(m))continue;
  const depth=cameraDepth(m.x,m.z),side=cameraSide(m.x,m.z);
  if(depth>.3&&depth<23&&Math.abs(side)<depth*visibleSlope+1.4&&!shelfOccludes(m))
   entities.push({type:'floor-mess',depth,piece:m});
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
 for(const item of decorEngine.visibleDecor(cameraDepth,cameraSide,visibleSlope,slowFrames>=8?16:24,decorSight.hidden,decorSight.bands,player.yaw))entities.push(item);
 // Bounded physical commemorations: at most eight original graphics.
 if(finaleUnlocked){
  const m=FINALE.monument,d=cameraDepth(m.x,m.z);
  if(d>.45&&d<31&&Math.abs(cameraSide(m.x,m.z))<d*visibleSlope+3&&
     !shelfOccludes(m))entities.push({type:'monument',depth:d,piece:m});
 }
 for(const piece of honorWorld){
  const d=cameraDepth(piece.x,piece.z);
  if(d>.45&&d<31&&Math.abs(cameraSide(piece.x,piece.z))<d*visibleSlope+2 &&
     !shelfOccludes(piece))entities.push({type:'honor',depth:d,piece});
 }
 entities.sort((a,b)=>b.depth-a.depth);
 for(const e of entities){if(e.type==='wall')drawWall(e.wall);else if(e.type==='shelf'){drawShelf(e.rack);
   if(honorPlates)
    HONORS.shelfPlate(ctx,project,e.rack,e.rack.id+1,honorTrim);
  }else if(e.type==='monument')FINALE.draw(ctx,project,solidQuad,line3,honorTrim);else if(e.type==='honor')HONORS.draw(ctx,project,e.piece,honorTrim);else if(e.type==='mid')drawMediumFig(e.piece);else if(e.type==='far')drawFarFig(e.piece);else if(e.type==='floor-mess')drawAmbientMess(e.piece);else if(e.type==='decor')decorEngine.draw(e.itemId,e.slot,project,ctx,player.yaw,false,e.bands);else if(e.type==='decor-ghost')decorEngine.drawGhost(e.itemId,e.slot,project,ctx,player.yaw,e.bands);else drawFig(e.piece);}
 if(glassesEquipped&&!showcaseActive){
  GLASSES.drawHighlights(ctx,entities,project,player,W,H);
  if(glassesTarget)GLASSES.drawArrow(ctx,W,H,player,glassesTarget);
 }
 if(!showcaseActive)drawCleanFlash();
 // Crisp screen-space scanline / colorband effect, sparse enough for mobile.
 ctx.fillStyle='#0a071210';for(let y=2;y<H;y+=4)ctx.fillRect(0,y,W,1);
}
// Phase 6.6: the view is temporarily photographed, never used as a
// navigation/interaction or persistent save position.
function openShowcase(){
 if(!playing||modal||showcaseActive||window.BitBazaarSaveHold||
    window.BitBazaarImportInProgress||!$('roomPreviewHud').hidden||
    decorEngine.previewState())return false;
 showcaseReturnPose={...player};
 showcaseAim={yaw:player.yaw,pitch:player.pitch||0};
 showcaseActive=true;showcaseOverhead=false;showcaseBusy=false;postcardStyle='plain';
 keys.clear();touch.axisX=touch.axisY=0;touch.joyId=null;
 focus=null;worldArtTarget=null;
 $('game').classList.add('showcase-active');
 $('game').setAttribute('data-postcard-style',postcardStyle);
 updatePostcardUI();
 $('showcaseBar').hidden=false;$('showcaseOverhead').hidden=true;
 $('showcaseView').textContent='▦ OVERHEAD';
 $('showcaseHelp').textContent='DRAG TO LOOK · NO FIGURES CAN BE MOVED';
 $('showcaseStatus').textContent='';
 $('showcaseExit').focus({preventScroll:true});
 return true;
}
function closeShowcase(){
 if(!showcaseActive)return false;
 if(showcaseReturnPose)player={...showcaseReturnPose};
 showcaseReturnPose=null;showcaseActive=false;showcaseOverhead=false;
 showcaseBusy=false;keys.clear();
 $('game').classList.remove('showcase-active');
 $('game').removeAttribute('data-postcard-style');
 $('showcaseBar').hidden=true;$('showcaseOverhead').hidden=true;
 $('showcaseBtn').focus({preventScroll:true});
 return true;
}
function updatePostcardUI(){
 const button=$('showcaseFrame'),style=POSTCARDS.styleAt(postcardStyle);
 button.textContent='▧ FRAME: '+(style.id==='plain'?'NONE':style.name);
 button.setAttribute('aria-label','Photo export border: '+style.name+'. Tap to change frame.');
 button.setAttribute('aria-pressed',String(style.id!=='plain'));
 $('game').setAttribute('data-postcard-style',style.id);
}
function cyclePostcardStyle(){
 if(!showcaseActive||showcaseBusy)return false;
 postcardStyle=POSTCARDS.nextStyle(postcardStyle).id;
 updatePostcardUI();
 return postcardStyle;
}
function postcardFacts(){
 return POSTCARDS.facts({shelved:rows.flat(2).length,
  perfect:completedRowCount(),mastered:lifetimePerfect.size,
  decorations:decorEngine.ownedIds().length});
}
function postcardExportCanvas(){
 const image=showcaseFrameCanvas();
 if(!image)return null;
 return POSTCARDS.compose(image,postcardStyle,postcardFacts());
}
function showcaseMapModel(){
 const sites=window.BIT_BAZAAR_DECOR?.slots||[];
 return {fixtures,slots,faceCleaning,player:showcaseReturnPose||player,
  decor:decorEngine.placedSlots().map(([id,site])=>({
   id,site:sites[site]||null}))};
}
function showcaseMapCanvas(){
 const view=$('showcaseOverheadCanvas');
 SHOWCASE.renderOverhead(view,showcaseMapModel());
 return view;
}
function toggleShowcaseView(){
 if(!showcaseActive||showcaseBusy)return false;
 showcaseOverhead=!showcaseOverhead;
 $('showcaseOverhead').hidden=!showcaseOverhead;
 if(showcaseOverhead)showcaseMapCanvas();
 $('showcaseView').textContent=showcaseOverhead?'◎ CAMERA':'▦ OVERHEAD';
 $('showcaseHelp').textContent=showcaseOverhead?
  'ACTUAL SHELVES, ART AND CURRENT PROGRESS':'DRAG TO LOOK · NO FIGURES CAN BE MOVED';
 return showcaseOverhead;
}
function showcaseFrameCanvas(){
 if(!showcaseActive)return null;
 if(showcaseOverhead)return showcaseMapCanvas();
 // A single on-demand render ensures the new drag pose is captured even if
 // the user taps SNAP before the next budgeted 20–24 FPS world draw.
 prepareOcclusion();sprites.frameStart();drawRoom();
 return SHOWCASE.makePhotoCanvas(canvas);
}
async function showcaseCaptureBlob(){
 const picture=postcardExportCanvas();
 if(!picture)throw Error('Photo Mode must be active to capture');
 return SHOWCASE.pngBlob(picture);
}
async function shareShowcasePhoto(){
 if(!showcaseActive||showcaseBusy)return false;
 showcaseBusy=true;
 const kind=showcaseOverhead?'Overhead':'Photo',
  filename='Bit-Bazaar-'+kind+(postcardStyle==='plain'?'':'-'+postcardStyle)+'.png',status=$('showcaseStatus');
 $('showcaseCapture').disabled=true;
 status.textContent='PREPARING '+kind.toUpperCase()+' PNG…';
 try{
  const blob=await showcaseCaptureBlob();
  // File may be absent in older iOS webviews: native Files download must
  // remain available even if the device cannot construct a shareable File.
  const file=typeof File==='function'?new File([blob],filename,{type:'image/png'}):null;
  if(file&&typeof navigator.share==='function'&&
     typeof navigator.canShare==='function'&&navigator.canShare({files:[file]})){
   try{
    await navigator.share({title:'The Bit Bazaar · '+kind,files:[file]});
    status.textContent='PNG SHARED · NO SAVE DATA CHANGED';
    return true;
   }catch(e){
    if(e?.name==='AbortError'){status.textContent='SHARE CANCELLED';return false;}
   }
  }
  // Native iOS Safari Files download, and desktop fallback. No server upload.
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=filename;a.style.display='none';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60_000);
  status.textContent='PNG SAVED · FIND IT IN DOWNLOADS';
  return true;
 }catch(error){
  status.textContent='PNG UNAVAILABLE · '+String(error?.message||'UNKNOWN ERROR').slice(0,80);
  return false;
 }finally{showcaseBusy=false;$('showcaseCapture').disabled=false;}
}
function move(dt){
 if(modal||!playing||showcaseActive)return;
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
  if(showcaseActive&&!modal){
   if(!showcaseOverhead){
    const smoothed=SHOWCASE.ease(player,showcaseAim,dt);
    player.yaw=smoothed.yaw;player.pitch=smoothed.pitch;
   }
  }else if(!modal)move(dt);
  if(!modal && (!showcaseActive||!showcaseOverhead) && now-lastDrawMs>=drawInterval){
   lastDrawMs=now;
   const begin=performance.now();
   prepareOcclusion();sprites.frameStart();
   if(!showcaseActive)updateFocus();
   drawRoom();renderFrames++;
   lastRuntimeMs=performance.now()-begin;
   // Safety valve: three extremely costly renders trigger the light recovery build.
   if(lastRuntimeMs>115)extremeFrames++;else extremeFrames=Math.max(0,extremeFrames-1);
   window.BitBazaarDeviceQA?.record(lastRuntimeMs,slowFrames,extremeFrames);
   if(extremeFrames>=3){
    window.BitBazaarDeviceQA?.recover();
    playing=false;save();
    try{
 $('screen').classList.add('shown');
 $('startBtn').textContent='RESUME LOW GRAPHICS';
 notify('DEVICE PERFORMANCE LOW · GAME PAUSED SAFELY');
}catch(_){}
requestAnimationFrame(frame);
    return;
   }
   if(lastRuntimeMs>43)slowFrames=Math.min(16,slowFrames+2);
   else slowFrames=Math.max(0,slowFrames-1);
   if(slowFrames>=8){renderLimit=42;viewDistance=15;midLimit=12;midDistance=20;farLimit=20;farDistance=27;drawInterval=1000/20;}
   else if(slowFrames===0){renderLimit=42;viewDistance=15;midLimit=12;midDistance=20;farLimit=20;farDistance=27;drawInterval=1000/20;}
  }
 }
 if(++frameNum%600===0&&playing)save();
 requestAnimationFrame(frame);
}
// Desktop WASD, mouse drag (no pointer lock required); click/tap on rendered object.
window.addEventListener('keydown',e=>{
 if(e.code==='Escape'){if(showcaseActive){closeShowcase();return;}if(modal==='finale'){closeFinale();return;}if(!$('roomPreviewHud').hidden){decorEngine.room.back();return;}if(decorEngine.previewState()){cancelDecorPreview();return;}if(modal==='inspect')closeInspection();else if(modal)closeDrawer();else if($('confirm').hidden===false)$('confirm').hidden=true;return}
 if(!$('roomPreviewHud').hidden&&['Tab','KeyI','KeyM','KeyF'].includes(e.code)){
  e.preventDefault();return;
 }
 if(e.target.tagName==='INPUT')return;
 if(showcaseActive){
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Tab'].includes(e.code))
   e.preventDefault();
  if(e.code==='KeyP'&&!e.repeat){closeShowcase();return;}
  if(!showcaseOverhead&&!e.repeat){
   if(e.code==='ArrowLeft')showcaseAim.yaw-=.15;
   if(e.code==='ArrowRight')showcaseAim.yaw+=.15;
   if(e.code==='ArrowUp')showcaseAim.pitch=Math.max(-.95,showcaseAim.pitch-.1);
   if(e.code==='ArrowDown')showcaseAim.pitch=Math.min(.95,showcaseAim.pitch+.1);
  }
  return;
 }
 if(e.code==='KeyP'&&!e.repeat){openShowcase();return;}
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Tab'].includes(e.code))e.preventDefault();
 keys.add(e.code);if(e.code==='ShiftLeft'||e.code==='ShiftRight')shift=true;
 if(e.repeat)return;
 if(e.code==='KeyE'||e.code==='Space')interact();
 if(e.code==='KeyR'&&!modal&&!decorEngine.previewState())openArtFromWorld();
 if(e.code==='KeyT'&&!modal&&!decorEngine.previewState())moveArtFromWorld();
 if(e.code==='Enter'&&decorEngine.previewState())confirmDecorPreview();
 if(e.code==='Tab'){if(modal==='inspect')closeInspection();else modal?closeDrawer():openDrawer('album');}
 if(e.code==='KeyI'){if(modal==='inspect')closeInspection();else modal?closeDrawer():openDrawer('album');}
 if(e.code==='KeyF'){if(modal==='inspect')closeInspection();else inspectTarget();}
 if(e.code==='KeyM'){if(modal==='map')closeDrawer();else if(modal==='inspect')closeInspection();else{mapHighlightedSet=null;openDrawer('map');}}
});
window.addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='ShiftLeft'||e.code==='ShiftRight')shift=false});
let dragging=false,lastX=0,lastY=0,downX=0,downY=0,dragSum=0;
canvas.addEventListener('pointerdown',e=>{
 if(!playing||modal)return;
 if(!showcaseActive&&e.pointerType==='touch'&&e.clientX<window.innerWidth*.27&&e.clientY>window.innerHeight*.60)return;
 dragging=true;lastX=downX=e.clientX;lastY=downY=e.clientY;dragSum=0;
 try{canvas.setPointerCapture(e.pointerId)}catch(_){}
});
canvas.addEventListener('pointermove',e=>{
 if(!dragging||modal||!playing)return;
 const dx=e.clientX-lastX,dy=e.clientY-lastY;
 lastX=e.clientX;lastY=e.clientY;dragSum+=Math.hypot(dx,dy);
 if(showcaseActive){
  showcaseAim.yaw+=dx*(2.5/Math.max(300,window.innerWidth));
  showcaseAim.pitch=clamp(showcaseAim.pitch+dy*(2.15/Math.max(500,window.innerHeight)),-.95,.95);
 }else{
  player.yaw+=dx*(2.5/Math.max(300,window.innerWidth));
  player.pitch=clamp((player.pitch||0)+dy*(2.15/Math.max(500,window.innerHeight)),-.95,.95);
 }
});
canvas.addEventListener('pointerup',e=>{
 if(!dragging)return;dragging=false;
 // A quick tap on the view interacts with the CENTER RETICLE, never
 // with a different off-center object obscured by the player's finger.
 if(dragSum<10&&Math.abs(e.clientY-downY)<12&&playing&&!modal&&!showcaseActive)interact();
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
$('inspectBtn').onclick=inspectTarget;
$('closeInspect').onclick=closeInspection;
$('inspectReturn').onclick=closeInspection;
$('inspectOverlay').addEventListener('click',e=>{
 if(e.target===$('inspectOverlay'))closeInspection();
});
$('putDownBtn').onclick=()=>tote.length?putDown():undoLastPlacement();
$('huntToggle').onclick=()=>{huntExpanded=!huntExpanded;refreshHuntPanel()};
$('glassesToggle').onclick=toggleGlasses;
$('showcaseBtn').onclick=openShowcase;
$('showcaseExit').onclick=closeShowcase;
$('showcaseView').onclick=toggleShowcaseView;
$('showcaseCapture').onclick=shareShowcasePhoto;
$('showcaseFrame').onclick=cyclePostcardStyle;
$('encoreBtn').onclick=openEncore;
$('finaleBtn').onclick=()=>openFinale();
$('finaleNext').onclick=advanceFinale;
$('finaleSkip').onclick=skipFinale;
$('finaleReplay').onclick=replayFinale;
$('finaleClose').onclick=closeFinale;
$('achievementBtn').onclick=()=>{
 if(modal==='inspect')closeInspection();
 openDrawer('album');
 const details=$('achievementDetails');
 details.open=true;
 details.scrollIntoView({block:'start',behavior:'auto'});
};
$('journeyBtn').onclick=()=>{
 if(modal==='inspect')closeInspection();
 openDrawer('album');
 $('journeyGallery').scrollIntoView({block:'start',behavior:'auto'});
};
$('albumBtn').onclick=()=>modal==='album'?closeDrawer():modal==='inspect'?closeInspection():openDrawer('album');
$('decorBtn').onclick=()=>modal==='decor'?closeDrawer():modal==='inspect'?closeInspection():openDrawer('decor');
$('worldArtEdit').onclick=()=>openArtFromWorld();
$('worldArtMove').onclick=()=>moveArtFromWorld();
$('decorPreviewConfirm').onclick=()=>confirmDecorPreview();
$('decorPreviewCancel').onclick=()=>cancelDecorPreview();
$('decorPreviewMap').onclick=()=>editPreviewDestination();
$('decorPreviewPrevious').onclick=()=>cycleDecorPreview(-1);
$('decorPreviewNext').onclick=()=>cycleDecorPreview(1);
$('decorPreviewFace').onclick=()=>faceDecorPreview();
$('roomPreviewApply').onclick=()=>decorEngine.room.apply();
$('roomPreviewCancel').onclick=()=>decorEngine.room.cancel();
$('roomPreviewEdit').onclick=()=>decorEngine.room.back();
$('mapBtn').onclick=()=>{
 if(modal==='map')closeDrawer();
 else if(modal==='inspect')closeInspection();
 else{mapHighlightedSet=null;openDrawer('map');}
};
$('closeDrawer').onclick=closeDrawer;$('drawerShade').onclick=closeDrawer;
$('cancelReset').onclick=()=>$('confirm').hidden=true;
$('doReset').onclick=()=>{localStorage.removeItem(STORE_KEY);resetState();$('confirm').hidden=true;closeDrawer();notify('Store reset: 3,000 figures scattered.');};
// Preserve camera/location progress when iOS suspends or closes this Home Screen app.
document.addEventListener('visibilitychange',()=>{
 if(document.visibilityState==='hidden'&&playing)save();
});
window.addEventListener('pagehide',()=>{if(playing)save()});
$('startBtn').onclick=()=>{
 $('screen').classList.remove('shown');$('hud-left').classList.add('in-session');playing=true;save();
 if(migratedCarryCount)notify(migratedCarryCount+' EXTRA FIGURES RETURNED TO THE FLOOR — CARRY ONE AT A TIME');
 else if(cleanedFaceCount()===0)notify('START RESTORING · AIM AT A DUSTY SHELF WITH EMPTY HANDS TO CLEAN');
 else if(floorCleanedCount()===0)notify('RESTORE THE FLOOR · AIM AT PAPER, CARTONS OR STAINS WITH EMPTY HANDS');
 else notify('AIM AT A SLOT · PLACE, LIFT OR SWAP · PERFECT ORDER IS 1–10');
};
// Snapshot integrity API for QA and external automation.
window.BitBazaarQA={
 geometryProbe:(pose,fixtureId,point,exclude=-1)=>{
  const old={...player},prevFocus=focus;
  try{
   if(pose)Object.assign(player,pose);
   prepareOcclusion();
   const f=Number.isInteger(fixtureId)?fixtures[fixtureId]:null;
   const v=f?VIS.view(player,f,visibleSlope,36):null;
   const blocked=point?shelfOccludes(point,exclude):null;
   return {visible:!!v,nearDepth:v?.nearDepth??null,
    centerDepth:v?.centerDepth??null,blocked,
    camera:{x:player.x,z:player.z,yaw:player.yaw,pitch:player.pitch}};
  }finally{Object.assign(player,old);focus=prevFocus;prepareOcclusion();}
 },
 geometryRender:(pose,fixtureId)=>{
  const old={...player},prevFocus=focus;
  try{
   if(pose)Object.assign(player,pose);
   prepareOcclusion();sprites.frameStart();drawRoom();
   const f=fixtures[fixtureId],v=f?VIS.view(player,f,visibleSlope,36):null;
   const pixels=ctx.getImageData(0,0,W,H).data,colors=new Set();
   let nonzero=0;
   for(let y=12;y<H-12;y+=13)for(let x=12;x<W-12;x+=13){
    const o=(y*W+x)*4;
    if(pixels[o]+pixels[o+1]+pixels[o+2]>10)nonzero++;
    colors.add(pixels[o]+','+pixels[o+1]+','+pixels[o+2]);
   }
   // Verify actual shelf-body pixels, not just a nonblank painted floor.
   const material=decorEngine.room.shelf()[2];
   const ink=typeof material==='string'&&/^#[a-fA-F0-9]{6}$/.test(material)?
    [parseInt(material.slice(1,3),16),parseInt(material.slice(3,5),16),
     parseInt(material.slice(5,7),16)]:null;
   let shelfPixels=0;
   if(ink)for(let i=0;i<pixels.length;i+=16){
    if(pixels[i]===ink[0]&&pixels[i+1]===ink[1]&&pixels[i+2]===ink[2])shelfPixels++;
   }
   return {visible:!!v,colors:colors.size,nonzero,shelfPixels,
    nearDepth:v?.nearDepth??null,centerDepth:v?.centerDepth??null,
    figuresRendered:renderedFigures,occludedCandidates};
  }finally{Object.assign(player,old);focus=prevFocus;prepareOcclusion();}
 },
 showcaseState:()=>({active:showcaseActive,overhead:showcaseOverhead,postcardStyle,
  returnPose:showcaseReturnPose?{...showcaseReturnPose}:null,
  player:{...player},aim:{...showcaseAim},renderFrames}),
 showcaseOpen:openShowcase,showcaseClose:closeShowcase,showcaseView:toggleShowcaseView,
 showcaseCaptureBlob:showcaseCaptureBlob,
 postcardCycle:cyclePostcardStyle,postcardFacts:postcardFacts,
 postcardExportCanvas:()=>showcaseActive?postcardExportCanvas():null,
 showcaseMapStats:()=>showcaseActive?SHOWCASE.renderOverhead($('showcaseOverheadCanvas'),showcaseMapModel()):null,
 showcasePhotoCanvas:()=>showcaseActive?showcaseFrameCanvas():null,
 postgameState:()=>postgameStatus(),postgameOpen:openEncore,
 finaleState:()=>({...FINALE.status(achievementData.earned,finaleViewed),
  open:modal==='finale',chapter:finaleChapter,playing}),
 finaleOpen:openFinale,finaleAdvance:advanceFinale,finaleSkip:skipFinale,
 finaleReplay:replayFinale,finaleClose:closeFinale,
 achievementsState:()=>ACHIEVEMENTS.summary(achievementData,achievementState()),
 achievementRaw:()=>ACHIEVEMENTS.normalize(achievementData),
 achievementEvent:kind=>ACHIEVEMENTS.event(achievementData,kind),
 achievementRefresh:()=>stats(),
 journeysState:()=>journeyState(),
 honorsState:()=>({count:HONORS.unique(lifetimePerfect),trim:honorTrim,
  rewards:HONORS.status(lifetimePerfect),world:honorWorld.map(x=>x.at)}),
 honorsSelectTrim:changeHonorTrim,
 glassesState:()=>({unlocked:GLASSES.unlocked(lifetimePerfect),equipped:glassesEquipped,mastered:lifetimePerfect.size,target:glassesTarget?{...glassesTarget}:null}),
 glassesToggle:toggleGlasses,
 figureIntegrity:()=>window.BIT_BAZAAR_INTEGRITY.audit({
  rows,slots,tote,selected,floor,hiddenIds:HIDDEN_IDS,hiddenRevealed,
  groundPositions,floorGrid
 }),
 stats:()=>({floor:floor.filter(f=>f.onFloor).length,tote:tote.length,carrying:tote[0]??null,droppedPositions:groundPositions.size,migratedCarryCount,placed:rows.flat(2).length,completedRows:completedRowCount(),lifetimePerfect:lifetimePerfect.size,cleanedFaces:cleanedFaceCount(),floorCleaned:floorCleanedCount(),floorMessTotal:ambientMess.length,hiddenFound:hiddenRevealed.size,hiddenRemaining:HIDDEN_IDS.length-hiddenRevealed.size,fullUnsortedRows:rows.flat(1).filter((r,i)=>r.length===PER_ROW&&!isPerfectRow(Math.floor(i/ROWS),i%ROWS)).length,capacity:NUM_RACKS*ROWS*PER_ROW,fixtures:fixtures.length,floorFixtures:NUM_FLOOR,wallFixtures:NUM_WALL,displayFaces:shelves.length,distinctAssets:DB.figures.length,renderedFigures,midRendered,farRendered,retainedNear,retainedMid,retainedFar,occlusionChecks,occludedCandidates,visibleSlope,midLimit,farLimit,midDistance,farDistance,nearbyExamined,farCandidatesExamined,renderFrames,renderLimit,viewDistance,drawInterval:Math.round(drawInterval),lastRuntimeMs,extremeFrames,decorRender:decorEngine.renderStats(),sprites:sprites.stats()}),
 pick:(id)=>{if(!Number.isInteger(id)||id<0||id>=DB.figures.length||tote.length||!floor[id].onFloor)return false;grabFig(id);return tote[0]===id},
 place:(id,shelf,row,slot)=>{if(!isFigure(id))return false;if(!tote.length)grabFig(id);if(tote[0]!==id)return false;return placeDirect(shelf,row,slot)},
 directPlace:(shelf,row,slot)=>placeDirect(shelf,row,slot),putDown,undoLastPlacement,
 clean:(face)=>cleanShelfFace(face),cleanFloor:(id)=>cleanAmbient(id),floorPatches:()=>ambientMess.map(m=>({...m,stage:floorCleaning[m.id],steps:AMBIENT_ACTIONS[m.kind].length})),cleanLevels:()=>[...faceCleaning],hiddenIds:()=>[...HIDDEN_IDS],revealed:()=>[...hiddenRevealed],
 takeFromSlot:(shelf,row,slot)=>grabShelfFig(shelf,row,slot),
 rowContents:(shelf,row)=>[...(rows[shelf]?.[row]||[])],
 slotContents:(shelf,row)=>[...(slots[shelf]?.[row]||[])],
 rowStatus:(shelf,row)=>rowStatus(shelf,row),
 perfect:(shelf,row)=>isPerfectRow(shelf,row),
 figurePosition:id=>floor[id]?{x:floor[id].x,z:floor[id].z,onFloor:floor[id].onFloor,hidden:floor[id].hidden}:null,
 reset:resetState,snapshotNow:()=>saveData(),saveNow:save, get player(){return player}, shelves, dataset:DB,
 decorStatus:()=>({owned:decorEngine.ownedIds(),placed:decorEngine.placedSlots(),perfect:decorEngine.perfectRows().length}),
 decorRenderStats:()=>decorEngine.renderStats(),
  decorOccluded:(id,slot)=>decorSight.hidden(id,slot,
    decorEngine.workshop.pos(id,slot)),
  decorVisibleBands:(id,slot)=>decorSight.bands(id,slot,
    decorEngine.workshop.pos(id,slot),player.yaw,decorEngine.workshop.rotation(id)),
  decorSearch:query=>decorEngine.searchMatches(query),
  decorPrecisionDraft:id=>decorEngine.workshop.candidate(id),
  decorPrecisionSaved:id=>decorEngine.workshop.get(id),
  decorPrecisionPending:id=>decorEngine.workshop.pending(id),
  decorPrecisionPick:(id,dx,dz)=>decorEngine.workshop.choose(id,dx,dz),
  decorPrecisionApply:id=>decorEngine.workshop.apply(id),
  decorPrecisionCancel:id=>decorEngine.workshop.cancel(id),
  decorMapNearest:()=>decorMap.nearestOpenPin(),
  decorMapNextOpen:()=>decorMap.nextOpenPin(),
  decorAffordable:()=>decorEngine.affordables(completedRowCount()),
  decorFindOpenSite:id=>decorEngine.findOpenFor(id),
  decorCatalogCapacity:()=>({
   items:window.BIT_BAZAAR_DECOR.items.length,
   anchors:window.BIT_BAZAAR_DECOR.slots.length,
   kinds:Object.fromEntries(['wall','floor','rug','ceiling','shelf'].map(kind=>[
    kind,window.BIT_BAZAAR_DECOR.slots.filter(slot=>slot.kind===kind).length
   ]))
  }),
 decorBuy:(id,slot)=>decorEngine.buy(id,slot,true),decorMove:decorEngine.move,decorStore:decorEngine.store,
 decorMovePlanner:()=>decorMap.state(),
 decorPreviewState:()=>decorEngine.previewState(),
 decorPreviewOptions:()=>decorEngine.previewOptions(),
 decorPreviewCycle:step=>cycleDecorPreview(step),
 decorPreviewFace:()=>faceDecorPreview(),
 decorBeginPreview:(id,slot)=>{const ok=decorEngine.previewMove(id,slot);updateDecorPreviewHud();return ok;},
 decorConfirmPreview:()=>confirmDecorPreview(),
 decorCancelPreview:()=>cancelDecorPreview(),
 decorEditPreview:()=>editPreviewDestination(),
 decorBeginMove:id=>{if(!decorMap.beginMove(id))return false;openDrawer('map');return true;},
 decorChooseMove:slot=>decorMap.choose(slot),
 decorConfirmMove:()=>decorMap.useSelected(),
 decorCancelMove:()=>{const wasMoving=decorMap.cancelMove();if(wasMoving)closeDrawer();return wasMoving;},
 openMap:()=>openDrawer('map'),
 selectMap:(fixtureId,faceId)=>{
  if(!fixtures[fixtureId])return false;
  mapSelectedFixtureId=fixtureId;mapSelectedFaceId=faceId??mapFaceIds(fixtures[fixtureId])[0];
  mapHighlightedSet=null;openDrawer('map');return true;
 },
 mapSummary:(fixtureId)=>mapFixtureSummary(fixtures[fixtureId]),
 mapFaceIds:(fixtureId)=>mapFaceIds(fixtures[fixtureId]),
 mapPlayerPose, mapSelected:()=>({fixture:mapSelectedFixtureId,face:mapSelectedFaceId,highlightedSet:mapHighlightedSet,zoomed:mapZoom}),
 mapAssignedSets:()=>mapAssignedSets().map(s=>({...s})),
 mapAdvice:(face,row)=>mapRowAdvice(face,row),centerMap:centerMapOn,
 mapTaskCounts,mapNextDirtyFace,mapNextUnsortedRow,mapBrowseUnit,
 mapVisible:()=>modal==='map',
 inspect:openInspection,closeInspection,inspectTarget,inspectLore:figurineLore,inspectStatus:figurineLocation,
 get inspectedId(){return inspectedId},lifetime:()=>[...lifetimePerfect].sort((a,b)=>a-b),
 seen:()=>[...seenFigures].sort((a,b)=>a-b),seenCount:(sid)=>sid===undefined?seenFigures.size:setDiscovery(sid),
 albumSnapshot:()=>({filter:albumFilter,sort:albumSort,page:albumPage,query:albumQuery,summary:albumOverview(),ids:albumCatalog().map(p=>p.id)}),
 albumOpen:()=>openDrawer('album'),albumDetail:(sid)=>{openDrawer('album');renderSetDetail(sid);},
 albumSet:(sid)=>albumSetStatus(sid),
 huntState:()=>({active:huntTrackedId(),expanded:huntExpanded,pinned:[...pinnedSets].sort((a,b)=>a-b)}),
 huntSnapshot,huntCycle,huntToggle:()=>{huntExpanded=!huntExpanded;refreshHuntPanel()},
 huntFocus:(num)=>{huntFocusedNum=Number.isInteger(num)&&num>=1&&num<=10?num:null;refreshHuntPanel();return huntFocusedNum},
 huntFocused:()=>huntFocusedNum,
 huntGoToShelf:(sid)=>showCollectionShelfOnMap(sid===undefined?huntTrackedId():sid),
 pinned:()=>[...pinnedSets].sort((a,b)=>a-b),togglePin:togglePinnedSet,
 nextAlbum:(sid,dir)=>nextAlbumSet(sid,dir),
 pulse:()=>slotPulse,
 target:()=>{prepareOcclusion();return findFocus()},
 horizon:()=>cameraHorizon(),aimPoint:()=>({x:AIM_X,y:AIM_Y}),
 visible:()=>({near:[...previousNear],mid:[...previousMid],far:[...previousFar]}),
 occludedAt:(x,z,excludeFixtureId=-1)=>shelfOccludes({x,z},excludeFixtureId),
 figurePosition:id=>floor[id]?{x:floor[id].x,z:floor[id].z,onFloor:floor[id].onFloor,hidden:floor[id].hidden}:null,
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

// An apparently valid legacy/current save can still fail during physical
// restoration. Quarantine unexpected errors rather than risking an autosave
// or leaving the iPhone on a broken, partially loaded scene.
try{restore();}
catch(error){
 window.BitBazaarSaveHold=true;
 let source=null;
 try{
  if(localStorage.getItem(STORE_KEY)!==null)source=STORE_KEY;
  else if(localStorage.getItem(LEGACY_KEY)!==null)source=LEGACY_KEY;
 }catch(_){}
 const recovery=window.BitBazaarBootRecovery;
 if(recovery?.show)recovery.show({
  kind:'blocked',source,
  reason:'The saved shop could not finish loading safely · '+
   (error?.message||'Unexpected restoration error')
 });
 else{
  const menu=document.getElementById('screen');
  if(menu){menu.classList.add('shown');
   menu.textContent='SHOP RECOVERY REQUIRED · Your original saved progress has not been overwritten.';}
 }
}
requestAnimationFrame(frame);
})();