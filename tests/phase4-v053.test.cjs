'use strict';
/* v0.53 iPhone Files backup preflight: validate and compare JSON without
 * importing, saving, confirming a destructive restore, or reloading. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const KEY='bit-bazaar-save-v3';
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
let live=fixture(),storageWrites=0,saves=0,imports=0,reloads=0,confirms=0,audits=0,chooses=0;
const store=new Map([[KEY,JSON.stringify(live)]]),handlers={},nodes={};
const status={textContent:'',classList:{toggle(k,v){this.error=v;}}};
nodes.saveToolStatus=status;
nodes.checkBackupInput={click(){chooses++},files:[],value:''};
nodes.saveFileInput={click(){imports++},files:[],value:''};
const doc={
 getElementById:id=>nodes[id]||null,
 addEventListener:(id,fn)=>handlers[id]=fn,
 createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}
};
const w={
 BIT_BAZAAR_DECOR:{items:[{id:'frame',mount:'wall'}],
  slots:[{id:0,kind:'wall',side:'NORTH',x:30,z:2}]},
 BitBazaarSaveHold:false,
 BitBazaarImportInProgress:false,
 confirm:()=>{confirms++;return false;},
 location:{reload(){reloads++;}},
 BitBazaarQA:{
  snapshotNow:()=>live,
  saveNow:()=>{saves++;return true;},
  figureIntegrity:()=>{audits++;return {ok:true,total:3000,shelved:10,held:0,hiddenFound:0};}
 }
};
const env=vm.createContext({window:w,document:doc,Math,JSON,Date,Set,Map,Blob,
 localStorage:{getItem:k=>store.get(k)||null,
  setItem:(k,v)=>{storageWrites++;store.set(k,String(v));}},
 navigator:{},setTimeout:()=>{},
 URL:{createObjectURL:()=>'/mock',revokeObjectURL(){}}
});
vm.runInContext(read('assets/save-manager-v0.53.js'),env,{timeout:4000});
const api=w.BitBazaarSaveTools;
assert.equal(typeof api.checkBackupFile,'function');
assert.equal(typeof api.lastFileCheck,'function');
const backup=save=>({format:'bit-bazaar-save-backup',exportVersion:1,
 exportedAt:'2026-11-05T18:00:00.000Z',save});
const file=async(text,name='Bit-Bazaar-Save.json',overrideSize=null)=>({
 name,size:overrideSize===null?text.length:overrideSize,text:async()=>text
});
async function main(){
 const initial=store.get(KEY),same=await file(JSON.stringify(backup(copy(live))));
 const match=await api.checkBackupFile(same);
 assert.equal(match.valid,true);
 assert.equal(match.match,true);
 assert.equal(match.summary.placed,10);
 assert.equal(match.summary.ownedArt,1);
 assert.match(status.textContent,/EXACT MATCH with open shop/);
 assert.match(status.textContent,/NOTHING WAS RESTORED OR SAVED/);
 assert.equal(api.lastFileCheck().fileName,'Bit-Bazaar-Save.json');
 const different=copy(live);different.player.x=36;
 const other=await api.checkBackupFile(await file(JSON.stringify(backup(different))));
 assert.equal(other.valid,true);
 assert.equal(other.match,false);
 assert.match(status.textContent,/VALID FILE, BUT DIFFERENT/);
 assert.ok(!status.classList.error,'different progress is not a damaged backup');
 const raw=await api.checkBackupFile(await file(JSON.stringify(live)));
 assert.equal(raw.valid,true,'raw earlier JSON backups remain import-compatible');
 assert.equal(raw.match,true);
 const invalid=await api.checkBackupFile(await file('{invalid JSON'));
 assert.equal(invalid,null);
 assert.equal(api.lastFileCheck(),null);
 assert.match(status.textContent,/FILE CHECK FAILED/);
 assert.match(status.textContent,/No changes made/);
 assert.equal(status.classList.error,true);
 assert.equal(await api.checkBackupFile(await file(JSON.stringify(
  {format:'another-game',save:live}))),null);
 const damaged=copy(live);damaged.slots[0][0][0]=null;
 assert.equal(await api.checkBackupFile(await file(JSON.stringify(backup(damaged)))),null,
  'bad slot inventory is not accepted as a valid backup');
 assert.equal(await api.checkBackupFile(await file('{}','huge.json',4*1024*1024)),null,
  'oversized file must be rejected before text parsing');
 assert.match(status.textContent,/exceeds 3 MB/);
 // Invalid live state must not damage or pause the shop when merely
 // examining an independent valid file selected from Files.
 live=copy(live);live.slots[0][0][0]=11;
 const noComparison=await api.checkBackupFile(same);
 assert.equal(noComparison.valid,true);
 assert.equal(noComparison.match,null);
 assert.match(status.textContent,/comparison unavailable/);
 assert.equal(w.BitBazaarSaveHold,false);
 // On-device picker click and change event are separate from RESTORE FILE.
 const action={target:{closest:selector=>selector==='#checkBackupFile'?{}:null}};
 handlers.click(action);
 assert.equal(chooses,1);
 assert.equal(imports,0);
 nodes.checkBackupInput.files=[same];
 nodes.checkBackupInput.value='chosen.json';
 handlers.change({target:{id:'checkBackupInput',
  files:[same],get value(){return nodes.checkBackupInput.value},
  set value(v){nodes.checkBackupInput.value=v;}}});
 await Promise.resolve();await Promise.resolve();
 assert.equal(nodes.checkBackupInput.value,'');
 assert.match(status.textContent,/BACKUP FILE READABLE/);
 assert.equal(store.get(KEY),initial,'the exact original local save is never rewritten');
 assert.equal(storageWrites,0,'no localStorage writes of any kind');
 assert.equal(saves,0,'no game autosave');
 assert.equal(imports,0,'no restore picker invoked');
 assert.equal(audits,0,'no costly physical audit needed for read-only file inspection');
 assert.equal(reloads,0);
 assert.equal(confirms,0);
 for(const page of ['preview-v0.53.0.html','baseline-v0.53.0-lowfx.html']){
  const html=read(page);
  assert.ok(html.includes('assets/save-manager-v0.53.js'),page);
  assert.ok(html.includes('game-v0.53.0'),page);
 }
 for(const engine of ['game-v0.53.0.js','game-v0.53.0-lowfx.js']){
  const code=read(engine);
  for(const id of ['checkBackupFile','checkBackupInput','saveFileInput','chooseSaveFile'])
   assert.ok(code.includes('id="'+id+'"'),engine+' missing '+id);
  assert.ok(code.includes('bit-bazaar-save-v3'));
 }
 assert.ok(read('sw.js').includes('bit-bazaar-v0.60.0'));
 assert.ok(read('sw.js').includes('./assets/save-manager-v0.53.js'));
 console.log('PASS v0.53: Files backup check validates JSON, detects matching/different live shop, blocks corruption/oversize, works through picker, never saves/imports/reloads/edits data.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
