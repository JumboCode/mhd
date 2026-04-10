const DB_NAME = "mhd-export-cart";
const STORE_NAME = "cart";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            request.result.createObjectStore(STORE_NAME);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function idbGet<T>(store: IDBObjectStore, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result as T | undefined);
        request.onerror = () => reject(request.error);
    });
}

function idbTxComplete(tx: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function saveCart(
    cart: string[],
    filterNames: string[],
): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(cart, "images");
        store.put(filterNames, "filterNames");
        await idbTxComplete(tx);
        db.close();
    } catch {
        // Silently fail — cart just won't persist across refreshes
    }
}

export async function loadCart(): Promise<{
    cart: string[];
    filterNames: string[];
}> {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        const [cart, filterNames] = await Promise.all([
            idbGet<string[]>(store, "images"),
            idbGet<string[]>(store, "filterNames"),
        ]);

        db.close();
        return { cart: cart ?? [], filterNames: filterNames ?? [] };
    } catch {
        return { cart: [], filterNames: [] };
    }
}
