// ── subject / category menu screens ────────────────────

function toggleShuffle() {
  shuffleEnabled = !shuffleEnabled;
  const btn = document.getElementById("btn-shuffle");
  btn.textContent = `Shuffle ${shuffleEnabled ? "ON" : "OFF"}`;
  btn.classList.toggle("active", shuffleEnabled);
}

function renderSubjectList() {
  const list = document.getElementById("subject-grid");
  list.innerHTML = "";
  document.querySelector(".start-subtitle").textContent = "เลือกวิชาที่ต้องการทดสอบ";

  allData.subjects.forEach((entry) => {
    const btn = document.createElement("button");
    btn.className = "subject-card";
    btn.innerHTML = `
      <span class="subject-name">${entry.subject}</span>
      <span class="subject-count">${entry.count} ข้อ</span>
    `;
    btn.onclick = () => loadAndRenderCategory(entry);
    list.appendChild(btn);
  });
}

async function renderCategoryList(subjectData) {
  const list = document.getElementById("subject-grid");
  list.innerHTML = "";
  document.querySelector(".start-subtitle").textContent = subjectData.subject;

  const backBtn = document.createElement("button");
  backBtn.className = "subject-card subject-card--back";
  backBtn.innerHTML = `<span class="subject-name">${ICONS.back} วิชาอื่น</span>`;
  backBtn.onclick = renderSubjectList;
  list.appendChild(backBtn);

  const allKey = subjectData.subject + "（全部）";
  const [counts, allProg, ...catProgs] = await Promise.all([
    loadAllWrongCounts(),
    loadProgress(allKey),
    ...subjectData.categories.map((cat) => loadProgress(cat.category)),
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
        <span class="subject-name">${ICONS.refresh} ฝึกข้อที่ตอบผิดบ่อย</span>
        <span class="subject-progress">เรียงตามที่ผิดบ่อย</span>
      </div>
      <span class="subject-count">${wrongQs.length} ข้อ</span>
    `;
    wrongBtn.onclick = () =>
      startQuiz({ category: subjectData.subject + " — ข้อที่ตอบผิด", questions: wrongQs });
    list.appendChild(wrongBtn);
  }

  const allQuestions = subjectData.categories.flatMap((c) => c.questions);
  const allBtn = document.createElement("button");
  allBtn.className = "subject-card subject-card--all";
  allBtn.innerHTML = `
    <div class="card-info">
      <span class="subject-name">${ICONS.layers} 全部</span>
      ${allProg ? `<span class="subject-progress">ล่าสุด ${allProg.score}/${allProg.scorableCount} (${allProg.pct}%)</span>` : ""}
    </div>
    <span class="subject-count">${allQuestions.length} ข้อ</span>
  `;
  allBtn.onclick = () => startQuiz({ category: allKey, questions: allQuestions });
  list.appendChild(allBtn);

  const divider = document.createElement("div");
  divider.className = "category-divider";
  divider.textContent = "หรือเลือกครั้งที่";
  list.appendChild(divider);

  subjectData.categories.forEach((cat, i) => {
    const prog = catProgs[i];
    const btn = document.createElement("button");
    btn.className = "subject-card";
    btn.innerHTML = `
      <div class="card-info">
        <span class="subject-name">${cat.category}</span>
        ${prog ? `<span class="subject-progress">ล่าสุด ${prog.score}/${prog.scorableCount} (${prog.pct}%)</span>` : ""}
      </div>
      <span class="subject-count">${cat.questions.length} ข้อ</span>
    `;
    btn.onclick = () => startQuiz(cat);
    list.appendChild(btn);
  });
}
