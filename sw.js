/* Bit Bazaar v0.21 — network-first iPhone app. Never touches local save data. */
const CACHE="bit-bazaar-v0.21.0";
const CORE=[
 "./index.html","./style-v0.21.0.css","./game-v0.21.0.js",
 "./game-v0.21.0-lowfx.js","./baseline-v0.21.0-lowfx.html",
 "./assets/collection.js","./assets/collection-extension.js",
 "./assets/optimized-sprites.js","./assets/figurines.png",
 "./assets/decor-v0.19.js","./assets/decor-expansion-v0.20.js",
 "./assets/decor-expansion-v0.21.js","./assets/decor-runtime-v0.21.js",
 "./assets/save-manager-v0.21.js","./manifest.webmanifest","./icon.png"
];
// Files from the preceding known-good version are optional; an unavailable
// previous-version file must never stop the current game from installing.
const OPTIONAL=[
 "./game-v0.20.0.js","./game-v0.20.0-lowfx.js",
 "./style-v0.20.0.css","./baseline-v0.20.0-lowfx.html",
 "./assets/decor-runtime-v0.20.js","./assets/save-manager-v0.20.js"
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
  const match=await cache.match(req,{ignoreSearch:true});
  if(match)return match;
  if(req.mode==="navigate"){
   const shell=await cache.match("./index.html");
   if(shell)return shell;
  }
  return Response.error();
 }));
});