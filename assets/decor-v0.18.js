/* Bit Bazaar Phase 4 — first three individually drawn gallery pieces.
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
  description:'Ferns, blue lanterns and golden flowers glow inside a rain-soaked botanical glasshouse.'}
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
 SLOTS.push({id:SLOTS.length,name:side+' WALL · GALLERY '+number,
  side,x:side==='WEST'?1.10:side==='EAST'?68.90:p,
  z:side==='NORTH'?1.10:side==='SOUTH'?72.90:p});
}
function paint(item){
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
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:Object.freeze(ITEMS),slots:Object.freeze(SLOTS),quotas:Object.freeze(QUOTAS),
 texture:id=>textures.get(id)||null,thumbnail:id=>{
  const canvas=textures.get(id);return canvas?canvas.toDataURL('image/png'):'';
 }
});
})();
