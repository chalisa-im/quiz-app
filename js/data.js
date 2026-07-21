// ── data loading, progress storage, wrong-answer tracking ──

// ── init ──────────────────────────────────────────────
async function init() {
  showScreen("start-screen");
  applyStaticI18n();
  try {
    const res = await fetch("questions/index.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    allData = await res.json();
    renderTermList();
  } catch (err) {
    console.error("Failed to load subject index:", err);
    showLoadError(t("loadIndexError"), init);
  }
}

async function loadSubject(entry) {
  if (subjectCache.has(entry.file)) return subjectCache.get(entry.file);
  const res = await fetch(entry.file);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  subjectCache.set(entry.file, data);
  return data;
}

async function loadAndRenderCategory(entry) {
  try {
    const subjectData = await loadSubject(entry);
    await renderCategoryList(subjectData);
  } catch (err) {
    console.error("Failed to load subject:", entry.file, err);
    showLoadError(t("loadSubjectError"), () => loadAndRenderCategory(entry));
  }
}

// ── load error UI ─────────────────────────────────────
function showLoadError(message, retryFn) {
  const list = document.getElementById("subject-grid");
  document.querySelector(".start-subtitle").textContent = "";
  list.innerHTML = `
    <div class="load-error">
      <p class="load-error-text">${message}</p>
      <button class="btn-primary" id="btn-retry-load">${t("retry")}</button>
    </div>
  `;
  document.getElementById("btn-retry-load").onclick = retryFn;
}

// ── progress storage ──────────────────────────────────
async function saveProgress(category, sc, scorableC, pct) {
  await window.storage.set("progress:" + category, {
    score: sc,
    scorableCount: scorableC,
    pct,
    date: new Date().toLocaleDateString(uiLang === "th" ? "th-TH" : "ja-JP"),
  });
}

async function loadProgress(category) {
  return (await window.storage.get("progress:" + category)) ?? null;
}

// ── wrong counts ──────────────────────────────────────
async function loadAllWrongCounts() {
  if (wrongCountsCache) return wrongCountsCache;
  const keys = await window.storage.list("wrong:");
  const counts = {};
  if (keys.length) {
    const values = await Promise.all(keys.map((k) => window.storage.get(k)));
    keys.forEach((k, i) => { counts[k.slice("wrong:".length)] = values[i]; });
  }
  wrongCountsCache = counts;
  return wrongCountsCache;
}

async function getWrongCount(questionText) {
  const counts = await loadAllWrongCounts();
  return counts[questionText] ?? 0;
}

async function incrementWrongCount(questionText) {
  const n = await getWrongCount(questionText);
  const next = n + 1;
  await window.storage.set("wrong:" + questionText, next);
  wrongCountsCache[questionText] = next;
}

async function decrementWrongCount(questionText) {
  const n = await getWrongCount(questionText);
  if (n <= 0) return;
  if (n === 1) {
    await window.storage.delete("wrong:" + questionText);
    delete wrongCountsCache[questionText];
  } else {
    await window.storage.set("wrong:" + questionText, n - 1);
    wrongCountsCache[questionText] = n - 1;
  }
}
