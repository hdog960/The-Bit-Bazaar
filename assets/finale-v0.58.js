/* Bit Bazaar v0.58 — Phase 6.4: the one-of-a-kind Collector's Monument.
   No sale SKU, no inventory IDs, no recurring tasks. Unlock is the permanent,
   already-validated "perfect-bazaar" medal earned only at 300/300 live rows. */
(()=>{
'use strict';
const monument=Object.freeze({kind:'collector-monument',x:48,z:65.4,
 name:"The Collector's Monument",location:'EAST ENTRANCE ALCOVE',height:3.48});
const chapters=Object.freeze([
 Object.freeze({eyebrow:'THE FIRST DAY',title:'FROM DUST',subtitle:'A little shop. A thousand forgotten corners.',
  lines:['Every shelf had a story waiting beneath the cobwebs.',
   'You never needed customers. The figures themselves were reason enough.'],
  theme:'dust',number:'I'}),
 Object.freeze({eyebrow:'THE JOURNEY',title:'THREE THOUSAND STORIES',subtitle:'One treasure at a time.',
  lines:['All sixty display faces restored. Every little secret brought to light.',
   'Three hundred collections reunited in their own perfect order.'],
  theme:'shelves',number:'II'}),
 Object.freeze({eyebrow:'THE MOMENT',title:'THE PERFECT BAZAAR',subtitle:'Three hundred shelves. Three thousand pieces. One masterpiece.',
  lines:['You turned a room of scattered miniatures into a world worth remembering.',
   'Your achievement is permanent. Your collection remains yours to rearrange.'],
  theme:'stars',number:'III'}),
 Object.freeze({eyebrow:'A PERMANENT HONOR',title:'THE COLLECTOR’S MONUMENT',subtitle:'An original display that can never be bought.',
  lines:['A handmade crown of tiny legends now stands in the east entrance alcove.',
   'Return whenever you like. Rearrange, decorate, and tell a new story.'],
  theme:'monument',number:'★'})
]);
function unlocked(earned){
 const a=earned instanceof Set?[...earned]:Array.isArray(earned)?earned:[];
 return a.includes('perfect-bazaar');
}
function status(earned,viewed=false){
 const ready=unlocked(earned);
 return {unlocked:ready,monument:ready,viewed:ready&&viewed===true,
  replayable:ready,location:monument.location,chapterCount:chapters.length};
}
// A deliberate four-part, skippable cinematic; never auto-opens gameplay.
// No auto advances, timer, background work, or multiplayer dependency.
function scene(index){
 const i=Math.max(0,Math.min(chapters.length-1,Number.isInteger(index)?index:0));
 const c=chapters[i];
 const stars=Array.from({length:13},(_,j)=>'<span class="finale-spark finale-spark-'+j+'">✦</span>').join('');
 return '<div class="finale-scene finale-theme-'+c.theme+'" data-finale-chapter="'+i+'">'+
  '<div class="finale-chapter-label">CHAPTER '+c.number+' · '+c.eyebrow+'</div>'+
  '<div class="finale-art" aria-hidden="true">'+
   '<div class="finale-crown">'+
    '<span class="finale-crown-ray left">◆</span><span class="finale-crown-ray mid">★</span>'+
    '<span class="finale-crown-ray right">◆</span>'+
    '<i class="finale-crown-base"></i></div>'+
   '<div class="finale-plinth"><b>3,000</b><span>BIT BAZAAR</span></div>'+stars+'</div>'+
  '<h2 id="finaleTitle">'+c.title+'</h2><p class="finale-subtitle">'+c.subtitle+'</p>'+
  '<div class="finale-story">'+c.lines.map(line=>'<p>'+line+'</p>').join('')+'</div>'+
  '<div class="finale-chapter-count">'+(i+1)+' / '+chapters.length+'</div></div>';
}
// World-space handcrafted pixel monument: 3D stepped architectural plinth,
// suspended star-crown, trimmed facets, and tiny engraved commemorative plate.
// Uses only the existing canvas and projection. Never allocates new textures.
function draw(ctx,project,quad,line,trim=0){
 if(!ctx||!project||!quad||!line)return false;
 const {x,z}=monument,foot=project(x,z,.1);
 if(!foot||foot.depth<.36||foot.depth>31)return false;
 const p=Math.max(.6,foot.depth),sc=360/p;
 if(foot.x<-sc*3||foot.x>480+sc*3||foot.y<-sc*5||foot.y>270+sc*2)return false;
 const pal=[
  ['#382a47','#b88a58','#f5d99b','#fff5cc','#86617a'],
  ['#352b52','#9a81c6','#d4c0fc','#fff2fc','#65578c'],
  ['#1c4248','#63aa9f','#a7edcb','#f0ffe5','#478c92']
 ][Number.isInteger(trim)?Math.max(0,Math.min(trim,2)):0];
 const poly=(ax,az,bx,bz,h1,h2,shade)=>quad(
  project(ax,az,h2),project(bx,bz,h2),project(bx,bz,h1),project(ax,az,h1),shade);
 const cube=(halfX,halfZ,bottom,top)=>{
  poly(x-halfX,z-halfZ,x+halfX,z-halfZ,bottom,top,pal[0]);
  poly(x-halfX,z+halfZ,x+halfX,z+halfZ,bottom,top,pal[1]);
  poly(x-halfX,z-halfZ,x-halfX,z+halfZ,bottom,top,pal[4]);
  poly(x+halfX,z-halfZ,x+halfX,z+halfZ,bottom,top,pal[4]);
  quad(project(x-halfX,z-halfZ,top),project(x+halfX,z-halfZ,top),
   project(x+halfX,z+halfZ,top),project(x-halfX,z+halfZ,top),pal[2]);
 };
 // Recessed tile footing and three stone-and-gold tiers.
 cube(1.05,.70,.08,.24);
 cube(.92,.58,.24,.50);
 cube(.72,.43,.50,.73);
 cube(.39,.31,.73,2.08);
 for(const height of [.72,1.82,2.03]){
  line(x-.49,z+.32,height,x+.49,z+.32,height,pal[3],Math.max(.8,sc*.018));
 }
 // Crown framing: two rising wings and a faceted diamond at center.
 for(const sign of [-1,1]){
  line(x+sign*.24,z,2.05,x+sign*.68,z,2.68,pal[1],Math.max(1,sc*.045));
  line(x+sign*.68,z,2.68,x+sign*.21,z,3.12,pal[2],Math.max(1,sc*.040));
  line(x+sign*.21,z,3.12,x,z,2.97,pal[3],Math.max(1,sc*.024));
 }
 const diamond=[
  project(x,z,3.47),project(x+.42,z,2.93),
  project(x,z,2.42),project(x-.42,z,2.93)];
 if(diamond.every(q=>q.depth>.35)){
  const fill=(indexes,color)=>{
   ctx.beginPath();ctx.moveTo(diamond[indexes[0]].x,diamond[indexes[0]].y);
   for(let j=1;j<indexes.length;j++)ctx.lineTo(diamond[indexes[j]].x,diamond[indexes[j]].y);
   ctx.closePath();ctx.fillStyle=color;ctx.fill();
  };
  fill([0,1,2],pal[2]);fill([0,2,3],pal[3]);
  const center=project(x,z,2.93);
  const size=Math.max(2,Math.min(13,sc*.20));
  ctx.fillStyle=pal[0];ctx.fillRect(center.x-size*.5,center.y-size*.5,size,size);
  ctx.fillStyle=pal[3];ctx.fillRect(center.x-size*.24,center.y-size*.24,size*.48,size*.48);
 }
 const plate=project(x,z+.46,.49);
 if(plate&&plate.depth>.45&&plate.depth<20&&plate.x>-60&&plate.x<540){
  const w=Math.max(12,Math.min(84,sc*1.4)),h=Math.max(7,Math.min(28,sc*.34));
  ctx.fillStyle=pal[0];ctx.fillRect(plate.x-w/2-2,plate.y-h/2-2,w+4,h+4);
  ctx.fillStyle=pal[2];ctx.fillRect(plate.x-w/2,plate.y-h/2,w,h);
  ctx.fillStyle=pal[0];ctx.textAlign='center';
  ctx.font='bold '+Math.max(6,Math.min(12,Math.round(sc*.13)))+'px monospace';
  ctx.fillText('3,000',plate.x,plate.y+Math.max(2,h*.15));
  ctx.textAlign='start';
 }
 return true;
}
function target(player,project,aimX,aimY){
 const distance=Math.hypot(player.x-monument.x,player.z-monument.z);
 if(distance<1.25||distance>5.9)return null;
 const base=project(monument.x,monument.z,.25),top=project(monument.x,monument.z,3.46);
 if(!base||!top||base.depth<.25||top.depth<.25)return null;
 const w=360/Math.max(.4,base.depth)*.92;
 if(Math.abs(aimX-base.x)>w||aimY<top.y-8||aimY>base.y+12)return null;
 return {kind:'monument',dist:base.depth};
}
window.BIT_BAZAAR_FINALE=Object.freeze({monument,chapters,unlocked,status,scene,draw,target});
})();