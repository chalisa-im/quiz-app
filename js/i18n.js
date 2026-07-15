// ── bilingual UI strings (Thai / Japanese) ─────────────
// This only covers interface chrome (buttons, labels, messages). Question
// content stays in Japanese during the quiz itself; the Thai translation
// (when available) is revealed as a study aid in the feedback box after
// answering -- see buildTranslationBlock() in js/answers.js.

const STRINGS = {
  th: {
    chooseTerm: "เลือกเทอมที่ต้องการทดสอบ",
    backToTerm: "เทอมอื่น",
    backToSubject: "วิชาอื่น",
    wrongPractice: "ฝึกข้อที่ตอบผิดบ่อย",
    sortByWrong: "เรียงตามที่ผิดบ่อย",
    allLabel: "ทั้งหมด",
    orChooseRound: "หรือเลือกครั้งที่",
    latestScore: (score, total, pct) => `ล่าสุด ${score}/${total} (${pct}%)`,
    subjectsCount: (n) => `${n} วิชา`,
    questionsCount: (n) => `${n} ข้อ`,
    exit: "ออก",
    answered: (n, total) => `ตอบแล้ว ${n} / ${total} ข้อ`,
    scorePoints: (n) => `${n} คะแนน`,
    viewResult: "ดูผลสรุป",
    multiChoice: "เลือกได้หลายข้อ",
    fillChoice: "เติมคำตอบ",
    questionNum: (i) => `ข้อ ${i}`,
    wrongTimes: (n) => `ผิด ${n} ครั้ง`,
    submitAnswer: "ส่งคำตอบ",
    notSelected: "(ไม่ได้เลือก)",
    typeAnswerPlaceholder: "พิมพ์คำตอบ...",
    notAnswered: "(ไม่ได้ตอบ)",
    correctFeedback: "ถูกต้อง!",
    wrongAnswerIs: (ans) => `ผิด — คำตอบที่ถูก: ${ans}`,
    resultTitle: "ผลการทดสอบ",
    noScorable: "ไม่มีข้อให้คะแนน",
    gradeDone: "ทำครบแล้ว",
    gradeExcellent: "ยอดเยี่ยม!",
    gradeGood: "ดี!",
    gradeOk: "พอใช้",
    gradeNeedPractice: "ต้องฝึกเพิ่ม",
    wrongListTitle: "ข้อที่ตอบผิด",
    allCorrect: "ตอบถูกทุกข้อ!",
    yourAnswer: "คำตอบของคุณ:",
    correctAnswerLabel: "คำตอบที่ถูก:",
    typeMulti: "หลายตัวเลือก",
    typeFill: "เติมคำตอบ",
    typeSingle: "ตัวเลือกเดียว",
    playAgain: "เล่นอีกครั้ง",
    chooseOtherSubject: "เลือกวิชาอื่น",
    confirmExit: "คุณยังตอบไม่ครบทุกข้อ ถ้าออกตอนนี้คำตอบที่ทำไว้จะไม่ถูกบันทึก ต้องการออกจากแบบทดสอบหรือไม่?",
    retry: "ลองอีกครั้ง",
    loadIndexError: "โหลดรายวิชาไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง",
    loadSubjectError: "โหลดข้อมูลวิชานี้ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
    backLabel: "กลับ",
    startQuizNow: "เริ่มทำควิซ",
  },
  ja: {
    chooseTerm: "テストする学期を選んでください",
    backToTerm: "他の学期",
    backToSubject: "他の科目",
    wrongPractice: "よく間違える問題を練習",
    sortByWrong: "間違えた回数順",
    allLabel: "全部",
    orChooseRound: "または回を選択",
    latestScore: (score, total, pct) => `最新 ${score}/${total} (${pct}%)`,
    subjectsCount: (n) => `${n} 科目`,
    questionsCount: (n) => `${n} 問`,
    exit: "終了",
    answered: (n, total) => `回答済み ${n} / ${total} 問`,
    scorePoints: (n) => `${n} 点`,
    viewResult: "結果を見る",
    multiChoice: "複数選択",
    fillChoice: "記述式",
    questionNum: (i) => `問題 ${i}`,
    wrongTimes: (n) => `${n} 回間違え`,
    submitAnswer: "回答する",
    notSelected: "（未選択）",
    typeAnswerPlaceholder: "回答を入力...",
    notAnswered: "（未回答）",
    correctFeedback: "正解！",
    wrongAnswerIs: (ans) => `不正解 — 正解: ${ans}`,
    resultTitle: "テスト結果",
    noScorable: "採点対象の問題はありません",
    gradeDone: "完了しました",
    gradeExcellent: "素晴らしい！",
    gradeGood: "良い！",
    gradeOk: "まあまあ",
    gradeNeedPractice: "もっと練習が必要",
    wrongListTitle: "間違えた問題",
    allCorrect: "全問正解！",
    yourAnswer: "あなたの回答:",
    correctAnswerLabel: "正解:",
    typeMulti: "複数選択",
    typeFill: "記述式",
    typeSingle: "単一選択",
    playAgain: "もう一度",
    chooseOtherSubject: "他の科目を選ぶ",
    confirmExit: "まだ全問回答していません。今終了すると回答内容は保存されません。テストを終了しますか？",
    retry: "再試行",
    loadIndexError: "科目一覧の読み込みに失敗しました。インターネット接続を確認してもう一度お試しください。",
    loadSubjectError: "この科目のデータの読み込みに失敗しました。もう一度お試しください。",
    backLabel: "戻る",
    startQuizNow: "テストを始める",
  },
};

let uiLang = localStorage.getItem("uiLang") || "th";

function t(key, ...args) {
  const entry = (STRINGS[uiLang] && STRINGS[uiLang][key]) ?? STRINGS.th[key];
  return typeof entry === "function" ? entry(...args) : entry;
}

function applyStaticI18n() {
  document.documentElement.lang = uiLang === "th" ? "th" : "ja";
  const map = {
    "btn-lang": uiLang === "th" ? "ไทย/日本語" : "日本語/ไทย",
    "btn-exit-quiz-label": t("exit"),
    "btn-submit-all-label": t("viewResult"),
    "result-title": t("resultTitle"),
    "review-title": t("wrongListTitle"),
    "btn-play-again": t("playAgain"),
    "btn-choose-other-subject": t("chooseOtherSubject"),
    "btn-back-review-label": t("backLabel"),
    "btn-start-quiz-label": t("startQuizNow"),
  };
  Object.entries(map).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });
}

function toggleLang() {
  uiLang = uiLang === "th" ? "ja" : "th";
  localStorage.setItem("uiLang", uiLang);
  applyStaticI18n();
  // Question/option text no longer switches with the UI language -- it's
  // always shown in Japanese during the quiz itself, with a Thai
  // translation revealed in the feedback box after answering (see
  // answers.js). So we must NOT re-render the question list here: that
  // would wipe out disabled buttons / marked answers / progress mid-quiz.
  // Only screens with no per-question answer state are safe to refresh.
  const quizVisible = document.getElementById("quiz-screen").style.display === "block";
  const resultVisible = document.getElementById("result-screen").style.display === "block";
  const reviewVisible = document.getElementById("review-screen").style.display === "block";
  if (quizVisible) {
    updateProgress();
  } else if (resultVisible) {
    showResult();
  } else if (reviewVisible) {
    renderReviewScreen(reviewSubject);
  } else if (currentTerm) {
    renderSubjectList(currentTerm);
  } else if (allData) {
    renderTermList();
  }
}
