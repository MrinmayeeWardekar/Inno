// level3.js – Foreign Affairs (UPGRADED)

const questions = [
  {
    topic: "STUDENT ↔ DEPARTMENT",
    diagram: {
      tables: [
        {
          name: "DEPARTMENT", isFK: false,
          cols: [
            { name: "dept_id",   tag: "pk" },
            { name: "dept_name", tag: "" },
            { name: "hod",       tag: "" }
          ]
        },
        {
          name: "STUDENT", isFK: true,
          cols: [
            { name: "student_id", tag: "pk" },
            { name: "name",       tag: "" },
            { name: "dept_id",    tag: "fk" },
            { name: "year",       tag: "" }
          ]
        }
      ]
    },
    question: "In the STUDENT table, which column is a FOREIGN KEY and what does it reference?",
    options: [
      "student_id references DEPARTMENT.dept_id",
      "dept_id in STUDENT references dept_id in DEPARTMENT",
      "name references DEPARTMENT.hod",
      "year references DEPARTMENT.dept_id"
    ],
    correctIndex: 1,
    hint: "A Foreign Key in one table references the Primary Key in another. Look for a column in STUDENT that matches a column name in DEPARTMENT.",
    explanation: "✅ <strong>dept_id</strong> in STUDENT is a Foreign Key — it references <strong>dept_id</strong> (Primary Key) in the DEPARTMENT table, linking each student to their department."
  },
  {
    topic: "STUDENT ↔ DEPARTMENT",
    diagram: {
      tables: [
        {
          name: "DEPARTMENT", isFK: false,
          cols: [
            { name: "dept_id",   tag: "pk" },
            { name: "dept_name", tag: "" },
            { name: "hod",       tag: "" }
          ]
        },
        {
          name: "STUDENT", isFK: true,
          cols: [
            { name: "student_id", tag: "pk" },
            { name: "name",       tag: "" },
            { name: "dept_id",    tag: "fk" },
            { name: "year",       tag: "" }
          ]
        }
      ]
    },
    question: "Why is dept_id in the STUDENT table considered a Foreign Key?",
    options: [
      "Because it is always unique in the STUDENT table",
      "Because it stores the department name directly",
      "Because it references the Primary Key dept_id in the DEPARTMENT table",
      "Because it is part of the STUDENT's Primary Key"
    ],
    correctIndex: 2,
    hint: "A Foreign Key's defining property is that it POINTS TO (references) a Primary Key in another table.",
    explanation: "✅ <strong>dept_id</strong> in STUDENT is a Foreign Key because it points to the Primary Key <strong>dept_id</strong> in the DEPARTMENT table — that reference is exactly what defines a Foreign Key."
  },
  {
    topic: "ORDER ↔ CUSTOMER",
    diagram: {
      tables: [
        {
          name: "CUSTOMER", isFK: false,
          cols: [
            { name: "customer_id", tag: "pk" },
            { name: "name",        tag: "" },
            { name: "city",        tag: "" }
          ]
        },
        {
          name: "ORDERS", isFK: true,
          cols: [
            { name: "order_id",    tag: "pk" },
            { name: "customer_id", tag: "fk" },
            { name: "product",     tag: "" },
            { name: "amount",      tag: "" }
          ]
        }
      ]
    },
    question: "What is the main purpose of customer_id as a Foreign Key in the ORDERS table?",
    options: [
      "To uniquely identify each order",
      "To group orders by product type",
      "To link each order to the correct customer in the CUSTOMER table",
      "To store the customer's city in the ORDERS table"
    ],
    correctIndex: 2,
    hint: "Foreign Keys create a LINK between two tables. What relationship is being established here between ORDERS and CUSTOMER?",
    explanation: "✅ The Foreign Key <strong>customer_id</strong> in ORDERS links each order to the correct customer in the CUSTOMER table — that is exactly the purpose of a Foreign Key."
  },
  {
    topic: "ORDER ↔ CUSTOMER",
    diagram: {
      tables: [
        {
          name: "CUSTOMER", isFK: false,
          cols: [
            { name: "customer_id", tag: "pk" },
            { name: "name",        tag: "" },
            { name: "city",        tag: "" }
          ]
        },
        {
          name: "ORDERS", isFK: true,
          cols: [
            { name: "order_id",    tag: "pk" },
            { name: "customer_id", tag: "fk" },
            { name: "product",     tag: "" },
            { name: "amount",      tag: "" }
          ]
        }
      ]
    },
    question: "If a CUSTOMER row with customer_id = 'C01' is deleted, what should ideally happen to ORDERS rows with customer_id = 'C01'?",
    options: [
      "Nothing — ORDERS rows are completely independent",
      "They should be deleted or updated based on the ON DELETE rule",
      "Their order_id values must automatically change",
      "Their amount becomes NULL in all database systems"
    ],
    correctIndex: 1,
    hint: "This is about Referential Integrity. When the referenced row is deleted, the referencing rows must be handled — either deleted (CASCADE) or updated.",
    explanation: "✅ This is <strong>Referential Integrity</strong>! When the referenced customer is deleted, the related ORDERS rows should be deleted (ON DELETE CASCADE) or updated — leaving them with an invalid customer_id would break integrity."
  },
  {
    topic: "EMPLOYEE ↔ DEPARTMENT",
    diagram: {
      tables: [
        {
          name: "DEPARTMENT", isFK: false,
          cols: [
            { name: "dept_id",   tag: "pk" },
            { name: "dept_name", tag: "" },
            { name: "location",  tag: "" }
          ]
        },
        {
          name: "EMPLOYEE", isFK: true,
          cols: [
            { name: "emp_id",   tag: "pk" },
            { name: "emp_name", tag: "" },
            { name: "dept_id",  tag: "fk" },
            { name: "salary",   tag: "" }
          ]
        }
      ]
    },
    question: "Which statement BEST describes a FOREIGN KEY in a database?",
    options: [
      "A column that must be unique within its own table",
      "A column that stores automatically calculated values",
      "A column (or set of columns) that refers to a PRIMARY KEY in another table",
      "A column that can never contain NULL values under any circumstance"
    ],
    correctIndex: 2,
    hint: "Focus on the definition: what does a Foreign Key actually DO in terms of its relationship with another table?",
    explanation: "✅ A <strong>Foreign Key</strong> is a column (or combination of columns) in one table that references the Primary Key in another table — creating a relationship and enforcing referential integrity."
  }
];

let currentIndex = 0;
let totalXP = 0;
let selectedIndex = null;
let answered = false;
let correctCount = 0;
let levelRewardSaved = false;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function startLevel() {
  currentIndex = 0; totalXP = 0; selectedIndex = null;
  answered = false; correctCount = 0; levelRewardSaved = false;
  document.getElementById("xp-count").textContent = 0;
  document.getElementById("q-total").textContent = questions.length;
  showScreen("quiz-screen");
  loadQuestion(0);
}

function loadQuestion(idx) {
  const q = questions[idx];
  answered = false; selectedIndex = null;

  document.getElementById("q-num").textContent = idx + 1;
  document.getElementById("q-current").textContent = idx + 1;
  document.getElementById("q-topic").textContent = q.topic;
  document.getElementById("q-text").innerHTML = `🔍 ${q.question}`;
  document.getElementById("progress-fill").style.width = ((idx / questions.length) * 100) + "%";

  // Build relationship diagram
  const diagArea = document.getElementById("rel-diagram-area");
  diagArea.innerHTML = "";
  if (q.diagram) {
    const diagDiv = document.createElement("div");
    diagDiv.className = "rel-diagram";
    q.diagram.tables.forEach((tbl, ti) => {
      if (ti > 0) {
        const arrow = document.createElement("div");
        arrow.className = "rel-arrow";
        arrow.textContent = "→";
        diagDiv.appendChild(arrow);
      }
      const box = document.createElement("div");
      box.className = "rel-table-box" + (tbl.isFK ? " fk-table" : "");
      let html = `<div class="rel-table-title">${tbl.name}</div>`;
      tbl.cols.forEach(c => {
        html += `<div class="rel-col ${c.tag}">`;
        if (c.tag) html += `<span class="col-tag ${c.tag}">${c.tag.toUpperCase()}</span>`;
        html += `${c.name}</div>`;
      });
      box.innerHTML = html;
      diagDiv.appendChild(box);
    });
    diagArea.appendChild(diagDiv);
  }

  // Build MCQ options
  const optArea = document.getElementById("options-area");
  optArea.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.onclick = () => selectOption(i);
    optArea.appendChild(btn);
  });

  // Reset
  const feedback = document.getElementById("feedback-box");
  feedback.className = "feedback-box"; feedback.innerHTML = "";
  const hint = document.getElementById("hint-box");
  hint.classList.add("hidden"); hint.textContent = "";
  const confirmBtn = document.getElementById("btn-confirm");
  confirmBtn.disabled = true; confirmBtn.style.display = "inline-flex";
  const nextBtn = document.getElementById("btn-next");
  nextBtn.classList.remove("visible"); nextBtn.style.display = "none";
  nextBtn.textContent = "NEXT ▶"; nextBtn.onclick = nextQuestion;
}

function selectOption(idx) {
  if (answered) return;
  selectedIndex = idx;
  document.querySelectorAll(".option-btn").forEach((b, i) => {
    b.classList.toggle("selected", i === idx);
  });
  document.getElementById("btn-confirm").disabled = false;
}

function confirmAnswer() {
  if (selectedIndex === null || answered) return;
  answered = true;
  const q = questions[currentIndex];
  const feedback = document.getElementById("feedback-box");

  document.querySelectorAll(".option-btn").forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correctIndex) btn.classList.add("correct");
    else if (i === selectedIndex) btn.classList.add("wrong");
  });

  if (selectedIndex === q.correctIndex) {
    totalXP += 20; correctCount++;
    document.getElementById("xp-count").textContent = totalXP;
    feedback.innerHTML = q.explanation;
    feedback.className = "feedback-box ok show";
  } else {
    feedback.innerHTML = `❌ Not quite! ${q.explanation}`;
    feedback.className = "feedback-box err show";
  }

  document.getElementById("btn-confirm").style.display = "none";
  const nextBtn = document.getElementById("btn-next");
  nextBtn.style.display = "inline-flex";
  nextBtn.classList.add("visible");
  if (currentIndex === questions.length - 1) {
    nextBtn.textContent = "▶ COMPLETE";
    nextBtn.onclick = completeMission;
  }
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < questions.length) loadQuestion(currentIndex);
}

function showHint() {
  const hintBox = document.getElementById("hint-box");
  if (hintBox.classList.contains("hidden")) {
    hintBox.innerHTML = "💡 " + questions[currentIndex].hint;
    hintBox.classList.remove("hidden");
  } else {
    hintBox.classList.add("hidden");
  }
}

function completeMission() {
  if (!levelRewardSaved) {
    addXP(totalXP);
    unlockNextLevel(3);
    levelRewardSaved = true;
  }
  document.getElementById("progress-fill").style.width = "100%";
  document.getElementById("final-xp").textContent = `+${totalXP} XP`;
  document.getElementById("final-xp-label").textContent = `${totalXP} XP Gained`;
  document.getElementById("score-summary").innerHTML =
    `You answered <strong>${correctCount} / ${questions.length}</strong> correctly!`;
  showScreen("complete-screen");
}

function goHome() { window.location.href = "index.html"; }
function goMap()  { window.location.href = "map.html"; }
function goNextLevel() { window.location.href = "level4.html"; }

function unlockNextLevel(currentLevel) {
  const unlocked = parseInt(localStorage.getItem("unlockedLevel")) || 1;
  const nextLevel = currentLevel + 1;
  localStorage.setItem(`level${currentLevel}Completed`, "true");
  if (nextLevel > unlocked) localStorage.setItem("unlockedLevel", nextLevel);
  const today = new Date().toDateString();
  if (localStorage.getItem("lastPlayDay") !== today) {
    let streak = parseInt(localStorage.getItem("streak")) || 0;
    localStorage.setItem("streak", ++streak);
    localStorage.setItem("lastPlayDay", today);
  }
}

function addXP(amount) {
  let xp = parseInt(localStorage.getItem("xp")) || 0;
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