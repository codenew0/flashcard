// image.js - 画像取得（Cloudflare Worker経由でAPIキーを隠す）

// Cloudflare Worker 経由で画像URLを取得
async function getImg(word) {
  try {
    const res = await fetch(`/api/image?q=${encodeURIComponent(word)}`);
    const data = await res.json();
    if (data.url) return data.url;
  } catch (e) {
    console.warn('image fetch error', e);
  }
  return null;
}

// 画像なし時のプレースホルダーHTML
function noImgHtml(id, word) {
  return `<div class="img-placeholder">
    <div class="ph-word">${word}</div>
    <div class="ph-hint">画像なし</div>
    <button class="retry-img-btn" id="retry-${id}" onclick="event.stopPropagation();retryImage('${id}')">画像を取得</button>
  </div>`;
}

// 画像ボックスのHTML生成
function imgBoxHtml(w) {
  if (w.imageUrl) {
    return `<div class="fc-img-box">
      <img src="${w.imageUrl}" alt="${w.word}"
        onerror="this.parentNode.innerHTML=noImgHtml('${w.id}','${w.word}')">
    </div>`;
  }
  return `<div class="fc-img-box">${noImgHtml(w.id, w.word)}</div>`;
}

// 画像の再取得
async function retryImage(wordId) {
  const w = words.find(x => x.id === wordId);
  if (!w) return;
  const btn = document.getElementById('retry-' + wordId);
  if (btn) { btn.textContent = '取得中...'; btn.disabled = true; }
  const imgQ = w.lang === 'ja' ? (w.translations?.en || w.word) : w.word;
  const url = await getImg(imgQ);
  if (url) {
    w.imageUrl = url;
    save();
    if (studyQ[sIdx]?.id === wordId) { studyQ[sIdx].imageUrl = url; renderCard(); }
    showToast('画像を取得しました');
  } else {
    if (btn) { btn.textContent = '再取得'; btn.disabled = false; }
    showToast('画像の取得に失敗しました');
  }
}
