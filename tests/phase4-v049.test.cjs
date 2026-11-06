'use strict';
/* Bit Bazaar v0.49: unreadable startup saves never silently become a new shop. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const KEY='bit-bazaar-save-v3',LEGACY='bit-bazaar-save-v1',
 PREV='bit-bazaar-v3-before-file-import',RAW='bit-bazaar-v3-unreadable-raw-backup';
const mk=()=>({version:1,rows:Array.from({length:60},()=>Array.from({length:5},()=>[])),
 slots:Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null))),
 tote:[],selected:null,cleaning:Array(60).fill(0),floorCleaning:Array(45).fill(0),
 seenFigures:[],pinnedSets:[],lifetimePerfect:[],trackedSetId:null,revealed:[],
 ground:[],player:{x:35,z:68,yaw:0,pitch:0},
 decor:{owned:[],placed:[],adjustments:[],room:[0,0,0,0]}});
const good=mk();
const store=new Map(),listeners={},elements=new Map();
let downloads=0,reloads=0,confirms=[],filePicks=0,imported=0,recovered=0;
for(const id of ['bootRecovery','bootRecoveryReason','bootRecoveryStatus',
 'bootRecoveryPrevious','bootRecoveryRaw','bootRecoveryFile'])
 elements.set(id,{hidden:true,disabled:false,textContent:'',value:'',
  click(){filePicks++;},files:[]});
const w={
 BitBazaarSaveHold:false,BitBazaarSaveTools:{
  validate:o=>{if(!o||o.version!==1)throw Error('Invalid saved version');return true;},
  importFile:async file=>{imported++;return !!file;},
  recoverPrevious:()=>{recovered++;return true;}
 },
 confirm:()=>confirms.shift()??false,location:{reload(){reloads++;}}
};
const doc={getElementById:id=>elements.get(id)||null,
 addEventListener:(n,fn)=>listeners[n]=fn,
 createElement:()=>({href:'',download:'',click(){downloads++;},remove(){}}),
 body:{appendChild(){}}
};
const ctx=vm.createContext({
 window:w,document:doc,
 localStorage:{getItem:k=>store.has(k)?store.get(k):null,
  setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
 URL:{createObjectURL:()=>'/local-raw',revokeObjectURL(){}},
 Blob,Date,Math,JSON,setTimeout:()=>{}
});
vm.runInContext(read('assets/boot-recovery-v0.49.js'),ctx,{timeout:3000});
const recovery=w.BitBazaarBootRecovery;
assert.equal(recovery.inspect().kind,'fresh');
store.set(LEGACY,JSON.stringify({version:1,rows:Array.from({length:20},()=>Array.from({length:5},()=>[]))}));
assert.equal(recovery.inspect().kind,'valid','original 1000-figure game accepted for migration');
store.delete(LEGACY);
store.set(KEY,JSON.stringify(good));
assert.equal(recovery.inspect().kind,'valid','modern save accepted');
store.set(KEY,JSON.stringify({...good,rows:[[1,2,3]]}));
assert.equal(recovery.inspect().kind,'blocked','broken shelf geometry quarantined');
store.set(KEY,'{unreadable JSON from a real iPhone');
const original=store.get(KEY);
const result=recovery.inspect();
assert.equal(result.kind,'blocked');
assert.equal(result.source,KEY);
assert.equal(store.get(KEY),original,'read-only startup inspection preserves exact bytes');
store.set(PREV,JSON.stringify(good));
recovery.show(result);
assert.equal(w.BitBazaarSaveHold,true,'quarantine holds autosaves');
assert.equal(elements.get('bootRecovery').hidden,false);
assert.equal(elements.get('bootRecoveryPrevious').disabled,false);
assert.match(elements.get('bootRecoveryStatus').textContent,/NOT BEEN ERASED/);
assert.equal(recovery.exportRaw(),true);
assert.equal(downloads,1);
assert.equal(store.get(KEY),original,'raw export cannot overwrite the save');
assert.match(elements.get('bootRecoveryStatus').textContent,/NOT a playable save/);
assert.equal(recovery.chooseFile(),true);
assert.equal(filePicks,1);
assert.equal(recovery.recoverPrevious(),true);
assert.equal(recovered,1);
async function main(){
 assert.equal(await recovery.importFile({size:4}),true);
 assert.equal(imported,1);
 assert.equal(store.get(KEY),original);
 confirms=[true,false];
 assert.equal(recovery.startFresh(),false,'cancel final warning preserves raw data');
 assert.equal(store.get(KEY),original);
 confirms=[false];
 assert.equal(recovery.startFresh(),false,'cancel first warning preserves raw data');
 assert.equal(reloads,0);
 confirms=[true,true];
 assert.equal(recovery.startFresh(),true,'deliberate double approval can start fresh');
 assert.equal(store.has(KEY),false);
 assert.equal(w.BitBazaarSaveHold,false);
 assert.equal(reloads,1);
 // New app load must still preserve a valid previous undo backup while
 // archiving an unreadable old raw shop during an approved Files restore.
 const map=new Map([[KEY,'invalid json'],[PREV,JSON.stringify(good)]]);
 let writes=0,refreshes=0;
 const screen={textContent:'',classList:{toggle(){}}};
 const win={
  BitBazaarSaveHold:true,BitBazaarImportInProgress:false,
  BIT_BAZAAR_DECOR:{items:[],slots:[]},
  confirm:()=>true,location:{reload(){refreshes++;}},
  BitBazaarQA:{saveNow(){writes++;return true;},figureIntegrity:()=>null}
 };
 const document2={getElementById:id=>id==='saveToolStatus'?screen:null,
  addEventListener:()=>{},createElement:()=>({href:'',download:'',click(){},remove(){}}),
  body:{appendChild(){}}};
 const sandbox=vm.createContext({window:win,document:document2,
  localStorage:{getItem:k=>map.has(k)?map.get(k):null,
   setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)},
  Blob,Date,Math,JSON,Set,Map,URL:{createObjectURL:()=>'/mock',revokeObjectURL(){}},setTimeout:()=>{}});
 vm.runInContext(read('assets/save-manager-v0.49.js'),sandbox,{timeout:3000});
 const api=win.BitBazaarSaveTools;
 assert.equal(api.validate(good).placed,0);
 const file={size:JSON.stringify(good).length,
  text:async()=>JSON.stringify({format:'bit-bazaar-save-backup',exportVersion:1,save:good})};
 assert.equal(await api.importFile(file),true);
 assert.equal(refreshes,1);
 assert.equal(writes,0,'quarantined game never writes corrupted live memory');
 assert.equal(map.get(RAW),'invalid json','exact broken raw bytes retained separately');
 assert.equal(map.get(PREV),JSON.stringify(good),'prior good undo backup stays intact');
 assert.equal(map.get(KEY),JSON.stringify(good),'valid chosen Files backup takes over');
 assert.equal(win.BitBazaarImportInProgress,true);
 // Every entry point must load the recovery module before the active engine.
 for(const p of ['preview-v0.49.0.html','baseline-v0.49.0-lowfx.html']){
  const html=read(p);
  assert.ok(html.includes('id="bootRecovery"'),p);
  assert.ok(html.includes('id="bootRecoveryFile"'),p);
  assert.ok(html.includes('assets/save-manager-v0.49.js'),p);
  assert.ok(html.includes('assets/boot-recovery-v0.49.js'),p);
  assert.ok(html.indexOf('assets/boot-recovery-v0.49.js')<html.indexOf('game-v0.49.0'),p);
 }
 for(const p of ['game-v0.49.0.js','game-v0.49.0-lowfx.js']){
  const game=read(p);
  assert.ok(game.includes("BitBazaarBootRecovery?.inspect?.()"));
  assert.ok(game.includes("window.BitBazaarSaveHold=true;\n  resetState()"));
  assert.ok(game.includes("BitBazaarBootRecovery?.show(boot)"));
  assert.ok(game.includes("window.BitBazaarImportInProgress||window.BitBazaarSaveHold"));
  assert.ok(game.includes('bit-bazaar-save-v3'));
 }
 assert.ok(read('style-v0.49.0.css').includes('.boot-recovery[hidden]'));
 assert.ok(read('sw.js').includes('bit-bazaar-v0.53.1'));
 assert.ok(read('sw.js').includes('./assets/boot-recovery-v0.49.js'));
 assert.ok(read('sw.js').includes('./assets/save-manager-v0.49.js'));
 console.log('PASS v0.49: fresh/legacy/modern boots, corrupt source quarantine, raw export, safe Files restore, previous backup preservation, double-confirm reset, normal/Low FX/PWA wiring.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
