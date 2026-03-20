import { supabase, PointStatus } from './supabase';

export interface PendingUpdate {
  id?: number;
  poi_id: string;
  status: PointStatus;
  message: string;
  timestamp: string;
}

const DB_NAME = 'OlheiroOffline';
const STORE_NAME = 'pendingUpdates';

function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Queues a status update in IndexedDB and registers a background sync event.
 */
export async function queueUpdate(update: PendingUpdate) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  return new Promise<void>((resolve, reject) => {
    const addRequest = store.add(update);
    addRequest.onsuccess = async () => {
      // Register background sync if supported
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await (registration as any).sync.register('sync-status-updates');
        } catch (err) {
          console.warn('Background sync registration failed:', err);
        }
      }
      resolve();
    };
    addRequest.onerror = () => reject(addRequest.error);
  });
}

/**
 * Processes the queue of pending updates and pushes them to Supabase.
 */
export async function processQueue() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  return new Promise<void>((resolve, reject) => {
    const getAllRequest = store.getAll();
    
    getAllRequest.onsuccess = async () => {
      const updates = getAllRequest.result as PendingUpdate[];
      
      for (const update of updates) {
        try {
          // 1. Update status_updates audit log with ORIGINAL timestamp
          const { error: insertError } = await supabase
            .from('status_updates')
            .insert({
              poi_id: update.poi_id,
              status: update.status,
              message: update.message,
              timestamp: update.timestamp
            });

          if (!insertError) {
            // 2. Update main POI state
            await supabase
              .from('pois')
              .update({ 
                status: update.status, 
                last_update: update.timestamp 
              })
              .eq('id', update.poi_id);

            // 3. Clear from queue
            const deleteTx = db.transaction(STORE_NAME, 'readwrite');
            deleteTx.objectStore(STORE_NAME).delete(update.id!);
          }
        } catch (err) {
          console.error('Failed to sync update:', update, err);
        }
      }
      resolve();
    };
    
    getAllRequest.onerror = () => reject(getAllRequest.error);
  });
}
