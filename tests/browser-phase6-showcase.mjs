// Bit Bazaar v0.60 mobile WebKit: photo, overhead portrait and safe camera.
import assert from 'node:assert/strict';
import {webkit} from 'playwright';
const root=process.env.BIT_BAZAAR_TEST_URL||'http://127.0.0.1:4173/';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({
 viewport:{width:390,height:844},isMobile:true,hasTouch:true,
 deviceScaleFactor:2,acceptDownloads:true});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push('Full FX: '+e.message));
async function ready(p=page){
 await p.waitForFunction(()=>window.BitBazaarQA?.showcaseState&&
  window.BitBazaarSaveTools?.validate,undefined,{timeout:45000});
 assert.equal(await p.locator('#bootRecovery').evaluate(el=>el.hidden),true);
}
async function inspectPNG(p){
 const result=await p.evaluate(async()=>{
  const b=await window.BitBazaarQA.showcaseCaptureBlob();
  const arr=new Uint8Array(await b.arrayBuffer());
  const dims=new DataView(arr.buffer);
  return {type:b.type,size:b.size,magic:Array.from(arr.slice(0,8)),
   width:dims.getUint32(16),height:dims.getUint32(20)};
 });
 assert.equal(result.type,'image/png');
 assert.ok(result.size>1200,'not an empty screenshot');
 assert.deepEqual(result.magic,[137,80,78,71,13,10,26,10]);
 return result;
}
async function finish(p){
 const state=await p.evaluate(()=>window.BitBazaarQA.showcaseState());
 assert.equal(state.active,false);
 assert.equal(await p.locator('#showcaseBar').evaluate(e=>e.hidden),true);
 assert.equal(await p.locator('#game').evaluate(e=>e.classList.contains('showcase-active')),false);
}
try{
 await page.goto(root,{waitUntil:'domcontentloaded'});
 await ready();
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.showcaseOpen()),false,
  'cannot access photo mode before gameplay starts');
 await page.locator('#startBtn').click();
 const entry=page.locator('#showcaseBtn');
 const bounds=await entry.boundingBox();
 assert.ok(bounds&&bounds.width>=20&&bounds.x>=0&&bounds.x+bounds.width<=390,
  'photo button must fit on a 390px iPhone');
 const prior=await page.evaluate(()=>window.BitBazaarQA.snapshotNow());
 await entry.click();
 let state=await page.evaluate(()=>window.BitBazaarQA.showcaseState());
 assert.equal(state.active,true);
 assert.equal(state.overhead,false);
 assert.ok(state.returnPose);
 assert.equal(await page.locator('#game').evaluate(e=>e.classList.contains('showcase-active')),true);
 assert.equal(await page.locator('#topbar').evaluate(e=>getComputedStyle(e).display),'none');
 assert.equal(await page.locator('#mobileControls').evaluate(e=>getComputedStyle(e).display),'none');
 assert.equal(await page.locator('#crosshair').evaluate(e=>getComputedStyle(e).display),'none');
 assert.equal(await page.locator('#showcaseOverhead').evaluate(e=>e.hidden),true);
 await page.mouse.move(200,400);
 await page.mouse.down();
 await page.mouse.move(330,465,{steps:6});
 await page.mouse.up();
 await page.waitForFunction(()=>Math.abs(window.BitBazaarQA.showcaseState().player.yaw -
  window.BitBazaarQA.showcaseState().returnPose.yaw)>.04,undefined,{timeout:7000});
 state=await page.evaluate(()=>window.BitBazaarQA.showcaseState());
 assert.ok(Math.abs(state.aim.yaw-state.returnPose.yaw)>.1);
 assert.notEqual(state.player.yaw,state.returnPose.yaw,'smoothed photo aim moved');
 assert.equal(state.player.x,state.returnPose.x,'photo does not move player');
 assert.equal(state.player.z,state.returnPose.z);
 const inPhoto=await page.evaluate(()=>window.BitBazaarQA.snapshotNow());
 assert.deepEqual(inPhoto.player,prior.player,'autosave stays at original real camera pose');
 await page.keyboard.down('w');
 await page.waitForTimeout(200);
 await page.keyboard.up('w');
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.showcaseState())).player.x,
  prior.player.x,'WASD does not walk during photos');
 const photo=await inspectPNG(page);
 assert.equal(photo.width,960);
 assert.equal(photo.height,540);
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.showcasePhotoCanvas())).width,960);
 await page.locator('#showcaseView').click();
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.showcaseState())).overhead,true);
 assert.equal(await page.locator('#showcaseOverhead').evaluate(e=>e.hidden),false);
 const top=await inspectPNG(page);
 assert.equal(top.width,760);
 assert.equal(top.height,900);
 assert.ok(top.size>4500,'overhead diagram contains real detail');
 // PNG export must use the native browser download when sharing is unavailable.
 // Test the built-in fallback, since headless WebKit has no native share sheet.
 const saved=page.waitForEvent('download',{timeout:30000});
 await page.locator('#showcaseCapture').click();
 const download=await saved;
 assert.equal(download.suggestedFilename(),'Bit-Bazaar-Overhead.png');
 assert.equal(await download.failure(),null);
 assert.equal(await page.locator('#showcaseStatus').textContent(),
  'PNG SAVED · FIND IT IN DOWNLOADS');
 await page.locator('#showcaseView').click();
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.showcaseState())).overhead,false);
 await page.keyboard.press('Escape');
 await finish(page);
 assert.deepEqual((await page.evaluate(()=>window.BitBazaarQA.snapshotNow())).player,prior.player,
  'Escape restores the original real-world position and camera angle');
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 // Re-enter using a desktop shortcut and exit through the touch toolbar.
 await page.keyboard.press('p');
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.showcaseState())).active,true);
 await page.locator('#showcaseExit').click();
 await finish(page);
 // Photo mode must not be opened on top of another editor/drawer.
 await page.locator('#albumBtn').click();
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.showcaseOpen()),false);
 await page.locator('#closeDrawer').click();
 // Full original 3,000-piece perfect store view, without changing IDs/saves.
 await page.evaluate(()=>{
  const s=window.BitBazaarQA.snapshotNow();
  s.cleaning=Array(60).fill(3);
  s.floorCleaning=Array.from({length:45},(_,i)=>[1,2,3][(i*7+Math.floor(i/5)*2)%3]);
  s.revealed=window.BitBazaarQA.hiddenIds();
  s.seenFigures=Array.from({length:3000},(_,i)=>i);
  s.lifetimePerfect=Array.from({length:300},(_,i)=>i);
  s.ground=[];s.tote=[];s.selected=null;
  s.rows=Array.from({length:60},(_,f)=>Array.from({length:5},(_,r)=>
   Array.from({length:10},(_,slot)=>(f*5+r)*10+slot)));
  s.slots=s.rows.map(face=>face.map(line=>[...line]));
  window.BitBazaarSaveTools.validate(s);
  window.BitBazaarSaveHold=true;
  localStorage.setItem('bit-bazaar-save-v3',JSON.stringify(s));
 });
 await page.reload({waitUntil:'domcontentloaded'});await ready();
 await page.locator('#startBtn').click();
 await page.locator('#showcaseBtn').click();
 await page.locator('#showcaseView').click();
 const real=await page.evaluate(()=>window.BitBazaarQA.showcaseMapStats());
 assert.equal(real.perfect,300);
 assert.equal(real.shelved,3000);
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 await page.locator('#showcaseExit').click();
 // Low FX: full controls, 2x photo PNG, world resume, memory cap.
 const low=await context.newPage();
 low.on('pageerror',e=>errors.push('Low FX: '+e.message));
 await low.goto(new URL('baseline-v0.60.0-lowfx.html',root).href,
  {waitUntil:'domcontentloaded'});await ready(low);
 await low.locator('#startBtn').click();
 await low.locator('#showcaseBtn').click();
 const lowPng=await inspectPNG(low);
 assert.equal(lowPng.width,960);
 await low.locator('#showcaseView').click();
 const lowOverhead=await inspectPNG(low);
 assert.equal(lowOverhead.width,760);
 await low.locator('#showcaseExit').click();
 await low.waitForFunction(()=>window.BitBazaarQA.stats().renderFrames>3);
 assert.ok((await low.evaluate(()=>window.BitBazaarQA.stats().sprites.cacheSize))<=112);
 assert.equal((await low.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 await finish(low);
 await low.close();
 assert.deepEqual(errors,[],'No errors in both phone-sized WebKit engines');
 console.log('PASS Phase 6.6 WebKit: responsive photo button; HUD-free camera; smoothed touch look with frozen physical position; original saved pose while shooting; 960x540 PNG, downloaded 760x900 true overhead image; Escape/P/Return, gated when drawer open; 3,000 figure endgame portrait and Low FX parity.');
}finally{await browser.close();}
