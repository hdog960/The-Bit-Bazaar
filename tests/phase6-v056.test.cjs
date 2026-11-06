'use strict';
/* Bit Bazaar Phase 6.2 — The Three Journeys are derived from actual world
   progress and NEVER invent extra figurines, permanent saves or currency. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const w={};
vm.runInNewContext(read('assets/journeys-v0.56.js'),{
 window:w,Math,Set,Map,Number,Array,Object
},{timeout:3000});
const mod=w.BIT_BAZAAR_JOURNEYS;
assert.ok(mod);
const hiddenFaces=[1,4,7,10,13,16,19,22,25,28,31,34,37,40,43,46,51,56];
const hiddenIds=hiddenFaces.map((_,i)=>(29+i*157)%3000);
const fullFloor=Array.from({length:45},(_,i)=>[1,2,3][(i*7+Math.floor(i/5)*2)%3]);
const base=()=>({faceCleaning:Array(60).fill(0),floorCleaning:Array(45).fill(0),
 hiddenIds,hiddenRevealed:[],lifetimePerfect:[],perfectRows:0,shelved:0,held:0});
let start=mod.evaluate(base());
assert.equal(start.completed,0);
assert.equal(start.restorer.complete,false);
assert.equal(start.archivist.complete,false);
assert.equal(start.perfect.complete,false);
assert.deepEqual(Array.from(start.restorer.metrics,m=>m.total),[60,45,18]);
assert.deepEqual(Array.from(start.perfect.metrics,m=>m.total),[300,3000]);
// Each of the three restoration requirements is independently necessary.
const clean=base();
clean.faceCleaning=Array(60).fill(3);
clean.floorCleaning=fullFloor;
clean.hiddenRevealed=hiddenIds;
assert.equal(mod.evaluate(clean).restorer.complete,true);
for(const field of ['faceCleaning','floorCleaning','hiddenRevealed']){
 const partial={...clean,[field]:[...clean[field]]};
 partial[field][0]=field==='hiddenRevealed'?null:0;
 assert.equal(mod.evaluate(partial).restorer.complete,false,field);
}
// A floor stain with two of three stages remains unfinished; extra or invalid
// reveal IDs never grant an undiscovered hidden figure.
const stain=fullFloor.findIndex(x=>x===3);
const unfinished={...clean,floorCleaning:[...fullFloor]};
unfinished.floorCleaning[stain]=2;
assert.equal(mod.evaluate(unfinished).restorer.metrics[1].count,44);
assert.equal(mod.evaluate({...clean,hiddenRevealed:hiddenIds.slice(0,17).concat(99999)}).restorer.complete,false);
assert.equal(mod.evaluate({...clean,hiddenRevealed:hiddenIds.concat(hiddenIds[0])}).restorer.complete,true);
// Mastery counts DISTINCT lifetime sets, not the currently completed shelves.
const mastered=Array.from({length:300},(_,i)=>i);
const ever299={...clean,lifetimePerfect:mastered.slice(0,299)};
assert.equal(mod.evaluate(ever299).archivist.complete,false);
const archive={...clean,lifetimePerfect:new Set(mastered)};
assert.equal(mod.evaluate(archive).completed,2);
assert.equal(mod.evaluate({...clean,lifetimePerfect:[0,0,1,1]}).archivist.metrics[0].count,2);
assert.equal(mod.evaluate({...clean,lifetimePerfect:[-1,300,301]}).archivist.metrics[0].count,0);
// Full current display requires 300 PERFECT rows AND all 3,000 figures shelved.
for(const current of [
 {...archive,perfectRows:299,shelved:3000,held:0},
 {...archive,perfectRows:300,shelved:2999,held:1},
 {...archive,perfectRows:300,shelved:3000,held:1}
])assert.equal(mod.evaluate(current).perfect.complete,false);
const finish={...archive,perfectRows:300,shelved:3000,held:0};
const won=mod.evaluate(finish);
assert.equal(won.completed,3);
assert.equal(won.perfect.complete,true);
assert.equal(won.archivist.complete,true);
// Sacrificing rows intentionally revokes only the CURRENT perfect condition.
const sacrificed={...finish,perfectRows:290,shelved:2900};
const after=mod.evaluate(sacrificed);
assert.equal(after.completed,2);
assert.equal(after.archivist.complete,true);
assert.equal(after.restorer.complete,true);
assert.equal(after.perfect.complete,false);
// Rendered awards are explicit about permanent vs live, progress is accessible.
const html=mod.panel(after);
assert.match(html,/id="journeyGallery"/);
assert.equal((html.match(/class="journey-card /g)||[]).length,3);
assert.equal((html.match(/journey-complete/g)||[]).length,2);
assert.match(html,/Sacrificing a perfect row will reopen this journey/);
assert.match(html,/aria-valuemax="3000"/);
assert.match(mod.panel(won),/3 \/ 3 COMPLETE/);
// Both engines retain identical v0.56 journey tracking, no blocking victory.
for(const file of ['game-v0.56.0.js','game-v0.56.0-lowfx.js']){
 const src=read(file);
 assert.ok(src.includes('const JOURNEYS=window.BIT_BAZAAR_JOURNEYS'));
 assert.ok(src.includes('JOURNEYS.evaluate({faceCleaning,floorCleaning,hiddenRevealed'));
 assert.ok(src.includes('JOURNEYS.panel(journeyState())'));
 assert.ok(src.includes('journeysState:()=>journeyState()'));
 assert.ok(src.includes("$('journeyBtn').onclick="));
 assert.ok(!src.includes('if(completed===NUM_RACKS*ROWS){setTimeout(()=>showVictory(),1200)}'));
 assert.ok(src.includes('const STORE_KEY='));
 assert.ok(src.includes("const HONORS=window.BIT_BAZAAR_HONORS"));
}
for(const page of ['preview-v0.56.0.html','baseline-v0.56.0-lowfx.html']){
 const src=read(page);
 assert.ok(src.includes('id="journeyBtn"'));
 assert.ok(src.includes('assets/journeys-v0.56.js'));
 assert.ok(src.indexOf('journeys-v0.56.js')<src.indexOf('game-v0.56.0'));
 assert.ok(src.includes('style-v0.56.0.css'));
}
assert.match(read('sw.js'),/bit-bazaar-v0\.61\.0/);
assert.match(read('sw.js'),/assets\/journeys-v0\.56\.js/);
assert.match(read('sw.js'),/game-v0\.55\.0\.js/,'previous build remains cached fallback');
assert.match(read('style-v0.56.0.css'),/\.journey-gallery/);
assert.match(read('style-v0.56.0.css'),/\.journey-shortcut/);
console.log('PASS Phase 6.2: Three Journeys with exact 60/45/18, 300 lifetime and 300 live requirements; sacrifice cannot revoke permanent progress; original save keys, 3,000 figures and both engines preserved.');
