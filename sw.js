/* The Bit Bazaar v0.41 — network-first iPhone Safari PWA.
   Keeps local figure/decor saves in localStorage, never touches them. */
const CACHE="bit-bazaar-v0.41.0";
const CORE=[
 "./index.html","./style-v0.41.0.css","./game-v0.41.0.js",
 "./game-v0.41.0-lowfx.js","./baseline-v0.41.0-lowfx.html",
 "./preview-v0.41.0.html",
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
 "./assets/decor-workshop-v0.38.js","./assets/room-workshop-v0.24.js",
 "./assets/decor-runtime-v0.41.js","./assets/decor-map-v0.38.js",
 "./assets/decor-world-v0.41.js","./assets/decor-visibility-v0.41.js",
 "./assets/save-manager-v0.29.js","./manifest.webmanifest","./icon.png"
];
const OPTIONAL=[
 "./game-v0.40.0.js","./game-v0.40.0-lowfx.js",
 "./style-v0.40.0.css","./baseline-v0.40.0-lowfx.html",
 "./assets/decor-runtime-v0.40.js",
 "./assets/decor-visibility-v0.40.js","./assets/decor-world-v0.29.js",
 "./assets/decor-runtime-v0.37.js","./assets/decor-map-v0.31.js",
 "./assets/decor-workshop-v0.28.js","./assets/save-manager-v0.29.js"
];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(async cache=>{
  await Promise.all(CORE.map(path=>cache.add(path).catch(()=>{})));
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