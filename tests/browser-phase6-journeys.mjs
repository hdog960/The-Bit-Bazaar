// Bit Bazaar Phase 6.2 — automated iPhone-shaped WebKit tests for three
// independently computed journeys, nonblocking completion and save integrity.
import assert from 'node:assert/strict';
import {webkit} from 'playwright';
const root=process.env.BIT_BAZAAR_TEST_URL||'http://127.0.0.1:4173/';
const KEY='bit-bazaar-save-v3';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({
 viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2
});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
async function ready(){
 await page.waitForFunction(()=>window.BitBazaarQA?.journeysState&&
  window.BitBazaarSaveTools?.validate,undefined,{timeout:45000});
 assert.equal(await page.locator('#bootRecovery').evaluate(e=>e.hidden),true);
}
async function fixture({clean=false,mastered=0,perfect=false}){
 await page.evaluate(({clean,mastered,perfect,key})=>{
  const s=window.BitBazaarQA.snapshotNow();
  const hidden=window.BitBazaarQA.hiddenIds();
  s.cleaning=Array(60).fill(clean?3:0);
  s.floorCleaning=Array.from({length:45},(_,i)=>clean?
   [1,2,3][(i*7+Math.floor(i/5)*2)%3]:0);
  s.revealed=clean?hidden:[];
  s.lifetimePerfect=Array.from({length:mastered},(_,i)=>i);
  s.glassesEquipped=false;
  s.honorTrim=0;
  s.ground=[];
  s.tote=[];s.selected=null;
  if(perfect){
   s.rows=Array.from({length:60},(_,face)=>
    Array.from({length:5},(_,row)=>
     Array.from({length:10},(_,slot)=>(face*5+row)*10+slot)));
   s.slots=s.rows.map(face=>face.map(line=>[...line]));
   s.seenFigures=Array.from({length:3000},(_,i)=>i);
  }else{
   s.rows=Array.from({length:60},()=>Array.from({length:5},()=>[]));
   s.slots=Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
  }
  window.BitBazaarSaveTools.validate(s);
  // Disposable browser-only fixture; pagehide must not overwrite the new
  // source save with the prior still-running game's autosave.
  window.BitBazaarSaveHold=true;
  localStorage.setItem(key,JSON.stringify(s));
 },{clean,mastered,perfect,key:KEY});
 await page.reload({waitUntil:'domcontentloaded'});
 await ready();
}
try{
 await page.goto(root,{waitUntil:'domcontentloaded'});
 await ready();
 const first=await page.evaluate(()=>window.BitBazaarQA.journeysState());
 assert.equal(first.completed,0);
 assert.equal(first.restorer.metrics[0].count,0);
 await page.locator('#startBtn').click();
 await page.locator('#journeyBtn').click();
 const gallery=page.locator('#journeyGallery');
 await gallery.waitFor({state:'visible'});
 assert.equal(await gallery.locator('.journey-card').count(),3);
 assert.match(await gallery.textContent(),/The Restorer/);
 assert.match(await gallery.textContent(),/The Archivist/);
 assert.match(await gallery.textContent(),/The Perfect Bazaar/);
 // Every shelf, mess and hidden original figure restored; 299 mastered.
 await fixture({clean:true,mastered:299});
 let s=await page.evaluate(()=>window.BitBazaarQA.journeysState());
 assert.equal(s.completed,1);
 assert.equal(s.restorer.complete,true);
 assert.equal(s.archivist.complete,false);
 assert.equal(s.perfect.complete,false);
 assert.equal(s.restorer.metrics[0].count,60);
 assert.equal(s.restorer.metrics[1].count,45);
 assert.equal(s.restorer.metrics[2].count,18);
 await page.locator('#startBtn').click();
 await page.locator('#albumBtn').click();
 assert.equal(await page.locator('#journeyGallery .journey-complete').count(),1);
 assert.match(await page.locator('#journeyGallery').textContent(),/299 \/ 300/);
 // All unique lifetime sets mastered despite no currently perfect rows.
 await fixture({clean:true,mastered:300});
 s=await page.evaluate(()=>window.BitBazaarQA.journeysState());
 assert.equal(s.completed,2);
 assert.equal(s.archivist.complete,true);
 assert.equal(s.perfect.complete,false);
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.stats().completedRows),0);
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 const low=await context.newPage();
 low.on('pageerror',e=>errors.push('Low FX: '+e.message));
 await low.goto(new URL('baseline-v0.56.0-lowfx.html',root).href,
  {waitUntil:'domcontentloaded'});
 await low.waitForFunction(()=>window.BitBazaarQA?.journeysState,undefined,{timeout:45000});
 const lowState=await low.evaluate(()=>window.BitBazaarQA.journeysState());
 assert.equal(lowState.completed,2);
 assert.equal(lowState.archivist.complete,true);
 assert.equal(lowState.perfect.complete,false);
 await low.locator('#startBtn').click();
 await low.waitForFunction(()=>window.BitBazaarQA.stats().renderFrames>3);
 assert.ok((await low.evaluate(()=>window.BitBazaarQA.stats().sprites.cacheSize))<=112);
 await low.close();
 // 300 ordered physical rows: the current-perfect journey earns its status
 // only when every original figure is actually shelved and carrying is empty.
 await fixture({clean:true,mastered:300,perfect:true});
 s=await page.evaluate(()=>window.BitBazaarQA.journeysState());
 assert.equal(s.completed,3);
 assert.equal(s.perfect.complete,true);
 assert.equal(s.perfect.metrics[0].count,300);
 assert.equal(s.perfect.metrics[1].count,3000);
 const audited=await page.evaluate(()=>window.BitBazaarQA.figureIntegrity());
 assert.equal(audited.ok,true,JSON.stringify(audited.issues?.slice(0,3)));
 assert.equal(audited.total,3000);
 assert.equal(audited.shelved,3000);
 await page.locator('#startBtn').click();
 await page.waitForTimeout(1400);
 assert.equal(await page.locator('#screen').evaluate(x=>x.classList.contains('shown')),false,
  'Perfect Bazaar must stay playable; Phase 6.4 owns optional finale');
 await page.locator('#journeyBtn').click();
 assert.equal(await page.locator('#journeyGallery .journey-complete').count(),3);
 // Voluntary sacrifice/undo analog: current rows may regress, but lifetime
 // mastery and lifetime honors remain earned on the original save schema.
 await fixture({clean:true,mastered:300,perfect:false});
 s=await page.evaluate(()=>window.BitBazaarQA.journeysState());
 assert.equal(s.completed,2);
 assert.equal(s.archivist.complete,true);
 assert.equal(s.restorer.complete,true);
 assert.equal(s.perfect.complete,false);
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.honorsState().count),300);
 assert.deepEqual(errors,[]);
 console.log('PASS Phase 6.2 mobile WebKit: 0/3, 1/3, 2/3 and 3/3 journeys; exact 60+45+18 restoration, lifetime vs current progress, true 3,000-figure perfect shelves, nonblocking completion, normal and Low FX rendering and 3,000-figure audit.');
}finally{await browser.close();}
