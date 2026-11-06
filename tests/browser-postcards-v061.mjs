// Bit Bazaar v0.61 — real mobile WebKit collector postcard acceptance.
import assert from 'node:assert/strict';
import {webkit} from 'playwright';
const root=process.env.BIT_BAZAAR_TEST_URL||'http://127.0.0.1:4173/';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},
 isMobile:true,hasTouch:true,deviceScaleFactor:2,acceptDownloads:true});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push('Standard: '+e.message));
async function ready(p){
 await p.waitForFunction(()=>window.BitBazaarQA?.postcardCycle&&
  window.BitBazaarQA?.postcardExportCanvas&&window.BIT_BAZAAR_POSTCARDS,
  undefined,{timeout:45000});
 assert.equal(await p.locator('#bootRecovery').evaluate(e=>e.hidden),true);
}
async function snapshot(p){
 return p.evaluate(async()=>{
  const qa=window.BitBazaarQA;
  const canvas=qa.postcardExportCanvas();
  const blob=await qa.showcaseCaptureBlob();
  const bytes=new Uint8Array(await blob.arrayBuffer());
  const view=new DataView(bytes.buffer);
  const corner=canvas.getContext('2d').getImageData(8,8,1,1).data;
  return {width:canvas.width,height:canvas.height,bytes:blob.size,type:blob.type,
   dimensions:[view.getUint32(16),view.getUint32(20)],
   header:Array.from(bytes.slice(0,8)),corner:Array.from(corner),
   style:qa.showcaseState().postcardStyle,
   stats:qa.postcardFacts()};
 });
}
try{
 await page.goto(root,{waitUntil:'domcontentloaded'});await ready(page);
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.postcardCycle()),false,
  'framing only available during Photo Mode');
 await page.locator('#startBtn').click();
 const original=await page.evaluate(()=>window.BitBazaarQA.snapshotNow());
 await page.locator('#showcaseBtn').click();
 let result=await snapshot(page);
 assert.equal(result.style,'plain');
 assert.deepEqual(result.dimensions,[960,540]);
 assert.deepEqual(result.header,[137,80,78,71,13,10,26,10]);
 assert.equal(result.type,'image/png');
 assert.ok(result.bytes>1000);
 assert.equal(await page.locator('#showcaseFrame').getAttribute('aria-pressed'),'false');
 await page.locator('#showcaseFrame').click();
 result=await snapshot(page);
 assert.equal(result.style,'hearthwood');
 assert.deepEqual(result.dimensions,[1056,740]);
 assert.equal(result.corner[0],237,'pixel gold border, not a stock replacement');
 assert.equal(await page.locator('#showcaseFrame').getAttribute('aria-pressed'),'true');
 await page.locator('#showcaseFrame').click();
 assert.equal((await snapshot(page)).style,'night');
 await page.locator('#showcaseFrame').click();
 result=await snapshot(page);
 assert.equal(result.style,'crown');
 assert.deepEqual(result.dimensions,[1056,740]);
 const ownState=await page.evaluate(()=>window.BitBazaarQA.snapshotNow());
 assert.deepEqual(ownState,original,'cycles and export never edit save data or camera');
 await page.locator('#showcaseView').click();
 result=await snapshot(page);
 assert.equal(result.style,'crown');
 assert.deepEqual(result.dimensions,[856,1100]);
 assert.ok(result.bytes>4000);
 // Force old iOS/webview fallback path without File object: PNG still saves.
 await page.evaluate(()=>{Object.defineProperty(window,'File',{value:undefined,configurable:true});});
 const downloadReady=page.waitForEvent('download',{timeout:30000});
 await page.locator('#showcaseCapture').click();
 const download=await downloadReady;
 assert.equal(download.suggestedFilename(),'Bit-Bazaar-Overhead-crown.png');
 assert.equal(await download.failure(),null);
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.snapshotNow())).player.x,original.player.x);
 await page.locator('#showcaseFrame').click();
 assert.equal((await snapshot(page)).style,'plain');
 await page.locator('#showcaseExit').click();
 assert.equal(await page.locator('#showcaseBar').evaluate(e=>e.hidden),true);
 assert.deepEqual((await page.evaluate(()=>window.BitBazaarQA.snapshotNow())).player,original.player);
 assert.equal((await page.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 // New Photo Studio sessions default to ORIGINAL, not a persisted frame.
 await page.locator('#showcaseBtn').click();
 assert.equal((await snapshot(page)).style,'plain');
 await page.locator('#showcaseExit').click();
 await page.reload({waitUntil:'domcontentloaded'});await ready(page);
 const backed=await page.evaluate(()=>window.BitBazaarQA.snapshotNow());
 assert.ok(!Object.hasOwn(backed,'postcardStyle'));
 // Same authored frames in Low FX, no new texture memory footprint.
 const low=await context.newPage();
 low.on('pageerror',e=>errors.push('Low FX: '+e.message));
 await low.goto(new URL('baseline-v0.61.0-lowfx.html',root).href,{waitUntil:'domcontentloaded'});
 await ready(low);
 await low.locator('#startBtn').click();
 await low.locator('#showcaseBtn').click();
 await low.locator('#showcaseFrame').click();
 const lowPhoto=await snapshot(low);
 assert.equal(lowPhoto.style,'hearthwood');
 assert.deepEqual(lowPhoto.dimensions,[1056,740]);
 await low.locator('#showcaseView').click();
 assert.deepEqual((await snapshot(low)).dimensions,[856,1100]);
 await low.locator('#showcaseExit').click();
 await low.waitForFunction(()=>window.BitBazaarQA.stats().renderFrames>3);
 assert.ok((await low.evaluate(()=>window.BitBazaarQA.stats().sprites.cacheSize))<=112);
 assert.equal((await low.evaluate(()=>window.BitBazaarQA.figureIntegrity())).ok,true);
 await low.close();
 assert.deepEqual(errors,[]);
 console.log('PASS v0.61 WebKit: default original unframed PNG, three 16-bit framed exports, genuine PNG dimensions/color, 760x900-based framed overhead, legacy iOS File-free download, no gameplay/save modifications, Low FX and 3,000 figures intact.');
}finally{await browser.close();}
