"use client";

import { useSyncExternalStore } from "react";

import type { CartItem } from "@/src/lib/types";

const cartStorageKey = "ctc_cart_v1";
const emptyCart: CartItem[] = [];
const listeners = new Set<() => void>();

let currentCart: CartItem[] = emptyCart;
let hasLoadedFromStorage = false;

function readCartFromStorage() {
  if (typeof window === "undefined") {
    return emptyCart;
  }

  const storedCart = window.localStorage.getItem(cartStorageKey);

  if (!storedCart) {
    return emptyCart;
  }

  try {
    return JSON.parse(storedCart) as CartItem[];
  } catch {
    window.localStorage.removeItem(cartStorageKey);
    return emptyCart;
  }
}

function getCartSnapshot() {
  if (!hasLoadedFromStorage) {
    currentCart = readCartFromStorage();
    hasLoadedFromStorage = true;
  }

  return currentCart;
}

function getServerCartSnapshot() {
  return emptyCart;
}

function emitCartChange() {
  listeners.forEach((listener) => listener());
}

function subscribeToCart(listener: () => void) {
  listeners.add(listener);

  const storageListener = (event: StorageEvent) => {
    if (event.key === cartStorageKey) {
      currentCart = readCartFromStorage();
      hasLoadedFromStorage = true;
      listener();
    }
  };

  window.addEventListener("storage", storageListener);

  const hydrationTimer = window.setTimeout(() => {
    currentCart = readCartFromStorage();
    hasLoadedFromStorage = true;
    listener();
  }, 0);

  return () => {
    listeners.delete(listener);
    window.clearTimeout(hydrationTimer);
    window.removeEventListener("storage", storageListener);
  };
}

export function setStoredCart(
  updater: CartItem[] | ((currentCart: CartItem[]) => CartItem[]),
) {
  const nextCart =
    typeof updater === "function" ? updater(getCartSnapshot()) : updater;

  currentCart = nextCart;
  hasLoadedFromStorage = true;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(nextCart));
  }

  emitCartChange();
}

export function clearStoredCart() {
  currentCart = emptyCart;
  hasLoadedFromStorage = true;

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(cartStorageKey);
  }

  emitCartChange();
}

export function useCart() {
  return useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
}
