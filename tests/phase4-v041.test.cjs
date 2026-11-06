'use strict';
/* Bit Bazaar v0.41: native-pixel partial artwork clipping and exposed-only
 * inspection. Regression: full hidden, partial near art, far center-only,
 * original 180/232 save format, rugs, ceiling, world ghosts and Low FX. */
const assert=require('node:assert/strict'),fs=require('node:fs'),
 path=require('node:path'),vm=require('node:vm');
const code=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const window={},context=vm.createContext({window,Map,Set,Math,Object,Array,Number,JSON});
const modules=['assets/decor-workshop-v0.38.js',
 'assets/decor-visibility-v0.41.js','assets/decor-world-v0.41.js'];
for(const p of modules)vm.runInContext(code(p),context,{timeout:3000,filename:p});
const items=[
 {id:'floor-a',name:'Partially Shrouded Statue',mount:'floor',category:'Statues'},
 {id:'floor-b',name:'Distant Sculpture',mount:'floor',category:'Statues'},
 {id:'lamp',name:'Suspended Mobile',mount:'ceiling',category:'Ceilings'},
 {id:'rug',name:'Woven Carpet',mount:'rug',category:'Rugs'},
 {id:'endcap',name:'Endcap Painting',mount:'wall',category:'Framed Art'}
];
const slots=[
 {id:0,kind:'floor',x:0,z:6,name:'Left Floor'},
 {id:1,kind:'floor',x:4,z:18,name:'Far Floor'},
 {id:2,kind:'ceiling',x:0,z:8,name:'Hanging'},
 {id:3,kind:'rug',x:0,z:11,name:'Carpet'},
 {id:4,kind:'wall',profile:'endcap',side:'WEST',fixtureId:27,x:10,z:6,name:'Endcap'},
 {id:5,kind:'floor',x:0,z:9,name:'Open Floor'},
 {id:6,kind:'floor',x:50,z:30,name:'Extra Floor'}
];
const catalog={items,slots,quotas:[],texture:id=>({
 width:id==='rug'?40:32,height:id==='rug'?28:40
}),thumbnail:()=>'/mock.png'};
window.BIT_BAZAAR_DECOR=catalog;
window.BIT_BAZAAR_ROOM={create:()=>({
 state:()=>[],load:()=>{},reset:()=>{},render:()=>'',bind:()=>{}
})};
vm.runInContext(code('assets/decor-runtime-v0.41.js'),context,{timeout:3000,filename:'runtime'});
let saves=0,blocking=p=>p.x>-.1;
let camera={x:-2,z:6,yaw:0};
const eye=window.BIT_BAZAAR_DECOR_VISIBILITY.create({
 catalog,getCamera:()=>camera,isBlocked:(p)=>blocking(p)
});
const B=a=>JSON.parse(JSON.stringify(a));
const mask=eye.bands('floor-a',0,slots[0],0,0);
assert.deepEqual(B(mask),[true,true,false,false],
 'left half physically visible while right half obscured');
assert.equal(eye.hidden('floor-a',0,slots[0]),true,
 'center-based v0.40 algorithm would incorrectly erase the whole piece');
assert.equal(eye.exposed('floor-a',0,slots[0],.2,0,0),true);
assert.equal(eye.exposed('floor-a',0,slots[0],.8,0,0),false);
camera={x:12,z:6,yaw:0};
assert.deepEqual(B(eye.bands('endcap',4,slots[4],0,0)),[false,false,false,false],
 'the back of a solid endcap remains fully hidden');
camera={x:-2,z:6,yaw:0};
assert.equal(eye.bands('endcap',4,slots[4],0,0).some(Boolean),false,
 'other solid shelves may still obstruct the front face');
const placed=[['floor-a',0],['floor-b',1],['lamp',2],['rug',3]];
const rt=window.BIT_BAZAAR_PHASE4.create({
 isOpen:()=>false,save:()=>saves++,notify:()=>{},perfectCount:()=>0
});
rt.load({decor:{owned:items.map(i=>i.id),placed,adjustments:[],room:[]}});
const before=JSON.stringify(rt.state());
const depth=(x,z)=>z,side=()=>0;
const visible=rt.visibleDecor(depth,side,2,8,eye.hidden,eye.bands,0);
const part=visible.find(x=>x.itemId==='floor-a');
assert.ok(part,'visible left half survives even though center is blocked');
assert.deepEqual(B(part.bands),[true,true,false,false]);
assert.equal(rt.renderStats().partiallyVisible>0,true);
assert.equal(rt.renderStats().hiddenByFixtures>=0,true);
assert.ok(!visible.some(x=>x.itemId==='floor-b'),
 'far pieces use the cheaper center ray; blocked center stays hidden');
assert.equal(JSON.stringify(rt.state()),before,'render masks cannot change art ownership');
assert.equal(saves,0,'visibility and culling never save');
const project=(x,z,height)=>({x:240+(x+.5)*20,y:135+(1.2-height)*20,depth:z});
const ctx={
 calls:[],imageSmoothingEnabled:false,globalAlpha:1,
 save(){},restore(){},transform(){},drawImage(...args){this.calls.push(args);}
};
rt.draw('floor-a',0,project,ctx,0,false,part.bands);
assert.equal(ctx.calls.length,2,'partial billboard uses two exposed pixel columns');
for(const args of ctx.calls)assert.equal(args.length,9,'source/destination image rectangles');
assert.equal(ctx.calls[0][1],0);assert.equal(ctx.calls[1][1],8);
ctx.calls.length=0;
rt.draw('floor-a',0,project,ctx,0,false,null);
assert.equal(ctx.calls.length,1,'fully visible art remains one inexpensive drawImage');
assert.equal(ctx.calls[0].length,3);
ctx.calls.length=0;
rt.draw('lamp',2,project,ctx,0,false,mask);
assert.equal(ctx.calls.length,2,'ceiling mobiles use the same partial pixel clipping');
ctx.calls.length=0;
rt.draw('rug',3,project,ctx,0,false,mask);
assert.equal(ctx.calls.length,16,'near 8-depth-slice rug keeps only two exposed width lanes');
ctx.calls.length=0;
rt.draw('rug',3,project,ctx,0,false,null);
assert.equal(ctx.calls.length,8,'unoccluded carpet retains original 8 textured strips');
assert.equal(rt.previewMove('floor-a',5),true);
const ghost=rt.visibleDecor(depth,side,2,8,eye.hidden,eye.bands,0)
 .find(x=>x.type==='decor-ghost');
assert.ok(ghost,'a partly visible relocation preview must not disappear');
assert.deepEqual(B(ghost.bands),[true,true,false,false]);
ctx.calls.length=0;
rt.drawGhost('floor-a',5,project,ctx,0,ghost.bands);
assert.equal(ctx.calls.length,2,'preview uses the same native pixels and clipping');
assert.equal(rt.renderStats().partialGhost,true);
assert.equal(saves,0,'ghost drawing never writes a save');
assert.equal(rt.cancelPreview(),true);
assert.equal(JSON.stringify(rt.state()),before,'cancel preserves every installed artwork');
blocking=()=>true;
assert.deepEqual(B(eye.bands('floor-a',0,slots[0])),[false,false,false,false]);
const noArt=rt.visibleDecor(depth,side,2,8,eye.hidden,eye.bands,0);
assert.equal(noArt.length,0,'fully blocked decorations never render through shelves');
assert.equal(rt.renderStats().hiddenByFixtures,4);
blocking=()=>false;
const all=rt.visibleDecor(depth,side,2,8,eye.hidden,eye.bands,0);
assert.equal(all.length,4,'every clear installed art remains visible');
assert.equal(all.every(e=>e.bands===null),true,'no partial drawing overhead for clear artwork');
assert.equal(saves,0);
blocking=p=>p.x>-.1;
let visualOffset=.5;
const world=window.BIT_BAZAAR_DECOR_WORLD.create({
 catalog,getPlaced:()=>[['floor-a',0]],position:()=>slots[0],
 project:(x,z,h)=>({x:240+(x+visualOffset)*20,
  y:135+(1.2-h)*20,depth:z}),
 camera:()=>camera,rotation:()=>0,
 canSee:(id,site,p,hit)=>eye.exposed(id,site.id,p,hit.u,0,0)
});
assert.equal(world.find()?.itemId,'floor-a',
 'reticle over an exposed left section opens that real decoration');
visualOffset=-.5;
assert.equal(world.find(),null,
 'reticle over a shelf-hidden section does not target invisible artwork');
// Stable save representation retained, no destructive migration.
rt.load({decor:rt.state()});
assert.equal(rt.state().owned.length,5);
assert.equal(rt.state().placed.length,4);
assert.equal(saves,0);
const html=code('preview-v0.41.0.html'),sw=code('sw.js');
for(const p of ['assets/decor-visibility-v0.41.js','assets/decor-runtime-v0.41.js',
 'assets/decor-world-v0.41.js','game-v0.41.0.js','style-v0.41.0.css'])
 assert.ok(html.includes('./'+p),'archived v0.41 preview loads '+p);
for(const p of ['assets/decor-visibility-v0.41.js','assets/decor-runtime-v0.41.js',
 'assets/decor-world-v0.41.js'])
 assert.ok(sw.includes('./'+p),'active build still depends on '+p);
assert.ok(html.indexOf('decor-visibility-v0.41.js')<html.indexOf('game-v0.41.0.js'));
assert.ok(code('baseline-v0.41.0-lowfx.html').includes('game-v0.41.0-lowfx.js'));
for(const p of ['game-v0.41.0.js','game-v0.41.0-lowfx.js']){
 const s=code(p);
 for(const q of ['decorSight.exposed(id,site.id,pos,','decorSight.hidden,decorSight.bands,player.yaw',
  'false,e.bands)','ctx,player.yaw,e.bands)','bit-bazaar-save-v3'])
 assert.ok(s.includes(q),p+' must wire matching visual and inspection masks '+q);
}
assert.ok(sw.includes('bit-bazaar-v0.53.0'));
console.log('PASS v0.41: partial world artwork visible and reticle-targetable, hidden columns never drawn, full occlusion culls, near rug/ceiling/ghosts clipped, far art stays efficient, no save changes, both mobile engines wired.');
