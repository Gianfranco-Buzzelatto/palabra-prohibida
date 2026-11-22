import { C, ui } from "../shared/ui.js";
import PERSONAJES from "../games/quien-soy/data/personajes.json";

const seguro = (u) => typeof u === "string" && /^https:\/\//.test(u);

export default function Atribuciones({ onMenu }) {
  const conFoto = PERSONAJES.filter((p) => p.foto.estado === "ok");
  const pendientes = PERSONAJES.length - conFoto.length;
  return (
    <div style={ui.root} className="app-root">
      <div style={{ flex: "0 0 auto" }}><button style={ui.text} onClick={onMenu}>← Menú</button></div>
      <div style={ui.col} className="screen-fit">
        <div className="screen-body" style={{ justifyContent: "flex-start", alignItems: "stretch", gap: 8 }}>
          <h1 style={ui.title}>ATRIBUCIONES</h1>
          <div style={{ ...ui.subtitle, margin: "0 auto" }}>Créditos de las fotos usadas en ¿Quién soy?</div>
          <div style={{ color: C.soft }}>{conFoto.length} fotos con crédito · {pendientes} personajes con foto pendiente</div>
          {conFoto.length === 0 && (
            <div style={{ ...ui.card, textAlign: "left", color: C.soft, lineHeight: 1.5 }}>
              Todavía no hay fotos cargadas. Corré <b>npm run fotos</b> con conexión a internet: busca cada personaje en
              Wikimedia Commons, descarga la imagen y guarda licencia, autor y fuente. Después aparecen acá.
            </div>
          )}
          {conFoto.map((p) => (
            <div key={p.id} style={{ ...ui.card, textAlign: "left", padding: 12 }}>
              <div style={{ fontWeight: 800 }}>{p.nombre}</div>
              <div style={{ color: C.soft, fontSize: 14 }}>Autor: {p.foto.autor || "—"} · Licencia: {p.foto.licencia || "—"}</div>
              {seguro(p.foto.fuente) && (
                <a href={p.foto.fuente} target="_blank" rel="noopener noreferrer" style={{ color: C.yellow, fontSize: 14, wordBreak: "break-all" }}>{p.foto.fuente}</a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
