const questions = [
  {
    table: "STUDENT_LOGIN",
    columns: ["student_id", "email", "username", "name"],
    rows: [
      ["S101", "asha01@mail.com", "asha01", "Asha"],
      ["S102", "rahul02@mail.com", "rahul02", "Rahul"],
      ["S103", "divya03@mail.com", "divya03", "Divya"]
    ],
    answer: "student_id",
    hint: "A candidate key must uniquely identify each row and be minimal.",
    explanation: "✅ student_id is a valid candidate key because it uniquely identifies each student."
  },
  {
    table: "EMPLOYEE_PORTAL",
    columns: ["emp_id", "email", "phone", "department"],
    rows: [
      ["E201", "meena@company.com", "9876543210", "HR"],
      ["E202", "arun@company.com", "9876501234", "IT"],
      ["E203", "kavi@company.com", "9988776655", "Finance"]
    ],
    answer: "emp_id",
    hint: "Choose the attribute that is designed to uniquely identify each employee record.",
    explanation: "✅ emp_id is the candidate key because it is unique and minimal."
  },
  {
    table: "LIBRARY_MEMBER",
    columns: ["member_id", "name", "mobile", "city"],
    rows: [
      ["M11", "Anita", "9000011111", "Bengaluru"],
      ["M12", "Karthik", "9000022222", "Mysuru"],
      ["M13", "Sonia", "9000033333", "Mangaluru"]
    ],
    answer: "member_id",
    hint: "Names and cities may repeat. Look for the proper unique identifier.",
    explanation: "✅ member_id is the candidate key because each member gets a unique ID."
  },
  {
    table: "BUS_PASS",
    columns: ["pass_id", "student_name", "route", "stop"],
    rows: [
      ["BP01", "Nisha", "Route 12", "MG Road"],
      ["BP02", "Manoj", "Route 8", "Majestic"],
      ["BP03", "Riya", "Route 12", "Indiranagar"]
    ],
    answer: "pass_id",
    hint: "Routes and stops can repeat. Which value is meant to identify the pass itself?",
    explanation: "✅ pass_id is the candidate key because it uniquely identifies each bus pass."
  },
  {
    table: "EXAM_REGISTRATION",
    columns: ["reg_no", "student_name", "subject", "semester"],
    rows: [
      ["R501", "Asha", "DBMS", "3"],
      ["R502", "Rahul", "Java", "2"],
      ["R503", "Divya", "DBMS", "3"]
    ],
    answer: "reg_no",
    hint: "The same subject and semester can appear for different students.",
    explanation: "✅ reg_no is the candidate key because each registration gets a unique number."
  }
];

let currentIndex = 0;
let totalXP = 0;
let selectedAnswer = null;
let answered = false;
let correctCount = 0;
let levelRewardSaved = false;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function startLevel() {
  currentIndex = 0;
  totalXP = 0;
  selectedAnswer = null;
  answered = false;
  correctCount = 0;
  levelRewardSaved = false;
  document.getElementById("xp-count").textContent = totalXP;
  showScreen("quiz-screen");
  loadQuestion(currentIndex);
}

function goHome() {
  window.location.href = "index.html";
}

function goMap() {
  window.location.href = "map.html";
}

function goNextLevel() {
  window.location.href = "level3.html";
}

function loadQuestion(index) {
  const q = questions[index];
  answered = false;
  selectedAnswer = null;

  document.getElementById("q-current").textContent = index + 1;
  document.getElementById("q-total").textContent = questions.length;
  document.getElementById("q-num").textContent = index + 1;
  document.getElementById("q-table-name").textContent = q.table;

  const progress = (index / questions.length) * 100;
  document.getElementById("progress-fill").style.width = progress + "%";

  const headRow = document.getElementById("table-head");
  headRow.innerHTML = "";
  q.columns.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    headRow.appendChild(th);
  });

  const body = document.getElementById("table-body");
  body.innerHTML = "";
  q.rows.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });

  const choices = document.getElementById("choices");
  choices.innerHTML = "";
  q.columns.forEach(col => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = col;
    btn.onclick = () => selectChoice(btn, col);
    choices.appendChild(btn);
  });

  const feedback = document.getElementById("feedback-box");
  feedback.className = "feedback-box";
  feedback.innerHTML = "";

  const hint = document.getElementById("hint-box");
  hint.classList.add("hidden");
  hint.textContent = "";

  const confirmBtn = document.getElementById("btn-confirm");
  confirmBtn.disabled = true;
  confirmBtn.style.display = "inline-flex";

  const nextBtn = document.getElementById("btn-next");
  nextBtn.classList.remove("visible");
  nextBtn.style.display = "none";
  nextBtn.textContent = "NEXT ▶";
  nextBtn.onclick = nextQuestion;
}

function selectChoice(button, answer) {
  if (answered) return;

  selectedAnswer = answer;
  document.querySelectorAll(".choice-btn").forEach(btn => btn.classList.remove("selected"));
  button.classList.add("selected");
  document.getElementById("btn-confirm").disabled = false;
}

function confirmAnswer() {
  if (!selectedAnswer || answered) return;

  answered = true;
  const q = questions[currentIndex];
  const feedback = document.getElementById("feedback-box");
  const confirmBtn = document.getElementById("btn-confirm");
  const nextBtn = document.getElementById("btn-next");

  document.querySelectorAll(".choice-btn").forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === q.answer) {
      btn.classList.add("correct");
    } else if (btn.textContent === selectedAnswer) {
      btn.classList.add("wrong");
    }
  });

  if (selectedAnswer === q.answer) {
    totalXP += 20;
    correctCount++;
    document.getElementById("xp-count").textContent = totalXP;
    feedback.innerHTML = q.explanation;
    feedback.className = "feedback-box ok show";
  } else {
    feedback.innerHTML = `❌ Not quite! The correct Candidate Key is <strong>${q.answer}</strong>. ${q.explanation}`;
    feedback.className = "feedback-box err show";
  }

  confirmBtn.style.display = "none";
  nextBtn.style.display = "inline-flex";
  nextBtn.classList.add("visible");

  if (currentIndex === questions.length - 1) {
    nextBtn.textContent = "▶ COMPLETE";
    nextBtn.onclick = completeMission;
  }
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < questions.length) {
    loadQuestion(currentIndex);
  }
}

function showHint() {
  const hintBox = document.getElementById("hint-box");
  const q = questions[currentIndex];

  if (hintBox.classList.contains("hidden")) {
    hintBox.textContent = "💡 " + q.hint;
    hintBox.classList.remove("hidden");
  } else {
    hintBox.classList.add("hidden");
  }
}

function completeMission() {
  if (!levelRewardSaved) {
    addXP(totalXP);
    unlockNextLevel(2);
    levelRewardSaved = true;
  }

  document.getElementById("progress-fill").style.width = "100%";
  document.getElementById("final-xp").textContent = `+${totalXP} XP`;
  document.getElementById("final-xp-label").textContent = `${totalXP} XP Gained`;
  document.getElementById("score-summary").innerHTML =
    `You answered <strong>${correctCount} / ${questions.length}</strong> correctly!`;

  showScreen("complete-screen");
}

function unlockNextLevel(currentLevel) {
  const unlockedLevel = parseInt(localStorage.getItem("unlockedLevel")) || 1;
  const nextLevel = currentLevel + 1;

  localStorage.setItem(`level${currentLevel}Completed`, "true");

  if (nextLevel > unlockedLevel) {
    localStorage.setItem("unlockedLevel", nextLevel);
  }
}

function addXP(amount = 10) {
  let xp = parseInt(localStorage.getItem("xp")) || 0;
  let levels = parseInt(localStorage.getItem("levels")) || 0;

  xp += amount;

  let newLevel = Math.floor(xp / 100);

  if (newLevel > levels) {
    levels = newLevel;
    localStorage.setItem("levels", levels);
  }

  localStorage.setItem("xp", xp);
  updateBadges(levels);
}

function updateBadges(levels) {
  let badges = 0;

  if (levels >= 1) badges = 1;
  if (levels >= 3) badges = 2;
  if (levels >= 5) badges = 3;

  localStorage.setItem("badges", badges);
}