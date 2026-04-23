// translate.js - 翻訳APIの呼び出し（Cloudflare Worker経由でAPIキーを隠す）

let transTimer = null;
let lastTranslatedWord = '';

// 自動言語検出: ひらがな/カタカナがあればja、漢字のみならzh、それ以外はen
function detectLang(text) {
  if (/[\u3040-\u30ff]/.test(text)) return 'ja';
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
  return 'en';
}

// 翻訳フィールドをクリア
function clearTransFields() {
  const ids = ['fen', 'fja', 'fzh', 'ffuri'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

// 単一翻訳
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

// バッチ翻訳（1回のAPI呼び出しで複数言語取得）
async function transMulti(text, from, targets) {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, from, to: targets })
    });
    const data = await res.json();
    return data.translations || {};
  } catch (e) {
    console.warn('translate error', e);
  }
  return {};
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

  let targets;
  if (lang === 'ja') targets = ['en', 'zh', 'hira'];
  else if (lang === 'zh') targets = ['en', 'ja'];
  else targets = ['ja', 'zh'];

  const result = await transMulti(word, lang, targets);

  const map = { en: 'fen', ja: 'fja', zh: 'fzh', hira: 'ffuri' };
  for (const t of targets) {
    const el = document.getElementById(map[t]);
    if (el && result[t]) el.value = result[t];
  }

  lastTranslatedWord = word;
  document.getElementById('transSpin').style.display = 'none';
}
