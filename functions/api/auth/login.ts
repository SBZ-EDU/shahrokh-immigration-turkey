export interface Env { DB?: D1Database; }
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { email, password } = await ctx.request.json() as any;
  if (email === 'admin@shahrokh.ir' && password === 'admin123') {
    return new Response(JSON.stringify({ id: 'admin-001', email, name: 'مدیر شاهرخ', role: 'admin' }), { headers: { "Content-Type": "application/json" } });
  }
  if (email.includes('@') && password.length >= 4) {
    return new Response(JSON.stringify({ id: 'user-' + Date.now(), email, name: email.split('@')[0], role: 'user' }), { headers: { "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ error: 'Invalid' }), { status: 401 });
};
