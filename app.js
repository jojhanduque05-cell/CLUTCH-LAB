const STORAGE_KEY = "clutchlab_matches_v1";

const mistakeInfo = {
  aim: {
    title: "Prioridad: precisión y colocación de mira",
    summary: "Tus disparos pueden mejorar si preparas la mira antes de ver al rival y evitas corregir demasiado después de disparar.",
    drills: [
      "Haz 5 minutos de práctica lenta: coloca la mira a la altura de la cabeza antes de cada objetivo.",
      "En el campo de práctica, prioriza impactos controlados en vez de velocidad.",
      "En tus próximas 2 partidas, observa si tu mira está preparada antes de asomarte."
    ],
    short: "Precisión de mira"
  },
  first: {
    title: "Prioridad: evitar muertes tempranas",
    summary: "Morir primero con frecuencia puede dejar a tu equipo en desventaja. No siempre es un error, pero conviene revisar si entras sin apoyo o información.",
    drills: [
      "Antes de asomarte, pregúntate qué información tienes y dónde puede estar el rival.",
      "Si juegas Duelista, coordina la entrada; si juegas otro rol, evita exponerte sin necesidad.",
      "Registra en la siguiente partida cuántas veces moriste primero y por qué."
    ],
    short: "Posicionamiento"
  },
  movement: {
    title: "Prioridad: detenerte antes de disparar",
    summary: "En VALORANT, moverte mientras disparas suele reducir la precisión. Practica separar el movimiento del disparo.",
    drills: [
      "Practica moverte, soltar las teclas y disparar un tiro controlado.",
      "Haz 5 minutos de cambios de dirección y disparos individuales.",
      "En partida, prioriza un primer disparo preciso antes de intentar ráfagas largas."
    ],
    short: "Movimiento y disparo"
  },
  utility: {
    title: "Prioridad: usar tus habilidades con intención",
    summary: "Las habilidades son más útiles cuando ayudan a obtener información, crear espacio o proteger una zona, no cuando se usan por costumbre.",
    drills: [
      "Antes de cada ronda, decide qué habilidad quieres reservar para tu plan.",
      "Después de la ronda, anota si una habilidad aportó información, espacio o protección.",
      "Aprende una combinación útil de tu agente para un mapa que juegues con frecuencia."
    ],
    short: "Uso de habilidades"
  },
  decision: {
    title: "Prioridad: tomar decisiones con información",
    summary: "Revisa si rotas demasiado pronto, te quedas demasiado tiempo en una zona o persigues rivales sin necesidad.",
    drills: [
      "En cada ronda, identifica tu objetivo: defender, obtener información, apoyar o jugar por tiempo.",
      "Antes de rotar, considera cuántos compañeros y rivales se han visto y cuánto tiempo queda.",
      "Evita perseguir eliminaciones si poner en riesgo la ronda no compensa."
    ],
    short: "Decisiones"
  },
  communication: {
    title: "Prioridad: comunicación útil",
    summary: "Las llamadas cortas y concretas ayudan al equipo a decidir. Comunica información que tus compañeros puedan usar.",
    drills: [
      "Da información breve: ubicación, cantidad de enemigos y daño aproximado si lo conoces.",
      "Evita hablar encima de un compañero que está en un duelo importante.",
      "Después de morir, comparte información útil sin distraer a quienes siguen vivos."
    ],
    short: "Comunicación"
  }
};

function getMatches() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveMatches(matches) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function renderDashboard() {
  const matches = getMatches();
  const wins = matches.filter(match => match.result === "win").length;
  const winRate = matches.length ? Math.round((wins / matches.length) * 100) : 0;
  const avgDeaths = matches.length
    ? (matches.reduce((sum, match) => sum + Number(match.deaths), 0) / matches.length).toFixed(1)
    : "—";

  document.getElementById("totalMatches").textContent = matches.length;
  document.getElementById("winRate").textContent = `${winRate}%`;
  document.getElementById("avgDeaths").textContent = avgDeaths;
  document.getElementById("heroMatches").textContent = matches.length;
  document.getElementById("heroWins").textContent = `${winRate}%`;

  const counts = {};
  matches.forEach(match => counts[match.mistake] = (counts[match.mistake] || 0) + 1);
  const topMistake = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  document.getElementById("priorityStat").textContent = topMistake
    ? mistakeInfo[topMistake].short
    : "Empieza aquí";

  renderCoach(matches, counts, topMistake);
  renderHistory(matches);
}

function renderCoach(matches, counts, topMistake) {
  const coach = document.getElementById("coachContent");
  const plan = document.getElementById("trainingPlan");

  if (!matches.length || !topMistake) {
    coach.innerHTML = `<div class="empty-state"><div class="empty-target">◎</div><h3>Tu análisis empieza aquí</h3><p>Registra algunas partidas y CLUTCHLAB encontrará los problemas que más se repiten.</p></div>`;
    plan.innerHTML = `
      <article class="training-card"><span>01 / 10 MIN</span><h3>Calentamiento</h3><p>Practica movimientos suaves y dispara con control en el campo de práctica.</p></article>
      <article class="training-card"><span>02 / 10 MIN</span><h3>Precisión</h3><p>Prioriza un disparo preciso antes de intentar disparar rápido.</p></article>
      <article class="training-card"><span>03 / 10 MIN</span><h3>Aplicación</h3><p>En partidas, observa la altura de tu mira y evita asomarte sin información.</p></article>`;
    return;
  }

  const info = mistakeInfo[topMistake];
  const count = counts[topMistake];
  coach.innerHTML = `
    <div class="coach-result">
      <span class="tag">PRIORIDAD DETECTADA · ${count} DE ${matches.length} PARTIDAS</span>
      <h3>${escapeHTML(info.title)}</h3>
      <p>${escapeHTML(info.summary)}</p>
      <strong>Qué practicar ahora</strong>
      <ul>${info.drills.map(drill => `<li>${escapeHTML(drill)}</li>`).join("")}</ul>
    </div>`;

  plan.innerHTML = info.drills.map((drill, index) => `
    <article class="training-card">
      <span>0${index + 1} / ${index === 0 ? "10" : "10"} MIN</span>
      <h3>${["Práctica enfocada", "Repetición consciente", "Aplicación en partida"][index]}</h3>
      <p>${escapeHTML(drill)}</p>
    </article>`).join("");
}

function renderHistory(matches) {
  const list = document.getElementById("historyList");
  if (!matches.length) {
    list.innerHTML = `<p class="muted empty-history">Aún no has registrado partidas.</p>`;
    return;
  }

  list.innerHTML = matches.slice().reverse().slice(0, 8).map(match => {
    const date = new Date(match.createdAt);
    const dateLabel = Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
    const resultLabel = match.result === "win" ? "VICTORIA" : "DERROTA";
    const notes = match.notes ? ` · ${escapeHTML(match.notes)}` : "";
    return `<article class="history-item">
      <span class="result-pill ${match.result}">${resultLabel}</span>
      <div><strong>${escapeHTML(match.rank)} · ${escapeHTML(match.role)}</strong><p>${escapeHTML(mistakeInfo[match.mistake].short)} · ${match.deaths} muertes${notes}</p></div>
      <time>${dateLabel}</time>
    </article>`;
  }).join("");
}

document.getElementById("matchForm").addEventListener("submit", event => {
  event.preventDefault();
  const match = {
    id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
    result: document.getElementById("result").value,
    rank: document.getElementById("rank").value,
    role: document.getElementById("role").value,
    deaths: Number(document.getElementById("deaths").value),
    mistake: document.getElementById("mistake").value,
    notes: document.getElementById("notes").value.trim(),
    createdAt: new Date().toISOString()
  };

  const matches = getMatches();
  matches.push(match);
  saveMatches(matches);
  renderDashboard();
  document.getElementById("formMessage").textContent = "Partida guardada. Tu plan se ha actualizado.";
  document.getElementById("notes").value = "";
});

document.getElementById("clearHistory").addEventListener("click", () => {
  const matches = getMatches();
  if (!matches.length) {
    document.getElementById("formMessage").textContent = "No hay partidas que borrar.";
    return;
  }
  if (confirm("¿Seguro que quieres borrar todas las partidas guardadas en este navegador?")) {
    localStorage.removeItem(STORAGE_KEY);
    document.getElementById("formMessage").textContent = "Historial borrado.";
    renderDashboard();
  }
});

renderDashboard();
