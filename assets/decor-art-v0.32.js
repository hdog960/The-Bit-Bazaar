/* Bit Bazaar v0.32 — twenty individually illustrated collector works.
 * Unique compositions, silhouettes and stories. No reskins or bulk textures.
 * 5 framed scenes, 3 sculptures, 2 botanicals, 2 lamps, 2 rugs,
 * 2 architectural installations, 2 hanging sculptures, 1 shelf finish, 1 curio.
 * All art is painted once into tiny 16-bit-style canvases; no frame allocations. */
(()=>{
'use strict';
const old=window.BIT_BAZAAR_DECOR;
if(!old||old.items.length!==68||old.slots.length!==169)
 throw Error('v0.32 hand-authored gallery must follow the original 68 artworks and 169 mounts');
const ITEMS=[
 {id:'emberglass-teahouse',name:'The Emberglass Teahouse',category:'Framed Art',mount:'wall',price:4,art:'teahouse',
  description:'A cliffside teahouse shines like a paper lantern above cedar trees, with two tiny cups overlooking a red dawn.'},
 {id:'ferry-of-lost-stars',name:'The Ferryman of Lost Stars',category:'Framed Art',mount:'wall',price:5,art:'ferry',
  description:'A hooded boatman crosses ink-black water, transporting a cargo of fallen constellations beneath violet rain.'},
 {id:'glacier-clock-rail',name:'The Glacier Clock Railway',category:'Framed Art',mount:'wall',price:6,art:'rail',
  description:'A brass steam engine crosses an icy trestle beneath towering snow-capped spires and a frozen full moon.'},
 {id:'foxes-and-ink',name:'Foxes & Ink',category:'Framed Art',mount:'wall',price:3,art:'foxbooks',
  description:'Two copper fox cubs nap beneath a golden reading lamp amid a snug library of mismatched blue and red books.'},
 {id:'opal-skywhale',name:'The Opal Skywhale',category:'Framed Art',mount:'wall',price:7,art:'skywhale',
  description:'An enormous pearl-white whale sails above indigo rooftops, its starry wake breaking into tiny floating lanterns.'},
 {id:'cinder-astronomer',name:'The Cinder Astronomer',category:'Statues',mount:'floor',price:9,art:'astronomer',
  description:'A cloaked bronze stargazer adjusts a tiny telescope on a basalt observatory pedestal, one eye made of amber glass.'},
 {id:'opal-stone-turtle',name:'The Opal Stone Turtle',category:'Statues',mount:'floor',price:5,art:'turtle',
  description:'An old jade turtle carries a little garden on its cracked opalescent shell, complete with flowers and miniature stairs.'},
 {id:'windup-raven',name:'The Wind-up Raven',category:'Statues',mount:'floor',price:6,art:'raven',
  description:'A black enamel raven perches on a copper clocktower finial, its mechanical wings and silver key carefully exposed.'},
 {id:'whisperglass-moss-garden',name:'Whisperglass Moss Garden',category:'Plants',mount:'floor',price:3,art:'mossgarden',
  description:'A crystal-sided moss garden shelters emerald cushions, pale mushrooms and miniature quartz mountains.'},
 {id:'saffron-coral-vine',name:'Saffron Coral Vine',category:'Plants',mount:'floor',price:4,art:'coralvine',
  description:'A curling copper trellis supports orange coral-shaped flowers, jade leaves and small sapphire fruits.'},
 {id:'hushfire-streetlamp',name:'Hushfire Streetlamp',category:'Lighting',mount:'floor',price:5,art:'streetlamp',
  description:'An ornate Victorian brass streetlamp glows with an impossible cool-green fire behind engraved teal panes.'},
 {id:'jellymoon-lantern',name:'Jellymoon Lantern',category:'Lighting',mount:'floor',price:6,art:'jellylamp',
  description:'A suspended glass moon contains a tiny jellyfish whose pearlescent tendrils illuminate a pearl and copper stand.'},
 {id:'ember-maze-rug',name:'The Ember Maze Rug',category:'Rugs',mount:'rug',price:4,art:'maze',
  description:'A burgundy-and-gold labyrinth weaves toward a glowing central key, with tassels resembling burning matches.'},
 {id:'astral-orchard-carpet',name:'Astral Orchard Carpet',category:'Rugs',mount:'rug',price:5,art:'orchardrug',
  description:'A midnight garden rug grows silver trees with starlit apples, indigo roots and tiny wandering golden moths.'},
 {id:'meteorite-glass-portal',name:'Meteorite Glass Portal',category:'Architecture',mount:'wall',price:8,art:'meteor',
  description:'A dark Gothic window captures a copper-tailed meteor streaking through ruby and cobalt cathedral glass.'},
 {id:'moss-cathedral-niche',name:'Moss Cathedral Niche',category:'Architecture',mount:'wall',price:6,art:'mossniche',
  description:'An overgrown stone chapel alcove frames a carved silver birdbath, pearl flowers and a glowing forest altar.'},
 {id:'moonfall-bell-garland',name:'Moonfall Bell Garland',category:'Ceilings',mount:'ceiling',price:5,art:'bells',
  description:'A hanging strand of tiny bronze cathedral bells and silver moon charms sings above a hand-woven cobalt canopy.'},
 {id:'thistledown-orbit-mobile',name:'Thistledown Orbit Mobile',category:'Ceilings',mount:'ceiling',price:4,art:'thistle',
  description:'Feathery thistledown seeds orbit an iridescent seedpod on fine bronze wire, catching invisible starlight.'},
 {id:'violet-stained-scrollwork',name:'Violet Stained Scrollwork',category:'Shelf Trims',mount:'shelf',price:5,art:'violet',
  description:'Dark amethyst shelf rails inlaid with pale silver scrolls, enamel violets and delicately faceted gems.'},
 {id:'clockfish-aquarium',name:'Clockfish Aquarium',category:'Curios',mount:'floor',price:7,art:'clockfish',
  description:'A tabletop brass aquarium contains a clockwork blue fish, painted coral, an old ship wheel and glittering bubbles.'}
];
const PALETTES=[
 ['#262d48','#e9d3a2','#c8786f'],
 ['#24263f','#ded1e6','#7fa9c9'],
 ['#223b55','#debf82','#a3cbd3'],
 ['#3f3048','#e9ba82','#b87556'],
 ['#242c56','#f0e1c0','#c59ca2']
];
function paint(item){
 const rug=item.mount==='rug',ceiling=item.mount==='ceiling',
  rail=item.mount==='shelf',arch=item.category==='Architecture',
  frame=item.category==='Framed Art';
 const w=rail?48:rug||ceiling||arch?40:32,h=rail||rug?28:ceiling||arch?48:40;
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const g=canvas.getContext('2d',{alpha:!rail});g.imageSmoothingEnabled=false;
 const p=(x,y,ww,hh,c)=>{g.fillStyle=c;g.fillRect(x,y,ww,hh)};
 const d=(x,y,c)=>p(x,y,1,1,c);
 const l=(x,y,xx,yy,c)=>{let dx=Math.abs(xx-x),dy=Math.abs(yy-y),
  sx=x<xx?1:-1,sy=y<yy?1:-1,err=dx-dy;for(;;){
   d(x,y,c);if(x===xx&&y===yy)break;const e=2*err;
   if(e>-dy){err-=dy;x+=sx}if(e<dx){err+=dx;y+=sy}
  }};
 const star=(x,y,c='#f7e6b5')=>{p(x-2,y,5,1,c);p(x,y-2,1,5,'#fff0cb')};
 const bezel=(x,y,w0,h0,c1,c2)=>{p(x,y,w0,h0,c1);p(x+2,y+2,w0-4,h0-4,c2)};
 const art=item.art;
 if(frame){
  // Every composition is a distinct vignette inside a matching antique frame.
  const tone=PALETTES[ITEMS.indexOf(item)%PALETTES.length];
  p(0,0,32,40,'#332b43');p(1,1,30,38,'#a58164');
  p(3,3,26,34,'#e2c091');p(5,5,22,30,tone[0]);
  p(2,5,1,30,'#f3d29c');p(29,5,1,30,'#785369');
  for(let y=5;y<36;y+=6){d(3,y,'#f3d7a8');d(28,y,'#7d5362');}
  if(art==='teahouse'){
   p(5,26,22,8,'#274354');p(6,27,20,6,'#496d68');
   for(const [x,h] of [[7,9],[10,13],[23,11],[26,8]]){
    p(x,30-h,2,h,'#233c47');p(x-2,27-h,6,3,'#527a67');
    p(x-1,24-h,4,2,'#7e9d74');
   }
   p(11,17,13,11,'#a25f59');p(13,19,10,9,'#eab58d');
   p(9,15,17,3,'#6c3e51');p(12,12,13,3,'#d4886a');
   p(13,19,4,6,'#f8dcaa');p(19,20,3,4,'#fae8b9');
   l(11,16,16,10,'#d9aa81');l(24,16,20,10,'#cc836e');
   p(11,26,12,2,'#745565');p(16,28,2,4,'#d3b890');
   p(16,8,8,2,'#f2b887');p(19,7,4,1,'#f8dfa5');
   p(19,24,2,2,'#885c57');p(22,25,2,1,'#f4e2bc');
   for(const [x,y] of [[7,9],[24,7],[9,13]])star(x,y,'#e7b89b');
  }else if(art==='ferry'){
   p(5,5,22,30,'#24283e');p(5,23,22,12,'#344b72');
   for(let y=25;y<34;y+=3){l(6,y,25,y-1,'#567394');p(10,y+1,4,1,'#8997b7');}
   p(8,23,17,4,'#674a61');p(11,27,12,1,'#c89a7d');
   p(14,16,6,8,'#5b5972');p(15,12,4,5,'#9f91a2');p(17,10,2,3,'#d9c6b8');
   l(22,11,24,30,'#e3b891');p(22,8,5,3,'#f5cf8b');d(24,9,'#fff8d7');
   for(const [x,y] of [[8,9],[11,13],[22,15],[17,6],[24,20]]){
    star(x,y,'#a9bfe7');p(x,y+2,1,3,'#e2cae1');
   }
   p(7,28,5,2,'#9b8ca6');p(11,29,2,1,'#d6c1d4');
   l(8,34,23,32,'#94add3');p(20,26,4,1,'#ebd1a7');
  }else if(art==='rail'){
   p(5,5,22,30,'#24465c');p(6,17,20,18,'#7599aa');
   for(const [x,height] of [[7,9],[13,13],[21,16]]){
    p(x,26-height,5,height,'#b4d2d3');p(x+1,24-height,3,5,'#f2e8ce');
    l(x,18-height,x+3,16-height,'#fff5da');
   }
   p(5,28,22,4,'#3d5868');p(7,30,19,2,'#bea08c');
   p(10,23,12,5,'#ab6856');p(14,20,5,4,'#dfb17d');
   p(16,21,3,2,'#8bc0c7');p(9,19,3,4,'#9b6d5b');
   for(const x of [12,17,22]){p(x,28,3,3,'#4b4b61');d(x+1,29,'#f5d9a0');}
   p(23,24,3,2,'#e6b887');p(18,18,4,1,'#f0cf9e');
   for(const [x,y] of [[9,15],[11,12],[13,9]]){p(x,y,3,1,'#d7e7e7');}
   p(22,7,3,3,'#f0ebd7');p(23,8,1,1,'#fff9df');
  }else if(art==='foxbooks'){
   p(5,5,22,30,'#3b334e');
   for(let y=7;y<34;y+=9){
    p(6,y+7,20,2,'#b68d68');
    for(let x=7;x<26;x+=3){
     p(x,y,2,7,['#8a91b2','#b67573','#daac78','#648c8d'][Math.floor((x+y)/3)%4]);
     d(x+1,y+2,'#eed1ac');
    }
   }
   p(15,25,12,7,'#b16e56');p(18,22,6,4,'#cf8b64');
   p(11,26,8,6,'#c78a61');p(13,23,5,4,'#e2a473');
   p(11,21,3,4,'#ad6a57');p(16,21,3,4,'#b9785b');
   p(23,20,3,4,'#aa715b');p(27,23,1,4,'#d3ad8a');
   p(13,26,1,1,'#303c50');p(21,25,1,1,'#303c50');
   l(20,15,20,10,'#e1c49c');p(18,10,5,3,'#f4d7a4');
   p(17,14,7,2,'#e2a871');p(6,32,21,2,'#6a4e66');
  }else if(art==='skywhale'){
   p(5,5,22,30,'#343d6b');p(5,27,22,8,'#30374d');
   for(let x=5;x<27;x+=4){p(x,27-(x%3)*2,4,9,'#6c607d');p(x+1,29,2,4,'#d1ad8e');}
   p(8,12,17,9,'#c2d0db');p(11,10,14,6,'#e9e8d9');
   p(10,17,13,6,'#8cabbc');p(7,18,6,3,'#b7d0d3');
   p(23,13,4,4,'#f2e1ce');p(13,8,5,4,'#abc3d4');
   l(14,17,21,22,'#8e9bb7');p(11,21,4,3,'#98b6c7');
   d(23,14,'#273c5b');p(18,12,5,1,'#f7f5dd');
   for(const [x,y] of [[8,8],[22,8],[9,25],[25,23],[16,6]]){
    star(x,y,'#d4b5c0');p(x,y+3,1,2,'#d6b2b9');
   }
   p(7,32,20,1,'#b392a9');
  }
 }else if(arch){
  bezel(0,0,40,48,'#33334c','#ad9a90');bezel(4,4,32,40,'#c7ae9b','#303853');
  for(let y=7;y<42;y+=8){p(5,y,30,1,'#827c8e');p(7+(y%3)*2,y,1,6,'#877c8f');}
  if(art==='meteor'){
   p(10,8,20,33,'#263c68');p(12,10,16,28,'#5178a1');
   for(let y=10;y<38;y+=4){l(12,y,28,y+2,'#d6ba91');}
   for(let x=12;x<29;x+=4){l(x,10,x+4,38,'#7d668d');}
   l(12,28,26,13,'#e9a56f');l(9,31,23,16,'#c47268');
   p(25,11,5,6,'#f4c27c');p(27,12,3,4,'#fff3cc');p(25,17,2,3,'#f9d9a3');
   for(const [x,y] of [[12,12],[19,23],[25,30],[12,34],[27,23]])star(x,y,'#f7e9b7');
   p(10,39,20,3,'#ccb39e');p(16,6,8,3,'#8d7783');
   p(18,3,4,4,'#d5ab80');
  }else if(art==='mossniche'){
   p(9,9,22,32,'#293f3e');p(11,11,18,28,'#4c6552');
   for(let y=12;y<39;y+=5){p(12,y,16,2,'#758776');p(14,y+2,1,3,'#99a28d');}
   p(14,31,12,4,'#bcb3a3');p(16,27,8,5,'#d3cfc0');
   p(18,22,4,7,'#9fb9ae');p(17,21,6,2,'#f2e5be');
   p(15,35,11,2,'#8c8580');p(12,38,17,2,'#5a6d59');
   for(const [x,y] of [[10,12],[27,15],[9,25],[28,30],[13,37]]){
    p(x,y,3,2,'#6d9a7d');p(x+1,y-2,2,2,'#add0a1');d(x+2,y+2,'#e7cfa8');
   }
   for(const [x,y] of [[14,14],[22,11],[25,23],[16,38]]){
    p(x,y,2,2,'#f0e6d0');d(x+1,y-1,'#f7f4e1');
   }
   l(10,9,19,5,'#a0ab98');l(29,9,20,5,'#9fa993');
  }
 }else if(rug){
  p(0,0,40,28,'#322e49');p(1,1,38,26,'#d4b685');p(3,3,34,22,art==='maze'?'#763e51':'#2c4565');
  for(let x=3;x<37;x+=4){p(x,1,2,2,'#f6d99a');p(x,25,2,2,'#f6d99a');}
  for(let y=3;y<25;y+=4){p(1,y,2,2,'#d59e7b');p(37,y,2,2,'#d59e7b');}
  if(art==='maze'){
   for(let radius=0;radius<4;radius++){
    const x=5+radius*3,y=5+radius*2,w0=30-radius*6,h0=18-radius*4;
    l(x,y,x+w0,y,'#e2a66d');l(x,y,x,y+h0,'#e2a66d');
    l(x+w0,y+2,x+w0,y+h0,'#e2a66d');l(x+3,y+h0,x+w0,y+h0,'#e2a66d');
   }
   p(18,11,4,7,'#dfc084');p(17,12,6,2,'#f6e4b9');
   p(19,16,6,2,'#b87655');d(21,12,'#fff6d9');
   for(const [x,y] of [[7,7],[30,8],[10,20],[31,21]]){p(x,y,3,2,'#9e6170');}
  }else{
   l(6,19,14,9,'#7997a9');l(14,9,22,19,'#94b0a6');l(22,19,32,10,'#74869e');
   for(const [x,y] of [[10,8],[20,7],[29,9],[13,19],[27,18]]){
    p(x,y,2,12,'#8c8f97');p(x-3,y,7,2,'#b4b9b2');
    p(x-4,y+2,9,2,'#729d8b');p(x-3,y+4,7,2,'#b4c8a2');
    for(const [xx,yy] of [[-2,3],[2,2],[0,5]])d(x+xx,y+yy,'#f4d6a0');
   }
   for(const [x,y] of [[7,15],[35,14],[9,23],[33,22]])star(x,y,'#d9b8a1');
  }
 }else if(ceiling){
  p(19,0,2,11,'#ac9bab');p(17,3,6,3,'#d9bf91');
  if(art==='bells'){
   p(6,12,28,3,'#b89376');p(9,10,22,2,'#ead4a1');
   for(const [x,y,c] of [[5,20,'#e7bf8d'],[13,29,'#be9a80'],[25,23,'#d8c6ae'],[32,35,'#eac893']]){
    l(x+3,14,x+3,y,'#bfab9b');
    p(x,y,7,5,c);p(x+1,y-2,5,3,'#997889');p(x-1,y+5,9,2,'#f4dbaf');
    p(x+2,y+6,3,3,'#9f8089');d(x+3,y+8,'#eedabd');
   }
   for(const [x,y] of [[9,18],[20,20],[30,16],[17,39]]){
    p(x,y,4,3,'#c1cbd8');p(x+1,y-2,2,7,'#ebf0e6');
   }
   for(const [x,y] of [[5,6],[34,9],[27,43],[8,39]])star(x,y,'#f5d4a3');
  }else{
   p(10,11,20,3,'#ad9e92');p(12,9,16,2,'#e1c9a7');
   p(18,8,4,4,'#aacbb6');
   for(const [x,y] of [[6,20],[15,26],[27,21],[8,39],[30,40]]){
    l(x+4,13,x+4,y,'#8faea6');
    p(x-2,y-3,12,5,'#b4d4c5');p(x,y-5,8,6,'#dce5d7');
    p(x+2,y-2,5,2,'#fff0d5');
    l(x+3,y+1,x+1,y+5,'#a4bdb1');l(x+4,y+1,x+7,y+6,'#b6ccd0');
   }
   p(16,13,8,5,'#b7abb9');p(18,14,4,4,'#fff0c8');
   for(const [x,y] of [[7,9],[32,13],[20,44]])star(x,y,'#e6d6b6');
  }
 }else if(rail){
  p(0,0,48,28,'#29273e');p(1,2,46,24,'#a78eb0');
  p(3,4,42,20,'#473657');p(3,6,42,16,'#613f70');
  p(2,3,44,2,'#eed5b8');p(2,23,44,2,'#ae8ba8');
  for(let x=4;x<46;x+=7){
   l(x,9,x+3,15,'#cda7d5');l(x+3,15,x+6,9,'#e1b9df');
   p(x+1,11,3,3,'#9b78c1');d(x+2,12,'#fff0d1');
   p(x+3,17,3,3,'#d6a9ce');p(x+4,18,1,2,'#f2d6db');
   p(x,19,2,1,'#ead2c8');p(x+6,6,2,2,'#f7e5ca');
  }
  for(let x=5;x<45;x+=9){p(x,5,2,2,'#ebc2c1');p(x+3,21,2,2,'#bba0d6');}
  p(17,12,14,3,'#9a79ab');p(20,12,8,2,'#fae5d7');
 }else{
  // Distinct upright sculptures, gardens, lamps and curios cast a small shadow.
  p(5,37,23,2,'#333846');p(8,35,17,2,'#847381');
  if(art==='astronomer'){
   p(12,22,11,12,'#604e5c');p(13,15,9,12,'#98785f');
   p(10,11,13,7,'#4a4c64');p(13,9,9,5,'#b59074');
   p(15,16,5,4,'#c7b79a');d(20,17,'#f6cb78');
   p(11,27,4,8,'#a77a5d');p(20,27,4,8,'#6f6478');
   l(18,19,26,10,'#e0b489');p(23,7,6,4,'#aabcc2');p(24,8,7,2,'#e3d4a9');
   p(26,11,4,2,'#f1e1bb');p(20,21,8,2,'#b08a6d');
   p(7,28,7,6,'#5b5b68');p(8,30,5,1,'#c4b59f');
   for(const [x,y] of [[7,9],[29,4],[25,20],[11,6]])star(x,y,'#c7b4a0');
   p(12,33,11,3,'#685b69');
  }else if(art==='turtle'){
   p(7,24,20,9,'#739a82');p(5,27,7,5,'#b8c7aa');
   p(21,26,7,6,'#9dbba8');p(25,28,2,2,'#334e56');
   for(const [x,y] of [[10,31],[21,32]])p(x,y,5,4,'#67857c');
   p(9,17,18,10,'#a7b6b3');p(12,14,12,10,'#d2d2bd');
   for(const [x,y] of [[11,21],[18,18],[23,24]]){
    p(x,y,5,4,'#7a9c9d');p(x+1,y+1,3,2,'#d9c8cb');
   }
   p(15,9,2,9,'#6b986f');p(13,8,8,3,'#91bc83');
   p(11,6,6,3,'#ba9aba');p(19,5,4,4,'#dbbd99');
   for(let k=0;k<6;k++){p(12+k*2,12-k%2,2,2,'#b0c38c');}
   p(15,34,8,2,'#e6d2a4');
  }else if(art==='raven'){
   p(11,31,15,4,'#b78f65');p(14,26,10,6,'#76677d');
   p(11,14,15,15,'#40495e');p(13,11,10,9,'#5f5b70');
   p(20,12,7,4,'#c7a17f');p(25,14,5,2,'#e0bb89');
   p(8,20,7,6,'#323a4c');p(10,24,7,4,'#666778');
   p(15,18,9,7,'#8391a0');p(16,21,7,3,'#4b5066');
   d(22,13,'#f2d38c');p(22,14,2,1,'#283548');
   p(14,29,2,5,'#c79e6d');p(22,28,2,5,'#c79e6d');
   p(6,26,5,2,'#8a8590');l(8,22,6,29,'#d7b990');
   for(const [x,y] of [[11,14],[14,18],[13,23],[21,20]])d(x,y,'#c4bac3');
   p(17,34,6,2,'#e1be89');
  }else if(art==='mossgarden'){
   p(8,31,20,5,'#726879');p(10,29,16,3,'#af9ca2');
   p(11,20,15,10,'#769c86');p(12,17,12,9,'#9cc5a8');
   for(const [x,y] of [[12,24],[17,21],[22,25]]){
    p(x,y,5,4,'#538a77');p(x+1,y-1,3,3,'#9cbe98');
   }
   for(const [x,y] of [[15,16],[20,14],[10,20]]){
    p(x,y,3,2,'#d3dcd7');p(x+1,y-2,1,4,'#faf1d9');
   }
   for(let y=9;y<30;y+=2){p(8,y,2,2,'#b4d6cb');p(27,y,2,2,'#8cb6b5');}
   p(10,7,17,2,'#e1e1cb');p(10,9,2,20,'#d9e8d9');
   p(11,29,15,2,'#bdada4');p(19,11,5,4,'#c8c7d5');
   l(21,13,24,17,'#f3f0e1');p(14,34,10,2,'#736986');
  }else if(art==='coralvine'){
   p(11,31,16,5,'#5a7992');p(13,26,12,6,'#9eafbb');
   l(18,27,12,9,'#bb8f7a');l(18,27,25,12,'#d0a07d');
   l(18,21,21,6,'#b67e71');l(17,23,7,18,'#b18d83');
   for(const [x,y] of [[9,12],[12,7],[21,9],[24,14],[7,20]]){
    p(x,y,6,4,'#d99468');p(x+1,y-2,4,3,'#f1c17d');
    p(x+2,y+2,2,4,'#a85f5f');d(x+3,y,'#f9e7bc');
   }
   for(const [x,y] of [[14,18],[20,19],[22,24],[11,25]]){
    p(x,y,5,3,'#5c977f');p(x+1,y-2,3,2,'#b6c78f');
   }
   p(16,32,9,2,'#e0c99d');d(20,24,'#568dbc');
  }else if(art==='streetlamp'){
   p(12,33,11,4,'#6e697a');p(15,20,5,14,'#b08d69');
   p(10,10,15,13,'#526c72');p(12,11,11,11,'#a0cfbb');
   p(14,12,7,9,'#d8eac8');p(16,14,3,5,'#f8f9db');
   p(10,8,16,3,'#a48d81');p(13,5,10,3,'#e4c293');
   p(17,2,2,5,'#e1bc87');p(16,1,4,2,'#8f7c87');
   for(const x of [11,24]){p(x,12,2,10,'#bfad88');p(x+1,15,1,5,'#e7d8ab');}
   p(11,23,13,2,'#7e6e79');p(14,28,7,2,'#d2ae80');
   for(const [x,y] of [[7,11],[26,13],[6,20],[27,23]])star(x,y,'#b2e7cc');
  }else if(art==='jellylamp'){
   p(11,34,14,3,'#70677c');p(14,30,8,4,'#c5ad9a');
   p(16,23,4,9,'#c5b0a0');p(7,8,22,18,'#82aebd');
   p(9,10,18,15,'#3e687f');p(12,9,12,5,'#c2d7d7');
   p(12,13,12,5,'#d0d9d5');p(14,12,8,4,'#fae7c9');
   for(const x of [13,16,20,23])l(x,18,x+(x%2?2:-2),24,'#a9d4d2');
   p(10,22,16,2,'#99c6cf');p(12,25,12,1,'#e5e2c9');
   p(8,8,20,2,'#d6c2ae');p(16,5,4,3,'#f1dcb1');
   for(const [x,y] of [[6,12],[27,16],[10,27],[25,6]])star(x,y,'#bde8e0');
  }else if(art==='clockfish'){
   p(9,31,20,5,'#6b626c');p(10,27,17,4,'#d4ad86');
   p(7,10,23,18,'#849da9');p(9,12,19,15,'#32576f');
   p(10,13,17,2,'#aac8c5');p(11,24,16,2,'#7da6a2');
   p(13,17,10,6,'#d1ad75');p(21,19,5,4,'#e3bf88');
   p(12,18,4,3,'#9db7bc');p(14,20,2,2,'#f4dba6');
   d(22,18,'#263e54');p(16,19,3,1,'#496a76');
   for(let i=0;i<6;i++){
    const x=10+(i*7)%16,y=14+(i*4)%12;
    p(x,y,2,2,'#b5dbe0');
   }
   p(14,8,10,2,'#bf9d75');p(16,5,6,3,'#826b6b');
   p(18,5,2,4,'#e9c78e');p(13,28,12,2,'#a78372');
   for(const [x,y] of [[11,23],[26,22]]){p(x,y,2,4,'#6eaa95');p(x+1,y-2,2,2,'#a1c7a3');}
  }
 }
 return canvas;
}
const pixels=new Map(ITEMS.map(item=>[item.id,paint(item)]));
const allIds=new Set([...old.items.map(item=>item.id),...ITEMS.map(item=>item.id)]);
if(pixels.size!==20||allIds.size!==88)throw Error('20 new, uniquely named works required');
const thumbCache=new Map();
function thumbnail(id){
 if(thumbCache.has(id))return thumbCache.get(id);
 const image=pixels.get(id),url=image?image.toDataURL('image/png'):old.thumbnail(id);
 if(url)thumbCache.set(id,url);
 return url;
}
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:Object.freeze([...old.items,...ITEMS]),
 slots:old.slots,quotas:old.quotas,
 texture:id=>pixels.get(id)||old.texture(id),
 thumbnail
});
})();