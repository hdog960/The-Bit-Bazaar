'use strict';
/* Bit Bazaar v0.33 release regression: authored art, append-only anchors,
 * floor-pad collision safety, cycling previews and no-write cancellation. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const code=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const oldItems=Array.from({length:88},(_,i)=>({
 id:'legacy-'+i,name:'Legacy item '+i,art:'legacy',mount:i%4===0?'wall':'floor',
 category:'Legacy',price:3
}));
const slots=Array.from({length:184},(_,id)=>{
 const kind=id<16?'wall':id<28?'floor':id<36?'rug':id<44?'ceiling':
  id<104?'shelf':id<116?'floor':id<122?'rug':id<129?'ceiling':
  id<169?'wall':'floor';
 return {id,kind,name:'Legacy anchor '+id,
  x:kind==='wall'?1.1:7,z:kind==='wall'?16:6,side:'WEST'};
});
const legacy={items:oldItems,slots,quotas:[],texture:()=>({width:32,height:40}),thumbnail:()=>'/old.png'};
let artOps=0;
const painted=[];
const document={createElement(type){
 assert.equal(type,'canvas');
 const canvas={width:0,height:0,ops:[]};painted.push(canvas);
 canvas.getContext=()=>({
  fillStyle:'#000',imageSmoothingEnabled:true,
  fillRect(x,y,w,h){canvas.ops.push([x,y,w,h,this.fillStyle]);artOps++;}
 });
 canvas.toDataURL=()=>'/thumb/'+painted.indexOf(canvas);
 return canvas;
}};
const win={BIT_BAZAAR_DECOR:legacy};
const sandbox={window:win,document,Math,Set,Map,Number,Array,Object,JSON};
vm.runInNewContext(code('assets/decor-art-v0.33.js'),sandbox,{timeout:3000});
const decorated=win.BIT_BAZAAR_DECOR;
assert.equal(decorated.items.length,104,'16 new original decorations');
assert.equal(decorated.slots.length,184,'art never edits mounts');
assert.equal(painted.length,16,'one tiny authored canvas per decoration');
assert.equal(new Set(decorated.items.map(i=>i.id)).size,104,'stable unique item IDs');
assert.equal(new Set(decorated.items.map(i=>i.name)).size,104,'distinct titles');
assert.equal(new Set(painted.map(x=>JSON.stringify(x.ops))).size,16,'each illustration differs in authored pixels');
for(let i=0;i<16;i++){
 const item=decorated.items[88+i],img=painted[i];
 assert.ok(img.ops.length>=25,'Not an icon: '+item.name);
 assert.equal(img.width,item.mount==='shelf'?48:
  ['rug','ceiling'].includes(item.mount)||item.category==='Architecture'?40:32);
 assert.equal(img.height,['rug','shelf'].includes(item.mount)?28:
  item.mount==='ceiling'||item.category==='Architecture'?48:40);
 assert.ok(item.description.length>70,'Individually written description: '+item.name);
 assert.ok(item.price>0&&item.price<=20,'Sacrifice only a bounded number of perfect rows');
 assert.strictEqual(decorated.texture(item.id),img);
}
const newCounts=Object.fromEntries(['Framed Art','Architecture','Shelf Trims','Rugs',
 'Ceilings','Statues','Plants'].map(category=>
 [category,decorated.items.slice(88).filter(i=>i.category===category).length]));
assert.deepEqual(newCounts,{'Framed Art':4,Architecture:2,'Shelf Trims':3,
 Rugs:3,Ceilings:2,Statues:1,Plants:1});
assert.ok(artOps>500,'Hand-authored art contains fine detailing');
vm.runInNewContext(code('assets/decor-sites-v0.33.js'),sandbox,{timeout:3000});
const catalog=win.BIT_BAZAAR_DECOR;
assert.equal(catalog.items.length,104);
assert.equal(catalog.slots.length,190,'Six new mounts appended');
assert.equal(catalog.slots.filter(x=>x.kind==='floor').length,45,'45 floor display pads');
assert.equal(catalog.slots.filter(x=>x.kind==='wall').length,56);
assert.equal(catalog.slots.filter(x=>x.kind==='rug').length,14);
assert.equal(catalog.slots.filter(x=>x.kind==='ceiling').length,15);
assert.equal(catalog.slots.filter(x=>x.kind==='shelf').length,60);
for(let i=0;i<184;i++)assert.strictEqual(catalog.slots[i],slots[i],'all old anchors preserved');
for(let i=184;i<190;i++){
 const site=catalog.slots[i];
 assert.equal(site.id,i);assert.equal(site.kind,'floor');
 assert.ok([5,65].includes(site.x),'side corridors only');
 assert.ok([24,36,48].includes(site.z),'mid-aisle open spaces only');
}
const newSites=catalog.slots.slice(184);
const originalFloor=catalog.slots.slice(0,184).filter(x=>x.kind==='floor');
for(const site of newSites)for(const other of [...originalFloor,...newSites.filter(x=>x!==site)])
 assert.ok(Math.hypot(site.x-other.x,site.z-other.z)>=4.1,'safe floor-pad separation');
let saves=0,finishBeams=0;
win.BIT_BAZAAR_WORKSHOP={create:()=>({
 snapshot:()=>[],resetAll:()=>{},load:()=>{},onMove:()=>{},onStore:()=>{},
 pos:(id,slot)=>catalog.slots[slot],rotation:()=>0,tone:()=>0
})};
win.BIT_BAZAAR_ROOM={create:()=>({state:()=>({}),load:()=>{},reset:()=>{}})};
vm.runInNewContext(code('assets/decor-runtime-v0.33.js'),sandbox,{timeout:3000});
const runtime=win.BIT_BAZAAR_PHASE4.create({
 isOpen:()=>false,save:()=>saves++,notify:()=>{},perfectCount:()=>0
});
runtime.load({decor:{owned:['rainmarket-blue-hour','moonwatch-bell-tower',
 'foxfire-river-otter','briarwood-gilded-rails'],placed:[
 ['rainmarket-blue-hour',0],['moonwatch-bell-tower',1],
 ['foxfire-river-otter',16],['briarwood-gilded-rails',44]
 ]}});
const before=JSON.stringify(runtime.state());
assert.equal(runtime.previewMove('not-owned',2),false);
assert.equal(runtime.previewMove('rainmarket-blue-hour',1),false,'occupied mount rejected');
assert.equal(runtime.previewMove('rainmarket-blue-hour',0),false,'origin cannot preview');
assert.equal(runtime.previewMove('rainmarket-blue-hour',2),true);
const option=runtime.previewOptions();
assert.equal(option.index,1,'first unoccupied alternate wall location');
assert.equal(option.total,54,'56 wall sites, one origin, one occupied');
assert.equal(runtime.cyclePreview(1),true,'next preview moves to next vacant site');
assert.equal(runtime.previewState().slot,3);
assert.equal(runtime.cyclePreview(-1),true,'previous preview steps back');
assert.equal(runtime.previewState().slot,2);
assert.equal(runtime.cyclePreview(0),false,'invalid step rejected');
assert.equal(JSON.stringify(runtime.state()),before,'cycling cannot mutate owned/mounts');
assert.equal(saves,0,'cycling cannot trigger a save');
assert.equal(runtime.cancelPreview(),true);
assert.equal(runtime.previewOptions().index,0);
assert.equal(runtime.previewOptions().total,0,'no available options when inactive');
assert.equal(JSON.stringify(runtime.state()),before);
assert.equal(runtime.previewMove('foxfire-river-otter',184),true,'new floor pads are valid destinations');
assert.equal(runtime.cyclePreview(1),true);
const selected=runtime.previewState().slot;
assert.ok(selected>=16&&selected!==16,'cycle stays in same mount category and off origin');
assert.equal(saves,0);
assert.equal(runtime.commitPreview(),true);
assert.equal(runtime.previewState(),null,'ghost clears on real move');
assert.equal(saves,1,'exactly one write on confirmed move');
assert.equal(runtime.ownedIds().length,4,'nothing lost from ownership');
assert.equal(runtime.drawShelfFinish(0,{w:7.7},1,1,6,
 ()=>{},()=>{finishBeams++;}),true,'new real shelf trim draws');
assert.ok(finishBeams>=25,'hand-authored new trim produces distinct rail marks');
const html=code('preview-v0.33.0.html'),sw=code('sw.js');
for(const f of ['assets/decor-art-v0.33.js','assets/decor-sites-v0.33.js',
 'assets/decor-runtime-v0.33.js','game-v0.33.0.js','style-v0.33.0.css'])
 assert.ok(html.includes('./'+f),'main shell loads '+f);
assert.ok(html.indexOf('decor-art-v0.33.js')<html.indexOf('decor-sites-v0.33.js'));
assert.ok(html.indexOf('decor-sites-v0.33.js')<html.indexOf('decor-runtime-v0.33.js'));
for(const f of ['assets/decor-art-v0.33.js','assets/decor-sites-v0.33.js'])
 assert.ok(sw.includes('./'+f),'active build still loads historical art/locations '+f);
assert.ok(html.includes('./assets/decor-runtime-v0.33.js'),'archived preview retains archived runtime');
assert.ok(sw.includes('bit-bazaar-v0.62.0'));
for(const f of ['game-v0.33.0.js','game-v0.33.0-lowfx.js']){
 const source=code(f);
 for(const name of ['decorPreviewPrevious','decorPreviewNext','decorPreviewFace',
  'cycleDecorPreview','faceDecorPreview','decorPreviewOptions:'])
  assert.ok(source.includes(name),f+' does not wire '+name);
}
for(const id of ['decorPreviewPrevious','decorPreviewNext','decorPreviewFace','decorPreviewCount'])
 assert.ok(html.includes('id="'+id+'"'),'button exists in HTML: '+id);
assert.ok(code('baseline-v0.33.0-lowfx.html').includes('game-v0.33.0-lowfx.js'));
console.log('PASS v0.33: 16 original canvases, 190 stable mounts, 6 safe side-aisle pads, no-write ghost cycling, standard/Low FX, PWA consistency.');
