// script.js — Dashboard

window.onload = function () {
  const name = localStorage.getItem("playerName");

  if (!name) {
    openNameModal();
  } else {
    document.getElementById("playerName").innerText = name;
  }

  const xp     = parseInt(localStorage.getItem("xp"))     || 0;
  const levels = parseInt(localStorage.getItem("levels")) || 0;
  const badges = parseInt(localStorage.getItem("badges")) || 0;

  setStatAnimated("xp",     xp);
  setStatAnimated("levels", levels);
  setStatAnimated("badges", badges);

  updateBadges(levels);
  updateProgress();

  if (localStorage.getItem("hasPlayed")) {
    document.getElementById("startBtn").style.display    = "none";
    document.getElementById("continueBtn").style.display = "inline-flex";
    document.getElementById("resetBtn").style.display    = "inline-flex";
  }

  // Enter key on name input
  document.getElementById("nameInput")
    .addEventListener("keydown", e => { if (e.key === "Enter") saveName(); });
};

// ── STAT HELPER ──────────────────────────────────────────
function setStatAnimated(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = value;
  el.classList.remove("bump");
  void el.offsetWidth;          // reflow to restart animation
  el.classList.add("bump");
}

// ── NAME MODAL ───────────────────────────────────────────
function openNameModal() {
  const modal = document.getElementById("nameModal");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  setTimeout(() => document.getElementById("nameInput").focus(), 50);
}

function closeNameModal() {
  const modal = document.getElementById("nameModal");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function cancelName() {
  closeNameModal();
}

function saveName() {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) {
    document.getElementById("nameInput").style.borderColor = "#ef4444";
    return;
  }
  localStorage.setItem("playerName", name);
  localStorage.setItem("hasPlayed", "true");
  document.getElementById("playerName").innerText = name;
  closeNameModal();
  goToMap();           // go straight to map after registering
}

// ── RESET MODAL ──────────────────────────────────────────
function confirmReset() {
  const modal = document.getElementById("resetModal");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeResetModal() {
  const modal = document.getElementById("resetModal");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function resetGame() {
  localStorage.clear();
  location.reload();
}

// ── NAVIGATION ───────────────────────────────────────────
function startQuest() {
  if (!localStorage.getItem("playerName")) { openNameModal(); return; }
  localStorage.setItem("hasPlayed", "true");
  goToMap();
}

function goToMap() {
  window.location.href = "map.html";
}

// ── XP / PROGRESS ────────────────────────────────────────
function addXP(amount = 10) {
  let xp     = parseInt(localStorage.getItem("xp"))     || 0;
  let levels = parseInt(localStorage.getItem("levels")) || 0;

  xp += amount;
  const newLevel = Math.floor(xp / 100);

  if (newLevel > levels) {
    levels = newLevel;
    localStorage.setItem("levels", levels);
    setStatAnimated("levels", levels);
  }

  localStorage.setItem("xp", xp);
  setStatAnimated("xp", xp);
  updateBadges(levels);
  updateProgress();
}

function updateBadges(levels) {
  let badges = 0;
  if (levels >= 1) badges = 1;
  if (levels >= 3) badges = 2;
  if (levels >= 5) badges = 3;

  localStorage.setItem("badges", badges);
  setStatAnimated("badges", badges);
}

function updateProgress() {
  const levels  = parseInt(localStorage.getItem("levels")) || 0;
  const percent = Math.min((levels / 5) * 100, 100);

  const fill = document.getElementById("progressFill");
  if (fill) fill.style.width = percent + "%";

  const rankLabel = document.getElementById("rankLabel");
  if (!rankLabel) return;

  let rank = "Rookie";
  if (levels >= 5)      rank = "Elite Agent";
  else if (levels >= 3) rank = "Field Operative";
  else if (levels >= 1) rank = "Junior Analyst";

  if (rankLabel.textContent !== rank) {
    rankLabel.style.transition = "opacity 0.3s";
    rankLabel.style.opacity = "0";
    setTimeout(() => {
      rankLabel.textContent = rank;
      rankLabel.style.opacity = "1";
    }, 300);
  }
}