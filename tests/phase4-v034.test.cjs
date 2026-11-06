'use strict';
/* Bit Bazaar v0.34: full real catalog chain + release, mount and
 * figure-sacrifice integrity. Run: node tests/phase4-v034.test.cjs. */
const assert=require('node:assert/strict'),fs=require('node:fs'),
 path=require('node:path'),vm=require('node:vm');
const src=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const paintOps=[],painted=[];
const document={createElement(type){
 assert.equal(type,'canvas');
 const canvas={width:0,height:0,ops:[]};painted.push(canvas);
 const g={fillStyle:'#000',imageSmoothingEnabled:false,
  fillRect(x,y,w,h){canvas.ops.push([x,y,w,h,g.fillStyle]);paintOps.push(1);},
  drawImage(){},beginPath(){},moveTo(){},lineTo(){},
  stroke(){},fill(){},arc(){},ellipse(){},closePath(){},fillText(){},
  measureText:()=>({width:18})};
 canvas.getContext=()=>g;
 canvas.toDataURL=()=>'/pixel-thumbnail-'+painted.indexOf(canvas);
 return canvas;
}};
const window={};
const backing=new Map(),localStorage={
 getItem:key=>backing.has(key)?backing.get(key):null,
 setItem:(key,value)=>backing.set(key,String(value))
};
const context=vm.createContext({window,document,localStorage,Math,Set,Map,JSON,Array,Object,Number});
const chain=[
 'assets/decor-v0.19.js','assets/decor-expansion-v0.20.js',
 'assets/decor-expansion-v0.21.js','assets/decor-expansion-v0.22.js',
 'assets/decor-expansion-v0.25.js','assets/decor-sites-v0.26.js',
 'assets/decor-endcaps-v0.28.js','assets/decor-art-v0.28.js',
 'assets/decor-art-v0.29.js','assets/decor-art-v0.32.js',
 'assets/decor-sites-v0.32.js','assets/decor-art-v0.33.js',
 'assets/decor-sites-v0.33.js'
];
for(const p of chain)vm.runInContext(src(p),context,{timeout:2000,filename:p});
const older=window.BIT_BAZAAR_DECOR;
assert.equal(older.items.length,104,'exactly 104 old items before expansion');
assert.equal(older.slots.length,190,'exactly 190 original display IDs');
const oldIds=older.items.map(x=>x.id),oldSites=[...older.slots],paintStart=painted.length;
vm.runInContext(src('assets/decor-art-v0.34.js'),context,{timeout:2000});
const paintedNew=painted.slice(paintStart),withArt=window.BIT_BAZAAR_DECOR;
assert.equal(withArt.items.length,120,'16 new decorations added');
assert.equal(withArt.slots.length,190,'art never changes shop geometry');
assert.equal(paintedNew.length,16,'one tiny authored canvas per new piece');
assert.equal(new Set(paintedNew.map(c=>JSON.stringify(c.ops))).size,16,'new artwork must be visually distinct');
assert.equal(new Set(withArt.items.map(x=>x.id)).size,120,'no reused item IDs');
for(let i=0;i<104;i++)assert.equal(withArt.items[i].id,oldIds[i],'legacy art ID immutable');
for(let i=0;i<16;i++){
 const item=withArt.items[104+i],image=paintedNew[i],
  width=item.mount==='shelf'?48:item.mount==='rug'||item.mount==='ceiling'||item.category==='Architecture'?40:32,
  height=item.mount==='rug'||item.mount==='shelf'?28:item.mount==='ceiling'||item.category==='Architecture'?48:40;
 assert.ok(image.ops.length>=28,'authored, not an empty image: '+item.name);
 assert.equal(image.width,width,'native pixel width: '+item.name);
 assert.equal(image.height,height,'native pixel height: '+item.name);
 assert.ok(item.description.length>75,'descriptive unique lore: '+item.name);
 assert.ok(item.price>=1&&item.price<=20,'price in perfect-row units');
 assert.strictEqual(withArt.texture(item.id),image,'world texture used by catalog');
}
vm.runInContext(src('assets/decor-sites-v0.34.js'),context,{timeout:2000});
const catalog=window.BIT_BAZAAR_DECOR;
assert.equal(catalog.items.length,120,'release item total');
assert.equal(catalog.slots.length,202,'12 genuinely additional sites');
for(let i=0;i<190;i++)assert.strictEqual(catalog.slots[i],oldSites[i],'old mounts never relocated or renumbered');
const added=catalog.slots.slice(190);
assert.equal(added.filter(x=>x.kind==='rug').length,6);
assert.equal(added.filter(x=>x.kind==='ceiling').length,6);
const actual={};
for(const k of ['wall','floor','rug','ceiling','shelf'])
 actual[k]=catalog.slots.filter(x=>x.kind===k).length;
assert.deepEqual(actual,{wall:56,floor:45,rug:20,ceiling:21,shelf:60});
for(let i=0;i<12;i++){
 const site=added[i];
 assert.equal(site.id,190+i,'append-only site IDs');
 assert.ok([27,43].includes(site.x),'real cross aisle');
 assert.ok([17,41,65].includes(site.z),'real row connector');
}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const priorRugs=oldSites.filter(x=>x.kind==='rug');
const priorFloor=oldSites.filter(x=>x.kind==='floor');
const priorCeiling=oldSites.filter(x=>x.kind==='ceiling');
for(const rug of added.filter(x=>x.kind==='rug')){
 for(const q of [...priorRugs,...added.filter(x=>x.kind==='rug'&&x!==rug)])
  assert.ok(dist(rug,q)>=6,'all new rugs physically separated');
 for(const q of priorFloor)assert.ok(dist(rug,q)>=5.4,'new rugs cannot cover floor pads');
}
for(const hook of added.filter(x=>x.kind==='ceiling'))
 for(const q of [...priorCeiling,...added.filter(x=>x.kind==='ceiling'&&x!==hook)])
  assert.ok(dist(hook,q)>=7.5,'ceiling ornaments cannot overlap other hanging pieces');
const categoryQuotas={'Framed Art':35,Statues:25,Plants:20,Lighting:20,
 Rugs:20,Architecture:20,Ceilings:15,'Shelf Trims':15,Curios:10};
for(const [category,max] of Object.entries(categoryQuotas)){
 const count=catalog.items.filter(x=>x.category===category).length;
 assert.ok(count<=max,'never exceed locked category quota: '+category);
}
assert.equal(Object.values(categoryQuotas).reduce((a,b)=>a+b,0),180,'locked 180-target');
window.BIT_BAZAAR_WORKSHOP={create:()=>({
 snapshot:()=>[],resetAll:()=>{},load:()=>{},onMove:()=>{},onStore:()=>{},
 pos:(id,slot)=>catalog.slots[slot],rotation:()=>0,tone:()=>0
})};
window.BIT_BAZAAR_ROOM={create:()=>({state:()=>({}),load:()=>{},reset:()=>{}})};
vm.runInContext(src('assets/decor-runtime-v0.34.js'),context,{timeout:2000});
let saveCalls=0,notifications=[],clears=[],scattered=[];
const liveRows=Array.from({length:60},()=>Array.from({length:5},()=>[]));
const liveSlots=Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
for(let row=0;row<3;row++){
 liveRows[0][row]=Array.from({length:10},(_,i)=>row*10+i);
 liveSlots[0][row]=Array.from({length:10},(_,i)=>row*10+i);
}
let runner;
function snapshot(){
 return {version:1,rows:liveRows.map(face=>face.map(row=>[...row])),
  slots:liveSlots.map(face=>face.map(row=>[...row])),
  ground:[],lifetimePerfect:[0,1,2],decor:runner?runner.state():
  {owned:[],placed:[],adjustments:[],room:[]}};
}
const api={
 isOpen:()=>false,save:()=>{saveCalls++;},notify:m=>{notifications.push(m)},
 perfectCount:()=>3,
 isPerfect:(face,row)=>face===0&&row<3&&liveRows[face][row].length===10,
 rowSlots:(face,row)=>liveSlots[face][row],
 shelf:()=>({face:1,fixture:{x:35,z:30,nx:0,nz:1,ux:1,uz:0,depth:1.72}}),
 blocked:()=>false,crowded:()=>false,snapshot,
 clearRow:(face,row)=>{clears.push([face,row]);liveRows[face][row]=[];liveSlots[face][row].fill(null);},
 scatter:(id,x,z)=>{scattered.push({id,x,z});},
 clearUndo:()=>{},refresh:()=>{}
};
runner=window.BIT_BAZAAR_PHASE4.create(api);
runner.load({decor:{owned:[],placed:[],adjustments:[],room:[]}});
const original=JSON.stringify(snapshot()),savesBefore=backing.size;
assert.equal(runner.buy('sunrise-kitekeepers',0,true),true,'new art requires 3 perfect rows');
assert.equal(clears.length,3,'exactly three complete rows sacrificed');
assert.equal(scattered.length,30,'exactly thirty existing figures scattered');
assert.equal(new Set(scattered.map(x=>x.id)).size,30,'no duplicated figures');
assert.equal(scattered.every(x=>x.x>=0&&x.x<=70&&x.z>=0&&x.z<=74),true,
 'all figures placed inside the playable shop');
assert.equal(runner.ownedIds().includes('sunrise-kitekeepers'),true);
assert.equal(runner.placedSlots().some(([id,s])=>id==='sunrise-kitekeepers'&&s===0),true);
const saved=JSON.parse(backing.get('bit-bazaar-save-v3'));
assert.equal(saved.ground.length,30,'save contains exactly 30 scattered figures');
assert.equal(saved.lifetimePerfect.length,3,'lifetime credit never decreases');
assert.equal(saved.decor.owned.length,1,'new decoration owned forever');
assert.equal(saved.slots[0][0].filter(x=>x!==null).length,0,'first row is genuinely emptied');
assert.equal(saved.slots[0][1].filter(x=>x!==null).length,0);
assert.equal(saved.slots[0][2].filter(x=>x!==null).length,0);
assert.ok(backing.has('bit-bazaar-v3-before-first-sacrifice'),'pre-purchase backup persisted');
assert.equal(saveCalls,0,'purchase uses atomic localStorage transaction, no spurious save');
const savedBefore=JSON.stringify(runner.state());
assert.equal(runner.previewMove('sunrise-kitekeepers',1),true,'new artwork can preview legacy hook');
assert.equal(runner.cyclePreview(1),true,'preview cycles valid sites');
assert.equal(JSON.stringify(runner.state()),savedBefore,'cycling cannot mutate the save');
assert.equal(saveCalls,0,'cycling writes no save');
assert.equal(runner.cancelPreview(),true);
assert.equal(JSON.stringify(runner.state()),savedBefore);
assert.equal(runner.previewMove('sunrise-kitekeepers',1),true);
assert.equal(runner.commitPreview(),true);
assert.equal(saveCalls,1,'only confirmed relocation triggers one save');
let beamCount=0;
const trim='starlit-cedar-rails';
runner.load({decor:{owned:[trim],placed:[[trim,44]],adjustments:[],room:[]}});
assert.equal(runner.drawShelfFinish(0,{w:7.7},1,1,6,()=>{},()=>{beamCount++}),true);
assert.ok(beamCount>=25,'new cedar shelf overlay painted on all five existing tiers');
const html=src('preview-v0.34.0.html'),sw=src('sw.js');
for(const file of ['assets/decor-art-v0.34.js','assets/decor-sites-v0.34.js',
 'assets/decor-runtime-v0.34.js','game-v0.34.0.js','style-v0.34.0.css'])
 assert.ok(html.includes('./'+file),'the release loads '+file);
assert.ok(html.indexOf('decor-art-v0.34.js')<html.indexOf('decor-sites-v0.34.js'));
assert.ok(html.indexOf('decor-sites-v0.34.js')<html.indexOf('decor-runtime-v0.34.js'));
for(const file of ['assets/decor-art-v0.34.js','assets/decor-sites-v0.34.js'])
 assert.ok(sw.includes('./'+file),'historical files remain in active catalog '+file);
assert.ok(html.includes('./assets/decor-runtime-v0.34.js'),'archived preview uses archived runtime');
assert.ok(sw.includes('bit-bazaar-v0.48.0'),'fresh PWA cache');
assert.ok(src('baseline-v0.34.0-lowfx.html').includes('game-v0.34.0-lowfx.js'));
for(const game of ['game-v0.34.0.js','game-v0.34.0-lowfx.js']){
 const code=src(game);
 assert.ok(code.includes('decorCatalogCapacity:()'),'QA capacity probe');
 assert.ok(code.includes('decorEngine.previewOptions()'),'preview carousel retained');
 assert.ok(code.includes('bit-bazaar-save-v3'),'old storage key retained');
}
console.log('PASS v0.34: 16 uniquely painted artworks, 12 collision-checked mounts, 120/180 original works, 202 sites, atomic three-row sacrifice, exactly 30 conserved figure IDs, preview cancellation and confirmed move, shelf art and both mobile engines.');
