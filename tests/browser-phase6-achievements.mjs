// Phase 6.3 — mobile WebKit acceptance for thirty authored achievements.
// Disposable synthetic saves, real store interaction and Low FX verification.
import assert from 'node:assert/strict';
import {webkit} from 'playwright';
const root=process.env.BIT_BAZAAR_TEST_URL||'http://127.0.0.1:4173/';
const KEY='bit-bazaar-save-v3';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({
 viewport:{width:390,height:844},isMobile:true,hasTouch:true,
 deviceScaleFactor:2,acceptDownloads:true
});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
async function ready(){
 await page.waitForFunction(()=>window.BitBazaarQA?.achievementsState&&
  window.BitBazaarSaveTools?.validate,undefined,{timeout:45000});
 assert.equal(await page.locator('#bootRecovery').evaluate(el=>el.hidden),true);
}
async function fixture({perfect=false,history=null}={}){
 await page.evaluate(({perfect,history,key})=>{
  const s=window.BitBazaarQA.snapshotNow(),hidden=window.BitBazaarQA.hiddenIds();
  s.cleaning=Array(60).fill(3);
  s.floorCleaning=Array.from({length:45},(_,i)=>
   [1,2,3][(i*7+Math.floor(i/5)*2)%3]);
  s.revealed=hidden;
  s.lifetimePerfect=Array.from({length:300},(_,i)=>i);
  s.seenFigures=Array.from({length:3000},(_,i)=>i);
  s.pinnedSets=[];s.trackedSetId=null;
  s.glassesEquipped=false;s.honorTrim=0;s.ground=[];s.tote=[];s.selected=null;
  s.achievementData=history||{earned:[],unordered:[],sacrificed:[],marks:[]};
  if(perfect){
   s.rows=Array.from({length:60},(_,f)=>Array.from({length:5},(_,r)=>
    Array.from({length:10},(_,i)=>(f*5+r)*10+i)));
   s.slots=s.rows.map(face=>face.map(line=>[...line]));
  }else{
   s.rows=Array.from({length:60},()=>Array.from({length:5},()=>[]));
   s.slots=Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
  }
  window.BitBazaarSaveTools.validate(s);
  window.BitBazaarSaveHold=true;
  localStorage.setItem(key,JSON.stringify(s));
 },{perfect,history,key:KEY});
 await page.reload({waitUntil:'domcontentloaded'});
 await ready();
}
try{
 await page.goto(root,{waitUntil:'domcontentloaded'});
 await ready();
 const first=await page.evaluate(()=>window.BitBazaarQA.achievementsState());
 assert.equal(first.total,30);
 assert.equal(first.earned,0);
 await page.locator('#startBtn').click();
 await page.locator('#achievementBtn').click();
 const details=page.locator('#achievementDetails');
 assert.equal(await details.evaluate(el=>el.open),true);
 const gallery=page.locator('#achievementGallery');
 await gallery.waitFor({state:'visible'});
 assert.equal(await gallery.locator('.achievement-medal').count(),30);
 assert.equal(await gallery.locator('.achievement-earned').count(),0);
 await gallery.locator('[data-achievement-filter="earned"]').click();
 assert.equal(await gallery.locator('.achievement-medal').count(),0);
 await gallery.locator('[data-achievement-filter="locked"]').click();
 assert.equal(await gallery.locator('.achievement-medal').count(),30);
 await gallery.locator('[data-achievement-filter="all"]').click();
 // Existing saved historical progress earns only verifiable achievements,
 // never synthetic event-only swap, wrong-then-repaired or restored sacrifice.
 await fixture({perfect:true});
 let a=await page.evaluate(()=>window.BitBazaarQA.achievementsState());
 assert.equal(a.earned,18);
 for(const id of ['complete-archive','all-shelves','hidden-all','perfect-bazaar',
  'full-inventory','cowards-choice']){
  assert.equal(a.medals.find(m=>m.id===id).earned,true,id);
 }
 for(const id of ['fix-wrong','swap','sacrificed-and-restored','coward-worn']){
  assert.equal(a.medals.find(m=>m.id===id).earned,false,'no false history for '+id);
 }
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 await page.locator('#startBtn').click();
 await page.locator('#achievementBtn').click();
 assert.equal(await gallery.locator('.achievement-medal').count(),30);
 assert.equal(await gallery.locator('.achievement-earned').count(),18);
 assert.equal(await page.locator('#achievementBtn').textContent(),'✦ MEDALS · 18/30');
 // Real one-in-hand swap through live game API, not an invented save marker.
 await page.locator('#closeDrawer').click();
 await page.evaluate(()=>{
  const qa=window.BitBazaarQA;
  if(!qa.takeFromSlot(0,0,0)||!qa.directPlace(0,0,1))
   throw Error('Real shelf swap did not occur');
 });
 a=await page.evaluate(()=>window.BitBazaarQA.achievementsState());
 assert.equal(a.medals.find(m=>m.id==='swap').earned,true);
 assert.equal(a.earned,19);
 const audit=await page.evaluate(()=>window.BitBazaarQA.figureIntegrity());
 assert.equal(audit.ok,true,JSON.stringify(audit.issues?.slice(0,3)));
 assert.equal(audit.total,3000);
 await page.reload({waitUntil:'domcontentloaded'});
 await ready();
 a=await page.evaluate(()=>window.BitBazaarQA.achievementsState());
 assert.equal(a.medals.find(m=>m.id==='swap').earned,true,'swap medal survives browser reload');
 const prior=await page.evaluate(()=>window.BitBazaarQA.achievementRaw());
 await fixture({perfect:false,history:prior});
 a=await page.evaluate(()=>window.BitBazaarQA.achievementsState());
 assert.equal(a.medals.find(m=>m.id==='perfect-bazaar').earned,true,
  'earned perfect shop medal survives later voluntary scattering');
 assert.equal(a.t.perfect,0);
 assert.equal(a.medals.find(m=>m.id==='swap').earned,true);
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 const rejects=await page.evaluate(()=>{
  const raw=window.BitBazaarQA.snapshotNow();
  raw.achievementData.earned.push('forged-achievement');
  try{window.BitBazaarSaveTools.validate(raw);return false}
  catch(e){return /Invalid achievement history/.test(String(e.message));}
 });
 assert.equal(rejects,true,'invalid achievement history cannot be imported');
 const low=await context.newPage();
 low.on('pageerror',e=>errors.push('Low FX: '+e.message));
 await low.goto(new URL('baseline-v0.57.0-lowfx.html',root).href,
  {waitUntil:'domcontentloaded'});
 await low.waitForFunction(()=>window.BitBazaarQA?.achievementsState,undefined,{timeout:45000});
 const lowMedals=await low.evaluate(()=>window.BitBazaarQA.achievementsState());
 assert.equal(lowMedals.total,30);
 assert.equal(lowMedals.medals.find(m=>m.id==='swap').earned,true);
 assert.equal(lowMedals.medals.find(m=>m.id==='perfect-bazaar').earned,true);
 await low.locator('#startBtn').click();
 await low.waitForFunction(()=>window.BitBazaarQA.stats().renderFrames>3);
 const memory=await low.evaluate(()=>window.BitBazaarQA.stats().sprites.cacheSize);
 assert.ok(memory<=112);
 await low.close();
 assert.deepEqual(errors,[],'Unexpected errors in mobile WebKit');
 console.log('PASS Phase 6.3 WebKit: 30 medal UI, filter controls, 18 retroactive true-state medals, no invented history, actual swap, permanent save/reload after scattering, rejection of forged medals, 3,000 figure integrity and Low FX.');
}finally{await browser.close();}
