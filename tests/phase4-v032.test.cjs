'use strict';
/* Archived Bit Bazaar v0.32 gallery regression — v0.33 should preserve these old assets.
 * Run: node tests/phase4-v032.test.cjs. No browser or external packages. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const code=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const initialCategories=[
 ['Framed Art',12,'wall'],['Statues',7,'floor'],['Plants',7,'floor'],
 ['Lighting',8,'floor'],['Rugs',8,'rug'],['Architecture',8,'wall'],
 ['Ceilings',8,'ceiling'],['Shelf Trims',4,'shelf'],['Curios',6,'floor']
];
const oldItems=initialCategories.flatMap(([category,count,mount])=>
 Array.from({length:count},(_,i)=>({
  id:'old-'+category.replace(/ /g,'-')+'-'+i,
  name:'EXISTING '+category+' '+i,category,mount,price:2,art:'existing'
 })));
assert.equal(oldItems.length,68,'pre-v0.32 item count');
const oldSlots=Array.from({length:169},(_,id)=>{
 const kind=id<16?'wall':id<28?'floor':id<36?'rug':id<44?'ceiling':
  id<104?'shelf':id<116?'floor':id<122?'rug':id<129?'ceiling':'wall';
 return {id,kind,x:7,z:6,side:kind==='floor'?'FLOOR':'WEST',name:'OLD SITE '+id};
});
assert.equal(oldSlots.filter(s=>s.kind==='floor').length,24);
const previousCatalog={
 items:oldItems,slots:oldSlots,quotas:[
  ['POSTERS',35],['STATUES',25],['PLANTS',20],['LIGHTS',20],['RUGS',20],
  ['ARCHITECTURE',20],['CEILINGS',15],['SHELF',15],['CURIOS',10]
 ],texture:()=>({width:32,height:40}),thumbnail:()=>'/old.png'
};
const painted=[];
const document={createElement(type){
 assert.equal(type,'canvas');
 const rec={width:0,height:0,ops:[]};painted.push(rec);
 return Object.assign(rec,{
  getContext(mode){
   assert.equal(mode,'2d');
   const ctx={fillStyle:'#000',imageSmoothingEnabled:true,
    fillRect(x,y,w,h){rec.ops.push([x,y,w,h,ctx.fillStyle]);}};
   return ctx;
  },
  toDataURL:()=>'/mock-thumbnail-'+painted.indexOf(rec)
 });
}};
const window={BIT_BAZAAR_DECOR:previousCatalog};
const sandbox={window,document,Math,Set,Map,Object,Number,Array};
vm.runInNewContext(code('assets/decor-art-v0.32.js'),sandbox,{timeout:2000});
const first=window.BIT_BAZAAR_DECOR;
assert.equal(first.items.length,88,'20 new authored works');
assert.equal(first.slots.length,169,'art module does not change anchor IDs');
assert.equal(painted.length,20,'exactly 20 original art canvases');
assert.equal(new Set(first.items.map(x=>x.id)).size,88,'no ID collisions');
assert.equal(new Set(first.items.map(x=>x.name)).size,88,'no fake color variants');
assert.equal(new Set(painted.map(x=>JSON.stringify(x.ops))).size,20,'all pixel illustrations are distinct');
for(let i=0;i<painted.length;i++){
 const x=painted[i],item=first.items[68+i];
 assert.ok(x.ops.length>=25,item.id+' must be authored, not a single icon');
 assert.equal(x.width,item.mount==='shelf'?48:['rug','ceiling'].includes(item.mount)||item.category==='Architecture'?40:32);
 assert.equal(x.height,['rug','shelf'].includes(item.mount)?28:item.mount==='ceiling'||item.category==='Architecture'?48:40);
 assert.equal(item.description.length>=70,true,'item must have original story');
 assert.ok(item.price>=1&&item.price<=20,'cost respects 1–20 perfect rows');
 assert.ok(first.texture(item.id),'canvas texture works');
 assert.ok(first.thumbnail(item.id).startsWith('/mock-thumbnail-'),'lazy art thumbnail');
}
const categoryCounts=Object.fromEntries(
 [...new Set(first.items.map(item=>item.category))].map(category=>[
  category,first.items.filter(item=>item.category===category).length
 ]));
assert.deepEqual(categoryCounts,{
 'Framed Art':17,Statues:10,Plants:9,Lighting:10,Rugs:10,
 Architecture:10,Ceilings:10,'Shelf Trims':5,Curios:7
},'every category advances within quota');
assert.equal(first.texture(oldItems[0].id).width,32,'old art still delegates');
vm.runInNewContext(code('assets/decor-sites-v0.32.js'),sandbox,{timeout:2000});
const catalog=window.BIT_BAZAAR_DECOR;
assert.equal(catalog.items.length,88);
assert.equal(catalog.slots.length,184,'184 physical anchors');
assert.equal(catalog.slots.filter(x=>x.kind==='floor').length,39,'floor capacity 24→39');
assert.equal(catalog.slots.filter(x=>x.kind==='wall').length,56,'original 56 wall/endcap locations');
assert.equal(catalog.slots.filter(x=>x.kind==='rug').length,14,'rugs unchanged');
assert.equal(catalog.slots.filter(x=>x.kind==='ceiling').length,15,'ceiling unchanged');
assert.equal(catalog.slots.filter(x=>x.kind==='shelf').length,60,'shelf face finishes unchanged');
for(let i=0;i<169;i++)assert.strictEqual(catalog.slots[i],oldSlots[i],'old anchor preserved');
for(let i=169;i<184;i++){
 const site=catalog.slots[i];
 assert.equal(site.id,i,'new anchor ID contiguous and appended');
 assert.equal(site.kind,'floor');
 assert.ok([19,35,51].includes(site.x));
 assert.ok([11,23,35,47,59].includes(site.z));
}
assert.equal(new Set(catalog.slots.map(x=>x.name)).size,184,'all anchors individually named');
let saves=0,notifications=[];
window.BIT_BAZAAR_WORKSHOP={create:()=>({
 snapshot:()=>[],resetAll:()=>{},load:()=>{},onMove:()=>{},onStore:()=>{},
 pos:(id,slot)=>catalog.slots[slot],rotation:()=>0,tone:()=>0
})};
window.BIT_BAZAAR_ROOM={create:()=>({state:()=>({}),load:()=>{},reset:()=>{}})};
vm.runInNewContext(code('assets/decor-runtime-v0.32.js'),sandbox,{timeout:2000});
const api={isOpen:()=>false,save:()=>{saves++;},notify:m=>notifications.push(m),
 perfectCount:()=>0,blocked:()=>false,crowded:()=>false};
const runtime=window.BIT_BAZAAR_PHASE4.create(api);
const load={decor:{owned:['clockfish-aquarium','violet-stained-scrollwork'],
 placed:[['clockfish-aquarium',16],['violet-stained-scrollwork',44]]}};
runtime.load(load);
const before=JSON.stringify(runtime.state());
assert.equal(runtime.previewMove('clockfish-aquarium',170),true,'new floor pad preview');
assert.equal(saves,0,'preview never saves');
assert.equal(JSON.stringify(runtime.state()),before,'no mutation of saved decoration state');
assert.equal(runtime.previewState().slot,170);
const rendered=runtime.visibleDecor((x,z)=>z,()=>0,1);
assert.equal(rendered.filter(e=>e.type==='decor-ghost').length,1);
assert.equal(runtime.cancelPreview(),true);
assert.equal(JSON.stringify(runtime.state()),before,'cancel resets no save');
assert.equal(runtime.previewMove('clockfish-aquarium',170),true);
assert.equal(runtime.commitPreview(),true,'new floor anchors accept move');
assert.equal(saves,1,'only confirmed relocation saves');
assert.equal(runtime.placedSlots().find(([id])=>id==='clockfish-aquarium')[1],170);
assert.equal(runtime.ownedIds().length,2,'existing ownership unchanged');
let beams=0,panels=0;
assert.equal(runtime.drawShelfFinish(0,{w:7.7},1,1,6,()=>{panels++;},()=>{beams++;}),true,'violet fascia renders');
assert.ok(beams>15&&panels===5,'custom violet shelf trim draws a unique pattern');
assert.ok(code('game-v0.32.0.js').includes('openDecorMove:id=>'),'catalog shortcut wired standard');
assert.ok(code('game-v0.32.0-lowfx.js').includes('openDecorMove:id=>'),'catalog shortcut wired Low FX');
assert.ok(code('assets/decor-runtime-v0.32.js').includes('data-plan-art'),'owned card can move via map');
const html=code('preview-v0.32.0.html'),sw=code('sw.js');
for(const file of ['assets/decor-art-v0.32.js','assets/decor-sites-v0.32.js',
 'assets/decor-runtime-v0.32.js','game-v0.32.0.js','style-v0.32.0.css'])
 assert.ok(html.includes('./'+file),'index must load '+file);
assert.ok(html.indexOf('decor-art-v0.32.js')<html.indexOf('decor-sites-v0.32.js'),'new art before new locations');
assert.ok(html.indexOf('decor-sites-v0.32.js')<html.indexOf('decor-runtime-v0.32.js'),'new slots before runtime');
for(const file of ['assets/decor-art-v0.32.js','assets/decor-sites-v0.32.js'])
 assert.ok(sw.includes('./'+file),'current build still loads historical artwork and sites '+file);
assert.ok(html.includes('./assets/decor-runtime-v0.32.js'),'archived v0.32 preview shell retains its original runtime');
assert.ok(sw.includes('bit-bazaar-v0.62.0'),'updated service worker includes stable v0.32 art and runtime');
console.log('PASS Bit Bazaar v0.32: 20 unique works, 15 collision-checked anchors, exact quotas, non-destructive relocation, trim art, full/Low FX, cache integrity.');
