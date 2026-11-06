'use strict';
/* Bit Bazaar v0.37 — entire original 180/180 collection:
   20 new authored canvases, exact 9 category quotas, append-only saved
   locations, six-row sacrifice, 60 original figurines, both engines,
   complete-ownership progress, and unique in-world shelf finishes. */
const assert=require('node:assert/strict'),fs=require('node:fs'),
 path=require('node:path'),vm=require('node:vm');
const source=pathName=>fs.readFileSync(path.join(__dirname,'..',pathName),'utf8');
const artwork=[];
const document={createElement(type){
 assert.equal(type,'canvas');
 const c={width:0,height:0,ops:[]};
 const g={fillStyle:'#000',imageSmoothingEnabled:false,
  fillRect(x,y,w,h){c.ops.push([x,y,w,h,g.fillStyle])},
  drawImage(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},
  arc(){},ellipse(){},closePath(){},fillText(){},measureText:()=>({width:10})};
 c.getContext=()=>g;c.toDataURL=()=>'/thumb/'+artwork.indexOf(c);
 artwork.push(c);return c;
}};
const backing=new Map(),localStorage={
 getItem:k=>backing.has(k)?backing.get(k):null,
 setItem:(k,v)=>backing.set(k,String(v))
};
const window={},sandbox=vm.createContext({
 window,document,localStorage,Math,Map,Set,Object,Array,Number,JSON
});
const chain=[
 'assets/decor-v0.19.js','assets/decor-expansion-v0.20.js',
 'assets/decor-expansion-v0.21.js','assets/decor-expansion-v0.22.js',
 'assets/decor-expansion-v0.25.js','assets/decor-sites-v0.26.js',
 'assets/decor-endcaps-v0.28.js','assets/decor-art-v0.28.js',
 'assets/decor-art-v0.29.js','assets/decor-art-v0.32.js',
 'assets/decor-sites-v0.32.js','assets/decor-art-v0.33.js',
 'assets/decor-sites-v0.33.js','assets/decor-art-v0.34.js',
 'assets/decor-sites-v0.34.js','assets/decor-art-v0.35.js',
 'assets/decor-sites-v0.35.js','assets/decor-art-v0.36.js',
 'assets/decor-sites-v0.36.js'
];
for(const p of chain)vm.runInContext(source(p),sandbox,{timeout:3500,filename:p});
const before=window.BIT_BAZAAR_DECOR,
 originalIds=before.items.map(item=>item.id),
 originalSites=[...before.slots],
 originalPictureCount=artwork.length;
assert.equal(before.items.length,160,'v0.36 provided 160 original works');
assert.equal(before.slots.length,232,'old 232 display anchors stable');
vm.runInContext(source('assets/decor-art-v0.37.js'),sandbox,{timeout:3500});
const catalog=window.BIT_BAZAAR_DECOR,painted=artwork.slice(originalPictureCount);
assert.equal(catalog.items.length,180,'complete 180 original art works');
assert.equal(catalog.slots.length,232,'no renumbering or migrating display pads');
assert.equal(new Set(catalog.items.map(item=>item.id)).size,180);
assert.equal(new Set(catalog.items.map(item=>item.name)).size,180);
assert.equal(painted.length,20,'one pixel canvas per new work');
assert.equal(new Set(painted.map(c=>JSON.stringify(c.ops))).size,20,
 'each new art image has its own designed composition');
for(let i=0;i<160;i++)assert.equal(catalog.items[i].id,originalIds[i],
 'previous artwork IDs permanently immutable');
for(let i=0;i<232;i++)assert.strictEqual(catalog.slots[i],originalSites[i],
 'every historical mounting location preserved exactly');
for(let i=0;i<20;i++){
 const item=catalog.items[160+i],image=painted[i];
 assert.ok(image.ops.length>=25,'original image has real painted details '+item.name);
 assert.ok(item.description.length>=75,'unique item description '+item.name);
 assert.ok(item.price>=1&&item.price<=20,'1–20 currently PERFECT rows');
 assert.equal(image.width,item.mount==='shelf'?48:
   item.mount==='rug'||item.category==='Architecture'?40:32,
   'native pixel width '+item.name);
 assert.equal(image.height,item.mount==='shelf'||item.mount==='rug'?28:
   item.category==='Architecture'?48:40,
   'native pixel height '+item.name);
 assert.strictEqual(catalog.texture(item.id),image,'the game uses the new native texture');
 assert.ok(catalog.thumbnail(item.id),'art loads in catalog');
}
const limits={'Framed Art':35,Statues:25,Plants:20,Lighting:20,
 Rugs:20,Architecture:20,Ceilings:15,'Shelf Trims':15,Curios:10};
assert.equal(Object.values(limits).reduce((a,b)=>a+b,0),180);
for(const [category,limit] of Object.entries(limits))
 assert.equal(catalog.items.filter(item=>item.category===category).length,limit,
  'locked original quota exactly completed for '+category);
const siteKinds=Object.fromEntries(['wall','floor','rug','ceiling','shelf'].map(k=>[
 k,catalog.slots.filter(site=>site.kind===k).length]));
assert.deepEqual(siteKinds,{wall:56,floor:75,rug:20,ceiling:21,shelf:60});
const itemKind=Object.fromEntries(['wall','floor','rug','ceiling','shelf'].map(k=>[
 k,catalog.items.filter(item=>item.mount===k).length]));
for(const [kind,n] of Object.entries(itemKind))
 assert.ok(n<=siteKinds[kind],kind+' can display every item simultaneously');
window.BIT_BAZAAR_WORKSHOP={create:()=>({
 snapshot:()=>[],resetAll:()=>{},load:()=>{},onMove:()=>{},onStore:()=>{},
 pos:(id,slot)=>catalog.slots[slot],rotation:()=>0,tone:()=>0,
 controls:()=>'',bind:()=>{}
})};
window.BIT_BAZAAR_ROOM={create:()=>({
 state:()=>({}),load:()=>{},reset:()=>{},render:()=>'',bind:()=>{}
})};
vm.runInContext(source('assets/decor-runtime-v0.37.js'),sandbox,{timeout:3500});
let saveCalls=0,cleared=[],dropped=[];
const rows=Array.from({length:60},()=>Array.from({length:5},()=>[])),
 slots=Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
for(let i=0;i<6;i++){
 const face=Math.floor(i/5),row=i%5;
 rows[face][row]=Array.from({length:10},(_,p)=>i*10+p);
 slots[face][row]=[...rows[face][row]];
}
let runtime;
function snapshot(){
 return {version:1,rows:rows.map(face=>face.map(row=>[...row])),
 slots:slots.map(face=>face.map(row=>[...row])),
 ground:[],lifetimePerfect:[0,1,2,3,4,5],
 decor:runtime?runtime.state():{owned:[],placed:[],adjustments:[],room:{}}};
}
runtime=window.BIT_BAZAAR_PHASE4.create({
 isOpen:()=>false,notify:()=>{},save:()=>saveCalls++,perfectCount:()=>6,
 isPerfect:(face,row)=>face*5+row<6&&rows[face][row].length===10,
 rowSlots:(face,row)=>slots[face][row],
 shelf:()=>({face:1,fixture:{x:35,z:30,nx:0,nz:1,ux:1,uz:0,depth:1.72}}),
 blocked:()=>false,crowded:()=>false,snapshot,
 clearRow:(face,row)=>{
  cleared.push([face,row]);rows[face][row]=[];slots[face][row].fill(null);
 },
 scatter:(id,x,z)=>dropped.push({id,x,z}),
 clearUndo:()=>{},refresh:()=>{}
});
runtime.load({decor:{owned:[],placed:[],adjustments:[],room:{}}});
assert.equal(runtime.searchMatches('').length,180);
assert.ok(runtime.searchMatches('royal enamel').includes('royal-enamel-checkwork'));
assert.ok(runtime.searchMatches('GRIFFIN').includes('moss-griffin-sentinel'));
assert.ok(runtime.searchMatches('teal').length>0);
assert.equal(runtime.searchMatches('nonexistent-zz-art').length,0);
assert.equal(saveCalls,0,'search is pure/read-only');
assert.ok(runtime.affordables(6)>0,'affordable filter still functional');
assert.equal(runtime.buy('royal-enamel-checkwork',44,true),true,'6-row artwork purchased');
assert.equal(cleared.length,6,'exactly six different complete shelf rows lost');
assert.equal(dropped.length,60,'60 original figures placed on floor');
assert.equal(new Set(dropped.map(x=>x.id)).size,60,'no figures duplicated');
assert.equal(dropped.every(x=>x.id>=0&&x.id<60),true,'all scattered IDs pre-existing');
const save=JSON.parse(backing.get('bit-bazaar-save-v3'));
assert.equal(save.ground.length,60,'atomic save contains all 60 figures');
assert.equal(save.lifetimePerfect.length,6,'historical row completion never erased');
assert.equal(save.decor.owned.includes('royal-enamel-checkwork'),true);
assert.ok(backing.has('bit-bazaar-v3-before-first-sacrifice'),'backup before first art sacrifice');
assert.equal(saveCalls,0,'atomic purchase does not issue second save');
const current=JSON.stringify(runtime.state());
assert.equal(runtime.move('royal-enamel-checkwork',44),false,'same-slot move safely ignored');
assert.equal(runtime.findOpenFor('royal-enamel-checkwork'),true,'valid alternate site selection');
assert.equal(JSON.stringify(runtime.state()),current,'selection does not change save');
assert.equal(runtime.previewMove('royal-enamel-checkwork',45),true);
assert.equal(runtime.cyclePreview(1),true);
assert.equal(runtime.cancelPreview(),true);
assert.equal(JSON.stringify(runtime.state()),current,'canceled placement never commits');
assert.equal(saveCalls,0,'no write until confirmed');
assert.equal(runtime.previewMove('royal-enamel-checkwork',45),true);
assert.equal(runtime.commitPreview(),true);
assert.equal(saveCalls,1,'confirmed free art move saves once');
for(const id of ['royal-enamel-checkwork','silver-tide-brasswork']){
 runtime.load({decor:{owned:[id],placed:[[id,44]],adjustments:[],room:{}}});
 let tiers=0,inlays=0;
 assert.equal(runtime.drawShelfFinish(0,{w:7.7},1,1,6,
  ()=>tiers++,()=>inlays++),true,'real 3D trim rendering');
 assert.equal(tiers,5,'all five physical rows have custom painted edges');
 assert.ok(inlays>=30,'individually designed geometry drawn');
}
let html='';
const elements=new Map(),get=key=>{
 if(!elements.has(key))elements.set(key,{
  value:'',oninput:null,onkeydown:null,onclick:null,onchange:null,textContent:''
 });
 return elements.get(key);
};
const body={scrollTop:0,get innerHTML(){return html},set innerHTML(v){html=v},
 querySelector:get,querySelectorAll:()=>[]};
const ui=window.BIT_BAZAAR_PHASE4.create({
 isOpen:()=>true,body:()=>body,perfectCount:()=>0,
 notify:()=>{},save:()=>{throw Error('UI preview must not save')}
});
ui.load({decor:{owned:catalog.items.map(x=>x.id),placed:[],adjustments:[],room:{}}});
ui.render();
assert.ok(html.includes('ALL 180 ORIGINAL DECORATIONS · NINE CATEGORIES COMPLETE'),
 'phase 4 library content banner');
assert.ok(html.includes('aria-valuenow="180"'),'completion progress true when all are owned');
assert.ok(html.includes('ALL 180 ORIGINAL ARTWORKS PERMANENTLY COLLECTED'),
 'true complete-owned game state banner');
assert.ok(!html.includes('MORE COMING'),'no fake unfinished category copy');
get('#decorSearch').value='moonlit koi';
get('[data-decor-search-apply]').onclick();
assert.ok(html.includes('Moonlit Koi Festival'),'search finds the final set');
assert.ok(!html.includes('The Museum of Dawn'),'search excludes other artwork');
get('[data-decor-search-clear]').onclick();
assert.ok(html.includes('ALL 180'),'clear restores complete art collection');
assert.equal(JSON.stringify(ui.state().owned).includes('moonlit-koi-festival'),true);
const standard=source('game-v0.37.0.js'),lowfx=source('game-v0.37.0-lowfx.js');
for(const content of [standard,lowfx]){
 for(const marker of ['decorSearch:query','decorCatalogCapacity:', 'bit-bazaar-save-v3'])
  assert.ok(content.includes(marker),'old player saves and QA probes still present');
}
const main=source('preview-v0.37.0.html'),worker=source('sw.js');
for(const p of ['assets/decor-art-v0.37.js','assets/decor-runtime-v0.37.js',
 'game-v0.37.0.js','style-v0.37.0.css'])
 assert.ok(main.includes('./'+p),'archived preview includes '+p);
for(const p of ['assets/decor-art-v0.37.js','assets/decor-runtime-v0.37.js'])
 assert.ok(worker.includes('./'+p),'current catalog or recovery still loads '+p);
assert.ok(main.indexOf('decor-art-v0.37.js')<main.indexOf('decor-runtime-v0.37.js'));
assert.ok(source('baseline-v0.37.0-lowfx.html').includes('game-v0.37.0-lowfx.js'));
assert.ok(worker.includes('bit-bazaar-v0.53.0'));
console.log('PASS v0.37: 180 unique hand-authored works with 9 exact quotas, 232 stable sites, 60 figure identities conserved in 6-row sacrifice, no-op moves, read-only search, true completion UI, two unique five-tier shelf finishes, standard/Low FX and new offline cache.');
