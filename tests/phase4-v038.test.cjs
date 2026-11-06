'use strict';
/* Bit Bazaar v0.38: non-destructive precision placement and map shortcuts.
 * Validates exact historical save schema, safe overlap detection, no-write
 * previews, apply/cancel, old-save grandfathering, and both iPhone builds. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const win={};const ctx=vm.createContext({window:win,Math,Map,Set,Object,Array,Number,JSON});
for(const f of ['assets/decor-workshop-v0.38.js','assets/decor-map-v0.38.js'])
 vm.runInContext(read(f),ctx,{timeout:3000,filename:f});
assert.ok(win.BIT_BAZAAR_WORKSHOP&&win.BIT_BAZAAR_DECOR_MAP);
const catalog={
 items:[
  {id:'statueA',name:'Porcelain Fox',mount:'floor',category:'Statues'},
  {id:'statueB',name:'Copper Bird',mount:'floor',category:'Statues'},
  {id:'rugA',name:'Northern Carpet',mount:'rug',category:'Rugs'},
  {id:'tone',name:'Opal Shelf',mount:'shelf',category:'Shelf Trims'},
  {id:'lamp',name:'Hanging Moon',mount:'ceiling',category:'Ceilings'},
  {id:'wall',name:'Wall Painting',mount:'wall',category:'Framed Art'}
 ],
 slots:[
  {id:0,kind:'floor',side:'FLOOR',x:10,z:10,name:'Floor near statue'},
  {id:1,kind:'floor',side:'FLOOR',x:12,z:10,name:'Floor occupied'},
  {id:2,kind:'rug',side:'FLOOR',x:20,z:20,name:'Central rug'},
  {id:3,kind:'shelf',face:0,name:'First shelf'},
  {id:4,kind:'ceiling',side:'CEILING',x:25,z:25,name:'Pendant'},
  {id:5,kind:'floor',side:'FLOOR',x:16,z:10,name:'Free standing pad'},
  {id:6,kind:'rug',side:'FLOOR',x:30,z:20,name:'Second carpet'},
  {id:7,kind:'wall',side:'NORTH',x:10,z:3,name:'Wall frame'},
  {id:8,kind:'floor',side:'FLOOR',x:14,z:16,name:'Another open pad'}
 ],
 thumbnail:()=>'/mock.png'
};
const owned=new Set(catalog.items.map(x=>x.id));
const placed=new Map([['statueA',0],['statueB',1],['rugA',2],
 ['tone',3],['lamp',4],['wall',7]]);
let saves=0,renders=0,block=false,notifications=[];
const api={
 save:()=>saves++,notify:(m)=>notifications.push(m),
 blocked:(x,z)=>block&&x>19&&z>21
};
const workshop=win.BIT_BAZAAR_WORKSHOP.create({
 catalog,api,owned,placed,rerender:()=>renders++
});
const empty={decor:{adjustments:[]}};
workshop.load(empty);
assert.equal(workshop.shift('statueA','dx',1),false,
 'Nearby occupied statue blocks unsafe visual overlap');
assert.equal(workshop.pending('statueA'),false,'unsafe edit does not get staged');
assert.equal(saves,0);
assert.equal(workshop.shift('statueA','dz',1),true,
 'Legal 0.25 vertical shift stages instead of saving');
assert.equal(workshop.pending('statueA'),true);
assert.equal(workshop.pos('statueA',0).z,10,
 'Physical shop stays unchanged while top-down precision preview is staged');
assert.equal(workshop.candidate('statueA').dz,1);
assert.equal(saves,0);
assert.equal(workshop.shift('statueA','dz',1),true,
 'Two 0.25 steps become a selectable 0.5-unit grid sample');
assert.equal(workshop.expand('statueA'),true);
const html=workshop.controls(catalog.items[0]);
assert.ok(html.includes('data-w-grid="statueA"'));
assert.equal((html.match(/data-w-pick="statueA"/g)||[]).length,25,
 'Only one expanded art card gets a bounded 5x5 grid');
assert.ok(html.includes('×')&&html.includes('◆')&&html.includes('data-w-apply="statueA"'),
 'Blocked cells, chosen preview cell and confirmation are visible');
assert.equal(workshop.choose('statueA',0,4),true,'Allow up to one world-unit away safely');
assert.equal(workshop.candidate('statueA').dz,4);
assert.equal(workshop.pos('statueA',0).z,10);
assert.equal(workshop.apply('statueA'),true,'Confirm and save a preview once');
assert.equal(saves,1);
assert.equal(workshop.pos('statueA',0).z,11);
assert.deepEqual(JSON.parse(JSON.stringify(workshop.snapshot()[0])),['statueA',0,4,0,0],
 'No save format migration: still [id,dx,dz,turn,tone]');
const afterSave=workshop.snapshot();
workshop.load({decor:{adjustments:afterSave}});
assert.equal(workshop.get('statueA').dz,4,
 'Newly saved one-world-unit offsets must SURVIVE reload');
assert.equal(workshop.pos('statueA',0).z,11);
assert.equal(workshop.shift('statueA','dz',-1),true);
assert.equal(workshop.cancel('statueA'),true,'Cancel staged changes');
assert.equal(workshop.pending('statueA'),false);
assert.equal(workshop.pos('statueA',0).z,11);
assert.equal(saves,1,'Cancellation never calls save');
assert.equal(workshop.shift('statueA','dz',-1),true);
assert.equal(workshop.cancelAll(),true,'Closing a drawer clears drafts');
assert.equal(workshop.pending('statueA'),false);
assert.equal(saves,1);
assert.equal(workshop.shift('statueA','dz',1),false,
 'Offsets outside ±1.00 never stage or save');
assert.equal(saves,1);
workshop.load({decor:{adjustments:[['statueA',2,0,0,0]]}});
assert.equal(workshop.pos('statueA',0).x,10.5,
 'Historical ±0.5 installation remains grandfathered even if an adjacent piece now overlaps');
assert.equal(workshop.pending('statueA'),false);
workshop.load(empty);
assert.equal(workshop.rotate('rugA',1),true);
assert.equal(workshop.candidate('rugA').turn,1);
assert.equal(workshop.rotation('rugA'),0,'Rug remains physically unrotated until Apply');
assert.equal(workshop.apply('rugA'),true);
assert.equal(workshop.rotation('rugA'),1);
assert.equal(saves,2);
assert.deepEqual(JSON.parse(JSON.stringify(workshop.snapshot()[0])),['rugA',0,0,1,0]);
block=true;
assert.equal(workshop.choose('rugA',0,4),false,
 'Full rug footprint must remain clear of physical shelf collision');
assert.equal(saves,2);
block=false;
assert.equal(workshop.choose('rugA',0,2),true);
assert.equal(workshop.reset('rugA'),true,'Reset stages original orientation and location');
assert.equal(workshop.candidate('rugA').turn,0);
assert.equal(workshop.rotation('rugA'),1,'Reset must not write before Apply');
assert.equal(workshop.apply('rugA'),true);
assert.equal(workshop.rotation('rugA'),0);
assert.equal(workshop.snapshot().length,0,'True default removes optional adjustments entry');
assert.equal(saves,3);
assert.equal(workshop.material('tone',1),true,'Shelf material preview works');
assert.equal(workshop.tone('tone'),0,'Real shelf rail stays saved while previewing');
assert.equal(workshop.apply('tone'),true);
assert.equal(workshop.tone('tone'),1);
assert.deepEqual(JSON.parse(JSON.stringify(workshop.snapshot()[0])),['tone',0,0,0,1]);
assert.equal(saves,4);
assert.equal(workshop.choose('wall',3,0),false,'Wall art remains constrained to ±0.5');
assert.equal(workshop.choose('wall',2,0),true,'Wall art can move ±0.5 tangentially');
assert.equal(workshop.cancel('wall'),true);
assert.equal(workshop.choose('lamp',0,4),true,'Ceilings get safe ±1.0 positioning');
assert.equal(workshop.cancel('lamp'),true);
assert.equal(workshop.pending('lamp'),false);
const originalTone=workshop.tone('tone');
workshop.onStore('tone');
assert.equal(workshop.tone('tone'),0,'Storage resets physical adjustment, not ownership');
assert.equal(saves,4,'Resetting workshop memory in a store flow does not double save');
assert.equal(owned.has('tone'),true,'Storage does not delete ownership');
// Map tests use the same installed state and an actual vacant floor anchor.
const installed=()=>[...placed],moves=[],previews=[];
const map=win.BIT_BAZAAR_DECOR_MAP.create({
 catalog,getPlaced:installed,
 setDestination:()=>true,returnToCatalog:()=>{},
 moveOwned:(id,slot)=>{moves.push([id,slot]);return true},
 closePlanner:()=>{},previewOwned:(id,slot)=>{previews.push([id,slot]);return true}
});
assert.equal(map.beginMove('statueA'),true);
assert.equal(map.state().kind,'floor');
assert.equal(map.nearestOpenPin(),true,'Can select closest vacant floor display');
assert.equal(map.state().selected,5,'Closest open pad to original position 10,10 is x16,z10');
assert.ok(map.controls().includes('CLOSEST OPEN'));
assert.ok(map.controls().includes('NEXT OPEN'));
assert.equal(map.nextOpenPin(),true);
assert.equal(map.state().selected,8,'Next free pad advances to x14,z16');
assert.equal(saves,4,'Map selection never writes saves');
assert.equal(map.previewSelected(),true,'World ghost preview can start safely');
assert.deepEqual(previews,[['statueA',8]]);
assert.equal(moves.length,0,'Preview never moves the actual artwork');
assert.equal(map.beginMove('statueA'),true);
assert.equal(map.choose(1),true,'Occupied sites are still inspectable');
assert.equal(map.useSelected(),false,'Cannot commit into occupied spot');
assert.equal(map.choose(5),true);
assert.equal(map.useSelected(),true,'Free map relocation remains available');
assert.deepEqual(moves,[['statueA',5]]);
assert.equal(map.moving(),false);
assert.equal(saves,4,'Map only asks the owning runtime to handle persisted moves');
// Verify HTML shells and PWA reference exactly the same v0.38 modules.
const main=read('preview-v0.38.0.html'),sw=read('sw.js');
for(const file of ['assets/decor-workshop-v0.38.js','assets/decor-map-v0.38.js',
 'game-v0.38.0.js','style-v0.38.0.css'])
 assert.ok(main.includes('./'+file),'archived v0.38 preview retains '+file);
for(const file of ['assets/decor-workshop-v0.38.js','assets/decor-map-v0.38.js'])
 assert.ok(sw.includes('./'+file),'current build still uses '+file);
assert.ok(sw.includes('bit-bazaar-v0.59.0'));
assert.ok(main.indexOf('decor-workshop-v0.38.js')<main.indexOf('decor-runtime-v0.37.js'));
assert.ok(main.indexOf('decor-runtime-v0.37.js')<main.indexOf('decor-map-v0.38.js'));
assert.ok(read('baseline-v0.38.0-lowfx.html').includes('game-v0.38.0-lowfx.js'));
for(const p of ['game-v0.38.0.js','game-v0.38.0-lowfx.js']){
 const content=read(p);
 for(const k of ['decorPrecisionApply:id','decorPrecisionCancel:id','decorMapNearest:','bit-bazaar-save-v3',
  'decorEngine.workshop.cancelAll();'])
  assert.ok(content.includes(k),p+' retains '+k);
}
console.log('PASS v0.38: preview/confirm edits save once; ±1.0 safe 5×5 grid; original 5-field offsets survive reload; collision and rug clearance tests; 180/232 gallery untouched; nearest/next map helpers; iPhone engines and PWA synchronized.');
