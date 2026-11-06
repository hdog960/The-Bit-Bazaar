'use strict';
/* Bit Bazaar v0.46 — free decoration commits are atomic on storage failure. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const notes=[];
let writeOK=true,throws=false,writes=0,previewOpen=false,view=null;
const win={BIT_BAZAAR_DECOR:{
 items:[
  {id:'fox',name:'Porcelain Fox',mount:'floor',category:'Statues'},
  {id:'frame',name:'Story Frame',mount:'wall',category:'Framed Art'}
 ],
 slots:[
  {id:0,kind:'floor',x:10,z:10,name:'First pad'},
  {id:1,kind:'floor',x:22,z:10,name:'Second pad'},
  {id:2,kind:'wall',side:'NORTH',x:10,z:2,name:'Front wall'}
 ]
}};
const scope=vm.createContext({window:win,Math,Array,Map,Set,Object,Number,JSON});
for(const p of ['assets/decor-workshop-v0.46.js',
 'assets/room-workshop-v0.46.js','assets/decor-runtime-v0.46.js'])
 vm.runInContext(read(p),scope,{timeout:3000,filename:p});
const api={
 isOpen:()=>false,
 isPerfect:()=>false,rowSlots:()=>[],shelf:()=>null,
 blocked:()=>false,crowded:()=>false,
 save:()=>{writes++;if(throws)throw Error('QuotaExceededError');if(!writeOK)return false;view=JSON.stringify(runtime.state());return true;},
 notify:(msg,bad)=>notes.push({msg,bad}),
 isPreviewOpen:()=>previewOpen,
 enterPreview:()=>{previewOpen=true;},
 exitPreview:()=>{previewOpen=false;},
 refresh:()=>{},
 snapshot:()=>({}),perfectCount:()=>0,
 clearRow:()=>{},scatter:()=>{},clearUndo:()=>{}
};
const runtime=win.BIT_BAZAAR_PHASE4.create(api);
const original={decor:{owned:['fox','frame'],placed:[['fox',0],['frame',2]],
 adjustments:[['fox',1,0,0,0]],room:[1,0,0,0]}};
runtime.load(original);
const snap=()=>JSON.parse(JSON.stringify(runtime.state()));
const before=snap();
assert.equal(before.owned.length,2);
assert.equal(runtime.workshop.get('fox').dx,1);
writeOK=false;
assert.equal(runtime.move('fox',1),false,'a failed move must not claim success');
assert.deepEqual(snap(),before,'failed move restores installation and fine offsets');
assert.equal(runtime.placedSlots().find(x=>x[0]==='fox')[1],0);
assert.equal(runtime.workshop.pos('fox',0).x,10.25);
assert.equal(notes.at(-1).bad,true);
throws=true;
assert.equal(runtime.store('fox'),false,'an exception must not erase art');
assert.deepEqual(snap(),before);
throws=false;
writeOK=true;
assert.equal(runtime.move('fox',1),true);
assert.equal(runtime.placedSlots().find(x=>x[0]==='fox')[1],1);
assert.equal(runtime.workshop.snapshot().length,0,'successful relocation drops old custom offset');
const moved=snap();
writeOK=false;
assert.equal(runtime.store('fox'),false);
assert.deepEqual(snap(),moved,'failed storage does not erase ownership or mounting');
writeOK=true;
assert.equal(runtime.store('fox'),true);
assert.ok(runtime.ownedIds().includes('fox'),'storing art never unowns it');
assert.ok(!runtime.placedSlots().some(([id])=>id==='fox'));
assert.equal(runtime.move('frame',1),false,'wrong mounting surface is still rejected');
// Restore for fine-position verification; buying or reshelving is not involved.
runtime.load(original);
assert.equal(runtime.workshop.choose('fox',2,0),true);
const previous=runtimestate();
function runtimestate(){return snap();}
writeOK=false;
assert.equal(runtime.workshop.apply('fox'),false);
assert.equal(runtime.workshop.get('fox').dx,1,'prior committed position intact');
assert.equal(runtime.workshop.candidate('fox').dx,2,'failed draft is retryable');
assert.equal(runtime.workshop.pending('fox'),true);
assert.deepEqual(snap(),previous,'failed precision edit is never committed');
writeOK=true;
assert.equal(runtime.workshop.apply('fox'),true);
assert.equal(runtime.workshop.get('fox').dx,2);
assert.equal(runtime.workshop.pending('fox'),false);
assert.deepEqual(snap().adjustments[0],['fox',2,0,0,0]);
const room=runtime.room,oldRoom=Array.from(room.state());
assert.equal(room.select(0,2),true);
assert.equal(room.begin(),true);
assert.equal(previewOpen,true);
writeOK=false;
assert.equal(room.apply(),false,'room finish save failure must not claim success');
assert.deepEqual(Array.from(room.state()),oldRoom);
assert.equal(room.changes(),true);
assert.equal(room.isPreviewing(),true);
assert.equal(previewOpen,true,'player may retry without losing room preview');
writeOK=true;
assert.equal(room.apply(),true);
assert.equal(previewOpen,false);
assert.equal(room.state()[0],2);
assert.equal(room.changes(),false);
// All save fields must retain exact original format.
assert.ok(view);
const restored=snap();
assert.equal(restored.owned.length,2);
assert.equal(restored.placed.length,2);
assert.equal(restored.adjustments[0].length,5);
assert.equal(restored.room.length,4);
const errorCount=notes.filter(n=>n.bad).length;
assert.ok(errorCount>=4,'player warned on each rejected save');
for(const g of ['game-v0.46.0.js','game-v0.46.0-lowfx.js']){
 const s=read(g);
 assert.ok(s.includes('bit-bazaar-save-v3'));
 assert.ok(s.includes('BIT_BAZAAR_PHASE4'));
 assert.ok(s.includes('decorPrecisionApply:id'));
}
for(const page of ['preview-v0.46.0.html','baseline-v0.46.0-lowfx.html']){
 const s=read(page);
 for(const mod of ['decor-workshop-v0.46.js','room-workshop-v0.46.js','decor-runtime-v0.46.js'])
  assert.ok(s.includes('./assets/'+mod),page+' loads '+mod);
}
const sw=read('sw.js');
assert.ok(sw.includes('bit-bazaar-v0.62.0'));
for(const mod of ['decor-workshop-v0.46.js','room-workshop-v0.46.js','decor-runtime-v0.46.js'])
 assert.ok(sw.includes('./assets/'+mod),'PWA offline contains '+mod);
console.log('PASS v0.46: failed move, store, artwork placement and room finish never corrupt saved decoration state; retry, ownership and 3,000-figure data model preserved.');