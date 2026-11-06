'use strict';
// v0.61 Collector Postcards: no player save changes, actual pixel photo only.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const ops=[],created=[];
const ctx={imageSmoothingEnabled:true,fillStyle:'',font:'',textAlign:'start',
 fillRect(...a){ops.push(['rect',...a])},
 fillText(...a){ops.push(['text',...a])},
 drawImage(...a){ops.push(['image',...a])}};
const doc={createElement(tag){assert.equal(tag,'canvas');
 const result={width:0,height:0,getContext(){return ctx}};
 created.push(result);return result;}};
const window={};
vm.runInNewContext(read('assets/postcards-v0.61.js'),{window,document:doc,Number,Array,Object,Math,String},{timeout:3000});
const P=window.BIT_BAZAAR_POSTCARDS;
assert.ok(P);
assert.deepEqual(Array.from(P.STYLES,s=>s.id),['plain','hearthwood','night','crown']);
assert.equal(P.styleAt('invalid').id,'plain');
assert.equal(P.styleAt(-1).id,'crown');
assert.equal(P.nextStyle('plain').id,'hearthwood');
assert.equal(P.nextStyle('hearthwood').id,'night');
assert.equal(P.nextStyle('night').id,'crown');
assert.equal(P.nextStyle('crown').id,'plain');
const clamp=P.facts({shelved:4000,perfect:-1,mastered:99.9,decorations:999});
assert.equal(clamp.shelved,3000);
assert.equal(clamp.perfect,0);
assert.equal(clamp.mastered,99);
assert.equal(clamp.decorations,180);
assert.equal(Object.isFrozen(clamp),true);
const first={width:960,height:540};
assert.equal(P.compose(first,'plain',{shelved:3000}),first,'plain photo is exact original');
assert.equal(created.length,0,'unframed view uses no second canvas');
assert.throws(()=>P.compose({width:1600,height:540},'night',{}),/Invalid photographic source/);
assert.throws(()=>P.compose(null,'night',{}),/Invalid photographic source/);
const saved=Object.freeze({shelved:2980,perfect:296,mastered:300,decorations:17});
const savedBefore=JSON.stringify(saved);
for(const style of ['hearthwood','night','crown']){
 const start=ops.length;
 const postcard=P.compose(first,style,saved);
 assert.equal(postcard.width,1056);
 assert.equal(postcard.height,740);
 assert.equal(ctx.imageSmoothingEnabled,false);
 const drawn=ops.slice(start),photo=drawn.find(o=>o[0]==='image');
 assert.ok(photo);
 assert.equal(photo[1],first);
 assert.deepEqual(photo.slice(2),[48,68,960,540]);
 const text=drawn.filter(o=>o[0]==='text').map(o=>o[1]).join(' / ');
 assert.ok(text.includes('THE BIT BAZAAR'));
 assert.ok(text.includes('2,980/3,000 SHELVED'));
 assert.ok(text.includes('296/300 PERFECT'));
 assert.ok(text.includes('300/300 LIFETIME SETS'));
 assert.ok(text.includes('17/180 OWNED ART'));
 assert.ok(text.includes(P.styleAt(style).name));
 assert.ok(drawn.filter(o=>o[0]==='rect').length>=40);
}
assert.equal(JSON.stringify(saved),savedBefore);
const vertical=P.compose({width:760,height:900},'hearthwood',{shelved:3000,perfect:300});
assert.equal(vertical.width,856);
assert.equal(vertical.height,1100);
assert.equal(created.length,4);
for(const file of ['game-v0.61.0.js','game-v0.61.0-lowfx.js']){
 const game=read(file);
 assert.match(game,/const POSTCARDS=window\.BIT_BAZAAR_POSTCARDS/);
 assert.match(game,/function cyclePostcardStyle\(\)/);
 assert.match(game,/function postcardExportCanvas\(\)/);
 assert.match(game,/return POSTCARDS\.compose\(image,postcardStyle,postcardFacts\(\)\)/);
 assert.match(game,/const picture=postcardExportCanvas\(\)/);
 assert.match(game,/typeof File==='function'\?new File/);
 assert.match(game,/postcardCycle:cyclePostcardStyle/);
 assert.match(game,/postcardExportCanvas:\(\)=>showcaseActive/);
 assert.match(game,/postcardStyle='plain'/);
 assert.match(game,/player:showcaseReturnPose\?\{\.\.\.showcaseReturnPose\}:player/);
 const savedRegion=game.slice(game.indexOf('function saveData(){'),game.indexOf('function save(){'));
 assert.ok(!savedRegion.includes('postcard'),'frame preference never saved');
}
assert.match(read('game-v0.61.0.js'),/baseline-v0\.61\.0-lowfx\.html\?recovery=tracker-perf/);
for(const page of ['preview-v0.61.0.html','baseline-v0.61.0-lowfx.html']){
 const html=read(page);
 assert.match(html,/id="showcaseFrame"/);
 assert.match(html,/assets\/postcards-v0\.61\.js/);
 assert.ok(html.indexOf('postcards-v0.61.js')<html.indexOf('game-v0.61.0'));
 assert.match(html,/style-v0\.61\.0\.css/);
}
assert.match(read('sw.js'),/bit-bazaar-v0\.62\.0/);
assert.match(read('sw.js'),/postcards-v0\.61\.js/);
assert.match(read('sw.js'),/game-v0\.60\.0\.js/);
assert.match(read('style-v0.61.0.css'),/data-postcard-style="hearthwood"/);
console.log('PASS v0.61 Collector Postcards: three original framed styles and untouched plain photo, live clamped physical totals, 2D original pixel canvas at 1056x740 and 856x1100, no save changes, both engines, v0.60 rollback.');
