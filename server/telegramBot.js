/**
 * Shahrokh Telegram Bot — with Buttons + AI (OpenRouter)
 * Bot: @shahrokh_imigration_bot
 * Token: set via TELEGRAM_BOT_TOKEN in .env.local or Cloudflare Secret
 * AI: OPENROUTER_API_KEY (sk-or-v1-065c...) — fallback to direct
 */

import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const token = process.env.TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN_HERE';
const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || 'YOUR_OPENROUTER_TOKEN_HERE';

if (!token || token.includes('your_')) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
console.log('🤖 Shahrokh Bot running... @shahrokh_imigration_bot');
console.log('   Token:', token.slice(0, 10) + '...' + token.slice(-6));
console.log('   AI:', openRouterKey ? openRouterKey.slice(0, 15) + '...' : 'none');
console.log('   Admin: @immig_1 (history)');

// Keyboards — why no buttons before: we only had commands, now inline keyboards
const mainKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🧭 ارزیابی ۲ مسیر', callback_data: 'pathway' }, { text: '🏠 استانبول', callback_data: 'istanbul' }],
      [{ text: '📍 دفاتر', callback_data: 'office' }, { text: '📞 تماس', callback_data: 'contact' }],
      [{ text: '🌐 سایت شاهرخ', url: 'https://shahrokh-immigration.pages.dev' }, { text: '💬 مشاور AI', callback_data: 'ai' }],
    ]
  }
};

const pathwayKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '⚡ اکسپرس ۴۰۰K', callback_data: 'exp_400' }, { text: '🏠 ملکی ۲۰۰K', callback_data: 'prop_200' }],
      [{ text: '🎓 تحصیلی', callback_data: 'study' }, { text: '💼 کاری', callback_data: 'work' }],
      [{ text: '🔙 بازگشت', callback_data: 'home' }],
    ]
  }
};

// AI helper
async function askAI(prompt, lang = 'fa') {
  if (!openRouterKey) return '⚠️ کلید OpenRouter ست نشده — در .env.local بگذار: OPENROUTER_API_KEY=sk-or-v1-...';
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://shahrokh-immigration.pages.dev',
        'X-Title': 'Shahrokh Bot',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: lang === 'fa' ? 'شما دستیار گروه مهاجرتی شاهرخ هستید. به فارسی، دوستانه و دقیق جواب دهید. تخصص: مهاجرت ایران به ترکیه.' : 'You are Shahrokh assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 600,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'AI error');
    return data.choices?.[0]?.message?.content || 'پاسخی نرسید';
  } catch (e) {
    return `⚠️ خطای هوش مصنوعی: ${e.message} — توکن را چک کن: ${openRouterKey.slice(0, 12)}...`;
  }
}

// /start with buttons
bot.onText(/\/start(.*)/, (msg) => {
  const name = msg.from.first_name || 'دوست عزیز';
  bot.sendMessage(msg.chat.id,
    `سلام ${name}! 👋\n\n` +
    `به *گروه مهاجرتی شاهرخ* — ایران به استانبول خوش اومدی.\n\n` +
    `🇹🇷 ۴ مسیر شفاف — یکی را انتخاب کن:`,
    { parse_mode: 'Markdown', ...mainKeyboard }
  );
});

// Callback queries — buttons
bot.on('callback_query', async (q) => {
  const chatId = q.message.chat.id;
  const data = q.data;
  await bot.answerCallbackQuery(q.id);
  
  if (data === 'pathway') {
    bot.sendMessage(chatId, `🧭 *ارزیابی شاهرخ*\n\nپروفایلت رو بفرست:\n"من ۳۰ ساله، لیسانس کامپیوتر، ۵ سال سابقه، بودجه ۲۰۰K"\n\nیا یکی را انتخاب کن:`, { parse_mode: 'Markdown', ...pathwayKeyboard });
  } else if (data === 'istanbul') {
    bot.sendPhoto(chatId, 'https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=1200&auto=format&fit=crop', { caption: 'استانبول — بسفروس 🇹🇷', ...mainKeyboard });
  } else if (data === 'office') {
    bot.sendMessage(chatId, `📍 *دفاتر:*\n• تهران — مدارک\n• لونت شیشلی ۳۴۴۰۳\n• Göç İdaresi`, { parse_mode: 'Markdown', ...mainKeyboard });
  } else if (data === 'contact') {
    bot.sendMessage(chatId, `📞 +90 542 177 2753\n🇮🇷 +98 921 774 4051\n@immig_1 (مدیریت)`, { parse_mode: 'Markdown', ...mainKeyboard });
  } else if (data === 'ai') {
    bot.sendMessage(chatId, `🤖 *هوش مصنوعی شاهرخ* — هر سوالی بپرس، با OpenRouter جواب می‌دهم:\nمثلا: "هزینه اقامت ملکی چقدره؟"`, { parse_mode: 'Markdown' });
  } else if (data === 'home') {
    bot.sendMessage(chatId, `به منو برگشتی:`, mainKeyboard);
  } else if (['exp_400','prop_200','study','work'].includes(data)) {
    const map = { exp_400: 'اکسپرس ۴۰۰K', prop_200: 'ملکی ۲۰۰K', study: 'تحصیلی', work: 'کاری' };
    const reply = await askAI(`کاربر مسیر ${map[data]} ترکیه را می‌خواهد. ۲ مسیر متمایز با هزینه و مراحل بگو.`);
    bot.sendMessage(chatId, reply, { ...mainKeyboard });
  }
});

// Text — AI
bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  // Notify @immig_1
  try {
    await bot.sendMessage('@immig_1', `💬 از ${msg.from.first_name} (@${msg.from.username || '—'}):\n${msg.text.slice(0,500)}`);
  } catch {}
  
  // AI answer
  bot.sendChatAction(msg.chat.id, 'typing');
  const answer = await askAI(msg.text, 'fa');
  bot.sendMessage(msg.chat.id, answer, { reply_to_message_id: msg.message_id, ...mainKeyboard });
});

bot.on('polling_error', (e) => console.error('Polling:', e.message));
console.log('✅ Buttons + AI ready — /start را بزن تا دکمه‌ها را ببینی');

// Allow token update via /settoken (only for @immig_1 or super admin)
bot.onText(/\/settoken (.+)/, (msg, m) => {
  if (msg.from.username !== 'immig_1' && msg.chat.id.toString() !== process.env.TELEGRAM_ADMIN_CHAT_ID) {
    return bot.sendMessage(msg.chat.id, '⛔ فقط @immig_1');
  }
  // In real, save to DB/env — here just confirm
  bot.sendMessage(msg.chat.id, `✅ توکن دریافت شد: ${m[1].slice(0,12)}... — در .env.local ذخیره کن و ریستارت کن.`);
});
