/* The Bit Bazaar v0.29 — Twelve new individual pixel-art decorations.
   Each character/object has custom shapes, palette and meaningful distinctive
   details, drawn once into 32×40, 40×28, or 40×48 pixel canvases. */
(()=>{
'use strict';
const previous=window.BIT_BAZAAR_DECOR;
if(!previous||previous.items.length!==56||previous.slots.length!==169)
 throw Error('v0.29 art must extend the original 56-piece, 169-site gallery');
const ITEMS=[
 {id:'ivory-stag-automaton',name:'Ivory Stag Automaton',category:'Statues',mount:'floor',price:7,art:'stag',
  description:'A poised ceramic deer with branching copper antlers, clockwork joints and a luminous amber heart inside its chest.'},
 {id:'lantern-librarian',name:'The Lantern Librarian',category:'Statues',mount:'floor',price:5,art:'librarian',
  description:'A weathered stone scholar balances a miniature stack of red books while holding aloft a tiny glass reading lantern.'},
 {id:'velvet-sundew',name:'Velvet Sundew',category:'Plants',mount:'floor',price:3,art:'sundew',
  description:'Scarlet jeweled leaves curl above a midnight-blue planter, with translucent dew pearls glowing at their tips.'},
 {id:'copperleaf-fern',name:'Copperleaf Fern',category:'Plants',mount:'floor',price:4,art:'fern',
  description:'An elaborate copper-veined fern fans out of a blue ceramic pot, its leaves shifting from jade to burnished orange.'},
 {id:'celestial-globe-lamp',name:'Celestial Globe Lamp',category:'Lighting',mount:'floor',price:6,art:'globe',
  description:'A little gyroscopic moon orbits a pearly illuminated planet inside concentric brass rings and a walnut pedestal.'},
 {id:'winter-hearth-lantern',name:'Winter Hearth Lantern',category:'Lighting',mount:'floor',price:4,art:'hearth',
  description:'A frost-painted iron lantern shelters an amber candle behind detailed leaded panes and silver snowflake filigree.'},
 {id:'alchemist-checker-runner',name:"The Alchemist's Checker Runner",category:'Rugs',mount:'rug',price:4,art:'checker',
  description:'A deep wine-red textile of alternating potion bottles, golden keys, rune tiles and tiny stitched arcane symbols.'},
 {id:'midnight-koi-tapestry',name:'Midnight Koi Tapestry',category:'Rugs',mount:'rug',price:6,art:'koi',
  description:'A navy and teal woven floor rug portrays two mirrored ivory koi, crimson gills and swirling lily-pad currents.'},
 {id:'aurora-crane-mobile',name:'Aurora Paper Crane Mobile',category:'Ceilings',mount:'ceiling',price:5,art:'cranes',
  description:'Folded paper cranes hang from a fine willow ring, their painted wings fading from mint and lavender to warm gold.'},
 {id:'brass-rain-chandelier',name:'Brass Rain Chandelier',category:'Ceilings',mount:'ceiling',price:8,art:'rain',
  description:'Layered copper arcs suspend twelve different crystal raindrops, shimmering between cobalt, turquoise and honey.'},
 {id:'pocket-storm-bottle',name:'Pocket Storm in a Bottle',category:'Curios',mount:'floor',price:3,art:'storm',
  description:'A tiny bottled thundercloud contains silver lightning, rolling blue mist, a brass cork and a miniature sailing ship.'},
 {id:'inkwell-planetarium',name:'The Inkwell Planetarium',category:'Curios',mount:'floor',price:7,art:'inkwell',
  description:'A dark porcelain inkwell holds a microcosm of tiny golden planets, floating orbits and a delicate silver quill.'}
];
function paint(item){
 const kind=item.mount;
 const rug=kind==='rug',hanging=kind==='ceiling',w=rug||hanging?40:32,h=rug?28:hanging?48:40;
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 const rect=(x,y,ww,hh,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,ww,hh)};
 const pt=(x,y,c)=>rect(x,y,1,1,c);
 const line=(a,b,c,d,col)=>{let dx=Math.abs(c-a),dy=Math.abs(d-b),sx=a<c?1:-1,sy=b<d?1:-1,err=dx-dy;
  for(;;){pt(a,b,col);if(a===c&&b===d)break;let e=2*err;if(e>-dy){err-=dy;a+=sx}if(e<dx){err+=dx;b+=sy}}};
 const pixelStar=(x,y,color)=>{rect(x-1,y,3,1,color);rect(x,y-1,1,3,'#f7eccb')};
 const a=item.art;
 if(rug){
  // Individually woven compositions: a gridded collection versus flowing
  // water with two recognizable fish. Edge stitches emphasize textile form.
  if(a==='checker'){
   rect(0,0,40,28,'#4c344a');rect(1,1,38,26,'#cf9e73');rect(3,3,34,22,'#5c3659');
   for(let row=0;row<3;row++)for(let col=0;col<5;col++){
    const x=4+col*7,y=4+row*7,even=(col+row)%2===0;
    rect(x,y,6,6,even?'#914b63':'#b07364');
    rect(x+1,y+1,4,4,even?'#613b57':'#e0a479');
    if((col+row)%3===0){
     rect(x+2,y+1,2,3,'#a8c8bd');rect(x+1,y+4,4,1,'#e6c38e');pt(x+2,y+2,'#f6dcab');
    }else if((col+row)%3===1){
     rect(x+2,y+1,1,4,'#e7cf8e');rect(x+1,y+2,4,1,'#f5dea6');pt(x+4,y+4,'#b87d67');
    }else{
     rect(x+1,y+2,4,2,'#86afa4');pt(x+2,y+1,'#f3d3b0');rect(x+3,y+4,2,1,'#deb886');
    }
   }
   for(let x=3;x<=36;x+=4){pt(x,2,'#f8deaa');pt(x,25,'#d7b07b');}
   for(let y=3;y<25;y+=4){pt(2,y,'#e9cb9d');pt(37,y,'#c38f84');}
   rect(16,12,8,3,'#e8b983');rect(19,9,2,10,'#f4d69c');
  }else{
   rect(0,0,40,28,'#23374d');rect(1,1,38,26,'#b1b9aa');rect(3,3,34,22,'#24536b');
   // Curved currents, mirrored paired fish and detached lily motifs.
   for(let y=5;y<25;y+=5){line(5,y,15,y+2,'#488d99');line(24,y+1,35,y-1,'#68a4ad');}
   rect(10,8,10,4,'#dddccb');rect(14,11,9,4,'#f4eadb');
   rect(22,17,9,4,'#d3dfd3');rect(17,14,9,4,'#f0ead9');
   for(const [x,y] of [[10,10],[25,18]]){
    rect(x,y,3,2,'#cc776c');rect(x+1,y+1,2,1,'#d8a183');
    rect(x-3,y+2,3,2,'#e2d6ba');pt(x+1,y+3,'#233c53');
    pt(x+2,y,'#303c55');
   }
   for(const [x,y] of [[8,6],[32,8],[9,21],[30,23]]){
    rect(x,y,6,2,'#6d9e81');rect(x+2,y-2,3,2,'#91b48c');
    pt(x+1,y+2,'#e7dba7');
   }
   rect(5,3,30,1,'#9fc5bd');rect(5,24,30,1,'#9fc5bd');
   for(let x=5;x<35;x+=5){pt(x,2,'#d9c6b1');pt(x,25,'#e2d1b7');}
  }
 }else if(hanging){
  rect(19,0,2,10,'#b6a4a1');rect(17,2,6,2,'#8d858e');
  if(a==='cranes'){
   rect(8,11,24,2,'#ba9e77');rect(10,10,20,1,'#e2d0a2');
   for(const [x,y,c,d] of [[5,17,'#b8e0d0','#66aaa2'],[16,23,'#d9b5d4','#9f80b9'],
    [27,16,'#f0d39b','#bf996b'],[9,34,'#a4bcda','#6c8ba8'],[25,36,'#d8e4be','#86b79a']]){
    line(x+4,12,x+4,y,c);
    rect(x+1,y+3,8,3,c);rect(x+3,y,4,4,d);
    line(x+1,y+3,x-2,y-2,c);line(x+8,y+3,x+11,y-2,c);
    rect(x+3,y+6,2,3,'#e4caad');pt(x+9,y+4,'#fff0d3');
   }
   for(const [x,y] of [[7,8],[30,9],[14,33],[34,29],[20,44]])pixelStar(x,y,'#e7d69c');
  }else{
   rect(8,10,24,3,'#d4b486');rect(7,13,26,2,'#886979');
   rect(12,17,16,2,'#d8ac71');rect(15,20,10,2,'#e3c590');
   rect(19,4,2,6,'#d9b184');
   for(const [x,y,n,col] of [[9,23,3,'#7abdc7'],[16,27,4,'#b1d4d8'],[23,22,3,'#d1a5bb'],
    [30,28,4,'#d8dcb5'],[12,35,3,'#72acc2'],[25,38,4,'#edc987']]){
    line(x,y-7,x,y,col);
    rect(x-1,y,3,n+2,'#6d92aa');rect(x,y+1,2,n,'#e3e8d8');
    pt(x,y+n+3,'#f6e5b4');
   }
   for(let x=9;x<32;x+=4){rect(x,12,2,2,'#e7c993');rect(x+1,15,1,2,'#b58277');}
   for(const [x,y] of [[8,18],[32,17],[6,29],[36,32]])pixelStar(x,y,'#eecba4');
  }
 }else{
  // Each upright piece has a defined contact shadow and dedicated silhouette.
  rect(5,37,23,2,'#3d394a');rect(7,35,19,2,'#79687a');
  if(a==='stag'){
   rect(11,21,12,12,'#d9ddd0');rect(13,16,9,8,'#f5e9d7');
   rect(14,11,7,7,'#eee2ce');rect(12,17,2,7,'#dbc4b2');
   line(14,13,8,3,'#b28c72');line(20,13,26,2,'#c6aa83');
   line(8,3,6,9,'#dfba8d');line(26,2,28,10,'#d8b18b');
   line(9,5,14,7,'#eed3a5');line(25,5,19,8,'#f0c898');
   rect(11,32,3,4,'#abb8b3');rect(21,31,3,5,'#e4d4bd');
   rect(15,23,5,6,'#9e957f');rect(16,24,3,4,'#f7d398');
   pt(14,17,'#658ca0');pt(22,17,'#658ca0');
   rect(18,19,2,2,'#aa8c84');rect(18,28,2,3,'#d3a880');
   for(const [x,y] of [[10,27],[23,27],[15,33],[19,10]])pt(x,y,'#fff2d8');
  }else if(a==='librarian'){
   rect(10,15,14,18,'#777783');rect(12,11,10,8,'#aca8a2');
   rect(13,8,9,5,'#c9c0b0');rect(13,15,2,5,'#e3d3bf');
   rect(17,14,4,3,'#736474');pt(16,14,'#f6ead3');
   rect(7,21,8,6,'#a76468');rect(9,19,9,3,'#cc9c78');
   rect(9,27,8,4,'#4d5369');rect(11,28,6,1,'#e4b687');
   rect(21,20,4,9,'#bcb6a6');line(24,21,27,12,'#d7c1a3');
   rect(24,9,6,5,'#d9a871');rect(25,10,4,3,'#f8e1aa');
   rect(12,31,4,5,'#5f6271');rect(21,31,4,5,'#86858a');
   for(let y=23;y<30;y+=2){rect(7,y,7,1,'#e1b091');pt(14,y,'#5d3e52');}
   pt(17,17,'#4d536a');pt(20,17,'#4d536a');rect(18,20,3,1,'#d9c9aa');
  }else if(a==='sundew'){
   rect(11,32,15,4,'#5e4e77');rect(13,28,11,5,'#48465f');
   for(const [x,y,dir] of [[12,20,-1],[18,14,1],[23,22,1],[9,26,-1]]){
    line(18,30,x,y,'#749582');
    rect(x-3,y-2,7,4,'#a9556c');rect(x-1,y-4,5,3,'#d67e78');
    for(let k=0;k<5;k++)pt(x-3+k,y-3+(k%2),'#f0b0a2');
    pt(x+dir*4,y-3,'#ffeed7');pt(x-2,y+3,'#e1bec9');
   }
   rect(13,31,9,1,'#a88bac');rect(15,34,6,2,'#9588aa');
   for(const [x,y] of [[7,17],[26,14],[5,26],[26,25]])pixelStar(x,y,'#efc6aa');
  }else if(a==='fern'){
   rect(10,32,15,4,'#4c6b83');rect(12,27,11,6,'#8a9bab');
   line(17,28,17,7,'#a18c64');
   for(let k=0;k<9;k++){
    const y=8+k*2,reach=3+Math.floor((9-Math.abs(4-k))*.8);
    line(16,y,16-reach,y-2,'#739585');line(19,y,19+reach,y-2,'#b58367');
    rect(15-reach,y-3,3,2,'#649c80');rect(18+reach,y-3,3,2,'#dc9a62');
    pt(15-reach,y-4,'#dfc48a');pt(19+reach,y-4,'#e8b879');
   }
   rect(14,30,7,2,'#f2d6a1');rect(13,34,9,1,'#4c5470');
   for(const [x,y] of [[8,13],[25,9],[6,26],[28,24]])pt(x,y,'#c4cf9f');
  }else if(a==='globe'){
   rect(12,32,11,4,'#71505c');rect(14,26,7,7,'#d5ad78');
   rect(10,12,18,13,'#b2a485');rect(13,9,13,15,'#719ba7');
   rect(15,10,9,12,'#c5d8c6');rect(17,11,5,9,'#e5e8d8');
   rect(19,11,2,12,'#8bb6be');
   for(let i=0;i<8;i++){const x=10+(i*3)%18,y=11+(i*5)%13;
    pt(x,y,i%2?'#a4c3c5':'#dfb989');}
   line(8,14,27,23,'#c49c76');line(10,26,25,10,'#e1ba85');
   rect(8,12,2,15,'#a47d72');rect(27,12,2,15,'#c49d71');
   rect(20,7,4,3,'#f0d7a4');rect(21,6,3,2,'#fff0c9');
   rect(13,35,9,2,'#e6c996');pt(11,20,'#fff7d4');
  }else if(a==='hearth'){
   rect(8,12,20,20,'#6d7f8c');rect(10,10,16,4,'#d3dce0');
   rect(13,8,11,4,'#a0adb8');rect(16,5,5,3,'#d9c1a3');
   rect(11,15,14,15,'#333d54');rect(13,17,10,11,'#b57662');
   rect(15,19,6,8,'#f5cf88');rect(17,18,3,6,'#fff4bc');
   line(18,15,18,30,'#b8cdd0');line(11,24,26,24,'#c1cbd1');
   for(const [x,y] of [[10,14],[25,15],[9,28],[26,27]]){
    pixelStar(x,y,'#c6dbe2');rect(x,y+3,2,1,'#f4efd9');
   }
   rect(10,31,16,4,'#73737e');rect(12,34,12,2,'#c2b2a4');
   pt(18,10,'#fff2e1');pt(19,31,'#d6c8c3');
  }else if(a==='storm'){
   rect(13,6,12,4,'#b68c6d');rect(15,4,8,3,'#9b7f72');
   rect(9,11,20,22,'#5d8b9a');rect(11,12,16,19,'#255267');
   rect(12,17,14,8,'#8595a3');rect(14,15,10,8,'#b8b9b7');
   rect(16,19,10,5,'#71899c');rect(13,24,12,5,'#426c86');
   line(20,19,16,25,'#f5e3b7');line(16,25,21,24,'#f6c889');
   rect(18,28,6,2,'#baa28b');rect(16,30,10,2,'#d7ccb1');
   rect(20,26,1,4,'#f4ead3');rect(21,25,4,1,'#ebd2ad');
   rect(10,13,2,15,'#aed3d0');rect(26,16,2,13,'#93bec4');
   pixelStar(8,19,'#d2e7e7');pixelStar(28,14,'#b5c8da');
   rect(12,33,14,3,'#9a7c75');
  }else if(a==='inkwell'){
   rect(10,22,17,13,'#3e425e');rect(12,19,13,5,'#827789');
   rect(13,25,11,8,'#34384f');rect(15,29,8,2,'#e2b88c');
   line(25,22,28,7,'#b9c8c9');line(28,7,24,5,'#dfe8dd');
   line(28,7,30,4,'#d9ae85');pt(30,3,'#fae8b9');
   rect(12,9,11,10,'#435d7c');rect(14,10,7,7,'#7e8fa5');
   rect(16,11,4,5,'#e4cf9e');rect(17,12,2,3,'#f8ebbc');
   line(10,15,25,12,'#bb9c80');line(12,7,25,17,'#d6b77f');
   for(const [x,y] of [[9,12],[21,9],[26,14],[13,18]])pixelStar(x,y,'#dfd6b6');
   rect(9,34,19,2,'#6a5669');rect(13,35,10,2,'#a58b82');
  }
 }
 return canvas;
}
const images=new Map(ITEMS.map(item=>[item.id,paint(item)]));
if(images.size!==12)throw Error('Exactly twelve fresh authored decorations required');
const thumbnailCache=new Map();
function thumbnail(id){
 if(thumbnailCache.has(id))return thumbnailCache.get(id);
 const image=images.get(id),result=image?image.toDataURL('image/png'):previous.thumbnail(id);
 if(result)thumbnailCache.set(id,result);
 return result;
}
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:Object.freeze([...previous.items,...ITEMS]),
 slots:previous.slots,quotas:previous.quotas,
 texture:id=>images.get(id)||previous.texture(id),
 thumbnail
});
})();