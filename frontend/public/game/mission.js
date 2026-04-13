const level = parseInt(localStorage.getItem("currentLevel"));

const missionData = {
  1: {
    title: "Orientation Day",
    sub: "Tables & Schemas",
    desc: "The campus DB is down! Bot says the STUDENT table is scrambled. Find what makes each student unique."
  },
  2: {
    title: "Key Lab Break-In",
    sub: "Primary & Candidate Keys",
    desc: "The vault is locked. Identify the correct primary key to unlock access."
  },
  3: {
    title: "Foreign Affairs",
    sub: "Foreign Keys & Relationships",
    desc: "Tables are disconnected! Restore relationships using foreign keys."
  },
  4: {
    title: "Normalization Protocol",
    sub: "1NF & 2NF",
    desc: "Data redundancy detected. Normalize the database before it crashes."
  }
};

if (missionData[level]) {
  document.getElementById("mission-count").innerText = "MISSION " + level + "/4";
  document.getElementById("mission-title").innerText = missionData[level].title;
  document.getElementById("mission-sub").innerText = missionData[level].sub;
  document.getElementById("mission-desc").innerText = missionData[level].desc;
}

function goMap() {
  window.location.href = "map.html";
}

function startQuiz() {
  window.location.href = "quiz.html";
}