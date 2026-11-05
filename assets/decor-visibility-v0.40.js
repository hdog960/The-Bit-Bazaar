/* Bit Bazaar v0.40 — one visibility rule for 2.5D decoration drawing
 * and reticle inspection. No world mutation, no save writes and no new
 * sprites, canvases or running timers. */
(()=>{
'use strict';
function create({catalog,getCamera,isBlocked}){
 if(!catalog||typeof getCamera!=='function'||typeof isBlocked!=='function')
  throw Error('Physical decoration sightline dependencies missing');
 function hidden(id,slot,point){
  const site=catalog.slots[slot];
  if(!site||!point||!Number.isFinite(point.x)||!Number.isFinite(point.z))
   return true;
  // A purchased painting on a real rack end panel is only visible from
  // that panel's outward side, not through its opaque metal reverse.
  if(site.profile==='endcap'){
   const cam=getCamera();
   if(!cam||!Number.isFinite(cam.x))return true;
   if(site.side==='WEST'&&cam.x>=site.x-.25)return true;
   if(site.side==='EAST'&&cam.x<=site.x+.25)return true;
  }
  // Exclude the owning physical rack ONLY for its attached endcap art.
  // Every other shelf is an opaque wall between camera and artwork.
  const exclude=site.profile==='endcap'&&Number.isInteger(site.fixtureId)?
   site.fixtureId:-1;
  return isBlocked(point,exclude)===true;
 }
 return Object.freeze({hidden});
}
window.BIT_BAZAAR_DECOR_VISIBILITY=Object.freeze({create});
})();