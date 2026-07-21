// ── per-question-type rendering & answer handling ──────

// ── single ────────────────────────────────────────────
function renderSingleCard(q, i, el) {
  const opts = q.options ?? q.choices ?? [];
  opts.forEach((choice, j) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice;
    btn.onclick = () => answerSingle(i, j);
    el.appendChild(btn);
  });
}

async function answerSingle(i, selected) {
  const q = questions[i];
  const opts = q.options ?? q.choices ?? [];
  const el = document.getElementById(`q-choices-${i}`);
  const buttons = el.querySelectorAll(".choice-btn");

  buttons.forEach((b) => (b.disabled = true));

  const correct = selected === q.answer;
  buttons[selected].classList.add(correct ? "correct" : "wrong");
  if (!correct) buttons[q.answer].classList.add("correct");

  if (correct) {
    score += q.score ?? 1;
    await decrementWrongCount(q.question);
  } else {
    await incrementWrongCount(q.question);
    reviewItems.push({
      type: "single",
      question: q.question,
      yourAnswer: opts[selected],
      correctAnswer: opts[q.answer],
    });
  }

  markQuestionStatus(i, correct);
  showFeedback(i, q, correct);
  answeredCount++;
  updateProgress();
}

// ── multi ─────────────────────────────────────────────
function renderMultiCard(q, i, el) {
  const opts = q.options ?? q.choices ?? [];
  opts.forEach((choice, j) => {
    const label = document.createElement("label");
    label.className = "choice-label";
    label.innerHTML = `<input type="checkbox" class="choice-checkbox" value="${j}"><span class="choice-label-text">${choice}</span>`;
    el.appendChild(label);
  });

  const btn = document.createElement("button");
  btn.className = "btn-submit-answer";
  btn.textContent = t("submitAnswer");
  btn.onclick = () => answerMulti(i);
  el.appendChild(btn);
}

async function answerMulti(i) {
  const q = questions[i];
  const opts = q.options ?? q.choices ?? [];
  const el = document.getElementById(`q-choices-${i}`);
  const correctSet = new Set(q.answers);

  const checkboxes = el.querySelectorAll(".choice-checkbox");
  const selectedSet = new Set();
  checkboxes.forEach((cb) => {
    if (cb.checked) selectedSet.add(Number(cb.value));
  });

  checkboxes.forEach((cb) => (cb.disabled = true));
  el.querySelectorAll(".btn-submit-answer").forEach((b) => (b.disabled = true));

  checkboxes.forEach((cb, j) => {
    const label = cb.parentElement;
    if (correctSet.has(j)) label.classList.add("correct");
    else if (selectedSet.has(j)) label.classList.add("wrong");
  });

  const isCorrect =
    selectedSet.size === correctSet.size &&
    [...selectedSet].every((j) => correctSet.has(j));

  if (isCorrect) {
    score += q.score ?? 1;
    await decrementWrongCount(q.question);
  } else {
    await incrementWrongCount(q.question);
    reviewItems.push({
      type: "multi",
      question: q.question,
      yourAnswer: selectedSet.size
        ? [...selectedSet].map((j) => opts[j]).join("、")
        : t("notSelected"),
      correctAnswer: [...correctSet].map((j) => opts[j]).join("、"),
    });
  }

  markQuestionStatus(i, isCorrect);
  showFeedback(i, q, isCorrect);
  answeredCount++;
  updateProgress();
}

// ── fill ──────────────────────────────────────────────
function renderFillCard(q, i, el) {
  el.innerHTML = `
    <input type="text" class="fill-input" id="fill-input-${i}" placeholder="${t("typeAnswerPlaceholder")}" autocomplete="off" />
    <button class="btn-submit-answer" id="fill-submit-${i}" onclick="answerFill(${i})">${t("submitAnswer")}</button>
  `;
  document.getElementById(`fill-input-${i}`).addEventListener("keydown", (e) => {
    if (e.key === "Enter") answerFill(i);
  });
}

async function answerFill(i) {
  const q = questions[i];
  const input = document.getElementById(`fill-input-${i}`);
  const userAnswer = input.value.trim();
  const correctAnswer = String(q.answer ?? "").trim();
  const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

  input.disabled = true;
  document.getElementById(`fill-submit-${i}`).disabled = true;

  input.classList.add(isCorrect ? "fill-correct" : "fill-wrong");

  if (isCorrect) {
    score += q.score ?? 1;
    await decrementWrongCount(q.question);
  } else {
    await incrementWrongCount(q.question);
    reviewItems.push({
      type: "fill",
      question: q.question,
      yourAnswer: userAnswer || t("notAnswered"),
      correctAnswer,
    });
  }

  markQuestionStatus(i, isCorrect);
  showFeedback(i, q, isCorrect, correctAnswer);
  answeredCount++;
  updateProgress();
}

// ── translation aid (Thai) ─────────────────────────────
// Builds the "คำแปล" block shown inside the feedback area once a question
// has been answered. Kept separate from the live quiz content on purpose:
// the question/options stay in Japanese while you're answering (this is
// real course material), and the Thai translation is only revealed here,
// afterwards, as a study aid -- so reviewing doesn't mean losing the
// original Japanese wording. Tied to the UI language switch: pick 日本語
// and you get Japanese only (no translation box); pick ไทย and the
// translation box comes back.
function buildTranslationBlock(q) {
  if (uiLang !== "th") return "";
  if (!q.question_th) return "";

  const optsJa = q.options ?? q.choices ?? [];
  const optsTh = Array.isArray(q.options_th) && q.options_th.length === optsJa.length ? q.options_th : null;

  const optionsHtml = optsTh
    ? `<ul class="q-translate-options">` +
      optsJa.map((ja, idx) => `<li><span class="q-translate-ja">${ja}</span><span class="q-translate-th">${optsTh[idx]}</span></li>`).join("") +
      `</ul>`
    : "";

  return `
    <div class="q-translate-box">
      <div class="q-translate-label">คำแปลไทย</div>
      <p class="q-translate-question">${q.question_th}</p>
      ${optionsHtml}
    </div>
  `;
}

// ── feedback helpers ──────────────────────────────────
function showFeedback(i, q, correct, correctAnswer) {
  const feedbackEl = document.getElementById(`q-feedback-${i}`);
  let html = "";

  if (q.type === "fill") {
    if (correct) {
      html += `<div class="fill-result fill-result--correct">${t("correctFeedback")}</div>`;
    } else {
      html += `<div class="fill-result fill-result--wrong">${t("wrongAnswerIs", `<strong>${correctAnswer}</strong>`)}</div>`;
    }
  }

  if (q.hint) {
    html += `<div class="q-hint-box">${q.hint}</div>`;
  }

  html += buildTranslationBlock(q);

  feedbackEl.innerHTML = html;
}

function markQuestionStatus(i, correct) {
  const statusEl = document.getElementById(`q-status-${i}`);
  const card = document.getElementById(`q-card-${i}`);
  if (statusEl) {
    statusEl.innerHTML = correct ? ICONS.check : ICONS.cross;
    statusEl.className = `q-status ${correct ? "q-status--correct" : "q-status--wrong"}`;
  }
  if (card) {
    card.classList.add(correct ? "question-card--correct" : "question-card--wrong");
  }
}
