/* The Bit Bazaar v0.57 — network-first iPhone Safari PWA.
   Keeps local figure/decor saves in localStorage, never touches them. */
const CACHE="bit-bazaar-v0.57.0";
const CORE=[
 "./index.html","./style-v0.57.0.css","./game-v0.57.0.js",
 "./game-v0.57.0-lowfx.js","./baseline-v0.57.0-lowfx.html",
 "./preview-v0.57.0.html",
 "./assets/collection.js","./assets/collection-extension.js",
 "./assets/optimized-sprites.js","./assets/figurines.png",
 "./assets/decor-v0.19.js","./assets/decor-expansion-v0.20.js",
 "./assets/decor-expansion-v0.21.js","./assets/decor-expansion-v0.22.js",
 "./assets/decor-expansion-v0.25.js","./assets/decor-sites-v0.26.js",
 "./assets/decor-endcaps-v0.28.js","./assets/decor-art-v0.28.js",
 "./assets/decor-art-v0.29.js","./assets/decor-art-v0.32.js",
 "./assets/decor-sites-v0.32.js",
 "./assets/decor-art-v0.33.js","./assets/decor-sites-v0.33.js",
 "./assets/decor-art-v0.34.js","./assets/decor-sites-v0.34.js",
 "./assets/decor-art-v0.35.js","./assets/decor-sites-v0.35.js",
 "./assets/decor-art-v0.36.js","./assets/decor-sites-v0.36.js",
 "./assets/decor-art-v0.37.js",
 "./assets/decor-workshop-v0.46.js","./assets/room-workshop-v0.46.js",
 "./assets/decor-runtime-v0.52.js","./assets/decor-map-v0.38.js",
 "./assets/decor-world-v0.41.js","./assets/decor-visibility-v0.41.js",
 "./assets/figure-integrity-v0.43.js","./assets/achievements-v0.57.js",
 "./assets/save-manager-v0.57.js",
 "./assets/lifetime-honors-v0.55.js","./assets/journeys-v0.56.js",
 "./assets/cowards-glasses-v0.54.js",
 "./assets/boot-recovery-v0.50.js",
 "./assets/device-qa-v0.52.js",
 "./manifest.webmanifest","./icon.png"
];
const OPTIONAL=[
 "./game-v0.56.0.js","./game-v0.56.0-lowfx.js",
 "./style-v0.56.0.css","./baseline-v0.56.0-lowfx.html",
 "./preview-v0.56.0.html",
 "./assets/save-manager-v0.55.js",
 "./game-v0.55.0.js","./game-v0.55.0-lowfx.js",
 "./style-v0.55.0.css","./baseline-v0.55.0-lowfx.html",
 "./preview-v0.55.0.html",
 "./game-v0.54.0.js","./game-v0.54.0-lowfx.js",
 "./style-v0.54.0.css","./baseline-v0.54.0-lowfx.html",
 "./preview-v0.54.0.html","./assets/save-manager-v0.54.js",
 "./game-v0.53.0.js","./game-v0.53.0-lowfx.js",
 "./style-v0.53.0.css","./baseline-v0.53.0-lowfx.html",
 "./preview-v0.53.0.html","./assets/save-manager-v0.53.js",
 "./game-v0.52.0.js","./game-v0.52.0-lowfx.js",
 "./style-v0.52.0.css","./baseline-v0.52.0-lowfx.html",
 "./preview-v0.52.0.html","./assets/save-manager-v0.49.js",
 "./game-v0.51.0.js","./game-v0.51.0-lowfx.js",
 "./style-v0.51.0.css","./baseline-v0.51.0-lowfx.html",
 "./preview-v0.51.0.html","./assets/decor-runtime-v0.48.js",
 "./assets/device-qa-v0.44.js",
 "./game-v0.50.0.js","./game-v0.50.0-lowfx.js",
 "./style-v0.50.0.css","./baseline-v0.50.0-lowfx.html",
 "./preview-v0.50.0.html",
 "./game-v0.49.0.js","./game-v0.49.0-lowfx.js",
 "./style-v0.49.0.css","./baseline-v0.49.0-lowfx.html",
 "./preview-v0.49.0.html","./assets/boot-recovery-v0.49.js",
 "./game-v0.48.0.js","./game-v0.48.0-lowfx.js",
 "./style-v0.48.0.css","./baseline-v0.48.0-lowfx.html",
 "./preview-v0.48.0.html","./assets/save-manager-v0.47.js",
 "./game-v0.47.0.js","./game-v0.47.0-lowfx.js",
 "./style-v0.47.0.css","./baseline-v0.47.0-lowfx.html",
 "./preview-v0.47.0.html","./assets/decor-runtime-v0.46.js",
 "./game-v0.46.0.js","./game-v0.46.0-lowfx.js",
 "./style-v0.46.0.css","./baseline-v0.46.0-lowfx.html",
 "./preview-v0.46.0.html","./assets/save-manager-v0.45.js",
 "./game-v0.45.0.js","./game-v0.45.0-lowfx.js",
 "./style-v0.45.0.css","./baseline-v0.45.0-lowfx.html",
 "./preview-v0.45.0.html","./assets/decor-workshop-v0.38.js",
 "./assets/room-workshop-v0.24.js","./assets/decor-runtime-v0.41.js",
 "./game-v0.44.0.js","./game-v0.44.0-lowfx.js",
 "./style-v0.44.0.css","./baseline-v0.44.0-lowfx.html",
 "./preview-v0.44.0.html","./assets/save-manager-v0.43.js",
 "./game-v0.43.0.js","./game-v0.43.0-lowfx.js",
 "./style-v0.43.0.css","./baseline-v0.43.0-lowfx.html",
 "./preview-v0.43.0.html",
 "./game-v0.42.0.js","./game-v0.42.0-lowfx.js",
 "./style-v0.42.0.css","./baseline-v0.42.0-lowfx.html",
 "./assets/decor-runtime-v0.41.js",
 "./assets/decor-visibility-v0.41.js","./assets/decor-world-v0.41.js",
 "./assets/decor-runtime-v0.37.js","./assets/decor-map-v0.31.js",
 "./assets/decor-workshop-v0.28.js","./assets/save-manager-v0.42.js"
];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(async cache=>{
  await Promise.all(CORE.map(path=>cache.add(path)));
  await Promise.all(OPTIONAL.map(path=>cache.add(path).catch(()=>{})));
  await self.skipWaiting();
 }));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(
  keys.filter(key=>key.startsWith("bit-bazaar-")&&key!==CACHE)
   .map(key=>caches.delete(key))
 )).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=="GET"||url.origin!==self.location.origin||
    !url.href.startsWith(self.registration.scope))return;
 event.respondWith(fetch(req,{cache:"no-cache"}).then(response=>{
  if(response.ok){
   const copy=response.clone();
   event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{}));
  }
  return response;
 }).catch(async()=>{
  const cache=await caches.open(CACHE);
  const match=await cache.match(req,{ignoreSearch:true});
  if(match)return match;
  if(req.mode==="navigate"){
   const shell=await cache.match("./index.html");
   if(shell)return shell;
  }
  return Response.error();
 }));
});