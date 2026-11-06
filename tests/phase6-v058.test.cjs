'use strict';
/* Bit Bazaar Phase 6.4 — optional finale and exclusive Collector's Monument. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};
vm.runInNewContext(read('assets/finale-v0.58.js'),{
 window:env.window,Set,Map,Array,Object,Math,Number
},{timeout:3000});
const F=env.window.BIT_BAZAAR_FINALE;
assert.ok(F);
assert.equal(F.chapters.length,4);
assert.equal(new Set(Array.from(F.chapters,c=>c.title)).size,4);
assert.equal(F.unlocked([]),false);
assert.equal(F.unlocked(['complete-archive','cowards-choice']),false,
 '300 lifetime alone never unlocks the monument');
assert.equal(F.unlocked(['perfect-bazaar']),true);
assert.equal(F.unlocked(new Set(['perfect-bazaar'])),true);
assert.equal(F.status([],true).unlocked,false);
assert.equal(F.status(['perfect-bazaar'],false).replayable,true);
assert.equal(F.status(['perfect-bazaar'],true).viewed,true);
assert.equal(F.monument.kind,'collector-monument');
assert.equal(F.monument.location,'EAST ENTRANCE ALCOVE');
assert.equal(F.monument.x,48);
assert.equal(F.monument.z,65.4);
for(let chapter=0;chapter<4;chapter++){
 const html=F.scene(chapter);
 assert.match(html,/class="finale-scene /);
 assert.match(html,new RegExp('data-finale-chapter="'+chapter+'"'));
 assert.match(html,/id="finaleTitle"/);
 assert.match(html,/<div class="finale-plinth"><b>3,000<\/b>/);
 assert.match(html,/No reset|collection|shelf|perfect|Monument|collect|stories|treasure|room|crowns|restored|figures|miniatures/i);
}
assert.match(F.scene(500),/data-finale-chapter="3"/);
const paint=[];
const ctx={
 fillStyle:'',textAlign:'start',font:'',
 fillRect(...a){paint.push(['fill',...a]);},
 fillText(...a){paint.push(['text',...a]);},
 beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},
 save(){},restore(){}
};
const project=(x,z,h)=>({x:240+(x-48)*28,y:210-h*42,depth:7,side:0,height:h});
const quad=(...args)=>paint.push(['quad',...args]);
const line=(...args)=>paint.push(['line',...args]);
assert.equal(F.draw(ctx,project,quad,line,0),true);
assert.ok(paint.filter(a=>a[0]==='quad').length>=20,'substantial architectural 3D pixel art');
assert.ok(paint.some(a=>a[0]==='text'&&a[1]==='3,000'));
for(const trim of [1,2])assert.equal(F.draw(ctx,project,quad,line,trim),true);
assert.equal(F.draw(ctx,()=>({x:0,y:0,depth:50}),quad,line),false,'distance-culls artwork');
assert.equal(F.draw(null,project,quad,line),false);
const camera=(x,z,h)=>({x:240+(x-48)*100,y:260-h*68,depth:4,side:0,height:h});
assert.equal(F.target({x:48,z:69},camera,240,135)?.kind,'monument');
assert.equal(F.target({x:48,z:69},camera,20,135),null);
assert.equal(F.target({x:48,z:69},camera,240,400),null);
assert.equal(F.target({x:48,z:65.4},camera,240,135),null);
assert.equal(F.target({x:48,z:90},camera,240,135),null);
// Both engines wire interactive world focus, a skippable optional dialog,
// an immutable medal-derived unlock and save/restore of only its viewed bit.
for(const engine of ['game-v0.58.0.js','game-v0.58.0-lowfx.js']){
 const game=read(engine);
 assert.match(game,/const FINALE=window\.BIT_BAZAAR_FINALE/);
 assert.match(game,/finaleViewed=raw\.finaleViewed===true/);
 assert.match(game,/honorTrim,finaleViewed,achievementData/);
 assert.match(game,/finaleUnlocked=FINALE\.unlocked\(achievementData\.earned\)/);
 assert.match(game,/if\(!playing\|\|!finaleUnlocked/);
 assert.match(game,/function openFinale\(\)/);
 assert.match(game,/function closeFinale\(\)/);
 assert.match(game,/function skipFinale\(\)/);
 assert.match(game,/function replayFinale\(\)/);
 assert.match(game,/modal='finale'/);
 assert.match(game,/if\(last&&!finaleViewed\)/);
 assert.match(game,/FINALE\.target\(player,project,AIM_X,AIM_Y\)/);
 assert.match(game,/FINALE\.draw\(ctx,project,solidQuad,line3,honorTrim\)/);
 assert.match(game,/finaleState:\(\)=>/);
 assert.ok(!game.includes('if(completed===NUM_RACKS*ROWS){setTimeout(()=>showVictory(),1200)}'));
 assert.ok(game.includes("const STORE_KEY='bit-bazaar-save-v3'"));
}
for(const page of ['preview-v0.58.0.html','baseline-v0.58.0-lowfx.html']){
 const html=read(page);
 for(const id of ['finaleOverlay','finaleContent','finaleBtn','finaleClose','finaleNext','finaleReplay','finaleSkip']){
  assert.ok(html.includes('id="'+id+'"'),page+' missing '+id);
 }
 assert.ok(html.indexOf('assets/finale-v0.58.js')<html.indexOf('game-v0.58.0'));
 assert.ok(html.indexOf('assets/finale-v0.58.js')<html.indexOf('save-manager-v0.58.js'));
 assert.ok(html.includes('style-v0.58.0.css'));
}
const script=read('assets/save-manager-v0.58.js');
assert.ok(script.includes("typeof raw.finaleViewed!=='boolean'"));
const window={BIT_BAZAAR_ACHIEVEMENTS:{validateData(){}},BIT_BAZAAR_FINALE:F};
vm.runInNewContext(script,{window,document:{addEventListener(){},getElementById(){return null}},
 localStorage:{getItem(){return null}},Math,Map,Set,Array,Object,JSON,Number,Date,Blob},{timeout:3000});
assert.throws(()=>window.BitBazaarSaveTools.validate({version:1,finaleViewed:'true'}),/Invalid Collector/);
assert.throws(()=>window.BitBazaarSaveTools.validate({version:1,finaleViewed:1}),/Invalid Collector/);
const sw=read('sw.js');
assert.match(sw,/bit-bazaar-v0\.61\.0/);
assert.match(sw,/assets\/finale-v0\.58\.js/);
assert.match(sw,/assets\/save-manager-v0\.58\.js/);
assert.match(sw,/game-v0\.57\.0\.js/,'previous stable gameplay remains available');
assert.match(read('style-v0.58.0.css'),/\.finale-overlay\[hidden\]/);
assert.match(read('style-v0.58.0.css'),/prefers-reduced-motion/);
console.log('PASS Phase 6.4: permanent medal-derived monument; handcrafted projected world sculpture; four optional chapters with skip/replay/return; old saves compatible, strict viewed preference, 3000-figure save unchanged, standard/Low FX parity and offline rollback.');
