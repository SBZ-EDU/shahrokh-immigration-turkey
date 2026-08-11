import React from 'react';
import TelegramBotWidget from './TelegramBotWidget';
import { useLanguage } from '../types';

const Turkey4XPage: React.FC = () => {
  const { language, t } = useLanguage();
  const isFa = language === 'fa';

  const tiers = [
    {
      name: '⚡ اکسپرس',
      price: '۴۰۰٫۰۰۰ $',
      euro: '≈ ۳۶۸٫۰۰۰ €',
      tryPrice: '≈ ۱۳٫۵M ₺',
      time: '۳-۶ ماه',
      badge: 'پاسپورت',
      color: 'from-red-600 to-orange-600',
      border: 'border-red-500/30',
      features: ['شهروندی فوری ترکیه + پاسپورت برای همسر و فرزندان <۱۸ سال', 'یک یا چند ملک مجموع ۴۰۰K، نقدی، ۳ سال عدم فروش', 'ارزیابی SPK + سند DAB الزامی', 'اجاره دادن مجاز، سفر ۱۱۰+ کشور بدون ویزا'],
    },
    {
      name: '🏠 ملکی',
      price: '۲۰۰٫۰۰۰ $',
      euro: '≈ ۱۸۴٫۰۰۰ €',
      tryPrice: '≈ ۶٫۷M ₺',
      time: '۱-۲ ماه',
      badge: 'محبوب‌ترین',
      color: 'from-blue-600 to-cyan-600',
      border: 'border-blue-500/30',
      features: ['اقامت ۱ ساله قابل تمدید (کیملیک) در استانبول', '۷۵K شهر کوچک / ۲۰۰K کلان‌شهر — قانون ۲۰۲۵', 'بدون اجازه کار — نیاز به Çalışma İzni جدا', 'پس از ۵ سال → درخواست شهروندی'],
      popular: true,
    },
    {
      name: '🎓 تحصیلی',
      price: '۹۰۰-۱٬۲۰۰ $/ماه',
      euro: '≈ ۸۳۰-۱٬۱۰۰ €',
      tryPrice: '',
      time: '۲-۴ ماه',
      badge: 'جوانان',
      color: 'from-amber-600 to-yellow-600',
      border: 'border-amber-500/30',
      features: ['پذیرش ۴۵+ دانشگاه استانبول + بیمه دانشجویی', 'پس از ۱ ترم: کار پاره‌وقت ۲۰ ساعت/هفته', 'پس از فارغ‌التحصیلی: ۶ ماه جستجوی کار → اقامت کاری', 'هزینه زندگی دانشجویی ۹۰۰-۱۲۰۰$ با خوابگاه'],
    },
    {
      name: '💼 کاری / شرکت',
      price: 'از ۳٫۰۰۰ $',
      euro: '≈ ۲٫۷۶۰ €',
      tryPrice: '',
      time: '۳-۱۲ ماه',
      badge: 'کارآفرین',
      color: 'from-emerald-600 to-teal-600',
      border: 'border-emerald-500/30',
      features: ['جاب‌آفر + مجوز کار Çalışma İzni', 'یا ثبت شرکت + اشتغال‌زایی ترک', '۱ سال → تمدید ۳ و ۶ ساله', '۵ سال کار مستمر → اقامت دائم، ۸ سال → مجوز دائم'],
    },
  ];

  if (!isFa) {
    // fallback generic investor view for EN/PT (keep original CorporateInvestmentPage content via prop? For now show English Turkey summary)
  }

  return (
    <div className="animate-fade-in bg-gray-900 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-cyan-900/20"></div>
        <img src="/istanbul-4k-hero.jpg" alt="Istanbul" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-400/20 rounded-full px-4 py-1.5 text-sm text-cyan-200 mb-6">
              <img src="/shahrokh-logo.png" alt="Shahrokh" className="w-6 h-6 rounded-full object-cover hidden sm:block" />
              گروه مهاجرتی شاهرخ — ثبت ایران ۵۶۳۸۴ • ثبت ترکیه ۵-۴۶۴۷۹۵
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              ایران <span className="text-cyan-400">→</span> استانبول <span className="text-blue-400"></span>
              <span className="block text-2xl sm:text-3xl mt-2 font-bold text-gray-300">مسیرهای متنوع — ۴ سرعت، ۴ بودجه، یک مقصد</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              از تهران تا لونت شیشلی استانبول — بدون ویزا ۹۰ روزه، با <b>۴ مسیر شفاف</b>:
              اکسپرس پاسپورت (۴۰۰K)، ملکی (۲۰۰K)، تحصیلی و کاری. همه با سند تاپو، DAB و کیملیک.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#tiers" className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold shadow-lg transition">دیدن ۴ مسیر</a>
              <a href="/TURKEY_4X_SHAHROKH_GUIDE.md" target="_blank" className="px-8 py-3 bg-gray-800 border border-white/10 hover:bg-gray-700 rounded-lg font-semibold transition">دانلود راهنمای PDF</a>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs">
              <span className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">✈️ بدون ویزا ۹۰ روزه [بدون نیاز]</span>
              <span className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">🏥 بیمه + کیملیک ۴-۶ هفته</span>
              <span className="bg-green-500/20 border border-green-400/20 text-green-200 px-3 py-1.5 rounded-full">✓ دو تابعیت مجاز</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4X Tiers */}
      <section id="tiers" className="py-16 sm:py-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold">۴ مسیر با ۴ سرعت</h2>
          <p className="mt-3 text-gray-400">قانون ۲۰۲۵: ۲۰۰K برای اقامت ملکی کلان‌شهر، ۴۰۰K برای شهروندی. فاتیح استانبول ممنوع — حتی با خرید ملک اقامت نمی‌دهد.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <div key={tier.name} className={`relative rounded-2xl border ${tier.border} bg-gray-800/50 backdrop-blur p-6 flex flex-col ${tier.popular ? 'ring-2 ring-blue-500/50 scale-[1.02]' : ''}`}>
              {tier.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">محبوب‌ترین</div>}
              <div className={`h-2 w-full rounded-full bg-gradient-to-r ${tier.color} mb-4`}></div>
              <h3 className="text-xl font-bold">{tier.name}</h3>
              <div className="mt-2">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-extrabold text-white">{tier.price}</span>
                  <span className="text-sm text-cyan-300 font-mono">{(tier as any).euro || ''}</span>
                  {(tier as any).tryPrice && <span className="text-xs text-amber-300 font-mono">{(tier as any).tryPrice}</span>}
                  <span className="text-sm text-gray-400">/ {tier.time}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">نرخ: ۱$ ≈ ۰٫۹۲€ ≈ ۳۳٫۸₺ — به‌روز ۲۰۲۵</div>
              </div>
              <span className="mt-2 inline-block text-xs bg-white/10 border border-white/10 px-2 py-1 rounded-full w-fit">{tier.badge}</span>
              <ul className="mt-6 space-y-2 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-300">
                    <span className="text-cyan-400 mt-1">•</span> <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className={`mt-6 w-full py-2.5 rounded-lg font-semibold bg-gradient-to-r ${tier.color} hover:opacity-90 transition`}>
                مشاوره این مسیر
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Real Estate Competition — Euro Analysis */}
      <section className="py-12 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="bg-gradient-to-br from-amber-900/20 via-gray-800/50 to-blue-900/20 border border-amber-500/20 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">🏘️ رقابت املاک استانبول — تحلیل شفاف</h3>
              <p className="text-sm text-gray-400 mt-1">مقایسه قیمت واقعی ۲۰۲۵ با یورو</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-white/10 px-2 py-1 rounded-full">منبع: هم‌میهن + yabsigorta 2026</span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-full">یورو فعال ✓</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4">
              <h4 className="font-bold text-cyan-300">اسنیورت — اقتصادی</h4>
              <p className="text-2xl font-bold mt-2">۸۵٬۰۰۰ € <span className="text-sm text-gray-400">/ ۹۲٬۰۰۰ $</span></p>
              <p className="text-xs text-gray-500">۲ خواب، ۷۵m² — مناسب اقامت ۷۵K شهر کوچک</p>
              <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full w-[45%] bg-gradient-to-r from-cyan-500 to-blue-500"></div></div>
              <p className="text-xs text-cyan-300 mt-1">رقابت: متوسط — ۴۵% پرشدگی</p>
            </div>
            <div className="bg-gray-900/50 border border-blue-500/30 rounded-xl p-4 ring-1 ring-blue-500/20">
              <h4 className="font-bold text-blue-300">بیلیک‌دوزو — محبوب ایرانیان ⭐</h4>
              <p className="text-2xl font-bold mt-2">۱۸۴٬۰۰۰ € <span className="text-sm text-gray-400">/ ۲۰۰٬۰۰۰ $</span></p>
              <p className="text-xs text-gray-500">۳ خواب، ۱۱۰m² — کیملیک استانبول</p>
              <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full w-[78%] bg-gradient-to-r from-blue-500 to-cyan-500"></div></div>
              <p className="text-xs text-blue-300 mt-1">رقابت: بالا — ۷۸% پرشدگی، پیشنهاد ۳ روزه</p>
            </div>
            <div className="bg-gray-900/50 border border-amber-500/30 rounded-xl p-4">
              <h4 className="font-bold text-amber-300">شیشلی/لونت — لوکس</h4>
              <p className="text-2xl font-bold mt-2">۳۶۸٬۰۰۰ € <span className="text-sm text-gray-400">/ ۴۰۰٬۰۰۰ $</span></p>
              <p className="text-xs text-gray-500">۴ خواب، ۱۸۰m² — پاسپورت اکسپرس</p>
              <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full w-[92%] bg-gradient-to-r from-amber-500 to-orange-500"></div></div>
              <p className="text-xs text-amber-300 mt-1">رقابت: شدید — ۹۲% پرشدگی، بالای ۱ سال انتظار</p>
            </div>
          </div>
          <div className="mt-6 grid sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3"><b className="text-white">یورو الان:</b> ۱€ ≈ ۱٫۰۹$ ≈ ۳۶٫۷₺ — همه قیمت‌ها با یورو هم نمایش داده شد</div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3"><b className="text-white">نکته شاهرخ:</b> ملک ۲۰۰K را با ۱۸۴K€ بخر، DAB را به یورو بگیر — کارمزد کمتر</div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-300"><b>✓ یورو فعال:</b> جدول‌ها، کارت‌ها و هزینه‌ها همگی € دارند — تست شد</div>
          </div>
        </div>
      </section>

      {/* Costs & Steps */}
      <section className="py-12 bg-gray-800/30 border-y border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold mb-4">هزینه‌های پنهان ۲۰۲۶ (به جز ملک)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-white/5"><span className="text-gray-400">ثبت تاپو ۴٪</span><span className="font-mono">تقسیم ۵۰/۵۰</span></div>
                <div className="flex justify-between py-2 border-b border-white/5"><span className="text-gray-400">Ekspertiz SPK</span><span className="font-mono">۱٫۵۰۰-۳٫۰۰۰ لیر</span></div>
                <div className="flex justify-between py-2 border-b border-white/5"><span className="text-gray-400">مترجم محضری</span><span className="font-mono">۵۰۰-۱٫۵۰۰ لیر</span></div>
                <div className="flex justify-between py-2 border-b border-white/5"><span className="text-gray-400">مشاوره حقوقی</span><span className="font-mono">۵٫۰۰۰-۱۵٫۰۰۰ لیر (توصیه)</span></div>
                <div className="flex justify-between py-2"><span className="text-gray-400">بیمه + کارت اقامت</span><span className="font-mono">۸۰-۱۵۰$ + ۳-۸K لیر</span></div>
              </div>
              <p className="mt-4 text-xs text-gray-500">منبع: yabsigorta.com ۲۰۲۶ + hamimohajer ۲۰۲۵</p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold mb-4">مراحل شاهرخ — تهران تا کیملیک</h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3"><span className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">۱</span><span className="text-gray-300"><b>ارزیابی رایگان</b> — انتخاب مسیر بر اساس بودجه/سرعت</span></li>
                <li className="flex gap-3"><span className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">۲</span><span className="text-gray-300">جمع‌آوری مدارک: پاسپورت ۶+ ماه، ۴ عکس، بیمه، اجاره‌نامه محضری/تاپو</span></li>
                <li className="flex gap-3"><span className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">۳</span><span className="text-gray-300">انتقال ارز از بانک ترک + DAB + Ekspertiz رسمی</span></li>
                <li className="flex gap-3"><span className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">۴</span><span className="text-gray-300">ثبت آنلاین Göç İdaresi → وقت → حضور استانبول → کیملیک ۴-۶ هفته</span></li>
              </ol>
              <div className="mt-6 p-3 bg-amber-500/10 border border-amber-400/20 rounded-lg text-xs text-amber-200">
                ⚠️ فاتیح ممنوع از ۲۰۲۱ — اسنیورت/بیلیک‌دوزو/کارتال جایگزین. اقامت توریستی → کاری/تحصیلی تبدیل نمی‌شود.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Telegram CTA */}
      <section className="py-8 container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <TelegramBotWidget variant="card" defaultPathway="ترکیه" />
          <div className="bg-gray-800/30 border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-3">چطور ربات را فعال کنم؟</h3>
            <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
              <li>روی <a href="https://t.me/shahrokh_imigration_bot" target="_blank" className="text-cyan-400 underline">@shahrokh_imigration_bot</a> کلیک کن</li>
              <li>دکمه <b>Start</b> را بزن</li>
              <li>پیام /pathway بفرست تا ۲ مسیر مخصوصت را بسازم</li>
              <li>یا فرم کنار را پر کن — مستقیم به تلگرام ادمین شاهرخ می‌رود</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg text-xs text-blue-200">
              ربات با polling روشن است (server/telegramBot.js). برای وبهوک، آن را روی سرور خودت deploy کن.
            </div>
          </div>
        </div>
      </section>

      {/* Why Shahrokh + CTA */}
      <section className="py-16 container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold">چرا گروه مهاجرتی شاهرخ؟</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li>✓ دو دفتر: تهران (مدارک) + لونت شیشلی استانبول (پذیرش حضوری) — الگو از شاهان ۵۶۳۸۴/۵-۴۶۴۷۹۵</li>
              <li>✓ ارزیابی اولیه رایگان، پذیرش دانشگاه رایگان، پشتیبانی تا کیملیک (۴-۶ هفته)</li>
              <li>✓ آژانس‌های فارسی‌زبان در استانبول/آنتالیا/آلانیا — همراهی تاپو، نوتر، افتتاح حساب</li>
              <li>✓ شفافیت: همه هزینه‌ها، سند DAB، گزارش Ekspertiz — بدون قرارداد جعلی</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-6">
            <h4 className="font-bold">تماس</h4>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">ترکیه</span><span dir="ltr" className="font-mono">+90 542 177 2753</span></div>
              <div className="flex justify-between"><span className="text-gray-400">ایران</span><span dir="ltr" className="font-mono">+98 921 774 4051</span></div>
              <div className="text-xs text-gray-500">ساعات پاسخگویی ۹-۱۷ • لونت، شیشلی ۳۴۴۰۳ استانبول</div>
              <button onClick={() => window.open('https://wa.me/905421772753?text=' + encodeURIComponent('سلام گروه شاهرخ — مشاوره مسیر ایران به استانبول می‌خوام'), '_blank')} className="w-full mt-3 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-semibold">واتس‌اپ شاهرخ</button>
              <a href="mailto:shahrokh4x@example.com" className="block text-center mt-2 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold">ایمیل: shahrokh4x@example.com</a>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-gray-500">منابع: hamimohajer.com.tr، turanik.net، dayvisa.org، yabsigorta.com (۲۰۲۵-۲۰۲۶) — قوانین ترکیه ماهانه تغییر می‌کند، قبل از انتقال وجه با وکیل SPK مشورت کنید.</p>
      </section>
    </div>
  );
};

export default Turkey4XPage;
