// ── quiz lifecycle: shuffle, start, progress, rendering questions ──

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function prepareQuestion(q) {
  if (!shuffleEnabled || q.type === "fill") return q;
  const opts = q.options ?? q.choices ?? [];
  if (!opts.length) return q;

  // Shuffle Thai and Japanese option lists together (same permutation) so
  // they stay in sync with each other and with the answer index/indices.
  const optsTh = Array.isArray(q.options_th) && q.options_th.length === opts.length ? q.options_th : null;
  const indexed = opts.map((opt, i) => ({ opt, optTh: optsTh ? optsTh[i] : undefined, origIdx: i }));
  shuffleArray(indexed);

  const q2 = { ...q, options: indexed.map((x) => x.opt) };
  if (optsTh) q2.options_th = indexed.map((x) => x.optTh);

  if (q.type === "single") {
    q2.answer = indexed.findIndex((x) => x.origIdx === q.answer);
  } else if (q.type === "multi") {
    const origToNew = new Map(indexed.map((x, newIdx) => [x.origIdx, newIdx]));
    q2.answers = q.answers.map((orig) => origToNew.get(orig));
  }

  return q2;
}

async function startQuiz(subject) {
  currentSubject = subject;

  let qs = subject.questions
    .filter((q) => (q.type ?? "single") !== "open")
    .map((q) => ({ ...q }));
  if (shuffleEnabled) shuffleArray(qs);
  questions = qs.map((q) => prepareQuestion(q));

  score = 0;
  scorableCount = questions.reduce((sum, q) => sum + (q.score ?? 1), 0);
  reviewItems = [];
  answeredCount = 0;

  document.getElementById("subject-label").textContent = subject.category;
  updateProgress();

  await renderAllQuestions();
  showScreen("quiz-screen");
  window.scrollTo(0, 0);
}

function updateProgress() {
  document.getElementById("progress-text").textContent = t("answered", answeredCount, questions.length);
  document.getElementById("score-display").textContent = t("scorePoints", score);
  document.getElementById("progress-bar").style.width =
    questions.length > 0 ? `${(answeredCount / questions.length) * 100}%` : "0%";

  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const submitBtn = document.getElementById("btn-submit-all");
  submitBtn.disabled = !allAnswered;
  submitBtn.classList.toggle("ready", allAnswered);
}

async function renderAllQuestions() {
  const container = document.getElementById("questions-container");
  container.innerHTML = "";

  const wrongCounts = await loadAllWrongCounts();
  const fragment = document.createDocumentFragment();
  const pending = [];

  questions.forEach((q, i) => {
    const type = q.type ?? "single";
    const wc = wrongCounts[q.question] ?? 0;

    const card = document.createElement("div");
    card.className = "question-card";
    card.id = `q-card-${i}`;

    const badgeMap = { multi: t("multiChoice"), fill: t("fillChoice") };
    const typeBadgeHtml = badgeMap[type]
      ? `<span class="type-badge" style="display:inline-block">${badgeMap[type]}</span>`
      : "";
    const scoreBadgeHtml = `<span class="score-badge" style="display:inline-block">${t("scorePoints", q.score ?? 1)}</span>`;
    const wrongBadgeHtml = wc > 0
      ? `<span class="wrong-count-badge" style="display:inline-block">${t("wrongTimes", wc)}</span>`
      : "";

    // Question text always shows in its original (Japanese) form during
    // the quiz itself -- this is real course material, so the Thai
    // translation is offered as a study aid in the feedback box only
    // *after* answering (see answers.js showFeedback), not swapped in.
    card.innerHTML = `
      <div class="q-num">${t("questionNum", i + 1)} <span class="q-status" id="q-status-${i}"></span></div>
      <p class="q-text">${q.question}</p>
      <div class="badge-row">${typeBadgeHtml}${scoreBadgeHtml}${wrongBadgeHtml}</div>
      <div class="q-choices" id="q-choices-${i}"></div>
      <div class="q-feedback" id="q-feedback-${i}"></div>
    `;

    fragment.appendChild(card);
    pending.push({ q, i, type, choicesEl: card.querySelector(".q-choices") });
  });

  // Single DOM insert instead of one reflow per question card.
  container.appendChild(fragment);

  pending.forEach(({ q, i, type, choicesEl }) => {
    if (type === "single") renderSingleCard(q, i, choicesEl);
    else if (type === "multi") renderMultiCard(q, i, choicesEl);
    else if (type === "fill") renderFillCard(q, i, choicesEl);
  });
}
