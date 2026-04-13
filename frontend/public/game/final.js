function goToMap() {
  window.location.href = "map.html";
}

function goToDashboard() {
  window.location.href = "index.html";
}

window.addEventListener("DOMContentLoaded", () => {
  const xp = parseInt(localStorage.getItem("xp")) || 0;
  const levels = parseInt(localStorage.getItem("levels")) || 0;
  const badges = parseInt(localStorage.getItem("badges")) || 0;

  document.getElementById("final-xp").textContent = xp;
  document.getElementById("final-level").textContent = levels;
  document.getElementById("final-badges").textContent = badges;

  const rankEl = document.getElementById("final-rank");
  let rank = "Rookie Agent";
  if (levels >= 5) rank = "Elite Database Guardian";
  else if (levels >= 3) rank = "Senior Data Operative";
  else if (levels >= 1) rank = "Junior Data Agent";
  rankEl.textContent = rank;
});