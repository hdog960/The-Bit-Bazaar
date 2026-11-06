'use strict';
/* Bit Bazaar v0.36: full catalog, searchable discovery, standing capacity,
 * five-row sacrifice conservation, old-save relocation and native art QA. */
const assert=require('node:assert/strict'),fs=require('node:fs'),
 path=require('node:path'),vm=require('node:vm');
const code=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const pictures=[],document={createElement(type){
 assert.equal(type,'canvas');
 const c={width:0,height:0,ops:[]},g={
  fillStyle:'#000',imageSmoothingEnabled:false,
  fillRect(x,y,w,h){c.ops.push([x,y,w,h,g.fillStyle])},
  drawImage(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},
  fill(){},arc(){},ellipse(){},closePath(){},fillText(){},
  measureText:()=>({width:10})
 };
 c.getContext=()=>g;c.toDataURL=()=>'/pixel/'+pictures.indexOf(c);
 pictures.push(c);return c;
}};
const storage=new Map(),localStorage={
 getItem:key=>storage.get(key)||null,setItem:(key,v)=>storage.set(key,String(v))
};
const window={},ctx=vm.createContext({
 window,document,localStorage,Math,Set,Map,Object,Array,Number,JSON
});
const history=[
 'assets/decor-v0.19.js','assets/decor-expansion-v0.20.js',
 'assets/decor-expansion-v0.21.js','assets/decor-expansion-v0.22.js',
 'assets/decor-expansion-v0.25.js','assets/decor-sites-v0.26.js',
 'assets/decor-endcaps-v0.28.js','assets/decor-art-v0.28.js',
 'assets/decor-art-v0.29.js','assets/decor-art-v0.32.js',
 'assets/decor-sites-v0.32.js','assets/decor-art-v0.33.js',
 'assets/decor-sites-v0.33.js','assets/decor-art-v0.34.js',
 'assets/decor-sites-v0.34.js','assets/decor-art-v0.35.js',
 'assets/decor-sites-v0.35.js'
];
for(const p of history)vm.runInContext(code(p),ctx,{timeout:3000,filename:p});
const old=window.BIT_BAZAAR_DECOR,oldIds=old.items.map(i=>i.id),
 oldSites=[...old.slots],imageStart=pictures.length;
assert.equal(old.items.length,140);assert.equal(old.slots.length,220);
vm.runInContext(code('assets/decor-art-v0.36.js'),ctx,{timeout:3000});
const art=window.BIT_BAZAAR_DECOR,pics=pictures.slice(imageStart);
assert.equal(art.items.length,160,'Twenty distinct artworks added');
assert.equal(pics.length,20,'Twenty native illustration canvases created');
assert.equal(new Set(pics.map(x=>JSON.stringify(x.ops))).size,20,
 'No duplicate pixel compositions');
assert.equal(new Set(art.items.map(x=>x.id)).size,160,'No artwork ID collisions');
for(let i=0;i<140;i++)assert.equal(art.items[i].id,oldIds[i],'Historical art ID stable');
for(let i=0;i<20;i++){
 const item=art.items[140+i],paint=pics[i];
 assert.ok(paint.ops.length>=25,item.name+' must have intentional details');
 assert.ok(item.description.length>=75,item.name+' must have distinctive lore');
 assert.ok(item.price>0&&item.price<=20);
 assert.equal(paint.width,item.mount==='shelf'?48:
  item.mount==='rug'||item.category==='Architecture'?40:32);
 assert.equal(paint.height,item.mount==='rug'||item.mount==='shelf'?28:
  item.category==='Architecture'?48:40);
 assert.strictEqual(art.texture(item.id),paint);
}
const additions=Object.fromEntries(['Framed Art','Statues','Plants','Lighting',
 'Rugs','Architecture','Ceilings','Shelf Trims','Curios'].map(cat=>[
 cat,art.items.slice(140).filter(item=>item.category===cat).length
]));
assert.deepEqual(additions,{'Framed Art':3,Statues:4,Plants:3,Lighting:3,
 Rugs:2,Architecture:3,Ceilings:0,'Shelf Trims':2,Curios:0});
const quotas={'Framed Art':35,Statues:25,Plants:20,Lighting:20,
 Rugs:20,Architecture:20,Ceilings:15,'Shelf Trims':15,Curios:10};
for(const [cat,max] of Object.entries(quotas))
 assert.ok(art.items.filter(item=>item.category===cat).length<=max,
 'category quota '+cat);
vm.runInContext(code('assets/decor-sites-v0.36.js'),ctx,{timeout:3000});
const catalog=window.BIT_BAZAAR_DECOR,news=catalog.slots.slice(220);
assert.equal(catalog.items.length,160);
assert.equal(catalog.slots.length,232);
assert.equal(news.length,12);
const mounts=Object.fromEntries(['wall','floor','rug','ceiling','shelf'].map(kind=>[
 kind,catalog.slots.filter(s=>s.kind===kind).length
]));
assert.deepEqual(mounts,{wall:56,floor:75,rug:20,ceiling:21,shelf:60},
 'all 75 planned freestanding decorations have dedicated capacity');
for(let i=0;i<220;i++)assert.strictEqual(catalog.slots[i],oldSites[i]);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),
 floor=oldSites.filter(x=>x.kind==='floor'),
 rugs=oldSites.filter(x=>x.kind==='rug');
for(let i=0;i<12;i++){
 const s=news[i];
 assert.equal(s.id,220+i);assert.equal(s.kind,'floor');
 assert.ok(floor.every(x=>dist(s,x)>=4.4),'safe gap to existing stands');
 assert.ok(rugs.every(x=>dist(s,x)>=4.6),'safe gap to rugs');
 assert.ok(news.every(x=>s===x||dist(s,x)>=5),'new locations do not crowd');
 assert.ok(dist(s,{x:35,z:68})>=6,'keep entrance clear');
}
window.BIT_BAZAAR_WORKSHOP={create:()=>({
 snapshot:()=>[],resetAll:()=>{},load:()=>{},onStore:()=>{},onMove:()=>{},
 pos:(id,slot)=>catalog.slots[slot],rotation:()=>0,tone:()=>0
})};
window.BIT_BAZAAR_ROOM={create:()=>({state:()=>({}),load:()=>{},reset:()=>{}})};
vm.runInContext(code('assets/decor-runtime-v0.36.js'),ctx,{timeout:3000});
let saves=0,clears=[],drops=[];
const rows=Array.from({length:60},()=>Array.from({length:5},()=>[])),
 slots=Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
for(let row=0;row<5;row++){
 rows[0][row]=Array.from({length:10},(_,i)=>row*10+i);
 slots[0][row]=[...rows[0][row]];
}
let runtime;
function snapshot(){
 return {version:1,rows:rows.map(face=>face.map(r=>[...r])),
 slots:slots.map(face=>face.map(r=>[...r])),
 ground:[],lifetimePerfect:[0,1,2,3,4],
 decor:runtime?runtime.state():{owned:[],placed:[],adjustments:[],room:[]}};
}
const api={isOpen:()=>false,save:()=>saves++,notify:()=>{},perfectCount:()=>5,
 isPerfect:(face,row)=>face===0&&row<5&&rows[face][row].length===10,
 rowSlots:(face,row)=>slots[face][row],
 shelf:()=>({face:1,fixture:{x:35,z:30,nx:0,nz:1,ux:1,uz:0,depth:1.72}}),
 blocked:()=>false,crowded:()=>false,snapshot,
 clearRow:(face,row)=>{clears.push([face,row]);rows[face][row]=[];slots[face][row].fill(null)},
 scatter:(id,x,z)=>drops.push({id,x,z}),clearUndo:()=>{},refresh:()=>{}
};
runtime=window.BIT_BAZAAR_PHASE4.create(api);
runtime.load({decor:{owned:[],placed:[],adjustments:[],room:[]}});
const search=runtime.searchMatches;
assert.equal(search('').length,160,'blank search returns all art');
assert.ok(search('DRAGON').includes('pewter-dragon-librarian'),'case-insensitive name');
assert.ok(search('rainforest').includes('clockwork-rainforest'),
 'searches earlier artwork as well');
assert.ok(search('mushroom').includes('mushroom-caravan'),'searches descriptions and names');
assert.ok(search('SHELF TRIMS').length>=13,'category words searchable');
assert.equal(search('nonsense-zz-no-art').length,0);
const savedView=JSON.stringify(runtime.state());
search('fox');search('LIGHTING');search('moon');
assert.equal(JSON.stringify(runtime.state()),savedView,'search never mutates save');
assert.equal(saves,0,'search never calls persistence');
assert.equal(runtime.buy('clockwork-mariner',0,true),true,'pay exactly five perfect rows');
assert.equal(clears.length,5,'five perfect rows consumed');
assert.equal(drops.length,50,'fifty distinct existing figures returned');
assert.equal(new Set(drops.map(x=>x.id)).size,50,'no spawned or duplicated figurines');
assert.equal(drops.every(x=>x.id>=0&&x.id<50),true);
assert.equal(saves,0,'atomic transaction saved directly');
const saved=JSON.parse(storage.get('bit-bazaar-save-v3'));
assert.equal(saved.ground.length,50);
assert.equal(saved.lifetimePerfect.length,5,'lifetime perfection stays earned');
assert.equal(saved.decor.owned.includes('clockwork-mariner'),true);
const artBefore=JSON.stringify(runtime.state());
assert.equal(runtime.move('clockwork-mariner',0),false,'same-site move protected');
assert.equal(runtime.findOpenFor('clockwork-mariner'),true);
assert.equal(JSON.stringify(runtime.state()),artBefore,'choose mount with no save write');
assert.equal(runtime.previewMove('clockwork-mariner',1),true);
assert.equal(runtime.cyclePreview(1),true);
assert.equal(runtime.cancelPreview(),true);
assert.equal(saves,0);
assert.equal(runtime.previewMove('clockwork-mariner',1),true);
assert.equal(runtime.commitPreview(),true);
assert.equal(saves,1,'confirmation saves precisely once');
for(const item of ['opal-wave-shelf-band','embervine-copper-edge']){
 runtime.load({decor:{owned:[item],placed:[[item,44]],adjustments:[],room:[]}});
 let panels=0,beams=0;
 assert.equal(runtime.drawShelfFinish(0,{w:7.7},1,1,6,()=>panels++,()=>beams++),true);
 assert.equal(panels,5,'all five real tiers painted');
 assert.ok(beams>=25,'independently painted shelf rail pattern');
}
const html=code('preview-v0.36.0.html'),sw=code('sw.js');
for(const p of ['assets/decor-art-v0.36.js','assets/decor-sites-v0.36.js',
 'assets/decor-runtime-v0.36.js','game-v0.36.0.js','style-v0.36.0.css'])
 assert.ok(html.includes('./'+p),'live shell must load '+p);
assert.ok(html.indexOf('decor-art-v0.36.js')<html.indexOf('decor-sites-v0.36.js'));
assert.ok(html.indexOf('decor-sites-v0.36.js')<html.indexOf('decor-runtime-v0.36.js'));
for(const p of ['assets/decor-art-v0.36.js','assets/decor-sites-v0.36.js'])
 assert.ok(sw.includes('./'+p),'current catalog still needs this historical artwork/site module '+p);
assert.ok(html.includes('./assets/decor-runtime-v0.36.js'),
 'historical v0.36 preview loads its original matching runtime');
assert.ok(sw.includes('bit-bazaar-v0.60.0'));
assert.ok(code('baseline-v0.36.0-lowfx.html').includes('game-v0.36.0-lowfx.js'));
const active=code('assets/decor-runtime-v0.36.js');
for(const text of ["data-decor-search-apply","data-decor-search-clear",
 "matchesSearch(item,searchQuery)","art==='opalwave'","art==='embervine'"])
 assert.ok(active.includes(text),'search and 3D trim runtime '+text);
for(const game of ['game-v0.36.0.js','game-v0.36.0-lowfx.js'])
 for(const marker of ['decorSearch:query','decorCatalogCapacity:','bit-bazaar-save-v3'])
  assert.ok(code(game).includes(marker),game+' preserves '+marker);
// Render the real catalog markup against a small DOM adapter to check controls.
let markup='';
const elements=new Map();
const get=selector=>{
 if(!elements.has(selector))elements.set(selector,{value:'',textContent:'',onclick:null,onchange:null,oninput:null,onkeydown:null});
 return elements.get(selector);
};
const fakeBody={
 scrollTop:0,get innerHTML(){return markup},set innerHTML(v){markup=v},
 querySelector:get,querySelectorAll:()=>[]
};
window.BIT_BAZAAR_WORKSHOP={create:()=>({
 snapshot:()=>[],resetAll:()=>{},load:()=>{},onStore:()=>{},onMove:()=>{},
 pos:(id,slot)=>catalog.slots[slot],rotation:()=>0,tone:()=>0,
 controls:()=>'',bind:()=>{}
})};
window.BIT_BAZAAR_ROOM={create:()=>({
 state:()=>({}),load:()=>{},reset:()=>{},render:()=>'',bind:()=>{}
})};
const browser=window.BIT_BAZAAR_PHASE4.create({
 isOpen:()=>true,body:()=>fakeBody,perfectCount:()=>0,
 notify:()=>{},save:()=>{throw Error('Catalog search must not save')}
});
browser.load({decor:{owned:[],placed:[],adjustments:[],room:{}}});
browser.render();
assert.ok(markup.includes('id="decorSearch"'),'search textbox visibly rendered');
assert.ok(markup.includes('data-decor-search-apply'),'find button rendered');
assert.ok(markup.includes('◇ UNOWNED'),'new unowned filter rendered');
assert.ok(markup.includes('✦ CAN CLAIM'),'affordable filter rendered');
get('#decorSearch').value='dragon';
get('[data-decor-search-apply]').onclick();
assert.ok(markup.includes('Pewter Dragon Librarian'),'search results show matching artwork');
assert.ok(!markup.includes('The Clockwork Mariner'),'search excludes unrelated artwork');
assert.ok(markup.includes('SEARCH RESULTS'),'search state visible');
get('[data-decor-search-clear]').onclick();
assert.ok(markup.includes('ALL 160'),'clearing search restores full catalog');
get('#decorSearch').value='fox" autofocus onfocus="malice';
get('[data-decor-search-apply]').onclick();
assert.ok(markup.includes('&quot;'),'search values HTML-escaped to protect embedded markup');
assert.equal(saves,1,'search UI never calls save');

console.log('PASS v0.36: 160 distinct paintings, 232 stable mounts, all 75 floor displays, no-write name/category/description search, atomic five-row/50-figure sacrifice, old-save safety, two new physical shelf patterns and both iPhone engines.');
