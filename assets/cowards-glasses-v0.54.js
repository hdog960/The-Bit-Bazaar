/* Bit Bazaar Phase 5 v0.54 — the optional, always honest Coward's Glasses.
   Read-only visual assistance only. No collectible movement or global scans
   per frame. Local labels are derived from *already rendered* figures. */
(()=>{
'use strict';
const UNLOCK=150,MAX_LABELS=6,MAX_LABEL_DISTANCE=5.4;
const validId=id=>Number.isInteger(id)&&id>=0&&id<3000;
function unlocked(lifetime){
 return lifetime instanceof Set?lifetime.size>=UNLOCK:
  Array.isArray(lifetime)&&new Set(lifetime).size>=UNLOCK;
}
function target(carried,rows,shelves){
 if(!validId(carried)||!Array.isArray(rows)||!Array.isArray(shelves))return null;
 const setId=Math.floor(carried/10);
 // Read shelves only when a figure or shelf assignment changes, NOT per frame.
 for(let face=0;face<Math.min(rows.length,60);face++){
  const stack=rows[face],shelf=shelves[face];
  if(!Array.isArray(stack)||!shelf?.fixture)continue;
  for(let row=0;row<Math.min(stack.length,5);row++){
   const members=stack[row];
   if(!Array.isArray(members)||!members.some(id=>validId(id)&&Math.floor(id/10)===setId))continue;
   const f=shelf.fixture,normal=shelf.face>0?1:-1;
   const x=f.x+f.nx*normal*(f.depth/2+.65);
   const z=f.z+f.nz*normal*(f.depth/2+.65);
   if(!Number.isFinite(x)||!Number.isFinite(z))return null;
   return {setId,face,row,x,z,number:carried%10+1};
  }
 }
 // No shelf already started = no arrow. Never reveal unstarted destinations.
 return null;
}
function direction(player,destination){
 if(!player||!destination)return null;
 const dx=destination.x-player.x,dz=destination.z-player.z;
 const distance=Math.hypot(dx,dz);
 if(!Number.isFinite(distance)||!Number.isFinite(player.yaw))return null;
 const right=dx*Math.cos(player.yaw)+dz*Math.sin(player.yaw);
 const forward=dx*Math.sin(player.yaw)-dz*Math.cos(player.yaw);
 return {distance,angle:Math.atan2(right,forward)};
}
function drawArrow(ctx,w,h,player,destination){
 const facing=direction(player,destination);
 if(!facing)return false;
 // A single hand-drawn floor-chevron at the player's feet, rotated to
 // the target bearing. Unlike a world-positioned arrow it works behind us.
 const cy=h*.80,cx=w/2;
 ctx.save();
 ctx.translate(cx,cy);ctx.rotate(facing.angle);
 ctx.fillStyle='#192432dd';ctx.beginPath();
 ctx.moveTo(0,-35);ctx.lineTo(15,-13);ctx.lineTo(7,-13);
 ctx.lineTo(7,11);ctx.lineTo(-7,11);ctx.lineTo(-7,-13);
 ctx.lineTo(-15,-13);ctx.closePath();ctx.fill();
 ctx.fillStyle='#a9ffe0';ctx.beginPath();
 ctx.moveTo(0,-30);ctx.lineTo(11,-15);ctx.lineTo(4,-15);
 ctx.lineTo(4,9);ctx.lineTo(-4,9);ctx.lineTo(-4,-15);
 ctx.lineTo(-11,-15);ctx.closePath();ctx.fill();
 ctx.restore();
 ctx.fillStyle='#14252bdd';ctx.fillRect(cx-59,cy+15,118,15);
 ctx.font='bold 9px monospace';ctx.textAlign='center';
 ctx.fillStyle='#dbffe7';
 ctx.fillText('ROW '+(destination.row+1)+'  ·  '+Math.round(facing.distance)+'m',cx,cy+26);
 ctx.textAlign='start';
 return true;
}
function drawHighlights(ctx,entities,project,player,w,h){
 let count=0;
 for(const e of entities){
  if(count>=MAX_LABELS)break;
  if(e.type!=='fig')continue;
  const f=e.piece;
  if(!f?.onFloor||!validId(f.id))continue;
  const d=Math.hypot(f.x-player.x,f.z-player.z);
  if(d>MAX_LABEL_DISTANCE||d<.3)continue;
  const p=project(f.x,f.z,.95);
  if(!p||p.depth<=.3||p.x<24||p.x>w-24||p.y<19||p.y>h-20)continue;
  const label='#'+(f.id%10+1)+' · SET '+(Math.floor(f.id/10)+1);
  ctx.fillStyle='#183440db';ctx.fillRect(p.x-28,p.y-17,56,13);
  ctx.fillStyle='#bfffe3';ctx.font='bold 7px monospace';
  ctx.textAlign='center';ctx.fillText(label,p.x,p.y-8);ctx.textAlign='start';
  count++;
 }
 return count;
}
window.BIT_BAZAAR_GLASSES=Object.freeze({
 UNLOCK,MAX_LABELS,unlocked,target,direction,drawArrow,drawHighlights
});
})();
