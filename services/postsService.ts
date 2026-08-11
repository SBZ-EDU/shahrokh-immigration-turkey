/**
 * Posts Service — Works with IndexedDB (local) and Cloudflare D1 (via /api/posts when deployed)
 * Like WordPress: admin can create/edit/publish, users can read
 */
export interface ShahrokhPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // markdown / html
  coverImage?: string;
  status: 'draft' | 'published';
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt: number;
  views?: number;
  category?: string; // e.g., ترکیه, اقامت, تحصیلی
}

const DB_NAME = 'ShahrokhPostsDB';
const STORE = 'posts';
let db: IDBDatabase | null = null;

const initPostsDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);
    if (typeof indexedDB === 'undefined') return reject('No IndexedDB');
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const d = (e.target as IDBOpenDBRequest).result;
      if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => { db = req.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
};

// Try Cloudflare first, fallback to IndexedDB
const isCloudflare = () => typeof window !== 'undefined' && (window.location.hostname.includes('pages.dev') || window.location.hostname.includes('shahrokh'));

export const getAllPosts = async (): Promise<ShahrokhPost[]> => {
  // Try Cloudflare API if deployed
  if (isCloudflare()) {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) return await res.json();
    } catch {}
  }
  // Local fallback
  try {
    const d = await initPostsDB();
    return await new Promise((resolve, reject) => {
      const tx = d.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result || []).sort((a: ShahrokhPost, b: ShahrokhPost) => b.createdAt - a.createdAt));
      req.onerror = () => reject(req.error);
    });
  } catch {
    return getSeedPosts();
  }
};

export const savePost = async (post: ShahrokhPost): Promise<void> => {
  if (isCloudflare()) {
    try {
      const res = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(post) });
      if (res.ok) return;
    } catch {}
  }
  const d = await initPostsDB();
  await new Promise<void>((resolve, reject) => {
    const tx = d.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).put({ ...post, updatedAt: Date.now() });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

export const deletePost = async (id: string): Promise<void> => {
  if (isCloudflare()) {
    try { await fetch(`/api/posts?id=${id}`, { method: 'DELETE' }); } catch {}
  }
  const d = await initPostsDB();
  await new Promise<void>((resolve, reject) => {
    const tx = d.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

export const getPostBySlug = async (slug: string): Promise<ShahrokhPost | null> => {
  const all = await getAllPosts();
  return all.find(p => p.slug === slug) || null;
};

// Seed data like WordPress starter
const getSeedPosts = (): ShahrokhPost[] => [
  {
    id: 'seed-1',
    title: 'راهنمای اقامت ملکی ترکیه ۲۰۲۶ — ۲۰۰K برای کلان‌شهرها',
    slug: 'turkey-property-200k-2026',
    excerpt: 'قانون جدید ۲۰۰ هزار دلار برای استانبول، مراحل DAB و Ekspertiz',
    content: `# اقامت ملکی ۲۰۰K\n\nاز ۲۰۲۵، برای اقامت در کلان‌شهرها حداقل ۲۰۰K دلار لازم است. مراحل: انتقال ارز + DAB، ارزیابی SPK، تاپو، کیملیک ۴-۶ هفته.\n\n> منبع: yabsigorta.com ۲۰۲۶`,
    coverImage: '/istanbul-4k-hero.jpg',
    status: 'published',
    authorId: 'admin-001',
    authorName: 'مدیر شاهرخ',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    category: 'اقامت',
  },
  {
    id: 'seed-2',
    title: 'تحصیل در استانبول — پذیرش ۴۵ دانشگاه + اقامت دانشجویی',
    slug: 'study-istanbul-2026',
    excerpt: 'پذیرش بدون مدرک زبان، کار ۲۰ ساعت پس از ۱ ترم',
    content: `# تحصیل در استانبول\n\n۴۵+ دانشگاه خصوصی، پذیرش بدون مدرک زبان (دوره آمادگی)، هزینه ۹۰۰-۱۲۰۰$ ماهانه.\n\nکتگوری: تحصیلی`,
    coverImage: '/istanbul-4k-hero.jpg',
    status: 'published',
    authorId: 'admin-001',
    authorName: 'مدیر شاهرخ',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    category: 'تحصیلی',
  },
];

export const seedIfEmpty = async () => {
  const posts = await getAllPosts();
  if (posts.length === 0) {
    for (const p of getSeedPosts()) await savePost(p);
  }
};
