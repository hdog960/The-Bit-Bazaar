/* Bit Bazaar v0.35 — 18 new collision-checked standing-gallery mounts.
 * Append-only IDs 202–219; existing 202 mounts and 3,000 figures unchanged. */
(()=>{
'use strict';
const old=window.BIT_BAZAAR_DECOR;
if(!old||old.items.length!==140||old.slots.length!==202)
 throw Error('v0.35 standing galleries require 140 unique artworks and 202 historical mounts');
const positions=[
 [27,50],[27,32.5],[27,5],[42,50],[27,25],[42,32.5],
 [12,32.5],[42,5],[42,25],[12,50],[12,25],[57,20],
 [57,50],[12,62.5],[57,32.5],[57,62.5],[57,7.5],[57,42.5]
];
const locations=positions.map(([x,z],i)=>Object.freeze({
 id:202+i,kind:'floor',side:'FLOOR',x,z,
 name:'INNER COLLECTOR WALK · '+String(i+1).padStart(2,'0')+
  ' · X '+x+' / Z '+z+' DISPLAY'
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
function blocked(x,z,pad=.7){
 if(x<1.4+pad||x>68.6-pad||z<1.4+pad||z>72.6-pad)return true;
 for(const f of racks){
  const dx=x-f.x,dz=z-f.z;
  if(Math.abs(dx*f.ux+dz*f.uz)<f.w/2+pad&&
     Math.abs(dx*f.nx+dz*f.nz)<f.d/2+pad)return true;
 }
 return false;
}
const sep=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const oldFloor=old.slots.filter(p=>p.kind==='floor'),
 oldRugs=old.slots.filter(p=>p.kind==='rug');
for(const site of locations){
 if(blocked(site.x,site.z))throw Error('Floor pad intersects a fixture: '+site.name);
 if(old.slots.some(s=>s.id===site.id))throw Error('Never reuse saved site IDs');
 if(oldFloor.some(s=>sep(site,s)<4.6))throw Error('Overlaps existing floor art: '+site.name);
 if(oldRugs.some(s=>sep(site,s)<4.7))throw Error('Overlaps existing carpet: '+site.name);
 if(locations.some(s=>s!==site&&sep(site,s)<5.4))
  throw Error('New floor pads too close to each other: '+site.name);
 if(sep(site,{x:35,z:68})<6.0)
  throw Error('Shop entrance must remain clear');
}
if(locations.length!==18||locations.some((p,i)=>p.id!==202+i))
 throw Error('18 append-only standing sites expected');
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:old.items,slots:Object.freeze([...old.slots,...locations]),
 quotas:old.quotas,texture:old.texture,thumbnail:old.thumbnail
});
})();