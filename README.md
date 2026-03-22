# 語学フラッシュカード

## ファイル構成

```
flashcard/
├── public/               ← フロントエンド（ブラウザで動くファイル）
│   ├── index.html        ← メインHTML
│   ├── css/
│   │   └── style.css     ← スタイル
│   └── js/
│       ├── app.js        ← ナビゲーション・初期化
│       ├── storage.js    ← localStorage管理
│       ├── translate.js  ← 翻訳API呼び出し
│       ├── image.js      ← 画像取得
│       ├── study.js      ← フラッシュカード学習
│       ├── quiz.js       ← クイズモード
│       ├── words.js      ← 単語一覧・統計
│       ├── modal.js      ← 単語追加・編集
│       └── io.js         ← インポート・エクスポート
├── functions/            ← Cloudflare Workers（APIキーを隠すバックエンド）
│   └── api/
│       ├── translate.js  ← 翻訳プロキシ
│       └── image.js      ← Pixabay画像プロキシ
├── .dev.vars             ← ローカル用APIキー（Gitにアップしない）
├── .gitignore
├── package.json
└── README.md
```

## セットアップ手順

### 1. Node.js のインストール
https://nodejs.org からLTS版をダウンロード・インストール

### 2. 依存パッケージのインストール
```bash
npm install
```

### 3. ローカル開発サーバーの起動
```bash
npm run dev
```
→ http://localhost:8788 で開く

---

## GitHub に公開する手順

### 1. GitHubアカウント作成
https://github.com でアカウント作成

### 2. 新しいリポジトリ作成
GitHub の「New repository」から作成（プライベートでOK）

### 3. コードをアップロード
```bash
git init
git add .
git commit -m "初回コミット"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/flashcard.git
git push -u origin main
```

---

## Cloudflare Pages に公開する手順

### 1. Cloudflareアカウント作成
https://cloudflare.com（無料）

### 2. Pages プロジェクト作成
1. Cloudflare ダッシュボード →「Workers & Pages」
2. 「Create application」→「Pages」→「Connect to Git」
3. GitHubと連携してリポジトリを選択
4. ビルド設定:
   - **Framework preset**: None
   - **Build command**: （空欄）
   - **Build output directory**: `public`

### 3. APIキーを環境変数に設定
1. プロジェクト → 「Settings」→「Environment variables」
2. 以下を追加:
   - `PIXABAY_API_KEY` = （取得した場合）
   - `DEEPL_API_KEY` = （取得した場合）

### 4. デプロイ
設定後、自動でデプロイされる。
以降は `git push` するたびに自動デプロイ。

---

## APIキーについて
- `.dev.vars` はローカル開発専用（`.gitignore` に含まれているのでGitHubに上がらない）
- 本番のAPIキーは Cloudflare ダッシュボードの環境変数に設定する
- フロントエンドのJSファイルにはAPIキーは一切含まれない
