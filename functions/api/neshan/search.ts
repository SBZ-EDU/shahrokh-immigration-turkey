export interface Env { NESHAN_API_KEY?: string; }
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url);
  const term = url.searchParams.get('term') || 'restaurant';
  const lat = url.searchParams.get('lat') || '35.74';
  const lng = url.searchParams.get('lng') || '51.30';
  const key = ctx.env.NESHAN_API_KEY || '';
  if (!key) return new Response(JSON.stringify({ items: [], mock: true }), { headers: { "Content-Type": "application/json" } });
  try {
    const res = await fetch(`https://api.neshan.org/v1/search?term=${encodeURIComponent(term)}&lat=${lat}&lng=${lng}`, { headers: { 'Api-Key': key } });
    const data: any = await res.json();
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
