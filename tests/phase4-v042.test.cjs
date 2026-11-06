'use strict';
/* Bit Bazaar v0.42 — save-file round trip and prior-import recovery. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const code=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const KEY='bit-bazaar-save-v3',PREVIOUS='bit-bazaar-v3-before-file-import';
const catalog={
 items:[
 {id:'floor',mount:'floor'},{id:'rug',mount:'rug'},
 {id:'ceiling',mount:'ceiling'},{id:'wall',mount:'wall'},
 {id:'shelf',mount:'shelf'},{id:'endcap',mount:'wall'}],
 slots:[
 {id:0,kind:'floor',x:20,z:20},{id:1,kind:'rug',x:40,z:30},
 {id:2,kind:'ceiling',x:50,z:50},
 {id:3,kind:'wall',side:'NORTH',x:30,z:2},
 {id:4,kind:'shelf',face:0},
 {id:5,kind:'wall',side:'WEST',profile:'endcap',x:23,z:26}]
};
const status={textContent:'',classList:{error:false,toggle(k,v){if(k==='error')this.error=v}}};
let clicks=0,reloads=0,confirms=0,saveCalls=0,saveOK=true;
const events={},store=new Map(),storage={
 getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))
};
const doc={
 getElementById:id=>id==='saveToolStatus'?status:null,
 addEventListener:(name,fn)=>{events[name]=fn},
 createElement:()=>({href:'',download:'',click(){clicks++},remove(){}}),
 body:{appendChild(){}}
};
const w={
 BIT_BAZAAR_DECOR:catalog,BitBazaarImportInProgress:false,
 confirm(){confirms++;return true},
 location:{reload(){reloads++}}
};
const context=vm.createContext({
 window:w,document:doc,localStorage:storage,
 URL:{createObjectURL:()=>'/fake',revokeObjectURL(){}},
 Blob,Date,setTimeout:()=>{},Math,Set,Map,JSON
});
vm.runInContext(code('assets/save-manager-v0.42.js'),context,{
 filename:'save-manager-v0.42.js',timeout:3000
});
const tools=w.BitBazaarSaveTools;
assert.ok(tools);
function fixture(){
 const rows=Array.from({length:60},()=>Array.from({length:5},()=>[]));
 const slots=Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
 rows[0][0]=Array.from({length:10},(_,i)=>i);slots[0][0]=[...rows[0][0]];
 return {
 version:1,rows,slots,tote:[],selected:null,cleaning:Array(60).fill(0),
 floorCleaning:Array(45).fill(0),seenFigures:[...rows[0][0]],
 lifetimePerfect:[0],pinnedSets:[0],trackedSetId:0,revealed:[],
 ground:[[10,24,30]],player:{x:35,z:68,yaw:0,pitch:0},
 decor:{
  owned:catalog.items.map(x=>x.id),placed:catalog.items.map((x,i)=>[x.id,i]),
  adjustments:[
   ['floor',4,-4,0,0],['rug',4,4,1,0],
   ['ceiling',-4,4,0,0],['wall',2,0,0,0],
   ['shelf',0,0,0,2],['endcap',0,0,0,0]
  ],room:[1,2,3,0]
 }
 };
}
const copy=v=>JSON.parse(JSON.stringify(v));
let live=fixture();
w.BitBazaarQA={saveNow(){
 saveCalls++;
 if(!saveOK)return false;
 store.set(KEY,JSON.stringify(live));return true;
}};
const summary=tools.validate(live);
assert.equal(summary.placed,10);
assert.equal(summary.perfect,1);
assert.equal(summary.ownedArt,6);
assert.equal(summary.fineAdjusted,6);
assert.equal(summary.dropped,1);
assert.equal(summary.lifetimeMastered,1);
let old=copy(live);
old.decor.adjustments=[['floor',2,-2,0,0],['rug',-2,1,3,0]];
assert.equal(tools.validate(old).fineAdjusted,2,'old offsets work');
old=copy(live);delete old.decor;
assert.equal(tools.validate(old).ownedArt,0,'old undecorated backup works');
const invalid=[
 s=>s.decor.adjustments[0][1]=5,
 s=>s.decor.adjustments[1][2]=-5,
 s=>s.decor.adjustments[2][1]=-5,
 s=>s.decor.adjustments[3][1]=3,
 s=>s.decor.adjustments[3][2]=1,
 s=>s.decor.adjustments[4][1]=1,
 s=>s.decor.adjustments[5][2]=1,
 s=>s.decor.adjustments[0][3]=1,
 s=>s.decor.placed[1][1]=0,
 s=>s.ground.push([0,22,31]),
 s=>s.ground.push([3000,22,31]),
 s=>s.player.x=900
];
for(const bad of invalid){
 const raw=copy(live);bad(raw);
 assert.throws(()=>tools.validate(raw));
}
assert.equal(tools.hasRecovery(),false);
assert.equal(tools.verifyCurrent().ownedArt,6);
assert.ok(status.textContent.includes('6 decorations owned'));
assert.equal(saveCalls,1);
assert.equal(tools.exportFile(),true);
assert.equal(clicks,1);
assert.ok(status.textContent.includes('DOWNLOAD REQUESTED'));
saveOK=false;
assert.equal(tools.exportFile(),false,'no stale backups on failed storage write');
assert.equal(clicks,1);
assert.equal(tools.verifyCurrent(),null);
assert.equal(status.classList.error,true);
saveOK=true;
async function main(){
 const imported=copy(live);
 imported.decor.adjustments[0][1]=-4;
 imported.lifetimePerfect=[0,1,2];
 const file={size:4096,text:async()=>JSON.stringify({
  format:'bit-bazaar-save-backup',exportVersion:1,save:imported
 })};
 assert.equal(await tools.importFile(file),true);
 assert.equal(reloads,1);
 assert.equal(w.BitBazaarImportInProgress,true);
 assert.equal(JSON.parse(store.get(KEY)).decor.adjustments[0][1],-4);
 assert.equal(JSON.parse(store.get(PREVIOUS)).decor.adjustments[0][1],4);
 assert.equal(tools.hasRecovery(),true);
 w.BitBazaarImportInProgress=false;live=copy(imported);
 assert.equal(tools.recoverPrevious(),true);
 assert.equal(reloads,2);
 assert.equal(JSON.parse(store.get(KEY)).decor.adjustments[0][1],4);
 assert.equal(JSON.parse(store.get('bit-bazaar-v3-before-import-rollback')).decor.adjustments[0][1],-4);
 w.BitBazaarImportInProgress=false;live=fixture();
 const saved=store.get(KEY),previous=store.get(PREVIOUS);
 const corrupt=copy(live);corrupt.decor.adjustments[0][1]=5;
 assert.equal(await tools.importFile({size:2048,text:async()=>JSON.stringify(corrupt)}),false);
 assert.equal(store.get(KEY),saved);
 assert.equal(store.get(PREVIOUS),previous);
 w.confirm=()=>false;
 assert.equal(await tools.importFile(file),false);
 assert.equal(tools.recoverPrevious(),false);
 assert.equal(reloads,2);
 w.confirm=()=>true;saveOK=false;
 assert.equal(await tools.importFile(file),false);
 assert.equal(store.get(KEY),saved);
 assert.equal(store.get(PREVIOUS),previous);
 saveOK=true;
 events.click({target:{closest:q=>q==='#verifySaveFile'?{}:null}});
 assert.ok(status.textContent.includes('SHOP VERIFIED'));
 const html=code('preview-v0.42.0.html'),sw=code('sw.js');
 for(const p of ['assets/save-manager-v0.42.js','game-v0.42.0.js','style-v0.42.0.css']){
  assert.ok(html.includes('./'+p),'main shell uses '+p);
  assert.ok(sw.includes('./'+p),'offline cache preloads '+p);
 }
 assert.ok(sw.includes('bit-bazaar-v0.60.0'));
 assert.ok(code('baseline-v0.42.0-lowfx.html').includes('game-v0.42.0-lowfx.js'));
 for(const p of ['game-v0.42.0.js','game-v0.42.0-lowfx.js']){
  const game=code(p);
  for(const text of ['id="verifySaveFile"','id="recoverSaveFile"',
   'id="downloadSaveFile"','id="chooseSaveFile"',
   'function save(){','catch(e){return false}','bit-bazaar-save-v3'])
   assert.ok(game.includes(text),p+' keeps '+text);
 }
 console.log('PASS v0.42: ±1.0 precise art backups, old save validation, 3,000 figures, fresh verified downloads, safe import and rollback, browser quota failure safeguards, both iPhone builds and offline cache.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
