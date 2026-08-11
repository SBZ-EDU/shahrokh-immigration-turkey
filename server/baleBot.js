/**
 * Bale Bot for Shahrokh — like Telegram but for Bale.ir
 * Create bot via @BotFather in Bale app -> /newbot -> get token
 * Run: BALE_BOT_TOKEN=xxx node server/baleBot.js
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const token = process.env.BALE_BOT_TOKEN || process.env.VITE_BALE_BOT_TOKEN || 'YOUR_BALE_TOKEN_HERE';
const BALE_API = `https://tapi.bale.ai/bot${token}`;

if (!token || token.includes('YOUR_')) {
  console.log('⚠️ BALE_BOT_TOKEN not set — create bot in Bale via @BotFather, then set token in .env.local');
  console.log('   Example: BALE_BOT_TOKEN=123456:ABC... node server/baleBot.js');
}

let offset = 0;
async function poll() {
  try {
    const res = await fetch(`${BALE_API}/getUpdates?offset=${offset}&timeout=20`);
    const data = await res.json();
    if (data.ok && data.result) {
      for (const upd of data.result) {
        offset = upd.update_id + 1;
        const msg = upd.message;
        if (!msg) continue;
        const chatId = msg.chat.id;
        const text = msg.text || '';
        console.log(`📩 Bale from ${msg.from.first_name}: ${text.slice(0,50)}`);
        
        if (text.startsWith('/start')) {
          await fetch(`${BALE_API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `سلام ${msg.from.first_name}! به گروه شاهرخ (بله) خوش اومدی\n\n🇹🇷 ۴ مسیر: اکسپرس/ملکی/تحصیلی/کاری\n\nدستورات:\n/pathway — ارزیابی\n/istanbul — عکس\n/contact — تماس`,
              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [{ text: '🧭 ارزیابی', callback_data: 'pathway' }, { text: '🏠 استانبول', callback_data: 'istanbul' }],
                  [{ text: '🌐 سایت', url: 'https://shahrokh-immigration.pages.dev' }],
                ]
              })
            })
          });
        } else {
          // AI echo via OpenRouter
          const openKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
          let aiReply = `پیامت رو گرفتم: "${text.slice(0,100)}" — /pathway بزن`;
          if (openKey) {
            try {
              const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: { Authorization: `Bearer ${openKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'openai/gpt-3.5-turbo', messages: [{ role: 'system', content: 'شما دستیار شاهرخ هستید. فارسی.' }, { role: 'user', content: text }], max_tokens: 300 })
              });
              const aiData = await aiRes.json();
              aiReply = aiData.choices?.[0]?.message?.content || aiReply;
            } catch {}
          }
          await fetch(`${BALE_API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: aiReply })
          });
        }
      }
    }
  } catch (e) {
    console.error('Bale poll error', e.message);
  }
  setTimeout(poll, 1000);
}

if (token && !token.includes('YOUR_')) {
  console.log('🤖 Bale Bot polling...', token.slice(0,10)+'...');
  poll();
} else {
  console.log('Bale bot not started — token missing');
}
