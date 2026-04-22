// functions/api/translate.js
// Cloudflare Pages Functions - 翻訳APIプロキシ（Gemini使用）

export async function onRequestPost(context) {
  const { text, from, to } = await context.request.json();

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (!text || !from || !to) {
    return new Response(JSON.stringify({ error: 'invalid params' }), { status: 400, headers });
  }

  const geminiKey = context.env.GEMINI_API_KEY || 'AIzaSyCQgbSrfbErDvoGT-0-yKAsgs9j_mQhAXs';
  const langNames = { en: 'English', ja: 'Japanese', zh: 'Chinese' };
  let prompt;
  if (to === 'hira') {
    prompt = `Convert the following Japanese word to hiragana reading (furigana). Output ONLY the hiragana, no kanji, no katakana, no explanations, no punctuation:\n\n${text}`;
  } else {
    prompt = `Translate the following ${langNames[from] || from} text to ${langNames[to] || to}. Output ONLY the translated text with absolutely no explanations, notes, or additional content:\n\n${text}`;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      }
    );
    const data = await res.json();
    const translation = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (translation) {
      return new Response(JSON.stringify({ translation }), { headers });
    }
  } catch (e) {}

  // ひらがな変換はGoogle Translateでは対応不可
  if (to === 'hira') {
    return new Response(JSON.stringify({ translation: '' }), { headers });
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
