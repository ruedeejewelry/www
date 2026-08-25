"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * "ชิ้นที่ถูกใจ" lives in this browser only — no account, no server round trip.
 * The whole list gets sent into LINE in one message when the customer is ready.
 *
 * localStorage is an external store, so it is read through
 * useSyncExternalStore: the server renders an empty list, and every component
 * showing favourites (the header count, the list itself, the heart on a
 * product) stays in step without any of them owning the state.
 */
const KEY = "ruedee.favorites";
const EVENT = "ruedee:favorites";

const EMPTY: string[] = [];

/** Cached so repeated getSnapshot calls return the same reference. */
let cachedRaw: string | null = null;
let cachedList: string[] = EMPTY;

function parse(raw: string | null): string[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : EMPTY;
  } catch {
    return EMPTY;
  }
}

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    // Private mode or blocked storage — favourites are a convenience, not
    // state the site depends on.
    return EMPTY;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedList = parse(raw);
  }
  return cachedList;
}

function write(next: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useFavorites() {
  const skus = useSyncExternalStore(subscribe, read, () => EMPTY);
  /** False during SSR and the first paint, so nothing flashes "empty". */
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const toggle = useCallback((sku: string) => {
    const current = read();
    const has = current.includes(sku);
    write(has ? current.filter((s) => s !== sku) : [...current, sku]);
    return !has;
  }, []);

  const remove = useCallback((sku: string) => {
    write(read().filter((s) => s !== sku));
  }, []);

  return { skus, ready, toggle, remove };
}
