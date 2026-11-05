'use strict';
/* Bit Bazaar v0.43 — physical all-3,000 identity audit and drop/pickup save regression. */
const assert=require('node:assert/strict'),fs=require('node:fs'),
 path=require('node:path'),vm=require('node:vm');
const code=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const world={};
const context=vm.createContext({window:world,Set,Map,Math,Number,Array,JSON,Uint8Array});
vm.runInContext(code('assets/figure-integrity-v0.43.js'),context,{timeout:3000});
const HIDDEN_FACES=[1,4,7,10,13,16,19,22,25,28,31,34,37,40,43,46,51,56];
const hiddenIds=HIDDEN_FACES.map((_,i)=>(29+i*157)%3000);
const hiddenSet=new Set(hiddenIds),hiddenRevealed=new Set();
const rows=Array.from({length:60},()=>Array.from({length:5},()=>[]));
const slots=Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
const floor=Array.from({length:3000},(_,id)=>({
 id,x:(id%65)+2,z:(id%68)+2,onFloor:!hiddenSet.has(id),hidden:hiddenSet.has(id)
}));
const floorGrid=new Map([['synthetic',floor.slice()]]);
const groundPositions=new Map();
let tote=[],selected=null;
const props=()=>({rows,slots,tote,selected,floor,hiddenIds,hiddenRevealed,
 groundPositions,floorGrid});
const audit=()=>world.BIT_BAZAAR_INTEGRITY.audit(props());
let a=audit();
assert.equal(a.ok,true,'new untouched shop is healthy');
assert.equal(a.total,3000);
assert.equal(a.loose,2982);
assert.equal(a.concealed,18);
assert.equal(a.shelved,0);
assert.equal(a.held,0);
assert.equal(a.issues.length,0);
const snapshot=JSON.stringify({onFloor:floor.map(f=>f.onFloor),hidden:floor.map(f=>f.hidden)});
assert.equal(audit().ok,true);
assert.equal(JSON.stringify({onFloor:floor.map(f=>f.onFloor),hidden:floor.map(f=>f.hidden)}),snapshot,
 'auditing never modifies physical figures');
rows[0][0]=Array.from({length:10},(_,i)=>i);
slots[0][0]=rows[0][0].slice();
for(let i=0;i<10;i++)floor[i].onFloor=false;
tote=[10];selected=10;floor[10].onFloor=false;
a=audit();
assert.equal(a.ok,true);
assert.equal(a.shelved,10);
assert.equal(a.held,1);
assert.equal(a.loose,2971);
assert.equal(a.concealed,18);
const secret=hiddenIds[0];
hiddenRevealed.add(secret);
floor[secret].hidden=false;floor[secret].onFloor=true;
a=audit();
assert.equal(a.ok,true);
assert.equal(a.concealed,17);
assert.equal(a.loose,2972);
assert.equal(a.hiddenFound,1);
// A player puts down the one carried figure. The floor index already
// retains all 3000 object references, including the temporarily carried ID.
floor[10].onFloor=true;tote=[];selected=null;
floor[10].x=15;floor[10].z=16;
groundPositions.set(10,{x:15,z:16});
a=audit();
assert.equal(a.ok,true);
assert.equal(a.loose,2973);
// Regression: picking up a custom-dropped piece must delete its previous
// ground override. The old v0.42 implementation omitted this cleanup.
floor[10].onFloor=false;tote=[10];selected=10;
a=audit();
assert.equal(a.ok,false);
assert.ok(a.issues.some(x=>x.includes('STALE_CUSTOM_POSITION')));
groundPositions.delete(10);
a=audit();
assert.equal(a.ok,true,'fixed pickup flow leaves one unique physical location');
// Stress simulated multi-row sacrifice: real IDs are returned to the floor.
tote=[];selected=null;floor[10].onFloor=true;
for(let i=0;i<10;i++)floor[i].onFloor=true;
rows[0][0]=[];slots[0][0]=Array(10).fill(null);
a=audit();assert.equal(a.ok,true);
assert.equal(a.shelved,0);
assert.equal(a.held,0);
assert.equal(a.total,3000);
// Every real figure remains one object, even when a spatial bucket moves.
const old=floorGrid.get('synthetic');
old.splice(old.indexOf(floor[10]),1);
floorGrid.set('new-bucket',[floor[10]]);
assert.equal(audit().ok,true);
floorGrid.get('new-bucket').push(floor[10]);
assert.equal(audit().ok,false,'duplicated index reference is caught');
floorGrid.get('new-bucket').pop();
floor[11].onFloor=false;
assert.equal(audit().ok,false,'orphaned figure never silently disappears');
floor[11].onFloor=true;
floor[secret].hidden=true;
assert.equal(audit().ok,false,'revealed piece cannot silently become hidden');
floor[secret].hidden=false;
assert.equal(audit().ok,true);
assert.equal(audit().total,3000);
const expectedSites=3000;
assert.equal(floor.length,expectedSites);
for(const p of ['game-v0.43.0.js','game-v0.43.0-lowfx.js']){
 const game=code(p);
 assert.ok(game.includes('groundPositions.delete(id);tote.push(id)'),
  p+' clears stale drop coords on pickup');
 assert.ok(game.includes('figureIntegrity:()=>window.BIT_BAZAAR_INTEGRITY.audit({'),
  p+' exposes the independent live inventory audit');
 assert.ok(game.includes('id="auditFigureInventory"'),
  p+' displays the one-tap integrity test');
 assert.ok(game.includes("bit-bazaar-save-v3"),'stable save key');
}
const main=code('preview-v0.43.0.html'),sw=code('sw.js');
for(const p of ['assets/figure-integrity-v0.43.js',
 'assets/save-manager-v0.43.js','game-v0.43.0.js','style-v0.43.0.css']){
 assert.ok(main.includes('./'+p),'active game loads '+p);
 assert.ok(sw.includes('./'+p),'offline PWA caches '+p);
}
assert.ok(main.indexOf('figure-integrity-v0.43.js')<
 main.indexOf('save-manager-v0.43.js'));
assert.ok(main.indexOf('figure-integrity-v0.43.js')<
 main.indexOf('game-v0.43.0.js'));
assert.ok(code('baseline-v0.43.0-lowfx.html').includes('game-v0.43.0-lowfx.js'));
assert.ok(sw.includes('bit-bazaar-v0.45.0'));
console.log('PASS v0.43: all 3,000 unique live IDs, conceal/reveal, carried and shelf state, no-save audit, sacrifice return, missing pieces, stale overrides, spatial index consistency and both mobile builds.');
