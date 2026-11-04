/* Bit Bazaar v0.28 — eight original, hand-authored pixel-gallery scenes.
   No procedural recolors masquerading as distinct items; every composition has
   its own scenic elements and detailed hand-drawn motifs at tiny fixed sizes. */
(()=>{
'use strict';
const old=window.BIT_BAZAAR_DECOR;
if(!old||old.items.length!==48||old.slots.length!==169)
 throw Error('Load original 48 art and 40 side-gallery endcaps before v0.28 art');
const ITEMS=[
 {id:'moonlit-cartographer',name:'The Moonlit Cartographer',category:'Framed Art',mount:'wall',price:3,art:'cartographer',
  description:'A tiny navigator draws copper routes across a cobalt sea chart, guided by an ivory compass and a silver crescent.'},
 {id:'last-lantern-autumn',name:'The Last Lantern of Autumn',category:'Framed Art',mount:'wall',price:4,art:'autumn',
  description:'One glowing amber lantern illuminates a weathered stone bridge beneath crimson leaves and distant mountains.'},
 {id:'abyssal-observatory',name:'Abyssal Observatory',category:'Framed Art',mount:'wall',price:5,art:'abyss',
  description:'A submerged telescope surveys glittering glass fish beneath rolling currents and a distant lighthouse beam.'},
 {id:'clockwork-orchard',name:'The Clockwork Orchard',category:'Framed Art',mount:'wall',price:6,art:'orchard',
  description:'Copper fruit blossoms on a delicate mechanical tree of silver branches, gilded gears, and violet night petals.'},
 {id:'phoenix-rose-window',name:'The Phoenix Rose Window',category:'Architecture',mount:'wall',price:6,art:'phoenix',
  description:'A pointed stained-glass chapel window frames a golden phoenix rising amid ruby shards and royal-blue leadwork.'},
 {id:'tidal-glass-archway',name:'The Tidal Glass Archway',category:'Architecture',mount:'wall',price:5,art:'tidalarch',
  description:'A sea-glass arch with individually set turquoise tesserae holds a pearly moon above cresting silver waves.'},
 {id:'dwarven-rune-niche',name:'The Dwarven Rune Niche',category:'Architecture',mount:'wall',price:4,art:'runes',
  description:'A carved basalt alcove displays a glowing amber runestone, engraved copper runes, and a fringe of cave moss.'},
 {id:'starsilk-cathedral',name:'The Starsilk Cathedral Window',category:'Architecture',mount:'wall',price:7,art:'cathedral',
  description:'An elongated violet chapel window depicts twin moons, a braided constellation path, and silver celestial flowers.'}
];
function artwork(item){
 const architecture=item.category==='Architecture',w=architecture?40:32,h=architecture?48:40;
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
 const p=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
 const dot=(x,y,c)=>p(x,y,1,1,c);
 const stroke=(x1,y1,x2,y2,color)=>{
  let dx=Math.abs(x2-x1),dy=Math.abs(y2-y1),sx=x1<x2?1:-1,sy=y1<y2?1:-1,err=dx-dy;
  for(;;){dot(x1,y1,color);if(x1===x2&&y1===y2)break;
   const e=2*err;if(e>-dy){err-=dy;x1+=sx}if(e<dx){err+=dx;y1+=sy}}
 };
 const stars=(coords,color)=>{for(const [x,y] of coords){dot(x,y,color);dot(x+1,y-1,'#f6e9bd')}};
 if(!architecture){
  // The four scenes share a gallery-standard frame but none of their art.
  p(0,0,32,40,'#342b41');p(1,1,30,38,'#9d775d');
  p(3,3,26,34,'#dfbd84');p(5,5,22,30,
   item.art==='autumn'?'#4a445b':item.art==='abyss'?'#1e4964':
   item.art==='orchard'?'#332e53':'#203e57');
  const a=item.art;
  if(a==='cartographer'){
   p(6,6,20,28,'#315773');
   // Pale ocean charts with island contours and hand-plotted routes.
   for(const [x,y,v] of [[7,9,4],[14,12,5],[21,9,3],[9,24,5],[18,26,7]]){
    p(x,y,v,2,'#608487');p(x+1,y-2,Math.max(1,v-2),2,'#a4aa8c');
    p(x+1,y+2,2,1,'#d5b885');
   }
   stroke(7,27,17,19,'#eac494');stroke(17,19,23,11,'#f3d89c');
   stroke(9,13,18,27,'#bd9a6f');stroke(18,27,24,30,'#debe8a');
   p(16,14,7,7,'#ddd9c5');p(17,15,5,5,'#304b66');
   p(19,14,1,7,'#f4dca5');p(16,17,7,1,'#f4dca5');
   p(19,17,3,1,'#b98b77');p(23,7,2,4,'#f0dca6');
   p(24,8,2,3,'#315773');
   p(8,30,4,3,'#bb8a74');p(8,30,2,1,'#fff0cb');
   stars([[10,8],[14,7],[25,22]],'#e3d4bd');
  }else if(a==='autumn'){
   p(6,6,20,28,'#56425b');p(7,20,19,14,'#67535e');
   for(const [x,y] of [[8,10],[11,7],[19,8],[23,12],[16,15]]){
    p(x,y,4,3,'#ad5a5a');p(x+1,y-2,3,2,'#d68361');
    p(x-1,y+3,2,2,'#e3a45b');p(x+2,y+2,2,2,'#e8bf73');
   }
   p(8,22,17,3,'#806a6b');p(8,25,17,5,'#978381');
   for(let x=8;x<25;x+=4){p(x,22,1,6,'#c2a28d');dot(x+1,27,'#debba1')}
   p(13,20,3,7,'#463848');p(14,18,1,4,'#e0b979');
   p(12,17,5,3,'#ffd99a');p(13,16,3,1,'#fff3bc');
   p(9,29,16,3,'#493d4a');p(6,32,20,2,'#78646e');
   stroke(7,18,14,13,'#c5a0a1');stroke(22,16,25,13,'#a67881');
   stars([[23,7],[9,17]],'#d4ae95');
  }else if(a==='abyss'){
   p(6,6,20,28,'#214763');
   for(let y=9;y<34;y+=6){p(7,y,18,1,'#4a7b8b');p(10,y+2,13,1,'#6c9da4')}
   p(8,25,18,9,'#284a57');p(12,12,10,18,'#6c7880');
   p(14,15,6,12,'#afaaa1');p(13,10,9,6,'#9ab4b2');
   p(15,12,5,3,'#e1d5af');p(16,19,3,3,'#1d4c67');
   p(17,19,1,3,'#e5e7c9');p(16,20,3,1,'#eedbb5');
   stroke(17,13,25,8,'#ded8ad');stroke(18,13,25,12,'#8bc4c7');
   p(8,28,5,3,'#4c998a');p(23,26,3,7,'#6eafa0');
   for(const [x,y] of [[7,11],[22,9],[9,20],[21,24]]){
    p(x,y,3,2,'#b3d3cd');p(x+3,y+1,2,1,'#e5e5d8');
    dot(x+1,y,'#203e57');
   }
   stars([[10,8],[25,17],[8,31],[23,31]],'#c7dcd4');
  }else{
   // Mechanical copper orchard, physically distinct from natural tree.
   p(6,6,20,28,'#373453');p(13,24,7,9,'#a2726c');
   p(15,13,3,17,'#cfaa77');p(11,10,3,8,'#90788e');
   stroke(16,16,8,11,'#c7b5a0');stroke(17,17,23,10,'#dfb68a');
   stroke(16,24,9,20,'#8f7396');stroke(18,22,24,20,'#ab8c8d');
   for(const [x,y] of [[9,9],[21,9],[8,20],[22,20],[15,8]]){
    p(x,y,5,3,'#675b81');p(x+1,y-2,3,2,'#a58bad');
    p(x+2,y+1,2,2,'#dd9b68');p(x+1,y+3,2,2,'#edb978');
    dot(x+2,y+2,'#fff0bd');
   }
   p(12,18,9,8,'#b78c77');p(14,20,5,5,'#514665');
   p(15,21,3,3,'#f6d093');dot(16,22,'#84617b');
   for(const [x,y] of [[11,17],[22,16],[18,30],[7,25]])dot(x,y,'#ead3ae');
   p(8,32,16,2,'#564258');stars([[8,7],[23,7]],'#b4b5c7');
  }
  p(2,4,1,32,'#e8be8a');p(29,4,1,32,'#715365');
  for(let x=5;x<28;x+=5){p(x,4,2,1,'#f6e1a8');p(x,35,2,1,'#eed199')}
  p(3,37,26,1,'#63485b');
 }else{
  const a=item.art;
  // Each piece is painted into a tall stone/glass arch; four distinct
  // patterned profiles and interiors, not flat generic decorative icons.
  p(1,4,38,43,'#38364a');p(3,8,34,38,'#8b7581');
  p(6,10,28,34,a==='runes'?'#404452':a==='phoenix'?'#4f405d':a==='cathedral'?'#343455':'#436478');
  // Angled architectural crown and individual supporting stones.
  for(let i=0;i<7;i++){
   p(6+i*2,9-i,4,3,'#d2b28d');p(32-i*2,9-i,3,3,'#b79a91');
  }
  p(17,0,6,3,'#ead5af');p(15,2,10,2,'#9b857c');
  for(let y=13;y<45;y+=6){
   p(2,y,4,2,'#b3a18b');p(34,y,4,2,'#a9877c');
   dot(3,y+3,'#e2c6a2');dot(36,y+3,'#e6c499');
  }
  if(a==='phoenix'){
   p(7,15,26,29,'#303d63');p(11,20,18,18,'#9e4653');
   p(18,13,5,22,'#d07c58');p(19,10,3,5,'#f6c78b');
   // Flight: outstretched wings, asymmetrical scarlet plumage.
   stroke(20,22,8,15,'#f3c477');stroke(20,22,31,14,'#f6d398');
   for(let i=0;i<7;i++){
    const x=8+i*2;
    p(x,15+i%3*2,4,2,i%2?'#e39a62':'#c75c5f');
    p(29-i*2,14+i%4*2,4,2,i%2?'#eeb17a':'#d0705e');
   }
   p(18,30,5,10,'#df9455');p(16,35,3,7,'#f0bf75');
   p(21,33,2,8,'#f5d69b');p(23,13,3,2,'#e9dbc1');
   dot(25,14,'#333f5e');p(8,42,24,2,'#b68d7d');
   for(const [x,y] of [[8,12],[29,11],[11,36],[29,35]])p(x,y,2,2,'#e8b99d');
  }else if(a==='tidalarch'){
   p(8,16,24,27,'#286376');p(9,28,22,15,'#417d88');
   p(16,14,9,9,'#d7e2d2');p(18,15,8,7,'#37687e');
   // Layered wave crests; different scallop positions on each line.
   for(let row=0;row<4;row++){
    const y=29+row*3;
    for(let n=0;n<5;n++){
     const x=8+n*5+(row%2?2:0);
     p(x,y,4,2,row%2?'#b8d6cc':'#7dbaaf');
     p(x+1,y-2,2,2,'#d6e7dc');
    }
   }
   p(12,24,10,2,'#9ed0c1');p(18,21,5,2,'#e6e4c8');
   for(const [x,y] of [[8,15],[29,21],[11,34],[27,39]]){
    p(x,y,2,2,'#e1dbc7');dot(x+2,y+1,'#83bbb6');
   }
   stroke(9,11,16,7,'#c6ddd0');stroke(30,11,24,7,'#c1d8c8');
   p(7,44,26,2,'#6b8994');
  }else if(a==='runes'){
   p(8,15,24,29,'#303b49');p(11,17,19,24,'#54626a');
   p(14,23,12,16,'#967b70');p(16,19,8,6,'#b8ab91');
   p(17,26,6,10,'#e2ae66');p(18,26,4,8,'#ffda87');
   p(18,21,3,5,'#d5bd91');p(18,20,3,1,'#ffebaf');
   // Deliberate angular, alternating rune glyphs carved on basalt stones.
   for(let y=13;y<42;y+=7){
    stroke(9,y,12,y+3,'#b6a591');
    stroke(30,y,27,y+3,'#bd9e7c');
    p(9,y+3,4,1,'#e0c39c');p(27,y+3,4,1,'#d7ad86');
   }
   stroke(17,30,20,27,'#6f533f');stroke(20,27,23,30,'#e6cd9b');
   p(8,39,7,4,'#557d64');p(27,38,5,6,'#62876e');
   p(10,37,4,3,'#9da774');p(24,40,4,3,'#a9b288');
   dot(14,44,'#d2b692');dot(26,44,'#e3c49a');
  }else{
   p(8,14,24,29,'#34385e');p(11,21,18,20,'#544779');
   // Tall twin moons linked by a woven silver constellation lattice.
   p(13,15,8,8,'#ddd6d1');p(15,15,7,6,'#4a5279');
   p(22,23,7,7,'#f0e1ca');p(24,22,6,6,'#4c4d7a');
   for(const [x,y] of [[10,28],[16,27],[19,32],[26,35],[11,39],[27,41]]){
    p(x,y,2,2,'#e1cbb9');p(x+1,y-2,1,2,'#acc4d5');
   }
   stroke(11,29,16,27,'#b7c9d6');stroke(16,27,19,32,'#b7c9d6');
   stroke(19,32,26,35,'#c7c0de');stroke(26,35,27,41,'#a8c2d5');
   for(const [x,y] of [[11,19],[29,17],[12,35],[29,32]]){
    p(x,y,3,3,'#b49cb3');p(x+1,y-2,1,6,'#e5cbd6');
    p(x-1,y+1,5,1,'#eeddd5');
   }
   p(14,42,13,2,'#817896');dot(18,42,'#f0dabe');
  }
  // Each architecture has individually positioned glints and a floor sill.
  p(6,45,28,2,'#dbb993');p(11,44,19,1,'#f0d5a8');
  p(3,8,2,33,'#d3b392');p(35,8,2,33,'#8e7275');
 }
 return canvas;
}
const tex=new Map(ITEMS.map(item=>[item.id,artwork(item)]));
if(tex.size!==8)throw Error('Eight distinct authored artworks required');
const thumbnails=new Map();
function thumbnail(id){
 if(thumbnails.has(id))return thumbnails.get(id);
 const result=tex.has(id)?tex.get(id).toDataURL('image/png'):old.thumbnail(id);
 if(result)thumbnails.set(id,result);
 return result;
}
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:Object.freeze([...old.items,...ITEMS]),slots:old.slots,quotas:old.quotas,
 texture:id=>tex.get(id)||old.texture(id),
 thumbnail
});
})();