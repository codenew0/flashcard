// translate.js - 翻訳APIの呼び出し（Cloudflare Worker経由でAPIキーを隠す）

let transTimer = null;
let lastTranslatedWord = '';

// 自動言語検出: ひらがな/カタカナがあればja、漢字のみならzh、それ以外はen
function detectLang(text) {
  if (/[\u3040-\u30ff]/.test(text)) return 'ja'; // ひらがな・カタカナ
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh'; // 漢字のみ → 中国語
  return 'en';
}

// 翻訳フィールドをクリア
function clearTransFields() {
  const ids = ['fen', 'fja', 'fzh'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
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
  const word = document.getElementById('fw').value.trim();
  if (word !== lastTranslatedWord) {
    clearTransFields();
  }
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
  clearTransFields();
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
    if (e) e.value = en;
    if (z) z.value = zh;
  } else if (lang === 'zh') {
    const [en, ja] = await Promise.all([trans(word, 'zh', 'en'), trans(word, 'zh', 'ja')]);
    const e = document.getElementById('fen'), j = document.getElementById('fja');
    if (e) e.value = en;
    if (j) j.value = ja;
  } else {
    const [ja, zh] = await Promise.all([trans(word, 'en', 'ja'), trans(word, 'en', 'zh')]);
    const j = document.getElementById('fja'), z = document.getElementById('fzh');
    if (j) j.value = ja;
    if (z) z.value = zh;
  }
  lastTranslatedWord = word;
  document.getElementById('transSpin').style.display = 'none';
}
