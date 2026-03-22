// app.js - ナビゲーションと初期化

function nav(p) {
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
  document.getElementById('page-' + p).classList.add('active');
  const map = { study: 0, quiz: 1, words: 2, stats: 3, io: 4 };
  document.querySelectorAll('.nav-item')[map[p]]?.classList.add('active');
  if (p === 'study') initStudy();
  if (p === 'words') renderList();
  if (p === 'stats') renderStats();
  if (p === 'quiz') fillDecks('quizDeck');
}

// 初期サンプルデータ
if (words.length === 0) {
  words = [
    { id: uid(), word: 'apple', lang: 'en', deck: '食べ物', memo: 'a red fruit', furigana: '',
      translations: { ja: 'りんご', zh: '苹果' },
      imageUrl: 'https://cdn.pixabay.com/photo/2017/09/26/13/21/apples-2788599_640.jpg',
      stats: { c: 0, t: 0 } },
    { id: uid(), word: 'りんご', lang: 'ja', deck: '食べ物', memo: '', furigana: 'りんご',
      translations: { en: 'apple', zh: '苹果' },
      imageUrl: 'https://cdn.pixabay.com/photo/2017/09/26/13/21/apples-2788599_640.jpg',
      stats: { c: 0, t: 0 } },
    { id: uid(), word: 'ocean', lang: 'en', deck: '自然', memo: 'large body of salt water', furigana: '',
      translations: { ja: '海', zh: '海洋' },
      imageUrl: 'https://cdn.pixabay.com/photo/2020/04/02/22/09/ocean-4996156_640.jpg',
      stats: { c: 0, t: 0 } },
    { id: uid(), word: '山', lang: 'ja', deck: '自然', memo: '', furigana: 'やま',
      translations: { en: 'mountain', zh: '山' },
      imageUrl: 'https://cdn.pixabay.com/photo/2016/11/08/05/18/mountains-1807524_640.jpg',
      stats: { c: 0, t: 0 } },
  ];
  save();
  fillAllDecks();
}

fillAllDecks();
initStudy();
