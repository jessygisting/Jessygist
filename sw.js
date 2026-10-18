const CACHE_NAME = "jessygist-cache-v3";

const FILES_TO_CACHE = [
"./",
"./index.html",
"./style.css",
"./script.js",
"./manifest.json",
"./icon-512.png"
];

self.addEventListener("install", (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
);
self.skipWaiting();
});

self.addEventListener("activate", (event) => {
event.waitUntil(
caches.keys().then((cacheNames) =>
Promise.all(
cacheNames
.filter((cacheName) => cacheName !== CACHE_NAME)
.map((cacheName) => caches.delete(cacheName))
)
)
);
self.clients.claim();
});

self.addEventListener("fetch", (event) => {
if (event.request.method !== "GET") return;

event.respondWith(
caches.match(event.request).then((cachedResponse) => {
if (cachedResponse) return cachedResponse;
return fetch(event.request);
})
);
});
