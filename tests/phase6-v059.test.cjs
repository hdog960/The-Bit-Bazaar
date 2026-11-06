'use strict';
/* Bit Bazaar Phase 6.5 — voluntary post-completion collecting and décor. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const w={};
vm.runInNewContext(read('assets/postgame-v0.59.js'),{
 window:w,Set,Array,Object,Number,Math,String
},{timeout:3000});
const P=w.BIT_BAZAAR_POSTGAME;
assert.ok(P);
assert.equal(P.PAGE_SIZE,6);
const sets=Array.from({length:300},(_,id)=>({id,name:'Collection #'+id,theme:'Original'}));
const empty=()=>Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
const filled=()=>Array.from({length:60},(_,face)=>Array.from({length:5},(_,row)=>
 Array.from({length:10},(_,i)=>(face*5+row)*10+i)));
const state=(opts={})=>({
 earned:[],slots:empty(),lifetimePerfect:[],pinnedSets:[],sacrificed:[],
 ownedArt:0,placedArt:0,sets,...opts
});
let s=P.evaluate(state());
assert.equal(s.unlocked,false);
assert.equal(s.complete,false);
assert.equal(s.perfectRows,0);
assert.equal(s.shelved,0);
assert.equal(P.panel(s),'','cannot browse postgame before true physical completion');
// Even 300 lifetime perfected sets, 300 previously seen miniature IDs,
// or a finaleViewed preference can never unlock Encore.
s=P.evaluate(state({lifetimePerfect:Array.from({length:300},(_,i)=>i),finaleViewed:true}));
assert.equal(s.unlocked,false);
assert.equal(P.panel(s),'');
const mastered=Array.from({length:300},(_,i)=>i);
let full=state({earned:['perfect-bazaar'],slots:filled(),lifetimePerfect:mastered});
s=P.evaluate(full);
assert.equal(s.unlocked,true);
assert.equal(s.complete,true);
assert.equal(s.perfectRows,300);
assert.equal(s.shelved,3000);
assert.equal(s.missingRows,0);
assert.equal(s.looseFigures,0);
assert.equal(s.pending,0);
assert.equal(s.unfinished,0);
assert.match(P.panel(s),/EVERY FIGURE IN PLACE/);
assert.match(P.panel(s),/OPEN SACRIFICE CATALOG/);
assert.doesNotMatch(P.panel(s),/data-encore-set=/);
// Physical rearrangement after purchase must never revoke earned Encore.
let disrupted=filled();
disrupted[0][0]=Array(10).fill(null); // set 0 on floor
disrupted[2][2]=Array(10).fill(null); // set 12 on floor
disrupted[10][0]=[501,500,502,503,504,505,506,507,508,509]; // full but unordered set 50
let after=state({earned:['perfect-bazaar'],slots:disrupted,
 lifetimePerfect:mastered,sacrificed:[12,0],
 ownedArt:8,placedArt:4,pinnedSets:[12]});
s=P.evaluate(after);
assert.equal(s.unlocked,true);
assert.equal(s.complete,false);
assert.equal(s.perfectRows,297);
assert.equal(s.shelved,2980);
assert.equal(s.looseFigures,20);
assert.equal(s.fullUnsorted,1);
assert.equal(s.pending,2);
assert.equal(s.unfinished,3);
assert.deepEqual(Array.from(s.targets,p=>p.id),[0,12,50]);
assert.equal(s.targets[0].pending,true);
assert.equal(s.targets[1].pinned,true);
assert.equal(s.targets[2].fullUnsorted,true);
assert.equal(s.targets[2].shelved,10);
assert.equal(s.targets[2].correct,8);
assert.deepEqual(Array.from(s.targets[2].where),[10,0]);
assert.equal(s.targets[0].where,null,'no loose figure coordinate or fictitious row');
const out=P.panel(s);
assert.match(out,/2 FROM DECOR PURCHASES/);
assert.match(out,/DECORATION SACRIFICE/);
assert.match(out,/ROW FULL · REORDER 1–10/);
assert.match(out,/data-encore-set="0"/);
assert.doesNotMatch(out,/data-encore-map="0"/,'a scattered set has no assigned shelf to map');
assert.match(out,/data-encore-map="50"/,'real shelf positions are navigable');
assert.match(out,/data-encore-pin="12" aria-pressed="true"/);
assert.match(out,/VIEW THE STORE MAP/);
assert.match(out,/PIN SET/);
assert.match(out,/OPEN CHECKLIST/);
assert.match(out,/Nothing is bought until you choose and confirm it/);
// A restoration partially underway may be revisited with existing physical
// shelf location but must not count as complete until #1–10 are in order.
const part=filled();
part[0][0]=[0,1,2,3,4,5,null,null,null,null];
s=P.evaluate(state({earned:['perfect-bazaar'],slots:part,lifetimePerfect:mastered}));
assert.equal(s.perfectRows,299);
assert.equal(s.shelved,2996);
assert.equal(s.targets[0].id,0);
assert.equal(s.targets[0].shelved,6);
assert.equal(s.targets[0].correct,6);
assert.deepEqual(Array.from(s.targets[0].where),[0,0]);
assert.match(P.panel(s),/6 \/ 10 ON SHELF/);
// Pagination is bounded; never render 300 DOM cards on a small phone.
const emptyAfter=P.evaluate(state({earned:['perfect-bazaar'],lifetimePerfect:mastered}));
assert.equal(emptyAfter.unfinished,300);
assert.equal((P.panel(emptyAfter).match(/class="encore-target"/g)||[]).length,6);
assert.equal((P.panel(emptyAfter,1).match(/class="encore-target"/g)||[]).length,6);
assert.equal((P.panel(emptyAfter,500).match(/class="encore-target"/g)||[]).length,6);
assert.match(P.panel(emptyAfter,500),/PAGE 50 \/ 50/);
assert.match(P.panel(emptyAfter,0),/data-encore-page="prev" disabled/);
assert.match(P.panel(emptyAfter,500),/data-encore-page="next" disabled/);
// HTML escape real custom catalog names rather than trusting raw source text.
const injected=state({earned:['perfect-bazaar'],lifetimePerfect:[0],
 sets:[{name:'<img src=x onerror=alert(1)>',theme:'Original'},...sets.slice(1)]});
const markup=P.panel(P.evaluate(injected));
assert.doesNotMatch(markup,/<img /);
assert.match(markup,/&lt;img src=x onerror=alert\(1\)&gt;/);
// No cycles, checkpoints or stored postgame state: source remains untouched.
const raw=JSON.stringify(after);
P.panel(P.evaluate(after),0);
assert.equal(JSON.stringify(after),raw);
for(const path of ['game-v0.59.0.js','game-v0.59.0-lowfx.js']){
 const text=read(path);
 assert.match(text,/const POSTGAME=window\.BIT_BAZAAR_POSTGAME/);
 assert.match(text,/function postgameSource\(\)/);
 assert.match(text,/function openEncore\(\)/);
 assert.match(text,/finaleUnlocked=FINALE\.unlocked\(achievementData\.earned\)/);
 assert.match(text,/encoreButton\.hidden=!finaleUnlocked/);
 assert.match(text,/POSTGAME\.panel\(postgameStatus\(\),encorePage\)/);
 assert.match(text,/data-encore-pin/);
 assert.match(text,/showCollectionShelfOnMap\(Number\(button\.getAttribute\('data-encore-map'\)\)\)/);
 assert.match(text,/postgameState:\(\)=>postgameStatus\(\)/);
 assert.match(text,/postgameOpen:openEncore/);
 const saveData=text.slice(text.indexOf('function saveData(){'),text.indexOf('function save(){'));
 assert.ok(!saveData.includes('encorePage')&&!saveData.includes('postgame'),'postgame never writes new save fields');
}
for(const page of ['index.html','preview-v0.59.0.html','baseline-v0.59.0-lowfx.html']){
 const html=read(page);
 assert.match(html,/id="encoreBtn"/);
 assert.match(html,/assets\/postgame-v0\.59\.js/);
 assert.ok(html.indexOf('postgame-v0.59.js')<html.indexOf('game-v0.59.0'));
 assert.match(html,/style-v0\.59\.0\.css/);
}
assert.match(read('sw.js'),/bit-bazaar-v0\.59\.0/);
assert.match(read('sw.js'),/postgame-v0\.59\.js/);
assert.match(read('sw.js'),/game-v0\.58\.0\.js/,'v0.58 remains a rollback');
assert.match(read('style-v0.59.0.css'),/\.encore-details/);
console.log('PASS Phase 6.5: voluntary postgame only after physical perfection; 3000 original figures; live restoration queue prioritizes genuine decor sacrifices, correct full-but-unsorted tracking, shelf-only navigation, pinned sets, bounded phone pagination, no new save fields, full and Low FX parity.');
