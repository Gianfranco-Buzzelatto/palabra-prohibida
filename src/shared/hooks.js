import { useEffect, useState } from "react";
import { load, save } from "./storage.js";

// Reloj que fuerza re-render mientras `active` sea true.
export function useNow(active = true, ms = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [active, ms]);
  return now;
}

export function useHashRoute() {
  const read = () => window.location.hash.replace(/^#/, "") || "/";
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

export const go = (path) => {
  window.location.hash = `#${path}`;
};

// Estado que se guarda tras cada cambio. Clave propia por juego.
export function usePersistentState(key, makeInitial, version = 1) {
  const [state, setState] = useState(() => {
    const saved = load(key, null);
    return saved && saved.v === version ? saved : { v: version, ...makeInitial() };
  });
  useEffect(() => {
    save(key, state);
  }, [key, state]);
  return [state, setState];
}
