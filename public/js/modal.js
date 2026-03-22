// modal.js - 単語追加・編集モーダル

let editId = null;

function openAdd(id = null) {
  editId = id;
  document.getElementById('modalTitle').textContent = id ? '単語を編集' : '単語を追加';
  const w = id ? words.find(x => x.id === id) : null;
  document.getElementById('fw').value = w?.word || '';
  document.getElementById('fl').value = w?.lang || 'en';
  document.getElementById('fd').value = w?.deck || '';
  document.getElementById('fmemo').value = w?.memo || '';
  document.getElementById('ffuri').value = w?.furigana || '';
  setupTransFields(w?.lang || 'en', w);
  fillAllDecks();
  document.getElementById('addModal').classList.add('open');
}

function closeAdd() {
  document.getElementById('addModal').classList.remove('open');
  editId = null;
}

function setupTransFields(lang, w = null) {
  const isJa = lang === 'ja';
  document.getElementById('furiGroup').style.display = isJa ? 'block' : 'none';
  const tf = document.getElementById('transFields');
  if (isJa) {
    tf.innerHTML = `
      <div class="form-group"><label>英語訳</label><input type="text" id="fen" placeholder="English" value="${w?.translations?.en || ''}"></div>
      <div class="form-group"><label>中国語訳</label><input type="text" id="fzh" placeholder="中文" value="${w?.translations?.zh || ''}"></div>`;
  } else {
    tf.innerHTML = `
      <div class="form-group"><label>日本語訳</label><input type="text" id="fja" placeholder="日本語" value="${w?.translations?.ja || ''}"></div>
      <div class="form-group"><label>中国語訳</label><input type="text" id="fzh" placeholder="中文" value="${w?.translations?.zh || ''}"></div>`;
  }
}

async function saveWord() {
  const word = document.getElementById('fw').value.trim();
  if (!word) { showToast('単語を入力してください'); return; }
  const lang = document.getElementById('fl').value;
  const deck = document.getElementById('fd').value.trim() || 'デフォルト';
  const memo = document.getElementById('fmemo').value.trim();
  const furigana = lang === 'ja' ? document.getElementById('ffuri').value.trim() : '';
  const translations = {};
  if (lang === 'ja') {
    const en = document.getElementById('fen')?.value.trim(); if (en) translations.en = en;
    const zh = document.getElementById('fzh')?.value.trim(); if (zh) translations.zh = zh;
  } else {
    const ja = document.getElementById('fja')?.value.trim(); if (ja) translations.ja = ja;
    const zh = document.getElementById('fzh')?.value.trim(); if (zh) translations.zh = zh;
  }

  const btn = document.getElementById('saveBtn');
  btn.textContent = '保存中...'; btn.disabled = true;

  const imgQ = lang === 'ja' ? (translations.en || word) : word;
  const imageUrl = await getImg(imgQ);

  const isNew = !editId;
  if (editId) {
    const i = words.findIndex(x => x.id === editId);
    words[i] = { ...words[i], word, lang, deck, memo, furigana, translations, imageUrl: imageUrl || words[i].imageUrl };
  } else {
    words.push({ id: uid(), word, lang, deck, memo, furigana, translations, imageUrl, stats: { c: 0, t: 0 } });
  }

  const savedWord = isNew ? words[words.length - 1] : words.find(x => x.id === editId);
  save(); fillAllDecks(); closeAdd();
  btn.textContent = '保存'; btn.disabled = false;
  showToast(editId ? '更新しました' : '追加しました');

  if (document.getElementById('page-words').classList.contains('active')) renderList();

  // 学習画面が開いていたら即座にキューに追加して表示
  if (document.getElementById('page-study').classList.contains('active')) {
    if (isNew && savedWord) {
      studyQ.push(savedWord);
      sIdx = studyQ.length - 1;
      renderCard();
    } else {
      const qi = studyQ.findIndex(x => x.id === editId);
      if (qi >= 0) studyQ[qi] = { ...savedWord };
      renderCard();
    }
  }
}
