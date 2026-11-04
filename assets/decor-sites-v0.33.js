/* Bit Bazaar v0.33 — six NEW aisle-edge floor pads, appended IDs 184–189.
   Uses the exact unchanged rack collision rectangles; never blocks shelf access. */
(()=>{
'use strict';
const old=window.BIT_BAZAAR_DECOR;
if(!old||old.items.length!==104||old.slots.length!==184)
 throw Error('Six new floor pads require all 104 artworks and 184 earlier anchors');
const sites=[];
for(const [side,x] of [['WEST',5],['EAST',65]])
 for(const [row,z] of [[2,24],[3,36],[4,48]]){
  sites.push(Object.freeze({
   id:184+sites.length,kind:'floor',side:'FLOOR',x,z,
   name:side+' PASSAGE · BETWEEN SHELF ROWS '+row+' AND '+(row+1)+' · FLOOR DISPLAY'
  }));
 }
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
function blocked(x,z,pad=.45){
 if(x<1.4+pad||x>68.6-pad||z<1.4+pad||z>72.6-pad)return true;
 for(const f of racks){
  const dx=x-f.x,dz=z-f.z;
  if(Math.abs(dx*f.ux+dz*f.uz)<f.w/2+pad&&
     Math.abs(dx*f.nx+dz*f.nz)<f.d/2+pad)return true;
 }
 return false;
}
const existingFloor=old.slots.filter(s=>s.kind==='floor');
const existingRug=old.slots.filter(s=>s.kind==='rug');
for(const site of sites){
 if(blocked(site.x,site.z))throw Error('Collision with shelf: '+site.name);
 if(old.slots.some(p=>p.id===site.id))throw Error('New site cannot reuse original ID');
 if([...existingFloor,...sites.filter(s=>s!==site)].some(
  p=>Math.hypot(p.x-site.x,p.z-site.z)<4.1))
  throw Error('Floor pads too close: '+site.name);
 if(existingRug.some(p=>Math.hypot(p.x-site.x,p.z-site.z)<4.7))
  throw Error('Floor pad too close to a rug: '+site.name);
}
if(sites.length!==6||sites.some((site,i)=>site.id!==184+i))
 throw Error('Six appended floor pads expected');
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:old.items,slots:Object.freeze([...old.slots,...sites]),
 quotas:old.quotas,texture:old.texture,thumbnail:old.thumbnail
});
})();