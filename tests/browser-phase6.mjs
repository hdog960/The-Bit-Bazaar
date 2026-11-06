// Bit Bazaar Phase 6.1: developer-owned real WebKit acceptance of all
// lifetime awards, UI gallery and free finishes in a disposable mobile profile.
import assert from 'node:assert/strict';
import {webkit} from 'playwright';
const root=process.env.BIT_BAZAAR_TEST_URL||'http://127.0.0.1:4173/';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({
 viewport:{width:390,height:844},isMobile:true,hasTouch:true,
 deviceScaleFactor:2,acceptDownloads:true
});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const KEY='bit-bazaar-save-v3';
const limits=[0,1,10,25,50,100,150,200,250,300];
async function ready(){
 await page.waitForFunction(()=>window.BitBazaarQA?.honorsState&&
  window.BitBazaarSaveTools?.validate,undefined,{timeout:45000});
 assert.equal(await page.locator('#bootRecovery').evaluate(x=>x.hidden),true);
}
async function setProgress(count,trim=0){
 await page.evaluate(({count,trim,key})=>{
  const s=window.BitBazaarQA.snapshotNow();
  s.lifetimePerfect=Array.from({length:count},(_,i)=>i);
  s.honorTrim=trim;
  window.BitBazaarSaveTools.validate(s);
  localStorage.setItem(key,JSON.stringify(s));
 },{count,trim,key:KEY});
 await page.reload({waitUntil:'domcontentloaded'});
 await ready();
}
try{
 await page.goto(root,{waitUntil:'domcontentloaded'});
 await ready();
 let snap=await page.evaluate(()=>window.BitBazaarQA.honorsState());
 assert.equal(snap.count,0);
 assert.equal(snap.rewards.earned,0);
 assert.deepEqual(snap.world,[]);
 // Exactly nine distinct first-perfected lifetime rewards must unlock,
 // regardless of current empty shelves or any decoration purchases.
 for(const count of limits.slice(1)){
  await setProgress(count);
  snap=await page.evaluate(()=>window.BitBazaarQA.honorsState());
  const expect=[1,10,25,50,100,150,200,250,300].filter(x=>x<=count);
  assert.equal(snap.count,count);
  assert.equal(snap.rewards.earned,expect.length);
  assert.deepEqual(snap.world,expect.filter(x=>x!==25));
  const audit=await page.evaluate(()=>window.BitBazaarQA.figureIntegrity());
  assert.equal(audit.ok,true,'figure inventory changed during milestone setup');
  assert.equal(audit.total,3000);
 }
 // The original 300 sets remain physically unsorted; this is a lifetime
 // showcase, not a fake current Perfect Bazaar.
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.stats().completedRows),0);
 await page.locator('#startBtn').click();
 await page.locator('#albumBtn').click();
 const gallery=page.locator('#honorGallery');
 await gallery.waitFor({state:'visible'});
 assert.equal(await gallery.locator('.honor-card').count(),9);
 assert.equal(await gallery.locator('.honor-card.earned').count(),9);
 assert.match(await gallery.textContent(),/Master of the Bazaar/);
 assert.match(await gallery.textContent(),/Three free gallery finish choices/);
 const finish=gallery.locator('[data-honor-finish="2"]');
 await finish.click();
 let state=await page.evaluate(()=>window.BitBazaarQA.honorsState());
 assert.equal(state.trim,2);
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.snapshotNow())).honorTrim,2);
 await page.reload({waitUntil:'domcontentloaded'});
 await ready();
 state=await page.evaluate(()=>window.BitBazaarQA.honorsState());
 assert.equal(state.trim,2,'chosen free finish survives mobile Safari reload');
 assert.equal(state.count,300);
 // Sacrifice-analog test: no current perfect rows, same 300 mastered IDs.
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.stats().completedRows),0);
 const low=await context.newPage();
 low.on('pageerror',e=>errors.push('Low FX: '+e.message));
 await low.goto(new URL('baseline-v0.55.0-lowfx.html',root).href,
  {waitUntil:'domcontentloaded'});
 await low.waitForFunction(()=>window.BitBazaarQA?.honorsState,undefined,{timeout:45000});
 const other=await low.evaluate(()=>window.BitBazaarQA.honorsState());
 assert.equal(other.count,300);
 assert.equal(other.trim,2);
 assert.equal(other.rewards.earned,9);
 await low.locator('#startBtn').click();
 await low.waitForFunction(()=>window.BitBazaarQA.stats().renderFrames>3);
 const lowStats=await low.evaluate(()=>window.BitBazaarQA.stats());
 assert.ok(lowStats.sprites.cacheSize<=112);
 await low.close();
 // Earning finishes at 50 (not 49) really enforces the UI and save gate.
 await setProgress(49);
 const denied=await page.evaluate(()=>window.BitBazaarQA.honorsSelectTrim(1));
 assert.equal(denied,false);
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.honorsState().trim),0);
 await page.locator('#startBtn').click();
 await page.locator('#albumBtn').click();
 assert.equal(await page.locator('[data-honor-finish="1"]').isDisabled(),true);
 await setProgress(50);
 await page.locator('#startBtn').click();
 await page.locator('#albumBtn').click();
 const check50=await page.evaluate(()=>({
  state:window.BitBazaarQA.honorsState(),
  saveMastered:window.BitBazaarQA.snapshotNow().lifetimePerfect.length,
  button:document.querySelector('[data-honor-finish="1"]')?.outerHTML,
  hold:window.BitBazaarSaveHold
 }));
 assert.equal(await page.locator('[data-honor-finish="1"]').isEnabled(),true,
  'Finish unlock at 50: '+JSON.stringify(check50));
 await page.locator('[data-honor-finish="1"]').click();
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.honorsState().trim),1);
 assert.deepEqual(errors,[],'unexpected WebKit script errors');
 console.log('PASS Phase 6.1 WebKit: all nine earned tiers, 8 physical honors, save-backed optional free finishes, locked at 49/unlocked at 50, persistent at 300 despite zero currently perfect rows, 3,000 figure integrity, normal and Low FX mobile rendering.');
}finally{await browser.close();}
