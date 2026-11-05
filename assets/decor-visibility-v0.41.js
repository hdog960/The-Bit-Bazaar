/* Bit Bazaar v0.41 — per-piece shelf sightlines.
 * Four near-field artwork lanes; no texture or canvas allocations.
 * Keeps the v0.40 center-ray API for old saves and longer distances. */
(()=>{
'use strict';
function create({catalog,getCamera,isBlocked}){
 if(!catalog||typeof getCamera!=='function'||typeof isBlocked!=='function')
  throw Error('Physical decoration sightline dependencies missing');
 const byId=new Map(catalog.items.map(item=>[item.id,item]));
 const LANES=4;
 function hidden(id,slot,point){
  const site=catalog.slots[slot];
  if(!site||!point||!Number.isFinite(point.x)||!Number.isFinite(point.z))
   return true;
  if(site.profile==='endcap'){
   const cam=getCamera();
   if(!cam||!Number.isFinite(cam.x))return true;
   if(site.side==='WEST'&&cam.x>=site.x-.25)return true;
   if(site.side==='EAST'&&cam.x<=site.x+.25)return true;
  }
  const exclude=site.profile==='endcap'&&Number.isInteger(site.fixtureId)?
   site.fixtureId:-1;
  return isBlocked(point,exclude)===true;
 }
 function sample(id,slot,point,u,yaw=0,turn=0){
  const site=catalog.slots[slot];
  if(!site||!point||!Number.isFinite(point.x)||!Number.isFinite(point.z))
   return {x:NaN,z:NaN};
  const kind=site.kind,vertical=site.side==='WEST'||site.side==='EAST';
  const architecture=byId.get(id)?.category==='Architecture';
  const radius=kind==='rug'?2.2:kind==='floor'?.86:kind==='ceiling'?1.03:
   site.profile==='endcap'?.68:architecture?1.42:.99;
  const offset=(Math.max(0,Math.min(1,Number(u)||0))-.5)*radius*2;
  let ux=1,uz=0;
  if(kind==='floor'||kind==='ceiling'){
   ux=Math.cos(yaw);uz=Math.sin(yaw);
  }else if(kind==='rug'){
   ux=Math.cos(turn*Math.PI/2);uz=Math.sin(turn*Math.PI/2);
  }else if(vertical){ux=0;uz=1;}
  return {x:point.x+ux*offset,z:point.z+uz*offset};
 }
 function exposed(id,slot,point,u=.5,yaw=0,turn=0){
  return !hidden(id,slot,sample(id,slot,point,u,yaw,turn));
 }
 function bands(id,slot,point,yaw=0,turn=0){
  // Samples at the center of each projected image lane. A solid shelf that
  // covers only the right half cannot erase the visible left half.
  const result=[];
  for(let i=0;i<LANES;i++)
   result.push(exposed(id,slot,point,(i+.5)/LANES,yaw,turn));
  return result;
 }
 return Object.freeze({hidden,exposed,bands,lanes:LANES});
}
window.BIT_BAZAAR_DECOR_VISIBILITY=Object.freeze({create});
})();