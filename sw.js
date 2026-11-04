/* Bit Bazaar v0.19 — compact network-first offline storefront.
   Locally saved figure progress is never read or altered by this worker. */
const CACHE="bit-bazaar-v0.19.0";
const CORE=[
 "./index.html","./style-v0.19.0.css","./game-v0.19.0.js",
 "./game-v0.19.0-lowfx.js","./baseline-v0.19.0-lowfx.html",
 "./assets/collection.js","./assets/collection-extension.js",
 "./assets/optimized-sprites.js","./assets/figurines.png",
 "./assets/decor-v0.19.js","./assets/decor-runtime-v0.19.js",
 "./assets/save-manager-v0.19.js","./manifest.webmanifest","./icon.png"
];
const OPTIONAL=[
 "./game-v0.18.0.js","./game-v0.18.0-lowfx.js",
 "./style-v0.18.0.css","./baseline-v0.18.0-lowfx.html",
 "./assets/decor-v0.18.js","./assets/decor-runtime-v0.18.js",
 "./assets/save-manager-v0.18.js"
];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(async cache=>{
  await cache.addAll(CORE);
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
  const cached=await cache.match(req,{ignoreSearch:true});
  if(cached)return cached;
  if(req.mode==="navigate"){
   const shell=await cache.match("./index.html");
   if(shell)return shell;
  }
  return Response.error();
 }));
});