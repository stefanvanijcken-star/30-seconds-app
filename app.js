const themes = {
  Vrienden: ["Groepsapp", "Inside joke", "Beste vriend", "Festival", "Selfie", "Reünie", "Huisgenoot", "Verjaardag", "Karaoke", "Spelletjesavond", "Bijnaam", "Vakantiefoto", "Schoolplein", "Vriendschapsband", "Slaapfeest"],
  Terras: ["Bitterballen", "Zonnescherm", "Rondje geven", "Dienblad", "Speciaalbier", "Terrasverwarmer", "Menukaart", "Fooi", "Parasol", "Borrelplank", "Ober", "Limonade", "Reservering", "IJsblokjes", "Stamtafel"],
  "Date night": ["Eerste kus", "Kaarslicht", "Bioscoop", "Compliment", "Blind date", "Restaurant", "Vlinders", "Liefdesbrief", "Picknick", "Romcom", "Rozen", "Dansen", "Dessert", "Match", "Sterrenkijken"],
  Vakantie: ["Wandelstok", "De Pyreneeën", "Autoruit", "Geit", "Waterfles", "Paspoort", "Camping", "Zonnebrand", "Koffer", "Roadtrip", "Hangmat", "Souvenir", "Vliegticket", "Bergtop", "Reisgids"],
  Huisfeest: ["Discobal", "Buren", "Snackbar", "Dansvloer", "Playlist", "Confetti", "Keukenfeest", "Deurbel", "Polonaise", "Feesthoed", "Bankstel", "Luidspreker", "Laatste ronde", "Schoonmaken", "Garderobe"]
};

const initialState = () => ({
  screen: "home", history: [], theme: "Vakantie", playerCount: 3,
  players: ["Stefan", "Yennifer", "Flip"], scores: [0, 0, 0],
  currentPlayer: 0, round: 1, words: [], seconds: 30, selectedScore: 0,
  timerId: null, winner: null
});

let state = initialState();
const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");

function persistSettings() {
  localStorage.setItem("thirty-seconds-settings", JSON.stringify({ theme: state.theme, playerCount: state.playerCount, players: state.players }));
}

function restoreSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("thirty-seconds-settings"));
    if (saved?.theme && themes[saved.theme]) state.theme = saved.theme;
    if (saved?.playerCount >= 2 && saved?.playerCount <= 6) state.playerCount = saved.playerCount;
    if (Array.isArray(saved?.players)) state.players = saved.players.slice(0, state.playerCount);
  } catch { /* Start with friendly defaults. */ }
}

function go(screen, remember = true) {
  stopTimer();
  if (remember && state.screen !== screen) state.history.push(state.screen);
  state.screen = screen;
  render();
}

function back() {
  stopTimer();
  state.screen = state.history.pop() || "home";
  render();
}

function resetGame() {
  const settings = { theme: state.theme, playerCount: state.playerCount, players: [...state.players] };
  state = { ...initialState(), ...settings };
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - .5);
}

function drawWords() {
  state.words = shuffle(themes[state.theme]).slice(0, 5);
}

function startGame() {
  state.players = state.players.map((name, index) => name.trim() || `Speler ${index + 1}`);
  state.scores = Array(state.playerCount).fill(0);
  state.currentPlayer = 0;
  state.round = 1;
  persistSettings();
  go("pass");
}

function startRound() {
  drawWords();
  state.seconds = 30;
  go("play");
  state.timerId = window.setInterval(() => {
    state.seconds -= 1;
    updateTimer();
    if (state.seconds <= 0) {
      stopTimer();
      if (navigator.vibrate) navigator.vibrate([180, 80, 180]);
      go("timeup", false);
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerId) window.clearInterval(state.timerId);
  state.timerId = null;
}

function updateTimer() {
  const timer = document.querySelector(".timer");
  const value = document.querySelector(".timer span");
  if (timer) timer.style.setProperty("--progress", Math.max(0, state.seconds / 30));
  if (value) value.textContent = state.seconds;
}

function submitScore() {
  state.scores[state.currentPlayer] += state.selectedScore;
  if (state.scores[state.currentPlayer] >= 15) {
    state.winner = state.currentPlayer;
    go("winner");
    return;
  }
  state.currentPlayer = (state.currentPlayer + 1) % state.playerCount;
  if (state.currentPlayer === 0) state.round += 1;
  state.selectedScore = 0;
  go("scoreboard");
}

function shell(content, { backButton = false, stopButton = false, actions = "", className = "" } = {}) {
  return `<section class="screen ${className}">
    <nav class="topbar" aria-label="Navigatie">
      ${backButton ? `<button class="btn compact" data-action="back">&lt; Terug</button>` : `<span></span>`}
      ${stopButton ? `<button class="btn compact" data-action="stop">Stop</button>` : `<span></span>`}
    </nav>
    ${content}
    <footer class="actions">${actions}</footer>
  </section>`;
}

const primary = (label, action, disabled = false) => `<button class="btn primary" data-action="${action}" ${disabled ? "disabled" : ""}>${label}</button>`;

function render() {
  modalRoot.innerHTML = "";
  const name = state.players[state.currentPlayer] || `Speler ${state.currentPlayer + 1}`;
  const views = {
    home: () => shell(`<div class="content center"><div class="stack small-gap"><h1 class="display">30 Seconds</h1><p class="definition">De mobiele versie!</p></div></div>`, {
      actions: `<button class="btn outline" data-action="how">Hoe werkt het?</button>${primary("Nieuw spel", "new-game")}`
    }),
    theme: () => shell(`<div class="content top-shift"><h1 class="title">Kies een thema.</h1><div class="choice-list">${Object.keys(themes).map(theme => `<button class="btn secondary ${state.theme === theme ? "selected" : ""}" data-theme="${theme}">${theme}</button>`).join("")}</div></div>`, {
      backButton: true, actions: primary("Verder", "to-count")
    }),
    count: () => shell(`<div class="content"><h1 class="title">Met hoeveel spelers spelen jullie?</h1><div class="choice-grid">${[2,3,4].map(count => `<button class="btn secondary ${state.playerCount === count || (count === 4 && state.playerCount >= 4) ? "selected" : ""}" data-count="${count}">${count === 4 ? "4+" : count}</button>`).join("")}</div>${state.playerCount >= 4 ? `<div class="choice-grid">${[4,5,6].map(count => `<button class="btn secondary ${state.playerCount === count ? "selected" : ""}" data-count="${count}">${count}</button>`).join("")}</div>` : ""}</div>`, {
      backButton: true, actions: primary("Verder", "to-names")
    }),
    names: () => shell(`<div class="content"><h1 class="title">Wat zijn jullie namen?</h1><div class="field-list">${Array.from({length: state.playerCount}, (_, i) => `<input class="field" data-player="${i}" value="${escapeHtml(state.players[i] || "")}" placeholder="Speler ${i + 1}" maxlength="18" autocomplete="off" />`).join("")}</div></div>`, {
      backButton: true, actions: primary("Verder", "to-confirm")
    }),
    confirm: () => shell(`<div class="content summary"><h1 class="title">Klopt dit?</h1><div class="summary-block"><p class="small muted">Thema:</p><p class="definition">${state.theme}</p></div><div class="summary-block"><p class="small muted">Aantal spelers:</p><p class="definition">${state.playerCount}</p></div><div class="summary-block"><p class="small muted">Spelersnamen:</p><ol class="definition">${state.players.slice(0, state.playerCount).map(n => `<li>${escapeHtml(n)}</li>`).join("")}</ol></div></div>`, {
      backButton: true, actions: primary("Start het spel", "start-game")
    }),
    pass: () => shell(`<div class="content center stack"><div class="pass-title"><h1 class="title">Geef de telefoon aan:</h1><p class="display">${escapeHtml(name)}</p></div><p class="body muted">Zorg dat andere spelers niet meekijken.</p></div>`, {
      stopButton: true, actions: primary("Ik ben er klaar voor!", "start-round")
    }),
    play: () => shell(`<div class="content game-copy"><div class="game-intro"><h1 class="title">${escapeHtml(name)},</h1><p class="body muted">Leg deze 5 begrippen uit zonder het woord zelf te noemen.</p></div><ul class="word-list">${state.words.map(word => `<li>${word}</li>`).join("")}</ul><div class="timer" style="--progress:${state.seconds/30}"><span>${state.seconds}</span></div></div>`, {
      stopButton: true, actions: primary("Alle 5 zijn geraden!", "all-guessed")
    }),
    timeup: () => shell(`<div class="content center"><h1 class="display">De tijd is om!</h1></div>`, {
      stopButton: true, actions: primary("Vul de score in", "to-score")
    }),
    score: () => shell(`<div class="content"><h1 class="title">Hoeveel begrippen hebben jullie goed geraden?</h1><div class="choice-grid five">${[0,1,2,3,4,5].map(score => `<button class="btn secondary ${state.selectedScore === score ? "selected" : ""}" data-score="${score}">${score}</button>`).join("")}</div><p class="body muted" style="margin-top:24px">Dit waren jouw begrippen:</p><ol class="word-recap body">${state.words.map(word => `<li>${word}</li>`).join("")}</ol></div>`, {
      stopButton: true, actions: primary("Verder", "submit-score")
    }),
    scoreboard: () => shell(`<div class="content"><div style="display:flex;justify-content:space-between;align-items:center"><h1 class="title">Tussenstand</h1><p class="body muted">Ronde ${state.round}</p></div><div class="score-table">${rankedPlayers().map((p, i) => `<div class="score-row"><span>${i + 1}. ${escapeHtml(p.name)}</span><span>${p.score}</span></div>`).join("")}</div></div><div class="next-player"><p class="body muted">Volgende speler:</p><p class="title">${escapeHtml(name)}</p></div>`, {
      stopButton: true, actions: primary("Volgende beurt", "next-turn")
    }),
    winner: () => shell(`<div class="content winner"><div class="summary-block"><p class="body muted">Winnaar:</p><h1 class="display">${escapeHtml(state.players[state.winner])}</h1></div><div><p class="body muted">Eindstand:</p><div class="score-table">${rankedPlayers().map((p, i) => `<div class="score-row"><span>${i + 1}. ${escapeHtml(p.name)}</span><span>${p.score}</span></div>`).join("")}</div></div></div>`, {
      stopButton: true, actions: `<button class="btn outline" data-action="home">Terug naar start</button>${primary("Nog een ronde!", "new-match")}`
    })
  };
  app.innerHTML = (views[state.screen] || views.home)();
}

function rankedPlayers() {
  return state.players.slice(0, state.playerCount).map((name, i) => ({ name, score: state.scores[i] })).sort((a,b) => b.score - a.score);
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
}

function showModal(type) {
  const isHow = type === "how";
  modalRoot.innerHTML = `<div class="modal-backdrop" role="presentation" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-modal>
    <div class="modal-copy"><h2 id="modal-title" class="definition">${isHow ? "Hoe werkt het?" : "Wil je echt stoppen?"}</h2>
    ${isHow ? `<ol class="how-list"><li>Kies een thema en vul de spelers in.</li><li>Geef de telefoon aan de speler die aan de beurt is.</li><li>Leg binnen 30 seconden vijf begrippen uit, zonder ze te noemen.</li><li>Vul het aantal goede antwoorden in. De eerste met 15 punten wint.</li></ol>` : `<p class="body muted">Je voortgang wordt niet opgeslagen en gaat dus verloren.</p>`}</div>
    <div class="modal-actions">${isHow ? `<button class="btn primary" data-action="close-modal" style="grid-column:1/-1">Begrepen</button>` : `<button class="btn outline" data-action="close-modal">Nee</button><button class="btn primary" data-action="confirm-stop">Ja, stop</button>`}</div>
  </div></div>`;
  modalRoot.querySelector(".btn")?.focus();
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.theme) { state.theme = button.dataset.theme; render(); return; }
  if (button.dataset.count) {
    state.playerCount = Number(button.dataset.count);
    while (state.players.length < state.playerCount) state.players.push("");
    render(); return;
  }
  if (button.dataset.score !== undefined) { state.selectedScore = Number(button.dataset.score); render(); return; }
  const actions = {
    back, how: () => showModal("how"), stop: () => showModal("stop"),
    "new-game": () => { resetGame(); go("theme", false); },
    "to-count": () => go("count"), "to-names": () => go("names"),
    "to-confirm": () => { persistSettings(); go("confirm"); }, "start-game": startGame,
    "start-round": startRound, "all-guessed": () => { stopTimer(); state.selectedScore = 5; go("score"); },
    "to-score": () => { state.selectedScore = 0; go("score"); }, "submit-score": submitScore,
    "next-turn": () => go("pass"), home: () => { resetGame(); render(); },
    "new-match": () => { state.scores = Array(state.playerCount).fill(0); state.round = 1; state.currentPlayer = 0; state.winner = null; go("pass"); }
  };
  actions[button.dataset.action]?.();
});

app.addEventListener("input", (event) => {
  if (event.target.matches("[data-player]")) state.players[Number(event.target.dataset.player)] = event.target.value;
});

modalRoot.addEventListener("click", (event) => {
  if (event.target.closest("[data-modal]") && !event.target.closest("button")) return;
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "close-modal") modalRoot.innerHTML = "";
  if (action === "confirm-stop") { stopTimer(); resetGame(); modalRoot.innerHTML = ""; render(); }
});

restoreSettings();
render();
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js"));
