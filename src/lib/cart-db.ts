import type React from "react";
import type { Dispatch, SetStateAction } from "react";

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

export async function addToCart(
    chartRef: React.RefObject<HTMLDivElement | null>,
    cart: string[],
    setCart: Dispatch<SetStateAction<string[]>>,
    filterNames: string[],
    setFilterNames: Dispatch<SetStateAction<string[]>>,
    filterName: string,
) {
    const { captureChartAsDataUrl } = await import("./export-to-pdf");
    const dataUrl = await captureChartAsDataUrl(chartRef);
    if (!dataUrl) return;
    const newCart = [...cart, dataUrl];
    const newFilterNames = [...filterNames, filterName];
    setCart(newCart);
    setFilterNames(newFilterNames);
    await saveCart(newCart, newFilterNames);
}

export function deleteFromCart(
    cart: string[],
    setCart: Dispatch<SetStateAction<string[]>>,
    filterNames: string[],
    setFilterNames: Dispatch<SetStateAction<string[]>>,
    index: number,
) {
    const newCart = cart.filter((_, i) => i !== index);
    const newFilterNames = filterNames.filter((_, i) => i !== index);
    setCart(newCart);
    setFilterNames(newFilterNames);
    saveCart(newCart, newFilterNames);
}

export function clearCart(
    setCart: Dispatch<SetStateAction<string[]>>,
    setFilterNames: Dispatch<SetStateAction<string[]>>,
) {
    setCart([]);
    setFilterNames([]);
    saveCart([], []);
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
