'use strict';
/* Bit Bazaar v0.50: deep startup preflight guards every existing figure. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const KEY='bit-bazaar-save-v3',LEGACY='bit-bazaar-save-v1';
const clean=()=>({version:1,
 rows:Array.from({length:60},()=>Array.from({length:5},()=>[])),
 slots:Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null))),
 tote:[],selected:null,cleaning:Array(60).fill(0),floorCleaning:Array(45).fill(0),
 seenFigures:[],pinnedSets:[],lifetimePerfect:[],trackedSetId:null,revealed:[],
 ground:[],player:{x:35,z:68,yaw:0,pitch:0},
 decor:{owned:[],placed:[],adjustments:[],room:[0,0,0,0]}});
const copy=o=>JSON.parse(JSON.stringify(o));
const store=new Map(),events={},view=new Map(),writes=[];
for(const id of ['bootRecovery','bootRecoveryReason','bootRecoveryPrevious','bootRecoveryRaw','bootRecoveryStatus'])
 view.set(id,{hidden:true,textContent:'',disabled:false});
const win={
 BIT_BAZAAR_DECOR:{items:[{id:'frame',mount:'wall'}],slots:[{id:0,kind:'wall',x:25,z:2,side:'NORTH'}]},
 BitBazaarSaveHold:false,BitBazaarImportInProgress:false,
 confirm:()=>false,location:{reload(){throw Error('unexpected reload');}}
};
const document={
 getElementById:id=>view.get(id)||null,
 addEventListener:(event,fn)=>events[event]=fn,
 createElement:()=>({href:'',download:'',click(){},remove(){}}),
 body:{appendChild(){}}
};
const context=vm.createContext({window:win,document,Blob,URL:{
 createObjectURL:()=>'/blob',revokeObjectURL(){}
},localStorage:{
 getItem:k=>store.has(k)?store.get(k):null,
 setItem(k,v){writes.push(k);store.set(k,String(v));},
 removeItem(k){writes.push('REMOVE '+k);store.delete(k);}
},navigator:{},Date,JSON,Math,Set,Map,setTimeout:()=>{}});
vm.runInContext(read('assets/save-manager-v0.49.js'),context,{timeout:3000});
vm.runInContext(read('assets/boot-recovery-v0.50.js'),context,{timeout:3000});
const boot=win.BitBazaarBootRecovery,validate=win.BitBazaarSaveTools.validate;
assert.ok(boot&&validate);
const setCurrent=value=>{store.set(KEY,typeof value==='string'?value:JSON.stringify(value));writes.length=0;};
function statusFor(value,label,expected='blocked'){
 setCurrent(value);
 const raw=store.get(KEY);
 const result=boot.inspect();
 assert.equal(result.kind,expected,label);
 assert.equal(store.get(KEY),raw,'preflight must preserve original bytes: '+label);
 assert.equal(writes.length,0,'preflight must never write storage: '+label);
 return result;
}
const normal=clean();
assert.equal(boot.inspect().kind,'fresh');
assert.equal(statusFor(normal,'valid fresh 60-face ledger','valid').source,KEY);
const two=clean();
two.rows[0][0]=[0,1];two.slots[0][0][1]=1;two.slots[0][0][0]=0;
assert.equal(statusFor(two,'valid partial shelf','valid').raw.rows[0][0].length,2);
const swapped=copy(two);swapped.slots[0][0][1]=2;
statusFor(swapped,'shelf and numbered positions disagree');
const duplicate=copy(two);duplicate.rows[1][0]=[1];duplicate.slots[1][0][0]=1;
statusFor(duplicate,'same figure on two separate shelves');
const badGround=copy(two);badGround.ground=[[0,33,35]];
statusFor(badGround,'shelved and dropped duplicate figure');
const carried=copy(two);carried.tote=[1];carried.selected=1;
statusFor(carried,'shelved and held duplicate figure');
const badMaterial=copy(normal);badMaterial.decor.owned=['unlisted-art'];
statusFor(badMaterial,'unknown decoration ownership');
const badHistory=copy(normal);badHistory.lifetimePerfect=[500];
statusFor(badHistory,'invalid lifetime achievement');
const badCleaning=copy(normal);badCleaning.cleaning[0]=8;
statusFor(badCleaning,'invalid persistent cleaning state');
const badPlayer=copy(normal);badPlayer.player.x=Infinity;
// JSON turns Infinity into null: must still fail validation.
statusFor(badPlayer,'invalid camera position');
const broken=copy(two);broken.slots[0][0][0]=undefined;
statusFor(broken,'invalid slot value');
const loose=copy(normal);loose.ground=[[2999,30,35]];
statusFor(loose,'valid floor figure','valid');
const oldTwenty={version:1,rows:Array.from({length:20},()=>Array.from({length:5},()=>[]))};
oldTwenty.rows[0][0]=[0,1,2];
store.delete(KEY);store.set(LEGACY,JSON.stringify(oldTwenty));writes.length=0;
assert.equal(boot.inspect().kind,'valid','older 1000-piece saves remain migratable');
assert.equal(writes.length,0);
const older60={version:1,rows:Array.from({length:60},()=>Array.from({length:5},()=>[]))};
older60.rows[0][0]=[100,101,102];
statusFor(older60,'older 60-face save with missing positions can migrate','valid');
const olderBad=copy(older60);olderBad.rows[2][4]=[100];
statusFor(olderBad,'corrupt legacy migration figure blocked');
const olderSlots=copy(older60);
olderSlots.slots=Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
olderSlots.slots[0][0][0]=100;olderSlots.slots[0][0][1]=101;
statusFor(olderSlots,'historical numbered row cannot silently drop figure');
const original=statusFor(duplicate,'quarantine original duplicated shop');
boot.show(original);
assert.equal(win.BitBazaarSaveHold,true);
assert.equal(view.get('bootRecovery').hidden,false);
assert.match(view.get('bootRecoveryStatus').textContent,/NOT BEEN ERASED/);
assert.equal(writes.length,0);
// Current normal/Low FX engines must consume the same boot module.
for(const p of ['game-v0.50.0.js','game-v0.50.0-lowfx.js']){
 const s=read(p);
 assert.ok(s.includes('BitBazaarBootRecovery?.inspect?.()'));
 assert.ok(s.includes('window.BitBazaarSaveHold=true;'));
 assert.ok(s.includes('bit-bazaar-save-v3'));
}
for(const p of ['preview-v0.50.0.html','baseline-v0.50.0-lowfx.html']){
 const html=read(p);
 assert.ok(html.includes('boot-recovery-v0.50.js'),p);
 assert.ok(html.indexOf('boot-recovery-v0.50.js')<html.indexOf('game-v0.50.0'),p);
}
const sw=read('sw.js');
assert.ok(sw.includes('bit-bazaar-v0.53.0'));
assert.ok(sw.includes('./assets/boot-recovery-v0.50.js'));
assert.ok(sw.includes('./assets/boot-recovery-v0.49.js'));
console.log('PASS v0.50: current saves deep-validated for duplicate figures, slot/ground/carry conflicts, artwork and mastery before boot; valid 20/60-face historical migrations still accepted and no bytes overwritten.');
