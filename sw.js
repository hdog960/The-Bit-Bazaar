/* Bit Bazaar v0.18 — compact, network-first offline app shell.
   Cache only the current playable release; never touch local save storage. */
const CACHE="bit-bazaar-v0.18.0";
const CORE=[
 "./index.html","./style-v0.18.0.css","./game-v0.18.0.js",
 "./game-v0.18.0-lowfx.js","./baseline-v0.18.0-lowfx.html",
 "./assets/collection.js","./assets/collection-extension.js",
 "./assets/optimized-sprites.js","./assets/figurines.png",
 "./assets/decor-v0.18.js","./assets/decor-runtime-v0.18.js",
 "./assets/save-manager-v0.18.js","./manifest.webmanifest","./icon.png"
];
// A previous working build is cached opportunistically for emergency use.
// Missing optional assets cannot cause current-version install failure.
const OPTIONAL=[
 "./game-v0.17.0.js","./game-v0.17.0-lowfx.js",
 "./style-v0.17.0.css","./baseline-v0.17.0-lowfx.html",
 "./assets/save-manager-v0.17.js"
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
 const request=event.request,url=new URL(request.url);
 if(request.method!=="GET"||url.origin!==self.location.origin||
    !url.href.startsWith(self.registration.scope))return;
 event.respondWith(fetch(request,{cache:"no-cache"}).then(response=>{
  if(response.ok){
   const copy=response.clone();
   event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{}));
  }
  return response;
 }).catch(async()=>{
  const cache=await caches.open(CACHE);
  const saved=await cache.match(request,{ignoreSearch:true});
  if(saved)return saved;
  if(request.mode==="navigate"){
   const shell=await cache.match("./index.html");
   if(shell)return shell;
  }
  return Response.error();
 }));
});