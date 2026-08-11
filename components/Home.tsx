import React from 'react';
import { Page } from '../types';

interface HomePageProps { setPage: (page: Page) => void; }

const HomePage: React.FC<HomePageProps> = ({ setPage }) => {
  return (
    <div className="bg-white text-gray-900">
      {/* Hero — Clean like Silk Route + EurasiaBridge */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              از ۲۰۱۴ • دفاتر تهران (الهیه) و استانبول (شیشلی)
            </div>
            <h1 className="mt-6 text-3xl sm:text-4xl font-black tracking-tight text-gray-900 leading-tight">
              پل مطمئن شما از ایران
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">به ترکیه و اوراسیا</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              گروه مهاجرتی <b>شاهرخ</b> — به خانواده‌های ایرانی، کارآفرینان و دانشجویان کمک می‌کنیم تا به ترکیه، گرجستان، ارمنستان، امارات و فراتر از آن به‌صورت شفاف و قانونی مهاجرت کنند.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => setPage('eligibility_assessment')} className="px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-black transition">
                مشاوره رایگان →
              </button>
              <button onClick={() => setPage('turkey_4x')} className="px-8 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-full hover:bg-gray-50 transition">
                دیدن مقاصد
              </button>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs">
              <span className="bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">🇮🇷 فارسی</span>
              <span className="bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">🇹🇷 Türkçe</span>
              <span className="bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">🇬🇧 English</span>
            </div>
          </div>
          {/* Hero image — clean, not 3D */}
          <div className="mt-12 max-w-5xl mx-auto rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
            <img src="https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=2000&auto=format&fit=crop" alt="Istanbul Bosporus" className="w-full h-[340px] sm:h-[420px] object-cover" />
          </div>
        </div>
      </section>

      {/* Stats — 4 columns like Silk Route */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100" style={{ direction: 'ltr' }}>
            <div><div className="text-3xl font-black">۴,۸۰۰+</div><div className="text-sm text-gray-500">خانواده جابجا شده</div></div>
            <div><div className="text-3xl font-black">۹۶%</div><div className="text-sm text-gray-500">نرخ موفقیت</div></div>
            <div><div className="text-3xl font-black">۱۲+</div><div className="text-sm text-gray-500">کشور مقصد</div></div>
            <div><div className="text-3xl font-black">۱۱</div><div className="text-sm text-gray-500">سال تجربه</div></div>
          </div>
        </div>
      </section>

      {/* Destinations — 8 cards like Silk Route, but clean */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-black">مقاصد محبوب ایرانیان</h2>
            <p className="mt-2 text-gray-600">زمان، حداقل سرمایه و مزایا را مقایسه کنید</p>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { f: '🇹🇷', n: 'ترکیه', b: 'محبوب‌ترین', t: '۳-۹ ماه', m: '$400K', d: 'شهروندی با ملک، پاسپورت ۱۱۰+ کشور', c: 'bg-red-50 border-red-100' },
              { f: '🇬🇪', n: 'گرجستان', b: 'اقامت آسان', t: '۱-۲ ماه', m: '$100K', d: 'اقامت ۱ ساله با ملک، مالیات کم', c: 'bg-green-50 border-green-100' },
              { f: '🇦🇲', n: 'ارمنستان', b: 'شهروندی سریع', t: '۲-۶ ماه', m: '$150K', d: 'بدون آزمون زبان', c: 'bg-blue-50 border-blue-100' },
              { f: '🇦🇪', n: 'امارات', b: 'گلدن ویزا', t: '۱-۳ ماه', m: 'AED 2M', d: '۱۰ سال، ۰% مالیات', c: 'bg-amber-50 border-amber-100' },
              { f: '🇴🇲', n: 'عمان', b: 'سرمایه‌گذار', t: '۲-۴ ماه', m: 'OMR 250K', d: 'کشور آرام، ویزای بلندمدت', c: 'bg-teal-50 border-teal-100' },
              { f: '🇨🇾', n: 'قبرس شمالی', b: 'تحصیلی', t: '۱-۳ ماه', m: '£100K', d: 'دانشگاه‌های انگلیسی', c: 'bg-violet-50 border-violet-100' },
              { f: '🇦🇿', n: 'آذربایجان', b: 'فرهنگ مشترک', t: '۱-۲ ماه', m: '$100K+', d: 'زبان مشترک، باکو مدرن', c: 'bg-sky-50 border-sky-100' },
              { f: '🇷🇺', n: 'روسیه', b: 'تحصیلی/کاری', t: '۲-۶ ماه', m: 'Student', d: 'دانشگاه‌های فنی برتر', c: 'bg-slate-50 border-slate-200' },
            ].map((d) => (
              <div key={d.n} onClick={() => setPage('turkey_4x')} className={`bg-white border rounded-2xl p-6 hover:shadow-md transition cursor-pointer ${d.c}`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{d.f}</span>
                  <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full">{d.b}</span>
                </div>
                <h3 className="font-bold mt-3">{d.n}</h3>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="bg-gray-900 text-white px-2 py-1 rounded-full">{d.t}</span>
                  <span className="bg-white border border-gray-200 px-2 py-1 rounded-full">{d.m}</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">{d.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services — 6 like Silk Route */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center">خدمات ما</h2>
          <p className="text-center text-gray-600 mt-2">پشتیبانی صفر تا صد، از مشاوره تا شهروندی</p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '۰۱', t: 'شهروندی ترکیه با سرمایه‌گذاری', d: 'ملک $400K، سپرده یا ثبت شرکت. پاسپورت ۶-۹ ماه.' },
              { n: '۰۲', t: 'اقامت ترکیه', d: 'کوتاه‌مدت، خانوادگی، دانشجویی، بلندمدت.' },
              { n: '۰۳', t: 'اجازه کار و ثبت شرکت', d: 'تاسیس شرکت در ترکیه/گرجستان/امارات.' },
              { n: '۰۴', t: 'پذیرش تحصیلی', d: 'ترکیه، قبرس، گرجستان، روسیه.' },
              { n: '۰۵', t: 'ویزای توریستی', d: 'توریستی، دیدار خانواده، شنگن.' },
              { n: '۰۶', t: 'پاسپورت دوم', d: 'ترکیه، گرنادا، امارات.' },
            ].map((s) => (
              <div key={s.n} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <div className="text-xs font-bold text-gray-400">{s.n}</div>
                <h3 className="font-bold mt-1">{s.t}</h3>
                <p className="text-sm text-gray-600 mt-1">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — 5 steps */}
      <section className="py-16 sm:py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center">چطور کار می‌کند — ۵ قدم</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { n: '۰۱', t: 'ارزیابی رایگان', d: 'اهداف و بودجه را می‌شنویم.' },
              { n: '۰۲', t: 'نقشه راه', d: 'برنامه شفاف با هزینه ثابت.' },
              { n: '۰۳', t: 'مدارک', d: 'ترجمه، نوتر، آپوستیل.' },
              { n: '۰۴', t: 'ارسال', d: 'ارتباط با اداره مهاجرت.' },
              { n: '۰۵', t: 'استقرار', d: 'فرودگاه، سیم، مدرسه.' },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-10 h-10 mx-auto bg-white text-gray-900 rounded-full flex items-center justify-center font-black text-sm">{s.n}</div>
                <h4 className="font-bold mt-3">{s.t}</h4>
                <p className="text-sm text-gray-400 mt-1">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us — 6 like Silk Route */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center">چرا خانواده‌های ایرانی ما را انتخاب می‌کنند</h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { t: 'تیم فارسی‌زبان', d: 'بدون سوءتفاهم.' },
              { t: 'دفاتر واقعی', d: 'تهران، استانبول، تفلیس، ایروان.' },
              { t: 'هزینه شفاف', d: 'اقساط کتبی.' },
              { t: 'وکلای رسمی', d: 'BARO ترکیه.' },
              { t: 'بانک تحریمی', d: 'راه‌حل انتقال ارز.' },
              { t: 'پشتیبانی پس از ورود', d: 'بانک، مدرسه، خانه.' },
            ].map((w) => (
              <div key={w.t} className="border border-gray-100 rounded-2xl p-6 bg-gray-50">
                <h4 className="font-bold">{w.t}</h4>
                <p className="text-sm text-gray-600 mt-1">{w.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-4 bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <img src="/shahrokh-logo.png" alt="Armin" className="w-12 h-12 rounded-full border" />
            <div>
              <div className="font-bold">آرمین — مشاور ارشد</div>
              <div className="text-sm text-gray-600">فارسی/ترکی/انگلیسی — ۵ سال ترکیه</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center">خانواده‌هایی که رسیدند</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="text-amber-500">★★★★★</div>
              <p className="mt-2 text-gray-700">“بیلیک‌دوزو ۳+۱ و ۷ ماهه پاسپورت — شاهرخ تاپو را هم خودش برد.”</p>
              <p className="text-sm text-gray-500 mt-2">محمد و لیلا — تهران → استانبول</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="text-amber-500">★★★★★</div>
              <p className="mt-2 text-gray-700">“گرجستان ۳ هفته‌ای — فرودگاه تفلیس خودشان آمدند.”</p>
              <p className="text-sm text-gray-500 mt-2">سارا — شیراز → تفلیس</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black">آماده‌ای زندگی جدید را شروع کنی؟</h2>
          <p className="text-gray-400 mt-2">ارزیابی رایگان — پاسخ در ۲۴ ساعت</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => setPage('eligibility_assessment')} className="px-8 py-3 bg-white text-gray-900 font-bold rounded-full">ارزیابی رایگان</button>
            <a href="https://t.me/shahrokh_imigration_bot" target="_blank" className="px-8 py-3 bg-[#2AABEE] text-white font-bold rounded-full">تلگرام شاهرخ</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
