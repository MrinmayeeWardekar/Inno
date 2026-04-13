const questions = [
  {
    question: "In the STUDENT table, which column is a FOREIGN KEY and what does it reference?",
    options: [
      "student_id references DEPARTMENT.dept_id",
      "dept_id in STUDENT references dept_id in DEPARTMENT",
      "name references DEPARTMENT.hod",
      "year references DEPARTMENT.dept_id"
    ],
    correctIndex: 1
  },
  {
    question: "Why is DEPT_ID in STUDENT considered a foreign key?",
    options: [
      "Because it is always unique",
      "Because it stores the department name directly",
      "Because it points to the primary key DEPT_ID in DEPARTMENT",
      "Because it is part of the STUDENT primary key"
    ],
    correctIndex: 2
  },
  {
    question: "What is the main purpose of the foreign key DEPT_ID in the STUDENT table?",
    options: [
      "To uniquely identify each student",
      "To group students by year",
      "To link each student to a department in the DEPARTMENT table",
      "To store the head of the department name"
    ],
    correctIndex: 2
  },
  {
    question: "If a DEPARTMENT row with DEPT_ID = 'D01' is deleted, what should ideally happen to STUDENT rows with DEPT_ID = 'D01'?",
    options: [
      "Nothing will ever happen to STUDENT rows",
      "They should also be deleted or updated based on the ON DELETE rule",
      "Their STUDENT_ID values must change",
      "Their YEAR column becomes NULL automatically in all DBMSs"
    ],
    correctIndex: 1
  },
  {
    question: "Which statement best describes a FOREIGN KEY in DBMS?",
    options: [
      "A column that must be unique within its own table",
      "A column that stores calculated values only",
      "A column (or set of columns) that refers to a PRIMARY KEY in another table",
      "A column that can never contain NULL values"
    ],
    correctIndex: 2
  }
];

let currentIndex = 0;
let xp = 0;
let answered = false;
let correctCount = 0;
let levelRewardSaved = false;

function qs(id) {
  return document.getElementById(id);
}

function beginMission() {
  currentIndex = 0;
  xp = 0;
  answered = false;
  correctCount = 0;
  levelRewardSaved = false;

  qs("mission-screen").classList.add("hidden");
  qs("hunter-screen").classList.remove("hidden");
  renderQuestion();
}

function goToMap() {
  window.location.href = "map.html";
}

function goNextLevel() {
  window.location.href = "level4.html";
}

function renderQuestion() {
  const q = questions[currentIndex];
  answered = false;

  qs("question-text").textContent = q.question;
  qs("hunter-progress").textContent = `${currentIndex + 1}/${questions.length}`;

  const optionsList = qs("options-list");
  optionsList.innerHTML = "";

  q.options.forEach((text, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.onclick = () => selectOption(idx);

    const letter = String.fromCharCode(65 + idx);
    btn.innerHTML = `
      <div class="option-letter">${letter}</div>
      <div class="option-text">${text}</div>
    `;
    optionsList.appendChild(btn);
  });

  const feedback = qs("hunter-feedback");
  feedback.textContent = "";
  feedback.className = "hunter-feedback";

  const prevBtn = document.querySelector(".prev-btn");
  if (prevBtn) {
    prevBtn.disabled = currentIndex === 0;
  }
}

function selectOption(idx) {
  if (answered) return;

  answered = true;
  const q = questions[currentIndex];
  const optionButtons = document.querySelectorAll(".option-btn");

  optionButtons.forEach((btn, i) => {
    btn.disabled = true;
    btn.classList.remove("correct", "wrong");

    if (i === q.correctIndex) {
      btn.classList.add("correct");
    } else if (i === idx && i !== q.correctIndex) {
      btn.classList.add("wrong");
    }
  });

  const feedback = qs("hunter-feedback");
  if (idx === q.correctIndex) {
    xp += 20;
    correctCount++;
    feedback.textContent = "✅ Correct! DEPT_ID connects STUDENT to DEPARTMENT.";
    feedback.className = "hunter-feedback ok";
  } else {
    feedback.textContent = "❌ Not quite. A foreign key points to a primary key in another table with matching values.";
    feedback.className = "hunter-feedback err";
  }
}

function toggleHunterHint() {
  qs("hunter-hint").classList.toggle("hidden");
}

function nextQuestion() {
  if (!answered) {
    qs("hunter-feedback").textContent = "⚠ Please select an answer first.";
    qs("hunter-feedback").className = "hunter-feedback err";
    return;
  }

  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    showMissionComplete();
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

function showMissionComplete() {
  if (!levelRewardSaved) {
    addXP(100);
    unlockNextLevel(3);
    levelRewardSaved = true;
  }

  document.body.innerHTML = `
    <div class="complete-screen">
      <div class="trophy">🏆</div>
      <div class="complete-title">MISSION COMPLETE!</div>
      <div class="mission-name">Foreign Affairs</div>
      <div class="xp-gained">+100 XP</div>
      <div class="xp-total">100 XP Gained</div>
      <div class="zone-info">
        <div class="zone-emoji">🛡️</div>
        <div>
          Relations Wing restored! Foreign keys now correctly link STUDENT and DEPARTMENT.
        </div>
      </div>
      <div class="score-summary">
        You answered <strong>${correctCount} / ${questions.length}</strong> correctly!
      </div>
      <div class="bottom-buttons">
        <button class="campus-map" onclick="goToMap()">🗺️ CAMPUS MAP</button>
        <button class="next-mission" onclick="goNextLevel()">NEXT MISSION ➡️</button>
      </div>
    </div>
  `;
}

function unlockNextLevel(currentLevel) {
  const unlockedLevel = parseInt(localStorage.getItem("unlockedLevel")) || 1;
  const nextLevel = currentLevel + 1;

  localStorage.setItem(`level${currentLevel}Completed`, "true");

  if (nextLevel > unlockedLevel) {
    localStorage.setItem("unlockedLevel", nextLevel);
  }
}

/* ===== GLOBAL DASHBOARD UPDATE HELPERS ===== */

function addXP(amount = 10) {
  let totalXP = parseInt(localStorage.getItem("xp")) || 0;
  let levels = parseInt(localStorage.getItem("levels")) || 0;

  totalXP += amount;

  let newLevel = Math.floor(totalXP / 100);

  if (newLevel > levels) {
    levels = newLevel;
    localStorage.setItem("levels", levels);
  }

  localStorage.setItem("xp", totalXP);
  updateBadges(levels);
}

function updateBadges(levels) {
  let badges = 0;

  if (levels >= 1) badges = 1;
  if (levels >= 3) badges = 2;
  if (levels >= 5) badges = 3;

  localStorage.setItem("badges", badges);
}

document.addEventListener("DOMContentLoaded", () => {
  // Intro visible by default
});