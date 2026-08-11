import React, { useState } from 'react';
import { searchBusinesses, deduplicateBusinesses, discoverWebsite, BusinessRecord } from '../services/neshanService';
import { analyzeBusiness, getExpenseCollaborationGroups, proposeExpenseSharing } from '../services/businessAnalyzerService';

const BusinessAnalyzer: React.FC = () => {
  const [term, setTerm] = useState('restaurant');
  const [lat, setLat] = useState(35.74);
  const [lng, setLng] = useState(51.30);
  const [radius, setRadius] = useState(3000);
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState<(BusinessRecord & any)[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [region, setRegion] = useState('سعادت‌آباد');

  const regions: Record<string, { lat: number; lng: number; name: string }> = {
    'سعادت‌آباد': { lat: 35.782, lng: 51.377, name: 'سعادت‌آباد' },
    'پل مدیریت': { lat: 35.757, lng: 51.409, name: 'پل مدیریت' },
    'دزتقندی': { lat: 35.735, lng: 51.395, name: 'دزتقندی' },
    'سیدخندان': { lat: 35.739, lng: 51.447, name: 'سیدخندان' },
    'تجریش': { lat: 35.804, lng: 51.425, name: 'تجریش' },
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const raw = await searchBusinesses({ term, lat, lng, radius });
      const deduped = deduplicateBusinesses(raw);
      const enriched = await Promise.all(deduped.map(async b => {
        const web = await discoverWebsite(b);
        const analysis = analyzeBusiness({ ...b, ...web });
        // Add website design prompt
        const designPrompt = `طراحی وب‌سایت برای ${b.name} — دسته ${b.category} — ${b.address} — ${web.website_found ? 'بهبود سئو به ۸۰ و افزودن سفارش آنلاین' : 'ساخت سایت مدرن فارسی با رزرو آنلاین'}`;
        return { ...b, ...web, ...analysis, designPrompt, website_link: web.website || `https://google.com/search?q=${encodeURIComponent(b.name + ' تهران')}` };
      }));
      setBusinesses(enriched);
    } finally { setLoading(false); }
  };

  const handleRegionChange = (r: string) => {
    setRegion(r);
    const c = regions[r];
    if (c) { setLat(c.lat); setLng(c.lng); }
  };

  const groups = getExpenseCollaborationGroups(businesses);
  const proposal = businesses.length > 0 ? proposeExpenseSharing(businesses, term) : null;
  const critical = businesses.filter(b => !b.website_found || (b.seo_score || 0) < 40);
  const density = businesses.length > 0 ? (businesses.length / (Math.PI * Math.pow(radius/1000, 2))).toFixed(1) : '0';

  const downloadCSV = () => {
    const headers = ['business_id','name','category','latitude','longitude','address','phone','website','website_found','seo_score','digital_maturity','designPrompt'];
    const rows = businesses.map(b => headers.map(h => `"${(b[h] || '').toString().replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shahrokh_${region}_${term}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(businesses, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shahrokh_${region}_${term}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black">ماژول تحلیل کسب‌وکارها — نقشه + دیتابیس + همکاری</h1>
          <p className="text-gray-400 mt-2 text-sm">نقشه نشان/گوگل مپ — کسب‌وکارهای بحرانی — پرامپت طراحی — لینک کلیک‌پذیر — دانلود منطقه‌ای — تراکم — همکاری</p>
        </div>

        {/* Controls + Region */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 grid lg:grid-cols-6 gap-3">
          <div>
            <label className="text-xs text-gray-400">منطقه سریع</label>
            <select value={region} onChange={e => handleRegionChange(e.target.value)} className="w-full mt-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm">
              {Object.keys(regions).map(r => <option key={r} value={r}>{r}</option>)}
              <option value="custom">سفارشی</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400">دسته</label>
            <select value={term} onChange={e => setTerm(e.target.value)} className="w-full mt-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm">
              <option value="restaurant">رستوران</option>
              <option value="clinic">کلینیک</option>
              <option value="beauty salon">سالن زیبایی</option>
              <option value="hotel">هتل</option>
              <option value="real estate">املاک</option>
              <option value="gym">باشگاه</option>
            </select>
          </div>
          <div><label className="text-xs text-gray-400">Lat</label><input type="number" value={lat} onChange={e => setLat(parseFloat(e.target.value))} step={0.001} className="w-full mt-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="text-xs text-gray-400">Lng</label><input type="number" value={lng} onChange={e => setLng(parseFloat(e.target.value))} step={0.001} className="w-full mt-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="text-xs text-gray-400">شعاع (m)</label><input type="number" value={radius} onChange={e => setRadius(parseInt(e.target.value))} className="w-full mt-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm" /></div>
          <div className="flex items-end">
            <button onClick={handleSearch} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-2.5 rounded-lg text-sm">
              {loading ? '...' : '🔍 کشف'}
            </button>
          </div>
        </div>

        {/* Map like Neshan/Google */}
        {businesses.length > 0 && (
          <div className="mt-6 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-sm">🗺️ نقشه — {region} — بحرانی‌ها قرمز</h3>
                <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">{critical.length} بحرانی</span>
              </div>
              {/* Simple map placeholder with Neshan/Google iframe */}
              <div className="relative h-[360px] bg-gray-800">
                <iframe
                  title="Neshan Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.03}%2C${lat - 0.02}%2C${lng + 0.03}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`}
                />
                {/* Overlay markers for critical */}
                <div className="absolute top-2 left-2 bg-gray-900/90 backdrop-blur border border-white/10 rounded-xl p-2 max-h-[320px] overflow-y-auto w-56">
                  <p className="text-xs font-bold mb-2">کسب‌وکارهای بحرانی</p>
                  {critical.slice(0, 8).map(b => (
                    <div key={b.business_id} className="py-1.5 border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/5 px-1 rounded" onClick={() => setSelected(b.business_id)}>
                      <div className="text-xs font-bold truncate">{b.name}</div>
                      <div className="text-[10px] text-gray-400 truncate">{b.category} • {b.website_found ? 'دارد' : 'ندارد'}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-2 flex gap-2 text-xs">
                <a href={`https://www.google.com/maps/search/${term}/@${lat},${lng},15z`} target="_blank" className="bg-white text-gray-900 px-3 py-1.5 rounded-full font-bold">Google Maps ↗</a>
                <a href={`https://neshan.org/maps/@${lat},${lng},15z`} target="_blank" className="bg-cyan-600 text-white px-3 py-1.5 rounded-full font-bold">Neshan ↗</a>
              </div>
            </div>

            {/* Density + Collaboration */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-violet-600 to-cyan-600 rounded-2xl p-5 text-white">
                <h4 className="font-bold">📊 تراکم</h4>
                <p className="text-2xl font-black mt-1">{density} <span className="text-sm font-normal">کسب‌وکار/km²</span></p>
                <p className="text-xs opacity-80 mt-1">منطقه: {region} — شعاع {(radius/1000).toFixed(1)}km — کل: {businesses.length}</p>
                <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white" style={{ width: `${Math.min(100, parseFloat(density)*10)}%` }} /></div>
              </div>
              <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
                <h4 className="font-bold text-sm">🤝 همکاری‌ها</h4>
                <p className="text-xs text-gray-400 mt-1">کسب‌وکارهای هم‌دسته با بلوغ پایین — هزینه مشترک ۳۰٪</p>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"><span>بدون سایت</span><b>{groups.noWebsite.length}</b></div>
                  <div className="flex justify-between bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2"><span>ضعیف</span><b>{groups.weakSite.length}</b></div>
                </div>
                {proposal && <p className="text-xs mt-3 bg-white/5 border border-white/10 rounded-lg p-2">{proposal.proposal.slice(0,90)}...</p>}
              </div>
            </div>
          </div>
        )}

        {/* Related Companies in Turkey — Job Offers (connected via map) */}
        {businesses.length > 0 && selected && (
          <div className="mt-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-2xl p-6">
            <h3 className="font-bold flex items-center gap-2">🇹🇷 شرکت‌های مرتبط در ترکیه — فرصت شغلی برای {businesses.find(b=>b.business_id===selected)?.name}</h3>
            <p className="text-xs text-gray-400 mt-1">نقشه ارتباطات + پیشنهادات کاری — مثل مارکتینگ، ولی برای مهاجرت</p>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4">
                <div className="text-sm font-bold">Rixos Hotels — Antalya</div>
                <div className="text-xs text-cyan-300 mt-1">مدیر رستوران — Work Permit</div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full">€2,800</span>
                  <span className="bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full">تطبیق ۹۲%</span>
                </div>
                <button className="mt-3 w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-1.5 rounded-full">درخواست با شاهرخ →</button>
              </div>
              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4">
                <div className="text-sm font-bold">Acıbadem — Istanbul</div>
                <div className="text-xs text-cyan-300 mt-1">پرستار — Blue Card</div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full">€3,200</span>
                  <span className="bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full">تطبیق ۸۸%</span>
                </div>
                <button className="mt-3 w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-1.5 rounded-full">درخواست با شاهرخ →</button>
              </div>
              <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4">
                <div className="text-sm font-bold">Trendyol — Istanbul</div>
                <div className="text-xs text-cyan-300 mt-1">دیجیتال مارکتینگ — Talent</div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full">€2,500</span>
                  <span className="bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full">تطبیق ۸۵%</span>
                </div>
                <button className="mt-3 w-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-1.5 rounded-full">درخواست با شاهرخ →</button>
              </div>
            </div>
          </div>
        )}

        {/* Table — clickable links + design prompt */}
        {businesses.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-gray-300">
                <tr>
                  <th className="px-3 py-3 text-right">کسب‌وکار</th>
                  <th className="px-3 py-3">سایت</th>
                  <th className="px-3 py-3">پرامپت طراحی</th>
                  <th className="px-3 py-3">لینک‌ها</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-gray-900/50">
                {businesses.map(b => (
                  <tr key={b.business_id} className={`hover:bg-white/5 ${selected===b.business_id?'bg-cyan-500/10':''}`}>
                    <td className="px-3 py-3">
                      <div className="font-bold">{b.name}</div>
                      <div className="text-xs text-gray-500">{b.address.slice(0,40)}</div>
                      <div className="text-[10px] text-gray-600">{b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}</div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {b.website_found ? <a href={b.website} target="_blank" rel="noopener" className="bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded-full text-xs hover:bg-green-500/30">🌐 {b.website?.replace('https://','').slice(0,18)}</a> : <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full text-xs">ندارد</span>}
                    </td>
                    <td className="px-3 py-3 max-w-[240px]">
                      <div className="text-xs bg-white/5 border border-white/10 rounded-lg p-2 line-clamp-2" title={b.designPrompt}>{b.designPrompt}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        <a href={b.website_link} target="_blank" className="bg-cyan-600 hover:bg-cyan-700 text-white px-2 py-1 rounded-full text-xs">گوگل ↗</a>
                        <a href={`https://www.google.com/maps/search/${encodeURIComponent(b.name)}/@${b.latitude},${b.longitude},17z`} target="_blank" className="bg-white/10 hover:bg-white/20 border border-white/10 px-2 py-1 rounded-full text-xs">نقشه ↗</a>
                        <button onClick={() => navigator.clipboard.writeText(b.designPrompt)} className="bg-violet-600 hover:bg-violet-700 text-white px-2 py-1 rounded-full text-xs">کپی پرامپت</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Download — final DB */}
        {businesses.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button onClick={downloadCSV} className="bg-white text-gray-900 font-bold px-6 py-3 rounded-full">📥 دانلود CSV — {region}</button>
            <button onClick={downloadJSON} className="bg-gray-800 border border-white/10 hover:bg-gray-700 text-white font-bold px-6 py-3 rounded-full">📥 JSON کامل</button>
            <span className="text-xs text-gray-500 self-center">قابل کلیک — لینک‌ها مستقیم به سایت/نقشه می‌روند</span>
          </div>
        )}

        <div className="mt-6 p-3 bg-gray-900 border border-white/10 rounded-xl text-xs text-gray-400 text-center">
          نقشه: OpenStreetMap (جایگزین نشان/گوگل) — برای نشان واقعی، <code className="bg-black/30 px-1 rounded">VITE_NESHAN_API_KEY</code> بگذار.
        </div>
      </div>
    </div>
  );
};

export default BusinessAnalyzer;
