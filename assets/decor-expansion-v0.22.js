/* Bit Bazaar v0.22 — individually authored shelf finishes and curios.
   Preserve all 28 earlier items and all 44 earlier physical anchors. */
(()=>{
'use strict';
const previous=window.BIT_BAZAAR_DECOR;
if(!previous||previous.items.length!==28||previous.slots.length!==44)
 throw Error('The 28-piece Sacrifice Catalog must load first');
const NEW=[
 {id:'astral-brass-filigree',name:'Astral Brass Filigree',category:'Shelf Trims',mount:'shelf',price:4,art:'astral',
  description:'A navy enamel shelf rail hammered with starbursts, tiny constellations and gilded observatory rivets.'},
 {id:'ivyward-oak-lattice',name:'Ivyward Oak Lattice',category:'Shelf Trims',mount:'shelf',price:2,art:'ivy',
  description:'Honeyed oak rails wrapped in carved ivy tendrils, knotwork leaves and little emerald studs.'},
 {id:'tidal-pearl-mosaic',name:'Tidal Pearl Mosaic',category:'Shelf Trims',mount:'shelf',price:3,art:'tidal',
  description:'Deep-blue ceramic fascia embellished with scalloped surf lines and gleaming mother-of-pearl inlay.'},
 {id:'crimson-arcade-marquee',name:'Crimson Arcade Marquee',category:'Shelf Trims',mount:'shelf',price:5,art:'arcade',
  description:'Burgundy lacquer edged in ticket-gold zigzags, with tiny diamonds resembling old arcade tokens.'},
 {id:'unfinished-clockwork-heart',name:'The Unfinished Clockwork Heart',category:'Curios',mount:'floor',price:3,art:'clockheart',
  description:'An openwork brass clock heart that holds a glowing ruby beneath a transparent bell glass.'},
 {id:'bottled-pocket-cosmos',name:'Pocket Cosmos in a Bottle',category:'Curios',mount:'floor',price:4,art:'cosmos',
  description:'A slender cobalt bottle contains a miniature nebula, gold-ringed planets and a star that never sets.'},
 {id:'paper-dragon-diorama',name:'The Paper Dragon Diorama',category:'Curios',mount:'floor',price:2,art:'paperdragon',
  description:'A folded scarlet paper dragon spirals above a tiny lacquered stage, with intricately creased wings.'},
 {id:'ember-key-typewriter',name:'Ember-Key Typewriter',category:'Curios',mount:'floor',price:5,art:'typewriter',
  description:'A miniature antique typewriter with copper keys, a violet ribbon and one still-glowing last letter.'}
];
const SHELF_SLOTS=[];
for(let face=0;face<60;face++){
 const fixture=face<40?Math.floor(face/2):20+face-40;
 const row=face<40?Math.floor(fixture/4):null;
 const aisle=face<40?"ABCD"[fixture%4]:'';
 const side=face<40?(face%2?'REVERSE':'FRONT'):'WALL';
 let name,x,z;
 if(face<40){
  name='AISLE '+aisle+' · UNIT '+(row+1)+' · '+side+' RAILS';
  x=11+fixture%4*16;
  z=11+row*12+(face%2?-1:1)*.89;
 }else{
  const wall=face-40;
  const section=wall<5?'NORTH':wall<10?'SOUTH':wall<15?'WEST':'EAST';
  const number=wall%5+1;
  name=section+' WALL · SECTION '+number+' RAILS';
  if(wall<5){x=[9,22,35,48,61][wall];z=2.5+.48;}
  else if(wall<10){x=[9,22,35,48,61][wall-5];z=71.5-.48;}
  else if(wall<15){x=2.5+.48;z=[10,23,36,49,62][wall-10];}
  else{x=67.5-.48;z=[10,23,36,49,62][wall-15];}
 }
 SHELF_SLOTS.push({id:44+face,kind:'shelf',face,side,x,z,name});
}
function pixelArt(item){
 const shelf=item.mount==='shelf';
 const c=document.createElement('canvas');
 c.width=shelf?48:32;c.height=shelf?28:40;
 const g=c.getContext('2d',{alpha:!shelf});g.imageSmoothingEnabled=false;
 const p=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(x,y,w,h)};
 if(shelf){
  const a=item.art;
  const back=a==='astral'?'#252946':a==='ivy'?'#6c503d':a==='tidal'?'#2e586c':'#713946';
  const metal=a==='astral'?'#deb66e':a==='ivy'?'#e5ba82':a==='tidal'?'#c5d9d2':'#e4b269';
  p(0,0,48,28,'#241e31');p(0,4,48,20,metal);p(2,6,44,16,back);
  p(1,3,46,2,'#eee0a9');p(1,23,46,2,'#947057');
  for(let x=4;x<46;x+=8){p(x,5,2,2,metal);p(x,21,2,2,metal);}
  if(a==='astral'){
   for(let i=0;i<8;i++){
    const x=7+i*5,y=10+i%3*3;
    p(x,y,1,7,'#f2d19a');p(x-2,y+3,5,1,'#f3e4ba');
    p(x-1,y+2,3,3,'#bd9c75');
   }
   for(let i=0;i<11;i++){const x=5+i*4,y=8+(i*7)%12;p(x,y,1,1,'#a5c8cc');}
   p(38,8,5,7,'#f1c56f');p(37,9,5,6,'#252946');
  }else if(a==='ivy'){
   for(let i=0;i<7;i++){
    const x=4+i*6,y=11+i%2*4;
    p(x,y,6,2,'#98bd87');p(x+2,y-3,2,4,'#c0d99a');
    p(x+4,y+2,2,4,'#4d896a');p(x+1,y+4,3,2,'#e2d09b');
   }
   p(3,15,42,1,'#4b7657');
   for(let i=0;i<8;i++)p(5+i*5,7,1,13,'#876348');
  }else if(a==='tidal'){
   for(let i=0;i<8;i++){
    const x=3+i*6,y=11+i%2*2;
    p(x,y,5,2,'#8ec3c7');p(x+1,y-3,3,3,'#417f91');
    p(x+2,y+3,2,3,'#cde9da');p(x+2,y+4,1,1,'#ffffff');
   }
   p(5,19,38,1,'#90b6bd');p(7,8,34,1,'#d4e9c8');
  }else{
   for(let i=0;i<9;i++){
    const x=3+i*5,y=8+i%2*5;
    p(x,y,4,2,'#f2c16e');p(x+1,y+2,3,2,'#bf8658');
    p(x+2,y+4,2,3,'#e8be84');
    if(i%2===0)p(x+1,17,4,3,'#ffd9a0');
   }
   p(5,9,38,1,'#a97b8b');p(5,20,38,1,'#d9aa61');
  }
 }else{
  const a=item.art;
  // Freestanding miniatures are transparent sprites, not square badges.
  p(6,36,20,3,'#524455');p(9,33,14,3,'#9c7963');
  if(a==='clockheart'){
   p(8,15,16,18,'#b49b81');p(10,12,12,22,'#d6bb9d');
   p(11,15,10,14,'#454c67');p(13,17,6,10,'#a97859');
   for(let t=0;t<10;t++){
    const x=16+Math.floor(Math.cos(t*.628)*7),y=21+Math.floor(Math.sin(t*.628)*8);
    p(x,y,2,2,t%2?'#ecbb7e':'#f5dc9c');
   }
   p(14,18,5,7,'#d35f74');p(15,20,3,4,'#f6ac91');
   p(15,13,2,3,'#e9d8a4');p(14,9,5,3,'#cec1b1');
   p(13,7,7,2,'#775a55');p(16,5,2,3,'#d1b18b');
   p(8,27,2,4,'#738aa2');p(22,27,2,4,'#738aa2');
  }else if(a==='cosmos'){
   p(14,5,5,4,'#bd996a');p(12,9,9,2,'#e8d0ae');
   p(11,11,11,21,'#79a4be');p(10,15,13,16,'#8eb8be');
   p(12,13,9,18,'#1d385e');p(13,15,7,14,'#34437e');
   for(let i=0;i<15;i++){
    const x=13+(i*5)%8,y=15+(i*7)%14;
    p(x,y,1,1,i%3?'#e9daab':'#9fc9e0');
   }
   p(16,20,5,5,'#e3be86');p(17,21,3,3,'#f7e9ba');
   p(13,26,6,1,'#b68ac4');p(15,17,5,1,'#82bec6');
   p(14,30,6,3,'#648aa0');p(13,33,8,2,'#d3ac7b');
  }else if(a==='paperdragon'){
   p(8,29,18,5,'#664853');p(10,27,14,3,'#d5a17c');
   p(14,9,7,3,'#f1a6a0');p(12,12,9,4,'#d76b78');
   p(17,14,7,5,'#e08b7e');p(20,19,6,3,'#a64962');
   p(18,22,8,3,'#d55f6e');p(12,23,8,4,'#9a415f');
   for(let i=0;i<7;i++){
    const x=5+i*3,y=12+(i%3)*3;
    p(x,y,4,2,i%2?'#d97776':'#f2a78a');
    p(x+2,y+2,3,3,'#ae596f');
   }
   p(10,8,4,4,'#e7be95');p(12,10,1,1,'#282838');
   p(12,26,2,5,'#ecb496');p(18,26,2,5,'#eab096');
   p(9,30,14,1,'#f1d2a8');
  }else{
   p(6,20,20,13,'#58516c');p(7,19,18,10,'#7d7890');
   p(8,17,16,4,'#b98a6a');p(9,12,14,6,'#584d64');
   p(10,10,11,4,'#bda9a1');p(11,7,9,4,'#f0e0c2');
   p(13,5,6,3,'#9ea4b6');p(13,12,6,2,'#5b5368');
   for(let i=0;i<9;i++){
    const x=8+i%5*3,y=24+Math.floor(i/5)*4;
    p(x,y,2,2,i%3?'#d5a67c':'#edc68c');
    p(x+1,y+1,1,1,'#f7e6b7');
   }
   p(16,22,3,3,'#da6b63');p(17,22,1,2,'#fff0a6');
   p(8,31,16,3,'#38364e');p(11,34,11,2,'#bc956e');
  }
 }
 return c;
}
const textures=new Map(NEW.map(item=>[item.id,pixelArt(item)]));
if(textures.size!==8||SHELF_SLOTS.length!==60)throw Error('v0.22 expansion incomplete');
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:Object.freeze([...previous.items,...NEW]),
 slots:Object.freeze([...previous.slots,...SHELF_SLOTS]),
 quotas:previous.quotas,
 texture:id=>textures.get(id)||previous.texture(id),
 thumbnail:id=>textures.has(id)?textures.get(id).toDataURL('image/png'):previous.thumbnail(id)
});
})();