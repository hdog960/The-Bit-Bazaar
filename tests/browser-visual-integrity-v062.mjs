// Bit Bazaar v0.62 — full mobile WebKit visual rendering audit.
// 40 fixtures, both sides of 20 floor racks, close/medium/angled poses,
// real canvas pixel checks, actual shelf occlusion and reproducible PNGs.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {webkit} from 'playwright';
const root=process.env.BIT_BAZAAR_TEST_URL||'http://127.0.0.1:4173/';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},
 isMobile:true,hasTouch:true,deviceScaleFactor:2});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().startsWith(root)&&r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url());});
const artifacts='tests/visual-artifacts';
await fs.mkdir(artifacts,{recursive:true});
async function ready(p=page){
 await p.waitForFunction(()=>window.BitBazaarQA?.geometryRender&&
  window.BitBazaarQA?.geometryProbe&&window.BitBazaarSaveTools?.validate,
  undefined,{timeout:45000});
 assert.equal(await p.locator('#bootRecovery').evaluate(el=>el.hidden),true);
}
async function frame(p,fixture,pose,file=null){
 const sample=await p.evaluate(({fixture,pose,file})=>{
  const qa=window.BitBazaarQA;
  const stats=qa.geometryRender(pose,fixture);
  const png=file?document.getElementById('world').toDataURL('image/png'):null;
  return {stats,png};
 },{fixture,pose,file});
 if(file){
  assert.match(sample.png,/^data:image\/png;base64,/);
  await fs.writeFile(artifacts+'/'+file,Buffer.from(sample.png.split(',')[1],'base64'));
 }
 return sample.stats;
}
try{
 await page.goto(root,{waitUntil:'domcontentloaded'});
 await ready();
 // Isolated full original dataset, with one actually populated front and
 // reverse rack and one north wall shelf. No developer test touches a user save.
 await page.evaluate(()=>{
  const qa=window.BitBazaarQA,s=qa.snapshotNow();
  const put=(face,ids)=>{
   s.rows[face][0]=ids;
   s.slots[face][0]=[...ids];
  };
  put(0,Array.from({length:10},(_,i)=>i));
  put(1,Array.from({length:10},(_,i)=>10+i));
  put(40,Array.from({length:10},(_,i)=>30+i));
  s.cleaning=Array(60).fill(3);
  s.floorCleaning=Array.from({length:45},(_,i)=>[1,2,3][(i*7+Math.floor(i/5)*2)%3]);
  s.revealed=qa.hiddenIds();
  s.seenFigures=Array.from({length:20},(_,i)=>i).concat(
   Array.from({length:10},(_,i)=>i+30));
  window.BitBazaarSaveTools.validate(s);
  window.BitBazaarSaveHold=true;
  localStorage.setItem('bit-bazaar-save-v3',JSON.stringify(s));
 });
 await page.reload({waitUntil:'domcontentloaded'});await ready();
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 const figures=await page.evaluate(()=>window.BitBazaarQA.stats());
 assert.equal(figures.placed,30);
 assert.equal(figures.displayFaces,60);
 assert.equal(figures.distinctAssets,3000);
 await page.locator('#startBtn').click();
 const data=await page.evaluate(()=>{
  const f=window.BitBazaarQA.shelves.map(s=>s.fixture);
  return [...new Map(f.map(x=>[x.id,x])).values()];
 });
 assert.equal(data.length,40);
 const poseFor=(f,face,dist=1.4,tilt=0,angle=0)=>{
  const normalX=f.nx*face,normalZ=f.nz*face;
  return {x:f.x+normalX*(f.depth/2+dist),
   z:f.z+normalZ*(f.depth/2+dist),
   yaw:Math.atan2(-normalX,normalZ)+angle,pitch:tilt};
 };
 const before=JSON.stringify(await page.evaluate(()=>window.BitBazaarQA.snapshotNow()));
 let poses=0,wallViews=0;
 // Each display face must remain visible after near-plane clipping, with
 // a genuinely colored shelf-body region drawn on the ORIGINAL canvas.
 for(const f of data){
  for(const face of (f.kind==='floor'?[1,-1]:[1])){
   for(const dist of [.38,.75,1.5,3.8]){
    const pose=poseFor(f,face,dist);
    const result=await frame(page,f.id,pose);
    poses++;
    assert.ok(result.visible,'shelf vanished id='+f.id+' face='+face+' distance='+dist);
    assert.ok(result.colors>=6,'broken/blank texture id='+f.id+' '+dist+' colors='+result.colors);
    assert.ok(result.nonzero>=100,'almost entirely black frame id='+f.id);
    assert.ok(result.shelfPixels>4,'physical shelf face missing at id='+f.id+
     ' face='+face+' distance='+dist+' pixel count='+result.shelfPixels);
    assert.ok(Number.isFinite(result.nearDepth));
    if(f.kind==='wall')wallViews++;
   }
  }
 }
 // Follow up with angle sweeps near the front, where the old rigid
 // center-based cull and near-plane billboard cut produced disappearing art.
 const exemplar=data[0];
 for(const d of [.38,.7,1.4,2.5]){
  for(const angle of [-.65,-.4,-.2,0,.2,.4,.65]){
   const pose=poseFor(exemplar,1,d,0,angle);
   const res=await frame(page,exemplar.id,pose);
   assert.ok(res.visible,'edge angle shelf disappeared d='+d+' yawOffset='+angle);
   assert.ok(res.colors>5,'edge angle blank frame');
   poses++;
  }
 }
 // Specific north-wall corner where old center-depth threshold (< -4)
 // incorrectly removed a visible wall shelf end during aisle turns.
 const exact={x:13.5,z:3.3,yaw:75*Math.PI/180,pitch:0};
 const old=await page.evaluate(p=>window.BitBazaarQA.geometryProbe(p,20,null),exact);
 assert.ok(old.centerDepth< -4,'reproduces original invisibility condition');
 assert.equal(old.visible,true,'wall shelf end must survive corner culling');
 const corner=await frame(page,20,exact,'wall-near-corner.png');
 assert.ok(corner.visible);
 assert.ok(corner.shelfPixels>2,'corner should actually paint shelf material');
 for(const [id,name,face,dist,angle] of [
  [0,'rack-front-close.png',1,.45,0],
  [0,'rack-reverse-close.png',-1,.45,0],
  [0,'rack-front-angle.png',1,.85,.50],
  [20,'wall-display-close.png',1,.55,0],
  [0,'rack-front-medium.png',1,3.8,0]
 ]){
  const res=await frame(page,id,poseFor(data[id],face,dist,0,angle),name);
  assert.ok(res.shelfPixels>4,'reference screenshot missing shelf '+name);
 }
 // A ray crossing *any* of the real 20 double-sided racks must hide
 // real floor figurines behind it. No ghost pickup reticle through solids.
 for(const f of data.filter(f=>f.kind==='floor')){
  const pose=poseFor(f,1,2.1);
  const behind={x:f.x-f.nx*(f.depth/2+2),z:f.z-f.nz*(f.depth/2+2)};
  const blocked=await page.evaluate(({pose,id,behind})=>
   window.BitBazaarQA.geometryProbe(pose,id,behind),{pose,id:f.id,behind});
  assert.equal(blocked.blocked,true,'figurine visible through rack '+f.id);
  const excluded=await page.evaluate(({pose,id,behind})=>
   window.BitBazaarQA.geometryProbe(pose,id,behind,id),{pose,id:f.id,behind});
  assert.equal(excluded.blocked,false,'own shelf exclusion should be respected');
 }
 // Looking steeply up/down should never erase the world or crash projection.
 for(const pitch of [-.8,-.45,.45,.8]){
  const result=await frame(page,0,poseFor(exemplar,1,1.5,pitch));
  assert.ok(result.colors>=4,'pitch '+pitch+' broke renderer');
 }
 // A QA camera sweep must not move the real collector or touch save fields.
 const after=JSON.stringify(await page.evaluate(()=>window.BitBazaarQA.snapshotNow()));
 assert.equal(after,before,'render probes are entirely nonmutating');
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 // Low FX is a separate engine, not a reference to a screenshot from full FX.
 const low=await context.newPage();
 low.on('pageerror',e=>errors.push('Low FX '+e.message));
 await low.goto(new URL('baseline-v0.62.0-lowfx.html',root).href,{waitUntil:'domcontentloaded'});
 await ready(low);
 await low.locator('#startBtn').click();
 for(const [id,name,pose] of [
  [0,'lowfx-rack-close.png',poseFor(exemplar,1,.48)],
  [0,'lowfx-rack-angle.png',poseFor(exemplar,1,1.3,0,.55)],
  [20,'lowfx-wall-corner.png',exact]
 ]){
  const res=await frame(low,id,pose,name);
  assert.ok(res.visible);
  assert.ok(res.shelfPixels>2,'Low FX shelf pixels missing '+name);
 }
 await low.waitForFunction(()=>window.BitBazaarQA.stats().renderFrames>3);
 assert.ok((await low.evaluate(()=>window.BitBazaarQA.stats().sprites.cacheSize))<=112);
 assert.equal((await low.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 await low.close();
 assert.deepEqual(errors,[]);
 console.log('PASS v0.62 WebKit visual integrity: '+poses+' face/angle poses, '+wallViews+
  ' wall views, exact old bug reproduction fixed, '+20+
  ' full-rack figure occlusion rays, eight real pixel-art screenshots, pitch sweeps, 3000-figure ledger, unchanged save and Low FX.');
}finally{
 await browser.close();
}
