'use strict';
/* Phase 5 v0.54: no help before lifetime mastery 150; no unstarted-set
   arrows; bounded, already-visible nearby labels; save-compatible switch. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const load=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const window={};
vm.runInNewContext(load('assets/cowards-glasses-v0.54.js'),{window,Set,Map,Math,Number,Array,Object},{timeout:3000});
const g=window.BIT_BAZAAR_GLASSES;
assert.ok(g);
assert.equal(g.UNLOCK,150);
assert.equal(g.MAX_LABELS,6);
assert.equal(g.unlocked(Array.from({length:149},(_,i)=>i)),false);
assert.equal(g.unlocked(Array.from({length:150},(_,i)=>i)),true);
assert.equal(g.unlocked([...Array.from({length:149},(_,i)=>i),148]),false,
 'duplicate mastery IDs must not count as unique sets');
assert.equal(g.unlocked(new Set(Array.from({length:150},(_,i)=>i))),true);
const rows=Array.from({length:60},()=>Array.from({length:5},()=>[]));
const shelves=Array.from({length:60},(_,id)=>({
 id,face:id%2===0?1:-1,
 fixture:{x:12+id%4*10,z:10+Math.floor(id/4)*4,
  nx:0,nz:1,depth:1.72}
}));
assert.equal(g.target(37,rows,shelves),null,'unstarted set NEVER has target');
rows[14][2]=[31,36,39];
let t=g.target(37,rows,shelves);
assert.equal(t.setId,3);
assert.equal(t.face,14);
assert.equal(t.row,2);
assert.equal(t.number,8);
assert.equal(g.target(47,rows,shelves),null,'other set never reveals its shelf');
assert.equal(g.target(-1,rows,shelves),null);
assert.equal(g.target(3000,rows,shelves),null);
const saved=JSON.parse(JSON.stringify(rows));
rows[14][2]=[];
assert.equal(g.target(37,rows,shelves),null,'after clearing the row, guidance disappears');
rows[14][2]=saved[14][2];
assert.equal(g.target(37,rows,shelves).face,14,'persistent assigned shelf recovered');
const player={x:20,z:20,yaw:0};
assert.equal(g.direction(player,null),null);
const north=g.direction(player,{x:20,z:10});
assert.ok(Math.abs(north.angle)<1e-10,'north/up is a forward arrow at yaw zero');
const south=g.direction(player,{x:20,z:30});
assert.ok(Math.abs(south.angle)>=Math.PI-1e-10,'behind is still a visible arrow');
const east=g.direction(player,{x:30,z:20});
assert.ok(Math.abs(east.angle-Math.PI/2)<1e-10,'right bearing');
const strokes=[];
const ctx={fillStyle:'',font:'',textAlign:'',save(){strokes.push('save')},
 restore(){strokes.push('restore')},translate(){strokes.push('translate')},
 rotate(){strokes.push('rotate')},beginPath(){strokes.push('begin')},
 moveTo(){},lineTo(){},closePath(){},fill(){strokes.push('fill')},
 fillRect(){strokes.push('rect')},fillText(v){strokes.push(v)}};
assert.equal(g.drawArrow(ctx,480,270,player,null),false);
assert.equal(strokes.length,0,'unstarted destination draws no arrow');
assert.equal(g.drawArrow(ctx,480,270,player,t),true);
assert.ok(strokes.some(x=>String(x).startsWith('ROW 3')),'arrow shows chosen row');
assert.equal(strokes.filter(x=>x==='fill').length,2,'single small hand-rendered chevron');
strokes.length=0;
const figures=Array.from({length:25},(_,id)=>({
 type:'fig',piece:{id:1200+id,x:22+(id%4)*.14,z:18-(id%5)*.14,onFloor:true}
}));
const distant={type:'fig',piece:{id:9,x:69,z:65,onFloor:true}};
const blocked={type:'shelf',piece:{id:6,x:20,z:15,onFloor:true}};
const count=g.drawHighlights(ctx,[blocked,distant,...figures],
 (x,z)=>({x:240+(x-20)*4,y:126+(z-20)*3,depth:3}),player,480,270);
assert.equal(count,6,'local labels must have an explicit six-figure cap');
assert.equal(strokes.filter(x=>String(x).startsWith('#')).length,6);
assert.equal(strokes.some(x=>/^#\\d+ · SET 1$/.test(String(x))),false,
 'faraway figure locations must never be disclosed');
strokes.length=0;
assert.equal(g.drawHighlights(ctx,[distant],()=>({x:240,y:100,depth:3}),player,480,270),0);
assert.equal(strokes.length,0);
const env={window:{BIT_BAZAAR_DECOR:{items:[],slots:[]}},document:{
 addEventListener(){},getElementById(){return null}},localStorage:{getItem(){return null}},
 Math,Set,Map,JSON,Date,Blob,Number};
vm.runInNewContext(load('assets/save-manager-v0.54.js'),env,{timeout:3000});
assert.throws(()=>env.window.BitBazaarSaveTools.validate({version:1,glassesEquipped:'true'}),
 /Invalid Coward's Glasses setting/);
assert.throws(()=>env.window.BitBazaarSaveTools.validate({version:1,glassesEquipped:1}),
 /Invalid Coward's Glasses setting/);
for(const engine of ['game-v0.54.0.js','game-v0.54.0-lowfx.js']){
 const code=load(engine);
 assert.ok(code.includes('GLASSES.target(tote[0],rows,shelves)'));
 assert.ok(code.includes('glassesEquipped=raw.glassesEquipped===true&&GLASSES.unlocked(lifetimePerfect)'));
 assert.ok(code.includes('glassesEquipped,lifetimePerfect:[...lifetimePerfect]'));
 assert.ok(code.includes("GLASSES.drawHighlights(ctx,entities,project,player,W,H)"));
 assert.ok(code.includes("if(glassesTarget)GLASSES.drawArrow"));
 assert.ok(code.includes("glassesState:()=>"));
 assert.ok(code.includes("glassesToggle:toggleGlasses"));
}
for(const page of ['index.html','preview-v0.54.0.html','baseline-v0.54.0-lowfx.html']){
 const s=load(page);
 for(const id of ['glassesDock','glassesToggle','glassesProgress','cowardBadge'])
  assert.ok(s.includes('id="'+id+'"'),page+' missing '+id);
 assert.ok(s.includes("assets/cowards-glasses-v0.54.js"));
 assert.ok(s.includes("assets/save-manager-v0.54.js"));
 assert.ok(s.indexOf("assets/cowards-glasses-v0.54.js")<s.indexOf("game-v0.54.0"));
}
assert.ok(load('style-v0.54.0.css').includes('.coward-badge[hidden]'));
assert.ok(load('sw.js').includes('bit-bazaar-v0.54.0'));
assert.ok(load('sw.js').includes('./assets/cowards-glasses-v0.54.js'));
console.log('PASS Phase 5 v0.54: lifetime unlock 150, true started-set shelf arrow only, 6 local labels maximum, COWARD persistent HUD, optional safe boolean save in both engine builds and offline cache.');
