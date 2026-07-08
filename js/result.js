// ── result screen & navigation between screens ─────────

async function showResult() {
  const pct =
    scorableCount > 0 ? Math.max(0, Math.round((score / scorableCount) * 100)) : 0;

  if (scorableCount > 0) await saveProgress(currentSubject.category, score, scorableCount, pct);

  showScreen("result-screen");
  document.getElementById("result-subject").textContent = currentSubject.category;
  document.getElementById("result-score").textContent =
    scorableCount > 0
      ? `${score} / ${scorableCount} คะแนน (${pct}%)`
      : "ไม่มีข้อให้คะแนน";

  let grade = "";
  if (scorableCount === 0) grade = "ทำครบแล้ว";
  else if (pct >= 80) grade = "ยอดเยี่ยม!";
  else if (pct >= 60) grade = "ดี!";
  else if (pct >= 40) grade = "พอใช้";
  else grade = "ต้องฝึกเพิ่ม";
  document.getElementById("result-grade").textContent = grade;

  const wrongList = document.getElementById("wrong-list");
  wrongList.innerHTML = "";

  if (reviewItems.length === 0) {
    wrongList.innerHTML = "<p class='all-correct'>ตอบถูกทุกข้อ!</p>";
  }

  reviewItems.forEach((item) => {
    const div = document.createElement("div");
    div.className = "wrong-item";
    const tagMap = { multi: "หลายตัวเลือก", fill: "เติมคำตอบ", single: "ตัวเลือกเดียว" };
    const tag = tagMap[item.type] ?? "ตัวเลือกเดียว";
    div.innerHTML = `
      <p class="wrong-q">${item.question} <span class="type-tag">${tag}</span></p>
      <p>คำตอบของคุณ: <span class="wrong-text">${item.yourAnswer}</span></p>
      <p>คำตอบที่ถูก: <span class="correct-text">${item.correctAnswer}</span></p>
    `;
    wrongList.appendChild(div);
  });

  window.scrollTo(0, 0);
}

function restartQuiz() {
  startQuiz(currentSubject);
}

function goToStart() {
  const quizScreen = document.getElementById("quiz-screen");
  const quizInProgress =
    quizScreen.style.display === "block" &&
    answeredCount > 0 &&
    answeredCount < questions.length;

  if (quizInProgress) {
    const confirmed = confirm(
      "คุณยังตอบไม่ครบทุกข้อ ถ้าออกตอนนี้คำตอบที่ทำไว้จะไม่ถูกบันทึก ต้องการออกจากแบบทดสอบหรือไม่?"
    );
    if (!confirmed) return;
  }

  if (currentTerm) renderSubjectList(currentTerm);
  else renderTermList();
  showScreen("start-screen");
}
