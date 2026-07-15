// ── shared state & constants ───────────────────────────
// Plain global-scope script (not an ES module) so the app keeps working
// when opened via file:// as well as over http. All js/*.js files share
// this same global scope and must be loaded in the order listed in
// index.html.

const ICONS = {
  back: `<svg class="icon-line" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
  refresh: `<svg class="icon-line" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>`,
  layers: `<svg class="icon-line" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  check: `<svg class="icon-line" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  cross: `<svg class="icon-line" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

let allData = null;
let currentTerm = null;
let currentSubjectData = null;
let reviewSubject = null;
const subjectCache = new Map();
let questions = [];
let currentSubject = null;
let score = 0;
let scorableCount = 0;
let reviewItems = [];
let answeredCount = 0;
let shuffleEnabled = false;

// In-memory cache so repeated screens (category list, quiz render) don't
// re-scan the entire localStorage keyspace on every navigation.
let wrongCountsCache = null;

// ── screens ───────────────────────────────────────────
function showScreen(id) {
  ["start-screen", "review-screen", "quiz-screen", "result-screen"].forEach((s) => {
    document.getElementById(s).style.display = s === id ? "block" : "none";
  });
}
