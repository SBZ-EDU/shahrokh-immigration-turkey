import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShahrokhPost, getAllPosts, savePost, deletePost, seedIfEmpty } from '../services/postsService';
import { useLanguage } from '../types';

const AdminPanel: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<ShahrokhPost[]>([]);
  const [editing, setEditing] = useState<ShahrokhPost | null>(null);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', category: 'اقامت', status: 'draft' as 'draft' | 'published', coverImage: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { seedIfEmpty().then(load); }, []);
  const load = async () => setPosts(await getAllPosts());

  const handleEdit = (p: ShahrokhPost) => {
    setEditing(p);
    setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, category: p.category || 'اقامت', status: p.status, coverImage: p.coverImage || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف شود؟')) return;
    await deletePost(id);
    load();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) { setMsg('فقط ادمین'); return; }
    const post: ShahrokhPost = {
      id: editing?.id || 'post-' + Date.now(),
      title: form.title,
      slug: form.slug || form.title.replace(/\s+/g, '-').toLowerCase(),
      excerpt: form.excerpt,
      content: form.content,
      category: form.category,
      status: form.status,
      coverImage: form.coverImage,
      authorId: user?.id || 'admin',
      authorName: user?.name || 'مدیر',
      createdAt: editing?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    await savePost(post);
    setMsg('✓ ذخیره شد');
    setEditing(null);
    setForm({ title: '', slug: '', excerpt: '', content: '', category: 'اقامت', status: 'draft', coverImage: '' });
    load();
    setTimeout(() => setMsg(''), 2000);
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-white">دسترسی ادمین</h2>
        <p className="text-gray-400 mt-2">فقط با admin@shahrokh.ir / admin123 وارد شوید (دمو). در پروداکشن با D1 + Cloudflare Access.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* WP-like header */}
      <div className="bg-[#1d2327] border-b border-black/20 sticky top-0 z-20">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-white text-[#1d2327] w-8 h-8 rounded-full flex items-center justify-center font-bold">W</span>
            <span className="font-bold">پنل ادمین شاهرخ <span className="text-gray-400 text-sm">— مانند وردپرس</span></span>
          </div>
          <span className="text-sm text-gray-300">{user?.name} • {user?.email}</span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-[#23282d] min-h-[calc(100vh-3.5rem)] hidden md:block p-4 sticky top-14">
          <nav className="space-y-1 text-sm">
            <a className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded text-white"><span>📄</span> نوشته‌ها <span className="mr-auto bg-white/20 px-1.5 rounded text-xs">{posts.length}</span></a>
            <a className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded text-gray-300"><span>🖼️</span> رسانه (R2)</a>
            <a className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded text-gray-300"><span>👥</span> کاربران</a>
            <a className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded text-gray-300"><span>⚙️</span> تنظیمات شاهرخ</a>
            <div className="pt-4 border-t border-white/10 mt-4">
              <p className="text-xs text-gray-500 px-3">میانبرها</p>
              <a href="#editor" className="block px-3 py-1.5 text-cyan-300 hover:underline text-xs">+ افزودن نوشته</a>
              <a href="https://dash.cloudflare.com/?accountId=5b456a2b43bb367410c50b35b9e7f71f" target="_blank" className="block px-3 py-1.5 text-cyan-300 hover:underline text-xs">Cloudflare D1 →</a>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 sm:p-6 max-w-5xl">
          {msg && <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-300 px-4 py-2 rounded">{msg}</div>}

          {/* Editor */}
          <section id="editor" className="bg-white rounded-lg shadow text-gray-900 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-lg">{editing ? 'ویرایش نوشته' : 'افزودن نوشته جدید'} <span className="text-gray-400 font-normal text-sm">— مانند وردپرس</span></h2>
              <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded">شاهرخ CMS</span>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="عنوان نوشته — مثلاً: اقامت ملکی ۲۰۰K ۲۰۲۶" className="w-full text-2xl font-bold border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" required />
              <div className="grid sm:grid-cols-2 gap-4">
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="نامک (slug) — turkey-200k" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" dir="ltr" />
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                  <option>اقامت</option><option>تحصیلی</option><option>کاری</option><option>سرمایه‌گذاری</option><option>اخبار</option>
                </select>
              </div>
              <input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="چکیده کوتاه..." className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
              <input value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} placeholder="لینک تصویر شاخص (R2) — مثلاً /istanbul-4k-hero.jpg" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" dir="ltr" />
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="محتوا (Markdown پشتیبانی می‌شود)..." rows={8} className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm" />
              <div className="flex items-center gap-3">
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="border border-gray-300 rounded px-3 py-2 text-sm">
                  <option value="draft">پیش‌نویس</option><option value="published">منتشر شده</option>
                </select>
                <button type="submit" className="bg-[#2271b1] hover:bg-[#135e96] text-white px-6 py-2 rounded font-bold">{editing ? 'به‌روزرسانی' : 'منتشر کن'}</button>
                {editing && <button type="button" onClick={() => { setEditing(null); setForm({ title: '', slug: '', excerpt: '', content: '', category: 'اقامت', status: 'draft', coverImage: '' }); }} className="text-sm text-gray-500">انصراف</button>}
              </div>
            </form>
          </section>

          {/* Posts list */}
          <section className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold">همه نوشته‌ها <span className="font-normal text-gray-500">— {posts.length} مورد</span></h3>
              <span className="text-xs text-gray-500">ذخیره: IndexedDB (local) / D1 (Cloudflare)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr><th className="px-4 py-2">عنوان</th><th className="px-4 py-2">دسته</th><th className="px-4 py-2">وضعیت</th><th className="px-4 py-2">تاریخ</th><th className="px-4 py-2">عملیات</th></tr>
                </thead>
                <tbody>
                  {posts.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3"><div className="font-bold text-gray-900">{p.title}</div><div className="text-xs text-gray-500 font-mono">/{p.slug}</div></td>
                      <td className="px-4 py-3"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">{p.category}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{p.status === 'published' ? 'منتشر' : 'پیش‌نویس'}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString('fa-IR')}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline">ویرایش</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">حذف</button>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">هنوز نوشته‌ای نیست — بالا یکی بساز</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
            💡 این پنل الان با **IndexedDB** کار می‌کند (آفلاین). وقتی روی Cloudflare Pages + D1 دیپلوی شود، خودکار به <code className="bg-black/5 px-1 rounded">/api/posts</code> سوییچ می‌کند — کد هر دو را ساپورت می‌کند.
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
