// level4.js – Normalization Protocol (UPGRADED with Drag & Drop)

const questions = [
  {
    violationTitle: "1NF Violation: Repeating Group",
    tableName: "STUDENT_CONTACT",
    headers: ["student_id","student_name","phones"],
    rows: [
      ["S101","Asha","98765, 91234"],
      ["S102","Ravi","99887"]
    ],
    note: "The 'phones' column stores multiple values in one cell — this violates 1NF (First Normal Form), which requires each cell to hold only atomic (single) values.",
    prompt: "Drag each attribute into the correct normalized table:",
    bank: ["student_id","student_name","phone"],
    slots: [
      { id: "student", label: "STUDENT Table" },
      { id: "phone",   label: "STUDENT_PHONE Table" }
    ],
    answer: {
      student: ["student_id","student_name"],
      phone:   ["student_id","phone"]
    },
    hint: "In 1NF, each table should store only atomic values. Split the multi-valued column into a separate table. Both tables will need student_id to stay linked."
  },
  {
    violationTitle: "2NF Violation: Partial Dependency",
    tableName: "ENROLLMENT",
    headers: ["student_id","course_id","student_name","course_name"],
    rows: [
      ["S101","C11","Asha","DBMS"],
      ["S102","C12","Ravi","Java"]
    ],
    note: "The Primary Key here is (student_id + course_id). But student_name depends only on student_id, and course_name depends only on course_id — these are PARTIAL dependencies, violating 2NF.",
    prompt: "Separate attributes into 2NF-compliant tables:",
    bank: ["student_id","student_name","course_id","course_name"],
    slots: [
      { id: "student",    label: "STUDENT Table" },
      { id: "course",     label: "COURSE Table" },
      { id: "enrollment", label: "ENROLLMENT Table" }
    ],
    answer: {
      student:    ["student_id","student_name"],
      course:     ["course_id","course_name"],
      enrollment: ["student_id","course_id"]
    },
    hint: "2NF: remove partial dependencies. student_name belongs with student_id in a STUDENT table. course_name belongs with course_id in a COURSE table. The ENROLLMENT table only needs the two keys."
  },
  {
    violationTitle: "1NF Violation: Multiple Subjects",
    tableName: "MARKS",
    headers: ["student_id","student_name","subjects"],
    rows: [
      ["S201","Meena","DBMS, OOP"],
      ["S202","Kiran","Maths, English"]
    ],
    note: "The 'subjects' column contains a comma-separated list of subjects — multiple values in one cell. This violates 1NF's atomicity requirement.",
    prompt: "Split into atomic 1NF-compliant tables:",
    bank: ["student_id","student_name","subject"],
    slots: [
      { id: "student", label: "STUDENT Table" },
      { id: "subject", label: "STUDENT_SUBJECT Table" }
    ],
    answer: {
      student: ["student_id","student_name"],
      subject: ["student_id","subject"]
    },
    hint: "Each subject should be a separate row in a new table. The STUDENT table holds the student info, and a STUDENT_SUBJECT table links each student to one subject per row."
  }
];

let currentIndex = 0;
let totalXP = 0;
let correctCount = 0;
let levelRewardSaved = false;
let draggedChip = null;
let dragSource = null; // 'bank' or slot id

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function startLevel() {
  currentIndex = 0; totalXP = 0; correctCount = 0; levelRewardSaved = false;
  document.getElementById("xp-count").textContent = 0;
  document.getElementById("q-total").textContent = questions.length;
  showScreen("quiz-screen");
  loadQuestion(0);
}

// ── LOAD QUESTION ─────────────────────────────────────────────────────────────
function loadQuestion(idx) {
  const q = questions[idx];
  document.getElementById("q-num").textContent = idx + 1;
  document.getElementById("q-current").textContent = idx + 1;
  document.getElementById("q-violation-title").textContent = q.violationTitle;
  document.getElementById("progress-fill").style.width = ((idx / questions.length) * 100) + "%";

  // Broken table
  const bts = document.getElementById("broken-table-section");
  let tableHTML = `<div class="broken-label">⚠️ Broken Table: ${q.tableName}</div>`;
  tableHTML += `<div class="table-wrap"><table class="db-table"><thead><tr>`;
  q.headers.forEach(h => tableHTML += `<th>${h}</th>`);
  tableHTML += `</tr></thead><tbody>`;
  q.rows.forEach(row => {
    tableHTML += `<tr>`;
    row.forEach(cell => tableHTML += `<td>${cell}</td>`);
    tableHTML += `</tr>`;
  });
  tableHTML += `</tbody></table></div>`;
  tableHTML += `<div class="violation-note">❗ ${q.note}</div>`;
  bts.innerHTML = tableHTML;

  // Attribute bank
  const bank = document.getElementById("attr-bank");
  bank.innerHTML = "";
  q.bank.forEach(attr => {
    bank.appendChild(createChip(attr));
  });

  // Drop table slots
  const dropTables = document.getElementById("drop-tables");
  dropTables.innerHTML = "";
  q.slots.forEach(slot => {
    const div = document.createElement("div");
    div.className = "drop-table";
    div.id = "slot-" + slot.id;
    div.innerHTML = `<div class="drop-table-title">${slot.label}</div><div class="drop-zone" id="zone-${slot.id}"></div>`;
    div.addEventListener("dragover", e => { e.preventDefault(); div.classList.add("drag-over"); });
    div.addEventListener("dragleave", () => div.classList.remove("drag-over"));
    div.addEventListener("drop", e => { e.preventDefault(); div.classList.remove("drag-over"); dropToSlot(e, slot.id); });
    dropTables.appendChild(div);
  });

  // Reset feedback/buttons
  const feedback = document.getElementById("feedback-box");
  feedback.className = "feedback-box"; feedback.innerHTML = "";
  const hint = document.getElementById("hint-box");
  hint.classList.add("hidden"); hint.textContent = "";
  document.getElementById("btn-check").disabled = false;
  document.getElementById("btn-check").style.display = "inline-flex";
  const nextBtn = document.getElementById("btn-next");
  nextBtn.classList.remove("visible"); nextBtn.style.display = "none";
  nextBtn.textContent = "NEXT ▶"; nextBtn.onclick = nextQuestion;
}

// ── CHIP CREATION ─────────────────────────────────────────────────────────────
function createChip(attr) {
  const chip = document.createElement("div");
  chip.className = "attr-chip";
  chip.textContent = attr;
  chip.draggable = true;
  chip.dataset.attr = attr;
  chip.addEventListener("dragstart", e => {
    draggedChip = chip;
    dragSource = chip.parentElement.id;
    chip.classList.add("dragging");
    e.dataTransfer.setData("text/plain", attr);
  });
  chip.addEventListener("dragend", () => chip.classList.remove("dragging"));
  return chip;
}

// ── DROP TO SLOT ──────────────────────────────────────────────────────────────
function dropToSlot(e, slotId) {
  const attr = e.dataTransfer.getData("text/plain");
  if (!attr) return;
  const zone = document.getElementById("zone-" + slotId);
  if (!zone) return;
  // Check if already in this zone
  const existing = zone.querySelector(`[data-attr="${attr}"]`);
  if (existing) return;
  // Remove from source
  removeDragged();
  const chip = createChip(attr);
  chip.classList.add("placed");
  zone.appendChild(chip);
}

// ── DROP TO BANK ──────────────────────────────────────────────────────────────
function dropToBank(e) {
  e.preventDefault();
  const attr = e.dataTransfer.getData("text/plain");
  if (!attr) return;
  removeDragged();
  const chip = createChip(attr);
  document.getElementById("attr-bank").appendChild(chip);
}

function removeDragged() {
  if (draggedChip && draggedChip.parentElement) {
    draggedChip.parentElement.removeChild(draggedChip);
  }
}

function resetDrag() {
  loadQuestion(currentIndex);
}

// ── CHECK ANSWER ──────────────────────────────────────────────────────────────
function checkAnswer() {
  const q = questions[currentIndex];
  const feedback = document.getElementById("feedback-box");
  let allCorrect = true;
  let resultHTML = "";

  q.slots.forEach(slot => {
    const zone = document.getElementById("zone-" + slot.id);
    const placed = Array.from(zone.querySelectorAll(".attr-chip")).map(c => c.dataset.attr).sort();
    const expected = [...q.answer[slot.id]].sort();
    const match = JSON.stringify(placed) === JSON.stringify(expected);
    if (!match) allCorrect = false;

    const icon = match ? "✅" : "❌";
    const cls  = match ? "ok" : "err";
    const exp  = expected.join(", ");
    const got  = placed.length ? placed.join(", ") : "(empty)";
    resultHTML += `<div class="result-row ${cls}">${icon} <strong>${slot.label}</strong>: ${match ? "Correct!" : `Expected: [${exp}] — Got: [${got}]`}</div>`;
  });

  if (allCorrect) {
    totalXP += 30;
    correctCount++;
    document.getElementById("xp-count").textContent = totalXP;
    feedback.innerHTML = `✅ <strong>Perfect normalization!</strong> All attributes placed correctly.<br><br>${resultHTML}`;
    feedback.className = "feedback-box ok show";
  } else {
    feedback.innerHTML = `❌ <strong>Not quite right.</strong> Check the expected layout:<br><br>${resultHTML}<br><em>💡 Tip: Use the Hint button, then Reset and try again.</em>`;
    feedback.className = "feedback-box err show";
  }

  document.getElementById("btn-check").style.display = "none";
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
    unlockNextLevel(4);
    levelRewardSaved = true;
  }
  document.getElementById("progress-fill").style.width = "100%";
  document.getElementById("final-xp").textContent = `+${totalXP} XP`;
  document.getElementById("final-xp-label").textContent = `${totalXP} XP Gained`;
  document.getElementById("score-summary").innerHTML =
    `You completed <strong>${correctCount} / ${questions.length}</strong> normalizations correctly!`;
  showScreen("complete-screen");
}

function goHome()  { window.location.href = "index.html"; }
function goMap()   { window.location.href = "map.html"; }
function goFinal() { window.location.href = "final.html"; }

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