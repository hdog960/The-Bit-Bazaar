'use strict';
/* Bit Bazaar v0.35 — full gallery chain, 18 collision-safe standing pads,
 * four-perfect-row atomic sacrifice, no-op moves and zero-write catalog selection. */
const assert=require('node:assert/strict'),fs=require('node:fs'),
 path=require('node:path'),vm=require('node:vm');
const source=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const pictures=[];
const document={createElement(type){
 assert.equal(type,'canvas');
 const canvas={width:0,height:0,ops:[]};
 const paint={fillStyle:'#000',imageSmoothingEnabled:false,
  fillRect(x,y,w,h){canvas.ops.push([x,y,w,h,paint.fillStyle]);},
  drawImage(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},
  arc(){},ellipse(){},closePath(){},fillText(){},measureText:()=>({width:18})};
 canvas.getContext=()=>paint;canvas.toDataURL=()=>'/testpixel/'+pictures.indexOf(canvas);
 pictures.push(canvas);return canvas;
}};
const backing=new Map(),localStorage={
 getItem:key=>backing.has(key)?backing.get(key):null,
 setItem:(key,value)=>backing.set(key,String(value))
};
const window={},context=vm.createContext({
 window,document,localStorage,Math,Set,Map,Array,Object,Number,JSON
});
const earlier=[
 'assets/decor-v0.19.js','assets/decor-expansion-v0.20.js',
 'assets/decor-expansion-v0.21.js','assets/decor-expansion-v0.22.js',
 'assets/decor-expansion-v0.25.js','assets/decor-sites-v0.26.js',
 'assets/decor-endcaps-v0.28.js','assets/decor-art-v0.28.js',
 'assets/decor-art-v0.29.js','assets/decor-art-v0.32.js',
 'assets/decor-sites-v0.32.js','assets/decor-art-v0.33.js',
 'assets/decor-sites-v0.33.js','assets/decor-art-v0.34.js',
 'assets/decor-sites-v0.34.js'
];
for(const f of earlier)vm.runInContext(source(f),context,{timeout:3000,filename:f});
const before=window.BIT_BAZAAR_DECOR,oldIds=before.items.map(x=>x.id),
 oldAnchors=[...before.slots],startPictures=pictures.length;
assert.equal(before.items.length,120);assert.equal(before.slots.length,202);
vm.runInContext(source('assets/decor-art-v0.35.js'),context,{timeout:3000});
const artworks=window.BIT_BAZAAR_DECOR,pics=pictures.slice(startPictures);
assert.equal(artworks.items.length,140);
assert.equal(artworks.slots.length,202);
assert.equal(pics.length,20,'20 native original texture canvases');
assert.equal(new Set(pics.map(c=>JSON.stringify(c.ops))).size,20,
 'Every new illustration uses a different pixel composition');
assert.equal(new Set(artworks.items.map(i=>i.id)).size,140,'unique artwork IDs');
for(let i=0;i<120;i++)assert.equal(artworks.items[i].id,oldIds[i],'historical owned IDs immutable');
for(let i=0;i<20;i++){
 const a=artworks.items[120+i],p=pics[i];
 assert.ok(p.ops.length>=25,'individual authored pixel detail '+a.id);
 assert.ok(a.description.length>=75,'written visual lore '+a.id);
 assert.ok(a.price>=1&&a.price<=20,'price limited to currently perfect rows');
 assert.equal(p.width,a.mount==='shelf'?48:
  a.mount==='rug'||a.mount==='ceiling'||a.category==='Architecture'?40:32);
 assert.equal(p.height,a.mount==='rug'||a.mount==='shelf'?28:
  a.mount==='ceiling'||a.category==='Architecture'?48:40);
 assert.strictEqual(artworks.texture(a.id),p,'unique texture is used by game');
}
const newCat=Object.fromEntries(['Framed Art','Statues','Plants','Lighting',
 'Rugs','Architecture','Ceilings','Shelf Trims','Curios'].map(c=>[
 c,artworks.items.slice(120).filter(x=>x.category===c).length]));
assert.deepEqual(newCat,{'Framed Art':3,Statues:4,Plants:3,Lighting:4,
 Rugs:1,Architecture:2,Ceilings:1,'Shelf Trims':1,Curios:1});
const quotas={'Framed Art':35,Statues:25,Plants:20,Lighting:20,
 Rugs:20,Architecture:20,Ceilings:15,'Shelf Trims':15,Curios:10};
for(const [category,limit] of Object.entries(quotas))
 assert.ok(artworks.items.filter(x=>x.category===category).length<=limit,
  'locked target quota respected for '+category);
vm.runInContext(source('assets/decor-sites-v0.35.js'),context,{timeout:3000});
const catalog=window.BIT_BAZAAR_DECOR,additions=catalog.slots.slice(202);
assert.equal(catalog.items.length,140);
assert.equal(catalog.slots.length,220);
assert.equal(additions.length,18);
const byKind=Object.fromEntries(['wall','floor','rug','ceiling','shelf'].map(kind=>[
 kind,catalog.slots.filter(s=>s.kind===kind).length]));
assert.deepEqual(byKind,{wall:56,floor:63,rug:20,ceiling:21,shelf:60});
for(let i=0;i<202;i++)assert.strictEqual(catalog.slots[i],oldAnchors[i],
 'no renumbered or moved legacy mounting sites');
const floor=oldAnchors.filter(p=>p.kind==='floor'),
 rugs=oldAnchors.filter(p=>p.kind==='rug'),distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
for(let i=0;i<18;i++){
 const site=additions[i];
 assert.equal(site.id,202+i);assert.equal(site.kind,'floor');
 assert.ok(floor.every(other=>distance(site,other)>=4.6));
 assert.ok(rugs.every(other=>distance(site,other)>=4.7));
 assert.ok(additions.every(other=>site===other||distance(site,other)>=5.4));
 assert.ok(distance(site,{x:35,z:68})>=6);
}
let saves=0,notifications=[],cleared=[],scatter=[];
window.BIT_BAZAAR_WORKSHOP={create:()=>({
 snapshot:()=>[],resetAll:()=>{},load:()=>{},onMove:()=>{},
 onStore:()=>{},pos:(id,slot)=>catalog.slots[slot],rotation:()=>0,tone:()=>0
})};
window.BIT_BAZAAR_ROOM={create:()=>({state:()=>({}),load:()=>{},reset:()=>{}})};
vm.runInContext(source('assets/decor-runtime-v0.35.js'),context,{timeout:3000});
const rows=Array.from({length:60},()=>Array.from({length:5},()=>[])),
 slots=Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
for(let row=0;row<4;row++){
 rows[0][row]=Array.from({length:10},(_,i)=>row*10+i);
 slots[0][row]=[...rows[0][row]];
}
let runtime;
function snapshot(){
 return {version:1,rows:rows.map(face=>face.map(r=>[...r])),
 slots:slots.map(face=>face.map(r=>[...r])),
 ground:[],lifetimePerfect:[0,1,2,3],
 decor:runtime?runtime.state():{owned:[],placed:[],adjustments:[],room:[]}};
}
runtime=window.BIT_BAZAAR_PHASE4.create({
 isOpen:()=>false,save:()=>{saves++},notify:m=>notifications.push(m),
 perfectCount:()=>4,isPerfect:(face,row)=>face===0&&row<4&&rows[face][row].length===10,
 rowSlots:(face,row)=>slots[face][row],
 shelf:()=>({face:1,fixture:{x:35,z:30,nx:0,nz:1,ux:1,uz:0,depth:1.72}}),
 blocked:()=>false,crowded:()=>false,snapshot,
 clearRow:(face,row)=>{cleared.push([face,row]);rows[face][row]=[];slots[face][row].fill(null)},
 scatter:(id,x,z)=>scatter.push({id,x,z}),
 clearUndo:()=>{},refresh:()=>{}
});
runtime.load({decor:{owned:[],placed:[],adjustments:[],room:[]}});
assert.equal(runtime.affordables(0),0,'no free artwork when no perfect rows');
assert.ok(runtime.affordables(4)>0,'AFFORDABLE view can find reachable purchases');
assert.equal(runtime.buy('cloudberry-clockmaker',0,true),true,'price four rows actually bought');
assert.equal(cleared.length,4,'exactly four perfect rows cleared');
assert.equal(scatter.length,40,'exactly 40 old figure IDs returned to the floor');
assert.equal(new Set(scatter.map(p=>p.id)).size,40,'no duplicates invented');
assert.equal(scatter.every(p=>p.id>=0&&p.id<40),true,'only existing figure IDs');
const saved=JSON.parse(backing.get('bit-bazaar-save-v3'));
assert.equal(saved.ground.length,40,'serialized 40 floor figures');
assert.equal(saved.lifetimePerfect.length,4,'lifetime completion is conserved');
assert.equal(saved.decor.owned.length,1,'ownership saved');
assert.deepEqual(saved.decor.placed[0],['cloudberry-clockmaker',0]);
assert.ok(backing.has('bit-bazaar-v3-before-first-sacrifice'),'pre-first-sacrifice backup');
assert.equal(saves,0,'atomic save happens directly, not a second save');
const stateBefore=JSON.stringify(runtime.state());
assert.equal(runtime.move('cloudberry-clockmaker',0),false,'same-site move safely rejected');
assert.equal(saves,0,'same-site move did not save/erase adjustments');
assert.equal(runtime.findOpenFor('cloudberry-clockmaker'),true,'find open site selects a real alternate');
assert.equal(JSON.stringify(runtime.state()),stateBefore,'choosing a site never moves owned artwork');
assert.equal(saves,0);
assert.equal(runtime.previewMove('cloudberry-clockmaker',1),true);
assert.equal(runtime.cyclePreview(1),true);
assert.equal(runtime.cancelPreview(),true,'preview cancellable');
assert.equal(JSON.stringify(runtime.state()),stateBefore,'cancel leaves state intact');
assert.equal(runtime.previewMove('cloudberry-clockmaker',1),true);
assert.equal(runtime.commitPreview(),true,'explicitly confirmed free move');
assert.equal(saves,1,'one save on accepted move');
assert.equal(runtime.placedSlots()[0][1],1);
runtime.load({decor:{owned:['frostwalnut-silver-filigree'],
 placed:[['frostwalnut-silver-filigree',44]],adjustments:[],room:[]}});
let panels=0,beams=0;
assert.equal(runtime.drawShelfFinish(0,{w:7.7},1,1,6,()=>panels++,()=>beams++),true);
assert.equal(panels,5,'new shelf finish covers five physical tiers');
assert.ok(beams>=40,'detailed unique shelf embellishment is rendered');
const html=source('preview-v0.35.0.html'),sw=source('sw.js');
for(const f of ['assets/decor-art-v0.35.js','assets/decor-sites-v0.35.js',
 'assets/decor-runtime-v0.35.js','game-v0.35.0.js','style-v0.35.0.css'])
 assert.ok(html.includes('./'+f),'HTML must load '+f);
assert.ok(html.indexOf('decor-art-v0.35.js')<html.indexOf('decor-sites-v0.35.js'));
assert.ok(html.indexOf('decor-sites-v0.35.js')<html.indexOf('decor-runtime-v0.35.js'));
for(const f of ['assets/decor-art-v0.35.js','assets/decor-sites-v0.35.js'])
 assert.ok(sw.includes('./'+f),'latest catalog still loads historical modules '+f);
assert.ok(html.includes('./assets/decor-runtime-v0.35.js'),
 'v0.35 historical preview uses historical runtime');
assert.ok(sw.includes('bit-bazaar-v0.59.0'));
assert.ok(source('baseline-v0.35.0-lowfx.html').includes('game-v0.35.0-lowfx.js'));
for(const file of ['game-v0.35.0.js','game-v0.35.0-lowfx.js'])
 for(const marker of ['bit-bazaar-save-v3','decorAffordable:','decorFindOpenSite:','decorCatalogCapacity:'])
  assert.ok(source(file).includes(marker),file+' must preserve '+marker);
const runtimeSrc=source('assets/decor-runtime-v0.35.js');
for(const marker of ["activeFilter==='unowned'","activeFilter==='affordable'",
 'data-find-art','NEW 20','ALREADY DISPLAYED HERE'])
 assert.ok(runtimeSrc.includes(marker),'catalog discovery feature '+marker);
console.log('PASS v0.35: 20 authored originals, 18 collision-checked mounts, full chain 140/220, atomic 4-row/40-figure sacrifice, lifetime data safe, optional filter, no-op moves, preview/no-save selection, two engines and PWA.');
