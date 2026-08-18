import { themes } from "./themes.js";

const initialState = () => ({
  screen: "home", history: [], theme: null, playerCount: null, gameMode: null, targetScore: null,
  players: [], teams: [], scores: [], teamScores: [0, 0], teamTurnIndexes: [0, 0], currentTeam: 0,
  currentPlayer: 0, round: 1, words: [], remainingWords: [], seconds: 30, selectedScore: 0,
  timerId: null, winner: null, winnerTeam: null
});

let state = initialState();
const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");

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
  state = initialState();
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - .5);
}

function drawWords() {
  if (state.remainingWords.length < 5) state.remainingWords = shuffle(themes[state.theme]);
  state.words = state.remainingWords.splice(0, 5);
}

function startGame() {
  state.players = state.players.map((name, index) => name.trim() || `Speler ${index + 1}`);
  state.scores = Array(state.playerCount).fill(0);
  state.teamScores = [0, 0];
  state.teamTurnIndexes = [0, 0];
  state.currentTeam = 0;
  state.currentPlayer = 0;
  if (state.gameMode === "teams") state.currentPlayer = teamMembers(0)[0];
  state.round = 1;
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
  if (state.gameMode === "teams") {
    state.teamScores[state.currentTeam] += state.selectedScore;
    if (state.teamScores[state.currentTeam] >= state.targetScore) {
      state.winnerTeam = state.currentTeam;
      go("winner");
      return;
    }
    state.teamTurnIndexes[state.currentTeam] += 1;
    state.currentTeam = 1 - state.currentTeam;
    const nextTeamMembers = teamMembers(state.currentTeam);
    state.currentPlayer = nextTeamMembers[state.teamTurnIndexes[state.currentTeam] % nextTeamMembers.length];
    if (state.currentTeam === 0) state.round += 1;
    state.selectedScore = 0;
    go("scoreboard");
    return;
  }
  state.scores[state.currentPlayer] += state.selectedScore;
  if (state.scores[state.currentPlayer] >= state.targetScore) {
    state.winner = state.currentPlayer;
    go("winner");
    return;
  }
  state.currentPlayer = (state.currentPlayer + 1) % state.playerCount;
  if (state.currentPlayer === 0) state.round += 1;
  state.selectedScore = 0;
  go("scoreboard");
}

function teamMembers(team) {
  return state.teams.map((assignedTeam, index) => assignedTeam === team ? index : -1).filter(index => index >= 0);
}

function teamsAreBalanced() {
  if (state.gameMode !== "teams" || state.teams.length !== state.playerCount) return false;
  const sizes = [teamMembers(0).length, teamMembers(1).length];
  return sizes[0] > 0 && sizes[1] > 0 && Math.abs(sizes[0] - sizes[1]) <= 1;
}

function setupDefaultTeams() {
  const firstTeamSize = Math.ceil(state.playerCount / 2);
  state.teams = Array.from({ length: state.playerCount }, (_, index) => index < firstTeamSize ? 0 : 1);
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
const targetScores = [10, 15, 20, 25, 30, 50];

function render() {
  modalRoot.innerHTML = "";
  const name = state.players[state.currentPlayer] || `Speler ${state.currentPlayer + 1}`;
  const teamName = `Team ${state.currentTeam + 1}`;
  const teamSplit = `${Math.ceil(state.playerCount / 2)} tegen ${Math.floor(state.playerCount / 2)}`;
  const scoreRows = rankedScores().map((entry, index) => `<div class="score-row"><span>${index + 1}. ${escapeHtml(entry.name)}</span><span>${entry.score}</span></div>`).join("");
  const views = {
    home: () => shell(`<div class="content center"><div class="stack small-gap"><h1 class="display">30 Seconds</h1><p class="definition">De mobiele versie!</p></div></div>`, {
      actions: `<button class="btn outline" data-action="how">Hoe werkt het?</button>${primary("Nieuw spel", "new-game")}`
    }),
    theme: () => shell(`<div class="content top-shift"><h1 class="title">Kies een thema.</h1><div class="choice-list">${Object.keys(themes).map(theme => `<button class="btn secondary ${state.theme === theme ? "selected" : ""}" data-theme="${theme}">${theme}</button>`).join("")}</div></div>`, {
      backButton: true, actions: primary("Verder", "to-count", !state.theme)
    }),
    count: () => shell(`<div class="content"><h1 class="title">Met hoeveel spelers spelen jullie?</h1><div class="choice-grid">${[2,3,4].map(count => `<button class="btn secondary ${state.playerCount === count || (count === 4 && state.playerCount >= 4) ? "selected" : ""}" data-count="${count}">${count === 4 ? "4+" : count}</button>`).join("")}</div>${state.playerCount >= 4 ? `<div class="choice-grid">${[4,5,6].map(count => `<button class="btn secondary ${state.playerCount === count ? "selected" : ""}" data-count="${count}">${count}</button>`).join("")}</div>` : ""}</div>`, {
      backButton: true, actions: primary("Verder", "after-count", !state.playerCount)
    }),
    mode: () => shell(`<div class="content"><h1 class="title">Hoe willen jullie spelen?</h1><div class="choice-list mode-list"><button class="btn secondary mode-choice ${state.gameMode === "individual" ? "selected" : ""}" data-mode="individual"><span>1 tegen ${state.playerCount - 1}</span><small>Iedereen omschrijft om de beurt; je scoort voor jezelf.</small></button><button class="btn secondary mode-choice ${state.gameMode === "teams" ? "selected" : ""}" data-mode="teams"><span>${teamSplit}</span><small>Speel in twee teams zoals bij gewone 30 Seconds.</small></button></div></div>`, {
      backButton: true, actions: primary("Verder", "to-target", !state.gameMode)
    }),
    target: () => shell(`<div class="content"><h1 class="title">Tot hoeveel punten spelen jullie?</h1><div class="choice-grid target-grid">${targetScores.map(score => `<button class="btn secondary ${state.targetScore === score ? "selected" : ""}" data-target="${score}">${score}</button>`).join("")}</div><label class="target-custom"><span class="small muted">Of kies zelf:</span><input class="field" data-target-input type="number" min="1" max="999" inputmode="numeric" value="${state.targetScore && !targetScores.includes(state.targetScore) ? state.targetScore : ""}" placeholder="Bijv. 12" /></label></div>`, {
      backButton: true, actions: primary("Verder", "to-names", !state.targetScore)
    }),
    names: () => shell(`<div class="content"><h1 class="title">Wat zijn jullie namen?</h1><div class="field-list">${Array.from({length: state.playerCount}, (_, i) => `<input class="field" data-player="${i}" value="${escapeHtml(state.players[i] || "")}" placeholder="Speler ${i + 1}" maxlength="18" autocomplete="off" />`).join("")}</div></div>`, {
      backButton: true, actions: primary("Verder", "after-names")
    }),
    teams: () => shell(`<div class="content"><h1 class="title">Maak twee teams.</h1><p class="body muted team-help">Verdeel de spelers zo gelijk mogelijk.</p><div class="team-list">${Array.from({ length: state.playerCount }, (_, index) => `<div class="team-player"><span class="body">${escapeHtml(state.players[index].trim() || `Speler ${index + 1}`)}</span><div class="team-buttons"><button class="btn secondary compact-team ${state.teams[index] === 0 ? "selected" : ""}" data-player-team="${index}" data-team="0">Team 1</button><button class="btn secondary compact-team ${state.teams[index] === 1 ? "selected" : ""}" data-player-team="${index}" data-team="1">Team 2</button></div></div>`).join("")}</div></div>`, {
      backButton: true, actions: primary("Verder", "to-confirm", !teamsAreBalanced())
    }),
    confirm: () => shell(`<div class="content summary"><h1 class="title">Klopt dit?</h1><div class="summary-block"><p class="small muted">Thema:</p><p class="definition">${state.theme}</p></div><div class="summary-block"><p class="small muted">Spelvorm:</p><p class="definition">${state.gameMode === "teams" ? teamSplit : "Iedereen voor zich"}</p></div><div class="summary-block"><p class="small muted">Doelscore:</p><p class="definition">${state.targetScore} punten</p></div>${state.gameMode === "teams" ? `<div class="team-summary">${[0, 1].map(team => `<div class="summary-block"><p class="small muted">Team ${team + 1}:</p><p class="body">${teamMembers(team).map(index => escapeHtml(state.players[index].trim() || `Speler ${index + 1}`)).join(", ")}</p></div>`).join("")}</div>` : `<div class="summary-block"><p class="small muted">Spelers:</p><ol class="definition">${state.players.slice(0, state.playerCount).map((player, index) => `<li>${escapeHtml(player.trim() || `Speler ${index + 1}`)}</li>`).join("")}</ol></div>`}</div>`, {
      backButton: true, actions: primary("Start het spel", "start-game")
    }),
    pass: () => shell(`<div class="content center stack"><div class="pass-title"><h1 class="title">Geef de telefoon aan:</h1><p class="display">${escapeHtml(name)}</p>${state.gameMode === "teams" ? `<p class="definition muted">${teamName}</p>` : ""}</div><p class="body muted">Zorg dat ${state.gameMode === "teams" ? "het andere team" : "andere spelers"} niet meekijkt.</p></div>`, {
      stopButton: true, actions: primary("Ik ben er klaar voor!", "start-round")
    }),
    play: () => shell(`<div class="content game-copy"><div class="game-intro"><h1 class="title">${escapeHtml(name)},</h1><p class="body muted">Leg deze 5 begrippen ${state.gameMode === "teams" ? "aan je team" : "aan de rest"} uit zonder het woord zelf te noemen.</p></div><ul class="word-list">${state.words.map(word => `<li>${word}</li>`).join("")}</ul><div class="timer" style="--progress:${state.seconds/30}"><span>${state.seconds}</span></div></div>`, {
      stopButton: true, actions: primary("Alle 5 zijn geraden!", "all-guessed")
    }),
    timeup: () => shell(`<div class="content center"><h1 class="display">De tijd is om!</h1></div>`, {
      stopButton: true, actions: primary("Vul de score in", "to-score")
    }),
    score: () => shell(`<div class="content"><h1 class="title">Hoeveel begrippen hebben jullie goed geraden?</h1><div class="choice-grid five">${[0,1,2,3,4,5].map(score => `<button class="btn secondary ${state.selectedScore === score ? "selected" : ""}" data-score="${score}">${score}</button>`).join("")}</div><p class="body muted" style="margin-top:24px">Dit waren jouw begrippen:</p><ol class="word-recap body">${state.words.map(word => `<li>${word}</li>`).join("")}</ol></div>`, {
      stopButton: true, actions: primary("Verder", "submit-score")
    }),
    scoreboard: () => shell(`<div class="content"><div style="display:flex;justify-content:space-between;align-items:center"><h1 class="title">Tussenstand</h1><p class="body muted">Ronde ${state.round}</p></div><p class="small muted score-target">Eerste tot ${state.targetScore} punten</p><div class="score-table">${scoreRows}</div></div><div class="next-player"><p class="body muted">Volgende omschrijver${state.gameMode === "teams" ? ` · ${teamName}` : ""}:</p><p class="title">${escapeHtml(name)}</p></div>`, {
      stopButton: true, actions: primary("Volgende beurt", "next-turn")
    }),
    winner: () => shell(`<div class="content winner"><div class="summary-block"><p class="body muted">Winnaar:</p><h1 class="display">${state.gameMode === "teams" ? `Team ${state.winnerTeam + 1}` : escapeHtml(state.players[state.winner])}</h1></div><div><p class="body muted">Eindstand:</p><div class="score-table">${scoreRows}</div></div></div>`, {
      stopButton: true, actions: `<button class="btn outline" data-action="home">Terug naar start</button>${primary("Nog een ronde!", "new-match")}`
    })
  };
  app.innerHTML = (views[state.screen] || views.home)();
}

function rankedScores() {
  if (state.gameMode === "teams") return state.teamScores.map((score, index) => ({ name: `Team ${index + 1}`, score })).sort((a,b) => b.score - a.score);
  return state.players.slice(0, state.playerCount).map((name, i) => ({ name, score: state.scores[i] })).sort((a,b) => b.score - a.score);
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
}

function showModal(type) {
  const isHow = type === "how";
  modalRoot.innerHTML = `<div class="modal-backdrop" role="presentation" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-modal>
    <div class="modal-copy"><h2 id="modal-title" class="definition">${isHow ? "Hoe werkt het?" : "Wil je echt stoppen?"}</h2>
    ${isHow ? `<ol class="how-list"><li>Kies een thema, het aantal spelers en de doelscore.</li><li>Speel vanaf vier spelers ieder voor zich of in twee teams.</li><li>Geef de telefoon aan de omschrijver die aan de beurt is.</li><li>Leg binnen 30 seconden vijf begrippen uit, zonder ze te noemen.</li><li>Vul het aantal goede antwoorden in. De eerste speler of het eerste team dat de doelscore haalt, wint.</li></ol>` : `<p class="body muted">Je voortgang wordt niet opgeslagen en gaat dus verloren.</p>`}</div>
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
    state.players = Array.from({ length: state.playerCount }, (_, index) => state.players[index] || "");
    state.gameMode = state.playerCount < 4 ? "individual" : null;
    state.teams = [];
    render(); return;
  }
  if (button.dataset.mode) {
    state.gameMode = button.dataset.mode;
    if (state.gameMode === "teams") setupDefaultTeams(); else state.teams = [];
    render(); return;
  }
  if (button.dataset.playerTeam !== undefined) {
    state.teams[Number(button.dataset.playerTeam)] = Number(button.dataset.team);
    render(); return;
  }
  if (button.dataset.target) { state.targetScore = Number(button.dataset.target); render(); return; }
  if (button.dataset.score !== undefined) { state.selectedScore = Number(button.dataset.score); render(); return; }
  const actions = {
    back, how: () => showModal("how"), stop: () => showModal("stop"),
    "new-game": () => { resetGame(); go("theme", false); },
    "to-count": () => go("count"), "after-count": () => go(state.playerCount >= 4 ? "mode" : "target"),
    "to-target": () => go("target"), "to-names": () => go("names"),
    "after-names": () => go(state.gameMode === "teams" ? "teams" : "confirm"),
    "to-confirm": () => go("confirm"), "start-game": startGame,
    "start-round": startRound, "all-guessed": () => { stopTimer(); state.selectedScore = 5; go("score"); },
    "to-score": () => { state.selectedScore = 0; go("score"); }, "submit-score": submitScore,
    "next-turn": () => go("pass"), home: () => { resetGame(); render(); },
    "new-match": () => {
      state.scores = Array(state.playerCount).fill(0); state.teamScores = [0, 0]; state.teamTurnIndexes = [0, 0];
      state.round = 1; state.currentTeam = 0; state.currentPlayer = state.gameMode === "teams" ? teamMembers(0)[0] : 0;
      state.winner = null; state.winnerTeam = null; go("pass");
    }
  };
  actions[button.dataset.action]?.();
});

app.addEventListener("input", (event) => {
  if (event.target.matches("[data-player]")) state.players[Number(event.target.dataset.player)] = event.target.value;
  if (event.target.matches("[data-target-input]")) {
    const score = Number(event.target.value);
    state.targetScore = Number.isInteger(score) && score >= 1 && score <= 999 ? score : null;
    app.querySelector('[data-action="to-names"]').disabled = !state.targetScore;
    app.querySelectorAll("[data-target]").forEach(button => button.classList.toggle("selected", Number(button.dataset.target) === state.targetScore));
  }
});

modalRoot.addEventListener("click", (event) => {
  if (event.target.closest("[data-modal]") && !event.target.closest("button")) return;
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "close-modal") modalRoot.innerHTML = "";
  if (action === "confirm-stop") { stopTimer(); resetGame(); modalRoot.innerHTML = ""; render(); }
});

render();
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js"));
