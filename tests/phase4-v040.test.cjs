'use strict';
/* Bit Bazaar v0.40 — dense-gallery physical shelf visibility and
 * reticle/render agreement, reverse endcap protection, protected
 * relocation previews and completely unchanged stored inventory. */
const assert=require('node:assert/strict'),fs=require('node:fs'),
 path=require('node:path'),vm=require('node:vm');
const code=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const window={},ctx=vm.createContext({window,Math,Map,Set,Object,Array,Number,JSON});
for(const p of ['assets/decor-workshop-v0.38.js','assets/decor-visibility-v0.40.js'])
 vm.runInContext(code(p),ctx,{filename:p,timeout:3000});
const END={
 slots:[
  {id:0,kind:'wall',profile:'endcap',side:'WEST',x:10,z:15,fixtureId:7},
  {id:1,kind:'wall',profile:'endcap',side:'EAST',x:20,z:15,fixtureId:8},
  {id:2,kind:'floor',x:30,z:15},
  {id:3,kind:'ceiling',x:40,z:15}
 ]
};
let camera={x:9,z:15},calls=[];
const eye=window.BIT_BAZAR_DOES_NOT_EXIST||window.BIT_BAZAAR_DECOR_VISIBILITY.create({
 catalog:END,getCamera:()=>camera,
 isBlocked:(point,exclude)=>{calls.push([point.x,exclude]);return point.x===30}
});
assert.equal(eye.hidden('west',0,{x:10,z:15}),false,'front face of WEST endcap visible');
assert.deepEqual(calls.pop(),[10,7],'only owning endcap fixture exempt');
camera={x:11,z:15};
assert.equal(eye.hidden('west',0,{x:10,z:15}),true,'never render metal back of WEST endcap');
assert.equal(calls.length,0,'reverse-side art rejected without unnecessary ray checks');
camera={x:21,z:15};
assert.equal(eye.hidden('east',1,{x:20,z:15}),false,'front face of EAST endcap visible');
assert.deepEqual(calls.pop(),[20,8]);
camera={x:19,z:15};
assert.equal(eye.hidden('east',1,{x:20,z:15}),true,'metal back of EAST endcap hidden');
assert.equal(eye.hidden('floor',2,{x:30,z:15}),true,'opaque shelf in front blocks ground art');
assert.deepEqual(calls.pop(),[30,-1],'unattached art does not exempt any shelves');
assert.equal(eye.hidden('ceiling',3,{x:40,z:15}),false,'unblocked overhead piece stays visible');
assert.deepEqual(calls.pop(),[40,-1]);
assert.equal(eye.hidden('bad',999,{x:1,z:1}),true);
assert.equal(eye.hidden('bad',2,{x:NaN,z:15}),true);
assert.equal(calls.length,0,'invalid locations do not perform a ray cast');
const num=40,items=Array.from({length:num},(_,i)=>({
 id:'art-'+i,name:'Catalog piece '+i,mount:'floor',art:'sample',
 category:'Statues',price:2,description:'Distinct miniature sculpture '+i
}));
const slots=Array.from({length:num+1},(_,i)=>({
 id:i,kind:'floor',side:'FLOOR',x:i===num?400:i*3,
 z:i===num?18:i<6?6+i:14+(i%18),name:'Floor '+i
}));
window.BIT_BAZAAR_DECOR={
 items,slots,quotas:[],texture:()=>({width:32,height:40}),
 thumbnail:()=>'/fake.png'
};
window.BIT_BAZAAR_ROOM={create:()=>({
 state:()=>[],load:()=>{},reset:()=>{},render:()=>'',bind:()=>{}
})};
vm.runInContext(code('assets/decor-runtime-v0.40.js'),ctx,{filename:'shared runtime',timeout:3000});
let saves=0,blockedGhost=true;
const placed=items.map((item,i)=>[item.id,i]);
const runtime=window.BIT_BAZAAR_PHASE4.create({
 isOpen:()=>false,save:()=>saves++,notify:()=>{},perfectCount:()=>0
});
runtime.load({decor:{owned:items.map(x=>x.id),placed,adjustments:[],room:[]}});
assert.equal(runtime.state().owned.length,40);
assert.equal(runtime.state().placed.length,40);
const geometry=window.BIT_BAZAAR_DECOR_VISIBILITY.create({
 catalog:window.BIT_BAZAAR_DECOR,getCamera:()=>({x:0,z:0}),
 isBlocked:point=>point.x===6||point.x===9||(blockedGhost&&point.x===400)
});
const depth=(x,z)=>z,side=()=>0;
const unaffected=runtime.visibleDecor(depth,side,2,8);
assert.equal(unaffected.length,8,'budget applies without any shelf filter');
const visible=runtime.visibleDecor(depth,side,2,8,geometry.hidden);
assert.equal(visible.length,8,'blocked art does not consume the visible budget');
assert.equal(visible.some(x=>x.itemId==='art-2'),false,'occluded nearby statue does not draw through shelf');
assert.equal(visible.some(x=>x.itemId==='art-3'),false,'second hidden nearby statue removed');
for(const id of ['art-0','art-1','art-4','art-5'])
 assert.ok(visible.some(x=>x.itemId===id),'every unoccluded near sculpture still draws '+id);
const info=runtime.renderStats();
assert.equal(info.frustum,40);
assert.equal(info.hiddenByFixtures,2,'occlusion counter reports hidden art');
assert.equal(info.near,4,'four clear nearby pieces');
assert.equal(info.shown,8);
assert.equal(info.skippedBudget,30,'remaining distant pieces selected by budget');
assert.equal(saves,0,'render pass cannot write saves');
const positionsBefore=JSON.stringify(runtime.state());
const second=runtime.visibleDecor(depth,side,2,8,geometry.hidden);
assert.equal(second.map(x=>x.itemId).join(','),
 visible.map(x=>x.itemId).join(','),'stable draw selection at fixed camera');
assert.equal(JSON.stringify(runtime.state()),positionsBefore,'visibility does not modify ownership or physical mounts');
assert.equal(runtime.previewMove('art-0',40),true,'can preview free destination even behind shelf');
const hiddenPreview=runtime.visibleDecor(depth,side,2,8,geometry.hidden);
assert.equal(hiddenPreview.some(x=>x.type==='decor-ghost'),false,
 'translucent preview does not show through opaque shelf');
assert.equal(runtime.renderStats().ghostBlocked,true);
assert.equal(runtime.renderStats().ghostShown,false);
assert.equal(runtime.previewState().id,'art-0',
 'occluded ghost remains available to cancel or confirm in persistent HUD');
blockedGhost=false;
const clearPreview=runtime.visibleDecor(depth,side,2,8,geometry.hidden);
assert.equal(clearPreview.filter(x=>x.type==='decor-ghost').length,1,
 'ghost ignores budget when physical sightline is clear');
assert.equal(runtime.renderStats().ghostShown,true);
assert.equal(runtime.renderStats().ghostBlocked,false);
assert.equal(clearPreview.length,9);
assert.equal(runtime.cancelPreview(),true);
assert.equal(saves,0);
assert.equal(JSON.stringify(runtime.state()),positionsBefore,
 'no save mutations when visibility changes or ghost is canceled');
runtime.load({decor:runtime.state()});
assert.equal(runtime.state().owned.length,40,'reloading unchanged save retains all artwork');
assert.equal(runtime.state().placed.length,40);
assert.equal(saves,0);
const main=code('preview-v0.40.0.html'),worker=code('sw.js');
for(const file of ['assets/decor-visibility-v0.40.js','assets/decor-runtime-v0.40.js',
 'game-v0.40.0.js','style-v0.40.0.css'])
 assert.ok(main.includes('./'+file),'archived v0.40 preview loads '+file);
// The active v0.42 offline cache keeps v0.41 as the supported rollback.
// Older historical releases remain in Git history and preview HTML.
assert.ok(main.indexOf('decor-world-v0.29.js')<main.indexOf('decor-visibility-v0.40.js'));
assert.ok(main.indexOf('decor-visibility-v0.40.js')<main.indexOf('game-v0.40.0.js'));
assert.ok(main.indexOf('decor-workshop-v0.38.js')<main.indexOf('decor-runtime-v0.40.js'));
for(const p of ['game-v0.40.0.js','game-v0.40.0-lowfx.js']){
 const source=code(p);
 for(const phrase of [
  'BIT_BAZAAR_DECOR_VISIBILITY.create({',
  'decorSight.hidden(id,site.id,pos)',
  ',decorSight.hidden)',
  'decorOccluded:(id,slot)=>',
  "bit-bazaar-save-v3"
 ])assert.ok(source.includes(phrase),p+' must wire both visual and reticle sightlines '+phrase);
}
assert.ok(code('baseline-v0.40.0-lowfx.html').includes('game-v0.40.0-lowfx.js'));
assert.ok(worker.includes('bit-bazaar-v0.44.0'));
console.log('PASS v0.40: WEST/EAST endcap reverses hidden, owning fixture excluded, shelf-obscured art suppressed before budget, near clear art retained, ghosts respect solid racks but not draw budget, save unchanged, both iPhone engines and offline cache aligned.');
