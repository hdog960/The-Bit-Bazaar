/* Bit Bazaar v0.56 — Phase 6.2: Three Journeys.
   Read-only projection of actual shop state. No progress flags or new save keys.
   This module must never grant figures, decorations or automatic perfection. */
(()=>{
'use strict';
const HIDDEN_TOTAL=18, FACE_TOTAL=60, FLOOR_TOTAL=45, SET_TOTAL=300, FIGURE_TOTAL=3000;
const validSet=id=>Number.isInteger(id)&&id>=0&&id<SET_TOTAL;
const list=v=>v instanceof Set?[...v]:Array.isArray(v)?v:[];
const countUnique=(v,predicate)=>new Set(list(v).filter(predicate)).size;
function evaluate(state){
 const s=state||{};
 const faces=Array.isArray(s.faceCleaning)&&s.faceCleaning.length===FACE_TOTAL?
  s.faceCleaning.filter(n=>n===3).length:0;
 let floor=0;
 if(Array.isArray(s.floorCleaning)&&s.floorCleaning.length===FLOOR_TOTAL){
  for(let id=0;id<FLOOR_TOTAL;id++){
   const kind=(id*7+Math.floor(id/5)*2)%3;
   if(s.floorCleaning[id]===[1,2,3][kind])floor++;
  }
 }
 const hiddenIds=list(s.hiddenIds),validHidden=new Set(hiddenIds.filter(Number.isInteger));
 const hidden=validHidden.size===HIDDEN_TOTAL?
  countUnique(s.hiddenRevealed,id=>validHidden.has(id)):0;
 const lifetime=countUnique(s.lifetimePerfect,validSet);
 const current=Number.isInteger(s.perfectRows)&&s.perfectRows>=0&&s.perfectRows<=SET_TOTAL?s.perfectRows:0;
 const shelved=Number.isInteger(s.shelved)&&s.shelved>=0&&s.shelved<=FIGURE_TOTAL?s.shelved:0;
 const held=Number.isInteger(s.held)&&s.held>=0&&s.held<=1?s.held:-1;
 const restorer={
  id:'restorer',title:'The Restorer',subtitle:'Leave no dust or forgotten treasure behind.',
  permanent:true,complete:faces===FACE_TOTAL&&floor===FLOOR_TOTAL&&hidden===HIDDEN_TOTAL,
  metrics:[{name:'Shelf faces cleaned',count:faces,total:FACE_TOTAL},
   {name:'Floor messes removed',count:floor,total:FLOOR_TOTAL},
   {name:'Hidden figures recovered',count:hidden,total:HIDDEN_TOTAL}]
 };
 const archivist={
  id:'archivist',title:'The Archivist',subtitle:'Perfect every named collection at least once.',
  permanent:true,complete:lifetime===SET_TOTAL,
  metrics:[{name:'Unique sets mastered for life',count:lifetime,total:SET_TOTAL}]
 };
 const perfect={
  id:'perfect',title:'The Perfect Bazaar',subtitle:'Every figure in perfect 1–10 order, at this very moment.',
  permanent:false,complete:current===SET_TOTAL&&shelved===FIGURE_TOTAL&&held===0,
  metrics:[{name:'Rows perfect right now',count:current,total:SET_TOTAL},
   {name:'Figures physically shelved',count:shelved,total:FIGURE_TOTAL}]
 };
 return {restorer,archivist,perfect,
  completed:[restorer,archivist,perfect].filter(j=>j.complete).length};
}
function card(j){
 const metrics=j.metrics.map(m=>{
  const pct=Math.round(m.count/m.total*100);
  return '<div class="journey-metric"><div class="journey-metric-head"><span>'+m.name+
   '</span><b>'+m.count+' / '+m.total+'</b></div>'+
   '<div class="journey-track" role="progressbar" aria-label="'+m.name+
   '" aria-valuemin="0" aria-valuemax="'+m.total+'" aria-valuenow="'+m.count+
   '"><i style="width:'+pct+'%"></i></div></div>';
 }).join('');
 const done=j.complete;
 return '<article class="journey-card journey-'+j.id+(done?' journey-complete':'')+
  '" aria-label="'+j.title+' '+(done?'complete':'in progress')+'">'+
  '<div class="journey-card-top"><span class="journey-emblem" aria-hidden="true">'+
  ({restorer:'✧',archivist:'▣',perfect:'★'}[j.id])+'</span>'+
  '<div><strong>'+j.title+'</strong><small>'+
  (j.permanent?'PERMANENT JOURNEY':'LIVE SHOP CONDITION')+'</small></div>'+
  '<b class="journey-state">'+(done?'✦ COMPLETE':'IN PROGRESS')+'</b></div>'+
  '<p>'+j.subtitle+'</p>'+metrics+
  (!j.permanent?'<small class="journey-hint">Sacrificing a perfect row will reopen this journey. Lifetime mastery stays earned.</small>':
   '<small class="journey-hint">Progress survives decoration sacrifices; no reset or timer.</small>')+
  '</article>';
}
function panel(state){
 const snap=state||evaluate({});
 return '<section class="journey-gallery" id="journeyGallery" aria-label="The Three Journeys">'+
  '<div class="journey-title"><div><span>PHASE 6 · YOUR THREE JOURNEYS</span><h3>THE PATH TO A PERFECT BAZAAR</h3></div>'+
  '<strong>'+snap.completed+' / 3 COMPLETE</strong></div>'+
  '<p class="journey-intro">Restore the shop, master every collection, then arrange all 3,000 figures at once. Each journey has its own finish line.</p>'+
  '<div class="journey-grid">'+[snap.restorer,snap.archivist,snap.perfect].map(card).join('')+'</div></section>';
}
window.BIT_BAZAAR_JOURNEYS=Object.freeze({evaluate,panel});
})();