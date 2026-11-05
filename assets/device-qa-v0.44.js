/* Bit Bazaar v0.44: opt-in, read-only frame sampler for physical iPhone QA. */
(()=>{
'use strict';
const KEY='bit-bazaar-device-qa-recovery-v044';
let active=false,d=null,report='';
const el=id=>document.getElementById(id);
const fmt=x=>Number.isFinite(x)?x.toFixed(1):'n/a';
function refresh(){
 const a=el('deviceQaStart'),b=el('deviceQaStop'),c=el('deviceQaCopy'),out=el('deviceQaReport');
 if(a)a.disabled=active;
 if(b)b.disabled=!active;
 if(c)c.disabled=active||!report;
 if(out)out.textContent=active?'RECORDING · Close the Almanac, walk around decorated aisles, then return to finish.\n'+d.count+' rendered frames captured.':report||'No device test recorded yet.';
}
function sampleDecor(){
 const v=window.BitBazaarQA?.decorRenderStats?.();
 if(!d||!v)return;
 d.installed=Math.max(d.installed,v.installed||0);
 d.shown=Math.max(d.shown,v.shown||0);
 d.partial=Math.max(d.partial,v.partiallyVisible||0);
 d.hidden=Math.max(d.hidden,v.hiddenByFixtures||0);
 d.skipped=Math.max(d.skipped,v.skippedBudget||0);
}
function start(){
 if(active)return false;
 if(!window.BitBazaarQA?.stats||!window.BitBazaarQA?.figureIntegrity){
  report='Test unavailable until the game finishes loading.';refresh();return false;
 }
 active=true;report='';
 d={started:new Date().toISOString(),count:0,last:0,elapsed:0,gaps:0,
  total:0,worst:0,slow:0,verySlow:0,critical:0,adaptive:0,
  warnings:0,installed:0,shown:0,partial:0,hidden:0,skipped:0};
 refresh();return true;
}
function record(ms,slow,extreme){
 if(!active||!Number.isFinite(ms)||ms<0)return;
 const now=performance.now(),gap=d.last?now-d.last:0;
 if(gap>0&&gap<=500)d.elapsed+=gap;
 else if(gap>500)d.gaps++;
 d.last=now;d.count++;d.total+=ms;d.worst=Math.max(d.worst,ms);
 if(ms>43)d.slow++;
 if(ms>85)d.verySlow++;
 if(ms>115)d.critical++;
 if(slow>=8)d.adaptive++;
 if(extreme>0)d.warnings++;
 if(d.count%12===0)sampleDecor();
}
function stop(reason='MANUAL STOP'){
 if(!active)return report;
 active=false;sampleDecor();
 const s=window.BitBazaarQA?.stats?.()||{};
 let audit=null,error='';
 if(reason!=='AUTO LOW FX RECOVERY')try{
  audit=window.BitBazaarQA?.figureIntegrity?.()||null;
 }catch(e){error=e.message||String(e);}
 const sec=d.elapsed/1000,sustained=d.count>=360&&sec>=20;
 report=[
 'THE BIT BAZAAR · PHASE 4 REAL-DEVICE CHECK',
 'Build: v0.44.0 · '+d.started,
 'Outcome: '+reason+' · '+(sustained?'SUSTAINED SAMPLE':'SHORT / INCOMPLETE SAMPLE'),
 'Rendered frames: '+d.count+' · active seconds: '+fmt(sec)+' · interruptions: '+d.gaps,
 'Observed draw cadence: '+fmt(sec>0?(d.count-1)/sec:0)+' frames/second',
 'Draw cost: average '+fmt(d.count?d.total/d.count:0)+' ms · worst '+fmt(d.worst)+' ms',
 'Slow draws >43 ms: '+d.slow+' · >85 ms: '+d.verySlow+' · >115 ms: '+d.critical,
 'Adaptive mode samples: '+d.adaptive+' · recovery warnings: '+d.warnings,
 'Decorations: '+(s.decorRender?.installed??d.installed)+' installed · up to '+d.shown+' shown · '+d.partial+' partly exposed · '+d.skipped+' skipped',
 'Sprite cache: '+(s.sprites?.cacheSize??'n/a')+' / '+(s.sprites?.maxCache??'n/a')+' canvases',
 'Collection: '+(s.placed??'n/a')+' / 3000 shelved · '+(s.completedRows??'n/a')+' perfect rows · '+(s.hiddenFound??'n/a')+' / 18 hidden found',
 'Inventory audit: '+(audit?(audit.ok?'OK · '+audit.total+' accounted for':'FAILED · '+audit.issues.join(', ')):(error?'ERROR · '+error:'not run during recovery')),
 'NOT SIGNED OFF · Check dense art, Files backup / import, and Home Screen stability by hand on iPhone.'
 ].join('\n');
 refresh();return report;
}
function recover(){
 if(!active)return;
 const result=stop('AUTO LOW FX RECOVERY');
 try{sessionStorage.setItem(KEY,result);}catch(_){}
}
async function copyReport(){
 if(!report)return false;
 try{
  if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(report);
  else{
   const t=document.createElement('textarea');t.value=report;
   t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';
   document.body.appendChild(t);t.select();
   if(!document.execCommand('copy'))throw Error('Clipboard blocked');
   t.remove();
  }
  const out=el('deviceQaReport');
  if(out)out.textContent=report+'\n\n✓ COPIED · paste into playtest feedback.';
  return true;
 }catch(e){
  const out=el('deviceQaReport');
  if(out)out.textContent=report+'\n\nCOPY BLOCKED · select this text manually.';
  return false;
 }
}
document.addEventListener('click',e=>{
 if(e.target?.closest?.('#deviceQaStart'))start();
 else if(e.target?.closest?.('#deviceQaStop'))stop();
 else if(e.target?.closest?.('#deviceQaCopy'))copyReport();
});
document.addEventListener('visibilitychange',()=>{
 if(document.visibilityState==='hidden'&&d)d.last=0;
});
try{const prior=sessionStorage.getItem(KEY);if(prior){report=prior;sessionStorage.removeItem(KEY);}}catch(_){}
window.BitBazaarDeviceQA=Object.freeze({
 start,record,stop,recover,refresh,copyReport,isActive:()=>active,report:()=>report
});
})();