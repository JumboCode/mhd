import { toast } from "sonner";

export type CartItem = {
    /** Display name for the chart (used for PDF titles + duplicate detection) */
    name: string;
    /** Which page this was added from */
    source: "chart" | "map";
    /** Serialized filter state - URL search params for chart, or map state JSON */
    params: string;
};

const DB_NAME = "mhd-export-cart";
const STORE_NAME = "cart";
const DB_VERSION = 3; // Bump for new schema

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (db.objectStoreNames.contains(STORE_NAME)) {
                db.deleteObjectStore(STORE_NAME);
            }
            db.createObjectStore(STORE_NAME);
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

async function saveItems(items: CartItem[]): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(items, "items");
        await idbTxComplete(tx);
        db.close();
    } catch {
        // Silently fail — cart just won't persist across refreshes
    }
}

export async function loadCart(): Promise<CartItem[]> {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const items = await idbGet<CartItem[]>(
            tx.objectStore(STORE_NAME),
            "items",
        );
        db.close();
        return items ?? [];
    } catch {
        return [];
    }
}

export function addToCart(
    items: CartItem[],
    setItems: React.Dispatch<React.SetStateAction<CartItem[]>>,
    item: CartItem,
) {
    if (items.some((i) => i.name === item.name)) {
        toast.info("Already in cart.");
        return;
    }
    const next = [...items, item];
    setItems(next);
    saveItems(next);
    toast.success("Added to cart.");
}

export function removeFromCart(
    items: CartItem[],
    setItems: React.Dispatch<React.SetStateAction<CartItem[]>>,
    index: number,
) {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    saveItems(next);
}

export function clearCart(
    setItems: React.Dispatch<React.SetStateAction<CartItem[]>>,
) {
    setItems([]);
    saveItems([]);
}
