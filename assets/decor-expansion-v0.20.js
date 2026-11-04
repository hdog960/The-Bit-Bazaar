/* Bit Bazaar v0.20 — eight individually drawn lighting and textile pieces.
   Extends, never mutates, the twelve original v0.19 artworks and 28 positions. */
(()=>{
'use strict';
const previous=window.BIT_BAZAAR_DECOR;
if(!previous||previous.items.length!==12||previous.slots.length!==28)
 throw Error('The 12-piece gallery must load first');
const NEW=[
 {id:'aurora-orrery-lamp',name:'Aurora Orrery Lamp',category:'Lighting',mount:'floor',price:3,art:'orrery',
  description:'A golden solar mechanism suspends three tiny glowing planets around its luminous globe.'},
 {id:'hearthglass-lantern',name:'Hearthglass Lantern',category:'Lighting',mount:'floor',price:2,art:'hearth',
  description:'A ruby-glass flame lantern with wrought-iron feet, amber windows and a coiled chimney.'},
 {id:'verdigris-lighthouse',name:'Verdigris Lighthouse',category:'Lighting',mount:'floor',price:5,art:'lighthouse',
  description:'An aged turquoise copper beacon casts its warm light from a miniature cliff tower.'},
 {id:'moonflower-floorlight',name:'Moonflower Floorlight',category:'Lighting',mount:'floor',price:4,art:'moonflower',
  description:'A sweeping vine of silver leaves cradles a luminous white moonflower above its stone pot.'},
 {id:'sunken-compass-rug',name:'Sunken Compass Carpet',category:'Rugs',mount:'rug',price:1,art:'compass',
  description:'A deep-blue expedition carpet with a brass compass rose and a braided rope border.'},
 {id:'mosswork-runestone-rug',name:'Mosswork Runestone Rug',category:'Rugs',mount:'rug',price:2,art:'runes',
  description:'Weathered garden tiles form an emerald rune circle, bordered by curling ivy.'},
 {id:'starfall-observatory-runner',name:'Starfall Observatory Runner',category:'Rugs',mount:'rug',price:3,art:'starfall',
  description:'A long twilight runner stitched with tiny astral constellations and a golden telescope.'},
 {id:'amber-honeycomb-mat',name:'Amber Honeycomb Mat',category:'Rugs',mount:'rug',price:4,art:'honeycomb',
  description:'A warm honey-and-slate woven mat featuring offset waxen hexagons and a tiny queen bee.'}
];
const RUG_SLOTS=[
 [7,16,'WEST · ENTRY WALK'],[63,16,'EAST · ENTRY WALK'],
 [7,41,'WEST · MIDSTORE'],[63,41,'EAST · MIDSTORE'],
 [7,59,'WEST · BACK WALK'],[63,59,'EAST · BACK WALK'],
 [35,7,'NORTH · WELCOME'],[35,66,'SOUTH · EXIT']
].map(([x,z,name],i)=>({id:28+i,kind:'rug',side:'FLOOR',name:name+' RUG SITE',x,z}));
function drawLamp(item){
 const c=document.createElement('canvas');c.width=32;c.height=40;
 const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 const p=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(x,y,w,h)};
 const art=item.art;
 if(art==='orrery'){
  p(8,36,16,3,'#574358');p(10,34,12,2,'#bc9361');p(15,17,3,18,'#a88865');
  p(13,29,7,2,'#e8c08b');p(12,25,9,2,'#9e865d');
  for(let i=0;i<7;i++){const x=5+i*3;p(x,13+Math.round(Math.abs(3-i)*.95),2,2,i%2?'#719fc3':'#dbb77d');}
  p(10,7,12,14,'#84738a');p(12,8,8,12,'#9abacc');
  p(13,10,6,8,'#e1edcc');p(14,12,4,6,'#fff0b0');
  p(5,11,4,4,'#f0a96f');p(6,10,2,2,'#f9dfad');
  p(23,16,4,4,'#86baca');p(24,15,2,2,'#f3f0c9');
  p(16,3,1,5,'#dec98a');p(10,4,12,2,'#caab81');
  p(9,15,14,2,'#a9805c');p(13,19,7,1,'#f9dfab');
 }else if(art==='hearth'){
  p(5,36,22,3,'#4e4458');p(10,33,12,3,'#987663');
  p(8,13,16,20,'#755062');p(10,14,12,18,'#dcb67d');
  p(11,16,10,13,'#9c5e4a');p(12,15,8,12,'#f4ad55');
  p(14,17,5,9,'#f8d88b');p(15,19,3,5,'#fff4bc');
  p(10,7,12,5,'#454053');p(13,5,6,3,'#bc9779');
  p(15,2,3,4,'#756070');p(12,9,8,3,'#e4bc88');
  for(let y=14;y<=29;y+=5){p(10,y,1,2,'#e8ca9d');p(21,y,1,2,'#e8ca9d');}
  p(8,31,4,3,'#564b5a');p(20,31,4,3,'#564b5a');
 }else if(art==='lighthouse'){
  p(6,36,20,3,'#52576a');p(7,33,18,3,'#797c7a');
  p(11,14,10,20,'#789b9d');p(13,17,6,14,'#aac6b3');
  for(let y=18;y<31;y+=5)p(11,y,10,2,'#536e79');
  p(12,20,2,3,'#e6e2bc');p(18,25,2,3,'#e6e2bc');
  p(8,10,16,4,'#627582');p(10,5,12,7,'#d8bd8c');
  p(12,6,8,5,'#ffe0a0');p(14,7,4,3,'#fff6c6');
  p(11,3,10,2,'#4d5769');p(15,1,2,3,'#deb97b');
  p(6,11,3,2,'#e5ba78');p(23,11,3,2,'#e5ba78');
  p(8,15,3,3,'#b0bca7');p(21,15,3,3,'#b0bca7');
 }else{
  p(7,36,18,3,'#5a5267');p(10,32,12,4,'#877a85');p(12,30,8,3,'#a29aa6');
  p(16,18,2,14,'#7b947b');p(13,25,5,2,'#8baf8d');
  p(18,22,6,3,'#729780');p(21,20,4,2,'#bad3b7');
  p(9,24,7,3,'#7eaf9b');p(9,22,4,3,'#bed3c4');
  p(15,12,3,8,'#9fae9d');p(9,11,7,5,'#e0d9d8');
  p(16,9,8,6,'#e7dce8');p(12,5,9,7,'#f1e7df');
  p(14,3,6,5,'#fff3dc');p(15,4,4,5,'#fffce6');
  p(11,8,5,3,'#b3a8c8');p(21,10,4,3,'#c7bed4');
  p(7,13,4,2,'#ccc6d7');p(23,15,3,2,'#ddd6d7');
 }
 return c;
}
function drawRug(item){
 const c=document.createElement('canvas');c.width=40;c.height=28;
 const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 const p=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(x,y,w,h)};
 const art=item.art;
 if(art==='compass'){
  p(0,0,40,28,'#24445d');p(1,1,38,26,'#bf9e65');p(2,2,36,24,'#203a56');
  for(let x=3;x<37;x+=4){p(x,3,2,2,'#8db3bb');p(x,23,2,2,'#8db3bb');}
  for(let y=4;y<24;y+=3){p(3,y,2,1,'#d3bd87');p(35,y,2,1,'#d3bd87');}
  p(18,5,4,18,'#cda46b');p(10,12,20,3,'#cda46b');
  p(14,8,12,12,'#d9c28b');p(16,10,8,8,'#315c72');
  p(19,6,2,16,'#f4d99b');p(12,13,16,2,'#f4d99b');
  p(16,10,8,8,'#37617d');p(18,12,4,4,'#f9e4a8');
  p(19,3,2,4,'#faf0c0');p(19,21,2,4,'#faf0c0');
 }else if(art==='runes'){
  p(0,0,40,28,'#416958');p(1,1,38,26,'#9aa57c');p(3,3,34,22,'#345c5a');
  for(let x=4;x<36;x+=6)for(let y=4;y<24;y+=6){
   p(x,y,3,2,'#537969');p(x+1,y+2,3,1,'#719583');
  }
  for(let i=0;i<12;i++){const x=18+Math.floor(Math.cos(i*Math.PI/6)*11),y=13+Math.floor(Math.sin(i*Math.PI/6)*8);p(x,y,4,2,i%3?'#b7cead':'#e2d8aa');}
  p(17,7,6,14,'#264e55');p(14,12,12,3,'#b7d4bf');
  p(18,10,3,10,'#e6dab0');p(17,18,8,2,'#e6dab0');
  p(18,4,2,3,'#d7e5c2');p(18,22,2,3,'#d7e5c2');
  p(6,6,6,2,'#809c6f');p(27,20,6,2,'#809c6f');
 }else if(art==='starfall'){
  p(0,0,40,28,'#353d67');p(2,2,36,24,'#b7a17f');p(4,4,32,20,'#242e55');
  for(let i=0;i<23;i++){
   const x=5+(i*11)%30,y=5+(i*17)%18;
   p(x,y,1,1,i%3?'#c8cde8':'#fff3cf');
  }
  p(9,19,23,2,'#b9a96c');p(12,17,4,2,'#f0dd9c');
  p(17,10,3,9,'#f5dda4');p(18,9,8,2,'#f5dda4');
  p(25,6,5,4,'#d1bf91');p(26,7,3,2,'#58738f');
  p(22,11,6,1,'#8c9cc3');
  p(6,6,3,3,'#d5d0a6');p(7,7,1,1,'#f5efcc');
  p(31,17,3,2,'#e4d49b');p(32,16,1,4,'#f5e5bd');
 }else{
  p(0,0,40,28,'#92694d');p(1,1,38,26,'#e0b87d');p(3,3,34,22,'#4d525b');
  for(let y=5;y<22;y+=7)for(let x=5;x<34;x+=7){
   const shift=(Math.floor(y/7)%2)*3;
   p(x+shift,y,5,1,'#d7a963');p(x-1+shift,y+2,1,4,'#e8cb8d');
   p(x+5+shift,y+2,1,4,'#e8cb8d');p(x+shift,y+6,5,1,'#d7a963');
   p(x+shift+1,y+2,3,3,(x+y)%3?'#a87952':'#f4d799');
  }
  // Small queen bee embroidered in the central medallion.
  p(18,9,5,2,'#c1d5ce');p(17,12,7,5,'#f4cb73');
  p(19,12,2,5,'#2e3a46');p(18,17,5,1,'#f0ddae');
  p(18,10,1,2,'#eee3b6');p(22,10,1,2,'#eee3b6');
  p(5,23,30,1,'#f4dbab');
 }
 return c;
}
const textureMap=new Map(NEW.map(item=>[item.id,item.mount==='rug'?drawRug(item):drawLamp(item)]));
if(textureMap.size!==8||RUG_SLOTS.length!==8)throw Error('Phase 4 expansion must contain eight distinct pieces');
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:Object.freeze([...previous.items,...NEW]),
 slots:Object.freeze([...previous.slots,...RUG_SLOTS]),
 quotas:previous.quotas,
 texture:id=>textureMap.get(id)||previous.texture(id),
 thumbnail:id=>{
  const canvas=textureMap.get(id);
  return canvas?canvas.toDataURL('image/png'):previous.thumbnail(id);
 }
});
})();