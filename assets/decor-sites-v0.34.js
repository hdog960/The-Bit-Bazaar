/* Bit Bazaar v0.34 — 12 new physical rug and ceiling positions.
 * Six genuine walkable cross-aisle rug locations, six aligned ceiling hooks.
 * Append-only IDs 190..201; never change legacy anchors, shelves or figures. */
(()=>{
'use strict';
const prior=window.BIT_BAZAAR_DECOR;
if(!prior||prior.items.length!==120||prior.slots.length!==190)
 throw Error('v0.34 sites require 120 distinct artworks and 190 earlier mounts');
const pairs=[];
for(const [aisle,x] of [['WEST CROSS',27],['EAST CROSS',43]])
 for(const [row,z] of [['FRONT',17],['CENTER',41],['REAR',65]])
  pairs.push({aisle,x,row,z});
const rugs=pairs.map(({aisle,x,row,z},i)=>Object.freeze({
 id:190+i,kind:'rug',side:'FLOOR',x,z,
 name:aisle+' · '+row+' CONNECTOR · RUG LOCATION'
}));
const ceilings=pairs.map(({aisle,x,row,z},i)=>Object.freeze({
 id:196+i,kind:'ceiling',side:'CEILING',x,z,
 name:aisle+' · '+row+' CONNECTOR · CEILING HOOK'
}));
const racks=[];
for(let r=0;r<5;r++)for(let a=0;a<4;a++)
 racks.push({x:11+a*16,z:11+r*12,w:7.7,d:1.72,nx:0,nz:1,ux:1,uz:0});
for(const x of [9,22,35,48,61]){
 racks.push({x,z:2.5,w:10.5,d:.85,nx:0,nz:1,ux:1,uz:0});
 racks.push({x,z:71.5,w:10.5,d:.85,nx:0,nz:-1,ux:-1,uz:0});
}
for(const z of [10,23,36,49,62]){
 racks.push({x:2.5,z,w:10.5,d:.85,nx:1,nz:0,ux:0,uz:-1});
 racks.push({x:67.5,z,w:10.5,d:.85,nx:-1,nz:0,ux:0,uz:1});
}
function blocked(x,z,pad=.12){
 if(x<1.4+pad||x>68.6-pad||z<1.4+pad||z>72.6-pad)return true;
 for(const f of racks){
  const dx=x-f.x,dz=z-f.z;
  if(Math.abs(dx*f.ux+dz*f.uz)<f.w/2+pad&&
     Math.abs(dx*f.nx+dz*f.nz)<f.d/2+pad)return true;
 }
 return false;
}
const oldRugs=prior.slots.filter(p=>p.kind==='rug'),
 oldFloor=prior.slots.filter(p=>p.kind==='floor'),
 oldCeilings=prior.slots.filter(p=>p.kind==='ceiling');
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const rugsAll=[...oldRugs,...rugs];
for(const rug of rugs){
 // Rug art covers a true 4.4-by-2.96-floor-unit quad; corners remain walkable.
 for(const dx of [-2.2,0,2.2])for(const dz of [-1.48,0,1.48]){
  if(blocked(rug.x+dx,rug.z+dz,.10))
   throw Error('New rug would touch rack or shop wall: '+rug.name);
 }
 for(const old of rugsAll)if(old!==rug&&distance(old,rug)<6)
  throw Error('Rug centers too close: '+rug.name);
 for(const floor of oldFloor)if(distance(rug,floor)<5.4)
  throw Error('New rug would overlap a floor display: '+rug.name);
}
for(const ceiling of ceilings){
 if(blocked(ceiling.x,ceiling.z,.15))
  throw Error('Ceiling hook located inside a shelf: '+ceiling.name);
 for(const other of [...oldCeilings,...ceilings]){
  if(other!==ceiling&&distance(ceiling,other)<7.5)
   throw Error('Ceiling installations too close: '+ceiling.name);
 }
}
const additions=[...rugs,...ceilings];
if(additions.length!==12||additions.some((p,i)=>p.id!==190+i)||
 additions.some(p=>prior.slots.some(q=>q.id===p.id)))
 throw Error('Exactly 12 append-only new mount IDs required');
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:prior.items,slots:Object.freeze([...prior.slots,...additions]),
 quotas:prior.quotas,texture:prior.texture,thumbnail:prior.thumbnail
});
})();