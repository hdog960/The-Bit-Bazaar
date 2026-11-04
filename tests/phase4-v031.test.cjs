'use strict';
// Bit Bazaar v0.31: isolated, reproducible browser-runtime contract tests.
// Run: node tests/phase4-v031.test.cjs (requires Node.js 18+).
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
// Use __dirname, not process.cwd(), so this works in GitHub Actions too.
const source=p=>fs.readFileSync(require('node:path').join(__dirname,'..',p),'utf8');
let saves=0,notifications=[],adjustResets=0,closes=0,drawCalls=0;
const slots=[
 {id:0,kind:'wall',name:'WEST WALL ONE',x:2,z:5,side:'WEST'},
 {id:1,kind:'wall',name:'WEST WALL TWO',x:3,z:5,side:'WEST'},
 {id:2,kind:'wall',name:'SOUTH WALL THREE',x:3,z:7,side:'SOUTH'},
 {id:3,kind:'floor',name:'FLOOR PAD ONE',x:4,z:9},
 {id:4,kind:'floor',name:'FLOOR PAD TWO',x:6,z:9}
];
const items=[
 {id:'moth',name:'Midnight Moth',category:'Framed Art',mount:'wall',art:'moth',price:2},
 {id:'owl',name:'Copper Owl',category:'Statues',mount:'floor',art:'owl',price:3},
 {id:'clock',name:'Clockwork Canvas',category:'Framed Art',mount:'wall',art:'clock',price:4}
];
const catalog={
 items,slots,quotas:[],
 texture:()=>({width:32,height:40}),
 thumbnail:()=>'/safe-thumbnail.png'
};
const win={BIT_BAZAAR_DECOR:catalog};
win.BIT_BAZAAR_WORKSHOP={create:()=>({
 snapshot:()=>[],resetAll:()=>{},load:()=>{},onStore:()=>{},
 onMove:()=>{adjustResets++;},
 pos:(id,slot)=>slots[slot],rotation:()=>0,
 tone:()=>0
})};
win.BIT_BAZAAR_ROOM={create:()=>({state:()=>({}),load:()=>{},reset:()=>{}})};
vm.runInNewContext(source('assets/decor-runtime-v0.31.js'),{window:win,Math,Set,Map,JSON,Array,Number});
assert.ok(win.BIT_BAZAAR_PHASE4,'v0.31 decoration runtime loads');
const api={
 isOpen:()=>false,
 save:()=>{saves++;},notify:message=>{notifications.push(message);},
 perfectCount:()=>0,blocked:()=>false,crowded:()=>false,
 snapshot:()=>({decor:{owned:['moth','owl','clock'],placed:[['moth',0],['owl',3],['clock',2]]}})
};
const runtime=win.BIT_BAZAAR_PHASE4.create(api);
runtime.load({decor:{owned:['moth','owl','clock'],placed:[['moth',0],['owl',3],['clock',2]]}});
const initial=JSON.stringify(runtime.state());
assert.equal(runtime.previewMove('not-owned',1),false,'must own artwork');
assert.equal(runtime.previewMove('owl',1),false,'must use compatible site');
assert.equal(runtime.previewMove('moth',0),false,'cannot preview its own site');
assert.equal(runtime.previewMove('moth',2),false,'occupied site rejected');
assert.equal(runtime.previewMove('moth',1),true,'valid available matching site');
assert.equal(JSON.stringify(runtime.state()),initial,'preview did not modify serialized save');
assert.equal(saves,0,'preview does not save');
assert.equal(runtime.previewState().destination,'WEST WALL TWO');
const visible=runtime.visibleDecor((x,z)=>z,()=>0,1);
assert.equal(visible.filter(v=>v.type==='decor-ghost').length,1,'a single preview ghost is rendered');
const ctx={
 globalAlpha:1,save(){},restore(){this.globalAlpha=1},transform(){},
 drawImage(){drawCalls++;},set imageSmoothingEnabled(v){}
};
const project=(x,z,h)=>({x,y:100-h*10,depth:5});
runtime.drawGhost('moth',1,project,ctx,0);
assert.equal(drawCalls,1,'ghost uses existing authored texture');
assert.equal(ctx.globalAlpha,1,'ghost opacity cannot leak to other draw calls');
assert.equal(runtime.cancelPreview(),true,'cancel works');
assert.equal(runtime.previewState(),null,'cancel removes ghost');
assert.equal(JSON.stringify(runtime.state()),initial,'cancel does not alter player save');
assert.equal(saves,0,'cancel does not cause a save');
assert.equal(runtime.previewMove('moth',1),true);
assert.equal(runtime.commitPreview(),true,'confirmed preview moves art');
assert.equal(saves,1,'confirm saves exactly once');
assert.equal(adjustResets,1,'moving invokes existing adjustment reset');
assert.equal(runtime.previewState(),null,'ghost clears after commit');
assert.equal(runtime.placedSlots().find(([id])=>id==='moth')[1],1,'mount changed correctly');
assert.equal(runtime.ownedIds().length,3,'ownership remains unchanged');
const mapWin={};
vm.runInNewContext(source('assets/decor-map-v0.31.js'),{window:mapWin,Math,Number,Map,Array});
const map=mapWin.BIT_BAZAAR_DECOR_MAP.create({
 catalog,getPlaced:()=>runtime.placedSlots(),
 setDestination:()=>{throw Error('unexpected purchase selector during relocation');},
 returnToCatalog:()=>{},
 previewOwned:(id,slot)=>runtime.previewMove(id,slot),
 moveOwned:(id,slot)=>runtime.move(id,slot),
 closePlanner:()=>{closes++;}
});
assert.equal(map.beginMove('clock'),true,'existing installed wall art can be selected');
assert.equal(map.choose(1),true,'map can select a compatible but occupied pin');
assert.equal(map.previewSelected(),false,'occupied map pin cannot preview');
assert.equal(map.choose(2),true,'can choose origin pin');
assert.equal(map.previewSelected(),false,'origin cannot be preview destination');
assert.equal(map.choose(0),true,'free wall pin available after first move');
const countBefore=saves;
assert.equal(map.previewSelected(),true,'map passes preview into the world');
assert.equal(map.moving(),false,'map relocation session clears');
assert.equal(closes,1,'map drawer closes to show the world');
assert.equal(saves,countBefore,'entering preview from map is read-only');
assert.equal(runtime.previewState().id,'clock','world receives correct artwork');
runtime.cancelPreview();
assert.equal(saves,countBefore,'cancelled map preview does not write');
assert.equal(map.beginMove('clock'),true);
assert.equal(map.choose(0),true);
assert.equal(map.useSelected(),true,'direct move remains backwards compatible');
assert.equal(saves,countBefore+1,'direct move saves once');
assert.equal(runtime.ownedIds().length,3);
console.log('PASS 27 checks: preview contracts, map flow, destination safety, no-save cancel, save-on-commit, draw opacity, ownership.');