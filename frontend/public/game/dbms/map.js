// map.js — CAMPUS MAP (UPGRADED)

const LEVEL_DATA = [
  { level: 1, title: "Primary Key Pursuit",     sub: "Tables, Rows & Columns",    xp: "100 XP", icon: "🔑" },
  { level: 2, title: "Candidate Key Challenge", sub: "Primary & Candidate Keys",  xp: "100 XP", icon: "🧩" },
  { level: 3, title: "Foreign Affairs",          sub: "Foreign Keys & Relations",  xp: "100 XP", icon: "🔗" },
  { level: 4, title: "Normalization Protocol",   sub: "1NF & 2NF",                xp: "100 XP", icon: "📐" },
];

window.onload = function () {
  if (!localStorage.getItem("unlockedLevel")) {
    localStorage.setItem("unlockedLevel", "1");
  }

  const unlockedLevel = parseInt(localStorage.getItem("unlockedLevel")) || 1;

  // Update HUD
  document.getElementById("hud-xp").textContent    = localStorage.getItem("xp")     || 0;
  document.getElementById("hud-level").textContent = localStorage.getItem("levels") || 0;

  // Progress bar
  const completed = unlockedLevel - 1;
  const total = LEVEL_DATA.length;
  const pct = (completed / total) * 100;
  document.getElementById("map-prog").style.width      = pct + "%";
  document.getElementById("map-prog-text").textContent = `Mission ${completed} / ${total} complete`;

  // Build cards dynamically
  const row = document.getElementById("levelsRow");
  row.innerHTML = "";

  LEVEL_DATA.forEach(data => {
    const card = document.createElement("div");
    card.className = "level-card";
    card.id = "level" + data.level;
    card.setAttribute("data-level", data.level);

    let statusIcon, stateClass, btnHtml;

    if (data.level < unlockedLevel) {
      stateClass = "completed";
      statusIcon = "✅";
      btnHtml = `<button class="done-btn" onclick="playLevel(${data.level})">✅ REPLAY</button>`;
    } else if (data.level === unlockedLevel) {
      stateClass = "current";
      statusIcon = "⚡";
      btnHtml = `<button class="play-btn" onclick="playLevel(${data.level})">▶ PLAY NOW</button>`;
    } else {
      stateClass = "locked";
      statusIcon = "🔒";
      btnHtml = `<button class="lock-btn" disabled>🔒 LOCKED</button>`;
    }

    card.classList.add(stateClass);
    card.innerHTML = `
      <div class="level-top">
        <span>${data.icon} L${data.level}</span>
        <span class="status-icon">${statusIcon}</span>
      </div>
      <h3>${data.title}</h3>
      <p>${data.sub}</p>
      <div class="level-xp">⚡ ${data.xp}</div>
      ${btnHtml}
    `;

    if (stateClass !== "locked") {
      card.onclick = (e) => {
        if (e.target.tagName !== "BUTTON") playLevel(data.level);
      };
    }

    row.appendChild(card);
  });

  // If all levels complete, show final button
  if (unlockedLevel > LEVEL_DATA.length) {
    const finalBtn = document.createElement("div");
    finalBtn.style.cssText = "text-align:center;margin-top:24px;width:100%;";
    finalBtn.innerHTML = `<button class="play-btn" style="max-width:280px;margin:0 auto;display:block;" onclick="window.location.href='final.html'">🎓 VIEW FINAL RESULT</button>`;
    document.querySelector(".map-container").appendChild(finalBtn);
  }
};

function playLevel(level) {
  const unlockedLevel = parseInt(localStorage.getItem("unlockedLevel")) || 1;
  if (level > unlockedLevel) return;
  localStorage.setItem("currentLevel", level);
  window.location.href = "level" + level + ".html";
}

function goHome() {
  window.location.href = "index.html";
}