// words.js - 単語一覧

function renderList() {
  fillAllDecks();
  const q = document.getElementById('searchQ').value.toLowerCase();
  const lf = document.getElementById('fLang').value;
  const df = document.getElementById('fDeck').value;
  let list = words.filter(w => {
    const mq = !q || w.word.toLowerCase().includes(q) ||
      Object.values(w.translations || {}).some(v => v.toLowerCase().includes(q));
    const ml = lf === 'all' || w.lang === lf;
    const md = df === 'all' || (w.deck || 'デフォルト') === df;
    return mq && ml && md;
  });

  const tbody = document.getElementById('wordTbody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:2rem;">見つかりません</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(w => {
    const rate = w.stats?.t > 0 ? Math.round(w.stats.c / w.stats.t * 100) : null;
    const tr = Object.entries(w.translations || {}).map(([k, v]) =>
      `<span class="badge badge-${k}">${v}</span>`).join('');
    const imgThumb = w.imageUrl
      ? `<img src="${w.imageUrl}" style="width:36px;height:36px;object-fit:cover;border-radius:4px;margin-right:8px;vertical-align:middle;" onerror="this.style.display='none'">`
      : '';
    return `<tr>
      <td><div style="display:flex;align-items:center;">${imgThumb}<div>
        <div style="font-weight:500;">${w.word}</div>
        ${w.furigana ? `<div style="font-size:11px;color:var(--accent);">${w.furigana}</div>` : ''}
        ${w.memo ? `<div style="font-size:11px;color:var(--text3);">${w.memo}</div>` : ''}
      </div></div></td>
      <td><span class="badge badge-${w.lang}">${w.lang === 'ja' ? '日本語' : 'English'}</span></td>
      <td style="font-size:13px;color:var(--text2);">${w.deck || 'デフォルト'}</td>
      <td>${tr}</td>
      <td>${rate !== null
        ? `<div>${rate}%</div><div class="prog-bar" style="width:60px;"><div class="prog-fill" style="width:${rate}%"></div></div>`
        : '<span style="color:var(--text3);">未学習</span>'}</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-sm" onclick="openAdd('${w.id}')" style="margin-right:4px;">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="delWord('${w.id}')">🗑</button>
      </td>
    </tr>`;
  }).join('');
}

function delWord(id) {
  if (!confirm('削除しますか？')) return;
  words = words.filter(w => w.id !== id);
  save();
  renderList();
  showToast('削除しました');
}

function renderStats() {
  const total = words.length;
  const studied = words.filter(w => w.stats?.t > 0).length;
  const tq = words.reduce((a, w) => a + (w.stats?.t || 0), 0);
  const tc = words.reduce((a, w) => a + (w.stats?.c || 0), 0);
  const ov = tq > 0 ? Math.round(tc / tq * 100) : 0;
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card"><div class="stat-val">${total}</div><div class="stat-lbl">総単語数</div></div>
    <div class="stat-card"><div class="stat-val">${studied}</div><div class="stat-lbl">学習済み</div></div>
    <div class="stat-card"><div class="stat-val">${tq}</div><div class="stat-lbl">総回答数</div></div>
    <div class="stat-card"><div class="stat-val">${ov}%</div><div class="stat-lbl">全体正答率</div></div>`;
  const decks = getDecks();
  document.getElementById('deckProg').innerHTML = decks.map(d => {
    const dw = words.filter(w => (w.deck || 'デフォルト') === d);
    const ds = dw.filter(w => w.stats?.t > 0).length;
    const p = Math.round(ds / dw.length * 100);
    return `<div style="margin-bottom:1rem;">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px;">
        <span>${d}</span><span style="color:var(--text2);">${ds}/${dw.length}</span>
      </div>
      <div class="prog-bar"><div class="prog-fill" style="width:${p}%"></div></div>
    </div>`;
  }).join('') || '<div style="color:var(--text3);font-size:13px;">デッキなし</div>';
}
