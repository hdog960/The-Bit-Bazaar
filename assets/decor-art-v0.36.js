/* Bit Bazaar v0.36 — 20 independently authored native-resolution pixel-art works.
 * 3 framed scenes, 4 sculptures, 3 plants, 3 lamps, 2 rugs,
 * 3 architectural features and 2 full physical shelf-fascia finishes.
 * Draw each at load and reuse original pixel texture in the renderer. */
(()=>{
'use strict';
const old=window.BIT_BAZAAR_DECOR;
if(!old||old.items.length!==140||old.slots.length!==220)
 throw Error('v0.36 gallery requires 140 old works and 220 immutable mounts');
const ITEMS=[
 {id:'clockwork-mariner',name:'The Clockwork Mariner',category:'Framed Art',mount:'wall',price:5,art:'mariner',
 description:'A little brass sailor pilots an emerald steamship through indigo waves and lighthouse beams beneath a constellation sky.'},
 {id:'greenhouse-postman',name:'The Greenhouse Postman',category:'Framed Art',mount:'wall',price:4,art:'postman',
 description:'A robin in a blue postal cap carries a sealed letter through a glass greenhouse filled with lush tomatoes and orchids.'},
 {id:'ruby-snowfall-orchestra',name:'Ruby Snowfall Orchestra',category:'Framed Art',mount:'wall',price:6,art:'orchestra',
 description:'Three woodland musicians perform on a tiny snow-covered stage while scarlet stars and frozen crystal flakes drift past.'},
 {id:'pewter-dragon-librarian',name:'Pewter Dragon Librarian',category:'Statues',mount:'floor',price:7,art:'dragon',
 description:'A small silver dragon curls around a tower of enchanted books, its emerald monocle resting against a copper snout.'},
 {id:'lighthouse-keeper-frog',name:'Lighthouse Keeper Frog',category:'Statues',mount:'floor',price:5,art:'frog',
 description:'A cheerful jade-green frog in a tiny yellow raincoat holds a storm lantern atop a plinth of glistening river stones.'},
 {id:'cobalt-phoenix-guardian',name:'Cobalt Phoenix Guardian',category:'Statues',mount:'floor',price:9,art:'phoenix',
 description:'A sapphire-feathered phoenix unfolds its shining wings above a charred obsidian nest, with amber feathers at its throat.'},
 {id:'honey-bear-clockmaker',name:'Honey Bear Clockmaker',category:'Statues',mount:'floor',price:4,art:'honeybear',
 description:'A little brown ceramic bear repairs a round gold pocket watch while balancing honey jars on a patterned wooden stool.'},
 {id:'aurora-lantern-fern',name:'Aurora Lantern Fern',category:'Plants',mount:'floor',price:4,art:'aurorafern',
 description:'Long icy fern fronds bend beneath three luminous turquoise seed lanterns in a pearly blue ceramic planter.'},
 {id:'volcanic-glass-orchid',name:'Volcanic Glass Orchid',category:'Plants',mount:'floor',price:6,art:'lavaorchid',
 description:'Midnight-black blossoms edged in orange lava grow from a jagged volcanic glass pot amid delicate silver root tendrils.'},
 {id:'raincloud-bonsai',name:'Raincloud Bonsai',category:'Plants',mount:'floor',price:5,art:'rainbonsai',
 description:'An ancient twisted bonsai shelters a miniature blue raincloud that drops glassy droplets onto its copper moss garden.'},
 {id:'jellyfish-cathedral-lantern',name:'Jellyfish Cathedral Lantern',category:'Lighting',mount:'floor',price:7,art:'jellycathedral',
 description:'A Gothic brass stand holds an ocean-blue stained-glass bell sheltering a tiny luminous jellyfish with streaming pale tendrils.'},
 {id:'meadow-moth-beacon',name:'Meadow Moth Beacon',category:'Lighting',mount:'floor',price:5,art:'mothbeacon',
 description:'A butterfly-shaped amber lamp glows with intricate emerald eyespots above a carved walnut stem and wildflower base.'},
 {id:'moon-lantern-express',name:'Moon Lantern Express',category:'Lighting',mount:'floor',price:6,art:'trainlamp',
 description:'A whimsical miniature steam locomotive lamp carries glowing glass moon globes along a narrow vertical brass rail.'},
 {id:'ember-honeycomb-rug',name:'Ember Honeycomb Rug',category:'Rugs',mount:'rug',price:3,art:'honeycomb',
 description:'A honey-colored woven carpet arranges hexagonal crimson petals around a central bee crest, bordered by tiny stitched flames.'},
 {id:'celestial-tea-path',name:'The Celestial Tea Path',category:'Rugs',mount:'rug',price:4,art:'teapath',
 description:'A teal tapestry traces stepping-stone teacups beneath crescent moons, silver tea leaves and constellations of tiny pearl dots.'},
 {id:'copper-observatory-window',name:'Copper Observatory Window',category:'Architecture',mount:'wall',price:7,art:'copperwindow',
 description:'A towering copper casement window looks across a star-clad observatory dome and a rising blue planet behind polished brass bars.'},
 {id:'bluebell-secret-door',name:'Bluebell Secret Door',category:'Architecture',mount:'wall',price:6,art:'bluebelldoor',
 description:'A deep violet fairy door hides among stone columns, copper ivy and midnight bluebells with a little illuminated keyhole.'},
 {id:'sunken-palace-arch',name:'Sunken Palace Arch',category:'Architecture',mount:'wall',price:8,art:'sunkenarch',
 description:'An ancient underwater stone arch holds a pearl throne, luminous sea grass and silver schools of fish through aqua glass.'},
 {id:'opal-wave-shelf-band',name:'Opal Wave Shelf Band',category:'Shelf Trims',mount:'shelf',price:5,art:'opalwave',
 description:'Pearlescent aqua shelf rails are inlaid with mirrored rolling wave crests, tiny coral dots and inset iridescent stones.'},
 {id:'embervine-copper-edge',name:'Embervine Copper Edge',category:'Shelf Trims',mount:'shelf',price:6,art:'embervine',
 description:'Dark winewood shelf lips hold twisting copper brambles, pointed amber leaves and little fire-red glass berries.'}
];
function paint(item){
 const framed=item.category==='Framed Art',arch=item.category==='Architecture',
  rug=item.mount==='rug',shelf=item.mount==='shelf';
 const w=shelf?48:rug||arch?40:32,h=shelf||rug?28:arch?48:40;
 const c=document.createElement('canvas');c.width=w;c.height=h;
 const g=c.getContext('2d',{alpha:!shelf});g.imageSmoothingEnabled=false;
 const r=(x,y,ww,hh,color)=>{g.fillStyle=color;g.fillRect(x,y,ww,hh)};
 const d=(x,y,color)=>r(x,y,1,1,color);
 const line=(x,y,xx,yy,color)=>{
  let dx=Math.abs(xx-x),dy=Math.abs(yy-y),sx=x<xx?1:-1,sy=y<yy?1:-1,err=dx-dy;
  for(;;){d(x,y,color);if(x===xx&&y===yy)break;
   const e=err*2;if(e>-dy){err-=dy;x+=sx}if(e<dx){err+=dx;y+=sy}
  }
 };
 const star=(x,y,a='#f4d8a3')=>{r(x-2,y,5,1,a);r(x,y-2,1,5,'#fff1cf')};
 const bez=(x,y,ww,hh,outer,inner)=>{r(x,y,ww,hh,outer);r(x+2,y+2,ww-4,hh-4,inner)};
 const a=item.art;
 if(framed){
  bez(0,0,32,40,'#44334a','#c8ab86');bez(3,3,26,34,'#f1d1a6','#304558');
  for(let y=5;y<36;y+=5){d(3,y,'#ffedc5');d(28,y,'#94656c')}
  if(a==='mariner'){
   r(5,5,22,30,'#2c3b64');r(5,25,22,10,'#34667a');
   for(let x=5;x<27;x+=4){line(x,28,x+3,27,'#82a6b1');r(x+1,32,3,1,'#89aebc')}
   r(7,22,18,5,'#a97b64');r(8,24,16,2,'#d2a684');
   r(10,17,10,6,'#9dbac0');r(12,14,7,5,'#e7d8b7');
   r(16,12,3,4,'#bd8e75');r(14,13,3,2,'#f8e2ba');
   r(16,18,3,4,'#6d8191');r(18,15,4,4,'#ab8d87');
   r(7,20,3,2,'#dfb480');r(22,22,3,2,'#f2d9a5');
   for(const [x,y] of [[8,10],[22,8],[24,17],[12,6]])star(x,y,'#d1c6d9');
   r(22,12,4,3,'#f1deb0');r(24,10,2,6,'#f4e1af');
   r(8,31,15,1,'#ccd4c8');line(23,14,22,29,'#b7bfc2');
  }else if(a==='postman'){
   r(5,5,22,30,'#45746c');r(5,27,22,8,'#8caf8e');
   r(7,8,18,18,'#abcdb5');r(9,9,14,16,'#6d9b84');
   for(const x of [8,14,20,26]){r(x,7,1,19,'#d4c29e');r(x+1,10,2,3,'#d5e8c8')}
   for(const [x,y] of [[8,15],[21,13],[11,25],[23,24]]){
    r(x,y,4,3,'#a5b479');r(x+1,y-2,2,3,'#dc878a');d(x+2,y-3,'#f5c2af');
   }
   r(11,21,13,10,'#866f67');r(12,17,11,7,'#b6b6ad');
   r(14,15,8,5,'#d4d2b7');r(15,13,6,2,'#6b93a7');
   r(17,22,2,2,'#3b5261');r(21,22,2,2,'#3b5261');
   r(15,25,7,2,'#e7d29f');line(17,28,13,31,'#c5baa3');
   r(21,27,5,3,'#f5dfbc');line(21,27,25,30,'#bd9c8b');
   for(const [x,y] of [[7,7],[25,10],[8,28]])star(x,y,'#e2d8b5');
  }else{
   r(5,5,22,30,'#564666');r(5,26,22,9,'#d1cbd2');
   r(8,19,16,9,'#aa777f');r(9,16,14,5,'#e8c3b0');
   for(const [x,y,tone] of [[9,21,'#93687e'],[16,20,'#b27b70'],[23,21,'#788da6']]){
    r(x,y,5,5,tone);r(x+1,y-3,3,4,'#e1bda5');
    r(x+1,y-5,2,3,'#bda29d');d(x+2,y-2,'#38475f');
    r(x+2,y+5,2,3,'#6a526a');
   }
   r(7,28,18,2,'#eee2dc');r(10,30,14,2,'#997680');
   line(8,18,10,9,'#dbb5ac');line(25,19,23,8,'#d6b5ad');
   for(const [x,y] of [[9,7],[19,8],[25,14],[13,12]])star(x,y,'#d7a6b4');
   for(let i=0;i<9;i++)d(6+(i*7)%20,9+(i*11)%22,'#e5e9e3');
  }
 }else if(arch){
  bez(0,0,40,48,'#34394b','#b1a197');bez(4,4,32,40,'#e3caa8','#364858');
  for(let y=6;y<44;y+=8){r(5,y,30,1,'#968787');r(8,y+1,2,6,'#af9c92')}
  if(a==='copperwindow'){
   r(10,8,20,34,'#243f62');r(12,11,16,26,'#456c9a');
   r(19,9,2,30,'#d0a884');r(11,24,18,2,'#dfbd8d');
   r(16,18,9,19,'#a6a9af');r(18,16,5,6,'#f3e5cc');
   r(20,12,3,5,'#c8b4aa');r(15,34,12,4,'#6e597b');
   r(17,27,2,3,'#f8dbac');r(22,29,3,3,'#f8dbac');
   for(const [x,y] of [[14,14],[25,13],[14,31],[26,34]])star(x,y,'#f3d1a5');
   r(8,40,23,3,'#cfb28f');r(11,7,19,2,'#c58e6e');
   r(23,7,5,7,'#c9d1d9');r(25,6,5,7,'#2b4267');
  }else if(a==='bluebelldoor'){
   r(10,8,20,33,'#483958');r(11,9,18,31,'#725d7b');
   r(14,12,12,28,'#323954');r(15,14,10,24,'#5b547d');
   r(24,24,2,3,'#ecd59f');r(25,25,1,1,'#fff1bd');
   for(const [x,y] of [[8,10],[30,13],[7,30],[31,31],[11,23]]){
    line(x,y,x+4,y+9,'#648c7b');r(x+2,y+3,5,3,'#987cb4');
    r(x+3,y+1,3,3,'#c9aad4');d(x+4,y+2,'#efcee4');
   }
   r(10,39,20,3,'#938183');r(13,6,15,3,'#b89f84');
   for(const [x,y] of [[16,8],[28,8],[12,36]])star(x,y,'#e2b7d0');
   r(14,27,2,11,'#b8a0a6');r(27,15,2,22,'#8d728e');
  }else{
   r(9,10,23,31,'#3e687b');r(12,13,18,25,'#74b0a9');
   r(15,25,10,11,'#9fbaa9');r(17,22,7,6,'#e2d7b7');
   r(18,26,5,7,'#c7b898');r(14,35,15,3,'#c9b69e');
   for(const [x,y] of [[9,15],[26,12],[10,31],[28,29]]){
    r(x,y,6,3,'#538e8b');r(x+1,y-2,4,3,'#a7ccb5');
    r(x+3,y+3,3,2,'#7ea2a0');
   }
   for(const [x,y] of [[12,17],[27,24],[21,9]]){
    r(x,y,4,2,'#dfe9d2');r(x+2,y,1,1,'#496c81');
   }
   r(10,8,18,2,'#9cabaa');r(11,39,18,2,'#738e94');
   star(16,13,'#f7e7be');star(30,20,'#d9e9e0');
  }
 }else if(rug){
  bez(0,0,40,28,'#323548','#e1c99b');
  r(3,3,34,22,a==='honeycomb'?'#8c5955':'#356278');
  for(let x=4;x<36;x+=5){d(x,2,'#f0d19f');d(x,25,'#e3b888')}
  for(let y=4;y<24;y+=5){d(2,y,'#d8a488');d(37,y,'#d8a488')}
  if(a==='honeycomb'){
   for(let y=5;y<24;y+=6)for(let x=6;x<35;x+=7){
    line(x+1,y,x+4,y,'#efc986');line(x+4,y,x+6,y+3,'#efc986');
    line(x+6,y+3,x+4,y+5,'#edb17d');line(x+4,y+5,x+1,y+5,'#edb17d');
    line(x+1,y+5,x-1,y+3,'#f7db9e');line(x-1,y+3,x+1,y,'#f7db9e');
    r(x+2,y+2,3,2,'#b56c68');
   }
   r(17,10,7,8,'#ebd3a0');r(19,11,3,6,'#66506c');
   r(15,13,10,2,'#d6a278');r(16,15,8,2,'#d6a278');
   star(20,7,'#f5d7a5');
  }else{
   for(const [x,y] of [[8,7],[29,7],[12,19],[28,20],[19,13]]){
    r(x,y,7,4,'#e0c29c');r(x+1,y+1,5,2,'#e9e5c6');
    r(x+2,y+4,3,2,'#8cb4b3');d(x+3,y+1,'#4b7d90');
   }
   line(8,23,31,5,'#a3b8af');line(8,5,31,23,'#6e9aa4');
   for(const [x,y] of [[6,10],[20,7],[34,15],[12,22]])star(x,y,'#d6e2d7');
   r(18,10,5,4,'#eac69f');r(19,11,3,2,'#fff5dc');
  }
 }else if(shelf){
  r(0,0,48,28,'#2b2a3e');r(1,2,46,24,a==='opalwave'?'#4e8a9a':'#7d4957');
  r(3,4,42,20,a==='opalwave'?'#2d6477':'#42374b');
  r(3,5,42,2,'#e9c5a1');r(3,21,42,2,'#cfa895');
  if(a==='opalwave'){
   for(let x=4;x<45;x+=7){
    line(x,17,x+4,9,'#b5e1dc');line(x+4,9,x+7,17,'#93b9d0');
    r(x+1,16,5,3,'#81b3ba');r(x+3,12,3,3,'#e2efde');
    d(x+3,13,'#fff9e6');r(x+2,8,3,2,'#c6dfc8');
   }
   for(const [x,y] of [[8,10],[24,9],[39,17]])star(x,y,'#d1e9db');
  }else{
   for(let x=4;x<45;x+=7){
    line(x,18,x+6,9,'#d89e73');line(x+6,9,x+6,19,'#be7f70');
    r(x+1,11,4,2,'#b27c68');r(x+2,14,4,2,'#e8b98a');
    r(x+5,9,3,3,'#d57a75');d(x+6,10,'#ffd8a8');
    r(x+1,19,3,2,'#c29072');
   }
   r(4,6,40,1,'#edc598');r(4,20,40,1,'#d5a27e');
  }
 }else{
  r(4,37,24,2,'#434254');r(8,34,16,3,'#857a87');
  if(a==='dragon'){
   r(9,30,17,5,'#8e8189');r(11,27,15,5,'#c0a3a0');
   r(12,16,14,13,'#9fb3bc');r(15,11,10,9,'#d8d5c8');
   r(16,7,8,5,'#d4c9c0');r(22,9,5,3,'#cab19e');
   r(10,14,7,8,'#889db0');r(12,17,5,5,'#c4d0cd');
   r(14,23,11,4,'#7c98a2');d(22,13,'#3c877b');
   r(14,25,10,3,'#b88c79');r(16,28,11,3,'#665f71');
   for(const [x,y] of [[9,27],[11,24],[8,21]]){
    r(x,y,8,2,'#8a7081');r(x+1,y-2,5,2,'#d7bb98');
   }
   r(6,28,6,4,'#c6b093');
   // Etched book covers, glinting monocle and hand-tooled copper scale edges.
   for(const [x,y,t] of [[8,18,'#a78685'],[9,23,'#6f8295'],[7,27,'#bb9d82']]){
    r(x,y,7,2,t);r(x+1,y-2,5,2,'#d5bb9d');
    d(x+4,y-1,'#faf0d4');
   }
   r(19,12,5,4,'#d4bd91');r(20,13,3,2,'#71af99');
   d(23,14,'#f7e0ae');line(25,15,28,20,'#cba37e');
   for(const [x,y] of [[13,18],[16,21],[24,24],[18,28]]){
    r(x,y,3,1,'#edf0d7');d(x+2,y+1,'#d8c9a3');
   }
   star(28,8,'#edcfa4');
  }else if(a==='frog'){
   r(9,31,20,5,'#5e687a');r(12,29,15,4,'#b7a78c');
   r(12,19,14,12,'#6b9b70');r(13,11,13,12,'#8cb484');
   r(13,8,5,6,'#aec99b');r(21,8,5,6,'#aec99b');
   r(15,11,3,2,'#fff3d1');r(22,11,3,2,'#fff3d1');
   d(16,12,'#30445a');d(23,12,'#30445a');
   r(17,18,7,2,'#d4b599');r(13,23,14,7,'#e5c388');
   r(14,25,12,5,'#c49a73');r(16,31,11,2,'#73918a');
   r(8,23,6,3,'#6c957a');line(10,23,8,28,'#f2ca8d');
   r(6,27,7,6,'#b29076');r(8,27,4,5,'#f8dba0');
   r(10,7,13,3,'#d9bc8e');
   // Coat toggles, painted webbed feet and a halo around the glass lantern.
   for(const [x,y] of [[17,24],[17,27],[22,25]])d(x,y,'#fff1d2');
   line(12,27,10,34,'#d9b58b');line(25,28,26,34,'#d9b58b');
   r(7,26,7,1,'#f8e4b1');r(6,33,7,1,'#ebc69c');
   star(28,18,'#f1d6a7');
  }else if(a==='phoenix'){
   r(11,32,17,4,'#554f67');r(13,29,14,4,'#84737a');
   r(13,17,14,15,'#5275a4');r(16,11,10,11,'#8db8d0');
   r(17,7,8,6,'#c9d8d5');r(24,10,6,3,'#d5ae7a');
   d(23,10,'#305a6e');r(10,23,7,6,'#557ea3');
   r(7,14,8,11,'#4f86b2');r(5,10,8,10,'#7bb0bd');
   r(24,15,7,11,'#3978a4');r(27,11,7,12,'#8bbdc9');
   for(const [x,y] of [[6,14],[10,9],[27,11],[32,18]]){
    r(x,y,4,3,'#c4d8bc');r(x+1,y-2,3,3,'#e8cf93');
   }
   r(19,22,5,11,'#dfae79');r(15,28,3,5,'#dba882');
   for(const [x,y] of [[8,14],[10,17],[30,15],[29,20],[19,25],[21,27]]){
    r(x,y,2,3,'#8ab6c6');d(x+1,y+1,'#fbefbc');
   }
   r(13,31,12,1,'#ddbb94');r(16,29,4,2,'#f6dbae');
   star(9,6,'#eac58d');star(29,8,'#eac58d');
  }else if(a==='honeybear'){
   r(11,30,17,6,'#856b66');r(13,27,14,4,'#a08776');
   r(12,17,16,12,'#ae8163');r(13,11,13,11,'#bd9474');
   r(12,10,5,5,'#a87b65');r(23,10,5,5,'#a87b65');
   r(16,15,2,2,'#354357');r(23,15,2,2,'#354357');
   r(18,18,6,3,'#e6c09c');r(20,19,2,1,'#5c4e59');
   r(12,23,7,6,'#d4a987');r(22,23,7,6,'#d4a987');
   r(9,27,9,4,'#d9b77a');r(10,25,7,3,'#f6d89d');
   r(16,27,10,5,'#c8b493');r(18,28,6,3,'#ffedc1');
   line(21,28,22,26,'#74647a');d(21,29,'#3c5365');
   r(12,32,16,2,'#b68a6c');
   for(const [x,y] of [[10,29],[15,30],[25,29]]){
    r(x,y,3,2,'#9c746f');d(x+1,y,'#e4c590');
   }
   r(18,28,6,1,'#8e7f82');r(13,8,15,1,'#c9a98d');
   star(28,10,'#f0c994');
  }else if(a==='aurorafern'){
   r(11,31,17,5,'#63768e');r(13,28,13,4,'#a8c4c6');
   for(const [x,y] of [[11,13],[19,7],[28,12]]){
    line(19,29,x+1,y,'#719d98');
    for(let yy=y;yy<26;yy+=4){
     r(x-2,yy,6,2,'#77aab2');r(x,yy-2,3,2,'#b1d6bf');
    }
    r(x-1,y-4,5,5,'#8acfc1');r(x,y-5,3,4,'#e2efc9');
    d(x+1,y-3,'#fff6db');
   }
   r(15,33,10,2,'#dfcaa8');r(11,27,17,2,'#598b96');
   for(const [x,y] of [[7,9],[27,8],[9,25]])star(x,y,'#c2e8d8');
  }else if(a==='lavaorchid'){
   r(10,31,17,5,'#514958');r(13,29,12,3,'#8a6074');
   line(19,29,18,9,'#7c9a83');line(19,22,10,13,'#9ea68e');
   line(19,22,27,15,'#a1a38c');line(18,16,24,7,'#b89d88');
   for(const [x,y] of [[7,12],[22,8],[25,17],[12,22]]){
    r(x,y,8,5,'#5d5268');r(x+1,y-2,6,3,'#d77d6b');
    r(x+2,y-3,4,3,'#f4b57d');d(x+4,y,'#ffddb3');
    r(x+3,y+5,2,3,'#946f72');
   }
   r(13,32,14,2,'#c39b80');r(12,28,17,2,'#6f6977');
   for(const [x,y] of [[6,7],[29,11],[9,26]])star(x,y,'#edbf8a');
  }else if(a==='rainbonsai'){
   r(10,31,18,5,'#6d6577');r(12,28,14,3,'#a8a4a2');
   line(18,29,18,14,'#957f70');line(18,21,9,16,'#ac8e79');
   line(18,17,27,13,'#c6a889');
   r(6,10,12,5,'#648e7b');r(9,8,10,4,'#a5c99d');
   r(19,9,12,5,'#638d88');r(21,7,9,4,'#a6c2b1');
   r(13,5,14,4,'#8eaebe');r(15,3,10,3,'#c4d3d4');
   for(const [x,y] of [[11,11],[16,17],[23,18],[27,23]]){
    r(x,y,2,3,'#b8dbe0');d(x,y+3,'#f1f1df');
   }
   r(13,30,14,2,'#d3bc9b');d(20,12,'#fff5da');
   for(const [x,y] of [[8,8],[30,16],[6,23]])star(x,y,'#c5dbd8');
  }else if(a==='jellycathedral'){
   r(11,33,17,4,'#68617c');r(14,28,12,5,'#b59e8f');
   r(17,21,6,8,'#c8b092');r(8,8,24,16,'#718fa9');
   r(10,11,20,12,'#3f718a');r(13,10,14,7,'#a1c6cc');
   r(15,12,10,4,'#e2e8d8');r(17,14,6,7,'#bfd7da');
   r(18,15,4,4,'#fff4d6');
   for(const x of [15,18,22,25]){
    line(x,20,x+(x%2?2:-2),25,'#a9cfd2');
   }
   r(9,8,22,3,'#c0a990');r(16,5,8,3,'#eccb9c');
   for(const [x,y] of [[7,12],[30,17],[10,26]])star(x,y,'#b2e6e0');
  }else if(a==='mothbeacon'){
   r(11,33,17,4,'#6c6879');r(14,27,11,6,'#a17d67');
   r(16,20,7,8,'#c6a180');r(18,10,4,12,'#e0c09b');
   r(6,10,12,9,'#6b907b');r(23,10,10,9,'#7ba58a');
   r(7,12,9,10,'#d8bc91');r(24,12,8,10,'#e7cd9b');
   r(9,13,4,4,'#a57f77');r(26,13,4,4,'#a57f77');
   r(17,11,5,12,'#b38b7a');r(19,12,2,9,'#fff0c7');
   line(18,10,15,5,'#d9ad8d');line(22,10,25,5,'#d9ad8d');
   for(const [x,y] of [[10,16],[27,16],[13,20],[25,21]]){
    d(x,y,'#fff2cd');r(x,y+2,2,1,'#c39a85');
   }
   r(19,29,5,2,'#bca589');r(12,33,14,1,'#dfcbb5');
   for(const [x,y] of [[9,10],[30,9],[8,24]])star(x,y,'#e8d59c');
  }else{
   r(10,33,19,4,'#62576d');r(14,25,13,8,'#ad8e7b');
   r(17,16,7,10,'#cdb08f');r(9,11,22,7,'#537e91');
   r(12,9,18,5,'#acbfbd');r(15,5,10,5,'#e4d5b1');
   r(18,6,5,4,'#fff3ce');r(17,18,8,4,'#748da2');
   for(const [x,y] of [[9,19],[13,21],[24,22]]){
    r(x,y,4,3,'#c58b70');r(x+1,y-2,3,3,'#f4c792');
    r(x+2,y,2,1,'#fff3d2');
   }
   r(14,27,12,2,'#e5c393');r(11,31,17,2,'#b88c77');
   for(const [x,y] of [[7,8],[31,12],[8,27]])star(x,y,'#f1d2a6');
  }
 }
 return c;
}
const paintings=new Map(ITEMS.map(i=>[i.id,paint(i)]));
if(paintings.size!==20||new Set([...old.items,...ITEMS].map(i=>i.id)).size!==160)
 throw Error('v0.36 must add twenty original nonduplicated gallery items');
const thumbs=new Map();
function thumbnail(id){
 if(thumbs.has(id))return thumbs.get(id);
 const image=paintings.get(id),url=image?image.toDataURL('image/png'):old.thumbnail(id);
 if(url)thumbs.set(id,url);
 return url;
}
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:Object.freeze([...old.items,...ITEMS]),slots:old.slots,quotas:old.quotas,
 texture:id=>paintings.get(id)||old.texture(id),thumbnail
});
})();