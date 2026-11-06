// Bit Bazaar v0.59 Phase 6.5 — optional post-completion touch WebKit.
import assert from 'node:assert/strict';
import {webkit} from 'playwright';
const root=process.env.BIT_BAZAAR_TEST_URL||'http://127.0.0.1:4173/';
const KEY='bit-bazaar-save-v3';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({
 viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push('standard: '+e.message));
async function ready(p=page){
 await p.waitForFunction(()=>window.BitBazaarQA?.postgameState&&
   window.BitBazaarSaveTools?.validate,undefined,{timeout:45000});
 assert.equal(await p.locator('#bootRecovery').evaluate(e=>e.hidden),true);
}
async function fixture({unlocked=false,scattered=[],wrong=[],sacrificed=[]}={}){
 await page.evaluate(({unlocked,scattered,wrong,sacrificed,key})=>{
  const s=window.BitBazaarQA.snapshotNow();
  const hidden=window.BitBazaarQA.hiddenIds();
  s.cleaning=Array(60).fill(3);
  s.floorCleaning=Array.from({length:45},(_,i)=>[1,2,3][(i*7+Math.floor(i/5)*2)%3]);
  s.revealed=hidden;
  s.lifetimePerfect=Array.from({length:300},(_,i)=>i);
  s.seenFigures=Array.from({length:3000},(_,i)=>i);
  s.glassesEquipped=false;s.honorTrim=0;s.finaleViewed=unlocked;
  s.ground=[];s.tote=[];s.selected=null;s.pinnedSets=[];s.trackedSetId=null;
  s.achievementData={earned:unlocked?['perfect-bazaar']:[],
   unordered:[],sacrificed,marks:[]};
  if(unlocked){
   s.slots=Array.from({length:60},(_,f)=>Array.from({length:5},(_,r)=>
    Array.from({length:10},(_,k)=>(f*5+r)*10+k)));
   for(const sid of scattered){const f=Math.floor(sid/5),r=sid%5;
    s.slots[f][r]=Array(10).fill(null);}
   for(const sid of wrong){const f=Math.floor(sid/5),r=sid%5;
    [s.slots[f][r][0],s.slots[f][r][1]]=[s.slots[f][r][1],s.slots[f][r][0]];}
  }else{
   s.slots=Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
  }
  s.rows=s.slots.map(face=>face.map(row=>row.filter(Number.isInteger)));
  window.BitBazaarSaveTools.validate(s);
  window.BitBazaarSaveHold=true;
  localStorage.setItem(key,JSON.stringify(s));
 },{unlocked,scattered,wrong,sacrificed,key:KEY});
 await page.reload({waitUntil:'domcontentloaded'});
 await ready();
}
try{
 await page.goto(root,{waitUntil:'domcontentloaded'});
 await ready();
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.postgameState().unlocked),false);
 assert.equal(await page.locator('#encoreBtn').evaluate(e=>e.hidden),true);
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.postgameOpen()),false);
 // Complete lifetime mastery alone is not simultaneous physical completion.
 await fixture();
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.postgameState().unlocked),false);
 await fixture({unlocked:true});
 let s=await page.evaluate(()=>window.BitBazaarQA.postgameState());
 assert.equal(s.unlocked,true);
 assert.equal(s.complete,true);
 assert.equal(s.perfectRows,300);
 assert.equal(s.shelved,3000);
 assert.equal(s.unfinished,0);
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 await page.locator('#startBtn').click();
 await page.locator('#encoreBtn').click();
 assert.equal(await page.locator('#encoreDetails').evaluate(e=>e.open),true);
 const gallery=page.locator('#encoreGallery');
 await gallery.waitFor({state:'visible'});
 assert.match(await gallery.textContent(),/EVERY FIGURE IN PLACE/);
 const before=JSON.stringify(await page.evaluate(()=>window.BitBazaarQA.snapshotNow()));
 await gallery.locator('[data-encore-open="decor"]').click();
 assert.match(await page.locator('#drawerTitle').textContent(),/SACRIFICE CATALOG/);
 const after=JSON.stringify(await page.evaluate(()=>window.BitBazaarQA.snapshotNow()));
 assert.equal(after,before,'opening art browsing neither buys art nor scatters rows');
 await page.locator('#closeDrawer').click();
 await page.locator('#encoreBtn').click();
 await gallery.locator('[data-encore-open="map"]').click();
 assert.match(await page.locator('#drawerTitle').textContent(),/STORE MAP/);
 await page.locator('#closeDrawer').click();
 // A voluntary purchase scatters real figures; model that physical effect
 // with a disposable save, never modify the real user's file.
 await fixture({unlocked:true,scattered:[0,12],wrong:[50],sacrificed:[0,12]});
 s=await page.evaluate(()=>window.BitBazaarQA.postgameState());
 assert.equal(s.unlocked,true);
 assert.equal(s.complete,false);
 assert.equal(s.perfectRows,297);
 assert.equal(s.shelved,2980);
 assert.equal(s.pending,2);
 assert.deepEqual(s.targets.slice(0,3).map(x=>x.id),[0,12,50]);
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 await page.locator('#startBtn').click();
 await page.locator('#encoreBtn').click();
 assert.equal(await gallery.locator('.encore-target').count(),3);
 assert.match(await gallery.textContent(),/2 FROM DECOR PURCHASES/);
 assert.equal(await gallery.locator('[data-encore-map="0"]').count(),0);
 assert.equal(await gallery.locator('[data-encore-map="50"]').count(),1);
 await gallery.locator('[data-encore-pin="12"]').click();
 assert.equal(await gallery.locator('[data-encore-pin="12"]').getAttribute('aria-pressed'),'true');
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.snapshotNow())).pinnedSets.includes(12),true);
 await page.reload({waitUntil:'domcontentloaded'});
 await ready();
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.snapshotNow())).pinnedSets.includes(12),true);
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.postgameState())).unlocked,true);
 await page.locator('#startBtn').click();
 await page.locator('#encoreBtn').click();
 await gallery.locator('[data-encore-map="50"]').click();
 assert.match(await page.locator('#drawerTitle').textContent(),/STORE MAP/);
 await page.locator('#closeDrawer').click();
 await page.locator('#encoreBtn').click();
 await gallery.locator('[data-encore-set="0"]').click();
 assert.match(await page.locator('#drawerTitle').textContent(),/ALMANAC/);
 assert.ok(await page.locator('#pinCollection').isVisible(),'opens the real checklist with pin tools');
 await page.locator('#closeDrawer').click();
 // A long restoring journey remains six cards per page, never 300 DOM tiles.
 await fixture({unlocked:true,scattered:Array.from({length:19},(_,i)=>i),sacrificed:[0,1]});
 await page.locator('#startBtn').click();
 await page.locator('#encoreBtn').click();
 assert.equal(await gallery.locator('.encore-target').count(),6);
 await gallery.locator('[data-encore-page="next"]').click();
 assert.equal(await gallery.locator('.encore-target').count(),6);
 assert.match(await gallery.textContent(),/PAGE 2/);
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 // Both iPhone engines display the exact same permanent encore state.
 const low=await context.newPage();
 low.on('pageerror',e=>errors.push('Low FX: '+e.message));
 await low.goto(new URL('baseline-v0.59.0-lowfx.html',root).href,
  {waitUntil:'domcontentloaded'});
 await ready(low);
 const status=await low.evaluate(()=>window.BitBazaarQA.postgameState());
 assert.equal(status.unlocked,true);
 assert.equal(status.perfectRows,281);
 assert.equal(status.pending,2);
 await low.locator('#startBtn').click();
 await low.locator('#encoreBtn').click();
 assert.equal(await low.locator('#encoreDetails').evaluate(e=>e.open),true);
 await low.locator('#closeDrawer').click(); // World rendering correctly pauses while a drawer is open.
 await low.waitForFunction(()=>window.BitBazaarQA.stats().renderFrames>3);
 assert.ok((await low.evaluate(()=>window.BitBazaarQA.stats().sprites.cacheSize))<=112);
 assert.equal((await low.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 await low.close();
 assert.deepEqual(errors,[]);
 console.log('PASS Phase 6.5 mobile WebKit: permanently gated voluntary Encore, live all-perfect/after-sacrifice restoration, 3000 unique figurines, no auto-purchases, catalog/map/checklist navigation, pinned sets survive reload, bounded pagination and Low FX parity.');
}finally{await browser.close();}
