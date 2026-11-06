/* Bit Bazaar v0.57 — thirty authored, permanent collector achievements.
   Achievement progress is derived from actual physical shop and event history.
   No currency, timers, customers, respawns, or per-frame work. */
(()=>{
'use strict';
const medals=Object.freeze([
 // Discovery and lifetime mastery: 8
 {id:'first-sighting',group:'COLLECTION',icon:'✦',title:'Hello, Little Stranger',desc:'Discover your first miniature. Every legend starts somewhere.',key:'seen',goal:1},
 {id:'ten-treasures',group:'COLLECTION',icon:'◆',title:'Ten Tiny Tales',desc:'Discover ten unique figurines. There are plenty more waiting.',key:'seen',goal:10},
 {id:'hundred-sightings',group:'COLLECTION',icon:'◈',title:'One Hundred Faces',desc:'Encounter a hundred distinct little personalities.',key:'seen',goal:100},
 {id:'thousand-sightings',group:'COLLECTION',icon:'❖',title:'A Thousand Small Worlds',desc:'Discover one thousand original figurines.',key:'seen',goal:1000},
 {id:'full-inventory',group:'COLLECTION',icon:'★',title:'Not One Left Behind',desc:'Discover all 3,000 figurines, including the eighteen hidden ones.',key:'seen',goal:3000},
 {id:'first-perfect',group:'COLLECTION',icon:'▣',title:'One Through Ten',desc:'Perfectly sort a named collection for the first time.',key:'mastered',goal:1},
 {id:'half-archive',group:'COLLECTION',icon:'♜',title:'Half the Stories Told',desc:'Perfect 150 distinct sets at least once.',key:'mastered',goal:150},
 {id:'complete-archive',group:'COLLECTION',icon:'♛',title:'The Entire Almanac',desc:'Perfect all 300 named collections at least once.',key:'mastered',goal:300},
 // Cleaning and secret discoveries: 7
 {id:'clean-one',group:'RESTORATION',icon:'✧',title:'A Little Less Dust',desc:'Completely clean your first shelf face, cobwebs and all.',key:'faces',goal:1},
 {id:'clean-fifteen',group:'RESTORATION',icon:'✣',title:'Aisle by Aisle',desc:'Restore fifteen usable shelf faces.',key:'faces',goal:15},
 {id:'all-shelves',group:'RESTORATION',icon:'✸',title:'No Cobwebs Allowed',desc:'Restore every one of the sixty shelf faces.',key:'faces',goal:60},
 {id:'clean-floor',group:'RESTORATION',icon:'⌁',title:'The First Sweep',desc:'Finish cleaning one real patch of floor clutter.',key:'floor',goal:1},
 {id:'all-floor',group:'RESTORATION',icon:'✳',title:'Spotless Underfoot',desc:'Finish all forty-five unique floor cleanups.',key:'floor',goal:45},
 {id:'hidden-first',group:'RESTORATION',icon:'?',title:'Wait, What Was That?',desc:'Reveal a figurine that was genuinely hidden in the mess.',key:'hidden',goal:1},
 {id:'hidden-all',group:'RESTORATION',icon:'✹',title:'Eighteen Tiny Miracles',desc:'Rescue all eighteen hidden figurines from their original hiding places.',key:'hidden',goal:18},
 // Sorting and fixing mistakes: 5
 {id:'wrong-full',group:'SORTING',icon:'?!',title:'Chaotic Good',desc:'Fill a shelf row with all ten matching figures in the wrong order.',key:'wrongSeen',goal:1},
 {id:'fix-wrong',group:'SORTING',icon:'↺',title:'Actually, Never Mind',desc:'Fix an observed full-but-unsorted set into perfect 1–10 order.',key:'repaired',goal:1},
 {id:'swap',group:'SORTING',icon:'⇄',title:'Trade Places',desc:'Use the actual one-in-hand figurine swap to change a shelf slot.',key:'swap',goal:1},
 {id:'ten-perfect-live',group:'SORTING',icon:'▥',title:'Ten Shelves of Satisfaction',desc:'Have ten physical shelf rows perfectly sorted at the same time.',key:'perfect',goal:10},
 {id:'perfect-bazaar',group:'SORTING',icon:'✪',title:'Everything in Its Place',desc:'Have all 3,000 figures properly shelved in 300 perfect rows at once.',key:'perfectBazaar',goal:1},
 // Decorating with a real sacrifice economy: 6
 {id:'first-sacrifice',group:'DECORATING',icon:'◇',title:'The Price of Pretty',desc:'Own your first original Sacrifice Catalog decoration.',key:'ownedArt',goal:1},
 {id:'sacrificed-and-restored',group:'DECORATING',icon:'❀',title:'Beauty, Then Order',desc:'Re-perfect a collection that was actually scattered by a decoration purchase.',key:'repairedSacrifice',goal:1},
 {id:'five-art',group:'DECORATING',icon:'✿',title:'Interior Ambitions',desc:'Permanently own five unique authored decorations.',key:'ownedArt',goal:5},
 {id:'twenty-art',group:'DECORATING',icon:'◉',title:'Gallery of a Thousand Dreams',desc:'Permanently own twenty unique authored decorations.',key:'ownedArt',goal:20},
 {id:'art-on-display',group:'DECORATING',icon:'▤',title:'Make It Yours',desc:'Install ten owned decorations in actual store display locations.',key:'placedArt',goal:10},
 {id:'finish-flair',group:'DECORATING',icon:'✺',title:'The Finishing Touch',desc:'Choose a nondefault free finish for your earned collector honors.',key:'trim',goal:1},
 // Humor and collector planning: 4
 {id:'cowards-choice',group:'ODDITIES',icon:'◎',title:'The Coward’s Choice',desc:'Master 150 unique sets and permanently unlock the ridiculous glasses.',key:'mastered',goal:150},
 {id:'coward-worn',group:'ODDITIES',icon:'◌',title:'Wear the Label',desc:'Actually equip the Coward’s Glasses. Own the joke.',key:'wore',goal:1},
 {id:'coward-off',group:'ODDITIES',icon:'◍',title:'I Can Find It Myself',desc:'Take off the Coward’s Glasses after wearing them.',key:'removed',goal:1},
 {id:'first-pin',group:'ODDITIES',icon:'☆',title:'A Little Reminder',desc:'Pin a collection in the Almanac so you can follow its checklist.',key:'pinned',goal:1}
]);
const medalIds=new Set(medals.map(m=>m.id));
if(medals.length!==30||medalIds.size!==30)throw Error('Achievement catalog must have 30 unique authored entries');
const isSet=x=>Number.isInteger(x)&&x>=0&&x<300;
const uniq=(x,valid)=>new Set((x instanceof Set?[...x]:Array.isArray(x)?x:[]).filter(valid));
const own=x=>Number.isInteger(x)&&x>=0&&x<3000;
const makeData=()=>({earned:[],unordered:[],sacrificed:[],marks:[]});
const validMarks=new Set(['swap','wore','removed','repaired','repairedSacrifice']);
function validateData(raw){
 if(raw===undefined)return true;
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid achievement history');
 for(const [key,limit,valid] of [
  ['earned',30,x=>medalIds.has(x)],['unordered',300,isSet],
  ['sacrificed',300,isSet],['marks',validMarks.size,x=>validMarks.has(x)]
 ]){
  const a=raw[key];
  if(!Array.isArray(a)||a.length>limit||a.some(x=>!valid(x))||new Set(a).size!==a.length)
   throw Error('Invalid achievement history: '+key);
 }
 return true;
}
function normalize(raw){
 if(raw===undefined)return makeData();
 validateData(raw);
 return {earned:[...raw.earned],unordered:[...raw.unordered],
  sacrificed:[...raw.sacrificed],marks:[...raw.marks]};
}
function event(data,kind){
 if(!validMarks.has(kind))return false;
 if(kind==='removed'&&!data.marks.includes('wore'))return false;
 if(!data.marks.includes(kind)){data.marks.push(kind);return true;}
 return false;
}
function tally(s){
 const face=Array.isArray(s.faceCleaning)?s.faceCleaning:[];
 const floors=Array.isArray(s.floorCleaning)?s.floorCleaning:[];
 const hiddenIds=uniq(s.hiddenIds,own);
 const hidden=uniq(s.hiddenRevealed,x=>hiddenIds.has(x)).size;
 const slots=Array.isArray(s.slots)?s.slots:[];
 const perfectIds=new Set(),wrongIds=new Set();
 let perfect=0,shelved=0;
 for(const faceRows of slots){
  if(!Array.isArray(faceRows))continue;
  for(const line of faceRows){
   if(!Array.isArray(line)||line.length!==10)continue;
   const values=line.filter(own);
   shelved+=values.length;
   if(values.length!==10)continue;
   const sid=Math.floor(values[0]/10);
   if(!values.every(x=>Math.floor(x/10)===sid))continue;
   if(values.every((x,i)=>x%10===i)){perfect++;perfectIds.add(sid);}
   else wrongIds.add(sid);
  }
 }
 const cleanedFace=face.length===60?face.filter(v=>v===3).length:0;
 const cleanedFloor=floors.length===45?floors.filter((v,i)=>
  v===[1,2,3][(i*7+Math.floor(i/5)*2)%3]).length:0;
 return {seen:uniq(s.seenFigures,own).size,
  mastered:uniq(s.lifetimePerfect,isSet).size,
  faces:cleanedFace,floor:cleanedFloor,hidden,perfect,shelved,
  perfectIds,wrongIds,
  perfectBazaar:Number(perfect===300&&shelved===3000&&s.held===0),
  ownedArt:Math.max(0,Math.min(180,Number(s.ownedArt)||0)),
  placedArt:Math.max(0,Math.min(232,Number(s.placedArt)||0)),
  trim:s.honorTrim===1||s.honorTrim===2?1:0,
  pinned:uniq(s.pinnedSets,isSet).size};
}
function value(key,t,data){
 if(key==='wrongSeen')return data.unordered.length>0?1:0;
 if(key==='repaired'||key==='swap'||key==='repairedSacrifice'||
    key==='wore'||key==='removed')return data.marks.includes(key)?1:0;
 return t[key]??0;
}
function observe(data,state,prior=null){
 const t=tally(state),unordered=new Set(data.unordered),pending=new Set(data.sacrificed);
 const before=prior&&Array.isArray(prior.perfectIds)?new Set(prior.perfectIds):null;
 // Only a real acquisition of an owned piece coupled to an actual loss of
 // previously perfect set rows counts as a purchased-shelf sacrifice.
 if(before&&t.ownedArt>prior.ownedArt){
  for(const id of before)if(!t.perfectIds.has(id))pending.add(id);
 }
 for(const sid of t.wrongIds)unordered.add(sid);
 for(const sid of t.perfectIds){
  if(unordered.has(sid))event(data,'repaired');
  if(pending.has(sid)){event(data,'repairedSacrifice');pending.delete(sid);}
 }
 data.unordered=[...unordered];data.sacrificed=[...pending];
 const earned=new Set(data.earned),newly=[];
 for(const m of medals){
  if(earned.has(m.id)||value(m.key,t,data)<m.goal)continue;
  earned.add(m.id);newly.push(m.id);
 }
 data.earned=[...earned];
 return {data,t,newly,prior:{perfectIds:[...t.perfectIds],ownedArt:t.ownedArt}};
}
function summary(data,state){
 const t=tally(state),earned=new Set(data.earned);
 return {total:medals.length,earned:earned.size,remaining:medals.length-earned.size,
  medals:medals.map(m=>({...m,earned:earned.has(m.id),
   progress:Math.min(m.goal,value(m.key,t,data)),goal:m.goal})),t};
}
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function panel(data,state,filter='all'){
 const snap=summary(data,state);
 const pick=['all','earned','locked'].includes(filter)?filter:'all';
 const visible=snap.medals.filter(m=>pick==='all'||(pick==='earned'?m.earned:!m.earned));
 const groups=['COLLECTION','RESTORATION','SORTING','DECORATING','ODDITIES'];
 const items=groups.map(group=>{
  const arr=visible.filter(m=>m.group===group);
  if(!arr.length)return '';
  return '<div class="achievement-group"><h4>'+group+' · '+arr.filter(m=>m.earned).length+
   '/'+medals.filter(m=>m.group===group).length+'</h4><div class="achievement-grid">'+
   arr.map(m=>'<article class="achievement-medal '+(m.earned?'achievement-earned':'achievement-locked')+
   '" aria-label="'+esc(m.title)+' '+(m.earned?'earned':'locked')+'">'+
   '<span class="achievement-icon" aria-hidden="true">'+esc(m.icon)+'</span>'+
   '<div class="achievement-copy"><strong>'+esc(m.title)+'</strong><p>'+esc(m.desc)+
   '</p><small>'+(m.earned?'✦ PERMANENTLY EARNED':m.progress+' / '+m.goal+' · KEEP GOING')+
   '</small></div></article>').join('')+'</div></div>';
 }).join('');
 return '<section class="achievement-gallery" id="achievementGallery" aria-label="Thirty unique collector achievements">'+
  '<div class="achievement-head"><div><span>PHASE 6 · COLLECTOR’S HONORS</span><h3>THE THIRTY LITTLE LEGENDS</h3></div>'+
  '<b>'+snap.earned+' / 30 EARNED</b></div>'+
  '<p>Thirty named accomplishments. Once earned, a medal stays yours even if you scatter a shelf or move a decoration.</p>'+
  '<div class="achievement-filters" role="group" aria-label="Filter collector achievements">'+
  [['all','ALL 30'],['earned','EARNED'],['locked','LOCKED']].map(([id,label])=>
  '<button type="button" data-achievement-filter="'+id+'" aria-pressed="'+(pick===id)+
  '" class="'+(pick===id?'active':'')+'">'+label+'</button>').join('')+'</div>'+
  (items||'<p class="achievement-empty">NO ACHIEVEMENTS IN THIS VIEW YET.</p>')+'</section>';
}
window.BIT_BAZAAR_ACHIEVEMENTS=Object.freeze({
 medals,ids:[...medalIds],makeData,validateData,normalize,event,tally,observe,summary,panel
});
})();