// functions/api/image.js
// Cloudflare Pages Functions - Pixabay画像プロキシ
// APIキーは Cloudflare の環境変数 PIXABAY_API_KEY に保存

export async function onRequestGet(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  const url = new URL(context.request.url);
  const q = url.searchParams.get('q');
  const skip = parseInt(url.searchParams.get('skip') || '0', 10);

  if (!q) {
    return new Response(JSON.stringify({ url: null }), { status: 400, headers });
  }

  const key = context.env.PIXABAY_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: 'PIXABAY_API_KEY not set' }), { status: 500, headers });
  }

  try {
    const res = await fetch(
      `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(q)}&image_type=photo&per_page=10&safesearch=true&lang=en`
    );
    const data = await res.json();
    const idx = Math.max(0, Math.min(skip, (data.hits?.length || 1) - 1));
    const imageUrl = data.hits?.[idx]?.webformatURL || null;
    return new Response(JSON.stringify({ url: imageUrl, total: data.hits?.length || 0 }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ url: null, error: e.message }), { headers });
  }
}
