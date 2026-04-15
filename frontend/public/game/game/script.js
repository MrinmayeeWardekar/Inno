// script.js  (FRONT DASHBOARD)

// LOAD DATA
window.onload = function () {
  let name = localStorage.getItem("playerName");

  if (!name) {
    openNameModal();
  } else {
    document.getElementById("playerName").innerText = name;
  }

  let xp = parseInt(localStorage.getItem("xp")) || 0;
  let levels = parseInt(localStorage.getItem("levels")) || 0;
  let badges = parseInt(localStorage.getItem("badges")) || 0;

  document.getElementById("xp").innerText = xp;
  document.getElementById("levels").innerText = levels;
  document.getElementById("badges").innerText = badges;

  updateBadges(levels);
  updateProgress();

  if (localStorage.getItem("hasPlayed")) {
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("continueBtn").style.display = "inline-flex";
    document.getElementById("resetBtn").style.display = "inline-flex";
  }
};

// MODAL HELPERS
function openNameModal() {
  const modal = document.getElementById("nameModal");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("nameInput").focus();
}

function closeNameModal() {
  const modal = document.getElementById("nameModal");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function cancelName() {
  closeNameModal();
}

// SAVE NAME
function saveName() {
  let name = document.getElementById("nameInput").value.trim();
  if (!name) return;

  localStorage.setItem("playerName", name);
  document.getElementById("playerName").innerText = name;

  closeNameModal();
}

// START GAME
function startQuest() {
  localStorage.setItem("hasPlayed", "true");
  goToMap();
}

// NAVIGATION
function goToMap() {
  window.location.href = "map.html";
}

// GLOBAL XP SYSTEM (USED BY ALL PAGES)
function addXP(amount = 10) {
  let xp = parseInt(localStorage.getItem("xp")) || 0;
  let levels = parseInt(localStorage.getItem("levels")) || 0;

  xp += amount;

  // LEVEL SYSTEM (100 XP = 1 LEVEL)
  let newLevel = Math.floor(xp / 100);

  if (newLevel > levels) {
    levels = newLevel;
    localStorage.setItem("levels", levels);
    const levelsEl = document.getElementById("levels");
    if (levelsEl) levelsEl.innerText = levels;
  }

  localStorage.setItem("xp", xp);
  const xpEl = document.getElementById("xp");
  if (xpEl) xpEl.innerText = xp;

  updateBadges(levels);
  updateProgress();
}

// BADGES
function updateBadges(levels) {
  let badges = 0;

  if (levels >= 1) badges = 1;
  if (levels >= 3) badges = 2;
  if (levels >= 5) badges = 3;

  localStorage.setItem("badges", badges);
  const badgesEl = document.getElementById("badges");
  if (badgesEl) badgesEl.innerText = badges;
}

// PROGRESS BAR + RANK LABEL
function updateProgress() {
  let levels = parseInt(localStorage.getItem("levels")) || 0;
  let percent = Math.min((levels / 5) * 100, 100);
  const fill = document.getElementById("progressFill");
  if (fill) fill.style.width = percent + "%";

  const rankLabel = document.getElementById("rankLabel");
  if (!rankLabel) return;

  if (levels >= 5) rankLabel.textContent = "Elite Agent";
  else if (levels >= 3) rankLabel.textContent = "Field Operative";
  else if (levels >= 1) rankLabel.textContent = "Junior Analyst";
  else rankLabel.textContent = "Rookie";
}

// RESET
function resetGame() {
  localStorage.clear();
  location.reload();
}