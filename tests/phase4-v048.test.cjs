'use strict';
/* Bit Bazaar v0.48: purchase cannot bypass integrity quarantine or write
 * an invalid result into the permanent 3,000-figure save. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const KEY='bit-bazaar-save-v3',BACKUP='bit-bazaar-v3-before-first-sacrifice';
const clone=x=>JSON.parse(JSON.stringify(x));
function fixture(){
 const rows=Array.from({length:60},()=>Array.from({length:5},()=>[]));
 const slots=Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
 for(let row=0;row<2;row++){
  rows[0][row]=Array.from({length:10},(_,i)=>row*10+i);
  slots[0][row]=[...rows[0][row]];
 }
 return {version:1,rows,slots,tote:[],selected:null,
  cleaning:Array(60).fill(0),floorCleaning:Array(45).fill(0),
  seenFigures:Array.from({length:20},(_,i)=>i),pinnedSets:[],lifetimePerfect:[0,1],
  trackedSetId:null,revealed:[],ground:[],
  player:{x:35,z:68,yaw:0,pitch:0},
  decor:{owned:[],placed:[],adjustments:[],room:[0,0,0,0]}};
}
let world=fixture(),runtime,storageFails=false,validAudit=true;
const notices=[],store=new Map([[KEY,JSON.stringify(world)]]);
let cleared=0,scattered=0,validationCalls=0,auditCalls=0;
const catalog={
 items:[{id:'first-sculpture',name:'First Sculpture',mount:'floor',price:2,category:'Statues',description:'Hand-painted original.'}],
 slots:[{id:0,kind:'floor',name:'Open floor pad',x:35,z:35}]
};
const window={
 BIT_BAZAAR_DECOR:catalog,BitBazaarSaveHold:false,BitBazaarImportInProgress:false,
 confirm:()=>true,location:{reload:()=>{throw Error('must not reload in tests');}}
};
window.BIT_BAZAAR_WORKSHOP={create:()=>({
 snapshot:()=>[],load:()=>{},resetAll:()=>{},onMove:()=>{},onStore:()=>{},
 pos:(_id,slot)=>catalog.slots[slot],rotation:()=>0,tone:()=>0,
 controls:()=>'',bind:()=>{}
})};
window.BIT_BAZAAR_ROOM={create:()=>({
 state:()=>[0,0,0,0],load:()=>{},reset:()=>{},render:()=>'',bind:()=>{}
})};
const localStorage={
 getItem:k=>store.has(k)?store.get(k):null,
 setItem(k,v){
  if(k===KEY&&storageFails)throw Error('QuotaExceededError');
  store.set(k,String(v));
 }
};
const document={addEventListener(){},getElementById:()=>null};
window.BitBazaarQA={figureIntegrity:()=>{
 auditCalls++;
 return {ok:validAudit,total:3000,
  shelved:world.rows.flat(2).length,held:world.tote.length,hiddenFound:world.revealed.length,
  issues:validAudit?[]:['duplicate or missing physical figure']};
}};
const scope=vm.createContext({window,localStorage,document,Math,Map,Set,Object,Array,Number,JSON});
vm.runInContext(read('assets/save-manager-v0.47.js'),scope,{timeout:4000});
const realTools=window.BitBazaarSaveTools;
assert.equal(realTools.validate(world).placed,20);
vm.runInContext(read('assets/decor-runtime-v0.48.js'),scope,{timeout:4000});
function isPerfect(face,row){
 const s=world.slots[face][row];
 return s.length===10&&s.every((id,i)=>id!==null&&id%10===i);
}
const api={
 isOpen:()=>false,notify:(message,bad)=>notices.push({message,bad}),
 perfectCount:()=>world.rows.flat(1).filter(x=>x.length===10).length,
 isPerfect,rowSlots:(face,row)=>world.slots[face][row],
 shelf:()=>({face:1,fixture:{x:35,z:32,nx:0,nz:1,ux:1,uz:0,depth:1.72}}),
 blocked:()=>false,crowded:()=>false,
 snapshot:()=>clone({...world,decor:runtime.state()}),
 clearRow:(face,row)=>{world.rows[face][row]=[];world.slots[face][row].fill(null);cleared++;},
 scatter:(id,x,z)=>{world.ground.push([id,x,z]);scattered++;},
 clearUndo:()=>{},refresh:()=>{},save:()=>true
};
runtime=window.BIT_BAZAAR_PHASE4.create(api);
runtime.load(world);
function buy(){return runtime.buy('first-sculpture',0,true);}
const baseline=store.get(KEY);

window.BitBazaarSaveHold=true;
assert.equal(buy(),false,'purchase blocked during recovery hold');
assert.equal(store.get(KEY),baseline);
assert.equal(store.has(BACKUP),false);
assert.equal(cleared,0);assert.equal(scattered,0);
assert.equal(runtime.ownedIds().length,0);
assert.match(notices.at(-1).message,/SAVE RECOVERY/);
window.BitBazaarSaveHold=false;
// The JSON ledger preflight must reject a malformed live scene.
world.player.x=120;
const oldAudits=auditCalls;
assert.equal(buy(),false);
assert.equal(auditCalls,oldAudits,'invalid ledger never triggers physical audit');
assert.equal(window.BitBazaarSaveHold,true,'bad live scene triggers quarantine');
assert.equal(store.get(KEY),baseline);
assert.equal(cleared,0);assert.equal(scattered,0);
world.player.x=35;
window.BitBazaarSaveHold=false;
validAudit=false;
assert.equal(buy(),false,'physical mismatch rejects purchase');
assert.equal(window.BitBazaarSaveHold,true);
assert.equal(store.get(KEY),baseline);
assert.equal(cleared,0);assert.equal(scattered,0);
validAudit=true;
window.BitBazaarSaveHold=false;
// A valid live state cannot authorize an invalid proposed post-purchase save.
window.BitBazaarSaveTools={validate:value=>{
 validationCalls++;
 const summary=realTools.validate(value);
 if(value.decor.owned.length)throw Error('Injected candidate mismatch');
 return summary;
}};
assert.equal(buy(),false);
assert.match(notices.at(-1).message,/INVALID RESULTING SAVE/);
assert.equal(window.BitBazaarSaveHold,false,'only the candidate was invalid');
assert.equal(store.get(KEY),baseline);
assert.equal(cleared,0);assert.equal(scattered,0);
window.BitBazaarSaveTools=realTools;
// Storage quota failure does not mutate physical inventory or art ownership.
storageFails=true;
assert.equal(buy(),false);
assert.equal(cleared,0);assert.equal(scattered,0);
assert.equal(store.get(KEY),baseline);
assert.equal(runtime.ownedIds().length,0);
storageFails=false;
assert.equal(buy(),true,'the same legitimate purchase succeeds when storage works');
assert.equal(cleared,2,'exactly 2 currently perfect rows sacrificed');
assert.equal(scattered,20,'exactly 20 existing figurines returned to physical floor');
assert.equal(new Set(world.ground.map(x=>x[0])).size,20);
assert.ok(world.ground.every(x=>x[0]>=0&&x[0]<20));
assert.deepEqual(Array.from(runtime.ownedIds()),['first-sculpture']);
const saved=JSON.parse(store.get(KEY));
const summary=realTools.validate(saved);
assert.equal(summary.placed,0);
assert.equal(summary.perfect,0);
assert.equal(summary.dropped,20);
assert.equal(summary.ownedArt,1);
assert.equal(summary.lifetimeMastered,2);
assert.equal(saved.ground.length,20);
assert.equal(store.has(BACKUP),true);
assert.equal(JSON.parse(store.get(BACKUP)).rows[0][0].length,10,
 'the pre-first-sacrifice recovery image retains its initial sorted row');
assert.equal(buy(),false,'owned art cannot be bought twice');
assert.equal(cleared,2);
assert.equal(scattered,20);
// Current normal/Low FX builds share the same new runtime and PWA.
for(const entry of ['index.html','preview-v0.48.0.html','baseline-v0.48.0-lowfx.html']){
 assert.ok(read(entry).includes('assets/decor-runtime-v0.48.js'));
}
for(const game of ['game-v0.48.0.js','game-v0.48.0-lowfx.js']){
 assert.ok(read(game).includes('bit-bazaar-save-v3'));
 assert.ok(read(game).includes('BitBazaarSaveHold'));
}
const sw=read('sw.js');
assert.ok(sw.includes('bit-bazaar-v0.48.0'));
assert.ok(sw.includes('assets/decor-runtime-v0.48.js'));
console.log('PASS v0.48: paused purchases do not bypass save quarantine; old and proposed inventories validated before writing; physical audit, quota rollback, two-row/20-figure conservation and PWA confirmed.');
