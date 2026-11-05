/* Bit Bazaar v0.43 — on-demand physical inventory audit.
 * Exactly 3,000 original identities; never repairs or mutates a save.
 * Run only from the Almanac and QA, never in the frame loop. */
(()=>{
'use strict';
const TOTAL=3000,MAX_ISSUES=12;
function audit({rows,slots,tote,selected,floor,hiddenIds,hiddenRevealed,
                groundPositions,floorGrid}){
 const issues=[],count={shelved:0,held:0,loose:0,concealed:0};
 const fail=(code,id)=>{if(issues.length<MAX_ISSUES)issues.push(code+(id===undefined?'':' #'+id));};
 const valid=id=>Number.isInteger(id)&&id>=0&&id<TOTAL;
 const used=new Uint8Array(TOTAL),indexed=new Uint8Array(TOTAL);
 const hidden=new Set(hiddenIds||[]),revealed=new Set(hiddenRevealed||[]);
 if(!Array.isArray(rows)||rows.length!==60||!Array.isArray(slots)||slots.length!==60)
  fail('SHELF_GEOMETRY');
 else for(let face=0;face<60;face++){
  if(!Array.isArray(rows[face])||rows[face].length!==5||
     !Array.isArray(slots[face])||slots[face].length!==5){
   fail('SHELF_FACE',face);continue;
  }
  for(let row=0;row<5;row++){
   const members=rows[face][row],line=slots[face][row];
   if(!Array.isArray(line)||line.length!==10||!Array.isArray(members)){
    fail('SHELF_ROW',face*5+row);continue;
   }
   const ids=line.filter(id=>id!==null);
   if(ids.length!==members.length||ids.some((id,i)=>!valid(id))||
      !ids.every(id=>members.includes(id)))fail('ROW_MEMBERSHIP',face*5+row);
   for(const id of ids){
    if(!valid(id)){fail('BAD_SHELF_ID',id);continue;}
    if(used[id]++){fail('DUPLICATE_SHELF',id);continue;}
    count.shelved++;
   }
  }
 }
 if(!Array.isArray(tote)||tote.length>1)fail('CARRY_CAPACITY');
 else{
  if(selected!==(tote[0]??null))fail('CARRY_SELECTION');
  for(const id of tote){
   if(!valid(id)){fail('BAD_HAND_ID',id);continue;}
   if(used[id]++){fail('FIGURE_IN_HAND_AND_SHELF',id);continue;}
   count.held++;
  }
 }
 if(!Array.isArray(floor)||floor.length!==TOTAL)fail('MISSING_FLOOR_OBJECTS');
 if(!floorGrid||typeof floorGrid.values!=='function')fail('MISSING_SPATIAL_GRID');
 else for(const bucket of floorGrid.values()){
  if(!Array.isArray(bucket)){fail('INVALID_SPATIAL_BUCKET');continue;}
  for(const f of bucket){
   if(!f||!valid(f.id)||floor?.[f.id]!==f){fail('INVALID_GRID_REFERENCE');continue;}
   if(indexed[f.id]++){fail('DUPLICATE_SPATIAL_INDEX',f.id);}
  }
 }
 for(let id=0;id<TOTAL;id++){
  const fig=floor?.[id];
  if(!fig||fig.id!==id){fail('FIGURE_OBJECT_MISSING',id);continue;}
  if(indexed[id]!==1)fail('FIGURE_NOT_INDEXED_ONCE',id);
  const concealed=hidden.has(id)&&!revealed.has(id);
  if(fig.hidden!==concealed)fail('HIDDEN_STATE_MISMATCH',id);
  if(used[id]){
   if(fig.onFloor)fail('SHELVED_OR_HELD_ON_FLOOR',id);
   if(concealed)fail('UNREVEALED_FIGURE_CARRIED',id);
  }else if(concealed){
   count.concealed++;
   if(fig.onFloor)fail('UNREVEALED_ON_FLOOR',id);
  }else{
   count.loose++;
   if(!fig.onFloor)fail('LOOSE_FIGURE_UNAVAILABLE',id);
  }
  if(!Number.isFinite(fig.x)||!Number.isFinite(fig.z))fail('BAD_FLOOR_COORDINATES',id);
 }
 if(!groundPositions||typeof groundPositions.entries!=='function')
  fail('MISSING_DROPPED_POSITION_MAP');
 else for(const [id,pos] of groundPositions.entries()){
  if(!valid(id)||!pos||!Number.isFinite(pos.x)||!Number.isFinite(pos.z)){
   fail('BAD_CUSTOM_POSITION',id);continue;
  }
  if(used[id]||hidden.has(id)&&!revealed.has(id))
   fail('STALE_CUSTOM_POSITION',id);
  const f=floor[id];
  if(f&&(!f.onFloor||Math.abs(f.x-pos.x)>.000001||Math.abs(f.z-pos.z)>.000001))
   fail('CUSTOM_POSITION_NOT_APPLIED',id);
 }
 const total=count.shelved+count.held+count.loose+count.concealed;
 if(total!==TOTAL)fail('IDENTITY_COUNT_'+total);
 return {ok:issues.length===0,total,shelved:count.shelved,held:count.held,
   loose:count.loose,concealed:count.concealed,
   hiddenFound:revealed.size,issues};
}
window.BIT_BAZAAR_INTEGRITY=Object.freeze({audit});
})();