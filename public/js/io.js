// io.js - インポート・エクスポート

function exportJSON() {
  const b = new Blob([JSON.stringify(words, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = 'flashcards.json';
  a.click();
  showToast('JSONをエクスポートしました');
}

function exportCSV() {
  const rows = [['単語', '言語', 'デッキ', '英語訳', '日本語訳', '中国語訳', 'ふりがな', 'メモ']];
  words.forEach(w => rows.push([
    w.word, w.lang, w.deck || '',
    w.translations?.en || '', w.translations?.ja || '', w.translations?.zh || '',
    w.furigana || '', w.memo || ''
  ]));
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const b = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = 'flashcards.csv';
  a.click();
  showToast('CSVをエクスポートしました');
}

function doImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      if (file.name.endsWith('.json')) {
        const d = JSON.parse(ev.target.result);
        if (Array.isArray(d)) {
          words = [...words, ...d.filter(x => x.word && x.lang)];
          save(); fillAllDecks();
          showToast(d.length + '件インポートしました');
        }
      } else {
        const lines = ev.target.result.split('\n');
        let count = 0;
        lines.forEach(line => {
          const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
          if (!cols[0] || cols[0] === '単語') return;
          words.push({
            id: uid(), word: cols[0], lang: cols[1] || 'en', deck: cols[2] || 'インポート',
            translations: { en: cols[3] || '', ja: cols[4] || '', zh: cols[5] || '' },
            furigana: cols[6] || '', memo: cols[7] || '', stats: { c: 0, t: 0 }
          });
          count++;
        });
        save(); fillAllDecks();
        showToast(count + '件インポートしました');
      }
    } catch (err) { showToast('インポートに失敗しました'); }
  };
  reader.readAsText(file);
}
