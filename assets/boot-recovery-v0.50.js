/* Bit Bazaar v0.50: fail-closed startup recovery for unreadable saves.
   No write, reset or migration is permitted by inspect() or show(). */
(()=>{
'use strict';
const KEY='bit-bazaar-save-v3',LEGACY='bit-bazaar-save-v1';
const PREVIOUS='bit-bazaar-v3-before-file-import';
const OLD_RAW='bit-bazaar-v3-unreadable-raw-backup';
const el=id=>document.getElementById(id);
let state=null;
/* Full-schema current saves must pass the same validator as Files imports.
   Historical 20-face/partial 60-face saves use read-only normalization solely
   for preflight; the original bytes remain untouched for migration. */
function preflightLegacy(raw){
 const fid=id=>Number.isInteger(id)&&id>=0&&id<3000;
 const used=new Set();
 for(let face=0;face<raw.rows.length;face++){
  for(let row=0;row<5;row++){
   const members=raw.rows[face][row];
   if(members.length>10)throw Error('Historical shelf row exceeds 10 figures');
   const setId=members.length?Math.floor(members[0]/10):-1;
   for(const id of members){
    if(!fid(id)||used.has(id)||Math.floor(id/10)!==setId)
     throw Error('Historical shelf has mixed, duplicate or invalid figures');
    used.add(id);
   }
   if(raw.slots!==undefined){
    const line=raw.slots[face][row];
    if(!Array.isArray(line)||line.length!==10)
     throw Error('Historical numbered slot geometry is invalid');
    const actual=line.filter(id=>id!==null);
    if(actual.length!==members.length||
      actual.some(id=>!fid(id)||!members.includes(id))||
      new Set(actual).size!==actual.length)
     throw Error('Historical shelf and numbered slots differ');
   }
  }
 }
 const carried=raw.tote===undefined?[]:raw.tote;
 if(!Array.isArray(carried)||carried.length>32||
    new Set(carried).size!==carried.length||
    carried.some(id=>!fid(id)||used.has(id)))
  throw Error('Historical carried figures are invalid');
 for(const id of carried)used.add(id);
 const ground=raw.ground===undefined?[]:raw.ground;
 if(!Array.isArray(ground))throw Error('Historical dropped figures are invalid');
 for(const entry of ground){
  if(!Array.isArray(entry)||entry.length!==3||!fid(entry[0])||
     used.has(entry[0])||!Number.isFinite(entry[1])||
     !Number.isFinite(entry[2])||entry[1]<0||entry[1]>70||
     entry[2]<0||entry[2]>74)
   throw Error('Historical dropped figure has invalid coordinates');
  used.add(entry[0]);
 }
 const emptyRows=()=>Array.from({length:5},()=>[]);
 const emptySlots=()=>Array.from({length:5},()=>Array(10).fill(null));
 const rows=raw.rows.map(face=>face.map(row=>row.slice()));
 while(rows.length<60)rows.push(emptyRows());
 const slots=raw.slots===undefined?
   raw.rows.map(face=>face.map(row=>
    row.concat(Array(10-row.length).fill(null)))):
   raw.slots.map(face=>face.map(line=>line.slice()));
 while(slots.length<60)slots.push(emptySlots());
 const first=carried.includes(raw.selected)?raw.selected:carried[0];
 const one=first===undefined?[]:[first];
 const cleaning=raw.cleaning===undefined||
    (raw.rows.length===20&&raw.cleaning?.length===20)?
    Array(60).fill(3):raw.cleaning;
 const normalized={
  version:1,rows,slots,tote:one,selected:one[0]??null,
  cleaning,floorCleaning:raw.floorCleaning===undefined?
   Array(45).fill(0):raw.floorCleaning,
  seenFigures:raw.seenFigures===undefined?[]:raw.seenFigures,
  pinnedSets:raw.pinnedSets===undefined?[]:raw.pinnedSets,
  lifetimePerfect:raw.lifetimePerfect===undefined?[]:raw.lifetimePerfect,
  trackedSetId:raw.trackedSetId===undefined?null:raw.trackedSetId,
  revealed:raw.revealed===undefined?[]:raw.revealed,
  ground,player:raw.player===undefined?
   {x:35,z:68,yaw:0,pitch:0}:raw.player
 };
 if(raw.decor!==undefined)normalized.decor=raw.decor;
 const validator=window.BitBazaarSaveTools?.validate;
 if(typeof validator!=='function')throw Error('The saved-game validator did not load');
 validator(normalized);
}
function preflight(raw){
 const validator=window.BitBazaarSaveTools?.validate;
 if(typeof validator!=='function')throw Error('Saved-game verification unavailable');
 const modern=raw.rows.length===60;
 const needed=['slots','cleaning','floorCleaning','seenFigures',
  'pinnedSets','lifetimePerfect','trackedSetId','revealed','ground',
  'player','tote','selected'];
 const historical=!modern||needed.some(k=>raw[k]===undefined);
 if(historical)preflightLegacy(raw);
 else validator(raw);
}
function inspect(){
 let stored=null,source=null;
 try{
  const modern=localStorage.getItem(KEY),legacy=localStorage.getItem(LEGACY);
  if(modern===null&&legacy===null)return {kind:'fresh'};
  source=modern!==null?KEY:LEGACY;stored=modern!==null?modern:legacy;
 }catch(_){return {kind:'blocked',source:null,reason:'Browser storage cannot be read'};}
 try{
  const raw=JSON.parse(stored);
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.version!==1||
     !Array.isArray(raw.rows)||![20,60].includes(raw.rows.length)||
     raw.rows.some(face=>!Array.isArray(face)||face.length!==5||
      face.some(row=>!Array.isArray(row)))||
     (raw.slots!==undefined&&(!Array.isArray(raw.slots)||
      raw.slots.length!==raw.rows.length||
      raw.slots.some(face=>!Array.isArray(face)||face.length!==5))))
   throw Error('Invalid saved shop structure');
  // v0.50: a 60-face save is not safe merely because its outer arrays
  // exist. Check exact collectibles, floor positions, slots, decorations,
  // carry state and unlock history before any restore/migration can save it.
  preflight(raw);
  return {kind:'valid',source,raw};
 }catch(_){
  return {kind:'blocked',source,reason:'Existing save could not be read safely'};
 }
}
function validPrevious(){
 try{
  const text=localStorage.getItem(PREVIOUS);
  if(!text)return false;
  window.BitBazaarSaveTools?.validate(JSON.parse(text));
  return true;
 }catch(_){return false;}
}
function status(message){
 const text=el('bootRecoveryStatus');
 if(text)text.textContent=message;
}
function show(result){
 state=result?.kind==='blocked'?result:{kind:'blocked',reason:'Unable to inspect the saved shop'};
 window.BitBazaarSaveHold=true;
 const overlay=el('bootRecovery');
 if(overlay)overlay.hidden=false;
 const explanation=el('bootRecoveryReason');
 if(explanation)explanation.textContent=state.reason||'Saved game could not be restored';
 const previous=el('bootRecoveryPrevious');
 if(previous)previous.disabled=!validPrevious();
 const raw=el('bootRecoveryRaw');
 if(raw)raw.disabled=!state.source;
 status('YOUR ORIGINAL SAVED DATA HAS NOT BEEN ERASED. Choose an existing backup or export the unreadable data before doing anything destructive.');
 return true;
}
function exportRaw(){
 if(!state||!state.source)return false;
 try{
  const existing=localStorage.getItem(state.source);
  if(existing===null)throw Error('No original data in this browser');
  const blob=new Blob([existing],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='Bit-Bazaar-Unreadable-Save-'+
    new Date().toISOString().slice(0,10)+'.txt';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  status('RAW DATA DOWNLOAD REQUESTED. Confirm the text file exists in Files or Downloads. This is NOT a playable save.');
  return true;
 }catch(e){status('RAW EXPORT FAILED · '+(e.message||'Browser storage unavailable'));return false;}
}
function chooseFile(){
 const input=el('bootRecoveryFile');
 if(!input){status('FILES PICKER UNAVAILABLE');return false;}
 input.click();return true;
}
async function importFile(file){
 if(!file)return false;
 try{
  const api=window.BitBazaarSaveTools;
  if(!api?.importFile)throw Error('Restore tool unavailable');
  status('Checking the chosen file before replacing any saved progress...');
  const ok=await api.importFile(file);
  if(!ok)status('RESTORE NOT COMPLETED. Your original saved data remains available. Try another verified backup.');
  return !!ok;
 }catch(e){status('RESTORE FAILED · '+(e.message||'Invalid file'));return false;}
}
function recoverPrevious(){
 if(!validPrevious()){status('NO VALID PREVIOUS IMPORT FOUND · Choose a Files backup instead.');return false;}
 return window.BitBazaarSaveTools.recoverPrevious();
}
function startFresh(){
 if(!state||state.kind!=='blocked')return false;
 if(!window.confirm('START A BRAND-NEW BIT BAZAAR?\n\nThis discards unreadable saved data on this device. Download the raw data and try your Files backups first.'))return false;
 if(!window.confirm('FINAL CONFIRMATION\n\nDELETE THE UNREADABLE SHOP DATA AND START FROM ZERO? This cannot be undone without an existing backup.'))return false;
 try{
  // Deliberate last resort only. A normal app boot must never use this path.
  localStorage.removeItem(KEY);
  localStorage.removeItem(LEGACY);
  window.BitBazaarSaveHold=false;
  window.location.reload();
  return true;
 }catch(e){window.BitBazaarSaveHold=true;
  status('RESET FAILED · '+(e.message||'Storage unavailable')+' · Original data may still exist.');
  return false;
 }
}
document.addEventListener('click',event=>{
 if(event.target?.closest?.('#bootRecoveryChoose'))chooseFile();
 else if(event.target?.closest?.('#bootRecoveryPrevious'))recoverPrevious();
 else if(event.target?.closest?.('#bootRecoveryRaw'))exportRaw();
 else if(event.target?.closest?.('#bootRecoveryFresh'))startFresh();
});
document.addEventListener('change',event=>{
 if(event.target?.id!=='bootRecoveryFile')return;
 const input=event.target,file=input.files?.[0];
 input.value='';
 if(file)importFile(file);
});
window.BitBazaarBootRecovery=Object.freeze({
 inspect,show,exportRaw,chooseFile,importFile,recoverPrevious,startFresh,
 isBlocked:()=>state?.kind==='blocked',rawBackupKey:OLD_RAW
});
})();