const questions = [
  {
    table: "STUDENT",
    columns: ["student_id", "name", "department", "semester", "city"],
    rows: [
      ["S101", "Asha", "BCA", "3", "Bengaluru"],
      ["S102", "Rahul", "BCom", "2", "Mysuru"],
      ["S103", "Divya", "BCA", "3", "Mangaluru"],
      ["S104", "Kiran", "BBA", "1", "Bengaluru"]
    ],
    answer: "student_id",
    hint: "Names, department, semester, and city can repeat. Find the value that is unique for every student.",
    explanation: "✅ student_id is unique for each student, so it is the Primary Key."
  },
  {
    table: "BUS_TICKET",
    columns: ["ticket_no", "passenger_name", "route", "seat_no", "travel_date"],
    rows: [
      ["T901", "Nisha", "Bengaluru-Chennai", "A1", "2026-04-01"],
      ["T902", "Manoj", "Bengaluru-Mysuru", "B2", "2026-04-01"],
      ["T903", "Pooja", "Chennai-Madurai", "A1", "2026-04-02"],
      ["T904", "Rakesh", "Bengaluru-Chennai", "C3", "2026-04-01"]
    ],
    answer: "ticket_no",
    hint: "Seat numbers and routes may repeat on different dates or buses. Which value is always unique for each ticket?",
    explanation: "✅ ticket_no uniquely identifies every bus ticket, so it is the Primary Key."
  },
  {
    table: "PATIENT",
    columns: ["patient_id", "patient_name", "blood_group", "ward", "doctor"],
    rows: [
      ["P501", "Anita", "B+", "W12", "Dr. Rao"],
      ["P502", "Suresh", "O+", "W15", "Dr. Mehta"],
      ["P503", "Farhan", "A+", "W12", "Dr. Rao"],
      ["P504", "Latha", "B+", "W18", "Dr. Nair"]
    ],
    answer: "patient_id",
    hint: "Blood group, ward, and doctor can repeat. Which column is unique for each patient record?",
    explanation: "✅ patient_id is the correct Primary Key because it is unique for every patient."
  },
  {
    table: "ONLINE_ORDER",
    columns: ["order_id", "customer_name", "product", "amount", "city"],
    rows: [
      ["O7001", "Neha", "Laptop", "55000", "Delhi"],
      ["O7002", "Varun", "Mouse", "800", "Mumbai"],
      ["O7003", "Sneha", "Laptop", "55000", "Delhi"],
      ["O7004", "Amit", "Keyboard", "1500", "Pune"]
    ],
    answer: "order_id",
    hint: "Product, amount, and city may repeat. Find the unique ID assigned to each order.",
    explanation: "✅ order_id uniquely identifies every order, so it is the Primary Key."
  },
  {
    table: "LIBRARY_ISSUE",
    columns: ["issue_id", "book_title", "member_name", "issue_date", "return_date"],
    rows: [
      ["I301", "DBMS Basics", "Arun", "2026-03-20", "2026-03-27"],
      ["I302", "Python Guide", "Meena", "2026-03-21", "2026-03-28"],
      ["I303", "DBMS Basics", "Karthik", "2026-03-21", "2026-03-28"],
      ["I304", "Web Design", "Anu", "2026-03-22", "2026-03-29"]
    ],
    answer: "issue_id",
    hint: "The same book can be issued to different members on different dates. Which column uniquely identifies each issue record?",
    explanation: "✅ issue_id is unique for each library issue entry, so it is the Primary Key."
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
  window.location.href = "level2-intro.html";
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
    feedback.innerHTML = `❌ Not quite! The correct Primary Key is <strong>${q.answer}</strong>. ${q.explanation}`;
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
    // OLD flag (you can keep it if you want):
    localStorage.setItem("level1Completed", "true");
    // NEW: unlock next level for map
    unlockNextLevel(1);
    levelRewardSaved = true;
  }

  document.getElementById("progress-fill").style.width = "100%";
  document.getElementById("final-xp").textContent = `+${totalXP} XP`;
  document.getElementById("final-xp-label").textContent = `${totalXP} XP Gained`;
  document.getElementById("score-summary").innerHTML =
    `You answered <strong>${correctCount} / ${questions.length}</strong> correctly!`;
  showScreen("complete-screen");
}

/* ==== LEVEL UNLOCK HELPER (NEW) ==== */
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