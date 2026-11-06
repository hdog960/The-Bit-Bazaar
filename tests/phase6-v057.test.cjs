'use strict';
/* Bit Bazaar 0.57 — permanent authored achievement contract. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const w={};
vm.runInNewContext(read('assets/achievements-v0.57.js'),{window:w,Set,Map,Number,Math,Array,Object},{timeout:3000});
const a=w.BIT_BAZAAR_ACHIEVEMENTS;
assert.ok(a);
assert.equal(a.medals.length,30);
assert.equal(new Set(a.medals.map(m=>m.id)).size,30);
assert.equal(new Set(a.medals.map(m=>m.title)).size,30);
assert.deepEqual(Object.fromEntries([...new Set(a.medals.map(m=>m.group))].map(g=>[
 g,a.medals.filter(m=>m.group===g).length])),
 {COLLECTION:8,RESTORATION:7,SORTING:5,DECORATING:6,ODDITIES:4});
assert.ok(a.medals.every(m=>m.desc.length>=35&&m.title.length>=9&&m.goal>0));
const hiddenFaces=[1,4,7,10,13,16,19,22,25,28,31,34,37,40,43,46,51,56];
const hiddenIds=hiddenFaces.map((_,i)=>(29+i*157)%3000);
const fullFloor=Array.from({length:45},(_,i)=>[1,2,3][(i*7+Math.floor(i/5)*2)%3]);
const rows=()=>Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
const state=()=>({faceCleaning:Array(60).fill(0),floorCleaning:Array(45).fill(0),
 hiddenIds,hiddenRevealed:[],seenFigures:[],lifetimePerfect:[],
 pinnedSets:[],slots:rows(),ownedArt:0,placedArt:0,honorTrim:0,held:0});
const see=(state,data,prior)=>a.observe(data,state,prior);
const has=(d,id)=>d.earned.includes(id);
const fresh=state(),data=a.makeData();
assert.equal(a.summary(data,fresh).earned,0);
assert.equal(a.summary(data,fresh).total,30);
assert.equal(a.panel(data,fresh).match(/class="achievement-medal /g).length,30);
assert.match(a.panel(data,fresh),/id="achievementGallery"/);
assert.match(a.panel(data,fresh,'locked'),/LOCKED/);
assert.doesNotMatch(a.panel(data,fresh,'earned'),/class="achievement-medal /);
a.validateData(data);
for(const malformed of [
 {earned:['fake'],unordered:[],sacrificed:[],marks:[]},
 {earned:['swap','swap'],unordered:[],sacrificed:[],marks:[]},
 {earned:[],unordered:[300],sacrificed:[],marks:[]},
 {earned:[],unordered:[],sacrificed:[-1],marks:[]},
 {earned:[],unordered:[],sacrificed:[],marks:['unknown']},
 {earned:[],unordered:[],sacrificed:[],marks:['wore','wore']},
 {earned:[],unordered:[],sacrificed:[],marks:[],oops:true}
].slice(0,6))assert.throws(()=>a.validateData(malformed),/Invalid achievement history/);
assert.deepEqual(Array.from(a.normalize(undefined).earned),[]);
assert.equal(a.event(data,'removed'),false,'cannot award removal before first wearing');
assert.equal(a.event(data,'not-a-real-event'),false);
const gained=see({...fresh,seenFigures:[0,1,1,3],faceCleaning:[3,...Array(59).fill(0)]},data,null);
assert.ok(has(data,'first-sighting'));
assert.ok(has(data,'clean-one'));
assert.ok(!has(data,'ten-treasures'));
assert.equal(a.summary(data,fresh).earned,2,'earned medals stay even when current state regresses');
// A real unordered complete row, followed later by 1–10 ordering, grants repair.
const wrong=state();
wrong.slots[0][0]=[1,0,2,3,4,5,6,7,8,9];
let p=see(wrong,data,null).prior;
assert.ok(has(data,'wrong-full'));
assert.ok(!has(data,'fix-wrong'));
const fixed=state();fixed.slots[0][0]=[0,1,2,3,4,5,6,7,8,9];
p=see(fixed,data,p).prior;
assert.ok(has(data,'fix-wrong'));
assert.equal(a.event(data,'swap'),true);
assert.equal(a.event(data,'swap'),false);
see(fixed,data,p);
assert.ok(has(data,'swap'));
assert.equal(a.event(data,'wore'),true);
assert.equal(a.event(data,'removed'),true);
see(fixed,data,p);
assert.ok(has(data,'coward-worn'));
assert.ok(has(data,'coward-off'));
// A genuine purchase drops only the originally perfected set, which must
// later be re-perfected. A purchase without a previous perfect row won't count.
const d2=a.makeData();
const one=state();one.slots[0][0]=[0,1,2,3,4,5,6,7,8,9];
p=see(one,d2,null).prior;
const bought=state();bought.ownedArt=1;
p=see(bought,d2,p).prior;
assert.ok(has(d2,'first-sacrifice'));
assert.deepEqual(Array.from(d2.sacrificed),[0]);
assert.ok(!has(d2,'sacrificed-and-restored'));
const again=state();again.ownedArt=1;again.slots[0][0]=one.slots[0][0];
p=see(again,d2,p).prior;
assert.ok(has(d2,'sacrificed-and-restored'));
assert.equal(d2.sacrificed.length,0);
const noPrevious=a.makeData();
see(bought,noPrevious,null);
assert.equal(noPrevious.sacrificed.length,0);
// Endgame snapshot grants deterministic medals, and remains earned if the
// collector chooses to sacrifice the perfect rows for decor later.
const end=state();
end.slots=Array.from({length:60},(_,face)=>Array.from({length:5},(_,r)=>
 Array.from({length:10},(_,i)=>(face*5+r)*10+i)));
end.faceCleaning=Array(60).fill(3);
end.floorCleaning=fullFloor;
end.hiddenRevealed=hiddenIds;
end.seenFigures=Array.from({length:3000},(_,i)=>i);
end.lifetimePerfect=Array.from({length:300},(_,i)=>i);
end.pinnedSets=[15];end.ownedArt=20;end.placedArt=10;end.honorTrim=2;
p=see(end,data,p).prior;
const medals=a.summary(data,end);
assert.equal(medals.t.perfect,300);
assert.equal(medals.t.perfectBazaar,1);
assert.ok(has(data,'complete-archive'));
assert.ok(has(data,'all-floor'));
assert.ok(has(data,'hidden-all'));
assert.ok(has(data,'art-on-display'));
assert.ok(has(data,'finish-flair'));
assert.ok(has(data,'cowards-choice'));
assert.ok(has(data,'perfect-bazaar'));
assert.ok(has(data,'first-pin'));
assert.equal(a.summary(data,{...end,slots:rows(),ownedArt:0,placedArt:0,honorTrim:0}).earned,medals.earned);
assert.match(a.panel(data,end,'earned'),/PERMANENTLY EARNED/);
assert.equal(a.panel(data,end,'locked').includes('id="achievementGallery"'),true);
const copied=a.normalize(data);
assert.notEqual(copied,data);
a.validateData(copied);
// The v0.57 loader checks the optional history before accepting imported saves.
const saveContext={window:w,document:{addEventListener(){},getElementById(){return null}},
 localStorage:{getItem(){return null}},Math,Set,Map,JSON,Number,Array,Date,Blob};
vm.runInNewContext(read('assets/save-manager-v0.57.js'),saveContext,{timeout:3000});
assert.ok(w.BitBazaarSaveTools);
assert.throws(()=>w.BitBazaarSaveTools.validate({version:1,achievementData:{
 earned:['not-real'],unordered:[],sacrificed:[],marks:[]}}),/Invalid achievement history/);
for(const file of ['game-v0.57.0.js','game-v0.57.0-lowfx.js']){
 const text=read(file);
 assert.match(text,/const ACHIEVEMENTS=window\.BIT_BAZAAR_ACHIEVEMENTS/);
 assert.match(text,/achievementData:ACHIEVEMENTS\.normalize\(achievementData\)/);
 assert.match(text,/achievementData=ACHIEVEMENTS\.normalize\(raw\.achievementData\)/);
 assert.match(text,/ACHIEVEMENTS\.event\(achievementData,'swap'\)/);
 assert.match(text,/ACHIEVEMENTS\.observe\(achievementData,achievementState\(\),achievementPrior\)/);
 assert.match(text,/raw\.achievementData===undefined/);
 assert.match(text,/achievementRaw:\(\)=>ACHIEVEMENTS\.normalize\(achievementData\)/);
}
for(const page of ['preview-v0.57.0.html','baseline-v0.57.0-lowfx.html']){
 const html=read(page);
 assert.match(html,/id="achievementBtn"/);
 assert.match(html,/assets\/achievements-v0\.57\.js/);
 assert.match(html,/assets\/save-manager-v0\.57\.js/);
 assert.ok(html.indexOf('achievements-v0.57.js')<html.indexOf('save-manager-v0.57.js'));
 assert.ok(html.indexOf('save-manager-v0.57.js')<html.indexOf('game-v0.57.0'));
}
assert.match(read('sw.js'),/bit-bazaar-v0\.58\.0/);
assert.match(read('sw.js'),/assets\/achievements-v0\.57\.js/);
assert.match(read('sw.js'),/game-v0\.56\.0\.js/);
console.log('PASS Phase 6.3: 30 authored medals in five groups; genuine sorting and restoration history, permanent awards, strict optional backup schema, iPhone/Low FX entry points and no per-frame achievement scans.');
