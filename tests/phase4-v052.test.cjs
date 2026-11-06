'use strict';
/* Bit Bazaar v0.52 — the 180-art gallery should not raycast artwork excluded
   by the distant sprite budget. Pixel output and ghost semantics preserved. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const count=160;
const items=Array.from({length:count},(_,i)=>({
 id:'piece-'+i,name:'Original piece '+i,mount:'floor',
 category:'Statues',art:'figure',price:2,description:'Individually handcrafted artwork '+i
}));
const slots=Array.from({length:count+1},(_,i)=>({
 id:i,kind:'floor',x:0,z:i===count?8:i<6?5+i:14+(i%15),
 name:'Floor installation '+i
}));
const catalog={items,slots,quotas:[],texture:()=>({width:32,height:40}),thumbnail:()=>'/figure.png'};
function create(pathname){
 const w={BIT_BAZAAR_DECOR:catalog};
 const ctx=vm.createContext({window:w,Map,Set,Math,Object,Array,Number,JSON});
 vm.runInContext(read('assets/decor-workshop-v0.46.js'),ctx,{timeout:4000});
 w.BIT_BAZAAR_ROOM={create:()=>({
  state:()=>[0,0,0,0],load:()=>{},reset:()=>{},render:()=>'',bind:()=>{}
 })};
 vm.runInContext(read(pathname),ctx,{timeout:4000,filename:pathname});
 let saves=0;
 const rt=w.BIT_BAZAAR_PHASE4.create({
  isOpen:()=>false,save:()=>{saves++;return true;},notify:()=>{},
  perfectCount:()=>0
 });
 rt.load({decor:{owned:items.map(x=>x.id),
  placed:items.map((x,i)=>[x.id,i]),adjustments:[],room:[0,0,0,0]}});
 return {rt,get saves(){return saves}};
}
const old=create('assets/decor-runtime-v0.48.js');
const current=create('assets/decor-runtime-v0.52.js');
const depth=(_x,z)=>z,side=()=>0;
const mask=(id,slot,p,yaw,turn)=>{
 if(id==='piece-1')return [true,true,false,false];
 if(id==='piece-2')return [false,false,false,false];
 return [true,true,true,true];
};
const hidden=id=>id==='piece-3'||Number(id.split('-')[1])%11===0;
function audit(limit,maskMode=false){
 const stats=[];
 const compute=instance=>{
  let occlusionCalls=0;
  const seen=(...args)=>{occlusionCalls++;return hidden(...args);};
  const m=(...args)=>{occlusionCalls++;return mask(...args);};
  const art=instance.rt.visibleDecor(depth,side,2,limit,seen,maskMode?m:null,0);
  return {art:JSON.parse(JSON.stringify(art)),calls:occlusionCalls,
   stats:JSON.parse(JSON.stringify(instance.rt.renderStats()))};
 };
 const a=compute(old),b=compute(current);
 assert.deepEqual(b.art,a.art,'exactly same visible art and clipping for budget '+limit);
 assert.equal(b.stats.shown,a.stats.shown);
 assert.equal(b.stats.near,a.stats.near);
 assert.equal(b.stats.frustum,a.stats.frustum);
 assert.equal(b.stats.ghostShown,a.stats.ghostShown);
 stats.push(a,b);
 return stats;
}
// Around 160 fixed artworks should be considered cheap frustum candidates,
// but only nearby pieces + as many distant pieces as there are draw slots
// require 3D shelf occlusion work.
const [baseline,opt]=audit(16,true);
assert.equal(opt.stats.examined,160);
assert.equal(opt.stats.frustum,160);
assert.equal(opt.stats.near,5,'partial/hidden near art retains visible state');
assert.ok(opt.stats.budgetUnexamined>100,'unbudgeted distant art is not raycast');
assert.ok(opt.stats.occlusionTests<35,'occlusion work scales with draw budget');
assert.ok(baseline.calls>100,'old renderer raycast every gallery art');
assert.ok(opt.calls<baseline.calls/3,'large drop in actual shelf occlusion rays');
assert.equal(opt.stats.partiallyVisible>0,true,'native 4-column clipping preserved');
// Repeated stationary camera must keep the old exact two-unit hysteresis
// priority, and changing budgets must preserve the same selection.
for(const limit of [8,12,24,36,48,8])audit(limit,true);
for(const limit of [8,16,36])audit(limit,false);
// The preview destination is outside any far-art budget yet stays visible;
// true blocked destinations remain hidden while the HUD still exists.
assert.equal(old.rt.previewMove('piece-0',count),true);
assert.equal(current.rt.previewMove('piece-0',count),true);
const ghost=audit(8,true)[1];
assert.equal(ghost.art.filter(x=>x.type==='decor-ghost').length,1);
assert.equal(ghost.stats.ghostShown,true);
assert.equal(old.rt.cancelPreview(),true);
assert.equal(current.rt.cancelPreview(),true);
// Hidden real art must never be drawn through a rack even if it is highest
// priority. The renderer simply examines the next unbudgeted candidate.
const oldAfter=old.rt.visibleDecor(depth,side,2,8,()=>true);
const newAfter=current.rt.visibleDecor(depth,side,2,8,()=>true);
assert.deepEqual(JSON.parse(JSON.stringify(newAfter)),JSON.parse(JSON.stringify(oldAfter)));
assert.equal(newAfter.length,0);
// No content/data changes or background writes in any renderer.
assert.equal(old.saves,0);
assert.equal(current.saves,0);
assert.equal(current.rt.state().owned.length,160);
assert.equal(current.rt.state().placed.length,160);
for(const page of ['preview-v0.52.0.html','baseline-v0.52.0-lowfx.html'])
 assert.ok(read(page).includes('assets/decor-runtime-v0.52.js'),page);
for(const engine of ['game-v0.52.0.js','game-v0.52.0-lowfx.js'])
 assert.ok(read(engine).includes('bit-bazaar-save-v3'));
const worker=read('sw.js');
assert.ok(worker.includes('bit-bazaar-v0.56.0'));
assert.ok(worker.includes('./assets/decor-runtime-v0.52.js'));
console.log('PASS v0.52: dense 160-art output identical to preoptimization, 4-band near clipping and ghost intact, far occlusion work bounded by draw budget, all saves unchanged.');
