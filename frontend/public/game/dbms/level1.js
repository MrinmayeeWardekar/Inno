// level1.js – Primary Key Pursuit (UPGRADED)
 
const questions = [
  {
    table: "STUDENT",
    columns: ["student_id","name","department","semester","city"],
    rows: [
      ["S101","Asha","BCA","3","Bengaluru"],
      ["S102","Rahul","BCom","2","Mysuru"],
      ["S103","Divya","BCA","3","Mangaluru"],
      ["S104","Kiran","BBA","1","Bengaluru"]
    ],
    answer: "student_id",
    hint: "Names, departments, semesters, and cities can repeat for different students. Find the column whose value is unique for every single row.",
    explanation: "✅ <strong>student_id</strong> is unique for each student — no two students share the same ID. That makes it the Primary Key."
  },
  {
    table: "BUS_TICKET",
    columns: ["ticket_no","passenger_name","route","seat_no","travel_date"],
    rows: [
      ["T901","Nisha","Bengaluru-Chennai","A1","2026-04-01"],
      ["T902","Manoj","Bengaluru-Mysuru","B2","2026-04-01"],
      ["T903","Pooja","Chennai-Madurai","A1","2026-04-02"],
      ["T904","Rakesh","Bengaluru-Chennai","C3","2026-04-01"]
    ],
    answer: "ticket_no",
    hint: "Notice seat A1 appears twice — on different buses. Routes and dates repeat too. Which column will always be unique for each ticket issued?",
    explanation: "✅ <strong>ticket_no</strong> uniquely identifies every bus ticket. Even if two passengers take the same route, their ticket numbers differ."
  },
  {
    table: "PATIENT",
    columns: ["patient_id","patient_name","blood_group","ward","doctor"],
    rows: [
      ["P501","Anita","B+","W12","Dr. Rao"],
      ["P502","Suresh","O+","W15","Dr. Mehta"],
      ["P503","Farhan","A+","W12","Dr. Rao"],
      ["P504","Latha","B+","W18","Dr. Nair"]
    ],
    answer: "patient_id",
    hint: "Blood group B+ appears twice, ward W12 appears twice, and Dr. Rao has two patients. Only one column is guaranteed to be different for every patient.",
    explanation: "✅ <strong>patient_id</strong> is the Primary Key. Every patient receives a unique ID when they are registered in the hospital system."
  },
  {
    table: "ONLINE_ORDER",
    columns: ["order_id","customer_name","product","amount","city"],
    rows: [
      ["O7001","Neha","Laptop","55000","Delhi"],
      ["O7002","Varun","Mouse","800","Mumbai"],
      ["O7003","Sneha","Laptop","55000","Delhi"],
      ["O7004","Amit","Keyboard","1500","Pune"]
    ],
    answer: "order_id",
    hint: "Two customers both bought a Laptop for ₹55,000 from Delhi. Product, amount, and city all repeat. What makes each order unique?",
    explanation: "✅ <strong>order_id</strong> is the Primary Key. Each order gets its own unique ID, even if two customers buy the same product."
  },
  {
    table: "LIBRARY_ISSUE",
    columns: ["issue_id","book_title","member_name","issue_date","return_date"],
    rows: [
      ["I301","DBMS Basics","Arun","2026-03-20","2026-03-27"],
      ["I302","Python Guide","Meena","2026-03-21","2026-03-28"],
      ["I303","DBMS Basics","Karthik","2026-03-21","2026-03-28"],
      ["I304","Web Design","Anu","2026-03-22","2026-03-29"]
    ],
    answer: "issue_id",
    hint: "DBMS Basics was issued twice — to different members on different dates. The book title and dates can repeat. Which column uniquely identifies each issue record?",
    explanation: "✅ <strong>issue_id</strong> is the Primary Key. Every time a book is issued, a new unique issue ID is generated for that transaction."
  }
];
 
let currentIndex = 0;
let totalXP = 0;
let selectedAnswer = null;
let answered = false;
let correctCount = 0;
let levelRewardSaved = false;
 
// ── SCREEN CONTROL ───────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
 
function startLevel() {
  currentIndex = 0;
  totalXP = 0;
  selectedAnswer = null;
  answered = false;
  correctCount = 0;
  levelRewardSaved = false;
  document.getElementById("xp-count").textContent = 0;
  document.getElementById("q-total").textContent = questions.length;
  showScreen("quiz-screen");
  loadQuestion(0);
}
 
// ── LOAD QUESTION ────────────────────────────────────────────────────────────
function loadQuestion(idx) {
  const q = questions[idx];
  answered = false;
  selectedAnswer = null;
 
  document.getElementById("q-num").textContent     = idx + 1;
  document.getElementById("q-current").textContent = idx + 1;
  document.getElementById("q-table-name").textContent = q.table;
 
  // Progress bar
  document.getElementById("progress-fill").style.width = ((idx / questions.length) * 100) + "%";
 
  // Build table header
  const head = document.getElementById("table-head");
  head.innerHTML = "";
  q.columns.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    head.appendChild(th);
  });
 
  // Build table rows
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
 
  // Build choices
  const choices = document.getElementById("choices");
  choices.innerHTML = "";
  q.columns.forEach(col => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = col;
    btn.onclick = () => selectChoice(btn, col);
    choices.appendChild(btn);
  });
 
  // Reset UI
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
 
// ── SELECT CHOICE ────────────────────────────────────────────────────────────
function selectChoice(button, answer) {
  if (answered) return;
  selectedAnswer = answer;
  document.querySelectorAll(".choice-btn").forEach(b => b.classList.remove("selected"));
  button.classList.add("selected");
  document.getElementById("btn-confirm").disabled = false;
 
  // Highlight column in table
  const q = questions[currentIndex];
  const colIdx = q.columns.indexOf(answer);
  document.querySelectorAll(".db-table th").forEach((th, i) => {
    th.classList.toggle("selected-col", i === colIdx);
  });
  document.querySelectorAll(".db-table tbody tr").forEach(tr => {
    tr.querySelectorAll("td").forEach((td, i) => td.classList.toggle("selected-col", i === colIdx));
  });
}
 
// ── CONFIRM ANSWER ───────────────────────────────────────────────────────────
function confirmAnswer() {
  if (!selectedAnswer || answered) return;
  answered = true;
 
  const q = questions[currentIndex];
  const feedback  = document.getElementById("feedback-box");
  const confirmBtn = document.getElementById("btn-confirm");
  const nextBtn   = document.getElementById("btn-next");
 
  document.querySelectorAll(".choice-btn").forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === q.answer)       btn.classList.add("correct");
    else if (btn.textContent === selectedAnswer) btn.classList.add("wrong");
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
 
// ── NEXT QUESTION ────────────────────────────────────────────────────────────
function nextQuestion() {
  currentIndex++;
  if (currentIndex < questions.length) {
    loadQuestion(currentIndex);
  }
}
 
// ── HINT ─────────────────────────────────────────────────────────────────────
function showHint() {
  const hintBox = document.getElementById("hint-box");
  if (hintBox.classList.contains("hidden")) {
    hintBox.innerHTML = "💡 " + questions[currentIndex].hint;
    hintBox.classList.remove("hidden");
  } else {
    hintBox.classList.add("hidden");
  }
}
 
// ── COMPLETE ─────────────────────────────────────────────────────────────────
function completeMission() {
  if (!levelRewardSaved) {
    addXP(totalXP);
    unlockNextLevel(1);
    levelRewardSaved = true;
  }
  document.getElementById("progress-fill").style.width = "100%";
  document.getElementById("final-xp").textContent       = `+${totalXP} XP`;
  document.getElementById("final-xp-label").textContent = `${totalXP} XP Gained`;
  document.getElementById("score-summary").innerHTML =
    `You answered <strong>${correctCount} / ${questions.length}</strong> correctly!`;
  showScreen("complete-screen");
}
 
// ── NAVIGATION ───────────────────────────────────────────────────────────────
function goHome() { window.location.href = "index.html"; }
function goMap()  { window.location.href = "map.html"; }
function goNextLevel() { window.location.href = "level2.html"; }
 
// ── SHARED HELPERS ────────────────────────────────────────────────────────────
function unlockNextLevel(currentLevel) {
  const unlocked  = parseInt(localStorage.getItem("unlockedLevel")) || 1;
  const nextLevel = currentLevel + 1;
  localStorage.setItem(`level${currentLevel}Completed`, "true");
  if (nextLevel > unlocked) localStorage.setItem("unlockedLevel", nextLevel);
  // Streak
  const today = new Date().toDateString();
  if (localStorage.getItem("lastPlayDay") !== today) {
    let streak = parseInt(localStorage.getItem("streak")) || 0;
    localStorage.setItem("streak", ++streak);
    localStorage.setItem("lastPlayDay", today);
  }
}
 
function addXP(amount) {
  let xp     = parseInt(localStorage.getItem("xp"))     || 0;
  let levels = parseInt(localStorage.getItem("levels")) || 0;
  xp += amount;
  const newLevel = Math.floor(xp / 100);
  if (newLevel > levels) { levels = newLevel; localStorage.setItem("levels", levels); }
  localStorage.setItem("xp", xp);
  let badges = 0;
  if (levels >= 1) badges = 1;
  if (levels >= 2) badges = 2;
  if (levels >= 3) badges = 3;
  if (levels >= 4) badges = 4;
  localStorage.setItem("badges", badges);
}