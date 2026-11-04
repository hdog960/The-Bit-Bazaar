/* Bit Bazaar v0.29 — first-person decoration inspection (non-destructive).
  Reticle hit-test uses the same world projection as 2.5D drawing, is bounded
  to installed artwork within 9 world units, and never changes figure focus.
  No new canvas allocations and no save mutations. */
(()=>{
'use strict';
function create({catalog,getPlaced,position,project,camera,canSee,rotation}){
 const byId=new Map(catalog.items.map(x=>[x.id,x]));
 const MAX_DISTANCE=9;
 const CENTER_X=240,CENTER_Y=135;
 function rectangle(id,site){
  const p=position(id,site.id),cam=camera(),kind=site.kind;
  if(!p||kind==='shelf')return null;
  let corners;
  if(kind==='rug'){
   const turn=(rotation(id)||0)*Math.PI/2,
    ux=Math.cos(turn),uz=Math.sin(turn),vx=-uz,vz=ux;
   corners=[[-2.2,-1.48],[2.2,-1.48],[2.2,1.48],[-2.2,1.48]]
    .map(([a,b])=>project(p.x+ux*a+vx*b,p.z+uz*a+vz*b,.034));
  }else{
   const hanging=kind==='ceiling',floor=kind==='floor';
   const cap=site.profile==='endcap',architecture=byId.get(id)?.category==='Architecture';
   const radius=cap?.68:hanging?1.03:floor?.86:architecture?1.42:.99;
   const top=hanging?4.59:floor?2.55:cap?3.54:architecture?4.2:3.67;
   const bottom=hanging?2.35:floor?.075:cap?1.30:architecture?.65:1.16;
   const vertical=site.side==='WEST'||site.side==='EAST';
   const rx=floor||hanging?Math.cos(cam.yaw):vertical?0:1,
    rz=floor||hanging?Math.sin(cam.yaw):vertical?1:0;
   corners=[
    project(p.x-rx*radius,p.z-rz*radius,top),
    project(p.x+rx*radius,p.z+rz*radius,top),
    project(p.x+rx*radius,p.z+rz*radius,bottom),
    project(p.x-rx*radius,p.z-rz*radius,bottom)
   ];
  }
  if(corners.some(q=>!Number.isFinite(q.depth)||q.depth<.3||q.depth>MAX_DISTANCE+2))return null;
  const left=Math.min(...corners.map(q=>q.x)),right=Math.max(...corners.map(q=>q.x)),
   top=Math.min(...corners.map(q=>q.y)),bottom=Math.max(...corners.map(q=>q.y));
  const margin=4;
  if(CENTER_X<left-margin||CENTER_X>right+margin||
    CENTER_Y<top-margin||CENTER_Y>bottom+margin)return null;
  const depth=Math.min(...corners.map(q=>q.depth));
  return {depth,score:depth+Math.abs(CENTER_X-(left+right)/2)/90+
    Math.abs(CENTER_Y-(top+bottom)/2)/90};
 }
 function find(){
  const cam=camera(),placed=getPlaced();
  if(!cam||!Number.isFinite(cam.x)||!Number.isFinite(cam.z)||!Number.isFinite(cam.yaw))
   return null;
  let best=null;
  for(const pair of placed){
   if(!Array.isArray(pair)||pair.length!==2)continue;
   const [id,slotId]=pair,site=catalog.slots[slotId],item=byId.get(id);
   if(!site||!item||site.kind==='shelf')continue;
   const p=position(id,slotId);
   if(!p||Math.hypot(cam.x-p.x,cam.z-p.z)>MAX_DISTANCE)continue;
   if(site.profile==='endcap'){
    // The sheet metal of the rack blocks its reverse side.
    if(site.side==='WEST'&&cam.x>=site.x-.25)continue;
    if(site.side==='EAST'&&cam.x<=site.x+.25)continue;
   }
   const hit=rectangle(id,site);
   if(!hit||canSee(id,site,p)===false)continue;
   if(!best||hit.score<best.score)
    best={itemId:id,slotId,name:item.name,siteName:site.name,kind:site.kind,
     depth:hit.depth,score:hit.score};
  }
  return best;
 }
 return {find,rectangle};
}
window.BIT_BAZAAR_DECOR_WORLD=Object.freeze({create});
})();