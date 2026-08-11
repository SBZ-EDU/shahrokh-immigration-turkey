export interface Env {
  DB?: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const DB = context.env.DB;
  if (!DB) {
    return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json", "X-Shahrokh-Fallback": "no-db" } });
  }
  try {
    const { results } = await DB.prepare("SELECT * FROM posts ORDER BY createdAt DESC").all();
    return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json", "X-Error": e.message } });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const DB = context.env.DB;
  if (!DB) {
    // Fallback: just return ok, client will use IndexedDB
    return new Response(JSON.stringify({ ok: true, fallback: true }), { headers: { "Content-Type": "application/json" } });
  }
  const post = await context.request.json() as any;
  try {
    await DB.prepare(
      `INSERT INTO posts (id, title, slug, excerpt, content, coverImage, status, authorId, authorName, createdAt, updatedAt, category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET title=excluded.title, slug=excluded.slug, excerpt=excluded.excerpt, content=excluded.content, coverImage=excluded.coverImage, status=excluded.status, updatedAt=excluded.updatedAt, category=excluded.category`
    ).bind(post.id, post.title, post.slug, post.excerpt, post.content, post.coverImage || null, post.status, post.authorId, post.authorName, post.createdAt, post.updatedAt, post.category || null).run();
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const DB = context.env.DB;
  if (!DB) return new Response(JSON.stringify({ ok: true, fallback: true }));
  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');
  if (!id) return new Response('Missing id', { status: 400 });
  await DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
  return new Response(JSON.stringify({ ok: true }));
};
