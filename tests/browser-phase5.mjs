// Bit Bazaar Phase 5: hands-off browser acceptance. Runs in disposable
// WebKit/iPhone-sized profile, never a real player's saved shop.
import assert from 'node:assert/strict';
import {webkit} from 'playwright';

const base=process.env.BIT_BAZAAR_TEST_URL||'http://127.0.0.1:4173/';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({
 viewport:{width:390,height:844},isMobile:true,hasTouch:true,
 deviceScaleFactor:2,acceptDownloads:true
});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const KEY='bit-bazaar-save-v3';
const wait=async pg=>{
 await pg.waitForFunction(()=>Boolean(window.BitBazaarQA?.glassesState&&
  window.BitBazaarSaveTools?.validate),undefined,{timeout:45000});
};
const reload=async pg=>{
 await pg.reload({waitUntil:'domcontentloaded'});
 await wait(pg);
 assert.equal(await pg.locator('#bootRecovery').evaluate(el=>el.hidden),true);
};
const snap=async pg=>pg.evaluate(()=>window.BitBazaarQA.snapshotNow());
const setSave=async (pg,data)=>pg.evaluate(({k,s})=>{
 window.BitBazaarSaveTools.validate(s);
 localStorage.setItem(k,JSON.stringify(s));
},{k:KEY,s:data});
try{
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await wait(page);
 let save=await snap(page);
 assert.equal(save.glassesEquipped,false,'fresh shop has glasses unequipped');
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.glassesState())).unlocked,false);
 assert.equal(await page.locator('#glassesToggle').isDisabled(),true);
 assert.equal(await page.locator('#cowardBadge').isVisible(),false);
 // Create a legitimate, partially assembled collection in a disposable
 // browser only. Lifetime milestone records are independent of current rows.
 save.rows[0][0]=[30];save.slots[0][0][0]=30;
 save.cleaning[0]=3;
 save.tote=[37];save.selected=37;save.seenFigures=[30,37];
 save.lifetimePerfect=Array.from({length:149},(_,i)=>i);
 save.glassesEquipped=true; // A forged early toggle must not bypass unlock.
 await setSave(page,save);
 await reload(page);
 let state=await page.evaluate(()=>window.BitBazaarQA.glassesState());
 assert.equal(state.mastered,149);
 assert.equal(state.unlocked,false);
 assert.equal(state.equipped,false);
 assert.equal(state.target,null);
 assert.equal(await page.locator('#cowardBadge').isVisible(),false);
 assert.equal(await page.locator('#glassesToggle').isDisabled(),true);

 save.lifetimePerfect.push(149);save.glassesEquipped=false;
 await setSave(page,save);
 await reload(page);
 state=await page.evaluate(()=>window.BitBazaarQA.glassesState());
 assert.equal(state.mastered,150);
 assert.equal(state.unlocked,true);
 assert.equal(state.equipped,false);
 assert.equal(await page.locator('#glassesToggle').isEnabled(),true);
 await page.locator('#startBtn').click();
 await page.locator('#glassesToggle').click();
 state=await page.evaluate(()=>window.BitBazaarQA.glassesState());
 assert.equal(state.equipped,true);
 assert.equal(state.target?.setId,3);
 assert.equal(state.target?.face,0);
 assert.equal(state.target?.row,0);
 assert.equal(await page.locator('#cowardBadge').isVisible(),true);
 assert.match(await page.locator('#cowardBadge').textContent(),/COWARD/);
 assert.equal((await snap(page)).glassesEquipped,true);
 const check=await page.evaluate(()=>window.BitBazaarQA.figureIntegrity());
 assert.equal(check.ok,true);
 assert.equal(check.total,3000);
 await page.waitForFunction(()=>window.BitBazaarQA.stats().renderFrames>3);
 await reload(page);
 state=await page.evaluate(()=>window.BitBazaarQA.glassesState());
 assert.equal(state.equipped,true,'glasses stay equipped across Safari reload');
 assert.equal(state.target?.setId,3);
 assert.equal(await page.locator('#cowardBadge').isVisible(),true);

 // Start carrying a different set that has NEVER had an occupied row.
 // The COWARD label still remains but its guidance must not reveal a shelf.
 save=await snap(page);save.tote=[47];save.selected=47;
 save.glassesEquipped=true;
 await setSave(page,save);
 await reload(page);
 state=await page.evaluate(()=>window.BitBazaarQA.glassesState());
 assert.equal(state.equipped,true);
 assert.equal(state.target,null,'no guidance for an unstarted set');
 assert.equal(await page.locator('#cowardBadge').isVisible(),true);

 // Sacrifice is modeled by an empty current row: mastery 150/300 remains
 // permanent and glasses stay unlocked, but its old arrow disappears.
 save=await snap(page);
 save.rows[0][0]=[];save.slots[0][0]=Array(10).fill(null);
 save.tote=[37];save.selected=37;save.glassesEquipped=true;
 await setSave(page,save);
 await reload(page);
 state=await page.evaluate(()=>window.BitBazaarQA.glassesState());
 assert.equal(state.mastered,150);
 assert.equal(state.unlocked,true);
 assert.equal(state.equipped,true);
 assert.equal(state.target,null,'sacrificed row is no longer an assignment');

 // Normal and low-FX views both render the same optional overlay/setting.
 const low=await context.newPage();
 low.on('pageerror',e=>errors.push('Low FX: '+e.message));
 await low.goto(new URL('baseline-v0.54.0-lowfx.html',base).href,
  {waitUntil:'domcontentloaded'});
 await wait(low);
 const lowState=await low.evaluate(()=>window.BitBazaarQA.glassesState());
 assert.equal(lowState.mastered,150);
 assert.equal(lowState.unlocked,true);
 assert.equal(lowState.equipped,true);
 assert.equal(lowState.target,null);
 assert.equal(await low.locator('#cowardBadge').isVisible(),true);
 await low.locator('#startBtn').click();
 await low.waitForFunction(()=>window.BitBazaarQA.stats().renderFrames>3);
 const stats=await low.evaluate(()=>window.BitBazaarQA.stats());
 assert.ok(stats.sprites.cacheSize<=112,'Low FX sprite cache must remain bounded');
 await low.close();

 // After a reload the title card intentionally covers HUD controls.
 // Enter the shop before using the actual touch-activated glasses toggle.
 // Un-equipping persists without changing permanent lifetime mastery.
 await page.locator('#startBtn').click();
 await page.locator('#glassesToggle').click();
 assert.equal(await page.locator('#cowardBadge').isVisible(),false);
 await reload(page);
 state=await page.evaluate(()=>window.BitBazaarQA.glassesState());
 assert.equal(state.unlocked,true);
 assert.equal(state.equipped,false);
 assert.equal(state.mastered,150);
 assert.deepEqual(errors,[],'WebKit must report no runtime crashes');
 console.log('PASS Phase 5 WebKit: 149 locked, 150 permanently unlocked, optional toggle saved, COWARD always visible while equipped, started-set-only arrow, no arrow for unstarted/sacrificed rows, normal/Low FX views, 3,000-object integrity and <=112 sprite cache.');
}finally{
 await browser.close();
}
