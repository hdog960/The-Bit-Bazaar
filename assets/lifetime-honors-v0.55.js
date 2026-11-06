/* Bit Bazaar Phase 6.1 — nine real, permanent lifetime rewards.
   No new figure IDs, no saved achievement counter, no giant art canvases. */
(()=>{
'use strict';
const tiers=Object.freeze([
 {at:1,title:'First Perfect Ten',reward:'Founding shop sign',kind:'sign',x:35,z:61,h:3.2},
 {at:10,title:'Finding Your Rhythm',reward:'Small collector showcase',kind:'case',x:29,z:61,h:1.45},
 {at:25,title:'Dedicated Sorter',reward:'Numbered shelf nameplates',kind:'plates'},
 {at:50,title:'The Restorer',reward:'Three free gallery finish choices',kind:'finish',x:41,z:61,h:2.9},
 {at:100,title:'A Serious Collection',reward:'Commemorative centerpiece',kind:'star',x:34,z:59,h:1.8},
 {at:150,title:"The Coward's Choice",reward:"Optional Coward's Glasses",kind:'glasses',x:31,z:59,h:2.2},
 {at:200,title:'The Great Archivist',reward:'Gilded archivist plaque and floor seal',kind:'seal',x:39,z:59,h:2.6},
 {at:250,title:'Almost Legendary',reward:'Entrance ornament',kind:'arch',x:35,z:66,h:3.4},
 {at:300,title:'Master of the Bazaar',reward:'Exclusive master display',kind:'master',x:35,z:56,h:2.1}
]);
const trimNames=Object.freeze(['AMBER BRASS','MOONLIT AMETHYST','MINT CHROME']);
const palettes=Object.freeze([
 ['#483047','#e8b77d','#fff0be','#9b6578'],
 ['#312f52','#c8a7fa','#faf0ff','#6f65a4'],
 ['#23454e','#95eac7','#ebfff3','#4b8d8b']
]);
function unique(ever){
 const entries=ever instanceof Set?[...ever]:Array.isArray(ever)?ever:[];
 return new Set(entries.filter(x=>Number.isInteger(x)&&x>=0&&x<300)).size;
}
function unlocked(ever,at){return unique(ever)>=at;}
function status(ever){
 const count=unique(ever),earned=tiers.filter(t=>count>=t.at),next=tiers.find(t=>count<t.at)||null;
 return {count,earned:earned.length,next:next?{at:next.at,title:next.title,remaining:next.at-count}:null,
  rewards:tiers.map(t=>({...t,earned:count>=t.at}))};
}
function panel(ever,chosen=0){
 const progress=status(ever);
 const blocks=progress.rewards.map((t,i)=>`<article class="honor-card ${t.earned?'earned':'locked'}"
 aria-label="${t.title} milestone ${t.earned?'earned':'locked'}">
 <span class="honor-count">${String(t.at).padStart(3,'0')} / 300</span>
 <strong>${t.earned?'✦ ':'◇ '}${t.title}</strong>
 <small>${t.reward}</small>
 <em>${t.earned?'PERMANENTLY EARNED':'LOCKED · '+Math.max(0,t.at-progress.count)+' MORE SETS'}</em>
 </article>`).join('');
 const enabled=progress.count>=50;
 const choices=trimNames.map((label,i)=>`<button type="button" data-honor-finish="${i}"
 aria-pressed="${enabled&&chosen===i}" ${enabled?'':'disabled'}
 class="${chosen===i?'selected':''}">${label}</button>`).join('');
 return `<section class="honor-gallery" id="honorGallery" aria-label="Lifetime milestone awards">
 <div class="honor-header"><b>✦ YOUR PERMANENT HONORS</b>
 <span>${progress.count} / 300 DISTINCT SETS MASTERED</span></div>
 <p>First-time perfect collections earn permanent displays. Buying decorations or
 rearranging sets never removes these honors.</p>
 <div class="honor-grid">${blocks}</div>
 <div class="honor-style"><strong>FREE SHOWCASE FINISHES · UNLOCK AT 50</strong>
 <div role="group" aria-label="Choose showcase finish">${choices}</div>
 <small>Changes only earned display accents. No rows or currency are spent.</small></div>
 </section>`;
}
// Eight fixed signed displays only. All locations are decorative,
// visible through perspective (never counted as figures or decor mounts).
function world(ever){
 const n=unique(ever);
 return tiers.filter(t=>t.x!==undefined&&n>=t.at);
}
function draw(ctx,project,piece,trim=0){
 if(!piece||!Number.isFinite(piece.x)||!Number.isFinite(piece.z))return false;
 const p=project(piece.x,piece.z,piece.h);
 if(!p||p.depth<.45||p.depth>31)return false;
 const pal=palettes[trim]||palettes[0];
 const w=Math.max(8,Math.min(66,175/p.depth));
 const h=w*.68,x=Math.round(p.x-w/2),y=Math.round(p.y-h/2);
 if(x>480||x+w<0||y>270||y+h<0)return false;
 ctx.fillStyle='#151627bb';ctx.fillRect(x-3,y-3,w+6,h+6);
 ctx.fillStyle=pal[1];ctx.fillRect(x-2,y-2,w+4,h+4);
 ctx.fillStyle=pal[0];ctx.fillRect(x+1,y+1,w-2,h-2);
 ctx.fillStyle=pal[3];ctx.fillRect(x+4,y+h-7,w-8,3);
 // Each earned monument has its own pixel silhouette: display cabinet,
 // shop marquee, star pedestal, ornament arch or master crown.
 if(piece.kind==='case'){
  ctx.fillStyle=pal[2];ctx.fillRect(x+5,y+4,w-10,h*.44);
  ctx.fillStyle=pal[0];ctx.fillRect(x+7,y+6,w-14,Math.max(2,h*.4-4));
  ctx.fillStyle=pal[1];ctx.fillRect(x+w*.43,y+h*.25,w*.14,h*.15);
 }else if(piece.kind==='star'||piece.kind==='master'){
  ctx.fillStyle=pal[1];ctx.fillRect(x+w*.35,y+h*.60,w*.30,h*.23);
  ctx.fillStyle=pal[2];ctx.fillRect(x+w*.18,y-6,w*.64,4);
  if(piece.kind==='master'){
   ctx.fillRect(x+w*.1,y-11,w*.13,7);ctx.fillRect(x+w*.77,y-11,w*.13,7);
   ctx.fillRect(x+w*.46,y-14,w*.09,9);
  }
 }else if(piece.kind==='arch'){
  ctx.fillStyle=pal[1];
  ctx.fillRect(x-7,y-9,5,h+17);ctx.fillRect(x+w+2,y-9,5,h+17);
  ctx.fillRect(x-7,y-11,w+14,5);
 }else if(piece.kind==='sign'){
  ctx.fillStyle=pal[2];ctx.fillRect(x+w*.13,y+2,w*.74,3);
 }else if(piece.kind==='finish'){
  for(let i=0;i<3;i++){
   ctx.fillStyle=pal[i];ctx.fillRect(x+w*(.22+i*.23),y+h*.72,Math.max(3,w*.14),4);
  }
 }else if(piece.kind==='seal'){
  ctx.fillStyle=pal[2];ctx.fillRect(x+7,y+5,w-14,2);
 }
 ctx.textAlign='center';
 ctx.fillStyle=pal[2];
 ctx.font='bold '+Math.max(7,Math.min(14,Math.round(w*.23)))+'px monospace';
 ctx.fillText(piece.kind==='glasses'?'◎':piece.kind==='master'?'★':
  piece.kind==='arch'?'✦':piece.kind==='case'?'◆':piece.kind==='finish'?'◇':
  piece.kind==='seal'?'▣':piece.kind==='star'?'★':'✦',p.x,y+h*.47);
 ctx.font='bold '+Math.max(6,Math.min(10,Math.round(w*.16)))+'px monospace';
 ctx.fillText(''+piece.at,p.x,y+h*.76);
 ctx.textAlign='start';
 return true;
}
function floorSeal(ctx,project,trim=0){
 const coords=[[33.7,63.3],[36.3,63.3],[36.3,66.0],[33.7,66.0]];
 const points=coords.map(([x,z])=>project(x,z,.11));
 if(points.some(p=>!p||p.depth<.35))return false;
 const pal=palettes[trim]||palettes[0];
 ctx.fillStyle=pal[1];ctx.beginPath();
 ctx.moveTo(points[0].x,points[0].y);
 for(let i=1;i<4;i++)ctx.lineTo(points[i].x,points[i].y);
 ctx.closePath();ctx.fill();
 const center=project(35,64.65,.12);
 if(center&&center.depth>.4&&center.depth<21){
  ctx.fillStyle=pal[0];ctx.fillRect(center.x-15,center.y-5,30,10);
  ctx.fillStyle=pal[2];ctx.font='bold 7px monospace';
  ctx.textAlign='center';ctx.fillText('200 ★',center.x,center.y+2);ctx.textAlign='start';
 }
 return true;
}
function shelfPlate(ctx,project,fixture,number,trim=0){
 if(!fixture||!Number.isInteger(number)||number<1||number>60)return false;
 const p=project(fixture.x,fixture.z,4.19);
 if(!p||p.depth<1||p.depth>18||p.x<12||p.x>468||p.y<12||p.y>244)return false;
 const w=Math.max(13,Math.min(40,92/p.depth));
 const pal=palettes[trim]||palettes[0],x=Math.round(p.x-w/2),y=Math.round(p.y-6);
 ctx.fillStyle=pal[1];ctx.fillRect(x,y,w,12);
 ctx.fillStyle=pal[0];ctx.fillRect(x+2,y+2,w-4,8);
 ctx.textAlign='center';ctx.font='bold 8px monospace';
 ctx.fillStyle=pal[2];ctx.fillText(''+number,p.x,y+9);
 ctx.textAlign='start';
 return true;
}
window.BIT_BAZAAR_HONORS=Object.freeze({
 tiers,trimNames,unique,unlocked,status,panel,world,draw,shelfPlate,floorSeal
});
})();