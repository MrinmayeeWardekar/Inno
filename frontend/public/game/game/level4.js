const missionScreen = document.getElementById("mission-screen");
const schemaScreen = document.getElementById("schema-screen");

const beginMissionBtn = document.getElementById("begin-mission-btn");
const mapBtn = document.getElementById("map-btn");
const backToMissionBtn = document.getElementById("back-to-mission");
const resetBtn = document.getElementById("reset-btn");
const checkBtn = document.getElementById("check-btn");
const nextLevelBtn = document.getElementById("next-level-btn");

const questionContainer = document.getElementById("question-container");
const mcqContainer = document.getElementById("mcq-container");
const statusText = document.getElementById("status-text");
const xpCounter = document.getElementById("xp-counter");
const questionIndexEl = document.getElementById("question-index");
const questionTotalEl = document.getElementById("question-total");

let xp = 0;
let currentQuestion = 0;
let levelRewardSaved = false;
let mcqScore = 0;
let missionFinished = false;
let questionAttempted = false;

const schemaQuestions = [
  {
    brokenTitle: "Violation: Repeating Group",
    tableName: "STUDENT_CONTACT",
    headers: ["student_id", "student_name", "phones"],
    rows: [
      ["S101", "Asha", "98765, 91234"],
      ["S102", "Ravi", "99887"]
    ],
    note: "phones contains multiple values in one column, which breaks 1NF.",
    prompt: "Drag attributes into proper 1NF tables.",
    bank: ["student_id", "student_name", "phone"],
    slots: [
      { id: "student", label: "STUDENT Table" },
      { id: "phone", label: "STUDENT_PHONE Table" }
    ],
    answer: {
      student: ["student_id", "student_name"],
      phone: ["student_id", "phone"]
    }
  },
  {
    brokenTitle: "Violation: Partial Dependency",
    tableName: "ENROLLMENT",
    headers: ["student_id", "course_id", "student_name", "course_name"],
    rows: [
      ["S101", "C11", "Asha", "DBMS"],
      ["S102", "C12", "Ravi", "Java"]
    ],
    note: "student_name depends only on student_id, course_name depends only on course_id.",
    prompt: "Separate attributes into 2NF-compliant tables.",
    bank: ["student_id", "student_name", "course_id", "course_name"],
    slots: [
      { id: "student", label: "STUDENT Table" },
      { id: "course", label: "COURSE Table" },
      { id: "enrollment", label: "ENROLLMENT Table" }
    ],
    answer: {
      student: ["student_id", "student_name"],
      course: ["course_id", "course_name"],
      enrollment: ["student_id", "course_id"]
    }
  },
  {
    brokenTitle: "Violation: Repeating Subjects",
    tableName: "MARKS",
    headers: ["student_id", "student_name", "subjects"],
    rows: [
      ["S201", "Meena", "DBMS, OOP"],
      ["S202", "Kiran", "Maths, English"]
    ],
    note: "subjects stores multiple values in one field.",
    prompt: "Split into atomic values for 1NF.",
    bank: ["student_id", "student_name", "subject"],
    slots: [
      { id: "student", label: "STUDENT Table" },
      { id: "subject", label: "STUDENT_SUBJECT Table" }
    ],
    answer: {
      student: ["student_id", "student_name"],
      subject: ["student_id", "subject"]
    }
  },
  {
    brokenTitle: "Violation: Composite Key Dependency",
    tableName: "ORDER_ITEM",
    headers: ["order_id", "product_id", "product_name", "qty"],
    rows: [
      ["O10", "P1", "Mouse", "2"],
      ["O11", "P2", "Keyboard", "1"]
    ],
    note: "product_name depends only on product_id, not the full composite key.",
    prompt: "Move partial dependency into its own table.",
    bank: ["order_id", "product_id", "product_name", "qty"],
    slots: [
      { id: "product", label: "PRODUCT Table" },
      { id: "orderitem", label: "ORDER_ITEM Table" }
    ],
    answer: {
      product: ["product_id", "product_name"],
      orderitem: ["order_id", "product_id", "qty"]
    }
  },
  {
    brokenTitle: "Violation: Multi-valued Skills",
    tableName: "EMPLOYEE_SKILLS",
    headers: ["emp_id", "emp_name", "skills"],
    rows: [
      ["E1", "Diya", "HTML, CSS"],
      ["E2", "Arun", "JavaScript, SQL"]
    ],
    note: "skills contains multiple atomic values in one column.",
    prompt: "Convert the structure into 1NF.",
    bank: ["emp_id", "emp_name", "skill"],
    slots: [
      { id: "employee", label: "EMPLOYEE Table" },
      { id: "skill", label: "EMPLOYEE_SKILL Table" }
    ],
    answer: {
      employee: ["emp_id", "emp_name"],
      skill: ["emp_id", "skill"]
    }
  }
];

const mcqs = [
  {
    question: "Which normal form removes repeating groups?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    answer: "1NF"
  },
  {
    question: "2NF mainly removes which problem?",
    options: ["Transitive dependency", "Partial dependency", "Null values", "Duplicate rows"],
    answer: "Partial dependency"
  },
  {
    question: "A column containing multiple phone numbers in one cell violates:",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    answer: "1NF"
  },
  {
    question: "If a non-key attribute depends only on part of a composite key, it is called:",
    options: ["Transitive dependency", "Partial dependency", "Full dependency", "Join dependency"],
    answer: "Partial dependency"
  },
  {
    question: "Which table is best to separate student_id and phone into atomic rows?",
    options: ["STUDENT_PHONE", "DEPARTMENT", "ENROLLMENT", "SUBJECT_MASTER"],
    answer: "STUDENT_PHONE"
  }
];

questionTotalEl.textContent = schemaQuestions.length;

function showMissionScreen() {
  schemaScreen.classList.remove("active");
  missionScreen.classList.add("active");
}

function showSchemaScreen() {
  missionScreen.classList.remove("active");
  schemaScreen.classList.add("active");
}

function updateXP(points) {
  xp += points;
  xpCounter.textContent = xp;
}

function createTableHTML(q) {
  return `
    <div class="broken-table-block">
      <div class="broken-title"><span class="icon">⚠</span> ${q.brokenTitle}</div>
      <div class="table-name">${q.tableName}</div>
      <table>
        <thead>
          <tr>${q.headers.map(h => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${q.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
      <div class="violation-note">${q.note}</div>
    </div>

    <div class="question-block">
      <strong>Task:</strong> ${q.prompt}
    </div>
  `;
}

function renderQuestion() {
  const q = schemaQuestions[currentQuestion];
  questionIndexEl.textContent = currentQuestion + 1;
  statusText.textContent = "Drag attributes into tables, then click Check Schema.";
  statusText.className = "status-text";
  mcqContainer.innerHTML = "";
  nextLevelBtn.textContent = "NEXT";
  questionAttempted = false;
  checkBtn.disabled = false;

  questionContainer.innerHTML = `
    ${createTableHTML(q)}
    <div class="drag-area-wrapper">
      <div class="attribute-bank">
        <div class="attribute-bank-title">Attribute Bank</div>
        <div id="bank" class="slot"></div>
      </div>

      <div class="slot-columns">
        ${q.slots.map(slot => `
          <div>
            <div class="slot-label">${slot.label}</div>
            <div class="slot drop-slot" data-slot="${slot.id}"></div>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  const bank = document.getElementById("bank");

  q.bank.forEach(attr => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = attr;
    chip.draggable = true;
    chip.dataset.value = attr;
    addChipEvents(chip);
    bank.appendChild(chip);
  });

  document.querySelectorAll(".drop-slot").forEach(slot => addDropEvents(slot));
  addDropEvents(bank);
}

function addChipEvents(chip) {
  chip.addEventListener("dragstart", () => {
    chip.classList.add("dragging");
  });

  chip.addEventListener("dragend", () => {
    chip.classList.remove("dragging");
  });
}

function addDropEvents(slot) {
  slot.addEventListener("dragover", e => {
    e.preventDefault();
    slot.classList.add("highlight");
  });

  slot.addEventListener("dragleave", () => {
    slot.classList.remove("highlight");
  });

  slot.addEventListener("drop", e => {
    e.preventDefault();
    slot.classList.remove("highlight");
    const dragging = document.querySelector(".chip.dragging");
    if (dragging) slot.appendChild(dragging);
  });
}

function getCurrentPlacement() {
  const placement = {};
  const q = schemaQuestions[currentQuestion];

  q.slots.forEach(slot => {
    const slotEl = document.querySelector(`[data-slot="${slot.id}"]`);
    placement[slot.id] = [...slotEl.querySelectorAll(".chip")].map(chip => chip.dataset.value).sort();
  });

  return placement;
}

function arraysEqual(a, b) {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
}

function checkAnswer() {
  if (currentQuestion >= schemaQuestions.length) return;

  const q = schemaQuestions[currentQuestion];
  const placement = getCurrentPlacement();
  questionAttempted = true;

  let correct = true;
  for (const key in q.answer) {
    if (!arraysEqual(placement[key] || [], q.answer[key])) {
      correct = false;
      break;
    }
  }

  if (correct) {
    statusText.textContent = "Correct schema repair! You can move to the next question.";
    statusText.className = "status-text success";
    updateXP(30);
  } else {
    statusText.textContent = "Wrong attempt noted. You can still move to the next question.";
    statusText.className = "status-text error";
  }

  checkBtn.disabled = true;
}

function goNextQuestion() {
  if (currentQuestion < schemaQuestions.length - 1) {
    currentQuestion++;
    renderQuestion();
  } else if (currentQuestion === schemaQuestions.length - 1) {
    currentQuestion++;
    checkBtn.disabled = true;
    renderMCQs();
  }
}

function resetQuestion() {
  if (currentQuestion < schemaQuestions.length) {
    renderQuestion();
  }
}

function renderMCQs() {
  questionContainer.innerHTML = "";
  statusText.textContent = "Final check: answer all 5 MCQs to finish Mission 4.";
  statusText.className = "status-text";
  nextLevelBtn.textContent = "NEXT";

  mcqContainer.innerHTML = mcqs.map((mcq, index) => `
    <div class="mcq-block" data-mcq-index="${index}">
      <div class="mcq-question">${index + 1}. ${mcq.question}</div>
      <div class="mcq-options">
        ${mcq.options.map(option => `
          <div class="mcq-option" data-value="${option}">${option}</div>
        `).join("")}
      </div>
      <div class="mcq-feedback"></div>
    </div>
  `).join("");

  document.querySelectorAll(".mcq-block").forEach((block, index) => {
    const options = block.querySelectorAll(".mcq-option");
    const feedback = block.querySelector(".mcq-feedback");

    options.forEach(option => {
      option.addEventListener("click", () => {
        if (block.dataset.answered === "true") return;

        options.forEach(opt => opt.classList.remove("selected"));
        option.classList.add("selected");

        const selected = option.dataset.value;
        const correct = mcqs[index].answer;

        if (selected === correct) {
          feedback.textContent = "Correct! +10 XP";
          feedback.className = "mcq-feedback correct";
          updateXP(10);
          mcqScore++;
        } else {
          feedback.textContent = "Incorrect. Correct answer: " + correct;
          feedback.className = "mcq-feedback incorrect";
        }

        block.dataset.answered = "true";
        checkMissionComplete();
      });
    });
  });
}

function checkMissionComplete() {
  const answeredBlocks = [...document.querySelectorAll(".mcq-block")].filter(
    block => block.dataset.answered === "true"
  );

  if (answeredBlocks.length === mcqs.length) {
    missionFinished = true;
    statusText.textContent = "Mission complete! Click NEXT.";
    statusText.className = "status-text success";
    nextLevelBtn.textContent = "NEXT";

    if (!levelRewardSaved) {
      addXP(120);
      unlockNextLevel(4);
      localStorage.setItem("level4Completed", "true");
      levelRewardSaved = true;
    }
  }
}

function showScoreScreen() {
  questionContainer.innerHTML = `
    <div class="result-card">
      <div class="result-icon">🏆</div>
      <div class="result-title">Mission 4 Complete!</div>
      <div class="result-subtitle">Normalization Protocol</div>

      <div class="result-stats">
        <div class="result-stat-box">
          <div class="result-stat-label">Mission XP</div>
          <div class="result-stat-value">${xp} XP</div>
        </div>
        <div class="result-stat-box">
          <div class="result-stat-label">MCQ Score</div>
          <div class="result-stat-value">${mcqScore}/${mcqs.length}</div>
        </div>
      </div>

      <div class="result-message">
        You repaired all schemas and completed the final assessment.
      </div>

      <div class="result-actions">
        <button class="btn btn-secondary" onclick="goToMap()">🗺 MAP</button>
        <button class="btn" onclick="goToFinalPage()">NEXT ➜</button>
      </div>
    </div>
  `;

  mcqContainer.innerHTML = "";
  statusText.textContent = "";
  statusText.className = "status-text";

  nextLevelBtn.style.display = "none";
  checkBtn.style.display = "none";
  resetBtn.style.display = "none";
}

function goToFinalPage() {
  window.location.href = "final.html";
}

function goToMap() {
  window.location.href = "map.html";
}

beginMissionBtn.addEventListener("click", () => {
  currentQuestion = 0;
  xp = 0;
  mcqScore = 0;
  missionFinished = false;
  levelRewardSaved = false;
  questionAttempted = false;
  xpCounter.textContent = xp;
  nextLevelBtn.style.display = "inline-block";
  checkBtn.style.display = "inline-block";
  resetBtn.style.display = "inline-block";
  showSchemaScreen();
  renderQuestion();
});

backToMissionBtn.addEventListener("click", showMissionScreen);

mapBtn.addEventListener("click", () => {
  goToMap();
});

nextLevelBtn.addEventListener("click", () => {
  if (currentQuestion < schemaQuestions.length) {
    if (!questionAttempted) {
      statusText.textContent = "Please attempt this question first using Check Schema.";
      statusText.className = "status-text error";
      return;
    }
    goNextQuestion();
    return;
  }

  if (currentQuestion >= schemaQuestions.length && !missionFinished) {
    statusText.textContent = "Answer all 5 MCQs first.";
    statusText.className = "status-text error";
    return;
  }

  if (missionFinished) {
    showScoreScreen();
  }
});

resetBtn.addEventListener("click", resetQuestion);
checkBtn.addEventListener("click", checkAnswer);

renderQuestion();

function unlockNextLevel(currentLevel) {
  const unlockedLevel = parseInt(localStorage.getItem("unlockedLevel")) || 1;
  const nextLevel = currentLevel + 1;

  localStorage.setItem(`level${currentLevel}Completed`, "true");

  if (nextLevel > unlockedLevel) {
    localStorage.setItem("unlockedLevel", nextLevel);
  }
}

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