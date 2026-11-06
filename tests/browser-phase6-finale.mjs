// Bit Bazaar v0.58 — actual Linux mobile WebKit grand finale acceptance.
// All mutations are isolated to synthetic localStorage in a test browser.
import assert from 'node:assert/strict';
import {webkit} from 'playwright';
const base=process.env.BIT_BAZAAR_TEST_URL||'http://127.0.0.1:4173/';
const KEY='bit-bazaar-save-v3';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},
 isMobile:true,hasTouch:true,deviceScaleFactor:2});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push('standard: '+e.message));
async function ready(p=page){
 await p.waitForFunction(()=>window.BitBazaarQA?.finaleState&&
   window.BitBazaarSaveTools?.validate,undefined,{timeout:45000});
 assert.equal(await p.locator('#bootRecovery').evaluate(e=>e.hidden),true);
}
async function fixture({perfect=false,viewed=false,earned=[]}={}){
 await page.evaluate(({perfect,viewed,earned,key})=>{
  const qa=window.BitBazaarQA;
  const s=qa.snapshotNow(),hidden=qa.hiddenIds();
  s.cleaning=Array(60).fill(3);
  s.floorCleaning=Array.from({length:45},(_,i)=>
   [1,2,3][(i*7+Math.floor(i/5)*2)%3]);
  s.revealed=hidden;
  s.lifetimePerfect=Array.from({length:300},(_,i)=>i);
  s.seenFigures=Array.from({length:3000},(_,i)=>i);
  s.pinnedSets=[];s.trackedSetId=null;s.glassesEquipped=false;
  s.honorTrim=0;s.ground=[];s.tote=[];s.selected=null;
  s.finaleViewed=viewed;
  s.achievementData={earned:[...earned],unordered:[],sacrificed:[],marks:[]};
  if(perfect){
   s.rows=Array.from({length:60},(_,f)=>Array.from({length:5},(_,r)=>
    Array.from({length:10},(_,i)=>(f*5+r)*10+i)));
   s.slots=s.rows.map(face=>face.map(row=>[...row]));
  }else{
   s.rows=Array.from({length:60},()=>Array.from({length:5},()=>[]));
   s.slots=Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
  }
  window.BitBazaarSaveTools.validate(s);
  window.BitBazaarSaveHold=true;
  localStorage.setItem(key,JSON.stringify(s));
 },{perfect,viewed,earned,key:KEY});
 await page.reload({waitUntil:'domcontentloaded'});
 await ready();
}
try{
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await ready();
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.finaleState().unlocked),false);
 assert.equal(await page.locator('#finaleBtn').evaluate(el=>el.hidden),true);
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.finaleOpen()),false);
 await fixture({perfect:false});
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.finaleState().unlocked),false,
  'lifetime perfect all 300 is not the simultaneous physical completion condition');
 assert.equal(await page.locator('#finaleBtn').evaluate(el=>el.hidden),true);
 await fixture({perfect:true});
 let finale=await page.evaluate(()=>window.BitBazaarQA.finaleState());
 assert.equal(finale.unlocked,true);
 assert.equal(finale.viewed,false);
 assert.equal(finale.location,'EAST ENTRANCE ALCOVE');
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.stats())).placed,3000);
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.stats())).completedRows,300);
 assert.equal(await page.locator('#finaleOverlay').evaluate(el=>el.hidden),true);
 await page.locator('#startBtn').click();
 await page.waitForTimeout(1400);
 assert.equal(await page.locator('#screen').evaluate(el=>el.classList.contains('shown')),false);
 assert.equal(await page.locator('#finaleOverlay').evaluate(el=>el.hidden),true,
  'full shop completion must NOT interrupt play');
 await page.locator('#finaleBtn').click();
 assert.equal(await page.locator('#finaleOverlay').evaluate(el=>el.hidden),false);
 assert.equal(await page.locator('#finaleContent').getAttribute('data-finale-chapter'),null);
 assert.equal(await page.locator('[data-finale-chapter="0"]').count(),1);
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.finaleState().playing),true);
 assert.equal(await page.locator('#finaleNext').textContent(),'NEXT CHAPTER →');
 await page.locator('#finaleNext').click();
 assert.equal(await page.locator('[data-finale-chapter="1"]').count(),1);
 await page.locator('#finaleSkip').click();
 assert.equal(await page.locator('[data-finale-chapter="3"]').count(),1);
 finale=await page.evaluate(()=>window.BitBazaarQA.finaleState());
 assert.equal(finale.viewed,true);
 assert.equal(finale.chapter,3);
 assert.equal(await page.locator('#finaleReplay').evaluate(el=>el.hidden),false);
 await page.locator('#finaleReplay').click();
 assert.equal(await page.locator('[data-finale-chapter="0"]').count(),1);
 await page.locator('#finaleClose').click();
 assert.equal(await page.locator('#finaleOverlay').evaluate(el=>el.hidden),true);
 finale=await page.evaluate(()=>window.BitBazaarQA.finaleState());
 assert.equal(finale.open,false);
 assert.equal(finale.playing,true,'returns to a playable shop');
 const before=await page.evaluate(()=>window.BitBazaarQA.figureIntegrity());
 assert.equal(before.ok,true);
 assert.equal(before.total,3000);
 await page.reload({waitUntil:'domcontentloaded'});
 await ready();
 finale=await page.evaluate(()=>window.BitBazaarQA.finaleState());
 assert.equal(finale.unlocked,true);
 assert.equal(finale.viewed,true,'credits viewed persists after restart');
 assert.equal(await page.locator('#finaleBtn').evaluate(el=>el.hidden),false);
 assert.match(await page.locator('#finaleBtn').textContent(),/REPLAY FINALE/);
 // Sacrificing a finished row changes only CURRENT perfection, never
 // the medal-derived permanent monument or replay capability.
 const history=await page.evaluate(()=>window.BitBazaarQA.achievementRaw());
 assert.ok(history.earned.includes('perfect-bazaar'));
 await fixture({perfect:false,viewed:true,earned:history.earned});
 finale=await page.evaluate(()=>window.BitBazaarQA.finaleState());
 assert.equal(finale.unlocked,true,'sacrifice does not remove exclusive monument');
 assert.equal(finale.viewed,true,'replay retained');
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.stats())).completedRows,0);
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 await page.locator('#startBtn').click();
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.finaleOpen()),true);
 assert.equal(await page.locator('[data-finale-chapter="0"]').count(),1);
 // Escape exits without consuming/suspending gameplay.
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('#finaleOverlay').evaluate(el=>el.hidden),true);
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.finaleState().playing),true);
 const bad=await page.evaluate(()=>{
  const raw=window.BitBazaarQA.snapshotNow();
  raw.finaleViewed='yes';
  try{window.BitBazaarSaveTools.validate(raw);return false}
  catch(e){return /Invalid Collector/.test(String(e.message));}
 });
 assert.equal(bad,true,'malformed imported viewed preference rejected');
 const low=await context.newPage();
 low.on('pageerror',e=>errors.push('lowfx: '+e.message));
 await low.goto(new URL('baseline-v0.58.0-lowfx.html',base).href,{waitUntil:'domcontentloaded'});
 await ready(low);
 const s=await low.evaluate(()=>window.BitBazaarQA.finaleState());
 assert.equal(s.unlocked,true);
 assert.equal(s.viewed,true);
 await low.locator('#startBtn').click();
 assert.equal(await low.evaluate(()=>window.BitBazaarQA.finaleOpen()),true);
 await low.locator('#finaleSkip').click();
 await low.locator('#finaleClose').click();
 await low.waitForFunction(()=>window.BitBazaarQA.stats().renderFrames>3);
 assert.ok((await low.evaluate(()=>window.BitBazaarQA.stats().sprites.cacheSize))<=112);
 assert.equal((await low.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 await low.close();
 assert.deepEqual(errors,[]);
 console.log('PASS Phase 6.4 WebKit: unlock only at 300 actual perfect rows, optional nonblocking cinematic, next/skip/credits/replay/escape, save/reload persistence, post-sacrifice monument and 3,000-figure integrity in standard and Low FX.');
}finally{await browser.close();}
