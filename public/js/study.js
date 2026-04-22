// study.js - フラッシュカード学習

let studyQ = [];
let sIdx = 0;

function initStudy() {
  fillDecks('studyDeck');
  const dv = document.getElementById('studyDeck').value;
  let pool = dv === 'all' ? [...words] : words.filter(w => (w.deck || 'デフォルト') === dv);
  if (!pool.length) {
    document.getElementById('study-area').innerHTML =
      '<div style="text-align:center;color:var(--text3);padding:4rem;">単語を追加してください</div>';
    return;
  }
  studyQ = pool.sort(() => Math.random() - 0.5);
  sIdx = 0;
  renderCard();
}

function renderCard() {
  if (!studyQ.length) return;
  const w = studyQ[sIdx];
  const rate = w.stats.t > 0 ? Math.round(w.stats.c / w.stats.t * 100) : null;
  const backTrans = Object.entries(w.translations || {}).map(([k, v]) => `
    <div class="fc-trans-row">
      <div class="fc-trans-lang">${k === 'en' ? '🇺🇸 English' : k === 'ja' ? '🇯🇵 日本語' : '🇨🇳 中文'}</div>
      <div class="fc-trans-val ${k === 'ja' ? 'ja' : ''}">${esc(v)}</div>
    </div>`).join('');

  document.getElementById('study-area').innerHTML = `
    <div class="fc-scene">
      <div class="fc" id="fc" onclick="flipCard()">
        <div class="fc-face">
          ${imgBoxHtml(w)}
          ${w.furigana ? `<div class="fc-furi">${esc(w.furigana)}</div>` : ''}
          <div class="fc-word">${esc(w.word)}</div>
          ${w.deck ? `<div class="fc-badge-row"><span class="badge badge-${esc(w.lang)}">${esc(w.deck)}</span></div>` : ''}
          <div class="fc-hint">タップして翻訳を見る</div>
        </div>
        <div class="fc-face fc-back">
          <div>${backTrans || '<div style="color:var(--text3)">翻訳なし</div>'}</div>
          ${w.memo ? `<div style="font-size:12px;color:var(--text3);margin-top:1rem;">💬 ${esc(w.memo)}</div>` : ''}
        </div>
      </div>
    </div>
    <div class="rating-btns" id="ratingBtns" style="display:none;">
      <button class="rb rb-hard" onclick="rate(false)">難しい 😓</button>
      <button class="rb rb-easy" onclick="rate(true)">わかった ✓</button>
    </div>
    <div class="study-meta">${sIdx + 1} / ${studyQ.length}${rate !== null ? ' | 正答率 ' + rate + '%' : ''}</div>
    <div class="study-nav">
      <button class="btn btn-sm" onclick="sIdx=(sIdx-1+studyQ.length)%studyQ.length;renderCard()">← 前</button>
      <button class="btn btn-sm btn-primary" onclick="sIdx=(sIdx+1)%studyQ.length;renderCard()">次 →</button>
    </div>`;
}

function flipCard() {
  document.getElementById('fc').classList.toggle('flipped');
  const rb = document.getElementById('ratingBtns');
  if (rb) rb.style.display = 'flex';
}

function rate(correct) {
  const w = studyQ[sIdx];
  w.stats.t++;
  if (correct) w.stats.c++;
  const o = words.find(x => x.id === w.id);
  if (o) { o.stats = w.stats; save(); }
  sIdx = (sIdx + 1) % studyQ.length;
  renderCard();
}
