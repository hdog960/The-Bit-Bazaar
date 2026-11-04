/* Bit Bazaar Phase 4 — 12 individually authored paintings, statues and plants.
   Framed 32x40 pixel artwork is authored on small canvases once, not each frame.
   Future release quota: 35 posters / 180 total decorations. */
(()=>{
'use strict';
const ITEMS=[
 {id:'midnight-moth',name:'The Midnight Moth',category:'Framed Art',price:2,art:'moth',
  description:'A luminous moth floats beneath a crescent moon, its wings stitched with tiny constellations.'},
 {id:'ember-drake',name:'The Ember Drake',category:'Framed Art',price:5,art:'drake',
  description:'An ancient red dragon coils around a volcanic citadel, guarding the last living flame.'},
 {id:'glasshouse-rain',name:'Rain on the Glasshouse',category:'Framed Art',price:3,art:'greenhouse',
  description:'Ferns, blue lanterns and golden flowers glow inside a rain-soaked botanical glasshouse.'},
 {id:'clockwork-koi',name:'Clockwork Koi',category:'Framed Art',mount:'wall',price:2,art:'koi',
  description:'Two enamel koi circle the heart of a winding brass clock.'},
 {id:'stargazers-atlas',name:"The Stargazer's Atlas",category:'Framed Art',mount:'wall',price:3,art:'atlas',
  description:'A navigator traces old constellations between a compass rose and a silver archipelago.'},
 {id:'lantern-tide',name:'Lantern Tide',category:'Framed Art',mount:'wall',price:4,art:'tide',
  description:'Deep-sea jellyfish carry glowing lanterns above a drowned city.'},
 {id:'copper-owl',name:'Copper Owl Sentinel',category:'Statues',mount:'floor',price:3,art:'owl',
  description:'An inlaid copper owl stands guard over an observatory plinth.'},
 {id:'argent-knight',name:'The Argent Knight',category:'Statues',mount:'floor',price:7,art:'knight',
  description:'A small silver champion with a sapphire shield and a weathered sword.'},
 {id:'fossil-spiral',name:'The Spiral Fossil',category:'Statues',mount:'floor',price:5,art:'fossil',
  description:'A carved ammonite unfurls from a cracked sandstone pedestal.'},
 {id:'cloudfern-terrarium',name:'Cloudfern Terrarium',category:'Plants',mount:'floor',price:1,art:'terrarium',
  description:'An airy greenhouse dome protects a delicate sky-blue cloudfern.'},
 {id:'ruby-cactus',name:'Ruby Crown Cactus',category:'Plants',mount:'floor',price:2,art:'cactus',
  description:'A proud desert cactus bearing one huge scarlet flower in a mosaic pot.'},
 {id:'mooncap-mushrooms',name:'Mooncap Mushrooms',category:'Plants',mount:'floor',price:3,art:'mushrooms',
  description:'Three bioluminescent forest mushrooms grow from a twisted earthen bowl.'}
];
const QUOTAS=[
 ['POSTERS / FRAMED ART',35],['STATUES / PEDESTALS',25],['PLANTS / TERRARIUMS',20],
 ['LAMPS / LIGHTING',20],['RUGS / FLOOR FINISHES',20],['WALL / ARCHITECTURE',20],
 ['CEILINGS / CHANDELIERS',15],['SHELF FINISHES / TRIMS',15],['CURIOS / ACCENTS',10]
];
const SLOTS=[];
for(const [side,positions] of [
 ['NORTH',[15.5,28.5,41.5,54.5]],['SOUTH',[15.5,28.5,41.5,54.5]],
 ['WEST',[16.5,29.5,42.5,55.5]],['EAST',[16.5,29.5,42.5,55.5]]
])for(let i=0;i<positions.length;i++){
 const p=positions[i],number=i+1;
 SLOTS.push({id:SLOTS.length,kind:'wall',name:side+' WALL · GALLERY '+number,
  side,x:side==='WEST'?1.10:side==='EAST'?68.90:p,
  z:side==='NORTH'?1.10:side==='SOUTH'?72.90:p});
}

/* These floor display pads are open aisle/corner spaces; no collision boxes are added.
   Stand freely inside each floor lane while the original shelving remains accessible. */
for(const [x,z,name] of [
 [7,6,'NORTHWEST · GARDEN'],[63,6,'NORTHEAST · GARDEN'],
 [7,67,'SOUTHWEST · GARDEN'],[63,67,'SOUTHEAST · GARDEN'],
 [19,17,'AISLE A-B · FRONT'],[35,17,'AISLE B-C · FRONT'],[51,17,'AISLE C-D · FRONT'],
 [19,41,'AISLE A-B · CENTER'],[35,41,'AISLE B-C · CENTER'],[51,41,'AISLE C-D · CENTER'],
 [19,65,'AISLE A-B · REAR'],[51,65,'AISLE C-D · REAR']
]){
 SLOTS.push({id:SLOTS.length,kind:'floor',name:name+' FLOOR DISPLAY',side:'FLOOR',x,z});
}

function paintStanding(item){
 const canvas=document.createElement('canvas');canvas.width=32;canvas.height=40;
 const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
 const r=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(x,y,w,h)};
 const art=item.art;
 // A hand-drawn unique silhouette on transparent ground, no flat icon badge.
 if(art==='owl'){
  // Observing plinth, two talons, splayed feather shoulders and round brass eyes.
  r(6,35,20,4,'#4e4052');r(8,33,16,2,'#af835c');r(10,30,12,3,'#6d5961');
  r(12,26,3,5,'#c99762');r(18,26,3,5,'#c99762');r(9,12,15,16,'#b87547');
  r(7,16,4,12,'#8e593f');r(22,16,4,12,'#8e593f');
  r(9,8,5,7,'#cb9a60');r(19,8,5,7,'#cb9a60');
  r(13,10,7,7,'#d6a677');r(10,14,13,6,'#d49a62');
  r(10,15,5,5,'#ffdda0');r(18,15,5,5,'#ffdda0');
  r(12,16,2,3,'#2a273c');r(20,16,2,3,'#2a273c');
  r(15,19,4,5,'#f4b65c');r(16,22,2,3,'#7f4638');
  for(let y=22;y<28;y+=2){r(12,y,3,1,'#edc88a');r(19,y,3,1,'#edc88a');}
  r(12,30,3,2,'#d9a35d');r(18,30,3,2,'#d9a35d');
 }else if(art==='knight'){
  // Narrow blade, asymmetric heraldic shield, visored helmet, plated boots.
  r(6,36,20,3,'#45455b');r(8,34,16,2,'#8b8694');
  r(13,30,3,5,'#9299a8');r(19,30,3,5,'#9299a8');
  r(12,12,11,17,'#9daec2');r(11,18,13,9,'#66768c');
  r(13,7,9,10,'#c6d2d7');r(16,4,3,5,'#e8cd81');
  r(12,8,11,3,'#536279');r(14,12,8,3,'#28394c');
  r(10,16,4,10,'#d3c3a5');r(23,16,4,10,'#d2b8a2');
  r(24,9,2,24,'#e8dbea');r(23,6,4,4,'#f3edda');r(21,23,8,2,'#8d6f4f');
  r(4,17,9,14,'#42658e');r(5,15,7,3,'#c3d4d2');r(6,20,5,7,'#7ab5c2');
  r(7,21,3,5,'#f3df96');r(9,27,2,3,'#cfbeab');
  r(15,26,5,4,'#d1c6ba');
 }else if(art==='fossil'){
  // Spiral fossil with carved cavity and segmented growth bands.
  r(6,36,20,3,'#70524c');r(8,33,16,3,'#ba9474');r(11,29,10,4,'#8f6c5d');
  for(let y=11;y<=28;y++){const span=Math.floor(Math.sqrt(Math.max(0,100-(y-20)*(y-20))));r(16-span,y,span*2,1,y%2?'#dbc49b':'#ae866d');}
  r(12,15,10,11,'#765f59');r(13,17,8,8,'#d1aa80');
  r(15,18,5,6,'#8f745f');r(16,19,3,3,'#e6d5af');
  r(17,19,2,2,'#5e5760');
  for(let i=0;i<13;i++){
   const theta=i*.44,x=Math.floor(16+Math.cos(theta)*9),y=Math.floor(20+Math.sin(theta)*8);
   r(x,y,2,2,'#f2dfb6');
  }
  r(10,28,2,3,'#b98e70');r(22,27,2,3,'#b98e70');
 }else if(art==='terrarium'){
  // Glazed glass dome, layered stems and long fern blades.
  r(5,35,22,3,'#5b5266');r(7,33,18,3,'#c1ad7d');r(8,29,16,4,'#6b655f');
  for(let y=7;y<=30;y++){
   const span=Math.floor(10*Math.sqrt(Math.max(0,1-Math.pow((y-19)/14,2))));
   if(span>0){r(16-span,y,2,1,'#acd8d6');r(15+span,y,2,1,'#84baba');}
  }
  r(15,5,3,3,'#f4deb7');r(14,8,5,1,'#bcdfe1');
  r(16,17,1,14,'#82bba1');r(12,20,1,11,'#76a78d');r(20,17,1,13,'#7ba9a1');
  for(let i=0;i<7;i++){
   const y=12+i*3,w=Math.max(2,7-i);
   r(15-w,y,w,2,i%2?'#609a88':'#a7cec1');
   r(17,y+1,w,2,i%2?'#80b9ae':'#b4d7c9');
  }
  r(10,29,12,2,'#496b61');r(10,10,1,8,'#e7f4e5');
 }else if(art==='cactus'){
  // Branched cactus with white spine details and a large ruby flower.
  r(8,34,16,4,'#8c5b61');r(9,31,14,5,'#b86b61');
  for(let i=0;i<4;i++)r(11+i*3,32,1,4,'#f3ae83');
  r(12,13,9,19,'#5e9671');r(15,10,3,22,'#80b98c');
  r(9,19,4,4,'#5e9671');r(8,16,3,8,'#72ae81');
  r(20,23,4,4,'#5e9671');r(23,18,3,10,'#78b98b');
  for(let i=0;i<8;i++){r(13+(i%3)*3,14+Math.floor(i/3)*5,1,2,'#d4e5a1');}
  r(10,7,14,4,'#d65a69');r(13,4,8,10,'#ec7580');
  r(15,7,4,5,'#f5cd76');r(16,8,2,2,'#fff2b7');
  r(6,28,3,1,'#e7d49b');r(25,25,2,1,'#e7d49b');
 }else if(art==='mushrooms'){
  // Mooncaps form a staggered cluster with split luminous fringes.
  r(5,34,22,4,'#685466');r(7,31,18,4,'#a58072');r(10,28,12,4,'#6d8171');
  r(10,17,3,15,'#e4dfc6');r(18,11,4,21,'#dddbcd');r(24,22,3,10,'#e5d6c0');
  r(4,15,15,5,'#7aaee0');r(6,10,11,7,'#a5c4e8');r(10,8,4,3,'#e7eaff');
  r(14,10,15,5,'#8b8cde');r(16,5,12,7,'#b6a7eb');r(21,3,4,3,'#ebdbff');
  r(21,21,10,4,'#70a4c5');r(22,18,8,5,'#a8d1d6');
  for(const [x,y] of [[10,14],[16,12],[20,8],[26,11],[24,21],[7,16]]){
   r(x,y,2,2,'#f4f0e2');
  }
  r(11,20,1,5,'#c5e7de');r(19,17,1,6,'#e2c9ee');r(25,26,1,4,'#c9eee5');
 }
 return canvas;
}
function paint(item){
 if(item.mount==='floor')return paintStanding(item);

 const canvas=document.createElement('canvas');canvas.width=32;canvas.height=40;
 const g=canvas.getContext('2d',{alpha:false});g.imageSmoothingEnabled=false;
 const rect=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(x,y,w,h)};
 rect(0,0,32,40,'#211824');rect(1,1,30,38,'#a77242');
 rect(2,2,28,36,'#f1c680');rect(3,3,26,34,'#61404b');
 rect(4,4,24,32,item.art==='moth'?'#171a37':item.art==='drake'?'#442c39':'#234c4e');
 // Hand-mitered copper frame with individual corner rivets.
 for(const x of [2,29])for(const y of [2,37])rect(x,y,1,1,'#fff0a4');
 if(item.art==='moth'){
  for(let i=0;i<22;i++){
   const x=5+(i*13)%22,y=5+(i*17)%27;
   if(Math.abs(x-16)>5||y<12)rect(x,y,1,1,i%3?'#9e8dc1':'#f6dca6');
  }
  rect(22,7,5,5,'#e8e3bd');rect(21,9,5,5,'#d0c7a5');rect(22,7,3,3,'#171a37');
  rect(15,13,2,15,'#f2ca8c');rect(15,12,1,2,'#f6e7ba');
  for(let d=1;d<=10;d++){
   const y=15+Math.floor(d*.98),wing=Math.max(1,Math.floor((12-d)*.72));
   rect(15-wing,y,wing,1,d%2?'#a6c1bd':'#e9cea2');
   rect(17,y,wing,1,d%2?'#a6c1bd':'#e9cea2');
  }
  rect(7,18,6,3,'#728bc1');rect(19,18,6,3,'#728bc1');
  rect(8,24,5,2,'#bc9fcb');rect(19,24,5,2,'#bc9fcb');
  rect(10,16,1,1,'#f7e5af');rect(21,16,1,1,'#f7e5af');
  rect(12,29,8,1,'#6a5475');
 }else if(item.art==='drake'){
  for(let y=22;y<35;y++)rect(5,y,22,1,y%3?'#75525b':'#a85e52');
  for(let i=0;i<7;i++)rect(6+i*3,29-i%3*2,2,5,'#c87b4b');
  // Mountain citadel and its hot windows.
  rect(11,20,10,10,'#342536');rect(13,16,6,5,'#342536');
  rect(14,22,2,2,'#ffd781');rect(19,22,1,2,'#ffd781');
  rect(16,13,2,7,'#ffcb67');rect(16,9,2,5,'#ffe79c');
  // One original drake: hooked head, long spine, gold scales and split wings.
  rect(8,14,4,3,'#ce6d54');rect(10,12,5,4,'#e59864');
  rect(14,16,7,3,'#cd6f52');rect(18,19,5,3,'#b7554b');
  rect(21,21,4,3,'#a74b46');rect(23,23,3,3,'#7b3b45');
  for(let i=0;i<8;i++)rect(12+i*2,14+Math.floor(i/3),2,1,i%2?'#f8c774':'#cf8260');
  // Two angular wings with individually stepped ribs.
  for(let i=0;i<8;i++){
   rect(13-i,14+i,1,4,'#ac5053');rect(19+i,14+i,1,4,'#b95d53');
  }
  rect(10,12,2,1,'#f4c181');rect(9,14,1,1,'#fff1ae');
  rect(11,17,2,1,'#7d3548');
 }else if(item.art==='koi'){
  // Opposing golden koi follow a copper gear, their tails splitting in motion.
  rect(5,17,22,2,'#c6a778');rect(15,7,2,27,'#aa8065');
  for(let i=0;i<12;i++){
   const t=i*Math.PI/6,x=Math.floor(16+9*Math.cos(t)),y=Math.floor(20+10*Math.sin(t));
   rect(x,y,3,2,i%2?'#d4a966':'#8eaaae');
  }
  rect(11,12,7,3,'#f4d39a');rect(18,15,5,3,'#eaa776');
  rect(8,9,5,4,'#d1dce1');rect(9,12,6,5,'#f4e9d5');
  rect(12,16,6,2,'#8caab2');rect(13,19,5,2,'#e7b26b');
  rect(19,24,6,4,'#e7b26b');rect(14,27,6,5,'#f5deb5');
  rect(10,24,5,2,'#96b9bd');rect(10,20,3,5,'#f3d291');
  rect(8,10,1,1,'#223848');rect(23,26,1,1,'#223848');
  for(let i=0;i<7;i++){rect(5+i*3,33,1,2,'#91acc0');}
 }else if(item.art==='atlas'){
  // Chart parchment, winding coastline, compass and connected stars.
  rect(5,5,22,30,'#414760');rect(7,7,18,26,'#323d59');
  for(let i=0;i<10;i++){
   const x=8+(i*7)%16,y=8+(i*9)%23;
   rect(x,y,1,1,'#f8e5b1');
   if(i<7)rect(x+1,y,2,1,'#7f9ab7');
  }
  rect(14,10,1,16,'#d5b77c');rect(9,18,14,1,'#d5b77c');
  rect(12,16,5,5,'#dbc087');rect(14,13,1,11,'#f1d79d');
  rect(9,18,12,1,'#f1d79d');
  for(let i=0;i<8;i++){const x=10+i*2,y=26+(i%3);rect(x,y,2,2,'#5ba9a0');}
  rect(15,15,2,4,'#e6edf0');rect(14,17,5,1,'#e6edf0');
  rect(20,10,3,1,'#e6c68d');rect(21,9,1,4,'#e6c68d');
 }else if(item.art==='tide'){
  // Drowned clocktower, luminous bells and three floating deep sea lamps.
  rect(5,5,22,30,'#1b3a54');
  for(let y=7;y<33;y+=4)rect(6,y,20,1,'#365970');
  rect(12,23,8,12,'#24354b');rect(15,17,3,9,'#415265');
  rect(14,16,5,3,'#72919c');rect(15,25,2,3,'#a5c7bd');
  for(const [x,y] of [[8,13],[18,8],[23,18]]){
   rect(x-2,y,7,2,'#a6d8d3');rect(x-1,y-2,5,3,'#d4e7cb');
   rect(x,y-4,3,2,'#e8e9b4');rect(x,y+2,1,5,'#6db6bc');
   rect(x+3,y+2,1,4,'#91cad0');
  }
  rect(8,32,4,2,'#5c9f9a');rect(22,32,4,2,'#5c9f9a');
 }else{
  // Rain-soaked arched panes, copper mullions and turquoise lamps.
  rect(6,8,20,26,'#82a6a1');rect(8,10,16,22,'#314f63');
  rect(15,7,2,28,'#c5aa78');rect(7,18,18,2,'#c5aa78');
  rect(8,11,1,7,'#aed4c1');rect(22,11,1,7,'#aed4c1');
  for(let i=0;i<11;i++){
   const x=9+(i*7)%14,y=9+(i*11)%14;
   rect(x,y,1,3,i%3?'#93bec2':'#d8e4cb');
  }
  for(let i=0;i<8;i++){
   const x=6+(i*5)%22,y=24+(i*3)%10;
   rect(x,y,2,5,i%2?'#4b956f':'#76aa6f');
   rect(x-1,y+1,4,2,'#638f58');
  }
  rect(12,23,2,3,'#f3c06a');rect(13,22,1,2,'#ffe5a0');
  rect(20,26,2,3,'#f3bc69');rect(19,25,4,1,'#efdfa9');
  rect(9,30,14,2,'#806053');
 }
 // Artwork is permanently framed and pixel-perfect.
 for(let x=4;x<28;x+=4){rect(x,4,1,1,'#a97d58');rect(x,35,1,1,'#a97d58');}
 return canvas;
}
const textures=new Map(ITEMS.map(item=>[item.id,paint(item)]));
if(textures.size!==12||SLOTS.length!==28)throw Error('Phase 4 gallery catalog shape mismatch');
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:Object.freeze(ITEMS),slots:Object.freeze(SLOTS),quotas:Object.freeze(QUOTAS),
 texture:id=>textures.get(id)||null,thumbnail:id=>{
  const canvas=textures.get(id);return canvas?canvas.toDataURL('image/png'):'';
 }
});
})();
