const CACHE_NAME = "immu-v3"

const STATIC_ASSETS = [
  "/manifest.json",
  "/pwa-icon.svg",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return
  const url = new URL(event.request.url)
  if (url.origin !== location.origin) return

  // Never cache HTML pages or JS/CSS chunks — always fetch fresh from network
  const isPage = !url.pathname.includes(".")
  const isNextChunk = url.pathname.startsWith("/_next/")
  if (isPage || isNextChunk) {
    event.respondWith(fetch(event.request))
    return
  }

  // For static assets (icons, manifest), use cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
    })
  )
})
