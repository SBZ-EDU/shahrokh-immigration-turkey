import React, { useState } from 'react';
import { getBotLink, getBotStartLink, sendLeadToTelegram } from '../services/telegramService';
import { useLanguage } from '../types';

interface Props {
  variant?: 'card' | 'floating' | 'inline';
  defaultPathway?: string;
}

const TelegramBotWidget: React.FC<Props> = ({ variant = 'card', defaultPathway = '' }) => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(defaultPathway ? `درخواست مشاوره برای مسیر ${defaultPathway}` : '');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState('');

  const botLink = getBotLink();
  const startLink = getBotStartLink('shahrokh_web');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setErrorText(language === 'fa' ? 'نام و پیام الزامی است' : 'Name and message required');
      setStatus('error');
      return;
    }
    setStatus('sending');
    setErrorText('');
    try {
      await sendLeadToTelegram({ name, phone, message, pathway: defaultPathway, source: 'web-widget' });
      setStatus('success');
      setName(''); setPhone(''); setMessage('');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err: any) {
      setStatus('error');
      setErrorText(err.message || (language === 'fa' ? 'ارسال ناموفق — لطفاً مستقیم به تلگرام پیام دهید' : 'Failed — message the bot directly'));
    }
  };

  if (variant === 'floating') {
    return (
      <a
        href={botLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#2AABEE] hover:bg-[#229ED9] text-white px-4 py-3 rounded-full shadow-2xl transition-transform hover:scale-105"
        title="گروه مهاجرتی شاهرخ در تلگرام"
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm3.721 5.26-1.136 5.364s-.106.48-.394.567c-.288.086-1.13-.345-1.716-.63l-2.07-1.34s-.205-.13-.295-.205c-.09-.074-.228-.226-.168-.4.06-.174.38-.253.38-.253l5.42-2.1s.303-.13.38.074c.077.205-.08.307-.08.307z"/></svg>
        <span className="font-bold text-sm">تلگرام شاهرخ</span>
      </a>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-2">
        <a href={botLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#2AABEE] hover:bg-[#229ED9] text-white px-4 py-2 rounded-lg font-semibold text-sm transition">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm3.721 5.26-1.136 5.364s-.106.48-.394.567c-.288.086-1.13-.345-1.716-.63l-2.07-1.34s-.205-.13-.295-.205c-.09-.074-.228-.226-.168-.4.06-.174.38-.253.38-.253l5.42-2.1s.303-.13.38.074c.077.205-.08.307-.08.307z"/></svg>
          @shahrokh_imigration_bot
        </a>
        <a href={startLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-lg font-semibold text-sm transition">
          شروع چت
        </a>
      </div>
    );
  }

  // card (default)
  return (
    <div className="bg-gradient-to-br from-[#2AABEE]/20 to-cyan-500/10 border border-[#2AABEE]/30 rounded-2xl p-6 backdrop-blur">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#2AABEE] flex items-center justify-center flex-shrink-0">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm3.721 5.26-1.136 5.364s-.106.48-.394.567c-.288.086-1.13-.345-1.716-.63l-2.07-1.34s-.205-.13-.295-.205c-.09-.074-.228-.226-.168-.4.06-.174.38-.253.38-.253l5.42-2.1s.303-.13.38.074c.077.205-.08.307-.08.307z"/></svg>
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">گروه مهاجرتی شاهرخ در تلگرام</h3>
          <p className="text-sm text-cyan-200 font-mono">@shahrokh_imigration_bot • آنلاین ۹-۱۷</p>
        </div>
      </div>

      <p className="text-sm text-gray-300 mb-4">
        سریع‌ترین راه مشاوره — روی دکمه بزن، ربات را <b>Start</b> کن، یا فرم زیر را بفرست (مستقیم به تلگرام ادمین می‌رود).
      </p>

      <div className="flex gap-2 mb-6">
        <a href={botLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#2AABEE] hover:bg-[#229ED9] text-white text-center py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm3.721 5.26-1.136 5.364s-.106.48-.394.567c-.288.086-1.13-.345-1.716-.63l-2.07-1.34s-.205-.13-.295-.205c-.09-.074-.228-.226-.168-.4.06-.174.38-.253.38-.253l5.42-2.1s.303-.13.38.074c.077.205-.08.307-.08.307z"/></svg>
          باز کردن ربات
        </a>
        <a href={startLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white text-gray-900 hover:bg-gray-100 text-center py-2.5 rounded-lg font-bold transition">
          Start
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="نام شما *"
          className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          required
        />
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="شماره تماس / تلگرام (اختیاری)"
          dir="ltr"
          className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="پیام شما — مثلاً: می‌خوام با ۲۰۰K ملکی استانبول اقامت بگیرم *"
          rows={3}
          className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
          required
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
        >
          {status === 'sending' ? 'در حال ارسال به تلگرام...' : 'ارسال به تلگرام شاهرخ'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        </button>

        {status === 'success' && <p className="text-sm text-green-400 text-center bg-green-500/10 border border-green-500/20 rounded-lg py-2">✓ پیام به تلگرام شاهرخ ارسال شد — به زودی پاسخ می‌دهیم</p>}
        {status === 'error' && <p className="text-sm text-amber-300 text-center bg-amber-500/10 border border-amber-500/20 rounded-lg py-2 px-3">{errorText} — یا مستقیم: <a href={botLink} target="_blank" className="underline font-bold">t.me/shahrokh_imigration_bot</a></p>}

        <p className="text-xs text-gray-500 text-center">
          با ارسال، به ادمین تلگرام شاهرخ متصل می‌شوید. توکن: <span className="font-mono text-gray-400">...prhmXk</span> — امن نگه‌داری شود.
        </p>
      </form>

      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-400/20 rounded-lg">
        <p className="text-xs text-amber-200">
          ⚠️ <b>امنیت:</b> توکن شما در این چت عمومی ارسال شد. حتما در <b>@BotFather → /revoke</b> توکن را پس از تست عوض کنید و فقط در <code className="bg-black/30 px-1 rounded">.env.local</code> نگه دارید.
        </p>
      </div>
    </div>
  );
};

export default TelegramBotWidget;
