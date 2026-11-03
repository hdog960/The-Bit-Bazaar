/* The Bit Bazaar v0.2.0 — 200 additional handcrafted-rule miniature sets.
   Preserve the original 1,000 figure identities, then extend to 3,000.
   Every new edition has an original colour treatment and pixel accessory in game.js. */
(() => {
 'use strict';
 const db=window.BIT_COLLECTION;
 if(!db || db.sets.length!==100 || db.figures.length!==1000)return;
 const themes=[...new Set(db.sets.map(s=>s.theme))];
 const editions=['Aurora','Obsidian','Royal','Starlit','Arcane','Copper','Phantom','Celestial'];
 const epithets=['Radiant','Resolute','Gilded','Wandering','Mystic','Inventive','Veiled','Eternal'];
 for(let ti=0;ti<themes.length;ti++){
  for(let ei=0;ei<editions.length;ei++){
   const setId=100+ti*editions.length+ei, edition=editions[ei];
   const ids=Array.from({length:10},(_,mi)=>1000+(ti*editions.length+ei)*10+mi);
   db.sets.push({id:setId,name:`${themes[ti]} · ${edition} Edition`,theme:themes[ti],edition,
    icon:db.sets[ti*4].icon,memberIds:ids});
   for(let mi=0;mi<10;mi++){
    const id=ids[mi], sourceId=ti*40+(ei%4)*10+mi,source=db.figures[sourceId];
    db.figures.push({id,setId,setNumber:setId+1,number:mi+1,
     name:`${edition} ${source.role} of ${themes[ti]}`,role:source.role,
     codename:`The ${epithets[ei]}`,sourceId,editionVariant:ei,
     atlasX:(id%25)*32,atlasY:Math.floor(id/25)*40});
   }
  }
 }
 db.atlasRows=120;
 db.description='3,000 individually collectible 16-bit-style figurines across 300 sets of 10';
 window.BIT_COLLECTION_EXTENDED=true;
})();
