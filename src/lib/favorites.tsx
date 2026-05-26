"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

const STORAGE_KEY = "terrace_favorites";

interface FavoritesContextValue {
  favorites: string[];
  count: number;
  /** False until localStorage has been read on the client. Guards against
   *  SSR/first-paint flicker where everything looks unsaved for a frame. */
  hydrated: boolean;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  /** Union the given ids into the saved set (used by "Save all" on shared lists). */
  addMany: (ids: string[]) => void;
  clear: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  count: 0,
  hydrated: false,
  isFavorite: () => false,
  toggle: () => {},
  remove: () => {},
  addMany: () => {},
  clear: () => {},
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setFavorites(
            parsed.filter((x): x is string => typeof x === "string"),
          );
        }
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  // Persist on change — but only after the initial load, so we never clobber
  // stored favourites with the empty initial state.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // ignore quota/availability errors
    }
  }, [favorites, hydrated]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : [];
        if (Array.isArray(parsed)) {
          setFavorites(
            parsed.filter((x): x is string => typeof x === "string"),
          );
        }
      } catch {
        // ignore
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const remove = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((x) => x !== id));
  }, []);

  const addMany = useCallback((ids: string[]) => {
    setFavorites((prev) => Array.from(new Set([...prev, ...ids])));
  }, []);

  const clear = useCallback(() => setFavorites([]), []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        count: favorites.length,
        hydrated,
        isFavorite,
        toggle,
        remove,
        addMany,
        clear,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
