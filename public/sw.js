const CACHE_NAME = 'olheiro-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-status-updates') {
    event.waitUntil(syncStatusUpdates());
  }
});

async function syncStatusUpdates() {
  const db = await openDB();
  const tx = db.transaction('pendingUpdates', 'readonly');
  const store = tx.objectStore('pendingUpdates');
  const getAllRequest = store.getAll();

  return new Promise((resolve, reject) => {
    getAllRequest.onsuccess = async () => {
      const updates = getAllRequest.result;
      if (updates.length > 0) {
        const clientsList = await self.clients.matchAll();
        for (const client of clientsList) {
          client.postMessage({ type: 'SYNC_UPDATES' });
        }
      }
      resolve(true);
    };
    getAllRequest.onerror = () => reject(getAllRequest.error);
  });
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OlheiroOffline', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pendingUpdates')) {
        db.createObjectStore('pendingUpdates', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
