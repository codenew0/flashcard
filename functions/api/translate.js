// functions/api/translate.js
// Cloudflare Pages Functions - 翻訳APIプロキシ（Gemini使用）
// 単一翻訳: { text, from, to } → { translation }
// バッチ翻訳: { text, from, to: [...] } → { translations: { lang: text } }

export async function onRequestPost(context) {
  const { text, from, to } = await context.request.json();

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (!text || !from || !to) {
    return new Response(JSON.stringify({ error: 'invalid params' }), { status: 400, headers });
  }

  const geminiKey = context.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not set' }), { status: 500, headers });
  }

  const langNames = { en: 'English', ja: 'Japanese', zh: 'Chinese' };
  const isMulti = Array.isArray(to);

  // プロンプト生成
  let prompt;
  let useJsonMode = false;
  if (isMulti) {
    useJsonMode = true;
    const keyDescs = to.map(t => {
      if (t === 'hira') return `  "hira": "hiragana reading only, no kanji, no katakana"`;
      return `  "${t}": "${langNames[t] || t} translation"`;
    }).join(',\n');
    prompt = `Translate the following ${langNames[from] || from} word. Respond with ONLY a valid JSON object in this exact shape (no markdown, no code block, no explanation):\n{\n${keyDescs}\n}\n\nWord: ${text}`;
  } else if (to === 'hira') {
    prompt = `Convert the following Japanese word to hiragana reading (furigana). Output ONLY the hiragana, no kanji, no katakana, no explanations, no punctuation:\n\n${text}`;
  } else {
    prompt = `Translate the following ${langNames[from] || from} text to ${langNames[to] || to}. Output ONLY the translated text with absolutely no explanations, notes, or additional content:\n\n${text}`;
  }

  // Gemini呼び出し
  let geminiText = '';
  try {
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 }
      }
    };
    if (useJsonMode) {
      body.generationConfig.responseMimeType = 'application/json';
    }
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );
    const data = await res.json();
    geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  } catch (e) {}

  // バッチモード: JSONパース
  if (isMulti) {
    const translations = {};
    if (geminiText) {
      try {
        // コードブロック除去
        const cleaned = geminiText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned);
        for (const t of to) {
          if (parsed[t] && typeof parsed[t] === 'string') {
            translations[t] = parsed[t].trim();
          }
        }
      } catch (e) {}
    }
    // Geminiで足りないものはGoogle Translateフォールバック（hira以外）
    for (const t of to) {
      if (!translations[t] && t !== 'hira') {
        translations[t] = await googleTranslate(text, from, t);
      }
    }
    return new Response(JSON.stringify({ translations }), { headers });
  }

  // 単一モード
  if (geminiText) {
    return new Response(JSON.stringify({ translation: geminiText }), { headers });
  }
  if (to === 'hira') {
    return new Response(JSON.stringify({ translation: '' }), { headers });
  }
  const fallback = await googleTranslate(text, from, to);
  return new Response(JSON.stringify({ translation: fallback }), { headers });
}

// フォールバック: Google Translate 非公式エンドポイント
async function googleTranslate(text, from, to) {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    if (data?.[0]) {
      return data[0].map(x => x?.[0]).filter(Boolean).join('');
    }
  } catch (e) {}
  return '';
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
