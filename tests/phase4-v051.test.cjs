'use strict';
/* Bit Bazaar Phase 4 v0.51: migration restores are transactional even if
   engine scene setup, post-restore validation or saving throws. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const KEY='bit-bazaar-save-v3',LEGACY='bit-bazaar-save-v1';
function fixture(){
 return {version:1,rows:Array.from({length:60},()=>Array.from({length:5},()=>[])),
  slots:Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null))),
  tote:[],selected:null,cleaning:Array(60).fill(0),
  floorCleaning:Array(45).fill(0),seenFigures:[],pinnedSets:[],
  lifetimePerfect:[],trackedSetId:null,revealed:[],ground:[],
  player:{x:35,z:68,yaw:0,pitch:0},
  decor:{owned:[],placed:[],adjustments:[],room:[0,0,0,0]}};
}
function simulate(pathname,scenario){
 const engine=read(pathname);
 const a=engine.indexOf('function restore(){');
 const b=engine.indexOf('function saveData(){',a);
 const c=engine.lastIndexOf('try{restore();}');
 const d=engine.lastIndexOf('})();');
 assert.ok(a>0&&b>a&&c>b&&d>c,'extract exact real production restoration code');
 const fragment=engine.slice(a,b)+'\n'+engine.slice(c,d);
 const current=fixture();
 if(scenario==='legacy'||scenario==='save-refused')delete current.slots;
 const isLegacy=scenario==='legacy'||scenario==='save-refused';
 const raw=JSON.parse(JSON.stringify(current));
 const original=JSON.stringify(raw);
 const store=new Map([[isLegacy?LEGACY:KEY,original]]);
 let writes=0,resetCalls=0,frames=0,checks=0,install=0,setup=0,saves=0;
 const shown=[];
 const flags={failLoad:scenario==='load-exception',failSetup:scenario==='floor-exception',
  failValidate:scenario==='invalid-rebuild',failSave:scenario==='save-refused'};
 const w={
  BitBazaarSaveHold:false,BitBazaarImportInProgress:false,
  BitBazaarBootRecovery:{
   inspect:()=>({kind:'valid',raw}),
   show:v=>{shown.push(v);w.BitBazaarSaveHold=true;}
  },
  BitBazaarSaveTools:{validate:()=>{
   checks++;
   assert.equal(w.BitBazaarSaveHold,true,'no save before completed validation');
   if(flags.failValidate)throw Error('Injected rebuilt-scene schema failure');
   return {placed:0};
  }}
 };
 const env={
  window:w,STORE_KEY:KEY,LEGACY_KEY:LEGACY,
  localStorage:{
   getItem:k=>store.has(k)?store.get(k):null,
   setItem:(k,v)=>{if(k===KEY)writes++;store.set(k,String(v));}
  },
  decorEngine:{load:()=>{install++;if(flags.failLoad)throw Error('Art installation failed');}},
  NUM_RACKS:60,ROWS:5,PER_ROW:10,
  DB:{figures:Array(3000),sets:Array(300)},
  AMBIENT_ACTIONS:{dust:[1,2,3]},
  ambientMess:Array.from({length:45},()=>({kind:'dust'})),
  HIDDEN_IDS:[],HIDDEN_SET:new Set(),SECRET_BY_FACE:[],
  EMPTY_ROW:()=>Array(10).fill(null),isFigure:id=>Number.isInteger(id)&&id>=0&&id<3000,
  isPerfectRow:()=>false,figure:id=>({setId:Math.floor(id/10)}),
  blocked:()=>false,clamp:(n,lo,hi)=>Math.max(lo,Math.min(hi,n)),
  syncRow:()=>{},setupFloor:()=>{setup++;if(flags.failSetup)throw Error('Physical floor setup failed')},
  stats:()=>{},
  saveData:()=>JSON.parse(JSON.stringify(raw)),
  save:()=>{saves++;if(w.BitBazaarSaveHold||flags.failSave)return false;
   writes++;store.set(KEY,JSON.stringify(raw));return true;},
  resetState:()=>{resetCalls++;if(!w.BitBazaarSaveHold){writes++;store.set(KEY,'RESET');}},
  groundPositions:new Map(),lifetimePerfect:new Set(),seenFigures:new Set(),
  pinnedSets:new Set(),hiddenRevealed:new Set(),
  faceCleaning:[],floorCleaning:[],migratedCarryCount:0,
  player:{x:35,z:68,yaw:0,pitch:0},
  requestAnimationFrame:()=>{frames++;},frame:()=>{},
  document:{getElementById:()=>null},
  Math,JSON,Map,Set,Number,Array,Object,isFinite
 };
 vm.runInNewContext(fragment,env,{timeout:5000,filename:pathname});
 return {store,original,env,w,writes,resetCalls,frames,checks,saves,
  shown,install,setup,raw,isLegacy};
}
for(const path of ['game-v0.51.0.js','game-v0.51.0-lowfx.js']){
 for(const scenario of ['load-exception','floor-exception','invalid-rebuild','save-refused']){
  const q=simulate(path,scenario);
  const originalKey=q.isLegacy?LEGACY:KEY;
  assert.equal(q.store.get(originalKey),q.original,
   scenario+': original progress kept verbatim');
  assert.equal(q.writes,0,scenario+': no save overwrites the original');
  assert.equal(q.w.BitBazaarSaveHold,true,scenario+': autosave held');
  assert.equal(q.shown.length,1,scenario+': recovery screen opened');
  assert.equal(q.shown[0].source,originalKey,scenario+': recovery targets original');
  assert.ok(q.shown[0].reason.includes('could not finish loading'));
  assert.equal(q.frames,1,'frame scheduler still runs under overlay');
 }
 const current=simulate(path,'valid');
 assert.equal(current.w.BitBazaarSaveHold,false,'modern valid shop resumes autosaves');
 assert.equal(current.shown.length,0,'modern valid shop no recovery');
 assert.equal(current.checks,1,'post-restore deep validator called once');
 assert.equal(current.writes,0,'current shop not needlessly rewritten');
 const legacy=simulate(path,'legacy');
 assert.equal(legacy.checks,1,'legacy rebuilt shop validated before migration commit');
 assert.equal(legacy.saves,1,'legacy migration writes once only');
 assert.equal(legacy.writes,1);
 assert.equal(legacy.store.get(KEY),JSON.stringify(legacy.raw));
 assert.equal(legacy.store.get(LEGACY),legacy.original,
  'legacy source remains recoverable after successful migration');
 assert.equal(legacy.w.BitBazaarSaveHold,false);
 assert.equal(legacy.shown.length,0);
 assert.equal(legacy.frames,1);
 assert.ok(read(path).includes('BitBazaarSaveHold=true;\n // Migrate the legacy'));
}
for(const shell of ['preview-v0.51.0.html','baseline-v0.51.0-lowfx.html']){
 const s=read(shell);
 assert.ok(s.includes('game-v0.51.0'));
 assert.ok(s.includes('boot-recovery-v0.50.js'));
}
const sw=read('sw.js');
assert.ok(sw.includes('bit-bazaar-v0.53.1'));
assert.ok(sw.includes('./game-v0.51.0.js'));
assert.ok(sw.includes('./game-v0.51.0-lowfx.js'));
console.log('PASS v0.51: production normal/Low FX restore transactions: artwork/floor/schema/quota failure quarantined with zero writes; modern and legacy successes commit safely.');
