/* The Bit Bazaar v0.26 — 25 append-only physically verified exhibition sites.
   No existing anchor ID, original pixel art or decoration price is changed.
   All sites are nonblocking mounts and never modify the 3,000 figures. */
(()=>{
'use strict';
const old=window.BIT_BAZAAR_DECOR;
if(!old||old.items.length!==48||old.slots.length!==104)
 throw Error('v0.26 requires v0.25 48-piece art and all 104 original anchors');
const floor=[
 [5,18,'WEST PASSAGE · FRONT'],[65,18,'EAST PASSAGE · FRONT'],
 [5,30,'WEST PASSAGE · NORTH MID'],[65,30,'EAST PASSAGE · NORTH MID'],
 [5,42,'WEST PASSAGE · CENTER'],[65,42,'EAST PASSAGE · CENTER'],
 [5,54,'WEST PASSAGE · SOUTH MID'],[65,54,'EAST PASSAGE · SOUTH MID'],
 [19,5,'FRONT ROW · WEST'],[51,5,'FRONT ROW · EAST'],
 [19,69,'REAR ROW · WEST'],[51,69,'REAR ROW · EAST']
].map(([x,z,name])=>({kind:'floor',name:name+' FLOOR DISPLAY',side:'FLOOR',x,z}));
const rugs=[
 [19,29,'WEST-CENTER · NORTH'],[35,29,'CENTER · NORTH'],[51,29,'EAST-CENTER · NORTH'],
 [19,53,'WEST-CENTER · SOUTH'],[35,53,'CENTER · SOUTH'],[51,53,'EAST-CENTER · SOUTH']
].map(([x,z,name])=>({kind:'rug',name:name+' RUG SITE',side:'FLOOR',x,z}));
const hooks=[
 [19,65,'BACK · WEST-CENTER'],[35,65,'BACK · CENTRAL'],[51,65,'BACK · EAST-CENTER'],
 [19,42,'CENTER · WEST'],[35,42,'CENTER · MID'],[51,42,'CENTER · EAST'],
 [35,17,'FRONT · MIDDLE']
].map(([x,z,name])=>({kind:'ceiling',name:name+' CEILING HOOK',side:'CEILING',x,z}));
const additions=[...floor,...rugs,...hooks].map((p,i)=>Object.freeze({id:104+i,...p}));
if(additions.length!==25||additions.some((p,i)=>p.id!==104+i))
 throw Error('25 append-only display mounts required');
// Fail fast before entering the world if any future edit moves a display inside a rack.
// This checks original immutable shop fixture rectangles and room perimeter.
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
const blocked=(x,z,pad)=>{
 if(x<1.4+pad||x>68.6-pad||z<1.4+pad||z>72.6-pad)return true;
 for(const f of racks){
  const dx=x-f.x,dz=z-f.z;
  if(Math.abs(dx*f.ux+dz*f.uz)<f.w/2+pad&&
     Math.abs(dx*f.nx+dz*f.nz)<f.d/2+pad)return true;
 }
 return false;
};
for(const p of additions){
 const xs=p.kind==='rug'?[-2.2,0,2.2]:[0],zs=p.kind==='rug'?[-1.48,0,1.48]:[0];
 for(const x of xs)for(const z of zs)
  if(blocked(p.x+x,p.z+z,p.kind==='rug'?.08:.38))
   throw Error('Decoration mount would collide with shelving: '+p.name);
}
const previousIds=new Set(old.slots.map(x=>x.id));
if(additions.some(x=>previousIds.has(x.id)))throw Error('Existing display locations cannot be replaced');
window.BIT_BAZAAR_DECOR=Object.freeze({
 items:old.items,
 slots:Object.freeze([...old.slots,...additions]),
 quotas:old.quotas,
 texture:old.texture,
 thumbnail:old.thumbnail
});
})();