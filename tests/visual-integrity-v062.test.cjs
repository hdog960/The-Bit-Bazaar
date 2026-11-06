'use strict';
/* Bit Bazaar v0.62 — broad geometry audit. Original pixels, corrected visibility. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const window={};
vm.runInNewContext(read('assets/visibility-v0.62.js'),{window,Math,Number,Array,Object},{timeout:3000});
const V=window.BIT_BAZAAR_VISIBILITY;
assert.ok(V);
assert.equal(V.NEAR,.24);
// Segment/slab intersection, including the edge case where the rack's
// CENTRE lies behind a target but its *near face* is between camera and target.
assert.equal(V.slabSegment(-4,0,8,0,1,.5),true);
assert.equal(V.slabSegment(-4,0,3.5,0,1,.5),true);
assert.equal(V.slabSegment(-4,0,2,0,1,.5),false);
assert.equal(V.slabSegment(-4,1.5,8,0,1,.5),false,'parallel ray misses transverse side');
assert.equal(V.slabSegment(0,0,4,0,1,.5),true,'camera inside shelf must not see through it');
assert.equal(V.slabSegment(4,0,3,0,1,.5),false,'shelf behind camera cannot occlude');
assert.equal(V.slabSegment(-2,0,1,0,1,.5),false,'shelf starting at target endpoint cannot occlude');
assert.equal(V.slabSegment(-4,.1,8,0,1,.5),true);
const poly=[{side:-1,height:0,depth:-1},{side:1,height:0,depth:2},
 {side:1,height:4,depth:2},{side:-1,height:4,depth:-1}];
const clip=V.clipNear(poly);
assert.ok(clip.length>=3&&clip.length<=6);
assert.ok(clip.every(p=>p.depth>=.24&&Number.isFinite(p.side)&&Number.isFinite(p.height)));
assert.equal(V.clipNear(poly.map(p=>({...p,depth:-1}))).length,0);
assert.equal(V.clipNear(poly.map(p=>({...p,depth:5}))).length,4);
assert.equal(V.clipNear([]).length,0);
// Full original real 40 fixtures.
const fixtures=[];
for(let r=0;r<5;r++)for(let a=0;a<4;a++)
 fixtures.push({id:r*4+a,kind:'floor',x:11+a*16,z:11+r*12,
  w:7.7,depth:1.72,nx:0,nz:1,ux:1,uz:0});
const wall=[];
for(const x of [9,22,35,48,61])wall.push({x,z:2.5,nx:0,nz:1,ux:1,uz:0});
for(const x of [9,22,35,48,61])wall.push({x,z:71.5,nx:0,nz:-1,ux:-1,uz:0});
for(const z of [10,23,36,49,62])wall.push({x:2.5,z,nx:1,nz:0,ux:0,uz:-1});
for(const z of [10,23,36,49,62])wall.push({x:67.5,z,nx:-1,nz:0,ux:0,uz:1});
for(const [i,p] of wall.entries())fixtures.push({id:20+i,kind:'wall',w:10.5,depth:.85,...p});
assert.equal(fixtures.length,40);
const faceCamera=(f,back=false,distance=2)=>({
 x:f.x+f.nx*(f.depth/2+distance)*(back?-1:1),
 z:f.z+f.nz*(f.depth/2+distance)*(back?-1:1),
 yaw:Math.atan2(-f.nx*(back?-1:1),f.nz*(back?-1:1))
});
// Camera sees actual floor and wall fixtures, both shelf faces and
// near/touch distances. Angles must not produce empty/NaN projections.
let checked=0;
for(const f of fixtures){
 for(const distance of [.35,.7,1.4,3,6]){
  for(const back of (f.kind==='floor'?[false,true]:[false])){
   const p=faceCamera(f,back,distance);
   const shown=V.view(p,f,.25,36);
   assert.ok(shown,'fixture '+f.id+' near-face visibility at '+distance+' units'+(back?' reverse':''));
   assert.ok(Number.isFinite(shown.left)&&Number.isFinite(shown.right));
   assert.ok(shown.nearDepth>=V.NEAR);
   checked++;
  }
 }
}
// Repro: the old centre-depth cut (> -4) silently removed a wall shelf
// while its right-hand corner remained squarely in the camera's field.
const north=fixtures[20],edge={x:13.5,z:3.3,yaw:75*Math.PI/180};
const oldCenter=(north.x-edge.x)*Math.sin(edge.yaw)-(north.z-edge.z)*Math.cos(edge.yaw);
assert.ok(oldCenter< -4,'reproduction hits original faulty centre cull');
const visibleEdge=V.view(edge,north,.667,36);
assert.ok(visibleEdge,'near visible wall corner no longer disappears');
assert.ok(visibleEdge.nearDepth>=.24);
assert.equal(V.view({x:30,z:30,yaw:0},north,.15,10),null);
// Exterior/behind views must remain hidden: no ghost shelves rendered
// through camera back plane.
const backCamera={x:north.x,z:north.z+20,yaw:Math.PI};
assert.equal(V.view(backCamera,north,.667,36),null);
// Seven clipped billboard strips, preserving the visible portion at a
// grazing corner and avoiding a flat whole-sprite pop.
const p={x:0,z:0,yaw:0};
const mask=Array.from(V.figureSegments(p,{x:0,z:-4},2,q=>q.x>0,7));
assert.deepEqual(mask,[false,false,false,false,true,true,true]);
const blocker={vx:0,vz:-2,radius2:2};
assert.equal(V.edgeRisk(p,{x:0,z:-4},.55,[blocker]),true);
assert.equal(V.edgeRisk(p,{x:30,z:-4},.55,[blocker]),false);
assert.equal(V.edgeRisk(p,{x:0,z:-4},.55,[]),false);
assert.equal(V.figureSegments(p,{x:0,z:-4},.55,()=>true,3).length,3);
// Confirm both gameplay renderers use the exact same visibility logic,
// with original sprite atlas/materials and no save changes.
for(const path of ['game-v0.62.0.js','game-v0.62.0-lowfx.js']){
 const g=read(path);
 assert.match(g,/const VIS=window\.BIT_BAZAAR_VISIBILITY/);
 assert.match(g,/VIS\.slabSegment\(b\.camU,b\.camN,du,dn,b\.halfU,b\.halfN\)/);
 assert.match(g,/VIS\.clipNear\(\[a,b,c,d\]\)/);
 assert.match(g,/VIS\.view\(player,f,visibleSlope,36\)/);
 assert.match(g,/function clipShelfRow\(/);
 assert.match(g,/if\(clipShelfRow\(f,d\+facing\*\.075,y-\.025,y\+\.70\)\)/);
 assert.match(g,/VIS\.edgeRisk\(player,f,worldWidth,sightBlockers\)/);
 assert.match(g,/function beginFloorFigureMask\(/);
 assert.match(g,/if\(mask\)ctx\.restore\(\)/);
 assert.match(g,/geometryRender:\(pose,fixtureId\)=>/);
 assert.match(g,/geometryProbe:\(pose,fixtureId,point,exclude=-1\)=>/);
 assert.match(g,/const img=new Image\(\)/);
 assert.match(g,/ctx\.imageSmoothingEnabled=false/);
 assert.match(g,/const W=480, H=270, FOCAL=360/);
 assert.match(g,/const STORE_KEY='bit-bazaar-save-v3'/);
 assert.ok(!g.includes('function generateNewSprites'));
 const saved=g.slice(g.indexOf('function saveData(){'),g.indexOf('function save(){'));
 assert.ok(!saved.includes('VIS.')&&!saved.includes('visibility'),'no new save keys or visual state');
}
for(const h of ['index.html','preview-v0.62.0.html','baseline-v0.62.0-lowfx.html']){
 const page=read(h);
 assert.match(page,/assets\/visibility-v0\.62\.js/);
 assert.ok(page.indexOf('visibility-v0.62.js')<page.indexOf('game-v0.62.0'));
 assert.match(page,/style-v0\.62\.0\.css/);
}
assert.match(read('sw.js'),/bit-bazaar-v0\.62\.0/);
assert.match(read('sw.js'),/visibility-v0\.62\.js/);
assert.match(read('sw.js'),/game-v0\.61\.0\.js/,'last accepted build retained');
assert.equal(read('style-v0.62.0.css'),read('style-v0.61.0.css'),
 'aesthetic and presentation must be byte-for-byte unchanged');
console.log('PASS v0.62 geometric integrity: '+checked+' fixture poses, wall-corner old-cull reproduction, near-plane clipping, slab and partial-billboard occlusion, full/Low FX original 16-bit art, and unchanged save/CSS.');
