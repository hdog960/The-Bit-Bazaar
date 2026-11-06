'use strict';
/* v0.52 read-only on-device frame and visibility-cost report. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const els=new Map(),storage=new Map(),events={};let time=0,saves=0,audits=0,decorReads=0;
for(const id of ['deviceQaStart','deviceQaStop','deviceQaCopy','deviceQaReport'])
 els.set(id,{textContent:'',disabled:false});
const w={BitBazaarQA:{
 stats:()=>({placed:60,completedRows:6,hiddenFound:2,
  sprites:{cacheSize:34,maxCache:112},decorRender:{installed:160}}),
 decorRenderStats:()=>{decorReads++;return {installed:160,shown:16,
  partiallyVisible:3,skippedBudget:130,occlusionTests:23,budgetUnexamined:130}},
 figureIntegrity:()=>{audits++;return {ok:true,total:3000,issues:[]}},
 saveNow:()=>{saves++;return true}
}};
const ctx=vm.createContext({window:w,Math,Number,Date,JSON,
 performance:{now:()=>time},navigator:{},
 sessionStorage:{getItem:k=>storage.get(k)||null,
  setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},
 document:{getElementById:id=>els.get(id)||null,addEventListener:(k,fn)=>events[k]=fn,
  visibilityState:'visible'}
});
vm.runInContext(read('assets/device-qa-v0.52.js'),ctx,{timeout:3000});
const qa=w.BitBazaarDeviceQA;
assert.ok(qa.start());
for(let i=0;i<504;i++){time+=43;qa.record(20+(i%9),i%21===0?8:0,0);}
const text=qa.stop();
assert.match(text,/Build: v0\.52\.0/);
assert.match(text,/SUSTAINED SAMPLE/);
assert.match(text,/Gallery visibility checks: average 23\.0 per sample/);
assert.match(text,/budget-excluded before raycasts: avg 130\.0/);
assert.match(text,/160 installed/);
assert.match(text,/Inventory audit: OK/);
assert.ok(decorReads>20);
assert.equal(audits,1);
assert.equal(saves,0,'telemetry cannot modify the saved shop');
// Fallback still carries the opt-in report in sessionStorage, independently
// of the figure collection storage key.
assert.equal(qa.start(),true);
time+=100;qa.record(140,9,2);
qa.recover();
const key='bit-bazaar-device-qa-recovery-v052';
assert.match(storage.get(key),/AUTO LOW FX RECOVERY/);
assert.equal(saves,0);
assert.equal(audits,1,'emergency report skips expensive inventory audit');
for(const p of ['preview-v0.52.0.html','baseline-v0.52.0-lowfx.html'])
 assert.ok(read(p).includes('assets/device-qa-v0.52.js'));
const sw=read('sw.js');
assert.ok(sw.includes('./assets/device-qa-v0.52.js'));
assert.ok(sw.includes('./assets/device-qa-v0.44.js'));
console.log('PASS v0.52: real-device report records avoided shelf raycasts, preserves cache bounds, carries emergency report and never writes player saves.');
