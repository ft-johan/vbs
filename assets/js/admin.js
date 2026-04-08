import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const stateRef = ref(db, "liveEvent");
const connectedRef = ref(db, ".info/connected");

const MODE_LABELS = {
  start: "Start",
  game: "Game",
  score: "Score",
  winner: "Winner"
};

let currentState = { mode: "start", teamA: 0, teamB: 0, winner: "" };
let isConnected = false;
let isSaving = false;
let toastTimer = null;
let lastUpdatedTime = "-";

function formatScore(value) {
  return Math.max(0, Number(value) || 0).toLocaleString();
}

function render() {
  document.getElementById("current-mode").textContent = MODE_LABELS[currentState.mode] || "Unknown";
  document.getElementById("team-a-score").textContent = formatScore(currentState.teamA);
  document.getElementById("team-b-score").textContent = formatScore(currentState.teamB);
  document.getElementById("summary-score").textContent = `${formatScore(currentState.teamA)} - ${formatScore(currentState.teamB)}`;
  document.getElementById("last-sync").textContent = lastUpdatedTime;

  document.querySelectorAll("[data-mode-btn]").forEach((btn) => {
    const active = btn.dataset.modeBtn === currentState.mode;
    btn.classList.toggle("active", active);
  });

  document.querySelectorAll("[data-winner-btn]").forEach((btn) => {
    const active = currentState.mode === "winner" && btn.dataset.winnerBtn === currentState.winner;
    btn.classList.toggle("active", active);
  });

  const statusPill = document.getElementById("connection-status");
  if (isConnected) {
    statusPill.textContent = isSaving ? "Saving" : "Connected";
    statusPill.className = isSaving ? "pill saving" : "pill connected";
  } else {
    statusPill.textContent = "Offline";
    statusPill.className = "pill offline";
  }
}

function showToast(message, isError = false) {
  const t = document.getElementById("toast");
  t.textContent = message;
  t.classList.toggle("error", isError);
  t.classList.add("show");
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

function updateState(updates, successMessage = "Updated") {
  const nextState = { ...currentState, ...updates };
  isSaving = true;
  render();

  return set(stateRef, nextState)
    .then(() => {
      currentState = nextState;
      lastUpdatedTime = new Date().toLocaleTimeString();
      showToast(successMessage);
    })
    .catch(() => showToast("Could not sync to Firebase", true))
    .finally(() => {
      isSaving = false;
      render();
    });
}

function adjustScore(teamKey, delta) {
  const next = Math.max(0, (Number(currentState[teamKey]) || 0) + delta);
  return updateState({ [teamKey]: next }, "Score updated");
}

onValue(stateRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    currentState = {
      mode: data.mode || "start",
      teamA: Number(data.teamA) || 0,
      teamB: Number(data.teamB) || 0,
      winner: data.winner || ""
    };
  }
  render();
});

onValue(connectedRef, (snapshot) => {
  isConnected = snapshot.val() === true;
  render();
});

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-mode-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateState({ mode: btn.dataset.modeBtn }, `Mode: ${btn.dataset.modeBtn}`);
    });
  });

  document.getElementById("winner-a").addEventListener("click", () => {
    updateState({ mode: "winner", winner: "MOSES FFC" }, "Winner set: Moses FFC");
  });

  document.getElementById("winner-b").addEventListener("click", () => {
    updateState({ mode: "winner", winner: "AHARON FFC" }, "Winner set: Aharon FFC");
  });

  document.querySelectorAll("[data-delta]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const team = btn.dataset.team;
      const delta = Number(btn.dataset.delta) || 0;
      adjustScore(team, delta);
    });
  });

  document.querySelectorAll("[data-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [aVal, bVal] = btn.dataset.preset.split(":").map((n) => Number(n) || 0);
      updateState({ teamA: aVal, teamB: bVal }, "Preset score applied");
    });
  });

  document.getElementById("swap-scores").addEventListener("click", () => {
    updateState({ teamA: currentState.teamB, teamB: currentState.teamA }, "Scores swapped");
  });

  document.getElementById("set-exact").addEventListener("click", () => {
    const aInput = Number(document.getElementById("input-a").value) || 0;
    const bInput = Number(document.getElementById("input-b").value) || 0;
    updateState({ teamA: Math.max(0, aInput), teamB: Math.max(0, bInput) }, "Exact scores set");
  });

  document.getElementById("reset-scores").addEventListener("click", () => {
    if (!confirm("Reset both scores to 0?")) {
      return;
    }
    updateState({ teamA: 0, teamB: 0 }, "Scores reset");
  });

  document.getElementById("show-score-now").addEventListener("click", () => {
    updateState({ mode: "score" }, "Display switched to score");
  });

  render();
});
