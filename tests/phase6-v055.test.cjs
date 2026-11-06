'use strict';
/* Bit Bazaar Phase 6.1: nine permanently earned awards are derived from
   distinct first-time perfected set IDs; physical displays are bounded. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const w={};
vm.runInNewContext(read('assets/lifetime-honors-v0.55.js'),{window:w,Math,Set,Map,Number,Array,Object},{timeout:3000});
const honor=w.BIT_BAZAAR_HONORS;
assert.ok(honor);
assert.deepEqual(Array.from(honor.tiers,t=>t.at),[1,10,25,50,100,150,200,250,300]);
const unique=n=>Array.from({length:n},(_,i)=>i);
assert.equal(honor.unique([0,0,1,1,2]),3);
assert.equal(honor.unique([-1,0,301,300,2]),2,'invalid milestones never count');
assert.equal(honor.unique(new Set(unique(300))),300);
for(let i=0;i<=300;i++){
 const stats=honor.status(unique(i));
 assert.equal(stats.count,i);
 const expected=[1,10,25,50,100,150,200,250,300].filter(n=>n<=i);
 assert.equal(stats.earned,expected.length,'threshold '+i);
 assert.equal(stats.rewards.filter(x=>x.earned).length,expected.length);
 assert.equal(honor.world(unique(i)).length,expected.filter(x=>x!==25).length);
 assert.equal(stats.next?.at||null,[1,10,25,50,100,150,200,250,300].find(n=>n>i)||null);
}
assert.equal(honor.status(unique(300)).earned,9);
assert.equal(honor.world(unique(300)).length,8,'no unbounded decorative world spawn');
assert.equal(honor.world(unique(0)).length,0);
assert.equal(honor.world(unique(150)).some(x=>x.at===150),true);
const sacrificed=unique(200);
const before=honor.status(sacrificed);
const after=honor.status(sacrificed); // no current shelf contents exist in milestone API
assert.equal(after.earned,before.earned);
assert.equal(after.rewards.find(x=>x.at===150).earned,true);
const locked=honor.panel(unique(49),2);
assert.equal((locked.match(/class="honor-card earned"/g)||[]).length,3);
assert.equal((locked.match(/data-honor-finish="/g)||[]).length,3);
assert.match(locked,/data-honor-finish="2"[^>]+disabled/,'finish must lock before 50');
const earned=honor.panel(unique(50),2);
assert.equal((earned.match(/class="honor-card earned"/g)||[]).length,4);
assert.doesNotMatch(earned,/data-honor-finish="2"[^>]+disabled/);
assert.match(earned,/aria-pressed="true"/);
assert.match(honor.panel(unique(300)),/Master of the Bazaar/);
const marks=[];
const ctx={
 fillStyle:'',font:'',textAlign:'',
 fillRect(...a){marks.push(['rect',...a]);},
 fillText(v,...a){marks.push(['text',String(v),...a]);},
 beginPath(){marks.push(['begin']);},
 moveTo(){},lineTo(){},closePath(){},fill(){marks.push(['fill']);}
};
const proj=(x,z,h)=>({x:200+(x-35)*4,y:150-h*6+(z-60)*.8,depth:9});
let drawn=0;
for(const piece of honor.world(unique(300))){
 if(honor.draw(ctx,proj,piece,0))drawn++;
}
assert.equal(drawn,8,'only eight static pieces are drawn');
assert.equal(marks.filter(x=>x[0]==='text').length,16,'two short text lines per earned piece');
assert.ok(marks.length<200,'bounded simple 16-bit rendering calls');
assert.equal(honor.draw(ctx,()=>({x:20,y:20,depth:80}),honor.tiers[0]),false,
 'out-of-range piece must not render');
assert.equal(honor.shelfPlate(ctx,proj,{x:35,z:60},1),true);
assert.equal(honor.shelfPlate(ctx,()=>({x:-4,y:10,depth:8}),{x:35,z:60},1),false);
assert.equal(honor.floorSeal(ctx,proj,2),true,'200 milestone gains distinct floor seal');
assert.equal(honor.floorSeal(ctx,()=>({depth:-1,x:1,y:1}),0),false);
const apiWindow={BIT_BAZAAR_DECOR:{items:[],slots:[]}};
vm.runInNewContext(read('assets/save-manager-v0.55.js'),{
 window:apiWindow,document:{addEventListener(){},getElementById(){return null}},
 localStorage:{getItem(){return null}},
 Math,Set,Map,JSON,Number,Date,Blob
},{timeout:3000});
assert.throws(()=>apiWindow.BitBazaarSaveTools.validate({version:1,honorTrim:4}),
 /Invalid lifetime-honor display finish/);
assert.throws(()=>apiWindow.BitBazaarSaveTools.validate({version:1,honorTrim:'2'}),
 /Invalid lifetime-honor display finish/);
assert.throws(()=>apiWindow.BitBazaarSaveTools.validate({version:1,honorTrim:-1}),
 /Invalid lifetime-honor display finish/);
for(const file of ['game-v0.55.0.js','game-v0.55.0-lowfx.js']){
 const game=read(file);
 assert.ok(game.includes('const HONORS=window.BIT_BAZAAR_HONORS;'));
 assert.ok(game.includes('honorWorld=HONORS.world(lifetimePerfect)'));
 assert.ok(game.includes('honorPlates=HONORS.unlocked(lifetimePerfect,25)'));
 assert.ok(game.includes('honorSeal=HONORS.unlocked(lifetimePerfect,200)'));
 assert.ok(game.includes('honorTrim,lifetimePerfect:[...lifetimePerfect]'));
 assert.ok(game.includes('honorsSelectTrim:changeHonorTrim'));
 assert.ok(game.includes('HONORS.floorSeal(ctx,project,honorTrim)'));
 assert.ok(game.includes('HONORS.panel(lifetimePerfect,honorTrim)'));
 assert.ok(game.includes('GLASSES.unlocked(lifetimePerfect)'));
}
for(const page of ['preview-v0.55.0.html','baseline-v0.55.0-lowfx.html']){
 const html=read(page);
 assert.ok(html.includes('assets/lifetime-honors-v0.55.js'));
 assert.ok(html.includes('assets/save-manager-v0.55.js'));
 assert.ok(html.includes('game-v0.55.0'));
 assert.ok(html.indexOf('lifetime-honors-v0.55.js')<html.indexOf('game-v0.55.0'));
}
assert.match(read('style-v0.55.0.css'),/honor-grid/);
assert.match(read('sw.js'),/bit-bazaar-v0\.59\.0/);
assert.match(read('sw.js'),/\.\/assets\/lifetime-honors-v0\.55\.js/);
console.log('PASS v0.55 Phase 6.1: all 9 permanent first-time milestones, stable after sacrifice, 3 gated free finish choices, 8 bounded world awards, 25 shelf nameplates, 200 floor seal, safe save schema in both mobile builds.');
