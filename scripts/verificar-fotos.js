// Falla (exit 1) si hay un registro "ok" sin archivo, un "pendiente" con archivo, o archivos huérfanos.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public", "personajes");
const personajes = JSON.parse(readFileSync(path.join(root, "src/games/quien-soy/data/personajes.json"), "utf8"));
const errores = [];
const referenciados = new Set();

for (const p of personajes) {
  const { estado, archivo, licencia, autor, fuente } = p.foto;
  if (estado === "ok") {
    if (!archivo) errores.push(`${p.id} ${p.nombre}: estado "ok" sin archivo`);
    else if (!existsSync(path.join(dir, archivo))) errores.push(`${p.id} ${p.nombre}: falta el archivo ${archivo}`);
    else referenciados.add(archivo);
    if (!licencia || !autor || !fuente) errores.push(`${p.id} ${p.nombre}: foto "ok" sin licencia, autor o fuente`);
  } else if (estado === "pendiente") {
    if (archivo) errores.push(`${p.id} ${p.nombre}: "pendiente" pero tiene archivo ${archivo}`);
  } else errores.push(`${p.id}: estado inválido "${estado}"`);
}
if (existsSync(dir)) {
  for (const f of readdirSync(dir)) {
    if (f.startsWith(".")) continue;
    if (!referenciados.has(f)) errores.push(`archivo huérfano en public/personajes: ${f}`);
  }
}
const ok = personajes.filter((p) => p.foto.estado === "ok").length;
console.log(`Personajes: ${personajes.length} · fotos ok: ${ok} · pendientes: ${personajes.length - ok}`);
if (errores.length) {
  console.error(errores.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log("✓ Fotos consistentes");
