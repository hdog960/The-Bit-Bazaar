'use strict';
/* v0.44: read-only iPhone diagnostics & safe Low FX report carryover. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const nodes=new Map(),events={},recovery=new Map();
for(const id of ['deviceQaStart','deviceQaStop','deviceQaCopy','deviceQaReport'])nodes.set(id,{disabled:false,textContent:''});
let tick=0,audits=0,saves=0;
const window={BitBazaarQA:{
 stats:()=>({placed:500,completedRows:50,hiddenFound:7,sprites:{cacheSize:81,maxCache:112},decorRender:{installed:95}}),
 decorRenderStats:()=>({installed:95,shown:31,partiallyVisible:4,skippedBudget:2}),
 figureIntegrity:()=>{audits++;return {ok:true,total:3000,issues:[]};},
 saveNow:()=>{saves++;}
}};
const env=vm.createContext({window,Date,Math,Number,JSON,performance:{now:()=>tick},navigator:{},
 sessionStorage:{getItem:k=>recovery.get(k)||null,setItem:(k,v)=>recovery.set(k,String(v)),removeItem:k=>recovery.delete(k)},
 document:{getElementById:id=>nodes.get(id)||null,addEventListener:(n,fn)=>events[n]=fn,visibilityState:'visible'}});
vm.runInContext(read('assets/device-qa-v0.44.js'),env,{timeout:3000});
const qa=window.BitBazaarDeviceQA;
assert.equal(qa.start(),true);
assert.equal(qa.start(),false);
for(let i=0;i<500;i++){tick+=43;qa.record(i===50?121:(i%10===0?46:23),i%10===0?8:0,i===50?1:0);}
const report=qa.stop();
assert.match(report,/Rendered frames: 500/);
assert.match(report,/SUSTAINED SAMPLE/);
assert.match(report,/>115 ms: 1/);
assert.match(report,/95 installed/);
assert.match(report,/81 \/ 112 canvases/);
assert.match(report,/Inventory audit: OK/);
assert.equal(audits,1);
assert.equal(saves,0);
qa.record(50,0,0);
assert.equal(qa.report(),report);
assert.equal(qa.start(),true);
for(let i=0;i<5;i++){tick+=50;qa.record(120,8,2);}
qa.recover();
assert.match(recovery.get('bit-bazaar-device-qa-recovery-v044'),/AUTO LOW FX RECOVERY/);
assert.equal(audits,1,'emergency does not run expensive audit');
assert.equal(saves,0,'no save mutations ever');
for(const p of ['game-v0.44.0.js','game-v0.44.0-lowfx.js']){
 const s=read(p);
 assert.ok(s.includes('window.BitBazaarDeviceQA?.record(lastRuntimeMs,slowFrames,extremeFrames)'));
 assert.ok(s.includes('window.BitBazaarDeviceQA?.recover()'));
 for(const id of ['deviceQaStart','deviceQaStop','deviceQaCopy','deviceQaReport'])assert.ok(s.includes('id="'+id+'"'));
 assert.ok(s.includes('bit-bazaar-save-v3'));
}
for(const p of ['preview-v0.44.0.html','baseline-v0.44.0-lowfx.html'])assert.ok(read(p).includes('device-qa-v0.44.js'));
assert.ok(read('sw.js').includes('bit-bazaar-v0.54.0'));
console.log('PASS v0.44 optional iPhone recording, bounded telemetry, recovery and no save writes');