// final.js – All Missions Complete (UPGRADED)

const MISSION_LIST = [
  { level: 1, icon: "🔑", title: "Primary Key Pursuit" },
  { level: 2, icon: "🧩", title: "Candidate Key Challenge" },
  { level: 3, icon: "🔗", title: "Foreign Affairs" },
  { level: 4, icon: "📐", title: "Normalization Protocol" },
];

const RANKS = [
  { min: 4, icon: "🏆", name: "Elite Database Guardian",  msg: "You mastered every concept. The campus database is fully restored!" },
  { min: 3, icon: "🔥", name: "Senior Data Operative",    msg: "Impressive work! You handled complex schema challenges with ease." },
  { min: 1, icon: "⚡", name: "Junior Data Agent",        msg: "Good progress, Agent! Keep training to reach Elite status." },
  { min: 0, icon: "🌱", name: "Rookie Agent",             msg: "You're just getting started. Complete all missions to rise in rank." },
];

window.addEventListener("DOMContentLoaded", () => {
  // Spawn stars
  spawnStars();

  // Read stats
  const xp     = parseInt(localStorage.getItem("xp"))     || 0;
  const levels = parseInt(localStorage.getItem("levels")) || 0;
  const badges = parseInt(localStorage.getItem("badges")) || 0;
  const streak = parseInt(localStorage.getItem("streak")) || 0;
  const unlocked = parseInt(localStorage.getItem("unlockedLevel")) || 1;

  // Animate counters
  animateCounter("final-xp",     xp);
  animateCounter("final-level",  levels);
  animateCounter("final-badges", badges);
  animateCounter("final-streak", streak);

  // Rank
  const completedMissions = Math.min(unlocked - 1, MISSION_LIST.length);
  const rankData = RANKS.find(r => completedMissions >= r.min) || RANKS[RANKS.length - 1];
  document.getElementById("final-rank").textContent = rankData.name;
  document.getElementById("rank-icon").textContent  = rankData.icon;
  document.getElementById("final-message").innerHTML =
    `The Database Defense Academy officially certifies you as a <strong>${rankData.name}</strong>. ${rankData.msg}`;

  // Mission summary
  const summary = document.getElementById("mission-summary");
  summary.innerHTML = "";
  MISSION_LIST.forEach(m => {
    const done = m.level < unlocked;
    const active = m.level === unlocked;
    const row = document.createElement("div");
    row.className = "ms-row";
    row.innerHTML = `
      <span class="ms-icon">${m.icon}</span>
      <span>Level ${m.level} — ${m.title}</span>
      <span class="ms-status ${done ? '' : 'locked'}">${done ? '✅ Completed' : (active ? '⚡ In Progress' : '🔒 Locked')}</span>
    `;
    summary.appendChild(row);
  });
});

// ── STARS ─────────────────────────────────────────────────────────────────────
function spawnStars() {
  const container = document.getElementById("stars");
  if (!container) return;
  for (let i = 0; i < 60; i++) {
    const s = document.createElement("div");
    s.className = "star";
    const size = 1 + Math.random() * 2.5;
    s.style.width  = size + "px";
    s.style.height = size + "px";
    s.style.left   = Math.random() * 100 + "vw";
    s.style.top    = Math.random() * 100 + "vh";
    s.style.animationDuration = (2 + Math.random() * 4) + "s";
    s.style.animationDelay   = (Math.random() * 4) + "s";
    container.appendChild(s);
  }
}

// ── COUNTER ANIMATION ─────────────────────────────────────────────────────────
function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  if (target === 0) { el.textContent = 0; return; }
  let val = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    val = Math.min(val + step, target);
    el.textContent = val;
    if (val >= target) clearInterval(timer);
  }, 28);
}

// ── NAVIGATION ────────────────────────────────────────────────────────────────
function goToMap()       { window.location.href = "map.html"; }
function goToDashboard() { window.location.href = "index.html"; }

// ── SHARE ─────────────────────────────────────────────────────────────────────
function shareResult() {
  const xp     = localStorage.getItem("xp")     || 0;
  const levels = localStorage.getItem("levels") || 0;
  const badges = localStorage.getItem("badges") || 0;
  const unlocked = parseInt(localStorage.getItem("unlockedLevel")) || 1;
  const completedMissions = Math.min(unlocked - 1, MISSION_LIST.length);
  const rankData = RANKS.find(r => completedMissions >= r.min) || RANKS[RANKS.length - 1];

  const text = `🎓 DBMS Quest — Campus Heist\n⚡ XP: ${xp}\n🏆 Levels: ${levels}\n🎖️ Badges: ${badges}\n📐 Missions: ${completedMissions}/4\n🏅 Rank: ${rankData.name}`;
  navigator.clipboard.writeText(text)
    .then(() => showToast("📋 Result copied to clipboard!"))
    .catch(() => showToast("⚠️ Copy failed — try manually."));
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.classList.add("hidden"), 350);
  }, 2500);
}