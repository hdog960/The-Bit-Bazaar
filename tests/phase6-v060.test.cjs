'use strict';
/* Bit Bazaar v0.60 Phase 6.6 — true canvas photos and physical overhead snapshot. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const w={};
vm.runInNewContext(read('assets/showcase-v0.60.js'),{window:w,
 Math,Number,Array,Object,Set,Promise,document:{createElement(){return null;}}},{timeout:3000});
const m=w.BIT_BAZAAR_SHOWCASE;
assert.ok(m);
assert.equal(m.WIDTH,760);
assert.equal(m.HEIGHT,900);
const blank=()=>Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
const full=()=>Array.from({length:60},(_,face)=>Array.from({length:5},(_,r)=>
 Array.from({length:10},(_,slot)=>(face*5+r)*10+slot)));
let slots=blank(),data=m.metrics(slots);
assert.equal(data.shelved,0);assert.equal(data.perfect,0);
assert.equal(data.assigned,0);assert.equal(data.unsorted,0);
slots=full();data=m.metrics(slots);
assert.equal(data.shelved,3000);
assert.equal(data.perfect,300);
assert.equal(data.assigned,300);
assert.equal(data.unsorted,0);
slots[0][0]=[1,0,2,3,4,5,6,7,8,9];
slots[1][0]=[null,50,51,52,53,54,55,56,57,58];
data=m.metrics(slots);
assert.equal(data.shelved,2999);
assert.equal(data.perfect,298);
assert.equal(data.assigned,300);
assert.equal(data.unsorted,1);
assert.equal(data.faces[0].perfect,4);
assert.equal(data.faces[1].shelved,49);
const pose={yaw:Math.PI-.03,pitch:.15},target={yaw:-Math.PI+.07,pitch:-.32};
const smooth=m.ease(pose,target,.016);
assert.ok(smooth.yaw>pose.yaw,'shortest turn across angle wrap');
assert.ok(smooth.yaw-pose.yaw<.03,'camera gently eases, never jumps');
assert.ok(smooth.pitch<pose.pitch&&smooth.pitch>target.pitch);
assert.equal(m.ease({yaw:0,pitch:0},{yaw:1,pitch:1},0).pitch,0);
assert.equal(m.ease({yaw:0,pitch:0},{yaw:1,pitch:1},1).pitch<.95,true);
const ops=[],ctx={
 fillStyle:'',strokeStyle:'',lineWidth:1,font:'',textAlign:'',imageSmoothingEnabled:true,
 fillRect(...args){ops.push(['rect',...args]);},
 fillText(...args){ops.push(['text',...args]);},
 save(){ops.push(['save'])},restore(){ops.push(['restore'])},
 translate(...args){ops.push(['translate',...args])},
 transform(...args){ops.push(['transform',...args])},
 rotate(...args){ops.push(['rotate',...args])},
 beginPath(){},moveTo(){},lineTo(){},closePath(){},stroke(){},fill(){}
};
const fixtures=[
 ...Array.from({length:20},(_,id)=>({
  id,kind:'floor',x:11+(id%4)*16,z:11+Math.floor(id/4)*12,
  ux:1,uz:0,nx:0,nz:1,w:7.7,depth:1.72})),
 ...Array.from({length:20},(_,i)=>{
  const id=20+i;
  return {id,kind:'wall',x:i%2?68:2,z:7+Math.floor(i/2)*7,
   ux:0,uz:1,nx:-1,nz:0,w:10.5,depth:.85};
 })
];
const canvas={width:0,height:0,getContext(){return ctx;}};
const input={fixtures,slots:full(),faceCleaning:Array(60).fill(3),
 player:{x:35,z:68,yaw:.2},decor:[{id:1,site:{x:30,z:24}},
 {id:2,site:{x:35,z:40}}]};
const snapshot=JSON.stringify(input);
const drawn=m.renderOverhead(canvas,input);
assert.equal(canvas.width,760);
assert.equal(canvas.height,900);
assert.equal(drawn.perfect,300);
assert.equal(drawn.shelved,3000);
assert.equal(drawn.installedArt,2);
assert.ok(ops.filter(x=>x[0]==='transform').length>=40,'real 40 fixtures drawn');
assert.ok(ops.some(x=>x[0]==='text'&&String(x[1]).includes('3,000 ON SHELVES')));
assert.ok(ops.some(x=>x[0]==='text'&&String(x[1]).includes('ENTRANCE')));
assert.equal(JSON.stringify(input),snapshot,'overhead renders state without mutating the store');
const sizes=[],world={width:480,height:270},fakeContext={
 imageSmoothingEnabled:true,drawImage(...args){sizes.push(args)}
};
const env={window:{},Math,Number,Array,Object,Set,Promise,
 document:{createElement(tag){
  assert.equal(tag,'canvas');
  return {width:0,height:0,getContext(){return fakeContext;}};
 }}};
vm.runInNewContext(read('assets/showcase-v0.60.js'),env,{timeout:3000});
const photo=env.window.BIT_BAZAAR_SHOWCASE.makePhotoCanvas(world);
assert.equal(photo.width,960);assert.equal(photo.height,540);
assert.equal(fakeContext.imageSmoothingEnabled,false);
assert.equal(sizes.length,1);
assert.equal(sizes[0][3],960);assert.equal(sizes[0][4],540);
assert.equal(env.window.BIT_BAZAAR_SHOWCASE.makePhotoCanvas({width:1,height:2}),null);
const png={size:5000,type:'image/png'};
env.window.BIT_BAZAAR_SHOWCASE.pngBlob({toBlob(cb,type){assert.equal(type,'image/png');cb(png)}})
 .then(blob=>assert.equal(blob,png));
for(const file of ['game-v0.60.0.js','game-v0.60.0-lowfx.js']){
 const g=read(file);
 assert.match(g,/const SHOWCASE=window\.BIT_BAZAAR_SHOWCASE/);
 assert.match(g,/function openShowcase\(\)/);
 assert.match(g,/function closeShowcase\(\)/);
 assert.match(g,/function toggleShowcaseView\(\)/);
 assert.match(g,/function showcaseCaptureBlob\(\)/);
 assert.match(g,/async function shareShowcasePhoto\(\)/);
 assert.match(g,/SHOWCASE\.ease\(player,showcaseAim,dt\)/);
 assert.match(g,/if\(showcaseActive\)return;/);
 assert.match(g,/if\(!showcaseActive\)updateFocus\(\)/);
 assert.match(g,/if\(!showcaseActive\)drawCleanFlash\(\)/);
 assert.match(g,/if\(glassesEquipped&&!showcaseActive\)/);
 assert.match(g,/player:showcaseReturnPose\?\{\.\.\.showcaseReturnPose\}:player/);
 assert.match(g,/showcaseCaptureBlob:showcaseCaptureBlob/);
 const saved=g.slice(g.indexOf('function saveData(){'),g.indexOf('function save(){'));
 assert.match(saved,/version:1/);
 assert.ok(!saved.includes('showcaseActive')&&!saved.includes('showcaseOverhead'),'no showcase save fields');
}
for(const page of ['preview-v0.60.0.html','baseline-v0.60.0-lowfx.html']){
 const h=read(page);
 for(const id of ['showcaseBtn','showcaseBar','showcaseExit','showcaseView',
  'showcaseCapture','showcaseOverhead','showcaseOverheadCanvas','showcaseStatus']){
  assert.match(h,new RegExp('id="'+id+'"'));
 }
 assert.ok(h.indexOf('assets/showcase-v0.60.js')<h.indexOf('game-v0.60.0'));
 assert.match(h,/style-v0\.60\.0\.css/);
}
assert.match(read('index.html'),/sw\.js\?v=0\.61\.0/);
assert.match(read('sw.js'),/bit-bazaar-v0\.61\.0/);
assert.match(read('sw.js'),/assets\/showcase-v0\.60\.js/);
assert.match(read('sw.js'),/game-v0\.59\.0\.js/,'retains v0.59 rollback');
assert.match(read('style-v0.60.0.css'),/#game\.showcase-active #topbar/);
console.log('PASS Phase 6.6: 300 real shelf row accounting, handcrafted overhead drawing of forty actual fixtures and installed art, no leaked loose locations, smooth angle-wrapped camera, 2x pixel-perfect photo, valid PNG export, no added save fields, Full/Low FX and v0.59 rollback.');
