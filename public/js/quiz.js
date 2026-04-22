// quiz.js - クイズモード

let quizQ = [];
let qIdx = 0;
let qScore = { c: 0, t: 0 };
let qCorrectId = null;

function startQuiz() {
  fillDecks('quizDeck');
  const dv = document.getElementById('quizDeck').value;
  let pool = dv === 'all' ? [...words] : words.filter(w => (w.deck || 'デフォルト') === dv);
  if (pool.length < 4) { showToast('クイズには4単語以上必要です'); return; }
  quizQ = pool.sort(() => Math.random() - 0.5).slice(0, 10);
  qIdx = 0;
  qScore = { c: 0, t: 0 };
  renderQuiz();
}

function renderQuiz() {
  if (qIdx >= quizQ.length) { showQuizEnd(); return; }
  const w = quizQ[qIdx];
  const wrongs = words.filter(x => x.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3);
  const choices = [...wrongs, w].sort(() => Math.random() - 0.5);
  const question = w.lang === 'en' ? (w.translations?.ja || w.word) : (w.translations?.en || w.word);
  const qLabel = w.lang === 'en' ? '日本語の意味は？' : '英語で？';
  const pct = Math.round(qIdx / quizQ.length * 100);
  qCorrectId = w.id;

  document.getElementById('quiz-area').innerHTML = `
    <div style="text-align:center;font-size:12px;color:var(--text3);margin-bottom:4px;">${qIdx + 1} / ${quizQ.length}</div>
    <div class="prog-bar" style="max-width:480px;margin:0 auto 1.5rem;">
      <div class="prog-fill" style="width:${pct}%"></div>
    </div>
    <div style="text-align:center;font-size:13px;color:var(--text3);">${qLabel}</div>
    <div class="quiz-q">${esc(question)}</div>
    <div class="quiz-furi">${w.furigana && w.lang === 'ja' ? esc(w.furigana) : ''}</div>
    <div class="quiz-grid">
      ${choices.map(c => `<div class="qc" data-id="${esc(c.id)}" onclick="ansQ(this)">${esc(c.word)}</div>`).join('')}
    </div>`;
}

function ansQ(el) {
  const chosen = el.getAttribute('data-id');
  document.querySelectorAll('.qc').forEach(c => { c.style.pointerEvents = 'none'; });
  qScore.t++;
  if (chosen === qCorrectId) { el.classList.add('correct'); qScore.c++; }
  else {
    el.classList.add('wrong');
    document.querySelectorAll('.qc').forEach(c => {
      if (c.getAttribute('data-id') === qCorrectId) c.classList.add('correct');
    });
  }
  const wo = words.find(x => x.id === qCorrectId);
  if (wo) {
    wo.stats = wo.stats || { c: 0, t: 0 };
    wo.stats.t++;
    if (chosen === qCorrectId) wo.stats.c++;
    save();
  }
  setTimeout(() => { qIdx++; renderQuiz(); }, 1100);
}

function showQuizEnd() {
  const pct = Math.round(qScore.c / qScore.t * 100);
  const e = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚';
  document.getElementById('quiz-area').innerHTML = `
    <div style="text-align:center;padding:3rem;">
      <div style="font-size:3rem;margin-bottom:1rem;">${e}</div>
      <div style="font-family:'Shippori Mincho',serif;font-size:2.2rem;margin-bottom:0.5rem;">${qScore.c} / ${qScore.t}</div>
      <div style="font-size:1.2rem;color:var(--accent);margin-bottom:2rem;">${pct}% 正解</div>
      <button class="btn btn-primary" onclick="startQuiz()">もう一度</button>
    </div>`;
}
