/* Bit Bazaar v0.37 — final twenty ORIGINAL hand-illustrated 16-bit gallery works.
 * Exactly 180 named individual works after loading. Every drawing is a unique
 * small composition, never a copied or palette-shifted previous picture.
 * All 232 physically saved mounting locations remain in their existing order. */
(()=>{
'use strict';
const old=window.BIT_BAZAAR_DECOR;
if(!old||old.items.length!==160||old.slots.length!==232)
 throw Error('The final 180-piece catalog requires the original 160 artworks and all 232 stable anchors');
const ITEMS=[
 {id:'moonlit-koi-festival',name:'Moonlit Koi Festival',category:'Framed Art',mount:'wall',price:5,art:'koifestival',
 description:'A glowing river festival sends elaborate koi-shaped lantern boats beneath a violet bridge as children wave from golden steps.'},
 {id:'museum-of-dawn',name:'The Museum of Dawn',category:'Framed Art',mount:'wall',price:8,art:'dawnmuseum',
 description:'A tiny antique museum opens its immense pearl doors at sunrise, revealing sculptures, skylights and a deep blue marble hall.'},
 {id:'glass-forest-fireflies',name:'Glass Forest Fireflies',category:'Framed Art',mount:'wall',price:4,art:'glassforest',
 description:'A forest of translucent teal glass trees flickers with amber fireflies while two snowy rabbits shelter under a glowing mushroom.'},
 {id:'clockwork-unicorn-scholar',name:'Clockwork Unicorn Scholar',category:'Statues',mount:'floor',price:8,art:'unicorn',
 description:'A mechanical ivory unicorn studies miniature copper books, with silver hoof gears, a sapphire monocle and a spiraled brass horn.'},
 {id:'moss-griffin-sentinel',name:'Moss Griffin Sentinel',category:'Statues',mount:'floor',price:9,art:'griffin',
 description:'A solemn griffin with jade-stone wings and a golden eagle beak guards an overgrown castle plinth woven with blooming ivy.'},
 {id:'velvet-lantern-owl',name:'Velvet Lantern Owl',category:'Statues',mount:'floor',price:5,art:'owl',
 description:'A round midnight-purple owl sits on a walnut perch, holding a little golden lantern with talons and wearing star-shaped spectacles.'},
 {id:'copper-river-dragon',name:'Copper River Dragon',category:'Statues',mount:'floor',price:10,art:'riverdragon',
 description:'A serpentine copper dragon curls above an enamel waterfall, carrying opal whiskers and tiny verdigris scales along its spine.'},
 {id:'little-astro-courier',name:'Little Astro Courier',category:'Statues',mount:'floor',price:6,art:'astronaut',
 description:'A round-suited miniature space explorer delivers a letter among silver moon rocks, with a gold oxygen pack and blue glass visor.'},
 {id:'moonberry-ivy-trellis',name:'Moonberry Ivy Trellis',category:'Plants',mount:'floor',price:4,art:'moonivy',
 description:'A curling brass plant trellis bears luminous violet berries, silver twined leaves and delicate miniature flowers in a jade urn.'},
 {id:'crystal-fern-cavern',name:'Crystal Fern Cavern',category:'Plants',mount:'floor',price:6,art:'crystalfern',
 description:'A shattered amethyst geode holds glowing ferns and tiny translucent cyan blooms, with roots threading through mineral stone.'},
 {id:'golden-marsh-lantern-reeds',name:'Golden Marsh Lantern Reeds',category:'Plants',mount:'floor',price:5,art:'marshreeds',
 description:'Amber cattail lanterns rise above turquoise marsh grass in a terracotta pot ringed by waterlily petals and tiny silver snails.'},
 {id:'stained-glass-carousel-lamp',name:'Stained-Glass Carousel Lamp',category:'Lighting',mount:'floor',price:8,art:'carousel',
 description:'A miniature brass carousel shines with ruby and aquamarine lamps over delicately painted horses and a little striped canopy.'},
 {id:'aurora-observatory-beacon',name:'Aurora Observatory Beacon',category:'Lighting',mount:'floor',price:7,art:'aurorabeacon',
 description:'A golden astronomical lamp frames an iridescent northern-lights sphere above engraved compass rings and an obsidian pedestal.'},
 {id:'bluebell-star-compass',name:'Bluebell Star Compass',category:'Rugs',mount:'rug',price:5,art:'bluecompass',
 description:'A woven deep-blue compass rose points between pastel bluebells, golden star clusters and a pearl-stitched coastline.'},
 {id:'copper-autumn-quilt',name:'Copper Autumn Quilt',category:'Rugs',mount:'rug',price:3,art:'autumnquilt',
 description:'A warm rust-colored patchwork carpet displays geometric maple leaves, little teal river tiles and honey-colored border stitching.'},
 {id:'hollow-moon-archway',name:'Hollow Moon Archway',category:'Architecture',mount:'wall',price:9,art:'moonarch',
 description:'An elaborate stone lunar arch frames a floating moonlit staircase, tiny ringing bells and violet clouds behind curved glass.'},
 {id:'hearthstone-story-window',name:'Hearthstone Story Window',category:'Architecture',mount:'wall',price:7,art:'hearthwindow',
 description:'A miniature cottage window tells a whole fireside story: glowing hearth, sleeping red cat, copper kettle and falling snow.'},
 {id:'royal-enamel-checkwork',name:'Royal Enamel Checkwork',category:'Shelf Trims',mount:'shelf',price:6,art:'royalcheck',
 description:'Royal blue shelf fascias hold tiny enamel checker diamonds, ornate ivory starburst rosettes and crisp golden corner edging.'},
 {id:'silver-tide-brasswork',name:'Silver Tide Brasswork',category:'Shelf Trims',mount:'shelf',price:5,art:'silvertide',
 description:'Soft pewter-blue shelf lips bear hammered brass seashells, silver fish-scale loops and tiny turquoise wave-shaped cabochons.'},
 {id:'pocket-world-diorama',name:'Pocket World Diorama',category:'Curios',mount:'floor',price:7,art:'pocketworld',
 description:'A magical hand-sized glass globe contains a miniature village with two glowing houses, a stone bridge, trees and its own moon.'}
];
function paint(item){
 const framed=item.category==='Framed Art',arch=item.category==='Architecture',
  rug=item.mount==='rug',shelf=item.mount==='shelf';
 const w=shelf?48:rug||arch?40:32,h=shelf||rug?28:arch?48:40;
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const g=canvas.getContext('2d',{alpha:!shelf});g.imageSmoothingEnabled=false;
 const p=(x,y,ww,hh,color)=>{g.fillStyle=color;g.fillRect(x,y,ww,hh)};
 const d=(x,y,color)=>p(x,y,1,1,color);
 const l=(x,y,xx,yy,color)=>{
  let dx=Math.abs(xx-x),dy=Math.abs(yy-y),sx=x<xx?1:-1,sy=y<yy?1:-1,err=dx-dy;
  for(;;){d(x,y,color);if(x===xx&&y===yy)break;
   const e=2*err;if(e>-dy){err-=dy;x+=sx}if(e<dx){err+=dx;y+=sy}
  }
 };
 const star=(x,y,color='#e9d0a4')=>{p(x-2,y,5,1,color);p(x,y-2,1,5,'#fff1d3')};
 const bezel=(x,y,ww,hh,outer,inner)=>{p(x,y,ww,hh,outer);p(x+2,y+2,ww-4,hh-4,inner)};
 const a=item.art;
 if(framed){
  bezel(0,0,32,40,'#36354a','#ab8a73');bezel(3,3,26,34,'#efcfa6','#33475e');
  p(3,6,1,28,'#fff0c6');p(28,6,1,28,'#785962');
  for(let y=7;y<35;y+=6){d(2,y,'#dcb99c');d(29,y,'#e3c59e')}
  if(a==='koifestival'){
   p(5,5,22,30,'#3e4b77');p(5,25,22,10,'#436c85');
   p(8,19,18,3,'#af7b7c');p(9,16,15,3,'#e3b58e');
   for(const [x,y,c] of [[7,28,'#e79a7e'],[19,29,'#acb8d0'],[13,24,'#f2c98d']]){
    p(x,y,7,3,c);p(x+2,y-2,4,3,'#fff0bf');
    p(x-2,y+1,3,2,'#c1a59b');d(x+5,y,'#425872');
   }
   for(const [x,y] of [[7,9],[15,11],[24,8]]){
    p(x,y,3,5,'#e9bd89');p(x+1,y+2,2,2,'#fff2ca');
    l(x+2,y+5,x+2,17,'#c2a29e');
   }
   p(6,32,20,1,'#88b3c0');p(9,34,17,1,'#9cb8c4');
   p(23,9,3,4,'#e5d6d8');p(24,8,2,3,'#ffedd8');
   for(const [x,y] of [[7,6],[11,14],[25,17]])star(x,y,'#eec9a1');
  }else if(a==='dawnmuseum'){
   p(5,5,22,30,'#9b98a3');p(5,10,22,25,'#d9b8a2');
   p(8,13,16,20,'#8e8298');p(9,16,14,15,'#607b94');
   p(10,13,12,2,'#f7ddac');p(15,6,5,9,'#f8e6be');
   p(13,17,6,10,'#cbb49e');p(14,15,4,3,'#e9d2ad');
   p(14,25,6,2,'#fff0cf');p(11,29,13,3,'#8a7a8c');
   for(const x of [8,23]){p(x,10,2,22,'#f0d2ae');p(x-1,12,4,2,'#b8948e')}
   for(let x=11;x<23;x+=4){p(x,11,2,3,'#9e8792');d(x,13,'#fff0cc')}
   p(7,32,19,3,'#e1c29e');p(13,33,8,1,'#fff1cd');
   for(const [x,y] of [[7,8],[23,7],[25,26]])star(x,y,'#ebd3ae');
  }else{
   p(5,5,22,30,'#2d5f66');p(5,28,22,7,'#3e716e');
   for(const [x,y,h] of [[8,12,17],[14,8,20],[22,11,16]]){
    p(x,y,5,h,'#699ba0');p(x+1,y-3,3,4,'#c8e0d5');
    p(x+2,y+3,1,h-5,'#a3d2c8');
    for(const yy of [y+6,y+11])d(x+3,yy,'#f5e9ca');
   }
   p(9,23,12,6,'#ece0d0');p(10,21,11,4,'#d4dbca');
   p(13,22,4,3,'#fff0d4');p(12,25,7,2,'#98a8a7');
   for(const [x,y] of [[8,7],[24,9],[6,17],[23,23],[13,15]]){
    star(x,y,'#f7ca88');p(x,y+3,1,2,'#edd7a2');
   }
   p(9,31,15,2,'#78a89d');p(13,33,8,2,'#a5b9a6');
  }
 }else if(arch){
  bezel(0,0,40,48,'#333b4e','#a88e85');bezel(4,4,32,40,'#e1c9a9','#354d61');
  for(let y=8;y<44;y+=7){p(5,y,30,1,'#978c8a');p(9,y+1,2,5,'#b5a18e')}
  if(a==='moonarch'){
   p(11,9,20,32,'#424569');p(12,10,18,30,'#66587f');
   p(16,8,8,7,'#d5d0cf');p(18,6,7,8,'#555275');
   p(14,34,12,4,'#d2b69a');p(16,30,11,3,'#e1cbaa');
   p(18,26,8,3,'#f5e3c5');p(20,22,6,3,'#d2c6be');
   p(22,18,4,3,'#d1c0bd');p(18,14,5,4,'#f2e7cd');
   l(12,15,18,9,'#e1c19a');l(28,15,22,9,'#e1c19a');
   p(9,18,2,20,'#9e8a89');p(30,18,2,20,'#9e8a89');
   for(const [x,y] of [[12,12],[27,14],[10,28],[29,28]]){
    p(x,y,4,3,'#c7a681');d(x+2,y+1,'#fff4c9');
    p(x+1,y+3,2,3,'#a49cad');
   }
   for(const [x,y] of [[14,8],[27,10],[17,40]])star(x,y,'#e6d3b3');
  }else{
   p(9,9,22,31,'#765b68');p(12,12,17,25,'#b28c7b');
   p(13,14,15,20,'#495f77');p(13,28,15,7,'#6b5269');
   p(17,21,9,8,'#be8f6e');p(18,19,7,4,'#ebbc87');
   p(18,23,5,3,'#f9e2ae');p(19,22,3,4,'#fff2c8');
   p(24,23,5,7,'#825968');p(26,19,4,5,'#bf8e77');
   p(14,29,7,4,'#9b675d');p(15,28,6,2,'#e5af7e');
   p(15,30,4,1,'#f7d4ab');
   p(8,8,25,3,'#dfc098');p(10,38,20,4,'#bead9b');
   for(const [x,y] of [[11,14],[30,15],[9,27],[31,29]]){
    p(x,y,3,6,'#d3bba9');p(x+1,y+2,1,3,'#fff1c9');
   }
   for(const [x,y] of [[12,9],[27,8],[25,35]])star(x,y,'#e9d3bc');
  }
 }else if(rug){
  bezel(0,0,40,28,'#363647','#e2c39b');
  p(3,3,34,22,a==='bluecompass'?'#385a8b':'#935c53');
  for(let x=4;x<37;x+=5){d(x,2,'#f4dbaa');d(x,25,'#f2c59d')}
  for(let y=4;y<25;y+=5){d(2,y,'#f6d3af');d(37,y,'#e7b68e')}
  if(a==='bluecompass'){
   for(let n=0;n<8;n++){
    const rad=n*Math.PI/4,x=Math.round(20+13*Math.cos(rad)),y=Math.round(14+9*Math.sin(rad));
    l(20,14,x,y,n%2?'#d8b9a3':'#b9dbe0');
    p(x,y,3,2,'#f3dbb1');d(x+1,y,'#fff9d9');
   }
   p(16,10,8,8,'#d3e0d7');p(18,11,4,6,'#5f89a7');
   p(19,12,2,3,'#fff6dd');
   for(const [x,y] of [[7,8],[31,7],[8,20],[30,22]]){
    p(x,y,5,4,'#af9cbd');p(x+1,y-2,3,3,'#e9c5dd');
    p(x+2,y+2,2,3,'#6f839e');d(x+2,y,'#fff6d8');
   }
  }else{
   for(let y=4;y<23;y+=6)for(let x=5;x<36;x+=8){
    p(x,y,7,5,((x+y)/2)%3?'#d5a073':'#ab7074');
    p(x+1,y+1,5,3,'#e2bd8d');p(x+2,y+2,3,2,'#a97c68');
    p(x+3,y+1,2,3,'#c48768');
   }
   for(const [x,y] of [[10,8],[25,8],[12,19],[29,18]]){
    l(x,y,x+5,y+5,'#b77f69');l(x+5,y,x,y+5,'#e9ca99');
    p(x+2,y+2,3,2,'#f3d7a2');
   }
   p(6,11,28,2,'#c68a6c');p(9,20,23,1,'#e5b68b');
  }
 }else if(shelf){
  p(0,0,48,28,'#302b40');p(1,2,46,24,a==='royalcheck'?'#6d7197':'#6f8c94');
  p(3,4,42,20,a==='royalcheck'?'#394e81':'#335a6b');
  p(3,5,42,2,'#f0cea8');p(3,21,42,2,'#bd9fa3');
  if(a==='royalcheck'){
   for(let x=5;x<46;x+=7){
    p(x,8,6,5,'#e6c49a');p(x+1,9,4,3,'#70839e');
    p(x+2,10,2,2,'#fff2d4');
    p(x,16,6,4,'#b7b4d1');p(x+1,17,4,2,'#e2c9bd');
    star(x+3,14,'#f6d7a5');
   }
   p(4,6,40,1,'#fff0cb');p(4,20,40,1,'#fff0cb');
  }else{
   for(let x=5;x<45;x+=7){
    l(x,17,x+4,9,'#bfd5d1');l(x+4,9,x+7,17,'#d8bf9d');
    p(x+1,11,4,2,'#7ab9b8');p(x+2,8,3,2,'#e7d7bd');
    p(x+2,16,5,2,'#97a7b7');d(x+4,16,'#fff6d5');
   }
   for(const [x,y] of [[7,7],[23,8],[38,10]])star(x,y,'#c2e6dc');
   p(4,20,40,1,'#e9c7a5');
  }
 }else{
  p(4,37,24,2,'#3e3e51');p(8,34,17,3,'#877d82');
  if(a==='unicorn'){
   p(10,29,18,6,'#8e8999');p(13,23,14,9,'#d8d8d5');
   p(13,15,12,12,'#e7e6dd');p(14,10,12,8,'#f8eecf');
   p(20,8,6,5,'#c6c4c2');p(25,10,5,3,'#e5cea9');
   l(19,8,22,2,'#e7be83');l(22,2,25,8,'#f1d4a4');
   p(15,16,3,2,'#466c86');p(21,15,4,2,'#467995');
   p(12,26,4,8,'#9a9694');p(24,27,4,7,'#c5b0a4');
   for(const [x,y] of [[9,24],[8,28],[10,32]]){
    p(x,y,6,2,'#a28d88');p(x+1,y-2,4,2,'#e7cb9d');
   }
   p(16,31,11,2,'#d6b997');p(17,21,7,3,'#bca28f');
   for(const [x,y] of [[11,14],[27,17],[23,6]])star(x,y,'#e0c89c');
  }else if(a==='griffin'){
   p(10,30,18,6,'#61687a');p(12,27,15,4,'#96a294');
   p(12,18,15,12,'#8d9c80');p(14,11,13,10,'#b4c0a7');
   p(18,8,9,6,'#dfc8a1');p(24,11,6,3,'#e9b580');
   d(23,12,'#354f57');
   p(7,18,9,10,'#728c80');p(6,13,8,11,'#b0bea2');
   p(10,14,8,4,'#d6cfad');p(24,23,7,6,'#7b9a89');
   p(13,27,4,7,'#b5a68c');p(24,27,4,7,'#8c927f');
   for(const [x,y] of [[8,14],[9,19],[25,19],[28,25]]){
    p(x,y,4,2,'#bed0b2');p(x+1,y-2,2,3,'#9dbd95');
   }
   for(const [x,y] of [[8,17],[10,20],[12,15],[25,23],[26,27]]){
    p(x,y,4,2,'#d1d9b9');p(x+1,y-2,2,3,'#9fbda5');
    d(x+2,y+1,'#f4e4b9');
   }
   p(15,26,10,2,'#c5b28e');p(18,29,4,2,'#f1d5a5');
   p(13,32,12,2,'#c4b393');star(28,9,'#ead09e');
  }else if(a==='owl'){
   p(11,31,16,5,'#5c4c62');p(13,27,14,5,'#a78473');
   p(12,14,16,16,'#584865');p(14,10,12,8,'#826783');
   p(13,8,5,5,'#65536f');p(23,8,5,5,'#65536f');
   p(14,16,6,6,'#e8d6b7');p(22,16,6,6,'#e8d6b7');
   p(16,18,3,3,'#3e5265');p(24,18,3,3,'#3e5265');
   p(19,22,4,3,'#edbf85');p(14,25,14,3,'#9b849b');
   p(13,26,4,6,'#684f68');p(25,26,4,6,'#68536a');
   p(7,24,7,7,'#b18b6a');p(9,25,4,5,'#ffdfa1');
   p(8,23,6,2,'#e5c08f');
   l(16,17,20,15,'#e2c98c');l(22,15,27,17,'#e2c98c');
   star(8,9,'#f5d29c');star(28,7,'#f5d29c');
  }else if(a==='riverdragon'){
   p(11,31,18,5,'#5b6176');p(14,28,13,4,'#9ca0a5');
   p(9,21,19,11,'#b67e65');p(12,17,13,9,'#dba284');
   p(16,11,12,9,'#c49078');p(20,7,8,7,'#e2b08a');
   p(25,10,6,3,'#e8d0a1');d(25,11,'#384e60');
   p(7,24,7,7,'#9a695f');p(9,27,10,3,'#d9a28b');
   for(const [x,y] of [[9,20],[14,16],[18,12],[22,9]]){
    p(x,y,3,4,'#7c9a91');p(x+1,y-2,2,3,'#b3b89b');
   }
   l(26,10,30,5,'#ead0ac');l(23,9,21,4,'#ebd0ad');
   l(26,13,29,20,'#b2d6cb');l(23,13,21,18,'#b2d6cb');
   p(12,32,13,2,'#c5b194');p(18,26,6,2,'#eee0b3');
   for(const [x,y] of [[8,10],[31,12],[7,29]])star(x,y,'#cfb9a6');
  }else if(a==='astronaut'){
   p(12,31,17,5,'#73768c');p(14,29,14,3,'#b5b6b3');
   p(12,17,16,14,'#d5d2d2');p(14,10,13,11,'#eff0e8');
   p(15,12,11,8,'#5b8ca9');p(17,13,8,5,'#9ec6ca');
   p(16,19,10,7,'#c4d8d6');p(20,22,3,2,'#e1bb8c');
   p(11,20,5,8,'#d6d4d0');p(26,20,5,8,'#c6c1c5');
   p(15,27,5,6,'#bec7cb');p(24,27,5,6,'#b4b1bc');
   p(8,18,5,11,'#bba274');p(9,16,4,5,'#e3c38d');
   p(28,24,5,3,'#f8e7c1');l(28,24,32,26,'#b4a8aa');
   p(11,33,18,2,'#f5d2a5');star(10,8,'#d1d8dd');
   for(const [x,y] of [[7,27],[30,11],[10,13]]){p(x,y,2,2,'#b4b2b8')}
   // Helmet reflections, mission patch, woven glove seams and lunar boot tread.
   for(const [x,y] of [[16,14],[20,15],[24,17],[13,23],[27,24]]){
    p(x,y,2,2,'#bde4e1');d(x+1,y,'#f8f6df');
   }
   p(16,24,3,3,'#7e99a5');p(17,25,2,1,'#f2cc95');
   p(15,32,6,2,'#a5a9b0');p(23,32,6,2,'#9398a6');
   p(8,22,4,1,'#f7dfb8');star(29,7,'#d7e3e4');
  }else if(a==='moonivy'){
   p(10,31,17,5,'#6b7a8d');p(12,28,14,4,'#a9b6af');
   l(19,29,18,8,'#b9957e');l(19,22,8,14,'#b49c8b');
   l(19,22,30,15,'#c7a98c');
   for(const [x,y] of [[7,11],[13,7],[22,8],[25,17],[10,24]]){
    p(x,y,7,3,'#679b89');p(x+1,y-3,5,3,'#acbca0');
    p(x+3,y+3,3,2,'#d5c2cd');p(x+4,y+1,2,2,'#ad8db2');
   }
   for(const [x,y] of [[12,12],[24,10],[10,20],[27,24]]){
    p(x,y,3,3,'#ae9bc7');d(x+1,y+1,'#fff0d3');
   }
   p(14,33,11,2,'#d3c59b');star(29,8,'#e1cab7');
  }else if(a==='crystalfern'){
   p(9,31,20,5,'#5c597c');p(11,28,16,4,'#b7a9bd');
   p(12,18,15,12,'#756a9e');p(14,15,11,12,'#b8a7ca');
   l(19,29,18,8,'#7f9e9e');l(19,23,10,11,'#a9bdbc');
   l(19,20,29,13,'#93b4b9');
   for(const [x,y] of [[8,11],[20,7],[24,17],[13,22]]){
    p(x,y,6,3,'#77a7ad');p(x+2,y-3,4,4,'#bce1d0');
    p(x+1,y+3,3,3,'#e2d4dc');
   }
   for(const [x,y] of [[13,15],[23,13],[17,24],[26,25]]){
    p(x,y,3,5,'#c7b5da');d(x+1,y+1,'#fff3dc');
   }
   p(15,33,11,2,'#e1c6b8');star(8,7,'#c4e9e1');
  }else if(a==='marshreeds'){
   p(8,32,22,4,'#836b69');p(11,29,17,4,'#d3aa83');
   for(const [x,y] of [[9,11],[15,7],[22,13],[28,9]]){
    l(x+2,28,x+2,y+3,'#8ca791');
    p(x,y,5,7,'#d1a369');p(x+1,y-2,3,3,'#efc68c');
    p(x+1,y+4,3,3,'#ae786d');
    for(const dy of [9,14]){p(x-2,y+dy,5,2,'#6d9c85')}
   }
   p(11,27,18,3,'#4c8c91');p(14,29,13,2,'#a8c4a2');
   p(10,33,19,2,'#a28277');d(20,30,'#fff0c8');
   for(const [x,y] of [[7,10],[30,15],[12,23]])star(x,y,'#edd19a');
  }else if(a==='carousel'){
   p(12,32,17,5,'#685e78');p(14,28,13,5,'#b99984');
   p(17,16,7,14,'#cda782');p(8,9,24,9,'#8e7294');
   p(10,7,20,4,'#e2be92');p(13,5,14,3,'#f0d9ab');
   for(const [x,y] of [[9,18],[19,19],[26,17]]){
    p(x,y,6,4,'#bcaeb4');p(x+1,y-2,4,3,'#e7d5cb');
    p(x+3,y-3,3,2,'#a29db7');
    l(x+3,y+4,x+3,29,'#caa581');
   }
   for(const [x,y] of [[10,10],[25,10],[17,7],[30,15]])star(x,y,'#f9dc99');
   p(10,27,21,2,'#e6c699');p(11,30,19,2,'#8e7382');
  }else if(a==='aurorabeacon'){
   p(11,33,18,4,'#6b6479');p(14,28,12,6,'#b9a78b');
   p(17,22,7,7,'#d5b18f');p(10,10,23,14,'#6b9caa');
   p(12,12,19,10,'#3c7e91');p(16,10,12,7,'#bce0d7');
   p(18,13,8,5,'#e3d9be');p(20,14,5,3,'#fff5db');
   for(const [x,y] of [[10,16],[25,12],[16,22],[29,20]]){
    p(x,y,4,3,'#95b8b9');p(x+1,y-2,3,2,'#c0e5ce');
    d(x+2,y+1,'#fff1d4');
   }
   p(9,24,23,2,'#bd9c7e');p(12,8,18,2,'#e2bf8d');
   // Compass collar, engraved orbital scale, and reflected sky filaments.
   for(const [x,y] of [[13,15],[17,11],[26,14],[22,19]]){
    p(x,y,3,2,'#b2dad4');d(x+1,y,'#fff8db');
   }
   for(const [x,y] of [[12,25],[18,25],[25,25]]){
    p(x,y,3,2,'#d7b28c');d(x+1,y+1,'#f5d7a7');
   }
   p(16,28,11,2,'#e2c69b');p(17,30,8,1,'#f6dfb4');
   star(7,9,'#d7e7d6');star(31,8,'#e9d3a9');
  }else{
   p(9,31,21,5,'#6f6c80');p(11,28,18,3,'#c5a898');
   p(10,13,21,15,'#7eafad');p(12,11,17,18,'#3d748b');
   p(14,14,13,11,'#5a9b9b');p(17,13,7,4,'#e7e4c9');
   p(18,10,5,4,'#fff3ce');
   p(14,21,7,5,'#b18a78');p(20,19,6,7,'#d5b497');
   p(13,24,14,3,'#6e8d8b');p(11,27,19,2,'#a1c1ab');
   for(const [x,y] of [[10,10],[27,10],[9,23],[29,23]]){
    p(x,y,3,6,'#a9d1d0');d(x+1,y+2,'#f0f6e5');
   }
   for(const [x,y] of [[15,15],[25,15],[18,25]])star(x,y,'#e8d49e');
   // Tiny individual village houses and moonlit cobbled bridge details.
   for(const [x,y] of [[13,22],[22,20],[16,25]]){
    p(x,y,3,3,'#cda18d');p(x+1,y-1,2,2,'#ffdd9b');
    d(x+1,y+1,'#fff9e0');
   }
   l(12,28,25,28,'#d8c8a9');l(15,27,22,27,'#f3d4a5');
   for(const [x,y] of [[9,17],[27,19],[11,28]])d(x,y,'#c8e8e4');
   p(13,33,13,2,'#d5b99e');p(17,29,8,3,'#f2dcb9');
  }
 }
 return canvas;
}
const all=[...old.items,...ITEMS],
 paintings=new Map(ITEMS.map(item=>[item.id,paint(item)])),
 target={'Framed Art':35,Statues:25,Plants:20,Lighting:20,Rugs:20,
  Architecture:20,Ceilings:15,'Shelf Trims':15,Curios:10};
if(paintings.size!==20||all.length!==180||
   new Set(all.map(item=>item.id)).size!==180||
   new Set(all.map(item=>item.name)).size!==180)
 throw Error('The 180-decor library must have exactly 180 unique artwork IDs and names');
for(const [kind,limit] of Object.entries(target))
 if(all.filter(item=>item.category===kind).length!==limit)
  throw Error('Incorrect locked 180-item category quota: '+kind);
const thumbnails=new Map();
function thumbnail(id){
 if(thumbnails.has(id))return thumbnails.get(id);
 const canvas=paintings.get(id),url=canvas?canvas.toDataURL('image/png'):old.thumbnail(id);
 if(url)thumbnails.set(id,url);
 return url;
}
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:Object.freeze(all),slots:old.slots,quotas:old.quotas,
 texture:id=>paintings.get(id)||old.texture(id),thumbnail
});
})();