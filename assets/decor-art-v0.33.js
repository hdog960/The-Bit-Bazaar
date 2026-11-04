/* Bit Bazaar v0.33: sixteen hand-painted collector pieces, not palette reskins.
   Authored once at boot into 16 tiny canvases; IDs and 184 original sites stay unchanged. */
(()=>{
'use strict';
const old=window.BIT_BAZAAR_DECOR;
if(!old||old.items.length!==88||old.slots.length!==184)
 throw Error('v0.33 decor art requires 88 prior works and 184 stable mounts');
const ITEMS=[
 {id:'rainmarket-blue-hour',name:'Rainmarket at Blue Hour',category:'Framed Art',mount:'wall',price:5,art:'rainmarket',
  description:'A twilight street market glitters with striped awnings, narrow lanterns and cobalt rain mirrored along a cobbled lane.'},
 {id:'glassmakers-fox',name:"The Glassmaker's Fox",category:'Framed Art',mount:'wall',price:4,art:'glassfox',
  description:'A little copper fox tends a moonlit glassblowing furnace where molten turquoise vessels sparkle beside its tail.'},
 {id:'starfold-library',name:'The Starfold Library',category:'Framed Art',mount:'wall',price:7,art:'starfold',
  description:'An impossible spiral staircase climbs through tiny bookcases, moon globes and a vaulted midnight observatory.'},
 {id:'mushroom-caravan',name:'The Mushroom Caravan',category:'Framed Art',mount:'wall',price:3,art:'caravan',
  description:'A miniature wooden wagon passes beneath towering lilac toadstools with copper wheels and fireflies lighting its way.'},
 {id:'moonwatch-bell-tower',name:'The Moonwatch Bell Tower',category:'Architecture',mount:'wall',price:8,art:'moonwatch',
  description:'Carved Gothic sandstone reveals a silver cathedral bell and the pale crescent shining through its pointed belfry.'},
 {id:'aquamarine-conservatory',name:'The Aquamarine Conservatory',category:'Architecture',mount:'wall',price:6,art:'conservatory',
  description:'A sea-glass greenhouse arch shelters hanging orchids, a tiny tiled fountain and light caught in copper window ribs.'},
 {id:'briarwood-gilded-rails',name:'Briarwood Gilded Rails',category:'Shelf Trims',mount:'shelf',price:5,art:'briar',
  description:'Olive wood rails wind through hand-carved ivy leaves, thorny bronze scrolls and carefully inset honey-gold blossoms.'},
 {id:'afterhours-neon-herringbone',name:'Afterhours Neon Herringbone',category:'Shelf Trims',mount:'shelf',price:6,art:'neon',
  description:'A dark arcade border flashes with geometric violet herringbone, pale cyan glass strips and tiny enamel prize stars.'},
 {id:'deepsea-pearl-inlay',name:'Deepsea Pearl Inlay',category:'Shelf Trims',mount:'shelf',price:4,art:'pearl',
  description:'Indigo ceramic shelf edges are patterned with pale sea scallops, a fine braided gold thread and glassy pearl studs.'},
 {id:'cicada-path-tapestry',name:'Cicada Path Tapestry',category:'Rugs',mount:'rug',price:4,art:'cicadapath',
  description:'A moss-and-amber woven garden path leads between paired silver cicadas with luminous wings and tiny fern stitches.'},
 {id:'terracotta-labyrinth-runner',name:'Terracotta Labyrinth Runner',category:'Rugs',mount:'rug',price:3,art:'terracotta',
  description:'An old clay-red pathway turns through ivory tiled mazes bordered by grape vines, blue pottery and a buried brass key.'},
 {id:'frost-lantern-textile',name:'Frost Lantern Textile',category:'Rugs',mount:'rug',price:5,art:'frostlantern',
  description:'Icy blue fabric carries a procession of warm paper lanterns amid embroidered crystal branches and geometric snowfall.'},
 {id:'porcelain-raindrop-mobile',name:'Porcelain Raindrop Mobile',category:'Ceilings',mount:'ceiling',price:6,art:'porcelain',
  description:'An elegant silver crescent suspends glazed porcelain raindrops, pearl beads and transparent blue glass feathers.'},
 {id:'clocktower-seed-chimes',name:'Clocktower Seed Chimes',category:'Ceilings',mount:'ceiling',price:5,art:'seedchimes',
  description:'Tiny brass clock gears carry bronze seedpods and pearly glass chimes beneath a hanging walnut clock face.'},
 {id:'foxfire-river-otter',name:'Foxfire River Otter',category:'Statues',mount:'floor',price:5,art:'otter',
  description:'A playful amber river otter curls around a driftwood pedestal, cradling a polished moonstone above blue river reeds.'},
 {id:'mooncap-bonsai',name:'Mooncap Bonsai',category:'Plants',mount:'floor',price:4,art:'mooncap',
  description:'A gently twisted bonsai grows snowy moon-mushrooms and fine lavender fronds from a chipped violet glazed planter.'}
];
function paint(item){
 const frame=item.category==='Framed Art',arch=item.category==='Architecture',
  rail=item.mount==='shelf',rug=item.mount==='rug',ceiling=item.mount==='ceiling';
 const w=rail?48:arch||rug||ceiling?40:32,h=rail||rug?28:arch||ceiling?48:40;
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const g=canvas.getContext('2d',{alpha:!rail});g.imageSmoothingEnabled=false;
 const r=(x,y,ww,hh,c)=>{g.fillStyle=c;g.fillRect(x,y,ww,hh)};
 const dot=(x,y,c)=>r(x,y,1,1,c);
 const line=(x1,y1,x2,y2,c)=>{let dx=Math.abs(x2-x1),dy=Math.abs(y2-y1),
  sx=x1<x2?1:-1,sy=y1<y2?1:-1,err=dx-dy;for(;;){
   dot(x1,y1,c);if(x1===x2&&y1===y2)break;
   const e=2*err;if(e>-dy){err-=dy;x1+=sx}if(e<dx){err+=dx;y1+=sy}
  }};
 const cross=(x,y,a,b)=>{r(x-2,y,5,1,a);r(x,y-2,1,5,b)};
 const a=item.art;
 if(frame){
  r(0,0,32,40,'#2b2c40');r(1,1,30,38,'#9e8269');
  r(3,3,26,34,'#e2c99c');r(5,5,22,30,'#30465c');
  r(2,5,1,30,'#f0d39c');r(29,5,1,30,'#75536a');
  for(let x=5;x<27;x+=5){dot(x,4,'#fff0c4');dot(x,35,'#9a7569');}
  if(a==='rainmarket'){
   r(5,5,22,30,'#30435e');r(5,25,22,10,'#36526b');
   for(const [x,y,c] of [[8,9,'#ba7585'],[18,12,'#7e91b1'],[8,20,'#dbb075']]){
    r(x,y,9,3,c);for(let i=0;i<9;i+=3)r(x+i,y+1,2,2,'#f2cfa2');
    r(x+1,y+3,1,10,'#d3b595');r(x+7,y+3,1,11,'#b49085');
   }
   r(6,28,20,1,'#e9b87e');r(10,32,12,1,'#86a7ba');
   for(let x=6;x<27;x+=4){line(x,31,x+3,26,'#52778f');r(x,33,2,1,'#a2b7bd');}
   for(const [x,y] of [[8,8],[19,11],[25,17]]){r(x,y,2,4,'#f1b97a');dot(x+1,y+1,'#fff2bb');}
   for(let i=0;i<16;i++)dot(5+(i*7)%22,7+(i*11)%27,i%2?'#90b8cd':'#b9a5bb');
  }else if(a==='glassfox'){
   r(5,5,22,30,'#3d3b52');r(6,28,20,7,'#7b5955');
   r(19,17,7,13,'#b35d5b');r(20,18,5,10,'#f3af67');r(22,21,2,5,'#ffe2a0');
   r(9,24,10,7,'#c38057');r(8,21,9,5,'#dba16a');
   r(9,17,4,5,'#aa705d');r(14,17,4,5,'#b8745d');
   r(8,31,3,2,'#f0c291');r(16,31,4,2,'#7e5061');
   dot(13,23,'#354257');r(13,26,3,1,'#f3dec2');
   r(6,8,7,11,'#577a94');r(8,10,3,7,'#a7cfcb');
   r(15,9,5,9,'#78aeb5');r(16,10,3,6,'#b5e2d3');
   line(11,20,12,7,'#f2d6b7');cross(23,10,'#e1b583','#f5db9b');
  }else if(a==='starfold'){
   r(5,5,22,30,'#2c3156');
   for(let x=6;x<27;x+=6){r(x,6,4,23,'#6f6c79');r(x+1,8,2,17,'#a87976');}
   for(let y=10;y<29;y+=5){
    r(6,y,20,2,'#c6a77f');
    for(let x=8;x<25;x+=3){r(x,y-4,2,4,['#bd8d8c','#84a4b7','#dabb83'][(x+y)%3]);}
   }
   for(let i=0;i<8;i++){const x=8+(i*3)%16,y=31-Math.floor(i/2)*3;
    r(x,y,7,2,'#dfc38d');r(x+2,y-3,2,3,'#867d86');
   }
   r(16,7,5,5,'#e4dccf');r(17,8,3,3,'#fff2c6');cross(10,8,'#c4d9db','#fff0b2');
   for(const [x,y] of [[7,24],[23,7],[25,22]])cross(x,y,'#b7b7d5','#f5dba6');
  }else if(a==='caravan'){
   r(5,5,22,30,'#294858');r(5,29,22,6,'#4c695d');
   for(const [x,y,s,c] of [[8,12,7,'#bd91b9'],[20,8,8,'#c5a0cf'],[24,20,5,'#a7a9bf']]){
    r(x-2,y,4,s,'#e1c8a9');r(x-4,y,8,3,c);
    r(x-2,y-2,5,3,'#f2dcc7');dot(x,y,'#efd9e5');
    for(let k=-3;k<=3;k+=3)dot(x+k,y+1,'#fff1d4');
   }
   r(9,23,15,7,'#aa6c57');r(8,20,16,4,'#db9d6e');
   r(10,25,11,3,'#7f5360');r(13,22,5,3,'#eed0a7');
   for(const x of [12,22]){r(x,29,4,4,'#4a5266');r(x+1,30,2,2,'#e4b580');}
   r(8,30,3,2,'#d9a479');r(18,17,2,4,'#edd3a1');
   for(const [x,y] of [[7,9],[15,7],[24,16],[9,20]])cross(x,y,'#c3e1ba','#f7e7a5');
  }
 }else if(arch){
  r(0,0,40,48,'#333448');r(1,1,38,46,'#9d8c87');
  r(3,3,34,42,'#d6bd9c');r(5,5,30,38,'#3b4757');
  for(let y=6;y<43;y+=8){r(5,y,30,1,'#8b7f82');r(8+(y%5),y+1,2,7,'#a28e88');}
  if(a==='moonwatch'){
   r(12,9,16,31,'#2b4267');
   for(let y=15;y<37;y++){let width=Math.floor(9*Math.sqrt(Math.max(0,1-((y-24)/17)**2)));
    if(width>2){r(20-width,y,2,1,'#e1c8aa');r(18+width,y,2,1,'#d0ae91');}
   }
   r(13,10,14,6,'#2d3b62');r(17,7,6,4,'#f5dcba');
   r(16,18,8,9,'#ac987a');r(18,20,5,6,'#d6b982');
   r(19,25,3,5,'#785b66');r(18,30,6,2,'#e7cd9c');
   r(11,33,18,6,'#6e6570');r(14,34,12,3,'#c0b1a4');
   r(24,9,6,7,'#e4e0d0');r(26,7,5,7,'#2b4267');
   line(10,12,16,4,'#d0b48d');line(30,12,24,4,'#b48c82');
   for(const [x,y] of [[8,20],[32,26],[21,5]])cross(x,y,'#c3c8db','#f6dbbd');
  }else if(a==='conservatory'){
   r(10,8,20,34,'#2c6272');r(12,10,16,30,'#74abb0');
   r(19,9,2,31,'#d2b38f');r(11,19,18,2,'#e1caa5');
   for(let x=13;x<29;x+=6){r(x,9,1,31,'#b4c7bf');}
   for(let y=11;y<33;y+=6){r(12,y,16,1,'#8abbbb');}
   r(14,30,12,6,'#56888a');r(16,28,8,4,'#f0d7ae');
   r(17,26,6,3,'#a0cdd0');r(19,23,2,5,'#e7c79a');
   for(const [x,y] of [[11,15],[25,13],[13,24],[27,28]]){
    line(x,y,x+4,y+5,'#719b78');r(x,y,4,2,'#b1d29b');r(x+1,y-2,2,3,'#dfb3cb');
   }
   r(12,37,16,3,'#537b83');r(14,39,12,2,'#c6baa0');
   cross(30,17,'#d1e3d0','#fff7d5');
  }
 }else if(rail){
  r(0,0,48,28,'#2a263c');r(1,2,46,24,a==='briar'?'#6b704f':a==='neon'?'#38456a':'#3c6677');
  r(2,3,44,2,'#ebd3ad');r(2,23,44,2,'#9a877e');
  if(a==='briar'){
   r(3,5,42,18,'#4e584a');
   for(let x=5;x<45;x+=7){
    line(x,20,x+5,8,'#c3a17b');line(x+2,13,x+8,20,'#bead83');
    r(x+1,12,4,2,'#76aa7a');r(x+3,9,4,2,'#accb90');
    r(x+5,17,3,3,'#d4b584');dot(x+6,18,'#fff0d1');
    r(x+1,19,3,2,'#7db28c');
   }
   r(4,6,40,1,'#d3b48b');r(4,21,40,1,'#d3b48b');
  }else if(a==='neon'){
   r(3,5,42,17,'#252d51');
   for(let x=4;x<45;x+=7){
    line(x,8,x+4,14,'#86d7e0');line(x+4,14,x,20,'#e6a2cd');
    line(x+2,8,x+6,14,'#d8e2c9');line(x+6,14,x+2,20,'#9d9bd6');
    r(x+4,12,2,3,'#f6d7e7');
   }
   for(let x=6;x<44;x+=9){cross(x,9,'#78d9dd','#f9bdd5');}
   r(3,6,42,1,'#6d78b9');r(3,21,42,1,'#dd8bac');
  }else{
   r(3,5,42,17,'#2e546a');
   for(let x=5;x<45;x+=8){
    line(x,17,x+4,9,'#e4c6a4');line(x+4,9,x+8,17,'#abcad1');
    r(x+1,17,6,3,'#618e9a');r(x+3,16,3,2,'#e7dfd0');
    dot(x+4,10,'#fff0d3');dot(x+4,12,'#d5f5ef');
   }
   r(3,7,42,1,'#a2c1c4');r(3,21,42,2,'#c9ac8c');
  }
 }else if(rug){
  r(0,0,40,28,'#342f48');r(1,1,38,26,'#d2b58c');
  r(3,3,34,22,a==='cicadapath'?'#315a4f':a==='terracotta'?'#965f57':'#537c98');
  for(let x=4;x<37;x+=4){dot(x,2,'#f0dcac');dot(x,25,'#f1cdaa');}
  for(let y=4;y<24;y+=3){dot(2,y,'#e8bfa3');dot(37,y,'#deba9d');}
  if(a==='cicadapath'){
   r(17,4,6,20,'#e1bd81');r(19,4,2,20,'#8e916b');
   for(const [x,y] of [[8,8],[29,8],[8,19],[29,19]]){
    r(x,y,4,3,'#a9c8bd');r(x-2,y-3,3,4,'#d9e2d7');r(x+4,y-2,3,4,'#d9e2d7');
    r(x+1,y+3,2,3,'#947a76');dot(x+2,y+2,'#33495a');
    r(x-1,y+4,2,1,'#f6e0b3');r(x+5,y+4,2,1,'#f6e0b3');
   }
   for(const [x,y] of [[6,14],[33,14],[13,22],[27,23]])cross(x,y,'#b6cf91','#f4dc9d');
  }else if(a==='terracotta'){
   for(let y=6;y<24;y+=4){
    r(5,y,30,1,'#ddaf8c');r(5+(y%3)*4,y+1,1,3,'#f1caa7');
    r(12+(y%4),y+1,1,3,'#f1caa7');r(27-(y%4),y+1,1,3,'#f1caa7');
   }
   for(const [x,y] of [[7,7],[30,8],[10,19],[30,21]]){
    r(x,y,4,3,'#467c8a');r(x+1,y-2,2,2,'#aac3b6');
    r(x+1,y+3,3,1,'#e2bc9a');
   }
   r(18,9,5,9,'#e8bf88');r(17,11,7,2,'#fff0b8');
   r(20,16,6,2,'#ad7665');dot(20,12,'#fff9d9');
   for(let y=7;y<=21;y+=7){r(16,y,2,2,'#648b72');r(24,y+1,2,3,'#75a280');}
  }else{
   r(5,5,30,18,'#416a8a');r(6,6,28,16,'#8ba9be');
   for(const [x,y] of [[9,9],[19,12],[28,8],[11,20],[29,19]]){
    r(x,y,5,5,'#b97775');r(x+1,y-2,3,3,'#f6cb9d');
    r(x+2,y+1,2,2,'#fdf0bf');r(x-1,y+5,7,1,'#d4e0d7');
   }
   for(const [x,y] of [[8,15],[17,6],[24,22],[32,13]]){cross(x,y,'#dce9ed','#fff5e5');}
   for(let x=6;x<34;x+=6){r(x,6,2,1,'#f5ebd4');r(x+2,21,2,1,'#f5ebd4');}
  }
 }else if(ceiling){
  r(19,0,2,9,'#a6a5a2');r(17,3,6,2,'#d5c0a5');
  if(a==='porcelain'){
   r(9,11,22,2,'#b9acb1');r(13,8,14,3,'#eee1c9');
   r(11,13,18,2,'#71849d');
   for(const [x,y,c] of [[5,20,'#dce7de'],[13,28,'#a2cbd8'],
    [23,23,'#f0e3d0'],[31,32,'#b0c5d7'],[9,39,'#e4d0dd'],[26,41,'#dfeddf']]){
    line(x+3,13,x+3,y,'#bdc6bd');
    r(x,y,7,5,c);r(x+1,y+2,5,3,'#9ab7c1');
    r(x+2,y+5,3,2,'#f4f0de');dot(x+3,y+7,'#fff9ea');
   }
   for(const [x,y] of [[6,8],[33,16],[20,34]])cross(x,y,'#d3e0e7','#fff1d2');
  }else{
   r(9,10,22,4,'#93776a');r(11,9,18,2,'#d0b58d');
   r(14,4,12,8,'#6b5968');r(15,5,10,6,'#e4c599');
   r(18,6,4,4,'#7d756f');r(19,7,2,2,'#f6dba4');
   for(const [x,y,h] of [[4,24,5],[11,34,6],[20,25,4],[29,39,7]]){
    line(x+3,13,x+3,y,'#ad9785');
    r(x,y,7,h,'#a57d6d');r(x+1,y+1,5,h-2,'#d8bc8e');
    r(x+2,y+h,3,2,'#789d93');dot(x+4,y+h-1,'#fff1c9');
   }
   for(const [x,y] of [[7,18],[16,20],[25,34],[33,17]]){
    r(x,y,4,4,'#b39c86');r(x+1,y+1,2,2,'#e8bf80');
   }
   cross(9,7,'#d9cbbe','#fff3d0');cross(30,8,'#d9cbbe','#fff3d0');
  }
 }else{
  // Freestanding piece: grounded silhouette, not flat circular icons.
  r(4,37,24,2,'#39394f');r(8,35,16,2,'#8c787c');
  if(a==='otter'){
   r(7,29,21,6,'#6f6e73');r(9,27,19,3,'#a28b7c');
   r(9,20,17,10,'#a16d5d');r(10,17,12,9,'#be8764');
   r(17,13,9,10,'#d49a70');r(17,11,5,5,'#b67c63');
   r(22,12,5,4,'#bb815f');r(25,16,5,3,'#e6bb8b');
   r(13,23,12,5,'#d3a080');r(8,29,5,3,'#a46f5e');
   r(10,25,4,3,'#d6a88b');r(20,25,3,3,'#e7bb95');
   dot(23,16,'#26394a');r(27,18,2,1,'#473f48');
   r(12,22,7,6,'#8eaebe');r(14,23,4,4,'#e6e9d3');r(15,22,2,2,'#fff7d7');
   for(const [x,y] of [[7,29],[25,29],[6,33]]){r(x,y,2,7,'#6d9c91');r(x+1,y-2,3,3,'#9dc6a0');}
   r(11,33,14,2,'#c29c73');r(18,31,6,2,'#9e806d');
  }else{
   r(9,31,17,5,'#62516e');r(11,28,13,4,'#8e7997');
   line(18,29,14,9,'#908f88');line(18,29,24,12,'#868c83');
   for(const [x,y,s] of [[10,17,5],[20,14,7],[17,8,4],[24,23,4]]){
    r(x,y,s+3,3,'#dfd8cf');r(x+1,y-3,s,4,'#e5e5dc');
    r(x+2,y-4,s-2,2,'#aeb9c7');r(x+2,y+2,2,3,'#a9a4ba');
    dot(x+3,y,'#fff8e4');
   }
   for(const [x,y] of [[9,25],[15,21],[24,26]]){
    r(x,y,4,2,'#7caa98');r(x+2,y-2,2,3,'#b5c9b1');
   }
   r(13,33,11,2,'#b59fbb');r(16,35,5,2,'#ddc5cb');
   for(const [x,y] of [[8,9],[27,15],[6,23]])cross(x,y,'#a6bfd3','#f3e6db');
  }
 }
 return canvas;
}
const artMap=new Map(ITEMS.map(item=>[item.id,paint(item)]));
if(artMap.size!==16||new Set([...old.items,...ITEMS].map(i=>i.id)).size!==104)
 throw Error('v0.33 must add sixteen unique permanent collectible works');
const thumbnailCache=new Map();
function thumbnail(id){
 if(thumbnailCache.has(id))return thumbnailCache.get(id);
 const image=artMap.get(id),url=image?image.toDataURL('image/png'):old.thumbnail(id);
 if(url)thumbnailCache.set(id,url);
 return url;
}
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:Object.freeze([...old.items,...ITEMS]),
 slots:old.slots,quotas:old.quotas,
 texture:id=>artMap.get(id)||old.texture(id),
 thumbnail
});
})();