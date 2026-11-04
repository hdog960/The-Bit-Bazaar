/* Bit Bazaar v0.34 — 16 more handcrafted pixel artworks.
   Four native texture formats, one unique composition per named work.
   Produced ONCE at initialization and never painted inside the game loop. */
(()=>{
'use strict';
const old=window.BIT_BAZAAR_DECOR;
if(!old||old.items.length!==104||old.slots.length!==190)
 throw Error('v0.34 hand-painted art requires 104 previous works and 190 unchanged mounts');
const ITEMS=[
 {id:'night-orchard-express',name:'The Night Orchard Express',category:'Framed Art',mount:'wall',price:5,art:'nighttrain',
  description:'A tiny scarlet locomotive passes silver apple trees beneath a stitched constellation sky and miniature copper signal lamps.'},
 {id:'mountain-giants-tea',name:"The Mountain Giant's Tea",category:'Framed Art',mount:'wall',price:4,art:'gianttea',
  description:'A gentle stone giant shares a steaming golden teacup with a tiny hiker on the shoulder of a lavender mountain.'},
 {id:'drowned-post-office',name:'The Drowned Post Office',category:'Framed Art',mount:'wall',price:6,art:'drownedmail',
  description:'A blue underwater post office glows above coral mailboxes as silver fish deliver miniature parchment envelopes.'},
 {id:'sunrise-kitekeepers',name:'The Sunrise Kitekeepers',category:'Framed Art',mount:'wall',price:3,art:'kitekeepers',
  description:'Three children in saffron cloaks fly intricate fish-shaped kites from a high grassy ridge at a rosy sunrise.'},
 {id:'clockwork-rainforest',name:'The Clockwork Rainforest',category:'Framed Art',mount:'wall',price:7,art:'clockjungle',
  description:'Bronze beetles and tiny copper gears drift between emerald rainforest leaves under the watch of a bright glass-eyed toucan.'},
 {id:'amber-moss-observatory',name:'Amber Moss Observatory',category:'Architecture',mount:'wall',price:8,art:'observatory',
  description:'An arched amber-glass window frames a mossy telescope dome, gilded star map and slender terracotta vine columns.'},
 {id:'porcelain-wolf-sentinel',name:'Porcelain Wolf Sentinel',category:'Statues',mount:'floor',price:7,art:'wolf',
  description:'A serene cobalt-eyed snow-white wolf guards a blue-tiled plinth, with gold kintsugi seams and a silver crescent collar.'},
 {id:'prismatic-pitcher-grove',name:'Prismatic Pitcher Grove',category:'Plants',mount:'floor',price:5,art:'pitcher',
  description:'A crystalline planter grows hanging ruby-and-turquoise pitcher flowers with iridescent dew pearls and twisting jade stems.'},
 {id:'goldfish-beacon',name:'The Goldfish Beacon',category:'Lighting',mount:'floor',price:6,art:'goldfish',
  description:'A brass standing lamp holds a glowing glass sphere where two orange goldfish orbit a pale pearl and a miniature stone pagoda.'},
 {id:'mapmakers-midnight-route',name:"The Mapmaker's Midnight Route",category:'Rugs',mount:'rug',price:5,art:'maprug',
  description:'A woven indigo treasure map leads through embroidered islands, a rose compass and stitched ivory sailing vessels.'},
 {id:'lily-fox-carpet',name:'The Lily Fox Carpet',category:'Rugs',mount:'rug',price:4,art:'lilyfox',
  description:'A jade green carpet portrays a sleeping cinnamon fox inside a ring of cream lilies and delicate pale-gold seedpods.'},
 {id:'singing-whale-mobile',name:'Singing Whale Mobile',category:'Ceilings',mount:'ceiling',price:8,art:'whalemobile',
  description:'Three carved sky-blue whales swim around a brass moon, suspended on pearl strings with tiny silver bubbles and stars.'},
 {id:'clocksmith-meteor-bells',name:"The Clocksmith's Meteor Bells",category:'Ceilings',mount:'ceiling',price:7,art:'meteorbell',
  description:'Six weathered copper bells descend in a swirling comet shape with little mechanical gears and amber glass sparks.'},
 {id:'starlit-cedar-rails',name:'Starlit Cedar Rails',category:'Shelf Trims',mount:'shelf',price:4,art:'cedar',
  description:'Dark cedar shelf faces are hand-inlaid with copper pine sprigs, tiny amber resin stars and carved silver seed scales.'},
 {id:'glassleaf-silver-trims',name:'Glassleaf Silver Trims',category:'Shelf Trims',mount:'shelf',price:6,art:'glassleaf',
  description:'Frosted slate shelf borders showcase translucent leaf shapes, layered silver vines and irregular pale mint crystals.'},
 {id:'lighthouse-terrarium',name:'Lighthouse in a Jar',category:'Curios',mount:'floor',price:5,art:'jar-lighthouse',
  description:'A palm-sized sea-glass terrarium traps an ivory lighthouse, tiny braided shore reeds and a stormy glowing miniature ocean.'}
];
function paint(item){
 const framed=item.category==='Framed Art',
  arch=item.category==='Architecture',rug=item.mount==='rug',
  ceiling=item.mount==='ceiling',shelf=item.mount==='shelf';
 const w=shelf?48:rug||ceiling||arch?40:32,
  h=shelf||rug?28:ceiling||arch?48:40;
 const c=document.createElement('canvas');
 c.width=w;c.height=h;
 const g=c.getContext('2d',{alpha:!shelf});g.imageSmoothingEnabled=false;
 const r=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,ww,hh)};
 const dot=(x,y,col)=>r(x,y,1,1,col);
 const l=(x1,y1,x2,y2,col)=>{
  let dx=Math.abs(x2-x1),dy=Math.abs(y2-y1),
    sx=x1<x2?1:-1,sy=y1<y2?1:-1,err=dx-dy;
  for(;;){dot(x1,y1,col);if(x1===x2&&y1===y2)break;
   const e=2*err;if(e>-dy){err-=dy;x1+=sx}if(e<dx){err+=dx;y1+=sy}
  }
 };
 const star=(x,y,col='#e9d19e')=>{
  r(x-2,y,5,1,col);r(x,y-2,1,5,'#fff0c9')
 };
 const art=item.art;
 if(framed){
  r(0,0,32,40,'#332c3f');r(1,1,30,38,'#9f7d66');
  r(3,3,26,34,'#e2bf8c');r(5,5,22,30,'#2a385b');
  for(let y=5;y<36;y+=5){dot(3,y,'#f7dbab');dot(28,y,'#805969')}
  if(art==='nighttrain'){
   r(6,6,20,28,'#283758');r(6,26,20,7,'#456259');
   for(const [x,y] of [[8,13],[12,9],[19,10],[23,15],[26,7]])star(x,y,'#b7c4d7');
   for(const [x,h] of [[7,8],[12,12],[20,9],[25,10]]){
    r(x,27-h,2,h,'#755a5a');r(x-2,23-h,6,2,'#a5b19f');
    r(x-1,20-h,4,2,'#dbbcc3');dot(x+1,24-h,'#f3dba5');
   }
   r(7,27,19,2,'#cab18b');r(9,25,12,4,'#b65c56');
   r(14,22,6,3,'#e6c58e');r(15,23,4,2,'#9ebfbb');
   r(9,24,2,2,'#d29c6f');r(10,21,2,3,'#f0d5ab');
   for(const x of [11,16,21]){r(x,29,3,2,'#464259');dot(x+1,29,'#d5b990')}
   for(const [x,y] of [[8,19],[25,18]]){r(x,y,2,3,'#f4ba7f');dot(x+1,y,'#f9e6ae')}
  }else if(art==='gianttea'){
   r(6,6,20,28,'#4e496e');r(6,25,20,9,'#879387');
   r(9,21,16,12,'#77808d');r(12,15,11,12,'#a19b9b');
   r(13,10,9,10,'#c5b2a7');r(12,9,11,4,'#857f8d');
   r(17,15,2,2,'#403e58');r(21,15,2,2,'#403e58');
   r(18,20,5,1,'#e5cda4');r(8,23,8,5,'#d2b17d');
   r(9,24,6,3,'#fff0b1');r(10,22,4,1,'#f9e1a8');
   for(let y=14;y<20;y+=3){dot(11,y,'#ecddd3');dot(13,y-2,'#ecddd3')}
   r(24,25,2,5,'#d1a77b');r(23,23,4,3,'#6b7887');
   r(24,20,2,3,'#e1c5a9');r(23,19,4,1,'#cf8f7d');
   star(8,8,'#e5c5bc');star(24,7,'#e5c5bc');
  }else if(art==='drownedmail'){
   r(6,6,20,28,'#234e68');
   for(let y=10;y<33;y+=6){l(6,y,25,y-1,'#49849a');r(9,y+2,5,1,'#77a6ae')}
   r(11,15,13,17,'#6f8b90');r(13,13,9,3,'#b7a995');
   r(14,10,7,3,'#c7bfae');r(14,17,7,6,'#bfd6c8');
   r(17,17,2,6,'#597586');r(14,20,7,1,'#8d6e73');
   r(15,26,6,6,'#45596d');r(16,27,4,3,'#b3bdb6');
   for(const [x,y] of [[8,19],[22,24],[8,29]]){
    r(x,y,5,2,'#d7dfcb');r(x+3,y+1,2,1,'#a0c3b2');
    r(x,y+2,1,1,'#35546e');dot(x+1,y,'#344c65');
   }
   for(const [x,y] of [[9,12],[23,11],[7,23],[25,30]]){
    r(x,y,3,2,'#f5e4c0');l(x,y,x+2,y+1,'#b9a389')
   }
   r(6,32,20,2,'#588a85');dot(25,8,'#aed5d6');
  }else if(art==='kitekeepers'){
   r(6,6,20,28,'#c08b92');r(6,9,20,16,'#e8ac94');
   r(6,24,20,10,'#738f68');r(7,27,18,7,'#4f7a67');
   r(22,8,4,4,'#ffe1ab');r(23,9,2,2,'#fff0cb');
   for(const [x,y,c] of [[9,11,'#c36e67'],[17,8,'#6697ac'],[24,15,'#9b7eae']]){
    l(x,y-3,x+4,y,c);l(x+4,y,x,y+3,c);
    l(x,y+3,x-3,y,c);l(x-3,y,x,y-3,c);
    r(x,y,2,2,'#f6dcaa');
    l(x,y+3,x-1,y+18,'#e1d8c5');
   }
   for(const [x,y,cloth] of [[10,26,'#e0b474'],[17,27,'#b77366'],[23,27,'#a3a1b7']]){
    r(x,y-4,3,4,'#f0d5b9');r(x-1,y,5,6,cloth);
    r(x,y+6,1,2,'#4e5262');r(x+2,y+6,1,2,'#4e5262');
   }
   for(let x=6;x<26;x+=4)dot(x,31,'#b2ba8a');
  }else if(art==='clockjungle'){
   r(6,6,20,28,'#244b4d');
   for(const [x,y,ww] of [[5,13,9],[19,10,9],[5,22,12],[21,23,8]]){
    r(x,y,ww,4,'#3e886d');r(x+2,y-3,ww-3,3,'#86a779');
    r(x+3,y+3,2,4,'#2e725e');
   }
   r(11,18,10,11,'#d5af76');r(13,19,7,9,'#8f7a69');
   r(15,21,3,3,'#e5d7ab');r(14,25,5,2,'#d2b07c');
   for(const [x,y] of [[9,9],[23,15],[8,27]]){
    r(x,y,4,4,'#c49469');r(x+1,y+1,2,2,'#f0dca7');
    r(x+3,y+3,2,1,'#769a95');
   }
   r(20,12,6,8,'#343d4c');r(20,11,6,3,'#e1a36d');
   r(23,13,2,4,'#e0dbae');r(25,17,2,2,'#d57e69');
   dot(24,14,'#42657e');r(18,19,4,2,'#7daca1');
   star(8,7,'#e2c894');star(25,28,'#e2c894');
  }
 }else if(arch){
  r(0,0,40,48,'#323346');r(1,1,38,46,'#9f8c86');
  r(3,3,34,42,'#ccb29c');r(6,5,28,39,'#3b4e56');
  for(let y=7;y<42;y+=7){r(6,y,28,1,'#757e79');r(8,y+1,2,5,'#8b827f');r(31,y+1,2,5,'#8b827f')}
  r(10,9,20,32,'#304b59');r(12,11,16,26,'#6e9a91');
  r(17,10,2,27,'#d0b591');r(10,23,20,2,'#c3b58e');
  r(13,29,14,9,'#788f7c');r(15,25,11,8,'#c7ac7e');
  r(17,22,7,5,'#f0d29c');r(19,23,4,3,'#fff3c7');
  r(14,34,12,2,'#d3b58d');r(17,38,6,4,'#6a6470');
  for(const [x,y] of [[7,17],[29,15],[11,31],[27,36]]){
   l(x,y,x+4,y+6,'#6e9579');r(x,y,4,2,'#9cc68b');
   r(x+2,y-2,2,3,'#e8ca9a')
  }
  for(const [x,y] of [[11,12],[26,11],[11,35],[28,29]])star(x,y,'#f3dd9a');
  r(17,7,6,2,'#b98f71');
 }else if(rug){
  r(0,0,40,28,'#333448');r(1,1,38,26,'#d2b38b');
  r(3,3,34,22,art==='maprug'?'#36536d':'#416d5f');
  for(let x=3;x<37;x+=5){dot(x,2,'#f4dcaa');dot(x+2,25,'#eccba4')}
  for(let y=3;y<25;y+=4){dot(2,y,'#cfa18a');dot(37,y,'#e3bca0')}
  if(art==='maprug'){
   for(const [x,y,s] of [[7,8,6],[23,10,8],[12,18,5]]){
    r(x,y,s,3,'#8bb3ab');r(x+1,y-2,s-2,2,'#e4bd8b');
    r(x+2,y+3,2,3,'#a2a9a0');
   }
   l(6,22,17,17,'#edd6a2');l(17,17,27,6,'#e5ba8a');
   l(6,7,33,21,'#7996b0');
   r(17,9,5,11,'#eac68d');r(11,13,17,3,'#c9ad8d');
   r(18,10,3,9,'#355777');r(14,14,12,2,'#456b82');
   r(19,12,2,6,'#f0d49f');r(16,14,8,2,'#f0d49f');
   for(const [x,y] of [[10,22],[27,19]]){
    r(x,y,5,2,'#ede9d4');r(x+1,y-3,1,3,'#d6c4a0');
    l(x+1,y-3,x+4,y,'#fff3dc');
   }
   star(30,8,'#f0d29d');
  }else{
   r(9,7,23,15,'#648c70');r(11,12,18,10,'#ae8664');
   r(14,9,16,7,'#ce9267');r(24,11,5,4,'#edd4ac');
   r(12,11,6,6,'#d8a16f');r(14,8,5,5,'#c48462');
   r(14,17,14,3,'#e9b787');r(11,20,6,2,'#9a705d');
   r(16,15,1,2,'#303b4e');r(25,13,1,2,'#394457');
   for(const [x,y] of [[7,7],[30,7],[8,21],[31,21]]){
    r(x,y,6,3,'#f6e6cb');r(x+2,y-2,3,2,'#fff0d2');
    r(x+1,y+3,4,2,'#d9caa2');dot(x+3,y+1,'#b58f91')
   }
   for(const [x,y] of [[18,5],[34,15],[6,16]])star(x,y,'#e3c89e');
  }
 }else if(ceiling){
  r(19,0,2,9,'#b7aaa0');r(16,3,8,2,'#cbb692');
  if(art==='whalemobile'){
   r(10,10,20,3,'#b5967e');r(13,8,14,2,'#e4c59d');
   for(const [x,y,c] of [[3,18,'#8cbbcb'],[20,25,'#c5d4d1'],[7,37,'#a1bacf']]){
    l(x+6,13,x+6,y,'#c5b2ad');
    r(x,y+2,13,6,c);r(x+2,y,9,5,'#e7e9da');
    r(x+11,y,6,2,'#f6e8d4');
    r(x+1,y+7,3,3,'#7098b6');r(x+5,y+7,3,2,'#6b9da9');
    r(x+9,y+3,1,1,'#31445c');
    l(x+12,y+5,x+16,y+8,'#b1d2ce');
   }
   for(const [x,y] of [[8,9],[32,15],[23,39],[17,18]])star(x,y,'#f2e1bb');
  }else{
   r(9,10,22,3,'#b79170');r(13,8,14,2,'#e0be8c');
   for(const [x,y,s] of [[4,20,5],[12,28,7],[22,35,8],[29,43,6]]){
    l(x+4,12,x+4,y,'#bdac9f');
    r(x,y,8,s,'#b58160');r(x+1,y+1,6,s-2,'#e3b989');
    r(x-1,y+s,10,2,'#ccab81');r(x+2,y+s+2,4,2,'#7c7881');
    for(let i=0;i<3;i++){dot(x+2+i*2,y+2,'#ffe3b5')}
   }
   for(const [x,y] of [[10,8],[27,16],[13,36],[33,30]]){
    r(x,y,4,4,'#d6b77c');r(x+1,y+1,2,2,'#857a83');
    r(x+3,y+2,2,1,'#f2e2b8');
   }
   for(const [x,y] of [[6,8],[30,9],[20,45]])star(x,y,'#e4b78f');
  }
 }else if(shelf){
  r(0,0,48,28,'#29293e');r(1,2,46,24,art==='cedar'?'#9e785a':'#899dae');
  r(3,4,42,20,art==='cedar'?'#4d3940':'#3c5268');
  r(3,5,42,2,'#dbc19e');r(3,21,42,2,'#a38c85');
  if(art==='cedar'){
   for(let x=4;x<46;x+=8){
    l(x,17,x+5,8,'#bd906d');l(x+5,8,x+6,19,'#e7bd87');
    r(x+1,10,5,2,'#729275');r(x+2,14,5,2,'#91a77d');
    r(x+4,8,2,2,'#e0bc8a');r(x+6,18,3,3,'#c78c6a');
    dot(x+6,18,'#fff0ce');
   }
   for(const x of [8,20,31,42])star(x,19,'#f1ca8e');
  }else{
   for(let x=4;x<46;x+=8){
    l(x+2,19,x+5,7,'#cadce1');l(x+6,19,x+1,11,'#8abdc5');
    r(x,8,6,3,'#a8cad1');r(x+2,14,6,3,'#dde4e1');
    r(x+4,9,2,2,'#f5f5dc');r(x+1,18,3,3,'#79aeb7');
    dot(x+3,10,'#fffbe7');
   }
   r(4,5,40,1,'#d0d8d7');r(4,22,40,1,'#b3d0d2');
  }
 }else{
  r(5,37,23,2,'#434153');r(8,35,17,2,'#877880');
  if(art==='wolf'){
   r(10,30,16,5,'#57788b');r(12,28,13,4,'#a2b6c3');
   r(12,17,13,12,'#d8ded8');r(14,12,9,9,'#f2eee1');
   r(11,9,4,8,'#d0c7c1');r(21,9,5,8,'#dfd9d2');
   r(10,23,6,9,'#f0e7d8');r(22,23,5,9,'#ccd3d7');
   r(17,16,2,2,'#46899c');r(23,16,2,2,'#46899c');
   r(20,20,3,3,'#9a8d92');r(17,25,8,2,'#e3b989');
   l(12,17,25,33,'#bb966f');l(22,12,10,30,'#d5b38c');
   r(15,32,12,2,'#637886');star(23,25,'#f2d7ab');
  }else if(art==='pitcher'){
   r(10,31,17,5,'#617588');r(12,29,13,3,'#a4abb1');
   l(18,30,18,9,'#7a9f83');l(18,30,10,14,'#8eb49c');
   l(18,29,26,13,'#9aa67f');l(18,23,23,7,'#a2b68d');
   for(const [x,y,c] of [[8,18,'#a65d73'],[21,11,'#7caac4'],[13,8,'#e0a388'],[24,21,'#9b83b6']]){
    r(x,y,6,7,c);r(x+1,y-2,4,3,'#e5cfbc');
    r(x+2,y+2,2,4,'#385c69');dot(x+4,y+1,'#ffe6c9');
    l(x,y+1,x-2,y+6,'#9cc0a1');
   }
   for(const [x,y] of [[6,12],[28,8],[9,27],[28,26]])star(x,y,'#c9e2d8');
  }else if(art==='goldfish'){
   r(11,33,17,4,'#625768');r(13,30,13,4,'#a98a73');
   r(16,23,6,8,'#cfaf84');r(8,7,23,18,'#81b8c0');
   r(11,9,18,15,'#39657b');r(13,9,14,4,'#b2dad8');
   for(const [x,y] of [[12,13],[23,18]]){
    r(x,y,7,4,'#e6a072');r(x+1,y-1,5,3,'#f4c28a');
    r(x-3,y+1,4,2,'#e2a06c');dot(x+4,y,'#38475a');
   }
   r(17,17,5,5,'#e9ddba');r(18,16,3,3,'#fff2d3');
   for(const [x,y] of [[11,19],[28,13],[13,23]]){r(x,y,2,2,'#d5efed')}
   r(10,25,18,2,'#d8bea0');r(16,5,6,3,'#caa987');
   // Individually engraved brass bezel, swimming ripples and glass caustics.
   r(8,9,2,12,'#c4d7ca');r(29,9,2,12,'#a8c7c6');
   r(10,9,19,1,'#e6dab9');r(10,23,19,1,'#e6dab9');
   r(13,15,3,1,'#f4d19d');r(24,21,2,1,'#f5d6ad');
   r(15,27,8,1,'#edcc99');dot(19,31,'#fff0cc');
   for(const [x,y] of [[14,11],[21,14],[27,21],[12,22]])dot(x,y,'#e3f2e5');
   star(26,7,'#e6ded1');
  }else{
   r(10,8,20,24,'#7fabb1');r(12,10,16,21,'#34546e');
   r(14,7,12,4,'#bca186');r(16,5,8,3,'#927a74');
   r(16,30,9,5,'#8b817b');r(14,33,13,3,'#b3a18f');
   r(17,19,9,11,'#c7c5bb');r(20,13,4,7,'#e7e8d6');
   r(18,10,9,4,'#c8b8a0');r(18,21,7,2,'#7799ac');
   r(21,15,2,4,'#ffedd6');r(21,16,1,2,'#fff9e8');
   for(const [x,y] of [[12,23],[26,19],[14,27]]){
    r(x,y,4,4,'#548d84');r(x+1,y-3,2,4,'#91afa1');
   }
   for(const [x,y] of [[11,13],[28,12],[13,29]])dot(x,y,'#d4f1e9');
   r(11,9,2,19,'#afd4d5');
   // Micro shoreline, lighthouse masonry, water spray and convex glass highlights.
   r(15,27,9,1,'#c6bba4');r(17,25,5,1,'#93b5aa');
   r(19,18,1,6,'#a1b0b8');r(22,18,1,6,'#c5cdc5');
   r(15,30,13,1,'#77a9a9');r(12,32,14,1,'#bddad2');
   dot(17,14,'#f8eee0');dot(26,25,'#d6f4e9');
   r(12,12,2,8,'#c6e3e1');r(27,16,1,9,'#b0d9d4');
   star(9,16,'#a8d4d8');star(28,10,'#d7e1d7');
  }
 }
 return c;
}
const pixels=new Map(ITEMS.map(item=>[item.id,paint(item)]));
const ids=new Set([...old.items,...ITEMS].map(i=>i.id));
if(pixels.size!==16||ids.size!==120)throw Error('v0.34 must contain 16 unique added works');
const thumbs=new Map();
function thumbnail(id){
 if(thumbs.has(id))return thumbs.get(id);
 const canvas=pixels.get(id),value=canvas?canvas.toDataURL('image/png'):old.thumbnail(id);
 if(value)thumbs.set(id,value);
 return value;
}
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:Object.freeze([...old.items,...ITEMS]),slots:old.slots,quotas:old.quotas,
 texture:id=>pixels.get(id)||old.texture(id),thumbnail
});
})();