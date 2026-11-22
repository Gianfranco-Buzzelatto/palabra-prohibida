// Busca cada personaje en Wikimedia Commons, descarga la imagen y completa licencia, autor y fuente.
// Requiere internet. Uso:  npm run fotos            (todos los pendientes)
//                          npm run fotos -- dep-001 dep-002   (solo esos ids)
// Los personajes ficticios se omiten (son obras protegidas). SIEMPRE revisá a ojo las fotos descargadas:
// una búsqueda automática puede traer una imagen equivocada; si no corresponde, borrala y volvé a "pendiente".
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JSON_PATH = path.join(root, "src/games/quien-soy/data/personajes.json");
const OUT = path.join(root, "public", "personajes");
const API = "https://commons.wikimedia.org/w/api.php";
const UA = "PalabraProhibida/1.0 (juego de cumpleaños; uso no comercial)";
const LICENCIAS_OK = /^(cc[- ]by|cc[- ]by-sa|cc0|public domain|pd)/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const quitarTags = (s = "") => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const norm = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", origin: "*", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function buscar(nombre) {
  const data = await api({
    action: "query", generator: "search", gsrnamespace: "6", gsrlimit: "10", gsrsearch: `${nombre} filetype:bitmap`,
    prop: "imageinfo", iiprop: "url|extmetadata|mime", iiurlwidth: "800",
  });
  const paginas = Object.values(data.query?.pages || {}).sort((a, b) => a.index - b.index);
  const tokens = norm(nombre).split(/\s+/).filter((t) => t.length > 2);
  for (const p of paginas) {
    const ii = p.imageinfo?.[0];
    if (!ii || !/^image\/(jpeg|png)$/.test(ii.mime)) continue;
    const titulo = norm(p.title);
    if (!tokens.every((t) => titulo.includes(t))) continue; // el nombre completo debe estar en el título del archivo
    const meta = ii.extmetadata || {};
    const licencia = quitarTags(meta.LicenseShortName?.value);
    if (!LICENCIAS_OK.test(licencia)) continue;
    return {
      url: ii.thumburl || ii.url, ext: ii.mime === "image/png" ? "png" : "jpg", licencia,
      autor: quitarTags(meta.Artist?.value) || "Autor no informado", fuente: ii.descriptionurl,
    };
  }
  return null;
}

const personajes = JSON.parse(readFileSync(JSON_PATH, "utf8"));
const ids = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
let nuevos = 0, sin = 0;
for (const p of personajes) {
  if (ids.length && !ids.includes(p.id)) continue;
  if (p.foto.estado === "ok" || p.categoria === "Personajes ficticios") continue;
  try {
    const f = await buscar(p.nombre);
    if (!f) { console.log(`– ${p.id} ${p.nombre}: sin resultado confiable (queda pendiente)`); sin++; continue; }
    const img = await fetch(f.url, { headers: { "User-Agent": UA } });
    if (!img.ok) throw new Error(`descarga HTTP ${img.status}`);
    const archivo = `${p.id}.${f.ext}`;
    writeFileSync(path.join(OUT, archivo), Buffer.from(await img.arrayBuffer()));
    p.foto = { estado: "ok", archivo, licencia: f.licencia, autor: f.autor, fuente: f.fuente };
    writeFileSync(JSON_PATH, JSON.stringify(personajes, null, 1) + "\n"); // guarda tras cada foto
    console.log(`✓ ${p.id} ${p.nombre} (${f.licencia})`);
    nuevos++;
  } catch (e) {
    console.log(`✗ ${p.id} ${p.nombre}: ${e.message}`);
  }
  await sleep(1200);
}
console.log(`\nFotos nuevas: ${nuevos} · sin resultado: ${sin}. Revisalas a ojo y corré: npm run verificar-fotos`);
