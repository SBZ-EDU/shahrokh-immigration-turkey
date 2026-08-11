import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShahrokhPost, getAllPosts, seedIfEmpty } from '../services/postsService';
import { useLanguage } from '../types';

const UserPanel: React.FC<{ setPage?: (p: any) => void }> = ({ setPage }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<ShahrokhPost[]>([]);
  const [filter, setFilter] = useState('همه');

  useEffect(() => { seedIfEmpty().then(() => getAllPosts().then(p => setPosts(p.filter(x => x.status === 'published')))); }, []);

  const cats = ['همه', ...Array.from(new Set(posts.map(p => p.category || 'عمومی')))];
  const filtered = filter === 'همه' ? posts : posts.filter(p => p.category === filter);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white">پنل کاربری شاهرخ</h2>
        <p className="text-gray-400 mt-2">ابتدا وارد شوید — هر ایمیل + رمز ۴ کاراکتری کافی است (دمو). ادمین: admin@shahrokh.ir / admin123</p>
        {setPage && <button onClick={() => setPage('home')} className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg">بازگشت</button>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header like WP user dashboard */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white text-blue-700 rounded-full flex items-center justify-center font-bold text-xl">{user.name[0]?.toUpperCase()}</div>
            <div>
              <h2 className="text-2xl font-bold">سلام، {user.name} 👋</h2>
              <p className="text-blue-100 text-sm">{user.email} • نقش: {user.role === 'admin' ? 'ادمین' : 'کاربر'} • عضویت: {new Date(user.createdAt).toLocaleDateString('fa-IR')}</p>
            </div>
          </div>
          <button onClick={logout} className="bg-white/20 hover:bg-white/30 border border-white/20 text-white px-4 py-2 rounded-lg text-sm">خروج</button>
        </div>

        {/* Stats like WP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4 text-center"><div className="text-2xl font-bold">{posts.length}</div><div className="text-xs text-gray-400">مقالات منتشر</div></div>
          <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4 text-center"><div className="text-2xl font-bold">—</div><div className="text-xs text-gray-400">پرونده‌های من</div></div>
          <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4 text-center"><div className="text-2xl font-bold">استانبول</div><div className="text-xs text-gray-400">استانبول</div></div>
          <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4 text-center"><div className="text-2xl font-bold">✓</div><div className="text-xs text-gray-400">وضعیت: فعال</div></div>
        </div>

        {/* Posts - user view */}
        <div className="mt-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-xl font-bold">مقالات شاهرخ برای شما</h3>
            <div className="flex gap-2 flex-wrap">
              {cats.map(c => (
                <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-full text-sm border ${filter === c ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-gray-800 border-white/10 text-gray-300 hover:bg-gray-700'}`}>{c}</button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filtered.map(p => (
              <article key={p.id} className="bg-gray-800/50 border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition">
                {p.coverImage && <img src={p.coverImage} alt={p.title} className="w-full h-40 object-cover" />}
                <div className="p-5">
                  <span className="text-xs bg-blue-500/20 border border-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full">{p.category}</span>
                  <h4 className="font-bold mt-2 line-clamp-2">{p.title}</h4>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{p.excerpt}</p>
                  <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                    <span>{p.authorName} • {new Date(p.createdAt).toLocaleDateString('fa-IR')}</span>
                    <button onClick={() => alert(p.content.slice(0, 600) + '...')} className="text-cyan-400 hover:underline">خواندن</button>
                  </div>
                </div>
              </article>
            ))}
            {filtered.length === 0 && <p className="col-span-full text-center text-gray-500 py-12">مقاله‌ای در این دسته نیست</p>}
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <button onClick={() => setPage && setPage('eligibility_assessment')} className="bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-xl font-bold text-center">🧭 ارزیابی شاهرخ →</button>
          <a href="https://t.me/shahrokh_imigration_bot" target="_blank" className="bg-[#2AABEE] hover:bg-[#229ED9] text-white p-4 rounded-xl font-bold text-center">💬 تلگرام شاهرخ</a>
          <button onClick={() => setPage && setPage('turkey_4x')} className="bg-gray-800 hover:bg-gray-700 border border-white/10 text-white p-4 rounded-xl font-bold text-center">🇹🇷 صفحه شاهرخ</button>
        </div>
      </div>
    </div>
  );
};

export default UserPanel;
