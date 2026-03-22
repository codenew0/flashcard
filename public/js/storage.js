// storage.js - 単語データの保存・読み込み

let words = JSON.parse(localStorage.getItem('fc_words') || '[]');

function save() {
  try {
    localStorage.setItem('fc_words', JSON.stringify(words));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      alert('保存容量が上限に達しました。不要な単語を削除するか、エクスポートしてください。');
    }
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function getDecks() {
  return [...new Set(words.map(w => w.deck || 'デフォルト'))];
}

function fillDecks(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const v = el.value;
  el.innerHTML = '<option value="all">すべてのデッキ</option>' +
    getDecks().map(d => `<option value="${d}">${d}</option>`).join('');
  if (v) el.value = v;
}

function fillAllDecks() {
  fillDecks('studyDeck');
  fillDecks('quizDeck');
  fillDecks('fDeck');
  const dl = document.getElementById('deckDL');
  if (dl) dl.innerHTML = getDecks().map(d => `<option value="${d}">`).join('');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
