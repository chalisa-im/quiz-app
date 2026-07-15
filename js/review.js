// ── pre-quiz review screen ─────────────────────────────
// Shows every question with its correct answer and Thai translation
// upfront, as a study sheet, before the user starts the timed/scored quiz.
// Reuses buildTranslationBlock() from answers.js so the translation
// styling stays identical to the in-quiz feedback box.

function correctAnswerText(q) {
  const opts = q.options ?? q.choices ?? [];
  const type = q.type ?? "single";
  if (type === "multi") {
    return (q.answers ?? []).map((idx) => opts[idx]).join("、");
  }
  if (type === "fill") {
    return String(q.answer ?? "");
  }
  return opts[q.answer] ?? "";
}

function renderReviewScreen(subject) {
  reviewSubject = subject;

  document.getElementById("review-label").textContent = subject.category;

  const container = document.getElementById("review-container");
  container.innerHTML = "";

  const qs = subject.questions.filter((q) => (q.type ?? "single") !== "open");
  const fragment = document.createDocumentFragment();

  qs.forEach((q, i) => {
    const card = document.createElement("div");
    card.className = "question-card review-card";
    card.innerHTML = `
      <div class="q-num">${t("questionNum", i + 1)}</div>
      <p class="q-text">${q.question}</p>
      <div class="review-answer-box">
        <span class="review-answer-label">${t("correctAnswerLabel")}</span>
        <span class="review-answer-text">${correctAnswerText(q)}</span>
      </div>
      ${q.hint ? `<div class="q-hint-box">${q.hint}</div>` : ""}
      ${buildTranslationBlock(q)}
    `;
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
  showScreen("review-screen");
  window.scrollTo(0, 0);
}

function startQuizFromReview() {
  startQuiz(reviewSubject);
}

function backFromReview() {
  if (currentSubjectData) {
    renderCategoryList(currentSubjectData);
    showScreen("start-screen");
  } else {
    renderTermList();
    showScreen("start-screen");
  }
}
