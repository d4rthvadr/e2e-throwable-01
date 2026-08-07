const DB_NAME = "todos-browser-sqlite";
const STORE_NAME = "kv";
const KEY_NAME = "sqlite-db-bytes";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadDatabaseBytes(): Promise<Uint8Array | null> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(KEY_NAME);

    request.onsuccess = () => {
      const result = request.result as ArrayBuffer | undefined;
      resolve(result ? new Uint8Array(result) : null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveDatabaseBytes(bytes: Uint8Array): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const buffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    );

    store.put(buffer, KEY_NAME);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
