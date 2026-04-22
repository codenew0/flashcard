// image.js - 画像取得（Cloudflare Worker経由でAPIキーを隠す）

// Cloudflare Worker 経由で画像URLを取得
async function getImg(word, skip = 0) {
  try {
    const res = await fetch(`/api/image?q=${encodeURIComponent(word)}&skip=${skip}`);
    const data = await res.json();
    if (data.url) return { url: data.url, total: data.total || 1 };
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
    const skip = w.imageSkip || 0;
    return `<div class="fc-img-box">
      <img src="${w.imageUrl}" alt="${w.word}"
        onerror="this.parentNode.innerHTML=noImgHtml('${w.id}','${w.word}')">
      <button class="next-img-btn" onclick="event.stopPropagation();nextImage('${w.id}')" title="次の画像">&#8635;</button>
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
  const imgQ = w.lang === 'ja' ? (w.translations?.en || w.word) : (w.lang === 'zh' ? (w.translations?.en || w.word) : w.word);
  const result = await getImg(imgQ, 0);
  if (result?.url) {
    w.imageUrl = result.url;
    w.imageSkip = 0;
    save();
    if (studyQ[sIdx]?.id === wordId) { studyQ[sIdx].imageUrl = result.url; renderCard(); }
    showToast('画像を取得しました');
  } else {
    if (btn) { btn.textContent = '再取得'; btn.disabled = false; }
    showToast('画像の取得に失敗しました');
  }
}

// 次の画像に変更
async function nextImage(wordId) {
  const w = words.find(x => x.id === wordId);
  if (!w) return;
  const nextSkip = ((w.imageSkip || 0) + 1) % 10;
  showToast('画像を変更中...');
  const imgQ = w.lang === 'ja' ? (w.translations?.en || w.word) : (w.lang === 'zh' ? (w.translations?.en || w.word) : w.word);
  const result = await getImg(imgQ, nextSkip);
  if (result?.url) {
    w.imageUrl = result.url;
    w.imageSkip = nextSkip;
    save();
    if (studyQ[sIdx]?.id === wordId) { studyQ[sIdx].imageUrl = result.url; studyQ[sIdx].imageSkip = nextSkip; renderCard(); }
    showToast('画像を変更しました');
  } else {
    // スキップが範囲外ならリセット
    const result0 = await getImg(imgQ, 0);
    if (result0?.url) {
      w.imageUrl = result0.url;
      w.imageSkip = 0;
      save();
      if (studyQ[sIdx]?.id === wordId) { studyQ[sIdx].imageUrl = result0.url; studyQ[sIdx].imageSkip = 0; renderCard(); }
      showToast('最初の画像に戻りました');
    } else {
      showToast('画像の取得に失敗しました');
    }
  }
}
