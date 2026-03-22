// translate.js - 翻訳APIの呼び出し（Cloudflare Worker経由でAPIキーを隠す）

let transTimer = null;

// 自動言語検出: 日本語文字が含まれていればja、それ以外はen
function detectLang(text) {
  return /[\u3000-\u9fff\uff00-\uffef]/.test(text) ? 'ja' : 'en';
}

// Cloudflare Worker のエンドポイント経由で翻訳
async function trans(text, from, to) {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, from, to })
    });
    const data = await res.json();
    if (data.translation) return data.translation;
  } catch (e) {
    console.warn('translate error', e);
  }
  return '';
}

function schedTrans() {
  clearTimeout(transTimer);
  transTimer = setTimeout(autoTrans, 700);
}

function onWordInput() {
  const word = document.getElementById('fw').value.trim();
  if (!word) return;
  const detected = detectLang(word);
  const langEl = document.getElementById('fl');
  if (langEl.value !== detected) {
    langEl.value = detected;
    setupTransFields(detected);
  }
  schedTrans();
}

function onLangChange() {
  setupTransFields(document.getElementById('fl').value);
  schedTrans();
}

async function autoTrans() {
  const word = document.getElementById('fw').value.trim();
  const lang = document.getElementById('fl').value;
  if (!word) return;
  document.getElementById('transSpin').style.display = 'inline-block';
  if (lang === 'ja') {
    const [en, zh] = await Promise.all([trans(word, 'ja', 'en'), trans(word, 'ja', 'zh')]);
    const e = document.getElementById('fen'), z = document.getElementById('fzh');
    if (e && !e.value) e.value = en;
    if (z && !z.value) z.value = zh;
  } else {
    const [ja, zh] = await Promise.all([trans(word, 'en', 'ja'), trans(word, 'en', 'zh')]);
    const j = document.getElementById('fja'), z = document.getElementById('fzh');
    if (j && !j.value) j.value = ja;
    if (z && !z.value) z.value = zh;
  }
  document.getElementById('transSpin').style.display = 'none';
}
