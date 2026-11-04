/* The Bit Bazaar v0.25 — twelve individually composed pixel decorations.
   Strict append-only upgrade: 36 prior products, 104 placement anchors, and
   all originals/ownership IDs remain unchanged. Draw pixels once at startup. */
(()=>{
'use strict';
const prior=window.BIT_BAZAAR_DECOR;
if(!prior||prior.items.length!==36||prior.slots.length!==104)
 throw Error('v0.25 additions require the v0.24 original 36-piece gallery');
const ITEMS=[
 {id:'foxfire-railway',name:'The Foxfire Railway',category:'Framed Art',mount:'wall',price:3,art:'foxfire',
  description:'A miniature steam train threads a sapphire pine forest, followed by a train of copper lanterns and wandering foxfire.'},
 {id:'keeper-of-the-deep',name:'Keeper of the Deep',category:'Framed Art',mount:'wall',price:6,art:'deep',
  description:'A lonely clock tower still shines beneath the ocean, where silver fish circle its midnight dial.'},
 {id:'moss-crowned-golem',name:'The Moss-Crowned Golem',category:'Statues',mount:'floor',price:8,art:'golem',
  description:'A granite guardian with broad stone arms, creeping moss, and a tiny wildflower growing from its crown.'},
 {id:'porcelain-fox',name:'The Porcelain Fox',category:'Statues',mount:'floor',price:4,art:'fox',
  description:'A delicate white ceramic fox with painted blue eyes and gold-kintsugi seams curls around a pale jade pedestal.'},
 {id:'twilight-bonsai',name:'Twilight Bonsai',category:'Plants',mount:'floor',price:4,art:'bonsai',
  description:'An ancient crooked bonsai holds a canopy of amethyst leaves sprinkled with tiny stars.'},
 {id:'honeybell-orchid',name:'Honeybell Orchid',category:'Plants',mount:'floor',price:3,art:'orchid',
  description:'Golden bell-shaped blossoms lean from emerald stems above a porcelain planter, drawing a painted copper bee.'},
 {id:'firefly-jar-lamp',name:'The Firefly Jar Lamp',category:'Lighting',mount:'floor',price:2,art:'fireflies',
  description:'An iron-handled jar of warm wandering fireflies glows against smoked green glass and a small oak stand.'},
 {id:'observatory-beacon',name:'The Observatory Beacon',category:'Lighting',mount:'floor',price:7,art:'beacon',
  description:'A tall teal glass astronomer’s lamp channels a pale star through a brass telescope-shaped housing.'},
 {id:'patchwork-dragon-quilt',name:'Patchwork Dragon Quilt',category:'Rugs',mount:'rug',price:3,art:'dragon-quilt',
  description:'A woven crimson quilt patterned with tiny dragon silhouettes, ember scales and mismatched gold stitching.'},
 {id:'winter-observatory-carpet',name:'Winter Observatory Carpet',category:'Rugs',mount:'rug',price:5,art:'winter-carpet',
  description:'Deep indigo carpet stitched with silver snowflake sextants and a constellation of icy crystal stars.'},
 {id:'singing-shell-cascade',name:'Singing Shell Cascade',category:'Ceilings',mount:'ceiling',price:4,art:'shells',
  description:'An airy hanging mobile of pearlescent seashells, translucent sea glass and slender golden chimes.'},
 {id:'clockmakers-comet',name:"The Clockmaker's Comet",category:'Ceilings',mount:'ceiling',price:6,art:'comet',
  description:'A suspended clockwork comet with fiery brass gears, cobalt enamel and a cascading trail of copper stars.'}
];
function paint(item){
 const rug=item.mount==='rug',ceiling=item.mount==='ceiling',frame=item.mount==='wall';
 const c=document.createElement('canvas');c.width=rug?40:ceiling?40:32;c.height=rug?28:ceiling?48:40;
 const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;
 const p=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h)};
 const line=(x,y,dx,dy,n,color)=>{for(let i=0;i<n;i++)p(x+i*dx,y+i*dy,1,1,color)};
 const a=item.art;
 if(frame){
  // Scenic framed story compositions are painted independently below.
  p(1,2,30,36,'#5c4656');p(3,3,26,34,'#c7a26f');
  p(5,6,22,28,a==='foxfire'?'#233c54':'#26394e');
  p(6,7,20,25,a==='foxfire'?'#31516a':'#325675');
  if(a==='foxfire'){
   // Layered pine silhouettes and luminous nighttime hillside.
   p(6,22,20,10,'#294f4e');p(6,27,20,6,'#233c4d');
   for(const [x,h] of [[7,13],[11,10],[16,15],[22,11],[26,14]]){
    p(x,28-h,2,h,'#1d4850');
    p(x-2,22-h,6,2,'#406970');p(x-1,19-h,4,2,'#34646c');
    p(x,16-h,2,4,'#6d9a84');
   }
   p(6,28,20,2,'#b39063');p(7,30,19,2,'#51475b');
   // Tiny copper locomotive, cab window, wheels and steam.
   p(8,24,13,4,'#bd6c5d');p(9,23,7,1,'#e1a56f');
   p(15,20,5,4,'#bd915b');p(16,21,3,2,'#a8d5cf');
   p(9,21,2,3,'#f2ca96');p(11,22,3,2,'#8f4c55');
   for(const x of [10,15,20])p(x,28,2,2,'#dfbb83');
   p(9,18,2,2,'#c8d9cc');p(8,16,2,2,'#a4c5c5');
   // Foxfire is dispersed, not a repeated glow icon.
   for(const [x,y] of [[9,11],[14,15],[23,10],[24,19],[7,20]])p(x,y,2,2,'#f7d8a2');
   p(25,8,2,2,'#e9dbba');p(19,8,3,1,'#b5cfce');
  }else{
   // Underwater masonry, submerged clock dial, swimming silver fish.
   for(let y=10;y<33;y+=5){p(6,y,20,1,'#46758b');p(9,y+2,3,1,'#6c91a3');}
   p(10,13,13,20,'#536676');p(12,15,9,17,'#9e918a');
   p(13,10,8,5,'#b5a087');p(14,8,6,2,'#d8be9a');
   p(15,17,5,5,'#e7d6b8');p(16,18,3,3,'#2b5566');
   p(17,17,1,2,'#67556a');p(17,19,2,1,'#67556a');
   for(let y=25;y<=31;y+=3)p(14,y,5,2,'#4b576a');
   p(8,27,3,5,'#508e82');p(23,25,2,8,'#609c92');
   for(const [x,y] of [[7,13],[21,11],[22,20],[7,24]]){
    p(x,y,3,2,'#c2cfc6');p(x+3,y+1,2,1,'#dce4d0');p(x,y+1,1,1,'#354961');
   }
   for(const [x,y] of [[9,9],[24,16],[11,22],[25,29]])p(x,y,1,2,'#d4eee4');
   p(7,32,19,1,'#709094');
  }
  p(2,4,2,32,'#e7ba80');p(28,4,2,32,'#916a60');
  for(let x=5;x<28;x+=4){p(x,4,2,1,'#e9d4a2');p(x,35,2,1,'#f1c98c');}
  p(4,37,24,1,'#342c43');
 }else if(rug){
  if(a==='dragon-quilt'){
   p(0,0,40,28,'#572f46');p(1,1,38,26,'#d19a68');p(3,3,34,22,'#7d3d53');
   // Twelve individually contrasted patch squares, alternating textile motifs.
   for(let y=4;y<24;y+=7)for(let x=4;x<37;x+=8){
    const even=((x/8+y/7)|0)&1;
    p(x,y,7,6,even?'#b55c5c':'#e1a06a');
    p(x+1,y+1,5,4,even?'#7b4b63':'#96485a');
    p(x+2,y+2,3,2,even?'#e9bb83':'#f0d3a5');
    p(x+4,y+1,2,1,'#f9e3ae');
   }
   // Distinct curled dragon emblem in the center.
   p(15,9,10,3,'#d5a168');p(21,11,4,7,'#edc57e');
   p(14,16,10,3,'#eabf78');p(13,13,4,4,'#eabf78');
   p(13,10,3,2,'#fff0b8');p(14,12,1,1,'#3d3046');
   p(18,12,5,3,'#e48365');p(24,14,3,2,'#f3d095');
   for(let x=3;x<37;x+=5){p(x,2,2,1,'#ffe1a8');p(x,25,2,1,'#c18d69');}
  }else{
   p(0,0,40,28,'#293b5e');p(1,1,38,26,'#b5b9bf');p(3,3,34,22,'#273e63');
   for(let x=5;x<37;x+=5){p(x,4,2,1,'#9bb7c5');p(x,23,2,1,'#b6d5d9');}
   for(let y=5;y<23;y+=5){p(4,y,2,1,'#a5d3d5');p(34,y,2,1,'#e1dce1');}
   // Main star compass and six different flake branches.
   p(18,8,4,13,'#d1dfdb');p(12,12,16,3,'#e3e6df');
   p(15,9,10,8,'#547d97');p(17,11,6,5,'#f3ead8');
   p(19,6,2,5,'#f5e8d0');p(19,18,2,5,'#f5e8d0');
   p(10,13,5,2,'#f5e8d0');p(25,13,5,2,'#f5e8d0');
   for(const [x,y] of [[8,8],[31,8],[8,20],[30,20],[12,6],[27,22]]){
    p(x,y,1,5,'#b0d2db');p(x-2,y+2,5,1,'#d0dce1');
    p(x-1,y+1,3,3,'#84b6c5');
   }
   p(17,12,6,4,'#eae9e1');p(19,11,2,7,'#7b9cb8');
  }
 }else if(ceiling){
  p(19,1,2,9,'#8b7d8c');p(16,2,8,2,'#9c9ca9');
  if(a==='shells'){
   p(6,11,28,2,'#b9a784');p(9,10,22,1,'#f0d9b6');
   for(const [x,y,size,color] of [
    [6,20,8,'#d6c6c4'],[15,16,10,'#acc7c6'],[27,21,8,'#e5c4ad'],
    [11,32,8,'#efdbbf'],[23,35,9,'#a4d0ce']
   ]){
    p(x+Math.floor(size/2),11,1,y-11,'#b7ae9d');
    p(x+1,y,Math.max(3,size-2),size-3,color);
    p(x,y+3,size,2,'#f1e4d6');p(x+2,y+2,size-4,2,'#fff0dc');
    p(x+size/2,y+size-3,1,6,'#c5b894');
    p(x+1,y+size-1,size-2,1,'#8b8fa4');
   }
   for(let i=0;i<7;i++){const x=6+i*5,y=13+i%3*5;p(x,y,2,2,i%2?'#b8e0d6':'#9bb7c7');}
   p(19,41,2,6,'#ead2b1');
  }else{
   // Suspended mechanical projectile, unique diagonal golden tail and gears.
   for(let i=0;i<13;i++){
    const x=7+i*2,y=12+i;
    p(x,y,3,2,i%2?'#dba068':'#88a9b5');
    p(x+1,y-2,1,2,'#f5ce88');
   }
   p(7,13,12,11,'#e2b47a');p(9,14,9,9,'#aa6b5e');
   p(11,16,5,6,'#3b6584');p(12,17,3,4,'#7fb3bd');
   for(let i=0;i<10;i++){const x=12+Math.round(Math.cos(i*.628)*7),y=18+Math.round(Math.sin(i*.628)*7);p(x,y,2,2,i%2?'#f1d39c':'#f7e9c5');}
   p(6,16,3,3,'#e9d5a1');p(4,19,3,3,'#f5bd70');
   p(25,29,3,3,'#eac58f');p(29,34,3,3,'#b8dce2');
   p(33,39,2,4,'#f7dca2');p(31,43,4,2,'#f6e8c0');
  }
 }else{
  // Four distinct silhouette families for statues, plants, and light fixtures.
  p(6,36,20,3,'#514458');p(9,33,14,3,'#9a8371');
  if(a==='golem'){
   p(11,14,12,18,'#7b8480');p(13,10,8,7,'#9d9f8a');
   p(9,8,16,4,'#52786c');p(12,5,11,4,'#709c70');
   p(14,4,2,4,'#d5bd88');p(16,3,3,4,'#c7d2a1');p(17,1,1,3,'#eab59a');
   p(6,16,6,13,'#737c7c');p(22,15,7,14,'#747c79');
   p(8,18,3,8,'#a0a89a');p(24,18,3,8,'#bbc0a4');
   p(12,28,5,5,'#596965');p(19,28,5,5,'#62746d');
   p(15,15,2,2,'#a7d9ba');p(21,15,2,2,'#a7d9ba');
   p(17,19,3,5,'#60736b');p(10,23,4,3,'#649276');
   p(24,25,3,3,'#5d946d');p(6,28,4,3,'#476859');
   p(16,25,4,2,'#c7b9a0');
  }else if(a==='fox'){
   p(10,20,15,11,'#d5d8d4');p(13,14,10,11,'#f0ecda');
   p(10,9,5,8,'#ebe9db');p(21,9,5,8,'#d8e5e2');
   p(14,11,9,8,'#fcf2df');p(10,22,18,6,'#f4ede0');
   p(8,24,5,6,'#e3e4d7');p(24,25,5,5,'#dfebe6');
   p(13,17,2,2,'#648db0');p(21,17,2,2,'#648db0');
   p(17,21,3,2,'#bd9b83');p(18,23,2,2,'#e7b49e');
   for(const [x,y] of [[11,23],[15,29],[23,13],[26,27]]){p(x,y,1,4,'#cba573');p(x+1,y+2,3,1,'#f6dca0');}
   p(6,30,5,3,'#b5d2bb');p(24,29,4,4,'#d3e4d5');
  }else if(a==='bonsai'){
   p(11,30,13,4,'#aa8b77');p(13,27,9,3,'#c3aa84');
   p(16,17,4,11,'#7f5a53');p(13,13,5,7,'#8a6956');
   p(19,13,7,3,'#977257');p(8,19,9,3,'#72524e');
   for(const [x,y,w] of [[5,9,12],[16,6,12],[9,12,16],[21,13,9]]){
    p(x,y,w,5,'#595880');p(x+2,y-2,w-4,4,'#8775a3');
    p(x+4,y-3,Math.max(2,w-8),3,'#c0abc6');
   }
   for(const [x,y] of [[7,11],[23,8],[14,14],[27,14],[10,6],[20,5]]){
    p(x,y,2,2,'#f3d5da');p(x+1,y-1,1,1,'#ffeedb');
   }
   p(17,28,3,4,'#694b4f');p(10,33,15,3,'#5b525e');
  }else if(a==='orchid'){
   p(10,31,14,4,'#efdfc0');p(12,28,10,4,'#9fbb9f');
   p(16,12,2,17,'#5a946f');p(22,11,2,17,'#6a9b78');
   p(11,22,8,3,'#74a98d');p(21,23,9,3,'#65a184');
   for(const [x,y] of [[8,11],[19,6],[24,15],[12,18]]){
    p(x,y,8,4,'#e2a95f');p(x+1,y+2,6,4,'#f3d38a');
    p(x+3,y+3,2,3,'#fff0b6');p(x+3,y+5,1,2,'#c48166');
   }
   p(27,8,3,2,'#e7d195');p(28,10,1,2,'#b78254');
   p(25,11,2,1,'#9bb8a1');p(14,30,4,2,'#cbd1b6');
  }else if(a==='fireflies'){
   p(9,11,15,21,'#809f9a');p(11,12,11,19,'#315863');
   p(10,9,13,3,'#c69d70');p(12,7,9,2,'#e1c49a');
   p(13,5,7,2,'#836b5d');p(16,3,2,3,'#c0b09a');
   p(10,16,2,13,'#8db3ac');p(21,16,2,13,'#5d9294');
   for(const [x,y] of [[13,15],[18,17],[15,23],[20,25],[12,28],[18,28]]){
    p(x,y,2,2,'#f5d391');p(x-1,y+1,4,1,'#e0b87c');
    p(x,y,1,1,'#fff4b8');
   }
   p(12,32,10,2,'#af9882');p(8,34,17,2,'#674f58');
  }else if(a==='beacon'){
   p(13,13,8,20,'#b69b80');p(15,11,4,15,'#6c8790');
   p(11,10,12,5,'#6698a0');p(9,14,15,3,'#d6bc87');
   p(10,6,13,4,'#2d6175');p(12,4,9,4,'#91c8c8');
   p(13,6,7,5,'#d9ecdc');p(15,6,3,4,'#fff1c0');
   p(5,10,7,4,'#c2a47d');p(6,7,9,4,'#6e8c94');
   p(7,8,6,2,'#f2dca4');p(3,8,4,1,'#ffebba');
   p(21,10,7,3,'#b5987e');p(26,8,3,2,'#d3cfad');
   p(11,30,13,3,'#807381');p(9,33,17,3,'#6a5664');
   p(15,2,3,3,'#deb980');p(15,1,3,1,'#f6e6b8');
  }
 }
 return c;
}
const textures=new Map(ITEMS.map(item=>[item.id,paint(item)]));
if(textures.size!==12)throw Error('Twelve new individual pieces are required');
const thumbCache=new Map();
function thumbnail(id){
 if(thumbCache.has(id))return thumbCache.get(id);
 const tex=textures.get(id),data=tex?tex.toDataURL('image/png'):prior.thumbnail(id);
 if(data)thumbCache.set(id,data);
 return data;
}
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:Object.freeze([...prior.items,...ITEMS]),
 slots:prior.slots,
 quotas:prior.quotas,
 texture:id=>textures.get(id)||prior.texture(id),
 thumbnail
});
})();