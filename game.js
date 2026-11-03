/* Bit Bazaar visual revision 0.1.2: clipped shelf geometry, walnut rear panels, readable distance signs. */
/* THE BIT BAZAAR — no framework, no remote services, no external dependencies.
   First-person software projection; 1,000 real, separate collectibles.
   World coordinates are in store floor units. Figures never respawn when shelved. */
(() => {
'use strict';
const DB = window.BIT_COLLECTION;
if (!DB || DB.figures.length !== 1000 || DB.sets.length !== 100) {
 document.body.innerHTML = '<p style="color:white;padding:30px">Collection asset could not load. Keep the assets folder beside index.html.</p>';return;
}
const $ = id => document.getElementById(id);
const canvas = $('world'), ctx = canvas.getContext('2d',{alpha:false});
const W=480, H=270, FOCAL=360, HORIZON=133, EYE=1.64;
ctx.imageSmoothingEnabled=false;
const img = new Image(); img.src='assets/figurines.png';
const NUM_RACKS=20, ROWS=5, PER_ROW=10, MAX_TOTE=10;
const STORE_KEY='bit-bazaar-save-v1';
const SW=70, SD=74;
const shelves=[];
// 4 large aisles × 5 racks; 5 rows × 10 slots = exact 1,000 slots.
for(let r=0;r<5;r++)for(let a=0;a<4;a++){
 shelves.push({id:r*4+a,x:11+a*16,z:11+r*12,w:7.7,depth:1.05,
  name:`SHELF ${String(r*4+a+1).padStart(2,'0')}`,aisle:String.fromCharCode(65+a)});
}
let player={x:35,z:68,yaw:0};
let tote=[],rows=[],selected=null, floor=[], figureById=DB.figures;
let modal='', focus=null, playing=false, shift=false, activeSet=0, albumQuery='';
let lastSave=0,lastFrame=performance.now(), toastTimer=0;
const keys=new Set(), touch={lookId:null,lastX:0,lastY:0,joyId:null,axisX:0,axisY:0};
let targetBoxes=[], floorBuffer=ctx.createImageData(W,H-HORIZON);
const allUsed=()=>new Set([...tote,...rows.flat(2)]);
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const sqr=n=>n*n;
function srand(seed){ let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;}; }
const rng=srand(20261102);
function setupFloor(){
 floor=[];const used=allUsed();
 for(let i=0;i<1000;i++){
  let x,z,n=0;
  do{ x=2.5+rng()*65;z=3+rng()*67;n++; }
  while(n<150 && (blocked(x,z,0.28)|| (sqr(x-35)+sqr(z-68)<5)));
  floor.push({id:i,x,z,onFloor:!used.has(i)});
 }
}
function resetState(){
 rows=Array.from({length:NUM_RACKS},()=>Array.from({length:ROWS},()=>[]));
 tote=[];selected=null;player={x:35,z:68,yaw:0};setupFloor();save();stats();
}
function restore(){
 let raw;try{raw=JSON.parse(localStorage.getItem(STORE_KEY)||'null')}catch(e){raw=null}
 // Preserve a full backup before opening saves from the 3,000-figure build in safe mode.
 if(raw&&Array.isArray(raw.rows)&&raw.rows.length===60){
  try{localStorage.setItem('bit-bazaar-v020-save-backup',JSON.stringify(raw))}catch(e){}
  raw={...raw,rows:Array.from({length:20},(_,i)=>raw.rows[i*2]),
    tote:Array.isArray(raw.tote)?raw.tote.filter(id=>Number.isInteger(id)&&id>=0&&id<1000):[],
    selected:Number.isInteger(raw.selected)&&raw.selected<1000?raw.selected:null};
 }
 if(!raw||raw.version!==1 || !Array.isArray(raw.rows)||raw.rows.length!==20){resetState();return}
 rows=Array.from({length:20},(_,a)=>Array.from({length:5},(_,b)=>{
  let v=raw.rows[a]&&raw.rows[a][b];return Array.isArray(v)?v.filter(Number.isInteger).filter(id=>id>=0&&id<1000).slice(0,10):[];
 }));
 const used=new Set();
 for(const rack of rows)for(const row of rack){
  const setId=row.length?Math.floor(row[0]/10):-1;
  for(let k=row.length-1;k>=0;k--){const id=row[k];if(used.has(id)||(id/10|0)!==setId)row.splice(k,1);else used.add(id)}
 }
 let old=Array.isArray(raw.tote)?raw.tote:[];
 tote=old.filter(id=>Number.isInteger(id)&&id>=0&&id<1000&&!used.has(id)).slice(0,MAX_TOTE);
 for(const id of tote)used.add(id);
 selected=tote.includes(raw.selected)?raw.selected:(tote[0]??null);
 if(raw.player && isFinite(raw.player.x)&&isFinite(raw.player.z)&&isFinite(raw.player.yaw)&&!blocked(raw.player.x,raw.player.z,0.2)){
  player={x:clamp(raw.player.x,2,68),z:clamp(raw.player.z,2,72),yaw:raw.player.yaw};
 }else player={x:35,z:68,yaw:0};
 setupFloor();stats();
}
function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify({version:1,tote,rows,selected,player}))}catch(e){}}
function blocked(x,z,pad=.3){
 if(x<1.4+pad||x>SW-1.4-pad||z<1.4+pad||z>SD-1.4-pad)return true;
 for(const s of shelves){if(Math.abs(x-s.x)<s.w/2+pad && Math.abs(z-s.z)<s.depth/2+pad)return true}
 return false;
}
function stats(){
 const placed=rows.flat(2).length;
 const completed=rows.reduce((n,r)=>n+r.filter(x=>x.length===10).length,0);
 $('placed').textContent=placed.toLocaleString();$('complete').textContent=completed;
 $('toteCount').textContent=`${tote.length} / ${MAX_TOTE} FIGURES`;
 $('progress-fill').style.width=`${placed/10}%`;
 $('aisleLabel').textContent=`${nearestAisle()} · ${Math.max(0,1000-placed)} TO SHELVE`;
 if(placed===1000){setTimeout(()=>showVictory(),1200)}
}
function nearestAisle(){const i=clamp(Math.round((player.x-11)/16),0,3);return `AISLE ${'ABCD'[i]}`;}
function showVictory(){if(!playing)return;playing=false;$('screen').classList.add('shown');
 $('screen').querySelector('.title-card').innerHTML='<div class="eyebrow">★ PERFECT COLLECTION ★</div><h1>ALL<br><em>SORTED!</em></h1><p>Every unique figurine has a home. You organized all 100 sets across 100 shelf rows. THE BIT BAZAAR is now a collector’s dream.</p><button id="victoryBtn" class="primary large">EXPLORE YOUR STORE →</button>';
 $('victoryBtn').onclick=()=>{playing=true;$('screen').classList.remove('shown')};
}
function notify(s,kind='normal'){
 $('toast').textContent=s;$('toast').classList.add('visible');
 if(kind==='bad')$('toast').style.borderColor='#fb8188';else $('toast').style.borderColor='#dbab64';
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2200);
}
function countSet(sid){let count=0;for(const rack of rows)for(const row of rack)for(const id of row)if((id/10|0)===sid)count++;return count;}
function rowForSet(sid){for(let s=0;s<20;s++)for(let r=0;r<5;r++)if(rows[s][r].length&&(rows[s][r][0]/10|0)===sid)return [s,r];return null;}
const figure=id=>figureById[id];
const iconHTML=id=>`<span class="sprite" aria-hidden="true" style="background-position:-${figure(id).atlasX}px -${figure(id).atlasY}px"></span>`;
function openDrawer(kind, data){modal=kind;
 $('drawer').classList.add('open');$('drawerShade').classList.add('show');$('drawer').setAttribute('aria-hidden','false');
 if(kind==='shelf'){const s=shelves[data];$('drawerKicker').textContent=`AISLE ${s.aisle} · DISPLAY ${s.id+1}/20`;$('drawerTitle').textContent=s.name;}
 else if(kind==='tote'){$('drawerKicker').textContent='YOUR CARRIED COLLECTION';$('drawerTitle').textContent='POCKET TOTE';}
 else if(kind==='album'){$('drawerKicker').textContent='1,000 MINIATURE TREASURES';$('drawerTitle').textContent='COLLECTION ALMANAC';}
 activeShelf=data;renderDrawer();
}
let activeShelf=0;
function closeDrawer(){modal='';$('drawer').classList.remove('open');$('drawerShade').classList.remove('show');$('drawer').setAttribute('aria-hidden','true');}
function renderDrawer(){if(modal==='shelf')renderShelf();else if(modal==='tote')renderTote();else if(modal==='album')renderAlbum();}
function currentSelected(){return tote.includes(selected)?selected:(tote[0]??null);}
function renderTote(){
 const sel=currentSelected();
 let html=`<div class="info-strip">Collect up to <b>10 figures</b> at a time. Select one to prepare it for shelving. Match all 10 figures of a set in a single display row.</div>`;
 if(!tote.length)html+='<div class="empty">Your tote is empty.<br>Walk up to a figurine on the floor and pick it up.</div>';
 else{
  html+='<p class="label">SELECTED: '+(sel===null?'NONE':figure(sel).name.toUpperCase())+'</p><div class="figure-grid">';
  for(const id of tote)html+=`<button class="figure-card ${id===sel?'active':''}" data-select="${id}" title="${figure(id).name} · ${DB.sets[figure(id).setId].name}">${iconHTML(id)}<span>#${String(id+1).padStart(4,'0')}</span></button>`;
  html+='</div>';
  if(sel!==null)html+=`<div class="info-strip"><b>${figure(sel).name}</b><br>${DB.sets[figure(sel).setId].name}<br>Figure ${figure(sel).number} of 10 · Set ${figure(sel).setId+1} of 100</div>`;
 }
 html+='<div class="footer-actions"><span class="label">SHOP OPERATIONS</span><button id="viewAlbum" class="chrome">VIEW ALL SETS</button></div>';
 $('drawerBody').innerHTML=html;
 $('drawerBody').querySelectorAll('[data-select]').forEach(el=>el.onclick=()=>{selected=+el.dataset.select;save();renderTote()});
 $('viewAlbum').onclick=()=>openDrawer('album');
}
function renderShelf(){
 const r=shelves[activeShelf],arr=rows[r.id],sel=currentSelected();
 let html=`<div class="info-strip">Each of the <b>five rows holds exactly 10 figurines</b> from ONE collectible set. Placing the first figure assigns its set to that row. Other sets cannot be mixed in.</div>`;
 if(sel!==null)html+=`<div class="label">READY TO PLACE</div><div class="detail-figure" style="margin:8px 0 15px">${iconHTML(sel)}<div><b>${figure(sel).name}</b><span>${DB.sets[figure(sel).setId].name}</span></div></div>`;
 else html+='<div class="info-strip">Your tote is empty. Pick up some floor figurines first.</div>';
 html+='<div class="label">DISPLAY ROWS · BOTTOM TO TOP</div>';
 for(let ri=0;ri<5;ri++){
  const figIds=arr[ri],sid=figIds.length?figure(figIds[0]).setId:null;
  const set =sid===null?null:DB.sets[sid];
  const compatible=sel!==null&&figIds.length<10&&(sid===null||sid===figure(sel).setId)&&(!rowForSet(figure(sel).setId)||rowForSet(figure(sel).setId).join()===`${r.id},${ri}`);
  html+=`<button class="row-btn ${figIds.length===10?'full':!compatible&&sel!==null?'incompatible':''}" data-row="${ri}"><div class="row-meta"><b>ROW ${ri+1} · ${set?set.name:'UNASSIGNED'}</b><em>${figIds.length}/10 ${figIds.length===10?'✓':''}</em></div><div class="row-figs">`;
  for(let k=0;k<10;k++)html+=`<span class="slot">${figIds[k]!==undefined?iconHTML(figIds[k]):'·'}</span>`;
  html+=`</div><div style="font-size:9px;margin-top:6px;color:${compatible?'#9de9cc':'#beaabb'}">${compatible?'TAP TO PLACE SELECTED FIGURE':figIds.length===10?'COMPLETE ROW':sel===null?'PICK UP A FIGURE FIRST':sid!==null&&sid!==figure(sel).setId?'DIFFERENT SET — NOT ALLOWED':rowForSet(figure(sel).setId)?'THIS SET HAS ANOTHER ROW':'ROW UNAVAILABLE'}</div></button>`;
  if(figIds.length)html+=`<button class="back" style="font-size:10px" data-take="${ri}">↶ Take last figure back into tote</button>`;
 }
 html+='<div class="info-strip">Display capacity: <b>50 figures</b> per shelf. Your shop contains exactly 20 of these shelves.</div>';
 $('drawerBody').innerHTML=html;
 $('drawerBody').querySelectorAll('[data-row]').forEach(el=>el.onclick=()=>placeFig(r.id,+el.dataset.row));
 $('drawerBody').querySelectorAll('[data-take]').forEach(el=>el.onclick=()=>takeFig(r.id,+el.dataset.take));
}
function placeFig(shelfId,rowId){
 const id=currentSelected();if(id===null){notify('Your tote is empty. Find some figures first.','bad');return}
 const target=rows[shelfId][rowId], sid=figure(id).setId;
 if(target.length===10){notify('This row is already full.','bad');return}
 if(target.length&&figure(target[0]).setId!==sid){notify('Set mismatch! Each row must contain a single complete set.','bad');return}
 let existing=rowForSet(sid);
 if(existing&&(existing[0]!==shelfId||existing[1]!==rowId)){notify(`That set belongs on Shelf ${existing[0]+1}, Row ${existing[1]+1}.`,'bad');return}
 tote.splice(tote.indexOf(id),1);target.push(id);selected=tote[0]??null;
 save();stats();if(modal==='shelf')renderShelf();
 if(target.length===10)notify(`SET COMPLETE! ${DB.sets[sid].name} ✓`);
 else notify(`${figure(id).name} displayed · ${target.length}/10`);
}
function takeFig(shelfId,rowId){const row=rows[shelfId][rowId];if(!row.length)return;
 if(tote.length>=MAX_TOTE){notify('Tote full! Place some figures first.','bad');return}
 const id=row.pop();tote.push(id);selected=id;save();stats();if(modal==='shelf')renderShelf();notify(`${figure(id).name} returned to tote.`);
}
function renderAlbum(){
 let html=`<div class="info-strip">100 original collectible series × 10 unique figurines. Search by a series name, or inspect any series to see what you have shelved.</div><div class="album-toolbar"><input id="albumSearch" class="search" placeholder="Search 100 collectible sets..." type="search" value="${albumQuery.replace(/["<>&]/g,'')}" /></div>`;
 html+='<div id="albumResults"></div><div class="footer-actions"><button class="reset-button" id="resetBtn">RESET SAVED STORE</button><span class="label">PROGRESS SAVES AUTOMATICALLY</span></div>';
 $('drawerBody').innerHTML=html;
 const search=$('albumSearch');search.oninput=()=>{albumQuery=search.value;paintAlbumList()};
 $('resetBtn').onclick=()=>$('confirm').hidden=false;
 paintAlbumList();
}
function paintAlbumList(){const dest=$('albumResults');if(!dest)return;
 const filter=albumQuery.toLowerCase().trim();let html='';
 for(const set of DB.sets){if(filter&&!`${set.name} ${set.theme} ${set.id+1}`.toLowerCase().includes(filter))continue;
  const cnt=countSet(set.id);html+=`<button class="album-card" data-albumset="${set.id}"><div><b>${String(set.id+1).padStart(3,'0')} · ${set.name}</b><span>${set.theme} miniatures</span></div><div class="meter">${cnt}/10 ${cnt===10?'★':''}</div></button>`;
 }
 dest.innerHTML=html||'<div class="empty">No matching collectible series.</div>';
 dest.querySelectorAll('[data-albumset]').forEach(el=>el.onclick=()=>renderSetDetail(+el.dataset.albumset));
}
function renderSetDetail(sid){
 activeSet=sid;const set=DB.sets[sid],place=rowForSet(sid);
 let html=`<button class="back" id="backAlbum">← BACK TO 100 SETS</button><div class="info-strip"><b>${set.name}</b><br>${countSet(sid)} / 10 shelved · ${place?`Shelf ${place[0]+1}, Row ${place[1]+1}`:'No display row assigned yet'}</div><div class="album-detail-grid">`;
 for(const id of set.memberIds){
  let status='SCATTERED ON FLOOR';if(tote.includes(id))status='IN TOTE';
  else for(const rack of rows)for(const row of rack)if(row.includes(id))status='✓ ON DISPLAY';
  html+=`<div class="detail-figure">${iconHTML(id)}<div><b>${figure(id).role}</b><span>#${String(id+1).padStart(4,'0')}</span><div class="status">${status}</div></div></div>`;
 }
 html+='</div><div class="info-strip">All ten figures are original to this series, with distinct pixel-art silhouettes or equipment and individual collection identifiers.</div>';
 $('drawerBody').innerHTML=html;
 $('backAlbum').onclick=()=>renderAlbum();
}
function grabFig(id){
 if(tote.length>=MAX_TOTE){notify('Tote is full! Visit a shelf to unload.','bad');return}
 const f=floor[id];if(!f||!f.onFloor)return;
 f.onFloor=false;tote.push(id);selected=id;
 stats();save();notify(`FOUND #${String(id+1).padStart(4,'0')} · ${figure(id).name}`);
}
function forward(){return {x:Math.sin(player.yaw),z:-Math.cos(player.yaw)}}
// Depth-aware perspective is required when a shelf corner passes the camera.
function project(x,z,h){
 const dx=x-player.x,dz=z-player.z,sy=Math.sin(player.yaw),cy=Math.cos(player.yaw);
 const dep=dx*sy-dz*cy,side=dx*cy+dz*sy,d=Math.max(.18,dep);
 return {x:W/2+side*FOCAL/d,y:HORIZON+(EYE-h)*FOCAL/d,depth:dep,side,height:h};
}
function screenPoint(v){const d=Math.max(.18,v.depth);return {x:W/2+v.side*FOCAL/d,y:HORIZON+(EYE-v.height)*FOCAL/d};}
function cameraDepth(x,z){return (x-player.x)*Math.sin(player.yaw)-(z-player.z)*Math.cos(player.yaw)}
function cameraSide(x,z){return (x-player.x)*Math.cos(player.yaw)+(z-player.z)*Math.sin(player.yaw)}
function findFocus(){
 const dir=forward();let shelfFocus=null, bestShelf=1e4;
 for(const s of shelves){
  const dist=Math.hypot(player.x-s.x,player.z-s.z);
  const frontDist=player.z-(s.z+s.depth/2);
  if(frontDist<-.3||frontDist>4.2||Math.abs(player.x-s.x)>s.w/2+1.1)continue;
  const fd=(s.x-player.x)*dir.x+(s.z-player.z)*dir.z;
  if(fd<.4)continue;
  if(dist<bestShelf){bestShelf=dist;shelfFocus={kind:'shelf',id:s.id,dist}}
 }
 let closest=null, best=1e3;
 for(const f of floor){if(!f.onFloor)continue;
  const dx=f.x-player.x,dz=f.z-player.z,dist=Math.hypot(dx,dz);
  if(dist>2.8||dist<.12)continue;
  let fd=dx*dir.x+dz*dir.z, side=Math.abs(dx*dir.z-dz*dir.x);
  if(fd<-.45||side>1.55)continue;
  const score=dist+side*.85+(fd<0?2:0);
  if(score<best){best=score;closest={kind:'figure',id:f.id,dist}}
 }
 // Shelf sorting takes priority if carrying items and facing a shelf.
 if(shelfFocus&&tote.length)return shelfFocus;
 return closest || shelfFocus;
}
function interact(){if(modal){closeDrawer();return}if(!focus){notify('Walk toward a figurine or display shelf.');return}
 if(focus.kind==='figure')grabFig(focus.id);else openDrawer('shelf',focus.id);
}
function updateFocus(){
 focus=findFocus();const box=$('interact');
 if(!focus||modal||!playing){box.classList.add('hidden');$('actionLabel').textContent='LOOK';return}
 box.classList.remove('hidden');
 if(focus.kind==='figure'){
  $('interactName').textContent=figure(focus.id).name.toUpperCase();
  $('interactDescription').textContent=`${DB.sets[figure(focus.id).setId].name} · PICK UP`;
  $('actionLabel').textContent=tote.length>=10?'TOTE FULL':'PICK UP';
 }else{
  $('interactName').textContent=shelves[focus.id].name + ' · 5 DISPLAY ROWS';
  $('interactDescription').textContent='VIEW SHELF / PLACE FIGURE';
  $('actionLabel').textContent='SHELF';
 }
}
// Software-rendered, gently patterned 16-bit style tile floor.
function drawFloor(){
 const dat=floorBuffer.data, sy=Math.sin(player.yaw), cy=Math.cos(player.y);
 let i=0;
 for(let y=HORIZON;y<H;y++){
  const depth=EYE*FOCAL/Math.max(1,y-HORIZON);
  const fog=clamp((depth-8)/95,0,.65);
  const cx=player.x+sy*depth,cz=player.z-cy*depth;
  const incrX=cy*depth/FOCAL, incrZ=sy*depth/FOCAL;
  let wx=cx-incrX*W/2,wz=cz-incrZ*W/2;
  for(let x=0;x<W;x++){
   const tx=Math.floor(wx*1.05),tz=Math.floor(wz*1.05);
   const grX=(wx*1.05-tx),grZ=(wz*1.05-tz);
   const grout=(grX<.025||grZ<.025),check=(tx+tz)&1;
   const grain=(tx*13+tz*23+x*3+y*7)&7;
   let r=check?63:71,g=check?50:59,b=check?70:78;
   if(grout){r-=20;g-=17;b-=19;}
   if(grain===1){r+=7;g+=7;b+=9;}
   r=r*(1-fog)+20*fog;g=g*(1-fog)+19*fog;b=b*(1-fog)+36*fog;
   dat[i]=r;dat[i+1]=g;dat[i+2]=b;dat[i+3]=255;i+=4;
   wx+=incrX;wz+=incrZ;
  }
 }
 ctx.putImageData(floorBuffer,0,HORIZON);
}
function solidQuad(a,b,c,d,color){
 const near=.24,poly=[a,b,c,d],clipped=[];
 for(let i=0;i<poly.length;i++){
  const curr=poly[i],prev=poly[(i+poly.length-1)%poly.length];
  const inside=curr.depth>=near,wasInside=prev.depth>=near;
  if(inside!==wasInside){
   const t=(near-prev.depth)/(curr.depth-prev.depth);
   clipped.push({side:prev.side+(curr.side-prev.side)*t,height:prev.height+(curr.height-prev.height)*t,depth:near});
  }
  if(inside)clipped.push(curr);
 }
 if(clipped.length<3)return;
 ctx.beginPath();const first=screenPoint(clipped[0]);ctx.moveTo(first.x,first.y);
 for(let i=1;i<clipped.length;i++){const v=screenPoint(clipped[i]);ctx.lineTo(v.x,v.y);}
 ctx.closePath();ctx.fillStyle=color;ctx.fill();
}
function line3(ax,az,ah,bx,bz,bh,col,w=1){
 let a=project(ax,az,ah),b=project(bx,bz,bh);const near=.24;
 if(a.depth<near&&b.depth<near)return;
 if(a.depth<near){const t=(near-a.depth)/(b.depth-a.depth);a={side:a.side+(b.side-a.side)*t,height:a.height+(b.height-a.height)*t,depth:near};}
 else if(b.depth<near){const t=(near-b.depth)/(a.depth-b.depth);b={side:b.side+(a.side-b.side)*t,height:b.height+(a.height-b.height)*t,depth:near};}
 const p=screenPoint(a),q=screenPoint(b);
 ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
}
function quadAt(x1,x2,z,h1,h2,col){solidQuad(project(x1,z,h2),project(x2,z,h2),project(x2,z,h1),project(x1,z,h1),col)}
function drawWall(wall){
 let {x1,z1,x2,z2}=wall;const d1=cameraDepth(x1,z1),d2=cameraDepth(x2,z2);
 if(d1<.15&&d2<.15)return;
 // Clip world segment at near camera plane.
 if(d1<.15){const t=(.15-d1)/(d2-d1);x1+=(x2-x1)*t;z1+=(z2-z1)*t;}
 else if(d2<.15){const t=(.15-d2)/(d1-d2);x2+=(x1-x2)*t;z2+=(z1-z2)*t;}
 const a=project(x1,z1,0),b=project(x2,z2,0),c=project(x2,z2,4.8),d=project(x1,z1,4.8);
 solidQuad(d,c,b,a,wall.n%2?'#47354b':'#49394d');
 let subtone=wall.n%2?'#58465a':'#55425a';
 for(const h of [.35,3.9,4.34])line3(x1,z1,h,x2,z2,h,h===.35?'#2b273c':subtone,h===4.34?3:2);
 const tmid=.5;
 let mx=x1+(x2-x1)*tmid,mz=z1+(z2-z1)*tmid;
 if(cameraDepth(mx,mz)>3){
  let lt=project(mx,mz,3.0),rt=project(mx,mz,3.65);const scale=FOCAL/Math.max(1,lt.depth);
  if(scale>4 && Math.abs(lt.x)<W*3){
   const signW=3.3*scale, signH=.86*scale;
   const signX=lt.x-signW/2, signY=rt.y-.06*scale;
   ctx.fillStyle='#5b4256';ctx.fillRect(signX,signY,signW,signH);
   ctx.strokeStyle='#efbf83';ctx.lineWidth=clamp(scale*.045,1.5,6);ctx.strokeRect(signX,signY,signW,signH);
   ctx.fillStyle='#715465';ctx.fillRect(signX+scale*.08,signY+scale*.08,signW-scale*.16,signH-scale*.16);
   const text=['BUY • COLLECT','BEHOLD THE RARE','OPEN EVERY DAY','MINIATURE MAGIC'][wall.n%4];
   ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.font=`bold ${clamp(scale*.23,8,28)}px monospace`;
   ctx.lineWidth=clamp(scale*.08,2,6);ctx.strokeStyle='#2f2237';ctx.lineJoin='round';
   ctx.strokeText(text,lt.x,signY+signH*.54);
   ctx.fillStyle=wall.n%3?'#f8d694':'#b7fff1';ctx.fillText(text,lt.x,signY+signH*.54);
   ctx.textBaseline='alphabetic';
  }
 }
}
function drawShelf(s){
 const frontZ=s.z+.53,rearZ=s.z-.53,left=s.x-s.w/2,right=s.x+s.w/2;
 const rearview=player.z<s.z-.5;
 const faceZ=rearview?rearZ:frontZ;
 const labelZ=rearview?rearZ-.02:frontZ+.1;
 // side profile / rack body
 solidQuad(project(left,rearZ,4.15),project(right,rearZ,4.15),project(right,rearZ,.1),project(left,rearZ,.1),'#261c32');
 solidQuad(project(right,frontZ,4.15),project(right,rearZ,4.15),project(right,rearZ,.1),project(right,frontZ,.1),'#6d4752');
 solidQuad(project(left,frontZ,4.15),project(left,rearZ,4.15),project(left,rearZ,.1),project(left,frontZ,.1),'#987055');
 // Front and rear faces both render as finished wood so the back of the shelf reads correctly.
 if(rearview){
  quadAt(left,right,frontZ,.1,4.15,'#392d3c');
  quadAt(left,right,rearZ,.1,4.15,'#6b4b56');
 }else{
  quadAt(left,right,rearZ,.1,4.15,'#6b4b56');
  quadAt(left,right,frontZ,.1,4.15,'#392d3c');
 }
 line3(left,frontZ,4.15,right,frontZ,4.15,'#f0c58a',Math.max(1,FOCAL/Math.max(1,cameraDepth(s.x,s.z))*.065));
 line3(left,rearZ,4.15,right,rearZ,4.15,'#d5b086',Math.max(1,FOCAL/Math.max(1,cameraDepth(s.x,s.z))*.05));
 // The reverse face is a five-plank walnut display backing, not a bare wall.
 if(rearview){
  const backZ=rearZ-.02;
  for(let r=0;r<ROWS;r++){
   const lo=.19+r*.72,hi=lo+.67;
   quadAt(left+.15,right-.15,backZ,lo,hi,r%2?'#704d5c':'#80596a');
   line3(left+.15,backZ-.01,lo,right-.15,backZ-.01,lo,'#3d2e43',Math.max(1,FOCAL/Math.max(1,cameraDepth(s.x,s.z))*.027));
   for(let i=1;i<=3;i++){
    const gy=lo+i*.15;
    line3(left+.35,backZ-.012,gy,right-.35,backZ-.012,gy,r%2?'#895f6c':'#99727b',Math.max(1,FOCAL/Math.max(1,cameraDepth(s.x,s.z))*.004));
   }
  }
  for(const x of [left+.14,s.x,right-.14])line3(x,backZ-.024,.15,x,backZ-.024,4.04,'#b98b73',Math.max(1,FOCAL/Math.max(1,cameraDepth(s.x,s.z))*.035));
  for(const y of [.14,4.04])line3(left+.08,backZ-.03,y,right-.08,backZ-.03,y,'#e1ad82',Math.max(1,FOCAL/Math.max(1,cameraDepth(s.x,s.z))*.034));
  const plate=project(s.x,backZ-.045,2.45),plateScale=FOCAL/Math.max(.3,plate.depth);
  if(plate.depth>1 && plate.depth<65 && plate.x>-200 && plate.x<W+200){
   const pw=2.3*plateScale,ph=.42*plateScale;
   ctx.fillStyle='#33263f';ctx.fillRect(plate.x-pw/2,plate.y-ph/2,pw,ph);
   ctx.strokeStyle='#f1be83';ctx.lineWidth=Math.max(1,plateScale*.026);ctx.strokeRect(plate.x-pw/2,plate.y-ph/2,pw,ph);
   ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`bold ${clamp(plateScale*.18,9,25)}px monospace`;
   ctx.strokeStyle='#231b2e';ctx.lineWidth=Math.max(2,plateScale*.035);
   const plateLabel=`SHELF ${String(s.id+1).padStart(2,'0')}`;
   ctx.strokeText(plateLabel,plate.x,plate.y);ctx.fillStyle='#ffdda5';ctx.fillText(plateLabel,plate.x,plate.y);
   ctx.textBaseline='alphabetic';
  }
 }
 // Wooden supports and five plank rows, 10 real slots each.
 if(!rearview){
  for(let r=0;r<ROWS;r++){
   const y=.47+r*.72;
   quadAt(left+.12,right-.12,frontZ+.015,y-.075,y,'#bb8861');
   line3(left+.12,frontZ+.02,y,right-.12,frontZ+.02,y,'#ffd194',Math.max(1,FOCAL/Math.max(1,cameraDepth(s.x,s.z))*.011));
   const depth=cameraDepth(s.x,frontZ+.05);
   if(depth>0 && depth<32){
    // Slot divisions stay visible even when empty.
    for(let k=1;k<10;k++){
     const x=left+k*s.w/10;
     line3(x,frontZ+.026,y+.11,x,frontZ+.026,y+.43,'#594255',1);
    }
    const items=rows[s.id][r];
    for(let k=0;k<items.length;k++){
     const id=items[k],mx=left+(k+.5)*(s.w/10);
     const foot=project(mx,frontZ+.08,y+.04),top=project(mx,frontZ+.08,y+.55);
     const pxW=Math.max(1,.42*FOCAL/Math.max(.4,foot.depth));
     let h=foot.y-top.y;
     if(h>=2&&pxW>1 && img.complete&&img.naturalWidth){
      const f=figure(id);ctx.drawImage(img,f.atlasX,f.atlasY,32,40,foot.x-pxW/2,top.y,pxW,h);
     }
    }
   }
  }
 }
 // Outer oak-edged structure, gilded shelf nameplate.
 const sz=FOCAL/Math.max(.4,cameraDepth(s.x,faceZ));
 const edge=Math.max(1,sz*.075);
 line3(left,frontZ,.1,left,frontZ,4.15,'#ca9d6f',edge);
 line3(right,frontZ,.1,right,frontZ,4.15,'#8b5960',edge);
 line3(left,rearZ,.1,left,rearZ,4.15,'#b58a65',Math.max(1,edge*.8));
 line3(right,rearZ,.1,right,rearZ,4.15,'#7a5c61',Math.max(1,edge*.8));
 quadAt(left-.15,right+.15,faceZ+(rearview?-.07:.07),4.13,4.5,rearview?'#775e4d':'#6e4663');
 line3(left-.15,faceZ+(rearview?-.075:.075),4.48,right+.15,faceZ+(rearview?-.075:.075),4.48,'#f8c77e',Math.max(1,sz*.04));
 const mid=project(s.x,labelZ,4.31);
 if(mid.depth>1 && sz>3 && mid.x>-220 && mid.x<W+220){
  const label=`SHELF ${String(s.id+1).padStart(2,'0')}`;
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`bold ${clamp(sz*.24,9,28)}px monospace`;
  ctx.lineWidth=Math.max(2,sz*.055);ctx.strokeStyle='#2e2235';ctx.lineJoin='round';
  ctx.strokeText(label,mid.x,mid.y+sz*.06);
  ctx.fillStyle='#ffe0a7';ctx.fillText(label,mid.x,mid.y+sz*.06);
  ctx.textBaseline='alphabetic';
 }
 if(focus&&focus.kind==='shelf'&&focus.id===s.id){
  const p=project(s.x,faceZ,4.8);
  if(p.depth>0){ctx.fillStyle='#d1ffe9';ctx.fillRect(p.x-4,p.y-4,8,8)}
 }
}
function drawFig(f){
 const d=cameraDepth(f.x,f.z);if(d<.22||d>42)return;
 const s=cameraSide(f.x,f.z);if(Math.abs(s)>d*1.25+1)return;
 const p=project(f.x,f.z,.0),ht=.71*FOCAL/d,wid=ht*.80;
 if(wid<1||p.x+wid<0||p.x-wid>W||p.y-ht>H)return;
 // Draw a grounded pixel shadow, then full original sprite cropped from atlas.
 ctx.fillStyle='#1b1424a2';ctx.beginPath();ctx.ellipse(p.x,p.y,Math.max(1,wid*.41),Math.max(1,ht*.065),0,0,Math.PI*2);ctx.fill();
 if(img.complete&&img.naturalWidth){const fig=figure(f.id);ctx.drawImage(img,fig.atlasX,fig.atlasY,32,40,Math.round(p.x-wid/2),Math.round(p.y-ht),Math.max(1,Math.round(wid)),Math.max(1,Math.round(ht)));}
 if(focus&&focus.kind==='figure'&&focus.id===f.id){
  ctx.strokeStyle='#fff3b8';ctx.lineWidth=2;ctx.strokeRect(Math.round(p.x-wid/2)-2,Math.round(p.y-ht)-2,Math.max(4,Math.round(wid)+4),Math.max(4,Math.round(ht)+4));
 }
 if(d<4)targetBoxes.push({id:f.id,x:p.x-wid/2,y:p.y-ht,w:wid,h:ht,d});
}
function drawRoom(){
 ctx.fillStyle='#252137';ctx.fillRect(0,0,W,H);
 // Flat posterized ceiling tiles and warmly glowing neon ceiling bulbs.
 for(let y=0;y<HORIZON;y+=18){ctx.fillStyle=y%36===0?'#252036':'#29233b';ctx.fillRect(0,y,W,1)}
 for(let i=0;i<12;i++){
  const sx=4+i*6,sz=6+(i%3)*24;
  const p=project(sx,sz,4.72);
  if(p.depth>0&&p.x>-30&&p.x<W+30&&p.y>-20&&p.y<200){
   const rad=clamp(90/p.depth,2,12);
   ctx.fillStyle='#aa8f92';ctx.fillRect(p.x-rad*2,p.y-rad*.6,rad*4,rad*1.2);
   ctx.fillStyle='#ffe1a0';ctx.fillRect(p.x-rad*1.5,p.y-rad*.45,rad*3,rad*.9);
  }
 }
 drawFloor();
 // Entity drawing is far-to-near to correctly occlude figurines behind racks.
 targetBoxes=[];
 let entities=[];
 for(let n=0;n<4;n++){
  const wallSegments=7;for(let k=0;k<wallSegments;k++){
   let x1,z1,x2,z2;
   if(n===0){x1=1+k*68/7;x2=1+(k+1)*68/7;z1=z2=1;}
   if(n===1){x1=1+k*68/7;x2=1+(k+1)*68/7;z1=z2=73;}
   if(n===2){z1=1+k*72/7;z2=1+(k+1)*72/7;x1=x2=1;}
   if(n===3){z1=1+k*72/7;z2=1+(k+1)*72/7;x1=x2=69;}
   const depth=cameraDepth((x1+x2)/2,(z1+z2)/2);
   if(depth>-7&&depth<100)entities.push({type:'wall',depth,wall:{x1,z1,x2,z2,n:n*7+k}});
  }
 }
 for(const s of shelves){let d=cameraDepth(s.x,s.z);if(d>-5&&d<90&&Math.abs(cameraSide(s.x,s.z))<Math.abs(d)*1.8+9)entities.push({type:'shelf',depth:d,rack:s});}
 for(const f of floor){if(!f.onFloor)continue;let d=cameraDepth(f.x,f.z);if(d>.1&&d<42&&Math.abs(cameraSide(f.x,f.z))<d*1.24+2)entities.push({type:'fig',depth:d,piece:f});}
 entities.sort((a,b)=>b.depth-a.depth);
 for(const e of entities){if(e.type==='wall')drawWall(e.wall);else if(e.type==='shelf')drawShelf(e.rack);else drawFig(e.piece);}
 // Crisp screen-space scanline / colorband effect, sparse enough for mobile.
 ctx.fillStyle='#0a071210';for(let y=2;y<H;y+=4)ctx.fillRect(0,y,W,1);
}
function move(dt){
 if(modal||!playing)return;
 let f=0,s=0;
 if(keys.has('KeyW')||keys.has('ArrowUp'))f+=1;
 if(keys.has('KeyS')||keys.has('ArrowDown'))f-=1;
 if(keys.has('KeyD'))s+=1;
 if(keys.has('KeyA'))s-=1;
 f+=-touch.axisY;s+=touch.axisX;
 const len=Math.hypot(f,s);if(len>1){f/=len;s/=len}
 if(keys.has('ArrowLeft'))player.yaw-=dt*1.6;
 if(keys.has('ArrowRight'))player.yaw+=dt*1.6;
 const speed=shift?10.2:6.3;
 const dir=forward(),right={x:Math.cos(player.yaw),z:Math.sin(player.yaw)};
 const dx=(dir.x*f+right.x*s)*dt*speed,dz=(dir.z*f+right.z*s)*dt*speed;
 if(dx||dz){if(!blocked(player.x+dx,player.z,.32))player.x+=dx;if(!blocked(player.x,player.z+dz,.32))player.z+=dz;}
}
let frameNum=0;
function frame(now){
 const dt=Math.min((now-lastFrame)/1000,.055);lastFrame=now;
 if(playing){move(dt);if(!modal){updateFocus();drawRoom()}}
 if(++frameNum%200===0&&playing)save();
 requestAnimationFrame(frame);
}
// Desktop WASD, mouse drag (no pointer lock required); click/tap on rendered object.
window.addEventListener('keydown',e=>{
 if(e.code==='Escape'){if(modal)closeDrawer();else if($('confirm').hidden===false)$('confirm').hidden=true;return}
 if(e.target.tagName==='INPUT')return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Tab'].includes(e.code))e.preventDefault();
 keys.add(e.code);if(e.code==='ShiftLeft'||e.code==='ShiftRight')shift=true;
 if(e.repeat)return;
 if(e.code==='KeyE'||e.code==='Space')interact();
 if(e.code==='Tab')modal?closeDrawer():openDrawer('album');
 if(e.code==='KeyI')modal?closeDrawer():openDrawer('tote');
});
window.addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='ShiftLeft'||e.code==='ShiftRight')shift=false});
let dragging=false,lastX=0,downX=0,downY=0,dragSum=0;
canvas.addEventListener('pointerdown',e=>{
 if(!playing||modal)return;
 if(e.pointerType==='touch'&&e.clientX<window.innerWidth*.27&&e.clientY>window.innerHeight*.60)return;
 dragging=true;lastX=downX=e.clientX;downY=e.clientY;dragSum=0;
 try{canvas.setPointerCapture(e.pointerId)}catch(_){}
});
canvas.addEventListener('pointermove',e=>{
 if(!dragging||modal||!playing)return;
 const dx=e.clientX-lastX;lastX=e.clientX;dragSum+=Math.abs(dx);
 player.yaw+=dx*(2.5/window.innerWidth);
});
canvas.addEventListener('pointerup',e=>{
 if(!dragging)return;dragging=false;
 if(dragSum<10&&Math.abs(e.clientY-downY)<12&&playing&&!modal){
  const rect=canvas.getBoundingClientRect(),scale=Math.max(rect.width/W,rect.height/H),cropX=(W*scale-rect.width)/2,cropY=(H*scale-rect.height)/2,px=(e.clientX-rect.left+cropX)/scale,py=(e.clientY-rect.top+cropY)/scale;
  let best=null;for(const b of targetBoxes)if(px>=b.x-4&&px<=b.x+b.w+4&&py>=b.y-4&&py<=b.y+b.h+6&&(best===null||b.d<best.d))best=b;
  if(best&&Math.hypot(player.x-floor[best.id].x,player.z-floor[best.id].z)<3.2)grabFig(best.id);
 }
});
canvas.addEventListener('pointercancel',()=>dragging=false);
const joy=$('joystick'),stick=$('stick');
joy.addEventListener('pointerdown',e=>{if(modal||!playing)return;e.preventDefault();touch.joyId=e.pointerId;joy.setPointerCapture(e.pointerId);joyMove(e)});
joy.addEventListener('pointermove',e=>{if(e.pointerId!==touch.joyId)return;joyMove(e)});
function joyMove(e){const rect=joy.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
 const max=rect.width*.34,dx=e.clientX-cx,dy=e.clientY-cy,len=Math.hypot(dx,dy),m=Math.min(max,len),x=len?dx/len*m:0,y=len?dy/len*m:0;
 touch.axisX=x/max;touch.axisY=y/max;
 stick.style.transform=`translate(${x}px,${y}px)`;
}
function joyEnd(e){if(e.pointerId!==touch.joyId)return;touch.axisX=touch.axisY=0;touch.joyId=null;stick.style.transform='translate(0,0)'}
joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);
$('actionBtn').addEventListener('click',()=>{if(playing)interact()});
$('toteBtn').onclick=()=>modal?closeDrawer():openDrawer('tote');
$('albumBtn').onclick=()=>modal?closeDrawer():openDrawer('album');
$('closeDrawer').onclick=closeDrawer;$('drawerShade').onclick=closeDrawer;
$('cancelReset').onclick=()=>$('confirm').hidden=true;
$('doReset').onclick=()=>{localStorage.removeItem(STORE_KEY);resetState();$('confirm').hidden=true;closeDrawer();notify('Store reset: 1,000 figures scattered.');};
$('startBtn').onclick=()=>{$('screen').classList.remove('shown');playing=true;save();notify('YOUR SHOP IS OPEN. FIND AND SORT THE FIGURES!')};
// Snapshot integrity API for QA and external automation.
window.BitBazaarQA={
 stats:()=>({floor:floor.filter(f=>f.onFloor).length,tote:tote.length,placed:rows.flat(2).length,completedRows:rows.flat(1).filter(r=>r.length===10).length,capacity:20*5*10,distinctAssets:new Set(DB.figures.map(f=>`${f.atlasX}:${f.atlasY}`)).size}),
 place:(id,shelf,row)=>{if(!Number.isInteger(id)||id<0||id>=1000)return false;const f=floor[id];if(f.onFloor){f.onFloor=false;tote.push(id)}selected=id;activeShelf=shelf;placeFig(shelf,row);return rows[shelf][row].includes(id)},
 reset:resetState, get player(){return player}, shelves, dataset:DB
};
restore();requestAnimationFrame(frame);
})();