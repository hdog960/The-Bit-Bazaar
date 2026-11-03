/* Network-first so every future update appears on the same home-screen URL. */
const CACHE="bit-bazaar-v0.12.0";
const PRELOAD=["./","./index.html","./style-v0.12.0.css","./style-v0.11.0.css","./style-v0.10.0.css","./style-v0.9.0.css","./style-v0.8.0.css","./style-v0.7.0.css","./style-v0.5.0.css","./style-v0.4.0.css","./style.css","./game-v0.12.0.js","./game-v0.12.0-lowfx.js","./game-v0.11.0.js","./game-v0.11.0-lowfx.js","./game-v0.10.0.js","./game-v0.9.0.js","./game-v0.9.0-lowfx.js","./game-v0.8.0.js","./game-v0.8.0-lowfx.js","./game-v0.7.0.js","./game-v0.6.0.js","./game-v0.6.0-recovery.js","./game-v0.5.0.js","./game-v0.4.0.js","./game-v0.3.3.js","./game-v0.3.2.js","./game-v0.3.1.js","./game-v0.3.js","./game.js","./safe.html","./previous.html","./baseline-v0.12.0-lowfx.html","./baseline-v0.11.0-lowfx.html","./baseline-v0.9.0-lowfx.html","./baseline-v0.8.0-lowfx.html","./baseline-v0.6.0.html","./baseline-v0.5.0.html","./stable.html","./assets/collection.js","./assets/collection-extension.js","./assets/optimized-sprites.js","./assets/figurines.png","./manifest.webmanifest","./icon.png"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRELOAD)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("bit-bazaar-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET"||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(event.request,{cache:"no-cache"}).then(response=>{
    if(response.ok){
      const copy=response.clone();
      event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));
    }
    return response;
  }).catch(()=>caches.match(event.request,{ignoreSearch:true}).then(cached=>cached||caches.match("./index.html"))));
});