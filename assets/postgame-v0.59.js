/* Bit Bazaar v0.59 — Phase 6.5: The Collector's Encore.
   A read-only, optional post-completion planner derived entirely from real
   shelf occupancy, permanent medals and existing décor state. No save keys,
   new item IDs, money, timers, resets, automatic sorting or figure spoilers. */
(()=>{
'use strict';
const NSETS=300, FIGS=3000, PAGE_SIZE=6;
const validSet=id=>Number.isInteger(id)&&id>=0&&id<NSETS;
const validFig=id=>Number.isInteger(id)&&id>=0&&id<FIGS;
const ids=x=>x instanceof Set?[...x]:Array.isArray(x)?x:[];
const unique=(x,valid)=>new Set(ids(x).filter(valid));
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cap=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
function evaluate(source){
 const s=source||{},mastered=unique(s.lifetimePerfect,validSet),
  pinned=unique(s.pinnedSets,validSet),
  sacrificed=unique(s.sacrificed,validSet),
  unlocked=unique(s.earned,id=>typeof id==='string').has('perfect-bazaar');
 const sets=Array.isArray(s.sets)?s.sets:[],slots=Array.isArray(s.slots)?s.slots:[];
 const progress=Array.from({length:NSETS},(_,id)=>{
  const entry=sets[id]||{};
  return {id,name:typeof entry.name==='string'?entry.name:'COLLECTION '+(id+1),
   theme:typeof entry.theme==='string'?entry.theme:'COLLECTION',
   shelved:0,correct:0,where:null,perfect:false,mastered:mastered.has(id),
   pending:sacrificed.has(id),pinned:pinned.has(id),fullUnsorted:false};
 });
 let shelved=0,perfectRows=0,fullUnsorted=0;
 // Exactly 60 physical faces × five rows, never search loose floor locations.
 for(let face=0;face<Math.min(60,slots.length);face++){
  const faceRows=slots[face];
  if(!Array.isArray(faceRows))continue;
  for(let row=0;row<Math.min(5,faceRows.length);row++){
   const line=faceRows[row];
   if(!Array.isArray(line)||line.length!==10)continue;
   const actual=line.filter(validFig);
   shelved+=actual.length;
   if(!actual.length)continue;
   const sid=Math.floor(actual[0]/10),progressEntry=progress[sid];
   if(!progressEntry)continue;
   // Existing game forbids mixed sets, but do not label a corrupted row perfect.
   const own=actual.filter(id=>Math.floor(id/10)===sid);
   progressEntry.shelved+=own.length;
   progressEntry.correct+=line.filter((id,slot)=>validFig(id)&&
    Math.floor(id/10)===sid&&id%10===slot).length;
   if(!progressEntry.where)progressEntry.where=[face,row];
   const complete=actual.length===10&&own.length===10;
   const perfect=complete&&line.every((id,k)=>id===sid*10+k);
   if(perfect){perfectRows++;progressEntry.perfect=true;}
   else if(complete){fullUnsorted++;progressEntry.fullUnsorted=true;}
  }
 }
 const priorities=progress.filter(p=>p.mastered&&!p.perfect);
 // Pending rows are actual saved sacrifice witnesses; all other once-mastered
 // but imperfect sets can also be explored without pretending a purchase happened.
 priorities.sort((a,b)=>Number(b.pending)-Number(a.pending)||
  Number(b.fullUnsorted)-Number(a.fullUnsorted)||
  b.shelved-a.shelved||a.id-b.id);
 const owned=cap(Number.isInteger(s.ownedArt)?s.ownedArt:0,0,180);
 const displayed=cap(Number.isInteger(s.placedArt)?s.placedArt:0,0,232);
 const restored=perfectRows===NSETS&&shelved===FIGS;
 const pending=priorities.filter(p=>p.pending).length;
 return {unlocked,complete:restored,
  perfectRows,shelved,mastered:mastered.size,owned,displayed,
  totalArt:180,displaySites:232,
  missingRows:Math.max(0,NSETS-perfectRows),
  looseFigures:Math.max(0,FIGS-shelved),fullUnsorted,
  pending,unfinished:priorities.length,
  targets:priorities,pageSize:PAGE_SIZE};
}
function panel(status,page=0){
 const s=status||evaluate();
 if(!s.unlocked)return '';
 const lastPage=Math.max(0,Math.ceil(s.targets.length/PAGE_SIZE)-1);
 const current=cap(Number.isInteger(page)?page:0,0,lastPage);
 const shown=s.targets.slice(current*PAGE_SIZE,(current+1)*PAGE_SIZE);
 const cards=shown.map(p=>{
  const description=p.pending?'DECORATION SACRIFICE · READY TO RESTORE':
   p.fullUnsorted?'ROW FULL · REORDER 1–10':
   p.shelved?'PARTIALLY SHELVED · CONTINUE YOUR SET':'READY FOR A FRESH DISPLAY';
  return '<article class="encore-target" data-encore-id="'+p.id+'">'+
   '<div class="encore-target-head"><strong>'+safe(p.name)+'</strong><span>'+
   (p.pending?'✦ DECOR RESTORE':'◇ REVISIT')+'</span></div>'+
   '<p>'+description+'</p>'+
   '<div class="encore-target-progress"><b>'+p.shelved+' / 10 ON SHELF</b>'+
   '<small>'+p.correct+' IN CORRECT SLOTS'+(p.where?' · FACE '+(p.where[0]+1)+' / ROW '+(p.where[1]+1):' · NO ASSIGNED ROW')+'</small></div>'+
   '<div class="encore-target-actions">'+
   '<button type="button" data-encore-set="'+p.id+'">OPEN CHECKLIST</button>'+
   (p.where?'<button type="button" data-encore-map="'+p.id+'">FIND SHELF</button>':'')+
   '<button type="button" data-encore-pin="'+p.id+'" aria-pressed="'+p.pinned+'">'+
   (p.pinned?'★ PINNED':'☆ PIN SET')+'</button></div></article>';
 }).join('');
 const footer=!s.targets.length?
  '<div class="encore-idle"><strong>EVERY FIGURE IN PLACE.</strong><p>Your store is perfected right now. You can keep it exactly as it is, admire your work, or voluntarily choose new art in the Sacrifice Catalog.</p></div>':
  '<div class="encore-queue-title"><strong>'+s.unfinished+' COLLECTIONS TO REVISIT</strong>'+
  '<span>PAGE '+(current+1)+' / '+(lastPage+1)+'</span></div>'+
  '<div class="encore-target-list">'+cards+'</div>'+
  (lastPage>0?'<div class="encore-pagination">'+
   '<button type="button" data-encore-page="prev" '+(current===0?'disabled':'')+'>← PREVIOUS</button>'+
   '<button type="button" data-encore-page="next" '+(current===lastPage?'disabled':'')+'>NEXT →</button></div>':'');
 return '<section class="encore-gallery" id="encoreGallery" aria-label="Optional post-completion collecting and restoration planner">'+
  '<div class="encore-kicker">PHASE 6 · AFTER THE FINAL FIGURINE</div>'+
  '<div class="encore-heading"><h3>THE COLLECTOR’S ENCORE</h3>'+
   '<strong>PERMANENTLY UNLOCKED</strong></div>'+
  '<p class="encore-intro">The ending was yours. What happens next is your choice. No new quests, timers, currency or prestige reset.</p>'+
  '<div class="encore-facts">'+
   '<div><b>'+s.perfectRows+' / 300</b><small>PERFECT RIGHT NOW</small></div>'+
   '<div><b>'+s.shelved.toLocaleString()+' / 3,000</b><small>FIGURES SHELVED</small></div>'+
   '<div><b>'+s.owned+' / 180</b><small>ART PIECES OWNED</small></div>'+
   '<div><b>'+s.pending+'</b><small>RECENT DECOR RESTORES</small></div></div>'+
  '<div class="encore-routes">'+
   '<div class="encore-route"><strong>✦ RESTORE YOUR MASTERPIECE</strong>'+
   '<p>Sorting is always manual, one figurine at a time. Previously mastered sets never lose their lifetime credit.</p>'+
   '<button type="button" data-encore-open="map">VIEW THE STORE MAP</button></div>'+
   '<div class="encore-route"><strong>◆ DECORATE, THEN REBUILD</strong>'+
   '<p>Browse real artwork with its existing row-sacrifice prices. Nothing is bought until you choose and confirm it.</p>'+
   '<button type="button" data-encore-open="decor">OPEN SACRIFICE CATALOG</button></div></div>'+
  '<div class="encore-restore"><div class="encore-restore-head"><strong>YOUR RESTORATION NOTEBOOK</strong><span>'+
   (s.pending?s.pending+' FROM DECOR PURCHASES':'OPTIONAL · NO DEADLINES')+'</span></div>'+
   '<p>Only sets actually displayed are given map shortcuts. Loose figure positions are never revealed.</p>'+
   footer+'</div>'+
  '</section>';
}
window.BIT_BAZAAR_POSTGAME=Object.freeze({evaluate,panel,PAGE_SIZE});
})();