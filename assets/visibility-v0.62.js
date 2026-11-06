/* Bit Bazaar v0.62 — geometry-only visual integrity corrections.
 * Same art, shelf materials, silhouette atlas, and 480x270 projection.
 * All functions pure: never modify player, saves, fixtures or figure IDs.
 */
(()=>{
'use strict';
const NEAR=.24,FOCAL=360;
function slabSegment(u,n,du,dn,halfU,halfN){
 // Segment is the closed interval 0..1 from camera to actual target.
 // Checking the oriented box's exact entry/exit (not its centre) closes
 // the near-shelf-corner leak in the previous broad-phase.
 let enter=0,exit=1;
 if(Math.abs(du)<1e-9){
  if(Math.abs(u)>halfU)return false;
 }else{
  const t1=(-halfU-u)/du,t2=(halfU-u)/du;
  enter=Math.max(enter,Math.min(t1,t2));
  exit=Math.min(exit,Math.max(t1,t2));
  if(exit<enter)return false;
 }
 if(Math.abs(dn)<1e-9){
  if(Math.abs(n)>halfN)return false;
 }else{
  const t1=(-halfN-n)/dn,t2=(halfN-n)/dn;
  enter=Math.max(enter,Math.min(t1,t2));
  exit=Math.min(exit,Math.max(t1,t2));
 }
 // A shelf at the exact endpoint mustn't erase a legitimate shelf-front
 // figure; a truly intervening slab always blocks the ray.
 return exit>=enter&&exit>.001&&enter<.995;
}
function clipNear(poly,near=NEAR){
 const out=[];
 if(!Array.isArray(poly)||poly.length<3)return out;
 for(let i=0;i<poly.length;i++){
  const b=poly[i],a=poly[(i+poly.length-1)%poly.length];
  const bi=b.depth>=near,ai=a.depth>=near;
  if(ai!==bi){
   const denominator=b.depth-a.depth;
   if(!denominator)continue;
   const t=(near-a.depth)/denominator;
   out.push({
    side:a.side+(b.side-a.side)*t,
    height:a.height+(b.height-a.height)*t,depth:near
   });
  }
  if(bi)out.push(b);
 }
 return out;
}
function view(camera,f,slope,maxDepth=36){
 if(!camera||!f||!Number.isFinite(camera.x)||!Number.isFinite(camera.z)||
    !Number.isFinite(camera.yaw)||!Number.isFinite(slope)||slope<=0)return null;
 const sy=Math.sin(camera.yaw),cy=Math.cos(camera.yaw);
 const halfU=f.w/2,halfN=f.depth/2;
 const poly=[];
 for(const [u,n] of [[-halfU,-halfN],[halfU,-halfN],[halfU,halfN],[-halfU,halfN]]){
  const dx=f.x+f.ux*u+f.nx*n-camera.x;
  const dz=f.z+f.uz*u+f.nz*n-camera.z;
  poly.push({side:dx*cy+dz*sy,depth:dx*sy-dz*cy,height:0});
 }
 const clipped=clipNear(poly);
 if(clipped.length<3)return null;
 const minDepth=Math.min(...clipped.map(v=>v.depth));
 if(minDepth>maxDepth)return null;
 // Frustum testing uses camera depth for each corner, not fixture centre.
 // In particular, a shelf whose middle is BEHIND the camera may have a
 // foreground corner visible during a legitimate tight turn at its end.
 const left=Math.min(...clipped.map(v=>v.side*FOCAL/v.depth));
 const right=Math.max(...clipped.map(v=>v.side*FOCAL/v.depth));
 const pad=44,half=FOCAL*slope;
 if(left>half+pad||right< -half-pad)return null;
 const centerDx=f.x-camera.x,centerDz=f.z-camera.z;
 return {nearDepth:minDepth,centerDepth:centerDx*sy-centerDz*cy,
  left,right,clippedCount:clipped.length};
}
function edgeRisk(camera,figure,width,blockers){
 const dx=figure.x-camera.x,dz=figure.z-camera.z,r2=dx*dx+dz*dz;
 if(r2<.0001)return false;
 for(const b of blockers){
  // Cached b.vx/b.vz and b.radius2 were refreshed by prepareOcclusion.
  // This broad-phase is conservative: a nearby shelf edge gets the exact
  // seven-sample clip, whereas clear open aisles stay single-draw fast.
  const t=Math.max(0,Math.min(1,(b.vx*dx+b.vz*dz)/r2));
  const px=b.vx-t*dx,pz=b.vz-t*dz;
  const r=Math.sqrt(b.radius2)+width*.5+.08;
  if(px*px+pz*pz<=r*r)return true;
 }
 return false;
}
function figureSegments(camera,figure,width,visible,samples=7){
 // The figure is a camera-facing 2D sprite. Even if its middle is visible,
 // its left/right edges may intersect an adjacent rack. Restrict any
 // partially covered silhouette to world-visible intervals. This avoids
 // sprites painting across a shelf corner after the shelf is drawn.
 if(!Number.isFinite(width)||width<=0)return [true,true,true,true,true,true,true];
 const rightX=Math.cos(camera.yaw),rightZ=Math.sin(camera.yaw);
 const cells=[],count=Math.max(3,Math.min(9,Number.isInteger(samples)?samples:7));
 for(let i=0;i<count;i++){
  const offset=((i+.5)/count-.5)*width;
  cells.push(Boolean(visible({
   x:figure.x+offset*rightX,
   z:figure.z+offset*rightZ
  })));
 }
 return cells;
}
window.BIT_BAZAAR_VISIBILITY=Object.freeze({NEAR,slabSegment,clipNear,view,edgeRisk,figureSegments});
})();