// ── term / subject / category menu screens ─────────────

function toggleShuffle() {
  shuffleEnabled = !shuffleEnabled;
  const btn = document.getElementById("btn-shuffle");
  btn.textContent = `Shuffle ${shuffleEnabled ? "ON" : "OFF"}`;
  btn.classList.toggle("active", shuffleEnabled);
}

function renderTermList() {
  currentTerm = null;
  const list = document.getElementById("subject-grid");
  list.innerHTML = "";
  document.querySelector(".start-subtitle").textContent = t("chooseTerm");

  allData.terms.forEach((termEntry) => {
    const btn = document.createElement("button");
    btn.className = "subject-card";
    btn.innerHTML = `
      <span class="subject-name">${termEntry.term}</span>
      <span class="subject-count">${t("subjectsCount", termEntry.subjects.length)}</span>
    `;
    btn.onclick = () => renderSubjectList(termEntry);
    list.appendChild(btn);
  });
}

function renderSubjectList(termEntry) {
  currentTerm = termEntry;
  const list = document.getElementById("subject-grid");
  list.innerHTML = "";
  document.querySelector(".start-subtitle").textContent = termEntry.term;

  const backBtn = document.createElement("button");
  backBtn.className = "subject-card subject-card--back";
  backBtn.innerHTML = `<span class="subject-name">${ICONS.back} ${t("backToTerm")}</span>`;
  backBtn.onclick = renderTermList;
  list.appendChild(backBtn);

  termEntry.subjects.forEach((entry) => {
    const btn = document.createElement("button");
    btn.className = "subject-card";
    btn.innerHTML = `
      <span class="subject-name">${entry.subject}</span>
      <span class="subject-count">${t("questionsCount", entry.count)}</span>
    `;
    btn.onclick = () => loadAndRenderCategory(entry);
    list.appendChild(btn);
  });
}

async function renderCategoryList(subjectData) {
  currentSubjectData = subjectData;
  const list = document.getElementById("subject-grid");
  list.innerHTML = "";
  document.querySelector(".start-subtitle").textContent = subjectData.subject;

  const backBtn = document.createElement("button");
  backBtn.className = "subject-card subject-card--back";
  backBtn.innerHTML = `<span class="subject-name">${ICONS.back} ${t("backToSubject")}</span>`;
  backBtn.onclick = () => renderSubjectList(currentTerm);
  list.appendChild(backBtn);

  const allKey = subjectData.subject + "（全部）";
  const [counts, allProg, ...catProgs] = await Promise.all([
    loadAllWrongCounts(),
    loadProgress(allKey),
    ...subjectData.categories.map((cat) => loadProgress(subjectData.subject + "：" + cat.category)),
  ]);

  const allSubjectQs = subjectData.categories.flatMap((c) => c.questions);
  const wrongQs = allSubjectQs
    .filter((q) => (q.type ?? "single") !== "open" && (counts[q.question] ?? 0) > 0)
    .sort((a, b) => (counts[b.question] ?? 0) - (counts[a.question] ?? 0));

  if (wrongQs.length > 0) {
    const wrongBtn = document.createElement("button");
    wrongBtn.className = "subject-card subject-card--wrong";
    wrongBtn.innerHTML = `
      <div class="card-info">
        <span class="subject-name">${ICONS.refresh} ${t("wrongPractice")}</span>
        <span class="subject-progress">${t("sortByWrong")}</span>
      </div>
      <span class="subject-count">${t("questionsCount", wrongQs.length)}</span>
    `;
    const wrongKey = subjectData.subject + " — " + t("wrongPractice");
    wrongBtn.onclick = () =>
      renderReviewScreen({ category: wrongKey, progressKey: wrongKey, questions: wrongQs });
    list.appendChild(wrongBtn);
  }

  const allQuestions = subjectData.categories.flatMap((c) => c.questions);
  const allBtn = document.createElement("button");
  allBtn.className = "subject-card subject-card--all";
  allBtn.innerHTML = `
    <div class="card-info">
      <span class="subject-name">${ICONS.layers} ${t("allLabel")}</span>
      ${allProg ? `<span class="subject-progress">${t("latestScore", allProg.score, allProg.scorableCount, allProg.pct)}</span>` : ""}
    </div>
    <span class="subject-count">${t("questionsCount", allQuestions.length)}</span>
  `;
  allBtn.onclick = () => renderReviewScreen({ category: allKey, progressKey: allKey, questions: allQuestions });
  list.appendChild(allBtn);

  const divider = document.createElement("div");
  divider.className = "category-divider";
  divider.textContent = t("orChooseRound");
  list.appendChild(divider);

  subjectData.categories.forEach((cat, i) => {
    const prog = catProgs[i];
    const btn = document.createElement("button");
    btn.className = "subject-card";
    btn.innerHTML = `
      <div class="card-info">
        <span class="subject-name">${cat.category}</span>
        ${prog ? `<span class="subject-progress">${t("latestScore", prog.score, prog.scorableCount, prog.pct)}</span>` : ""}
      </div>
      <span class="subject-count">${t("questionsCount", cat.questions.length)}</span>
    `;
    btn.onclick = () =>
      renderReviewScreen({ ...cat, progressKey: subjectData.subject + "：" + cat.category });
    list.appendChild(btn);
  });
}
