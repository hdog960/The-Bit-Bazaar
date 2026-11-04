/* Bit Bazaar Phase 4 v0.21 — original architecture and hanging ceiling works.
   Adds 8 individually drawn designs; preserves all 20 existing catalog IDs
   and 36 original wall/floor/rug locations. No sprites are drawn at runtime. */
(()=>{
'use strict';
const previous=window.BIT_BAZAAR_DECOR;
if(!previous||previous.items.length!==20||previous.slots.length!==36)
 throw Error('v0.21 architecture requires the 20-piece Sacrifice Catalog');
const NEW=[
 {id:'moonstone-rose-window',name:'Moonstone Rose Window',category:'Architecture',mount:'wall',price:4,art:'rose',
  description:'An intricately leaded circular window pours moonlit blue and lavender rays through a limestone nave.'},
 {id:'whispering-library-arch',name:'Whispering Library Arch',category:'Architecture',mount:'wall',price:6,art:'library',
  description:'A carved arch opens onto a secret library, with crooked book spines and a little brass reading lamp.'},
 {id:'coral-tide-viewport',name:'Coral Tide Viewport',category:'Architecture',mount:'wall',price:3,art:'viewport',
  description:'An old diving-station porthole reveals swaying coral, a curious fish and the blue ocean beyond.'},
 {id:'sunclock-stone-alcove',name:'Sunclock Stone Alcove',category:'Architecture',mount:'wall',price:5,art:'sunclock',
  description:'Warm sandstone pillars enclose a delicate sun dial and a flowering climbing vine.'},
 {id:'brass-celestial-orrery',name:'Brass Celestial Orrery',category:'Ceilings',mount:'ceiling',price:5,art:'orrery',
  description:'Three gilded orbital rings suspend a miniature sun and moving-looking planets from a copper canopy.'},
 {id:'prism-rain-chandelier',name:'Prism Rain Chandelier',category:'Ceilings',mount:'ceiling',price:7,art:'prism',
  description:'A long tiered chandelier of violet, ice-blue and peach crystal drops catches the shop lights.'},
 {id:'mothsilk-lantern-cloud',name:'Mothsilk Lantern Cloud',category:'Ceilings',mount:'ceiling',price:3,art:'lanterns',
  description:'A cluster of five delicate paper lanterns hangs on dark cords, glowing honey-gold and mint.'},
 {id:'windsong-feather-mobile',name:'Windsong Feather Mobile',category:'Ceilings',mount:'ceiling',price:2,art:'mobile',
  description:'A balanced driftwood mobile carries painted feathers, sea glass and tiny silver chimes.'}
];
const CEILING_SITES=[
 [19,7,'FRONT · AISLE A-B'],[35,7,'FRONT · CENTRAL'],[51,7,'FRONT · AISLE C-D'],
 [19,29,'MIDDLE · AISLE A-B'],[35,29,'MIDDLE · CENTRAL'],[51,29,'MIDDLE · AISLE C-D'],
 [19,53,'REAR · AISLE A-B'],[51,49,'REAR · AISLE C-D']
].map(([x,z,name],i)=>({id:36+i,kind:'ceiling',side:'CEILING',name:name+' CEILING HOOK',x,z}));
function artCanvas(item){
 const canvas=document.createElement('canvas');canvas.width=40;canvas.height=48;
 const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
 const R=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(x,y,w,h)};
 const a=item.art;
 if(item.mount==='wall'){
  // Full architectural wall insert, unlike the earlier small gold picture frames.
  R(0,0,40,48,'#292238');
  R(1,1,38,46,'#6f6173');R(3,3,34,42,'#b2a18e');
  R(5,5,30,38,'#52485e');
  for(let y=6;y<43;y+=7){R(5,y,30,1,'#7f7280');R(8+(y%3)*2,y+1,1,6,'#8d7a83');}
  if(a==='rose'){
   R(9,7,22,30,'#294361');
   for(let y=9;y<37;y++){
    const radius=Math.floor(13*Math.sqrt(Math.max(0,1-((y-22)/15)**2)));
    if(radius>0){
     R(20-radius,y,2,1,'#d8d0b8');R(18+radius,y,2,1,'#d8d0b8');
     R(20-radius+2,y,2*radius-3,1,y%2?'#3a6890':'#7b7ab1');
    }
   }
   for(let k=0;k<12;k++){
    const t=k*Math.PI/6,x=20+Math.round(8*Math.cos(t)),y=22+Math.round(9*Math.sin(t));
    R(x-1,y-1,3,3,k%3===0?'#e9b8c4':k%3===1?'#8cc6d2':'#d0c6e5');
   }
   R(18,18,4,8,'#dec6df');R(15,21,10,2,'#d7e6df');
   R(18,21,4,3,'#fff0dc');R(9,39,22,2,'#b6a7a0');
  }else if(a==='library'){
   R(10,6,20,35,'#2d3344');
   for(let y=14;y<=36;y+=10){R(9,y,22,2,'#b08763');R(10,y+2,20,1,'#634f53');}
   for(let i=0;i<28;i++){
    const x=11+(i*7)%18,y=7+Math.floor(i/9)*10;
    R(x,y,1+(i%3),5+(i%4),['#a66c6b','#718fa4','#d8b17d','#9a8cbe'][i%4]);
    if(i%3===0)R(x,y+3,2,1,'#f0dcad');
   }
   R(18,29,3,10,'#be9b6b');R(15,31,9,2,'#d0b58a');
   R(17,26,5,5,'#f1d19b');R(18,25,3,2,'#fff1bf');
   for(let i=0;i<8;i++){R(8+i*3,40,2,2,'#6c5d68');}
  }else if(a==='viewport'){
   R(9,8,22,31,'#b58d65');R(11,10,18,27,'#356a81');
   for(let y=13;y<36;y+=5)R(13,y,14,1,'#548fa3');
   for(let i=0;i<10;i++){
    const x=13+(i*11)%14,y=14+(i*7)%20;
    R(x,y,1,2,'#9fd1cf');
   }
   R(12,30,7,5,'#a66b80');R(14,27,2,6,'#d08e9c');
   R(22,26,4,10,'#4d9c8b');R(25,23,2,9,'#80c4ad');
   R(16,19,8,4,'#efcf9b');R(21,20,3,2,'#e9b06f');
   R(18,20,1,1,'#263c48');R(12,12,1,3,'#bed6cb');
   for(const [x,y] of [[10,9],[29,9],[10,37],[29,37]])R(x,y,2,2,'#ead3a2');
   R(13,40,14,2,'#a68b76');
  }else{
   R(9,8,22,33,'#d7b47e');R(12,10,16,28,'#b58164');
   for(let y=13;y<37;y+=8){R(12,y,16,1,'#8b7564');}
   R(14,11,12,25,'#efca90');
   R(17,16,6,18,'#e1ac74');R(16,20,9,9,'#986b61');
   R(18,22,5,5,'#e9d38d');R(20,19,1,11,'#f7e6bc');
   R(16,25,9,1,'#f7e6bc');R(21,23,2,2,'#705565');
   for(let i=0;i<7;i++){
    const x=11+(i%3)*7,y=9+Math.floor(i/3)*11;
    R(x,y,2,5,i%2?'#668e6d':'#87ad7e');
    R(x-1,y+2,4,2,'#b3c28c');
   }
   R(6,41,28,2,'#d2af8a');
  }
  R(4,44,32,2,'#40334b');R(6,45,28,1,'#a88f75');
 }else if(a==='orrery'){
  // Hung celestial rings, visually distinct from the v0.20 floor Orrery Lamp.
  R(18,0,4,4,'#6d6275');R(19,4,2,8,'#bf9b68');
  R(8,8,24,2,'#a47954');R(6,12,28,2,'#e1be7a');R(8,15,24,1,'#c49560');
  for(let y=12;y<37;y++){
   const r=Math.floor(11*Math.sqrt(Math.max(0,1-((y-24)/13)**2)));
   if(r>1){R(20-r,y,2,1,'#e1bc80');R(19+r,y,2,1,'#e1bc80');}
  }
  for(let y=17;y<32;y++){
   const r=Math.floor(7*Math.sqrt(Math.max(0,1-((y-24)/8)**2)));
   if(r>1){R(20-r,y,1,1,'#7599b2');R(20+r,y,1,1,'#7599b2');}
  }
  R(16,21,8,7,'#e9bb67');R(18,22,4,5,'#fff0b3');
  R(7,24,5,5,'#9ec4c8');R(29,17,5,5,'#d6939a');
  R(12,35,15,2,'#af825a');R(18,37,4,4,'#c8a875');
  R(19,41,2,5,'#bdab87');
 }else if(a==='prism'){
  R(17,0,6,3,'#786478');R(19,3,2,9,'#b88d66');
  R(6,11,28,3,'#d1ac82');R(9,14,22,2,'#6b5d7e');
  for(let i=0;i<11;i++){
   const x=6+i*3,y=16+(i%3)*2,len=13+((i*7)%7);
   R(x,y,1,len,'#a9cad2');
   R(x-1,y+len-1,3,4,['#ac9acb','#9ccfe0','#e4b6bd'][i%3]);
   R(x,y+len,1,3,'#faf0d6');
  }
  R(13,15,14,2,'#f0d5aa');R(17,17,7,5,'#e9c3c0');
  R(19,22,3,16,'#c0a5d3');R(18,38,5,4,'#e2cfed');
  R(20,42,1,4,'#f3e8ed');
 }else if(a==='lanterns'){
  R(18,0,4,4,'#7d6471');R(19,4,2,5,'#c3a785');
  for(const [x,y,w,h,color] of [
   [5,15,9,15,'#e1a978'],[16,10,10,17,'#e1c18a'],
   [28,17,9,14,'#8fb6a0'],[11,30,8,12,'#a69ebc'],[23,31,8,11,'#e9a98c']
  ]){
   R(x+Math.floor(w/2),6,1,y-6,'#99818a');
   R(x+1,y+1,w-2,h-3,color);
   R(x+2,y+3,w-4,h-7,'#f9e6bb');
   R(x+2,y+5,1,h-10,'#dec9ac');R(x+w-3,y+5,1,h-10,'#dec9ac');
   R(x,y+Math.floor(h/2),w,1,color);R(x+2,y,Math.max(1,w-4),2,'#c69b7f');
   R(x+Math.floor(w/2),y+h-2,1,4,'#c9b7a0');
  }
 }else{
  R(18,0,4,3,'#776c76');R(19,3,2,10,'#b8a58f');
  R(4,13,32,2,'#8a725f');R(9,9,22,1,'#c6b39b');
  R(19,10,2,8,'#aa897e');
  for(let i=0;i<6;i++){
   const x=5+i*6,y=14+(i%3)*4;
   R(x,y,1,9+(i%2)*5,'#c5b09b');
   R(x-1,y+10,4,2,'#8cb4b0');
   R(x-2,y+12,6,4,['#9fc3ca','#d0ad8f','#b9b6d5'][i%3]);
   R(x-1,y+17,3,5,'#ebe0c6');
   R(x,y+22,1,3,'#e8e8d6');
  }
  R(19,20,2,22,'#d7b8a2');
  R(15,39,10,2,'#9f8d82');R(17,42,6,3,'#dde0d7');
  R(20,45,1,3,'#fff0d0');
 }
 return canvas;
}
const textures=new Map(NEW.map(item=>[item.id,artCanvas(item)]));
if(textures.size!==8||CEILING_SITES.length!==8)throw Error('v0.21 eight original objects missing');
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:Object.freeze([...previous.items,...NEW]),
 slots:Object.freeze([...previous.slots,...CEILING_SITES]),
 quotas:previous.quotas,
 texture:id=>textures.get(id)||previous.texture(id),
 thumbnail:id=>{
  const c=textures.get(id);
  return c?c.toDataURL('image/png'):previous.thumbnail(id);
 }
});
})();