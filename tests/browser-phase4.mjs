// Browser-level Phase 4 acceptance: real WebKit engine, mobile viewport,
// disposable synthetic saves. No user device, credentials or game data needed.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { webkit } from 'playwright';

const base=process.env.BIT_BAZAAR_TEST_URL||'http://127.0.0.1:4173/';
const KEY='bit-bazaar-save-v3';
const timeout=45000;
const browser=await webkit.launch({headless:true});
const problems=[];
let phase='';
const watch=page=>{
 page.on('pageerror',error=>problems.push(phase+': '+error.message));
 page.on('response',response=>{
  if(response.url().startsWith(base)&&response.status()>=400)
   problems.push(phase+': HTTP '+response.status()+' '+response.url());
 });
};
async function ready(page,url=base){
 await page.goto(url,{waitUntil:'domcontentloaded',timeout});
 await page.waitForFunction(()=>Boolean(window.BitBazaarQA?.stats&&
  window.BitBazaarSaveTools?.validate&&window.BIT_BAZAAR_DECOR?.items),
  undefined,{timeout});
 const blocked=await page.locator('#bootRecovery').evaluate(el=>!el.hidden);
 assert.equal(blocked,false,'unexpected blocked-startup recovery screen');
}
async function assertDrawn(page,label){
 await page.waitForFunction(()=>window.BitBazaarQA?.stats?.().renderFrames>2,
   undefined,{timeout});
 const visual=await page.locator('#world').evaluate(canvas=>{
  const {width,height}=canvas,ctx=canvas.getContext('2d');
  const pts=[[10,10],[width/2,10],[width/2,height/2],
   [width/4,height/2],[width*.75,height*.75],[width/2,height-10]];
  const colors=pts.map(([x,y])=>[...ctx.getImageData(
   Math.floor(x),Math.floor(y),1,1).data].join(','));
  return {width,height,unique:new Set(colors).size};
 });
 assert.equal(visual.width,480);
 assert.equal(visual.height,270);
 assert.ok(visual.unique>1,label+' world canvas appears blank');
}
function bundle(save){
 return {format:'bit-bazaar-save-backup',exportVersion:1,
  exportedAt:'2026-11-05T00:00:00.000Z',save};
}
async function chooseFile(page,id,backup){
 await page.locator(id).setInputFiles({
  name:'Bit-Bazaar-Automated-Test.json',mimeType:'application/json',
  buffer:Buffer.from(JSON.stringify(bundle(backup)),'utf8')
 });
}
const context=await browser.newContext({
 viewport:{width:390,height:844},isMobile:true,hasTouch:true,
 deviceScaleFactor:2,acceptDownloads:true
});
const page=await context.newPage();
watch(page);
try{
 phase='Fresh iPhone-sized WebKit boot';
 await ready(page);
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.stats().distinctAssets),3000);
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.stats().displayFaces),60);
 const gallery=await page.evaluate(()=>({
  items:window.BIT_BAZAAR_DECOR.items.length,
  slots:window.BIT_BAZAAR_DECOR.slots.length,
  finalScript:[...document.scripts].some(x=>x.src.includes('decor-art-v0.37.js'))
 }));
 assert.equal(gallery.items,180,
  'live catalog count='+gallery.items+'; slots='+gallery.slots+
  '; final script='+gallery.finalScript+'; page errors: '+problems.join(' | '));
 assert.equal(gallery.slots,232,
  'live catalog slots='+gallery.slots+'; page errors: '+problems.join(' | '));
 await page.locator('#startBtn').click();
 await assertDrawn(page,phase);
 const original=await page.evaluate(()=>window.BitBazaarQA.snapshotNow());
 assert.equal(original.version,1);
 assert.ok(Array.isArray(original.rows)&&original.rows.length===60);
 const audit=await page.evaluate(()=>window.BitBazaarQA.figureIntegrity());
 assert.equal(audit.ok,true,'fresh physical 3,000-figure audit failed');
 assert.equal(audit.total,3000);
 await page.locator('#albumBtn').click();
 await page.locator('#checkBackupInput').waitFor({state:'attached'});

 phase='Read-only iPhone Files-picker backup test';
 const before=await page.evaluate(k=>localStorage.getItem(k),KEY);
 await chooseFile(page,'#checkBackupInput',original);
 await page.waitForFunction(()=>
  (document.querySelector('#saveToolStatus')?.textContent||'')
   .includes('BACKUP FILE READABLE'),undefined,{timeout});
 const feedback=await page.locator('#saveToolStatus').textContent();
 assert.match(feedback,/EXACT MATCH with open shop/);
 assert.deepEqual(await page.evaluate(k=>localStorage.getItem(k),KEY),before,
   'read-only backup check wrote the live saved shop');
 assert.equal(await page.evaluate(()=>window.BitBazaarSaveTools.lastFileCheck()?.match),true);

 phase='Real WebKit download + re-read';
 const downloadPromise=page.waitForEvent('download',{timeout});
 await page.locator('#downloadSaveFile').click();
 const download=await downloadPromise;
 assert.ok(download.suggestedFilename().endsWith('.json'));
 const disk=JSON.parse(await readFile(await download.path(),'utf8'));
 assert.equal(disk.format,'bit-bazaar-save-backup');
 assert.equal(disk.exportVersion,1);
 assert.equal(disk.save.version,1);
 assert.equal(disk.save.rows.length,60);
 const diskSummary=await page.evaluate(raw=>window.BitBazaarSaveTools.validate(raw),disk.save);
 assert.equal(diskSummary.placed,0);
 await chooseFile(page,'#checkBackupInput',disk.save);
 await page.waitForFunction(()=>
  document.querySelector('#saveToolStatus')?.textContent?.includes('EXACT MATCH'),
  undefined,{timeout});

 phase='Disposable Files restore and undo';
 const different=JSON.parse(JSON.stringify(original));
 different.player.x=original.player.x+1;
 const exactOriginal=JSON.stringify(original);
 page.on('dialog',dialog=>dialog.accept());
 const loaded=page.waitForEvent('load',{timeout});
 await chooseFile(page,'#saveFileInput',different);
 await loaded;
 await page.waitForFunction(()=>window.BitBazaarQA?.snapshotNow,undefined,{timeout});
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.snapshotNow().player.x),
  different.player.x,'selected backup did not restore');
 const previous=await page.evaluate(
 ()=>localStorage.getItem('bit-bazaar-v3-before-file-import'));
 assert.ok(previous,'a recoverable pre-import snapshot should exist');
 assert.equal(JSON.parse(previous).player.x,original.player.x);
 // Preserve this browser's original store through the separate undo path.
 const reload=page.waitForEvent('load',{timeout});
 await page.evaluate(()=>window.BitBazaarSaveTools.recoverPrevious());
 await reload;
 await page.waitForFunction(()=>window.BitBazaarQA?.snapshotNow,undefined,{timeout});
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.snapshotNow().player.x),
  original.player.x,'undo did not recover the pre-import shop');
 assert.equal(JSON.parse(exactOriginal).player.x,original.player.x);

 phase='160-art dense-gallery mobile WebKit stress';
 const loadedArt=await page.evaluate(k=>{
  const s=window.BitBazaarQA.snapshotNow();
  const catalog=window.BIT_BAZAAR_DECOR;
  const taken=new Set(),owned=[],placed=[];
  for(const item of catalog.items){
   const site=catalog.slots.find(slot=>slot.kind===item.mount&&!taken.has(slot.id));
   if(!site)continue;
   taken.add(site.id);owned.push(item.id);placed.push([item.id,site.id]);
   if(owned.length===160)break;
  }
  if(owned.length!==160)throw Error('Cannot find 160 matching original art mounts');
  s.decor={owned,placed,adjustments:[],room:[0,0,0,0]};
  window.BitBazaarSaveTools.validate(s);
  localStorage.setItem(k,JSON.stringify(s));return owned.length;
 },KEY);
 assert.equal(loadedArt,160);
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.BitBazaarQA?.stats,undefined,{timeout});
 assert.equal(await page.evaluate(()=>window.BitBazaarQA.decorStatus().owned.length),160);
 await page.locator('#startBtn').click();
 await assertDrawn(page,phase);
 // Walk and turn through several busy aisles in a phone-shaped WebKit viewport.
 await page.keyboard.down('ArrowUp');
 await page.waitForTimeout(1100);
 await page.keyboard.up('ArrowUp');
 await page.keyboard.down('ArrowRight');
 await page.waitForTimeout(1100);
 await page.keyboard.up('ArrowRight');
 const result=await page.evaluate(()=>({
  stats:window.BitBazaarQA.stats(),
  audit:window.BitBazaarQA.figureIntegrity(),
  decor:window.BitBazaarQA.decorRenderStats()
 }));
 assert.equal(result.audit.ok,true,'dense synthetic gallery changed figure integrity');
 assert.equal(result.audit.total,3000);
 assert.equal(result.stats.decorRender.installed,160);
 assert.ok(result.stats.renderFrames>5,'WebKit frame loop not drawing');
 assert.ok(Number.isFinite(result.stats.lastRuntimeMs));
 assert.ok(result.stats.sprites.cacheSize<=112,'sprite cache exceeded iPhone budget');
 assert.ok(Number.isInteger(result.decor.occlusionTests));
 assert.ok(result.decor.budgetUnexamined>=0);

 phase='Low FX startup and drawing';
 const low=await context.newPage();
 watch(low);
 await ready(low,new URL('baseline-v0.55.0-lowfx.html',base).href);
 assert.equal(await low.evaluate(()=>window.BitBazaarQA.decorStatus().owned.length),160);
 await low.locator('#startBtn').click();
 await assertDrawn(low,phase);
 const lowStats=await low.evaluate(()=>window.BitBazaarQA.stats());
 assert.ok(lowStats.sprites.cacheSize<=112);
 await low.close();

 assert.deepEqual(problems,[],'browser JavaScript or network errors');
 console.log('PASS WebKit mobile browser QA: fresh boot, full inventory, 180/232 catalog, canvas, actual JSON download, Files picker check, restore/undo in isolated profile, 160-art stress, normal/Low FX renders and bounded sprites.');
}finally{
 await browser.close();
}
