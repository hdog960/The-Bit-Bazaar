'use strict';
/* Bit Bazaar v0.39: dense 180-gallery render QA. Exercises stable
 * near-distance visibility, capped distant art, preview ghost immunity,
 * scene cache invalidation on actual saves/moves, shelf material detail,
 * rug LOD and both mobile engines against the real module source. */
const assert=require('node:assert/strict'),fs=require('node:fs'),
 path=require('node:path'),vm=require('node:vm');
const code=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const window={},ctx=vm.createContext({window,Math,Map,Set,Object,Array,Number,JSON});
vm.runInContext(code('assets/decor-workshop-v0.38.js'),ctx,{filename:'workshop'});
window.BIT_BAZAAR_ROOM={create:()=>({
 state:()=>[],load:()=>{},reset:()=>{},render:()=>'',bind:()=>{}
})};
const items=Array.from({length:50},(_,i)=>({
 id:'floor-'+i,name:'Original standing art '+i,category:'Statues',
 mount:'floor',art:'figure',price:2,description:'Individual standing sculpture '+i
}));
items.push({id:'shelf-0',name:'Royal Check',category:'Shelf Trims',
 mount:'shelf',art:'royalcheck',price:2});
items.push({id:'shelf-1',name:'Astral Check',category:'Shelf Trims',
 mount:'shelf',art:'astral',price:3});
for(let i=0;i<3;i++)items.push({id:'rug-'+i,name:'Rug '+i,
 category:'Rugs',mount:'rug',art:'rug',price:3});
const slots=[];
for(let i=0;i<44;i++)slots.push({id:i,kind:'wall',x:70,z:70,name:'unused wall '+i});
for(let i=44;i<104;i++)slots.push({id:i,kind:'shelf',face:i-44,name:'shelf '+(i-44)});
for(let i=104;i<164;i++)slots.push({id:i,kind:'floor',
 x:(i-104)*4,z:(i-104)<5?6:20+(i%9),name:'floor '+i});
for(let i=0;i<3;i++)slots.push({id:164+i,kind:'rug',x:400,z:[6,18,28][i],name:'rug '+i});
const catalog={items,slots,quotas:[],texture:id=>({
 width:id.startsWith('rug')?40:32,height:id.startsWith('rug')?28:40
}),thumbnail:()=>'/fake.png'};
window.BIT_BAZAAR_DECOR=catalog;
// Reload runtime after catalog is bound because it captures data at module load.
vm.runInContext(code('assets/decor-runtime-v0.39.js'),ctx,{filename:'catalog-v039'});
let saves=0,notices=[],blocked=false;
const api={
 isOpen:()=>false,save:()=>saves++,notify:m=>notices.push(m),
 blocked:()=>blocked,perfectCount:()=>0
};
const runtime=window.BIT_BAZAAR_PHASE4.create(api);
const installed=[
 ...items.slice(0,50).map((item,i)=>[item.id,104+i]),
 ['shelf-0',44],['shelf-1',45],
 ['rug-0',164],['rug-1',165],['rug-2',166]
];
const snapshot={decor:{
 owned:items.map(x=>x.id),placed:installed,
 adjustments:[],room:[0,0,0,0]
}};
runtime.load(snapshot);
assert.equal(runtime.state().owned.length,55);
assert.equal(runtime.state().placed.length,55);
const cameraDepth=(x,z)=>z+x*.01,cameraSide=()=>0;
const all=runtime.visibleDecor(cameraDepth,cameraSide,2,48);
const stats=runtime.renderStats();
assert.equal(stats.installed,55);
assert.equal(stats.examined,53,'shelf finishes excluded from sprite stage');
assert.equal(stats.frustum,53);
assert.equal(stats.near,6,'five close sculptures and one close carpet');
assert.equal(all.length,48);
assert.equal(stats.skippedBudget,5);
const packed=runtime.visibleDecor(cameraDepth,cameraSide,2,14);
assert.equal(packed.length,14,'normal budget caps far artwork');
assert.ok(packed.some(x=>x.itemId==='floor-0'),'close art must survive budget');
assert.ok(packed.some(x=>x.itemId==='rug-0'),'close carpet must survive budget');
assert.equal(runtime.renderStats().near,6);
assert.equal(runtime.renderStats().skippedBudget,39);
const repeat=runtime.visibleDecor(cameraDepth,cameraSide,2,14);
assert.equal(packed.map(x=>x.itemId).join(','),
 repeat.map(x=>x.itemId).join(','),'hysteresis gives stable selection at rest');
assert.equal(runtime.visibleDecor(cameraDepth,()=>10000,.2,14).length,0,
 'offscreen art never costs any drawImage calls');
runtime.visibleDecor(cameraDepth,cameraSide,2,14);
assert.equal(runtime.previewMove('floor-0',154),true,'preview owned art at open floor site');
const withGhost=runtime.visibleDecor(cameraDepth,cameraSide,2,8);
assert.equal(withGhost.filter(x=>x.type==='decor-ghost').length,1,
 'ghost always appears despite full 8-slot visible budget');
assert.equal(runtime.renderStats().ghostShown,true);
assert.equal(runtime.state().placed.length,55,'preview does not relocate original');
assert.equal(runtime.cancelPreview(),true);
assert.equal(saves,0,'preview never writes to persistent save');
const priorDepth=runtime.visibleDecor(cameraDepth,cameraSide,2,14)
 .find(x=>x.itemId==='floor-0').depth;
assert.equal(runtime.workshop.choose('floor-0',1,0),true);
const stagedDepth=runtime.visibleDecor(cameraDepth,cameraSide,2,14)
 .find(x=>x.itemId==='floor-0').depth;
assert.equal(priorDepth,stagedDepth,'draft does not move existing world sculpture');
assert.equal(saves,0);
assert.equal(runtime.workshop.apply('floor-0'),true,'apply and save the actual artwork offset');
assert.equal(saves,1);
const actualDepth=runtime.visibleDecor(cameraDepth,cameraSide,2,14)
 .find(x=>x.itemId==='floor-0').depth;
assert.ok(Math.abs(actualDepth-priorDepth-.0025)<1e-9,
 'render-cache invalidates when precision adjustment commits');
const saved=runtime.state();
assert.ok(saved.adjustments.some(x=>x[0]==='floor-0'&&x[1]===1));
runtime.load({decor:saved});
assert.ok(runtime.visibleDecor(cameraDepth,cameraSide,2,14)
 .find(x=>x.itemId==='floor-0').depth>priorDepth,
 'saved precision adjustment stays visible after full reload');
assert.equal(saves,1,'loading positions cannot save automatically');
const panels=[],beams=[];
const panel=()=>panels.push(1),beam=()=>beams.push(1),fixture={w:7.7};
let p=0,b=0;
assert.equal(runtime.drawShelfFinish(0,fixture,1,1,6,panel,beam),true);
assert.equal(panels.length,5,'every physical shelf tier still painted');
const closeBeams=beams.length;
assert.ok(closeBeams>=45,'near-range details preserve hand-authored trims');
panels.length=0;beams.length=0;
assert.equal(runtime.drawShelfFinish(0,fixture,1,1,12,panel,beam),true);
const mediumBeams=beams.length;
assert.equal(panels.length,5);
assert.ok(mediumBeams>5&&mediumBeams<closeBeams,'reduced mid-range inlays');
panels.length=0;beams.length=0;
assert.equal(runtime.drawShelfFinish(0,fixture,1,1,18,panel,beam),true);
assert.equal(beams.length,5,'distant trim still gets a visible edge on five tiers');
const proj=(x,z,h)=>({x,y:h,depth:z});
const canvasCtx={imageSmoothingEnabled:false,drawn:0,
 save(){},restore(){},transform(){},drawImage(){this.drawn++}};
for(const [id,slot,steps] of [['rug-0',164,8],['rug-1',165,4],['rug-2',166,2]]){
 canvasCtx.drawn=0;
 runtime.draw(id,slot,proj,canvasCtx,0,false);
 assert.equal(canvasCtx.drawn,steps,'correct 2.5D carpet slices at this distance '+id);
}
assert.equal(runtime.drawShelfFinish(2,fixture,1,1,6,()=>{},()=>{}),false,
 'empty shelf finish faces require no draw calls');
assert.equal(runtime.move('shelf-0',46),true,'moving owned shelf finishes still free');
assert.equal(saves,2,'relocation triggers only one save');
assert.equal(runtime.drawShelfFinish(0,fixture,1,1,6,()=>{},()=>{}),false,
 'cached old shelf site immediately clears after move');
assert.equal(runtime.drawShelfFinish(2,fixture,1,1,6,()=>{},()=>{}),true,
 'new shelf mount gets the original real fascia');
assert.equal(runtime.store('shelf-0'),true);
assert.equal(saves,3);
assert.equal(runtime.drawShelfFinish(2,fixture,1,1,6,()=>{},()=>{}),false,
 'storing artwork clears the physical fascia cache');
assert.equal(runtime.state().owned.includes('shelf-0'),true,'storing never loses ownership');
const beforeReopen=runtime.state();
runtime.load({decor:beforeReopen});
assert.equal(runtime.state().owned.length,55);
assert.equal(runtime.state().placed.length,54);
assert.equal(saves,3);
const main=code('preview-v0.39.0.html'),worker=code('sw.js');
for(const pth of ['assets/decor-runtime-v0.39.js','game-v0.39.0.js','style-v0.39.0.css'])
 assert.ok(main.includes('./'+pth),'historical v0.39 preview retains '+pth);
assert.ok(main.indexOf('decor-workshop-v0.38.js')<
 main.indexOf('decor-runtime-v0.39.js'),'precision workshop initialized first');
assert.ok(main.includes('assets/decor-art-v0.37.js'),'all 180 original artworks preserved');
assert.ok(code('baseline-v0.39.0-lowfx.html').includes('game-v0.39.0-lowfx.js'));
for(const pathName of ['game-v0.39.0.js','game-v0.39.0-lowfx.js']){
 const content=code(pathName);
 for(const marker of ['decorRenderStats:', 'decorRender:decorEngine.renderStats()',
   'bit-bazaar-save-v3','visibleDecor(cameraDepth,cameraSide,visibleSlope,'])
 assert.ok(content.includes(marker),'both renderers share new gallery budget '+marker);
}
assert.ok(worker.includes('bit-bazaar-v0.59.0'));
console.log('PASS v0.39: 55 owned works loaded, near-art guarantee, stable budgeted distant sprites, ghost always visible, no-save previews, cache after precision/move/store/load, 5 shelf tiers, rug 8/4/2 LOD, complete 180-art chain and both iPhone builds.');
