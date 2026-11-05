/* Bit Bazaar v0.35 — twenty original, handcrafted pixel-art collector decorations.
 * Individual scene silhouettes, never palette-swapped duplicate drawings.
 * Canvases are 32x40, 40x48, 40x28 or 48x28, rendered once at startup.
 * The original 120 IDs and 202 mounts are immutable. */
(()=>{
'use strict';
const old=window.BIT_BAZAAR_DECOR;
if(!old||old.items.length!==120||old.slots.length!==202)
 throw Error('v0.35 gallery needs 120 existing works and 202 preserved sites');
const ITEMS=[
 {id:'cloudberry-clockmaker',name:'The Cloudberry Clockmaker',category:'Framed Art',mount:'wall',price:4,art:'clockmaker',
 description:'In a lamplit cloudberry workshop, an old watchmaker repairs giant copper clocks while ruby berries hang in the window.'},
 {id:'iridescent-tidepool',name:'The Iridescent Tidepool',category:'Framed Art',mount:'wall',price:5,art:'tidepool',
 description:'A crescent-shaped rock pool shelters a pastel sea star, bioluminescent shells and two little fish beneath rose-colored waves.'},
 {id:'lantern-fox-letter',name:"The Lantern Fox's Letter",category:'Framed Art',mount:'wall',price:3,art:'foxletter',
 description:'A winter fox with a knitted indigo scarf carries a sealed letter toward a snowbound cabin glowing softly between the pines.'},
 {id:'wandering-brass-automaton',name:'Wandering Brass Automaton',category:'Statues',mount:'floor',price:7,art:'automaton',
 description:'A friendly antique clockwork traveler holds an emerald lantern, with visible knee gears and a little compass inside its chest.'},
 {id:'moonstone-crane-guardian',name:'Moonstone Crane Guardian',category:'Statues',mount:'floor',price:6,art:'crane',
 description:'A silver-legged long-necked crane stands on a midnight-blue plinth holding a pale moonstone beneath its polished golden beak.'},
 {id:'obsidian-stag-reliquary',name:'Obsidian Stag Reliquary',category:'Statues',mount:'floor',price:9,art:'stag',
 description:'A black volcanic-glass stag rears among twisted amber roots, its magnificent gold-edged antlers carrying seven tiny stars.'},
 {id:'marmalade-baker',name:'The Marmalade Baker',category:'Statues',mount:'floor',price:4,art:'baker',
 description:'A round ginger cat in a floury apron offers a tray of miniature berry pastries from a beautifully painted clay pedestal.'},
 {id:'sapphire-weeping-willow',name:'Sapphire Weeping Willow',category:'Plants',mount:'floor',price:5,art:'willow',
 description:'A miniature cerulean willow pours blue-green leaves over an iridescent garden urn, with a copper bird perched in the branches.'},
 {id:'amberwort-terrarium',name:'Amberwort Terrarium',category:'Plants',mount:'floor',price:4,art:'amberwort',
 description:'A hexagonal glasshouse protects tiny amber mushrooms, fluorescent ferns and luminous honey-colored insects.'},
 {id:'starlit-lotus-basin',name:'Starlit Lotus Basin',category:'Plants',mount:'floor',price:6,art:'lotus',
 description:'A wide glazed moonstone bowl holds an opening pink lotus, tiny silver koi and dark water reflecting the night sky.'},
 {id:'butterfly-lampstand',name:'Butterfly Lampstand',category:'Lighting',mount:'floor',price:5,art:'butterfly',
 description:'A copper floor stand supports a luminous stained-glass butterfly with sapphire wings and pale coral filigree.'},
 {id:'midnight-lighthouse-lamp',name:'Midnight Lighthouse Lamp',category:'Lighting',mount:'floor',price:7,art:'beaconlamp',
 description:'A tall iron lighthouse lantern turns an amber beam through engraved cobalt glass above a weathered brass base.'},
 {id:'lavender-firefly-tree',name:'Lavender Firefly Tree',category:'Lighting',mount:'floor',price:6,art:'fireflytree',
 description:'A slim, glowing purple-blossom tree grows from a gilded planter, each tiny leaf glowing with captured fireflies.'},
 {id:'copper-sun-clock-lamp',name:'Copper Sun Clock Lamp',category:'Lighting',mount:'floor',price:8,art:'sunclock',
 description:'An ornate antique lamp combines a twelve-point copper sun, a working-looking clock face and sparkling amber spokes.'},
 {id:'cobalt-harlequin-mosaic',name:'Cobalt Harlequin Mosaic',category:'Rugs',mount:'rug',price:3,art:'harlequin',
 description:'A blue-and-apricot checker tapestry forms interlocked diamonds around a brilliant sunburst, with gold braided fringe.'},
 {id:'rainforest-arch-window',name:'Rainforest Arch Window',category:'Architecture',mount:'wall',price:7,art:'junglewindow',
 description:'A carved sandstone arched window shows a wild jungle canopy, spiral vines, crimson birds and a distant waterfall.'},
 {id:'golden-astral-mirror',name:'Golden Astral Mirror',category:'Architecture',mount:'wall',price:8,art:'astralmirror',
 description:'A baroque golden mirror reflects a shifting purple star field framed with twelve tiny zodiac petals and moonstone gems.'},
 {id:'crystalline-dragonfly-chandelier',name:'Crystalline Dragonfly Chandelier',category:'Ceilings',mount:'ceiling',price:10,art:'dragonfly',
 description:'A delicate brass chandelier suspends three enormous azure crystal dragonflies from a tiered silver moon ring.'},
 {id:'frostwalnut-silver-filigree',name:'Frostwalnut Silver Filigree',category:'Shelf Trims',mount:'shelf',price:5,art:'frostwalnut',
 description:'Walnut display rails are carved into icy branches and embroidered with silver fern tendrils and powdered moonstone buds.'},
 {id:'sleeping-sea-globe',name:'The Sleeping Sea Globe',category:'Curios',mount:'floor',price:6,art:'seaglobe',
 description:'An intricate marine globe traps a sleeping coral-colored seahorse above an ancient shipwreck and glowing sapphire anemones.'}
];
function paint(item){
 const isFrame=item.category==='Framed Art',isArch=item.category==='Architecture',
  isRug=item.mount==='rug',isCeil=item.mount==='ceiling',isShelf=item.mount==='shelf';
 const w=isShelf?48:isRug||isCeil||isArch?40:32,
  h=isShelf||isRug?28:isCeil||isArch?48:40;
 const c=document.createElement('canvas');c.width=w;c.height=h;
 const g=c.getContext('2d',{alpha:!isShelf});g.imageSmoothingEnabled=false;
 const p=(x,y,ww,hh,color)=>{g.fillStyle=color;g.fillRect(x,y,ww,hh)};
 const dot=(x,y,color)=>p(x,y,1,1,color);
 const line=(x,y,xx,yy,color)=>{
  let dx=Math.abs(xx-x),dy=Math.abs(yy-y),sx=x<xx?1:-1,sy=y<yy?1:-1,err=dx-dy;
  for(;;){
   dot(x,y,color);if(x===xx&&y===yy)break;
   const e=err*2;if(e>-dy){err-=dy;x+=sx}if(e<dx){err+=dx;y+=sy}
  }
 };
 const star=(x,y,a='#f7d79e',b='#fff2d5')=>{p(x-2,y,5,1,a);p(x,y-2,1,5,b)};
 const box=(x,y,ww,hh,a,b)=>{p(x,y,ww,hh,a);p(x+2,y+2,ww-4,hh-4,b)};
 const art=item.art;
 if(isFrame){
  box(0,0,32,40,'#413146','#a78c6b');box(3,3,26,34,'#eccda4','#30465b');
  p(3,5,1,30,'#ffe4b7');p(28,5,1,30,'#825b63');
  for(let y=7;y<35;y+=7){dot(2,y,'#f8d4ab');dot(29,y,'#d3aa8b')}
  if(art==='clockmaker'){
   p(5,7,22,28,'#5a4b65');p(5,27,22,8,'#604b56');
   for(const [x,y,s] of [[9,12,8],[20,10,6],[21,20,7]]){
    box(x-s/2,y-s/2,s,s,'#b98b70','#f2ddad');
    p(x,y-2,1,5,'#755c64');p(x,y,3,1,'#b27e70');
    for(const [dx,dy] of [[0,-3],[3,0],[0,3],[-3,0]])dot(x+dx,y+dy,'#7a7881');
   }
   p(9,24,10,8,'#b48973');p(11,19,7,6,'#e2bb93');
   p(10,18,11,2,'#5d5264');p(12,24,2,2,'#493c55');
   p(18,25,6,4,'#e4b28a');p(22,27,3,2,'#f7d9af');
   p(6,30,21,2,'#c29474');p(7,32,20,1,'#e8c398');
   for(const [x,y] of [[7,8],[24,7],[25,29]]){p(x,y,3,2,'#c17b77');p(x+1,y-2,2,2,'#e7a889')}
   line(10,22,15,16,'#ead3ac');star(23,13,'#f7bd84');
  }else if(art==='tidepool'){
   p(5,5,22,30,'#658fa3');p(5,24,22,11,'#d2ad92');
   p(7,11,18,17,'#528496');p(9,13,14,13,'#3f7189');
   for(const [x,y] of [[9,10],[21,9],[10,26],[23,25]]){p(x,y,4,2,'#e6b8a5');p(x+1,y+2,2,2,'#c78e91')}
   for(const [x,y] of [[11,17],[18,23]]){star(x,y,'#e4a1af','#f8d5c3');p(x+1,y,2,2,'#cf798e')}
   p(13,17,7,4,'#e1b894');p(15,16,4,3,'#f5d9ac');
   p(7,28,19,3,'#c6a388');p(11,30,12,2,'#edd3bb');
   for(const [x,y] of [[12,12],[21,15],[8,21],[23,20]]){p(x,y,2,3,'#bad7d0');dot(x+1,y,'#fff3d2')}
   line(6,29,25,27,'#f6dcb3');p(10,7,12,2,'#bfcfda');star(23,7,'#f2e2bd');
  }else if(art==='foxletter'){
   p(5,5,22,30,'#547188');p(5,26,22,9,'#d6dfda');
   for(const [x,y] of [[7,10],[22,8],[25,18],[9,24]]){p(x,y,2,13,'#466576');p(x-2,y+1,6,3,'#88a7a7');p(x-1,y-2,4,3,'#b2cacc')}
   p(18,19,9,10,'#815a62');p(19,17,7,3,'#d0adb1');p(21,23,3,4,'#ffdeb1');
   p(9,27,12,5,'#b9785d');p(11,23,9,6,'#d89a67');
   p(11,21,3,4,'#b36c5d');p(17,21,3,3,'#a66559');
   p(19,25,4,2,'#f4cea6');dot(18,25,'#32425d');
   p(12,29,6,2,'#3c5878');p(14,28,2,3,'#92aec1');
   p(8,30,5,2,'#ddbb8f');p(21,28,4,3,'#e1c5a1');
   for(const [x,y] of [[7,8],[17,6],[25,14],[11,17]]){p(x,y,1,2,'#f9f6e6');dot(x+1,y+2,'#f7e9d6')}
   p(18,29,5,2,'#f0e2c9');p(19,30,3,1,'#b47e75');
  }
 }else if(isArch){
  box(0,0,40,48,'#333146','#b9a18b');box(4,4,32,40,'#e1c8ad','#344955');
  for(let y=7;y<44;y+=9){p(5,y,29,1,'#ac9b8e');p(8,y+1,2,6,'#a58d88')}
  if(art==='junglewindow'){
   p(10,9,20,32,'#3b6d72');p(11,11,18,27,'#7cb4a4');
   for(const [x,y,w0] of [[9,14,11],[19,10,10],[10,28,11],[23,27,10]]){
    p(x,y,w0,4,'#3f866b');p(x+1,y-3,w0-3,4,'#6ea67a');
    p(x+3,y+4,3,5,'#335e64');
   }
   p(17,14,6,24,'#c9e9dc');p(19,18,3,20,'#f9efe4');
   p(15,32,10,6,'#5b9bb0');p(16,35,8,2,'#d4e6d4');
   for(const [x,y] of [[13,17],[26,23],[9,31]]){
    p(x,y,5,3,'#b86a6e');p(x+2,y-2,4,3,'#e5b08e');dot(x+3,y,'#323b59');
   }
   line(10,10,29,35,'#738d74');line(31,11,9,39,'#7eb48d');
   p(19,8,2,33,'#d5b78d');p(9,23,22,2,'#d5b78d');
   star(23,9,'#e4d1aa');
  }else{
   p(10,8,20,31,'#a38470');p(12,10,16,27,'#443d6e');
   for(let y=13;y<35;y+=5){p(13,y,14,1,'#69618c');p(16,y+2,8,1,'#8185a4')}
   p(18,11,5,6,'#dfddce');p(20,9,5,7,'#443d6e');
   for(let i=0;i<12;i++){
    const theta=i*Math.PI/6,x=Math.round(20+12*Math.cos(theta)),y=Math.round(23+15*Math.sin(theta));
    star(x,y,'#d5b58c','#fff0bc');
   }
   p(12,39,16,3,'#dfc292');p(15,7,10,3,'#d2aa80');
   p(18,21,4,4,'#e0caad');p(19,22,2,2,'#fff5c8');
   p(9,15,2,21,'#c59f7b');p(29,15,2,21,'#c59f7b');
   line(12,12,28,32,'#a18daf');line(28,12,12,32,'#70619a');
   for(const [x,y] of [[9,9],[31,10],[9,38],[30,39]])p(x,y,3,2,'#f2d5b1');
  }
 }else if(isRug){
  box(0,0,40,28,'#302e42','#e0c49b');p(3,3,34,22,'#355575');
  for(let x=4;x<37;x+=5){dot(x,2,'#f9e6b8');dot(x,25,'#e1b588')}
  for(let y=4;y<25;y+=5){dot(2,y,'#f8d4a3');dot(37,y,'#f8d4a3')}
  for(let y=4;y<24;y+=4)for(let x=4;x<36;x+=4){
   p(x,y,4,4,(Math.round((x+y)/4)%2)?'#b57970':'#7d9bb1');
   p(x+1,y+1,2,2,(Math.round((x+y)/4)%2)?'#f0d1a2':'#d1e6d5');
  }
  for(let i=0;i<6;i++){
   const x=10+i*4;line(x,8,20,14,'#e7c297');line(20,14,x,20,'#f1d7ac');
  }
  p(17,11,6,6,'#ddba87');p(19,13,2,2,'#fff2c8');
  for(const [x,y] of [[7,7],[33,7],[7,21],[33,21]])star(x,y,'#edcf9f','#f8ebd6');
 }else if(isCeil){
  p(19,0,2,10,'#b4b2b3');p(16,4,8,2,'#f1debe');
  p(8,11,24,3,'#8c9cad');p(10,10,20,2,'#d4b69e');
  for(const [x,y,wings] of [[3,19,'#98c7cf'],[21,25,'#a5bcd8'],[8,38,'#77b5b7']]){
   line(x+7,13,x+7,y,'#d0c3b4');
   p(x,y+2,17,4,wings);p(x+2,y-2,13,5,'#d6e9de');
   p(x+7,y-4,3,14,'#b4a5b5');
   p(x+1,y+5,5,2,'#9ebad0');p(x+11,y+5,5,2,'#94b8c9');
   p(x+8,y+1,2,4,'#5d7894');dot(x+9,y+1,'#fef2ce');
   for(const xx of [x+2,x+14])dot(xx,y+3,'#fff7d7');
  }
  p(17,8,6,4,'#a89eac');p(18,8,4,3,'#fff0c8');
  for(const [x,y] of [[6,8],[31,10],[20,19],[33,39]])star(x,y,'#d8d4ce','#f9efdd');
 }else if(isShelf){
  p(0,0,48,28,'#27263a');p(1,2,46,24,'#8a756d');
  p(3,4,42,20,'#3a3e4e');p(3,6,42,2,'#c7b3a4');
  p(3,21,42,2,'#bb9f96');
  for(let x=5;x<46;x+=7){
   line(x,18,x+6,9,'#b5c7d3');
   line(x+6,9,x+7,18,'#e1d7cd');
   p(x+1,14,4,2,'#8ca1a5');p(x+3,12,3,2,'#cfdae0');
   p(x+5,8,3,3,'#eae9d6');dot(x+6,9,'#fff9e7');
   p(x+2,19,4,1,'#e2c1a7');p(x,7,2,2,'#8995a8');
  }
  for(const [x,y] of [[8,9],[23,12],[39,10],[15,20]])star(x,y,'#d6e3e4','#fff7e1');
 }else{
  // Deliberately distinct upright object silhouettes with grounded bases.
  p(4,37,24,2,'#343846');p(8,35,17,2,'#887b88');
  if(art==='automaton'){
   p(12,30,15,5,'#7e6270');p(15,25,3,8,'#a18d77');p(23,25,3,8,'#9a7c75');
   p(13,16,13,12,'#ad8572');p(15,19,10,6,'#e3b48a');
   p(15,10,10,8,'#bca48b');p(17,8,7,3,'#d8bb94');
   p(18,12,2,2,'#6ea7a2');p(23,12,2,2,'#6ea7a2');
   p(19,17,4,4,'#7b887b');p(20,18,2,2,'#f4dfb3');
   p(9,20,5,3,'#c69b7a');line(11,21,8,29,'#e1b38b');
   p(7,27,7,6,'#4e887e');p(8,28,5,4,'#c5e1ae');
   p(9,29,3,2,'#f9f0bf');p(22,22,5,3,'#c19a79');
   for(const [x,y] of [[16,27],[24,27]]){p(x,y,4,4,'#686b75');dot(x+1,y+1,'#e3c48b')}
   p(12,33,15,2,'#b0a28c');star(27,7,'#f9dba9');
  }else if(art==='crane'){
   p(12,31,15,5,'#525d80');p(15,26,12,4,'#8a9db2');
   line(17,27,20,13,'#dfddd1');line(24,27,22,13,'#cbd8dd');
   p(16,11,9,14,'#d2dce0');p(15,9,7,7,'#eff0df');
   p(18,7,6,5,'#f7e7d2');p(24,9,5,2,'#d9b17b');
   dot(23,9,'#3b5665');p(14,19,13,5,'#9aaeb6');
   p(9,23,8,6,'#a5b9be');p(10,22,5,4,'#d5d9ce');
   for(const [x,y] of [[12,19],[20,23],[8,29]]){p(x,y,3,2,'#f0e2c3')}
   p(14,32,12,2,'#d3b48d');p(13,34,14,1,'#718ca7');
   for(const [x,y] of [[6,10],[27,17]])star(x,y,'#d0d2cb');
  }else if(art==='stag'){
   p(11,31,17,5,'#545267');p(14,29,12,3,'#9b8068');
   p(12,20,16,12,'#383447');p(14,14,12,12,'#504353');
   p(16,8,9,10,'#5d5063');p(18,16,2,2,'#e6c692');p(24,15,2,2,'#e6c692');
   p(19,19,5,3,'#a58b79');p(12,26,4,8,'#5e5061');
   p(25,26,4,8,'#3d3e56');
   line(18,10,9,3,'#e5bd8e');line(22,10,30,3,'#d7b086');
   line(10,4,6,12,'#e1bb90');line(13,6,11,1,'#d9af87');
   line(27,5,33,11,'#e1bb90');line(25,7,27,1,'#d9af87');
   for(const [x,y] of [[6,12],[11,2],[30,8],[23,2],[16,5],[32,13],[19,32]])star(x,y,'#ddb37b');
   p(11,33,18,2,'#766274');
  }else if(art==='baker'){
   p(11,32,16,4,'#a67d6a');p(13,30,12,3,'#e1c196');
   p(12,19,15,13,'#ca8f65');p(13,13,12,10,'#dc9d72');
   p(13,11,4,5,'#b37962');p(22,11,4,5,'#b37962');
   p(17,17,2,2,'#323a56');p(23,17,2,2,'#323a56');
   p(19,21,4,2,'#f3dfbf');p(17,23,10,9,'#e9ddc7');
   p(19,25,5,5,'#b7a2a1');
   p(9,26,18,3,'#b28b77');p(10,24,16,2,'#f0d8b0');
   for(const x of [12,18,24]){p(x,22,4,3,'#b67a65');p(x+1,21,2,2,'#e8b093');dot(x+2,22,'#efcf98')}
   p(10,17,4,9,'#d69a7a');p(25,17,4,9,'#d69a7a');
   p(16,10,11,3,'#e7dfcb');p(17,8,9,2,'#fff1da');
   p(16,33,10,2,'#9d7380');
  }else if(art==='willow'){
   p(11,31,17,5,'#5d6a84');p(13,27,13,5,'#7e9db2');
   line(20,29,21,9,'#a78c78');line(20,18,13,12,'#a9947f');
   line(20,18,27,13,'#b38d7b');line(20,13,18,6,'#caa083');
   for(const [x,y,h] of [[7,13,13],[12,9,15],[19,5,17],[26,11,15]]){
    p(x,y,7,3,'#67999c');p(x+1,y-2,5,3,'#9abac3');
    for(const dx of [1,4,6]){line(x+dx,y+1,x+dx,y+h,'#5d9fa7');dot(x+dx,y+h,'#b0d4cb')}
   }
   p(22,14,4,2,'#a77c65');p(24,12,4,3,'#d8b484');
   dot(25,13,'#2a5368');
   for(const [x,y] of [[8,9],[29,17],[13,20]])star(x,y,'#9cc9c7');
   p(15,32,11,2,'#d0ad90');
  }else if(art==='amberwort'){
   p(8,32,20,4,'#7e6c79');p(9,29,18,3,'#c7a78b');
   p(9,12,20,18,'#809d95');p(11,9,16,22,'#acc4b1');
   p(13,12,12,17,'#426b61');p(10,11,3,19,'#dee1c9');p(26,11,3,19,'#d2dcc5');
   p(14,8,9,3,'#f0e1c1');p(16,5,5,4,'#b5a3a0');
   for(const [x,y] of [[13,21],[21,19],[18,26]]){
    p(x,y,5,4,'#c8905a');p(x+1,y-2,3,3,'#e0b87c');
    p(x+2,y+2,2,3,'#a96f6b');dot(x+3,y-1,'#fff0b3');
   }
   for(const [x,y] of [[12,15],[23,13],[11,25],[25,27]]){
    p(x,y,4,2,'#639c74');p(x+1,y-2,2,3,'#b6c99c');
   }
   for(const [x,y] of [[14,14],[24,22],[17,10]])star(x,y,'#e5c47b');
   p(12,30,15,2,'#e0b88b');p(16,34,10,2,'#786677');
  }else if(art==='lotus'){
   p(6,31,23,5,'#6d667c');p(9,27,19,5,'#8e9ba3');
   p(7,22,22,8,'#4b7b88');p(9,23,18,5,'#3c647b');
   for(const [x,y] of [[10,26],[21,26]]){p(x,y,6,2,'#749d95');p(x+1,y-2,5,3,'#98bda1')}
   p(16,17,7,8,'#d48ba5');p(17,13,5,9,'#f0c7c9');
   p(19,10,3,11,'#fff0d5');p(15,18,3,5,'#c2799d');
   p(22,18,4,5,'#e9b0b9');dot(20,17,'#ecdcac');
   for(const [x,y] of [[13,24],[24,24],[11,27]]){
    p(x,y,3,2,'#d9cfbc');dot(x+2,y,'#ffedc1');
   }
   p(9,29,19,3,'#d3bdaf');p(14,32,11,2,'#d1ab96');
   for(const [x,y] of [[12,9],[26,15],[7,18]])star(x,y,'#b2d9d7');
  }else if(art==='butterfly'){
   p(13,33,14,4,'#706b81');p(16,22,7,12,'#a88f79');
   p(17,8,5,17,'#d3b18f');p(18,10,3,13,'#e3d3b9');
   p(5,10,12,8,'#6d9abb');p(22,10,10,8,'#70b7b9');
   p(7,12,10,9,'#d3ccbe');p(22,12,8,9,'#b6d9cb');
   p(9,14,7,4,'#f1e2c9');p(23,14,5,4,'#e4c9ce');
   p(18,12,4,11,'#b87f92');p(19,14,2,8,'#f6e1b2');
   for(const [x,y] of [[7,11],[29,12],[9,19],[28,19]]){p(x,y,3,3,'#966e8c');dot(x+1,y+1,'#fff4dc')}
   line(18,10,15,6,'#d6bfa9');line(22,10,25,6,'#d6bfa9');
   for(const [x,y] of [[11,8],[26,8],[5,22]])star(x,y,'#b9e2cf');
  }else if(art==='beaconlamp'){
   p(12,33,16,4,'#736675');p(14,25,12,9,'#b49b85');
   p(16,15,8,12,'#d2ae87');p(9,9,22,10,'#52617e');
   p(11,11,18,7,'#7fa8bd');p(13,12,14,5,'#e5d1af');
   p(17,11,6,6,'#fff4c8');p(19,10,2,7,'#f8e6a4');
   p(8,8,24,3,'#bd967b');p(14,5,13,3,'#deb884');
   p(17,3,6,2,'#a89ba1');p(12,20,16,3,'#927a81');
   for(const x of [12,28]){p(x,10,2,9,'#e5c298');p(x+1,12,1,5,'#8b91aa')}
   line(6,14,2,12,'#f1d49d');line(33,14,38,13,'#e9c8a1');
   for(const [x,y] of [[7,7],[30,7],[7,21]])star(x,y,'#f4d59f');
  }else if(art==='fireflytree'){
   p(10,33,18,4,'#74677a');p(12,30,14,4,'#a28b85');
   line(19,31,18,8,'#b89b7e');line(19,19,9,13,'#b49c90');
   line(19,18,30,11,'#d1a69a');line(17,13,15,6,'#e7bca5');
   for(const [x,y,ww] of [[7,12,10],[20,7,9],[10,6,9],[23,17,7]]){
    p(x,y,ww,4,'#906e9a');p(x+2,y-2,ww-3,3,'#c5a6c7');
    p(x+3,y+4,ww-4,2,'#d6b9d1');
   }
   for(const [x,y] of [[8,9],[13,15],[19,10],[29,14],[25,22],[11,22]]){
    star(x,y,'#f0d18b');p(x,y,2,2,'#fff4c8');
   }
   p(16,32,11,2,'#d2ad8d');p(13,29,12,2,'#715b70');
  }else if(art==='sunclock'){
   p(12,33,17,4,'#69596e');p(15,27,11,7,'#b2927c');
   p(16,16,8,12,'#c49d76');p(8,9,24,15,'#a7846c');
   p(12,11,16,12,'#edcf92');p(15,13,10,9,'#556579');
   for(let n=0;n<12;n++){
    const a=n*Math.PI/6,x=Math.round(20+13*Math.cos(a)),y=Math.round(16+13*Math.sin(a));
    line(20,16,x,y,'#d4a276');p(x,y,2,2,'#f1d5a0');
   }
   p(17,14,7,6,'#d3c6ac');p(18,15,5,4,'#f5e7bf');
   line(20,17,21,12,'#5f6474');line(20,17,24,18,'#8a7986');
   p(8,23,23,2,'#d2ae7b');p(13,26,14,2,'#aa8e75');
   star(8,4,'#f2d49b');star(32,8,'#eabf8d');
  }else{
   p(11,33,18,4,'#766b83');p(13,30,14,3,'#a2a3a2');
   p(8,10,23,20,'#7fa6b6');p(10,12,19,16,'#2f617b');
   p(12,15,15,12,'#3b7890');
   p(16,11,8,5,'#c8d2ce');p(18,9,5,3,'#e4d0b6');
   p(17,17,7,7,'#cb8b85');p(14,19,5,5,'#e5a393');
   p(22,18,6,4,'#eeccaf');p(15,23,10,3,'#a26c86');
   p(14,26,13,2,'#d2b09f');p(13,29,16,2,'#e1cba4');
   for(const [x,y] of [[9,15],[27,20],[11,25]]){
    p(x,y,3,3,'#95beba');p(x+1,y-2,2,2,'#d1e2bf');
   }
   p(11,13,2,15,'#d5ecdc');p(29,13,2,15,'#b4d3d5');
   for(const [x,y] of [[8,8],[30,9],[12,30]])star(x,y,'#bad0d5');
  }
 }
 return c;
}
const unique=new Map(ITEMS.map(item=>[item.id,paint(item)]));
const ids=new Set([...old.items,...ITEMS].map(x=>x.id));
if(unique.size!==20||ids.size!==140)throw Error('v0.35 must add twenty unique permanent works');
const thumbs=new Map();
function thumbnail(id){
 if(thumbs.has(id))return thumbs.get(id);
 const canvas=unique.get(id);
 const src=canvas?canvas.toDataURL('image/png'):old.thumbnail(id);
 if(src)thumbs.set(id,src);
 return src;
}
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:Object.freeze([...old.items,...ITEMS]),
 slots:old.slots,quotas:old.quotas,
 texture:id=>unique.get(id)||old.texture(id),thumbnail
});
})();