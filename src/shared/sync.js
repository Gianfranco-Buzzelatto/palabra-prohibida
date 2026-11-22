// Sincronización conductor -> pantalla con BroadcastChannel (misma computadora y navegador).
// La escena que se envía es SIEMPRE la versión pública: nunca incluye respuestas sin revelar.
import { load, save } from "./storage.js";

const CHANNEL = "plataforma-juegos";
const SCENE_KEY = "plataforma:escena";

let channel = null;
function getChannel() {
  if (channel) return channel;
  if (typeof BroadcastChannel === "undefined") return null;
  channel = new BroadcastChannel(CHANNEL);
  return channel;
}

export function publishScene(scene) {
  const payload = { ...scene, ts: Date.now() };
  save(SCENE_KEY, payload);
  getChannel()?.postMessage(payload);
}

export function lastScene() {
  return load(SCENE_KEY, null);
}

export function subscribeScene(cb) {
  const ch = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(CHANNEL);
  const onMsg = (e) => cb(e.data);
  // Respaldo: el evento "storage" avisa si BroadcastChannel no está disponible.
  const onStorage = (e) => {
    if (e.key !== SCENE_KEY || !e.newValue) return;
    try {
      cb(JSON.parse(e.newValue));
    } catch {
      /* escena ilegible: se ignora */
    }
  };
  ch?.addEventListener("message", onMsg);
  window.addEventListener("storage", onStorage);
  return () => {
    ch?.removeEventListener("message", onMsg);
    ch?.close();
    window.removeEventListener("storage", onStorage);
  };
}

export function openDisplayWindow() {
  const base = window.location.href.split("#")[0];
  const w = window.open(`${base}#/pantalla`, "pantalla-juegos", "width=1280,height=720");
  return !!w;
}
