/* The Bit Bazaar v0.28 — real vertical gallery endcaps on floor shelving.
  Each floor unit has a solid projected side quad; two narrowly fitted pictures
  decorate those end panels without crossing any figure slot, cleaning target,
  aisle path, or original wall/floor/rug/ceiling/shelf anchor. */
(()=>{
'use strict';
const prior=window.BIT_BAZAAR_DECOR;
if(!prior||prior.items.length!==48||prior.slots.length!==129)
 throw Error('v0.28 endcaps require the exact 48-art, 129-site catalog');
const mounts=[];
for(let row=0;row<5;row++)for(let aisle=0;aisle<4;aisle++){
 const fixture=row*4+aisle,x=11+aisle*16,z=11+row*12;
 const halfWidth=7.7/2,margin=.085;
 for(const end of ['WEST','EAST']){
  const anchor=end==='WEST'?x-halfWidth-margin:x+halfWidth+margin;
  mounts.push(Object.freeze({
   id:129+mounts.length,kind:'wall',side:end,profile:'endcap',
   fixtureId:fixture,x:anchor,z,
   name:'AISLE '+String.fromCharCode(65+aisle)+' · UNIT '+(row+1)+' · '+end+' ENDCAP'
  }));
 }
}
if(mounts.length!==40||mounts.some((s,i)=>s.id!==129+i||s.x<=2||s.x>=68||
  s.z<=2||s.z>=72))
 throw Error('40 exact geometrically aligned endcaps are required');
const originalIds=new Set(prior.slots.map(x=>x.id));
if(mounts.some(s=>originalIds.has(s.id)))throw Error('Never replace old anchors');
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:prior.items,
 slots:Object.freeze([...prior.slots,...mounts]),
 quotas:prior.quotas,texture:prior.texture,thumbnail:prior.thumbnail
});
})();