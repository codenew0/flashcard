// functions/api/translate.js
// Cloudflare Pages Functions - 翻訳APIプロキシ
// APIキーは Cloudflare の環境変数に保存するので、フロントに露出しない

export async function onRequestPost(context) {
  const { text, from, to } = await context.request.json();

  // CORS ヘッダー
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (!text || !from || !to) {
    return new Response(JSON.stringify({ error: 'invalid params' }), { status: 400, headers });
  }

  // DeepL API（環境変数 DEEPL_API_KEY に設定）
  const deepLKey = context.env.DEEPL_API_KEY;
  if (deepLKey) {
    try {
      const dlLang = { en: 'EN', ja: 'JA', zh: 'ZH' };
      const res = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `auth_key=${deepLKey}&text=${encodeURIComponent(text)}&source_lang=${(dlLang[from] || from).toUpperCase()}&target_lang=${(dlLang[to] || to).toUpperCase()}`
      });
      const data = await res.json();
      if (data.translations?.[0]?.text) {
        return new Response(JSON.stringify({ translation: data.translations[0].text }), { headers });
      }
    } catch (e) {}
  }

  // フォールバック: Google Translate 非公式エンドポイント
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    if (data?.[0]) {
      const translation = data[0].map(x => x?.[0]).filter(Boolean).join('');
      return new Response(JSON.stringify({ translation }), { headers });
    }
  } catch (e) {}

  return new Response(JSON.stringify({ translation: '' }), { headers });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
