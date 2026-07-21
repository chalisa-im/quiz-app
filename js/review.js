// ── pre-quiz review screen ─────────────────────────────
// Shows every question as a study guide before the timed/scored quiz:
// the reasoning/guideline comes first, with the correct-answer chip and
// Thai translation as supporting reference underneath -- rather than
// reading like a blunt answer key. Reuses buildTranslationBlock() from
// answers.js so the translation styling stays identical to the in-quiz
// feedback box.

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

    const guidelineHtml = q.hint
      ? `
        <div class="q-hint-box review-guideline-box">
          <div class="review-guideline-label">${t("guidelineLabel")}</div>
          ${q.hint}
        </div>
      `
      : "";

    card.innerHTML = `
      <div class="q-num">${t("questionNum", i + 1)}</div>
      <p class="q-text">${q.question}</p>
      ${guidelineHtml}
      <div class="review-answer-box">
        <span class="review-answer-label">${t("answerSummaryLabel")}</span>
        <span class="review-answer-text">${correctAnswerText(q)}</span>
      </div>
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
