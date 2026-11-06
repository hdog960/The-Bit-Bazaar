'use strict';
/* v0.45 — real share payload, cancellation, storage protection and Files restore. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const KEY='bit-bazaar-save-v3',PREVIOUS='bit-bazaar-v3-before-file-import';
let downloads=0,shares=0,sharePayload=null,canShare=true,shareError=null;
let saveOK=true,physicalOK=true,checks=0,reloads=0,confirmOK=true;
const store=new Map(),listeners={};
const status={textContent:'',classList:{toggle(k,v){this.error=v;}}};
const collection={items:[{id:'frame',mount:'wall'}],
 slots:[{id:0,kind:'wall',side:'NORTH',x:30,z:2}]};
const rows=Array.from({length:60},()=>Array.from({length:5},()=>[]));
const slots=Array.from({length:60},()=>Array.from({length:5},()=>Array(10).fill(null)));
rows[0][0]=Array.from({length:10},(_,i)=>i);
slots[0][0]=rows[0][0].slice();
const fixture=()=>({
 version:1,rows,slots,tote:[],selected:null,
 cleaning:Array(60).fill(0),floorCleaning:Array(45).fill(0),
 seenFigures:rows[0][0].slice(),lifetimePerfect:[0],pinnedSets:[],
 trackedSetId:null,revealed:[],ground:[[10,20,30]],
 player:{x:35,z:68,yaw:0,pitch:0},
 decor:{owned:['frame'],placed:[['frame',0]],adjustments:[],room:[0,0,0,0]}
});
let live=fixture();
class MockFile {
 constructor(parts,name,opts){this.contents=parts.join('');this.name=name;this.type=opts.type;this.size=this.contents.length;}
 async text(){return this.contents;}
}
const nav={
 canShare:({files})=>canShare&&files.length===1&&files[0].type==='application/json',
 share:async data=>{shares++;if(shareError)throw shareError;sharePayload=data;}
};
const w={
 BIT_BAZAAR_DECOR:collection,BitBazaarImportInProgress:false,
 confirm:()=>confirmOK,location:{reload(){reloads++;}},
 BitBazaarQA:{
  saveNow(){checks++;if(!saveOK)return false;store.set(KEY,JSON.stringify(live));return true;},
  figureIntegrity:()=>({ok:physicalOK,total:3000,shelved:10,held:0,hiddenFound:0,issues:physicalOK?[]:['FAILED_AUDIT']})
 }
};
const document={
 getElementById:id=>id==='saveToolStatus'?status:null,
 addEventListener:(name,fn)=>listeners[name]=fn,
 createElement:()=>({href:'',download:'',click(){downloads++;},remove(){}}),
 body:{appendChild(){}}
};
const ctx=vm.createContext({window:w,document,navigator:nav,File:MockFile,
 localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))},
 URL:{createObjectURL:()=>'/fake-blob',revokeObjectURL(){}},
 Blob,Date,Math,Set,Map,JSON,setTimeout:()=>{}});
vm.runInContext(read('assets/save-manager-v0.45.js'),ctx,{timeout:3000});
const api=w.BitBazaarSaveTools;
assert.ok(api.shareFile&&api.importFile&&api.exportFile&&api.recoverPrevious);
assert.equal(api.validate(live).placed,10);
assert.equal(api.validate(live).ownedArt,1);
async function main(){
 assert.equal(await api.shareFile(),true);
 assert.equal(shares,1);
 assert.equal(downloads,0,'sharing should not trigger a secondary download');
 assert.equal(sharePayload.files.length,1);
 const sent=sharePayload.files[0];
 assert.match(sent.name,/^Bit-Bazaar-Save-\d{4}-\d{2}-\d{2}\.json$/);
 assert.equal(sent.type,'application/json');
 const bundle=JSON.parse(await sent.text());
 assert.equal(bundle.format,'bit-bazaar-save-backup');
 assert.equal(bundle.exportVersion,1);
 assert.equal(bundle.save.rows[0][0].length,10);
 assert.equal(bundle.save.decor.owned[0],'frame');
 assert.ok(status.textContent.includes('Confirm the JSON appears in Files'),
  'share completion never claims actual Files persistence');
 assert.equal(api.exportFile(),true);
 assert.equal(downloads,1);
 assert.ok(status.textContent.includes('DOWNLOAD REQUESTED'));
 // Unsupported browser must not launch an arbitrary download or a false success.
 canShare=false;
 assert.equal(await api.shareFile(),false);
 assert.ok(status.textContent.includes('DOWNLOAD SAVE'));
 assert.equal(shares,1);
 canShare=true;
 // A dismissed share sheet is explicitly cancelled, not backed up.
 shareError={name:'AbortError',message:'User dismissed'};
 assert.equal(await api.shareFile(),false);
 assert.ok(status.textContent.includes('CANCELLED'));
 assert.equal(downloads,1);
 shareError=Error('Web Share failed');
 assert.equal(await api.shareFile(),false);
 assert.ok(status.textContent.includes('SHARE FAILED'));
 shareError=null;
 // No stale share if the live shop cannot be written or audited.
 const beforeShares=shares;
 saveOK=false;
 assert.equal(await api.shareFile(),false);
 assert.equal(shares,beforeShares);
 saveOK=true;
 physicalOK=false;
 assert.equal(await api.shareFile(),false);
 assert.equal(shares,beforeShares);
 assert.match(status.textContent,/Physical shop audit failed/);
 physicalOK=true;
 const oldFile=ctx.File;ctx.File=undefined;
 assert.equal(await api.shareFile(),false);
 assert.ok(status.textContent.includes('NOT SUPPORTED'));
 ctx.File=oldFile;
 // Full share > file restore > pre-import undo round trip.
 assert.equal(await api.importFile(sent),true);
 assert.equal(reloads,1);
 assert.equal(JSON.parse(store.get(KEY)).decor.owned[0],'frame');
 assert.equal(JSON.parse(store.get(PREVIOUS)).rows[0][0].length,10);
 w.BitBazaarImportInProgress=false;
 assert.equal(api.recoverPrevious(),true);
 assert.equal(reloads,2);
 assert.equal(JSON.parse(store.get(KEY)).rows[0][0].length,10);
 w.BitBazaarImportInProgress=false;
 const existing=store.get(KEY),previous=store.get(PREVIOUS);
 confirmOK=false;
 assert.equal(await api.importFile(sent),false);
 assert.equal(store.get(KEY),existing);
 assert.equal(store.get(PREVIOUS),previous);
 confirmOK=true;
 const invalid=JSON.parse(await sent.text());
 invalid.save.rows[0][0].push(0);
 assert.equal(await api.importFile({size:sent.size,text:async()=>JSON.stringify(invalid)}),false);
 assert.equal(store.get(KEY),existing);
 assert.equal(store.get(PREVIOUS),previous);
 for(const game of ['game-v0.45.0.js','game-v0.45.0-lowfx.js']){
  assert.ok(read(game).includes('id="shareSaveFile"'));
  assert.ok(read(game).includes("bit-bazaar-save-v3"));
 }
 for(const entry of ['preview-v0.45.0.html','baseline-v0.45.0-lowfx.html']){
  assert.ok(read(entry).includes('assets/save-manager-v0.45.js'));
 }
 assert.ok(read('sw.js').includes('bit-bazaar-v0.51.0'));
 assert.ok(read('sw.js').includes('./assets/save-manager-v0.45.js'));
 console.log('PASS v0.45: iPhone share sheet, valid 3000-object backup, cancel / fail closed, stale-save prevention, Files roundtrip and rollback, two mobile engines.');
}
main().catch(e=>{console.error(e);process.exitCode=1});