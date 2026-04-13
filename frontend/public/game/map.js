window.onload = function () {
  if (!localStorage.getItem("unlockedLevel")) {
    localStorage.setItem("unlockedLevel", "1");
  }

  const unlockedLevel = parseInt(localStorage.getItem("unlockedLevel")) || 1;
  const cards = document.querySelectorAll(".level-card");

  cards.forEach(card => {
    const level = parseInt(card.getAttribute("data-level"));
    const icon = card.querySelector(".status-icon");
    const btn = card.querySelector("button");

    card.classList.remove("locked", "current", "completed");
    btn.classList.remove("play-btn", "lock-btn", "done-btn");

    if (level < unlockedLevel) {
      card.classList.add("completed");
      icon.innerText = "✅";
      btn.classList.add("done-btn");
      btn.innerText = "COMPLETED";
    } else if (level === unlockedLevel) {
      card.classList.add("current");
      icon.innerText = "⚡";
      btn.classList.add("play-btn");
      btn.innerText = "PLAY";
    } else {
      card.classList.add("locked");
      icon.innerText = "🔒";
      btn.classList.add("lock-btn");
      btn.innerText = "LOCKED";
    }
  });
};

function playLevel(level) {
  const unlockedLevel = parseInt(localStorage.getItem("unlockedLevel")) || 1;

  if (level > unlockedLevel) {
    return;
  }

  localStorage.setItem("currentLevel", level);
  window.location.href = "level" + level + ".html";
}

function goHome() {
  window.location.href = "index.html";
}