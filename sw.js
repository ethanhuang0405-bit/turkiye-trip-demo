const CACHE='turkiye-trip-v14';
const SHELL=['./','./index.html','./styles.css?v=10','./app.js?v=12','./manifest.webmanifest','./photo-credits.html','./assets/cappadocia-hero.webp','./assets/cappadocia-hero-720.webp'];

self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())
));

self.addEventListener('activate',event=>event.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim())
));

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;

  if(event.request.destination==='image'){
    event.respondWith(caches.match(event.request).then(cached=>{
      const fresh=fetch(event.request).then(response=>{
        if(response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        }
        return response;
      }).catch(()=>cached);
      return cached||fresh;
    }));
    return;
  }

  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    }
    return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});

