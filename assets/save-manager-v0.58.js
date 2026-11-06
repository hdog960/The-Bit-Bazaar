/* Bit Bazaar v0.58.0 — verified save backups, expanded precision compatibility and safe recovery.
   Never uploads private progress; all export/import happens on device. */
(() => {
'use strict';
const KEY='bit-bazaar-save-v3', PREVIOUS='bit-bazaar-v3-before-file-import';
const FILENO=3000, FACES=60, ROWS=5, SLOTS=10;
function validate(raw){
 const fail=msg=>{throw Error(msg)};
 const fid=id=>Number.isInteger(id)&&id>=0&&id<FILENO;
 const sid=id=>Number.isInteger(id)&&id>=0&&id<300;
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.version!==1)
  fail('Not a supported Bit Bazaar save');
 // Phase 5 is a backward-compatible OPTIONAL preference. Old JSON backups
 // without this field remain valid, but invalid values must not be loaded.
 if(raw.glassesEquipped!==undefined&&typeof raw.glassesEquipped!=='boolean')
  fail('Invalid Coward\'s Glasses setting');
 // Phase 6.4 records only whether the optional, replayable celebration was
 // viewed. The actual monument unlock is never trusted to a preference flag.
 if(raw.finaleViewed!==undefined&&typeof raw.finaleViewed!=='boolean')
  fail('Invalid Collector’s Monument finale preference');
 // Phase 6.3 stores optional bounded medals and event witnesses only.
 // Legacy saves with no medals are fully valid and backfill deterministic
 // achievements from their existing original shop state on load.
 if(raw.achievementData!==undefined){
  const mod=window.BIT_BAZAAR_ACHIEVEMENTS;
  if(!mod||typeof mod.validateData!=='function')
   fail('Achievement history validator unavailable');
  mod.validateData(raw.achievementData);
 }
 // Phase 6.1 adds only a cosmetic, backward-compatible gallery trim.
 // Earlier saves omit it and therefore retain their original appearance.
 if(raw.honorTrim!==undefined&&(!Number.isInteger(raw.honorTrim)||
    raw.honorTrim<0||raw.honorTrim>2))
  fail('Invalid lifetime-honor display finish');
 if(!Array.isArray(raw.rows)||raw.rows.length!==FACES||
    !Array.isArray(raw.slots)||raw.slots.length!==FACES)fail('Expected the 3,000-figure shop');
 const used=new Set();let placed=0,perfect=0;
 for(let face=0;face<FACES;face++){
  const rows=raw.rows[face],slots=raw.slots[face];
  if(!Array.isArray(rows)||rows.length!==ROWS||!Array.isArray(slots)||slots.length!==ROWS)
   fail('Corrupt shelf geometry');
  for(let row=0;row<ROWS;row++){
   const members=rows[row],line=slots[row];
   if(!Array.isArray(members)||members.length>SLOTS||
      !Array.isArray(line)||line.length!==SLOTS)fail('Corrupt numbered row');
   const live=line.filter(id=>id!==null);
   if(live.length!==members.length||live.some(id=>!fid(id))||members.some(id=>!fid(id)))
    fail('Shelf and slot mismatch');
   const unique=new Set(members);
   if(unique.size!==members.length||live.some(id=>!unique.has(id)))fail('Duplicate in row');
   const series=live.length?Math.floor(live[0]/10):null;
   for(const id of live){
    if(Math.floor(id/10)!==series||used.has(id))fail('Mixed or duplicated collectible');
    used.add(id);placed++;
   }
   if(live.length===SLOTS&&line.every((id,i)=>id%10===i))perfect++;
  }
 }
 if(!Array.isArray(raw.tote)||raw.tote.length>1||
    raw.tote.some(id=>!fid(id)||used.has(id)))fail('Invalid held collectible');
 if(raw.selected!==(raw.tote.length?raw.tote[0]:null))fail('Carry mismatch');
 for(const id of raw.tote)used.add(id);
 if(!Array.isArray(raw.cleaning)||raw.cleaning.length!==FACES||
    raw.cleaning.some(n=>!Number.isInteger(n)||n<0||n>3))fail('Corrupt shelf restoration');
 if(!Array.isArray(raw.floorCleaning)||raw.floorCleaning.length!==45||
    raw.floorCleaning.some((n,i)=>{
     const kind=(i*7+Math.floor(i/5)*2)%3,limits=[1,2,3];
     return !Number.isInteger(n)||n<0||n>limits[kind];
    }))fail('Corrupt floor restoration');
 const hidden=new Set([1,4,7,10,13,16,19,22,25,28,31,34,37,40,43,46,51,56]
    .map((_,i)=>(29+i*157)%FILENO));
 for(const [label,ids,valid] of [
  ['discoveries',raw.seenFigures,fid],['bookmarks',raw.pinnedSets,sid],
  ['mastery',raw.lifetimePerfect,sid],['secrets',raw.revealed,id=>hidden.has(id)]
 ]){
  if(!Array.isArray(ids)||ids.some(id=>!valid(id))||
      new Set(ids).size!==ids.length)fail('Corrupt '+label);
 }
 if(raw.trackedSetId!==null&&(!sid(raw.trackedSetId)||!raw.pinnedSets.includes(raw.trackedSetId)))
  fail('Tracked collection mismatch');

 // Phase 4 decorations are optional for pre-v0.18 saves, but strictly checked
 // if present: no fabricated purchases, duplicate hooks, or unowned placement.
 if(raw.decor!==undefined){
  const catalog=window.BIT_BAZAAR_DECOR,dec=raw.decor;
  if(!catalog||!dec||typeof dec!=='object'||!Array.isArray(dec.owned)||
     !Array.isArray(dec.placed))fail('Invalid decoration ownership');
  const known=new Set(catalog.items.map(item=>item.id)),purchased=new Set(dec.owned);
  if(purchased.size!==dec.owned.length||dec.owned.some(id=>!known.has(id)))
   fail('Unknown or duplicate decoration');
  const hooks=new Set(),placedDecor=new Set();
  for(const entry of dec.placed){
   if(!Array.isArray(entry)||entry.length!==2)fail('Invalid decoration placement');
   const [id,slot]=entry;
   if(!purchased.has(id)||placedDecor.has(id)||!Number.isInteger(slot)||
      slot<0||slot>=catalog.slots.length||hooks.has(slot)||
      catalog.slots[slot].kind!==(catalog.items.find(item=>item.id===id)?.mount||'wall'))
      fail('Duplicate or unowned decoration position');
   hooks.add(slot);placedDecor.add(id);
  }
  // v0.23 saves can include optional 0.25-unit offset, rug orientation,
  // and shelf material. Old save files with no adjustments remain valid.
  if(dec.adjustments!==undefined){
   if(!Array.isArray(dec.adjustments)||dec.adjustments.length>dec.owned.length)
    fail('Invalid fine-placement data');
   const installed=new Map(dec.placed),configured=new Set();
   for(const row of dec.adjustments){
    if(!Array.isArray(row)||row.length!==5)fail('Malformed fine-placement entry');
    const [id,dx,dz,turn,tone]=row;
    if(!installed.has(id)||configured.has(id)||
      !Number.isInteger(dx)||dx < -4||dx>4||
      !Number.isInteger(dz)||dz < -4||dz>4||
      !Number.isInteger(turn)||turn<0||turn>3||
      !Number.isInteger(tone)||tone<0||tone>2)
      fail('Invalid fine-placement values');
    configured.add(id);
    const slot=catalog.slots[installed.get(id)],kind=slot.kind;
    // v0.38+ authoring uses integer quarter-units with a full unit of
    // safe movement for floor, rug and ceiling artwork, and a half unit
    // for wall paintings. Old, valid ±0.5 backups continue to restore.
    const limit=kind==='floor'||kind==='rug'||kind==='ceiling'?4:
      kind==='wall'?2:0;
    if(Math.abs(dx)>limit||Math.abs(dz)>limit)
      fail('Fine-placement exceeds its mounting surface');
    if(kind==='shelf'){
     if(dx!==0||dz!==0||turn!==0)fail('Shelf finish cannot leave its rail');
    }else{
     if(tone!==0||(kind!=='rug'&&turn!==0))
      fail('Only rugs rotate and only rails change materials');
     if(slot.profile==='endcap'&&(dx!==0||dz!==0))
      fail('Endcap gallery artworks must stay on their shelf side');
     if(kind==='wall'&&((slot.side==='WEST'||slot.side==='EAST')?dx!==0:dz!==0))
      fail('Wall art offset must follow its wall');
     if(slot.x+dx*.25<1||slot.x+dx*.25>69||
        slot.z+dz*.25<1||slot.z+dz*.25>73)
      fail('Fine-placement coordinates outside shop');
    }
   }
  }
  // Four optional independently saved room-material selectors, never a
  // transaction or a fabricated purchase. Older backups omit this field.
  if(dec.room!==undefined&&(!Array.isArray(dec.room)||dec.room.length!==4||
     dec.room.some(v=>!Number.isInteger(v)||v<0||v>3)))
    fail('Invalid room finish selections');
 }

 if(!Array.isArray(raw.ground))fail('Missing dropped figure data');
 const groundSeen=new Set();
 for(const item of raw.ground){
  if(!Array.isArray(item)||item.length!==3||!fid(item[0])||
    used.has(item[0])||groundSeen.has(item[0])||
    !Number.isFinite(item[1])||!Number.isFinite(item[2])||
    item[1]<0||item[1]>70||item[2]<0||item[2]>74)
    fail('Corrupt dropped figure positions');
  groundSeen.add(item[0]);
 }
 if(!raw.player||!Number.isFinite(raw.player.x)||!Number.isFinite(raw.player.z)||
   !Number.isFinite(raw.player.yaw)||!Number.isFinite(raw.player.pitch)||
   raw.player.x<0||raw.player.x>70||raw.player.z<0||raw.player.z>74)
   fail('Corrupt player position');
 return {placed,perfect,cleaned:raw.cleaning.filter(n=>n===3).length,
  discovered:raw.seenFigures.length,ownedArt:raw.decor?.owned?.length||0,
  fineAdjusted:raw.decor?.adjustments?.length||0,
  lifetimeMastered:raw.lifetimePerfect.length,
  dropped:groundSeen.size,hiddenFound:raw.revealed.length};
}
function message(text,failed=false){
 const output=document.getElementById('saveToolStatus');
 if(failed&&window.BitBazaarSaveHold)
  text+=' · AUTOSAVE PAUSED TO PROTECT LAST SAVED SHOP';
 if(output){output.textContent=text;output.classList.toggle('error',failed);}
}
function verifiedCurrent(){
 // v0.47: validate a read-only live snapshot BEFORE replacing browser storage.
 const qa=window.BitBazaarQA;
 if(typeof qa?.snapshotNow!=='function'||
    typeof qa?.figureIntegrity!=='function'||typeof qa?.saveNow!=='function')
  throw Error('Live shop verification is not ready; keep this game open');
 let live,expected,summary,physical;
 try{
  live=qa.snapshotNow();
  expected=JSON.stringify(live);
  summary=validate(live);
  physical=qa.figureIntegrity();
  if(!physical||!physical.ok||physical.total!==FILENO||
     physical.shelved!==summary.placed||physical.held!==live.tote.length||
     physical.hiddenFound!==summary.hiddenFound)
   throw Error('Physical shop audit failed · '+
    (physical?.issues?.[0]||'figure ledger does not match live game'));
 }catch(e){
  // If the live game is inconsistent, normal periodic autosaves must NOT
  // trample the last saved store while the player diagnoses or restores it.
  window.BitBazaarSaveHold=true;
  throw e;
 }
 // A successfully rechecked scene may safely resume normal autosaves.
 window.BitBazaarSaveHold=false;
 const prior=localStorage.getItem(KEY);
 if(qa.saveNow()!==true)
  throw Error('Browser storage could not save verified progress; keep this tab open');
 const persisted=localStorage.getItem(KEY);
 if(persisted!==expected){
  // Defensive rollback if a save implementation wrote an unexpected payload.
  // Failure to write the rollback must not claim the export was successful.
  try{if(prior!==null)localStorage.setItem(KEY,prior);}catch(_){}
  window.BitBazaarSaveHold=true;
  throw Error('Saved shop differs from verified live progress; export cancelled');
 }
 return {raw:JSON.parse(persisted),summary,physical};
}
function verifyCurrent(){
 try{
  const {summary}=verifiedCurrent();
  message('✓ SHOP VERIFIED · '+summary.placed+' shelved · '+
   summary.perfect+' perfect · '+summary.ownedArt+' decorations owned · '+
   summary.fineAdjusted+' custom positions · '+
   summary.lifetimeMastered+' lifetime mastered.');
  return summary;
 }catch(e){
  message('SAVE CHECK FAILED · '+(e.message||'Storage error'),true);
  return null;
 }
}
function auditInventory(){
 try{
  const {summary,physical}=verifiedCurrent();
  if(!physical)throw Error('Physical figure audit is not available in this game build');
  message('✓ 3,000 / 3,000 FIGURES ACCOUNTED FOR · '+
   physical.shelved+' shelved · '+physical.held+' held · '+
   physical.loose+' on floor · '+physical.concealed+' still hidden · '+
   summary.ownedArt+' decorations owned. No duplicates or missing figures.');
  return physical;
 }catch(e){
  message('FIGURE AUDIT FAILED · '+(e.message||'Unexpected error'),true);
  return null;
 }
}
function exportFile(){
 try{
  const {raw,summary}=verifiedCurrent();
  const bundle={format:'bit-bazaar-save-backup',exportVersion:1,
    exportedAt:new Date().toISOString(),save:raw};
  const blob=new Blob([JSON.stringify(bundle)],{type:'application/json'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='Bit-Bazaar-Save-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  message('DOWNLOAD REQUESTED · '+summary.placed+' shelved · '+
   summary.ownedArt+' decorations owned. Check Downloads or Files before deleting anything.');
  return true;
 }catch(e){message('EXPORT FAILED · '+(e.message||'Storage error'),true);return false;}
}
/* Share a freshly verified snapshot through iPhone's native Save to Files
   flow. Never claim that Safari actually wrote the selected destination. */
async function shareFile(){
 try{
  const {raw,summary}=verifiedCurrent();
  const stamp=new Date().toISOString().slice(0,10);
  const name='Bit-Bazaar-Save-'+stamp+'.json';
  const bundle={format:'bit-bazaar-save-backup',exportVersion:1,
    exportedAt:new Date().toISOString(),save:raw};
  if(typeof File!=='function'||typeof navigator==='undefined'||
     typeof navigator.share!=='function'||typeof navigator.canShare!=='function'){
   message('SHARE TO FILES NOT SUPPORTED HERE · Tap DOWNLOAD SAVE instead.',true);
   return false;
  }
  const file=new File([JSON.stringify(bundle)],name,{type:'application/json'});
  if(!navigator.canShare({files:[file]})){
   message('THIS BROWSER CANNOT SHARE JSON FILES · Tap DOWNLOAD SAVE instead.',true);
   return false;
  }
  await navigator.share({files:[file],title:'The Bit Bazaar · Verified Save'});
  message('SHARE SHEET CLOSED · '+summary.placed+' shelved · '+
   summary.ownedArt+' decorations. Confirm the JSON appears in Files '+
   'before clearing browser data or replacing your device.');
  return true;
 }catch(e){
  if(e?.name==='AbortError'){
   message('SHARE CANCELLED · No file has been verified in Files.',true);
   return false;
  }
  message('SHARE FAILED · '+(e.message||'File sharing unavailable')+
   ' · Try DOWNLOAD SAVE.',true);
  return false;
 }
}
// v0.53: validate a file actually selected from iPhone Files WITHOUT
// importing, saving the live shop, or overwriting any local browser backups.
// File validity and snapshot parity do not certify a real restore.
let lastFileCheck=null;
async function checkBackupFile(file){
 if(!file)return null;
 lastFileCheck=null;
 try{
  if(file.size>3*1024*1024)throw Error('Save file exceeds 3 MB');
  const input=JSON.parse(await file.text());
  if(input?.format&&input.format!=='bit-bazaar-save-backup')
   throw Error('Unrecognized backup format');
  const raw=input?.format==='bit-bazaar-save-backup'?input.save:input;
  const summary=validate(raw);
  let match=null;
  try{
   const live=window.BitBazaarQA?.snapshotNow?.();
   if(live){validate(live);match=JSON.stringify(raw)===JSON.stringify(live);}
  }catch(_){match=null;}
  const result={valid:true,match,summary,fileName:String(file.name||'Selected file')};
  lastFileCheck=result;
  message('✓ BACKUP FILE READABLE · '+summary.placed+' shelved · '+
   summary.perfect+' perfect rows · '+summary.ownedArt+' decorations · '+
   summary.lifetimeMastered+' lifetime mastered. '+
   (match===true?'EXACT MATCH with open shop.':
    match===false?'VALID FILE, BUT DIFFERENT from open shop.':
    'Open-shop comparison unavailable.')+
   ' NOTHING WAS RESTORED OR SAVED. File restore remains untested.');
  return result;
 }catch(e){
  message('FILE CHECK FAILED · '+(e.message||'Invalid backup')+
   ' · No changes made to your shop.',true);
  return null;
 }
}
async function importFile(file){
 if(!file)return false;
 try{
  if(file.size>3*1024*1024)throw Error('Save file exceeds 3 MB');
  const input=JSON.parse(await file.text());
  if(input?.format&&input.format!=='bit-bazaar-save-backup')
   throw Error('Unrecognized backup format');
  const raw=input?.format==='bit-bazaar-save-backup'?input.save:input;
  const summary=validate(raw);
  if(!window.confirm('RESTORE THIS BIT BAZAAR SHOP?\n\n'+summary.placed+
     ' shelved · '+summary.perfect+' perfect rows · '+summary.cleaned+
     '/60 clean faces\n\nThis replaces current progress. A pre-import local copy is kept.'))return false;
  // Force current live progress to persist before protecting and replacing
  // it. A quota failure must abort import rather than back up stale data.
  if(!window.BitBazaarSaveHold&&window.BitBazaarQA?.saveNow?.()!==true)
   throw Error('Current shop could not be saved before import');
  // When verification detected inconsistent live state, import deliberately
  // skips saving that state. Restoring a previously exported JSON remains safe.
  // The backup write must succeed before the user's progress is replaced.
  const existing=localStorage.getItem(KEY);
  if(existing){
   // A damaged shop is not a usable undo snapshot. Preserve the last good
   // import separately; archive the exact unreadable bytes for recovery.
   let healthy=false;
   try{validate(JSON.parse(existing));healthy=true;}catch(_){}
   if(healthy)localStorage.setItem(PREVIOUS,existing);
   else{
    const quarantine='bit-bazaar-v3-unreadable-raw-backup';
    const archived=localStorage.getItem(quarantine);
    if(archived!==null&&archived!==existing)
     throw Error('Another unreadable shop is already archived. Export that copy before replacing it.');
    localStorage.setItem(quarantine,existing);
   }
  }
  // Freeze engine autosave before starting reload: otherwise pagehide could
  // write the old running shop over the newly imported backup.
  window.BitBazaarImportInProgress=true;
  localStorage.setItem(KEY,JSON.stringify(raw));
  window.location.reload();
  return true;
 }catch(e){
  window.BitBazaarImportInProgress=false;
  message('RESTORE CANCELLED · '+(e.message||'Invalid save'),true);return false;
 }
}
function recoverPrevious(){
 try{
  const previous=localStorage.getItem(PREVIOUS);
  if(!previous)throw Error('No previous imported shop is stored on this device');
  const summary=validate(JSON.parse(previous));
  if(!window.confirm('RECOVER YOUR SHOP FROM BEFORE THE LAST FILE IMPORT?\n\n'+
    summary.placed+' shelved · '+summary.perfect+' perfect rows · '+
    summary.ownedArt+' owned decorations\n\n'+
    'This replaces your current shop. A second local safety copy will be created.'))
   return false;
  // Preserve the currently running scene *before* switching the save key.
  if(!window.BitBazaarSaveHold&&window.BitBazaarQA?.saveNow?.()!==true)
   throw Error('Cannot safeguard current progress before recovery');
  // Recovery from a valid previous backup must remain available even when
  // live state has been quarantined by the inventory preflight.
  const current=localStorage.getItem(KEY);
  if(current)localStorage.setItem('bit-bazaar-v3-before-import-rollback',current);
  window.BitBazaarImportInProgress=true;
  localStorage.setItem(KEY,previous);
  window.location.reload();
  return true;
 }catch(e){
  window.BitBazaarImportInProgress=false;
  message('RECOVERY CANCELLED · '+(e.message||'Storage error'),true);
  return false;
 }
}
document.addEventListener('click',event=>{
 if(event.target.closest('#auditFigureInventory')){auditInventory();return;}
 if(event.target.closest('#verifySaveFile')){verifyCurrent();return;}
 if(event.target.closest('#recoverSaveFile')){recoverPrevious();return;}
 if(event.target.closest('#downloadSaveFile')){exportFile();return;}
 if(event.target.closest('#shareSaveFile')){shareFile();return;}
 if(event.target.closest('#chooseSaveFile')){
  const input=document.getElementById('saveFileInput');if(input)input.click();
 }
 if(event.target.closest('#checkBackupFile')){
  const input=document.getElementById('checkBackupInput');if(input)input.click();
 }
});
document.addEventListener('change',event=>{
 if(event.target.id==='checkBackupInput'){
  const input=event.target,file=input.files?.[0];input.value='';
  if(file)checkBackupFile(file);
  return;
 }
 if(event.target.id!=='saveFileInput')return;
 const input=event.target,file=input.files?.[0];input.value='';
 if(file)importFile(file);
});
window.BitBazaarSaveTools=Object.freeze({
 validate,verifyCurrent,auditInventory,exportFile,shareFile,checkBackupFile,importFile,recoverPrevious,
 lastFileCheck:()=>lastFileCheck,
 hasRecovery:()=>!!localStorage.getItem(PREVIOUS)
});
})();