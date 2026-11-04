/* Bit Bazaar v0.32 — fifteen NEW floor-display anchors in safe collector aisles.
 * Append-only IDs 169–183. Nonblocking pads and no save migrations.
 * These fill the broad north/south collector corridors between rack columns. */
(()=>{
'use strict';
const old=window.BIT_BAZAAR_DECOR;
if(!old||old.items.length!==88||old.slots.length!==169)
 throw Error('v0.32 sites require 88 decorated items and the original 169 mounts');
const sites=[];
for(const [column,x] of [['A–B',19],['B–C',35],['C–D',51]])
 for(const [row,z] of [['1',11],['2',23],['3',35],['4',47],['5',59]]){
  sites.push(Object.freeze({
   id:169+sites.length,kind:'floor',side:'FLOOR',x,z,
   name:'COLLECTOR AISLE '+column+' · SHELF ROW '+row+' FLOOR DISPLAY'
  }));
 }
if(sites.length!==15||sites.some((p,i)=>p.id!==169+i))
 throw Error('15 append-only floor pads expected');
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
function blocked(x,z,pad=.38){
 if(x<1.4+pad||x>68.6-pad||z<1.4+pad||z>72.6-pad)return true;
 for(const f of racks){
  const dx=x-f.x,dz=z-f.z;
  if(Math.abs(dx*f.ux+dz*f.uz)<f.w/2+pad&&
     Math.abs(dx*f.nx+dz*f.nz)<f.d/2+pad)return true;
 }
 return false;
}
const priorPads=old.slots.filter(s=>s.kind==='floor');
for(const p of sites){
 if(blocked(p.x,p.z))throw Error('New floor pad intersects shelf: '+p.name);
 if(old.slots.some(s=>s.id===p.id))
  throw Error('Never reuse existing decoration anchor IDs');
 if(priorPads.some(s=>Math.hypot(s.x-p.x,s.z-p.z)<4.0))
  throw Error('New floor pad overlaps existing display: '+p.name);
 if(sites.some(q=>q!==p&&Math.hypot(q.x-p.x,q.z-p.z)<4.0))
  throw Error('New floor pads overlap each other');
}
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:old.items,
 slots:Object.freeze([...old.slots,...sites]),
 quotas:old.quotas,texture:old.texture,thumbnail:old.thumbnail
});
})();