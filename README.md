# 語学フラッシュカード

単語を登録すると画像・翻訳が自動で追加される語学学習アプリ。
Cloudflare Pages でホスティング、APIキーはサーバー側に隠蔽。

🌐 **公開URL**: https://flashcard-f1b.pages.dev

---

## 機能

- 📖 フラッシュカード学習（画像付き・カードめくりアニメーション）
- 🎯 4択クイズモード
- 🌐 日本語・英語・中国語の自動検出＆翻訳（Gemini使用）
- 🖼 画像の差し替え機能（ボタン一つで別の画像に変更可能）
- 🈳 日本語ふりがな対応
- 📁 デッキ（カテゴリ）管理
- 📊 学習統計・正答率トラッキング
- 📦 JSON / CSV インポート・エクスポート
- 📱 スマホ対応（下部タブバー）
- 💾 データはブラウザの localStorage に自動保存

---

## ファイル構成

```
flashcard/
├── public/                   ← フロントエンド
│   ├── index.html            ← メインHTML
│   ├── css/
│   │   └── style.css         ← スタイル（レスポンシブ対応）
│   └── js/
│       ├── app.js            ← ナビゲーション・初期化
│       ├── storage.js        ← localStorage管理
│       ├── translate.js      ← 翻訳API呼び出し
│       ├── image.js          ← 画像取得・差し替え
│       ├── study.js          ← フラッシュカード学習
│       ├── quiz.js           ← クイズモード
│       ├── words.js          ← 単語一覧・統計
│       ├── modal.js          ← 単語追加・編集
│       └── io.js             ← インポート・エクスポート
├── functions/                ← Cloudflare Pages Functions
│   └── api/
│       ├── translate.js      ← Gemini翻訳プロキシ（APIキー隠蔽）
│       └── image.js          ← Pixabay画像プロキシ（APIキー隠蔽）
├── .dev.vars                 ← ローカル用APIキー（Gitにアップしない）
├── .gitignore
├── package.json
├── LICENSE
└── README.md
```

---

## 対応言語

| 言語 | コード | 自動検出 |
|------|--------|----------|
| 英語 | `en` | それ以外 |
| 日本語 | `ja` | ひらがな・カタカナ含む |
| 中国語 | `zh` | 漢字のみ（かな文字なし） |

単語を入力すると、選択した言語から残り2言語へ自動翻訳されます。

---

## ローカル開発

### 必要なもの
- [Node.js](https://nodejs.org) LTS版

### セットアップ

```bash
# 依存パッケージのインストール
npm install

# .dev.vars にAPIキーを設定（.gitignoreに含まれるので安全）
PIXABAY_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here

# 開発サーバー起動
npm run dev
```

→ http://localhost:8788 で開く

---

## デプロイ（Cloudflare Pages）

### 初回設定

1. [Cloudflare](https://cloudflare.com) でアカウント作成（無料）
2. 「Workers & Pages」→「Create」→「Pages」→「Connect to Git」
3. このリポジトリを選択
4. ビルド設定:
   - **Framework preset**: None
   - **Build command**: （空欄）
   - **Build output directory**: `public`
5. 「Settings」→「Environment variables」に追加:
   - `PIXABAY_API_KEY` = Pixabayのキー
   - `GEMINI_API_KEY` = Google Gemini のキー

### 更新デプロイ

```bash
git add .
git commit -m "変更内容"
git push
```

→ git push するたびに Cloudflare が自動デプロイ

---

## APIキーの取得

| API | 用途 | 取得先 | 料金 |
|-----|------|--------|------|
| Pixabay | 画像検索 | https://pixabay.com/api/docs/ | 無料 |
| Gemini | 翻訳（スラング・ネット用語にも強い） | https://aistudio.google.com/app/apikey | 無料枠あり |

> APIキーは `.dev.vars`（ローカル）と Cloudflare の環境変数（本番）にのみ保存。
> フロントエンドのJSには一切含まれない。

---

## データ保存について

現在は **localStorage**（ブラウザ内）に保存しています。

- 同じブラウザ内でのみデータが保持される
- キャッシュ削除で消える可能性あり
- 上限は約5MB（約12,000単語相当）
- デバイス間の同期が必要な場合は「インポート/エクスポート」機能を使う

---

## License

[MIT](LICENSE)
