import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const stateRef = ref(db, "liveEvent");

let currentMode = null;
let confettiInterval = null;

onValue(stateRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  if (data.mode !== currentMode) {
    currentMode = data.mode;
    switchMode(data);
  } else {
    updateScores(data);
  }
});

function switchMode(data) {
  stopConfetti();

  const body = document.body;
  body.className = "";

  const sections = {
    start: document.getElementById("mode-start"),
    game: document.getElementById("mode-game"),
    score: document.getElementById("mode-score"),
    winner: document.getElementById("mode-winner")
  };

  Object.values(sections).forEach((section) => {
    section.style.display = "none";
    section.classList.remove("visible");
  });

  switch (data.mode) {
    case "start":
      body.classList.add("bg-red");
      sections.start.style.display = "flex";
      setTimeout(() => sections.start.classList.add("visible"), 50);
      runCountdown();
      break;
    case "game":
      body.classList.add("bg-game");
      sections.game.style.display = "flex";
      setTimeout(() => sections.game.classList.add("visible"), 50);
      break;
    case "score":
      body.classList.add("bg-red");
      sections.score.style.display = "flex";
      setTimeout(() => sections.score.classList.add("visible"), 50);
      updateScores(data);
      break;
    case "winner":
      body.classList.add("bg-red");
      sections.winner.style.display = "flex";
      setTimeout(() => sections.winner.classList.add("visible"), 50);
      document.getElementById("winner-name").textContent = data.winner || "";
      launchConfetti();
      break;
    default:
      break;
  }
}

function updateScores(data) {
  const scoreCenter = document.getElementById("score-center");
  if (scoreCenter) {
    scoreCenter.textContent =
      (data.teamA || 0).toLocaleString() + " - " + (data.teamB || 0).toLocaleString();
  }
}

function runCountdown() {
  const el = document.getElementById("countdown-number");
  const getReadyEl = document.getElementById("get-ready-text");
  const steps = ["3", "2", "1", "GO!"];
  let i = 0;

  getReadyEl.style.display = "block";

  const tick = () => {
    if (i >= steps.length) return;
    el.textContent = steps[i];
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
    i++;
    if (i < steps.length) {
      setTimeout(tick, 1000);
    } else {
      setTimeout(() => {
        el.classList.remove("pop");
        el.textContent = "";
      }, 1200);
    }
  };

  setTimeout(tick, 800);
}

function launchConfetti() {
  const fire = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff0000", "#ffffff", "#ff6b6b", "#ffd700"]
    });
    confetti({ particleCount: 40, spread: 120, origin: { x: 0.1, y: 0.5 }, angle: 60 });
    confetti({ particleCount: 40, spread: 120, origin: { x: 0.9, y: 0.5 }, angle: 120 });
  };

  fire();
  confettiInterval = setInterval(fire, 2200);
}

function stopConfetti() {
  if (confettiInterval) {
    clearInterval(confettiInterval);
    confettiInterval = null;
  }
}
