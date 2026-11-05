/* Bit Bazaar v0.42.0 — verified save backups, expanded precision compatibility and safe recovery.
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
 if(output){output.textContent=text;output.classList.toggle('error',failed);}
}
function verifiedCurrent(){
 // Export and integrity checks MUST represent this live running shop, not
 // a stale localStorage snapshot left over from an unsuccessful save.
 if(window.BitBazaarQA?.saveNow?.()===false)
  throw Error('Browser storage could not save current progress; do not discard this tab');
 const raw=JSON.parse(localStorage.getItem(KEY)||'null');
 return {raw,summary:validate(raw)};
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
  if(window.BitBazaarQA?.saveNow?.()===false)
   throw Error('Current shop could not be saved before import');
  // The backup write must succeed before the user's progress is replaced.
  const existing=localStorage.getItem(KEY);
  if(existing)localStorage.setItem(PREVIOUS,existing);
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
  if(window.BitBazaarQA?.saveNow?.()===false)
   throw Error('Cannot safeguard current progress before recovery');
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
 if(event.target.closest('#verifySaveFile')){verifyCurrent();return;}
 if(event.target.closest('#recoverSaveFile')){recoverPrevious();return;}
 if(event.target.closest('#downloadSaveFile')){exportFile();return;}
 if(event.target.closest('#chooseSaveFile')){
  const input=document.getElementById('saveFileInput');if(input)input.click();
 }
});
document.addEventListener('change',event=>{
 if(event.target.id!=='saveFileInput')return;
 const input=event.target,file=input.files?.[0];input.value='';
 if(file)importFile(file);
});
window.BitBazaarSaveTools=Object.freeze({
 validate,verifyCurrent,exportFile,importFile,recoverPrevious,
 hasRecovery:()=>!!localStorage.getItem(PREVIOUS)
});
})();