// ── result screen & navigation between screens ─────────

async function showResult() {
  const pct =
    scorableCount > 0 ? Math.max(0, Math.round((score / scorableCount) * 100)) : 0;

  if (scorableCount > 0) await saveProgress(currentSubject.category, score, scorableCount, pct);

  showScreen("result-screen");
  applyStaticI18n();
  document.getElementById("result-subject").textContent = currentSubject.category;
  document.getElementById("result-score").textContent =
    scorableCount > 0
      ? `${score} / ${scorableCount} ${t("scorePoints", "").trim()} (${pct}%)`
      : t("noScorable");

  let grade = "";
  if (scorableCount === 0) grade = t("gradeDone");
  else if (pct >= 80) grade = t("gradeExcellent");
  else if (pct >= 60) grade = t("gradeGood");
  else if (pct >= 40) grade = t("gradeOk");
  else grade = t("gradeNeedPractice");
  document.getElementById("result-grade").textContent = grade;

  const wrongList = document.getElementById("wrong-list");
  wrongList.innerHTML = "";

  if (reviewItems.length === 0) {
    wrongList.innerHTML = `<p class='all-correct'>${t("allCorrect")}</p>`;
  }

  reviewItems.forEach((item) => {
    const div = document.createElement("div");
    div.className = "wrong-item";
    const tagMap = { multi: t("typeMulti"), fill: t("typeFill"), single: t("typeSingle") };
    const tag = tagMap[item.type] ?? t("typeSingle");
    div.innerHTML = `
      <p class="wrong-q">${item.question} <span class="type-tag">${tag}</span></p>
      <p>${t("yourAnswer")} <span class="wrong-text">${item.yourAnswer}</span></p>
      <p>${t("correctAnswerLabel")} <span class="correct-text">${item.correctAnswer}</span></p>
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
    const confirmed = confirm(t("confirmExit"));
    if (!confirmed) return;
  }

  if (currentTerm) renderSubjectList(currentTerm);
  else renderTermList();
  showScreen("start-screen");
}
