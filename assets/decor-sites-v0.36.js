/* Bit Bazaar v0.36 — 12 append-only final standing sites 220–231.
 * Extends collector display capacity to exactly the planned 75 floor pieces,
 * with minimum 4.4 separation from old stands, 4.6 from rugs and safe aisles. */
(()=>{
'use strict';
const old=window.BIT_BAZAAR_DECOR;
if(!old||old.items.length!==160||old.slots.length!==220)
 throw Error('v0.36 sites require exactly 160 artwork IDs and 220 established anchors');
const coords=[
 [44,56],[26,56],[58,26],[58,56],[12,56],[12,44],
 [12,70],[14,8],[14,14],[14,38],[56,14],[58,70]
];
const additions=coords.map(([x,z],i)=>Object.freeze({
 id:220+i,kind:'floor',side:'FLOOR',x,z,
 name:'FINAL STANDING GALLERY '+String(i+1).padStart(2,'0')+
  ' · X '+x+' / Z '+z
}));
const racks=[];
for(let r=0;r<5;r++)for(let a=0;a<4;a++)racks.push({x:11+a*16,z:11+r*12,w:7.7,d:1.72,nx:0,nz:1,ux:1,uz:0});
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
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),
 previousFloor=old.slots.filter(s=>s.kind==='floor'),
 previousRugs=old.slots.filter(s=>s.kind==='rug');
for(const s of additions){
 if(blocked(s.x,s.z))throw Error('New standing pad touches a shelf: '+s.name);
 if(dist(s,{x:35,z:68})<6)throw Error('Entrance clearance: '+s.name);
 if(previousFloor.some(q=>dist(s,q)<4.4))throw Error('Old standing art spacing: '+s.name);
 if(previousRugs.some(q=>dist(s,q)<4.6))throw Error('Rug clearance: '+s.name);
 if(additions.some(q=>s!==q&&dist(s,q)<5.0))throw Error('New display separation: '+s.name);
 if(old.slots.some(q=>q.id===s.id))throw Error('Historical mount ID collision');
}
if(additions.length!==12||additions.some((s,i)=>s.id!==220+i))
 throw Error('Exactly twelve append-only display sites required');
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:old.items,slots:Object.freeze([...old.slots,...additions]),
 quotas:old.quotas,texture:old.texture,thumbnail:old.thumbnail
});
})();