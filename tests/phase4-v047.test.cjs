'use strict';
/* Bit Bazaar Phase 4 v0.47: pre-write validation & quarantine of corrupt live saves. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const KEY='bit-bazaar-save-v3',PREVIOUS='bit-bazaar-v3-before-file-import';
const catalog={items:[{id:'frame',mount:'wall'}],
 slots:[{id:0,kind:'wall',side:'NORTH',x:30,z:2}]};
function fixture(){
 const rows=Array.from({length:60},()=>Array.from({length:5},()=>[]));
 const slots=Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
 rows[0][0]=Array.from({length:10},(_,i)=>i);
 slots[0][0]=rows[0][0].slice();
 return {version:1,rows,slots,tote:[],selected:null,
  cleaning:Array(60).fill(0),floorCleaning:Array(45).fill(0),
  seenFigures:rows[0][0].slice(),lifetimePerfect:[0],pinnedSets:[],
  trackedSetId:null,revealed:[],ground:[[10,20,30]],
  player:{x:35,z:68,yaw:0,pitch:0},
  decor:{owned:['frame'],placed:[['frame',0]],adjustments:[],room:[0,0,0,0]}};
}
const copy=o=>JSON.parse(JSON.stringify(o));
const saved=fixture(),store=new Map([[KEY,JSON.stringify(saved)]]);
let live=copy(saved),writes=0,audits=0,downloads=0,shares=0,reloads=0;
let storageOk=true,physicalOk=true,physicalMismatch=false,mismatchWrite=false;
const status={textContent:'',classList:{toggle(name,v){this.error=v;}}};
class FakeFile {
 constructor(parts,name,opts){this.body=parts.join('');this.name=name;this.type=opts.type;this.size=this.body.length;}
 async text(){return this.body;}
}
const w={
 BIT_BAZAAR_DECOR:catalog,BitBazaarSaveHold:false,BitBazaarImportInProgress:false,
 confirm:()=>true,location:{reload(){reloads++;}}
};
w.BitBazaarQA={
 snapshotNow:()=>live,
 saveNow:()=>{
  writes++;
  if(!storageOk||w.BitBazaarSaveHold)return false;
  if(mismatchWrite){
   const other=copy(live);other.player.x=other.player.x+1;
   store.set(KEY,JSON.stringify(other));
  }else store.set(KEY,JSON.stringify(live));
  return true;
 },
 figureIntegrity:()=>{
  audits++;
  return {ok:physicalOk,total:3000,shelved:physicalMismatch?9:10,
   held:0,hiddenFound:0,loose:2990,concealed:0,
   issues:physicalOk?[]:['duplicate or missing figure']};
 }
};
const doc={
 getElementById:id=>id==='saveToolStatus'?status:null,
 addEventListener(){},
 createElement:()=>({href:'',download:'',click(){downloads++;},remove(){}}),
 body:{appendChild(){}}
};
const navigation={canShare:()=>true,share:async()=>{shares++;}};
const context=vm.createContext({
 window:w,document:doc,navigator:navigation,File:FakeFile,
 localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))},
 URL:{createObjectURL:()=>'/mock',revokeObjectURL(){}},
 Blob,Date,JSON,Math,Set,Map,setTimeout:()=>{}
});
vm.runInContext(read('assets/save-manager-v0.47.js'),context,{timeout:3000});
const qa=w.BitBazaarSaveTools;
assert.ok(qa.validate&&qa.shareFile&&qa.exportFile&&qa.importFile&&qa.recoverPrevious);
const baseline=store.get(KEY);
assert.equal(qa.verifyCurrent().placed,10);
assert.equal(writes,1);
assert.equal(audits,1);
assert.equal(w.BitBazaarSaveHold,false);
// A corrupt live row must never touch the previous valid saved shop.
live.slots[0][0][0]=11;
const beforeWrites=writes,beforeAudits=audits;
assert.equal(qa.verifyCurrent(),null);
assert.equal(writes,beforeWrites);
assert.equal(audits,beforeAudits,'invalid JSON geometry fails before costly physical audit');
assert.equal(store.get(KEY),baseline);
assert.equal(w.BitBazaarSaveHold,true);
assert.match(status.textContent,/AUTOSAVE PAUSED/);
async function main(){
 // Both sharing and download fail closed while the live scene is corrupt.
 assert.equal(qa.exportFile(),false);
 assert.equal(downloads,0);
 assert.equal(await qa.shareFile(),false);
 assert.equal(shares,0);
 assert.equal(store.get(KEY),baseline);
 // A real verified Files backup remains restorable even when autosave is held.
 const file=new FakeFile([JSON.stringify({format:'bit-bazaar-save-backup',
  exportVersion:1,save:copy(saved)})],'valid.json',{type:'application/json'});
 assert.equal(await qa.importFile(file),true);
 assert.equal(reloads,1);
 assert.equal(w.BitBazaarImportInProgress,true);
 assert.equal(writes,beforeWrites,'quarantined invalid scene never saved during restore');
 assert.equal(store.get(PREVIOUS),baseline);
 assert.equal(store.get(KEY),baseline);
 // A previous imported backup may be rolled back without persisting bad memory.
 w.BitBazaarImportInProgress=false;
 assert.equal(qa.recoverPrevious(),true);
 assert.equal(reloads,2);
 assert.equal(writes,beforeWrites);
 assert.equal(store.get(KEY),baseline);
 w.BitBazaarImportInProgress=false;
 // If the live snapshot is structurally valid but physical figures disagree,
 // quarantine must still start before writing.
 live=copy(saved);
 physicalOk=false;
 assert.equal(qa.verifyCurrent(),null);
 assert.equal(writes,beforeWrites);
 assert.equal(store.get(KEY),baseline);
 assert.equal(w.BitBazaarSaveHold,true);
 physicalOk=true;
 physicalMismatch=true;
 assert.equal(qa.verifyCurrent(),null);
 assert.equal(writes,beforeWrites);
 physicalMismatch=false;
 // Once the scene is coherent again, a fresh check releases the hold.
 assert.equal(qa.verifyCurrent().placed,10);
 assert.equal(w.BitBazaarSaveHold,false);
 assert.equal(writes,beforeWrites+1);
 // A quota failure reports unsuccessful verification but not false corruption.
 storageOk=false;
 assert.equal(qa.exportFile(),false);
 assert.equal(downloads,0);
 assert.equal(w.BitBazaarSaveHold,false);
 assert.equal(store.get(KEY),baseline);
 storageOk=true;
 // If engine says save succeeded but persisted data differs, reject it and
 // best-effort restore the last good saved snapshot.
 mismatchWrite=true;
 const prior=store.get(KEY);
 assert.equal(qa.verifyCurrent(),null);
 assert.equal(w.BitBazaarSaveHold,true);
 assert.equal(store.get(KEY),prior);
 mismatchWrite=false;
 assert.equal(qa.verifyCurrent().placed,10);
 assert.equal(w.BitBazaarSaveHold,false);
 // Successful export and native share still carry the exact old format.
 assert.equal(qa.exportFile(),true);
 assert.equal(downloads,1);
 assert.equal(await qa.shareFile(),true);
 assert.equal(shares,1);
 // Both engines must expose snapshotNow and honor the quarantine for autosave.
 for(const p of ['game-v0.47.0.js','game-v0.47.0-lowfx.js']){
  const engine=read(p);
  assert.ok(engine.includes('snapshotNow:()=>saveData()'));
  assert.ok(engine.includes('window.BitBazaarImportInProgress||window.BitBazaarSaveHold'));
  assert.ok(engine.includes('bit-bazaar-save-v3'));
 }
 for(const p of ['preview-v0.47.0.html','baseline-v0.47.0-lowfx.html']){
  assert.ok(read(p).includes('assets/save-manager-v0.47.js'),p);
 }
 assert.ok(read('sw.js').includes('bit-bazaar-v0.60.0'));
 assert.ok(read('sw.js').includes('assets/save-manager-v0.47.js'));
 console.log('PASS v0.47: validate before save, quarantine bad live state, preserve last good local save, recover via Files and release quarantine after clean checks.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
