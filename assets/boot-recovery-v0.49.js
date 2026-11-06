/* Bit Bazaar v0.49: fail-closed startup recovery for unreadable saves.
   No write, reset or migration is permitted by inspect() or show(). */
(()=>{
'use strict';
const KEY='bit-bazaar-save-v3',LEGACY='bit-bazaar-save-v1';
const PREVIOUS='bit-bazaar-v3-before-file-import';
const OLD_RAW='bit-bazaar-v3-unreadable-raw-backup';
const el=id=>document.getElementById(id);
let state=null;
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