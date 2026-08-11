/**
 * Telegram Bot Service for Group Shahrokh
 * Bot: @shahrokh_imigration_bot
 * Token: stored in VITE_TELEGRAM_BOT_TOKEN (or TELEGRAM_BOT_TOKEN for server)
 * 
 * SECURITY: Never commit token to git. Use .env.local
 */

const getTelegramToken = (): string => {
  // Vite client-side (VITE_ prefix required)
  const viteToken = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TELEGRAM_BOT_TOKEN) || '';
  // Server / legacy
  const nodeToken = (typeof process !== 'undefined' && ((process as any).env?.TELEGRAM_BOT_TOKEN || (process as any).env?.VITE_TELEGRAM_BOT_TOKEN)) || '';
  return viteToken || nodeToken || '';
};

const getTelegramApiBase = (): string => {
  const token = getTelegramToken();
  if (!token) throw new Error('Telegram bot token not set. Add VITE_TELEGRAM_BOT_TOKEN to .env.local');
  return `https://api.telegram.org/bot${token}`;
};

export interface TelegramSendResult {
  ok: boolean;
  result?: any;
  description?: string;
}

/**
 * Send a message via bot to a specific chat_id
 * For admin notifications, use your own chat_id (get via @userinfobot)
 */
export const sendTelegramMessage = async (chatId: string | number, text: string, opts?: { parseMode?: 'HTML' | 'Markdown' }): Promise<TelegramSendResult> => {
  const url = `${getTelegramApiBase()}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: opts?.parseMode || 'HTML',
    }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || 'Telegram send failed');
  return data;
};

/**
 * Send contact/lead form to Telegram admin
 * Uses admin chatId from env or defaults to bot's own updates (user must start bot first)
 */
export const sendLeadToTelegram = async (lead: {
  name: string;
  phone?: string;
  email?: string;
  message: string;
  pathway?: string;
  source?: string;
}): Promise<TelegramSendResult> => {
  // Admin chat ID - you can set VITE_TELEGRAM_ADMIN_CHAT_ID in .env.local
  // To find your chat ID: message @userinfobot or @getidsbot on Telegram
  const viteAdmin = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TELEGRAM_ADMIN_CHAT_ID) || '';
  const nodeAdmin = (typeof process !== 'undefined' && (process as any).env?.TELEGRAM_ADMIN_CHAT_ID) || '';
  const adminChatId = viteAdmin || nodeAdmin;

  if (!adminChatId) {
    console.warn('TELEGRAM_ADMIN_CHAT_ID not set — lead will not be forwarded. Set it in .env.local (e.g., 123456789)');
    // Still return success so UI doesn't break, but log lead
    console.log('Lead (not sent):', lead);
    throw new Error('Admin chat not configured. Please contact via https://t.me/shahrokh_imigration_bot directly.');
  }

  const text = `
🛂 <b>درخواست جدید — گروه مهاجرتی شاهرخ</b>

👤 <b>نام:</b> ${lead.name}
${lead.phone ? `📞 <b>تلفن:</b> ${lead.phone}` : ''}
${lead.email ? `📧 <b>ایمیل:</b> ${lead.email}` : ''}
${lead.pathway ? `🗺️ <b>مسیر:</b> ${lead.pathway}` : ''}
${lead.source ? `📍 <b>منبع:</b> ${lead.source}` : ''}

💬 <b>پیام:</b>
${lead.message}

⏰ ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}
  `.trim();

  return sendTelegramMessage(adminChatId, text, { parseMode: 'HTML' });
};

export const getBotInfo = async (): Promise<any> => {
  const url = `${getTelegramApiBase()}/getMe`;
  const res = await fetch(url);
  return res.json();
};

export const getBotLink = (): string => 'https://t.me/shahrokh_imigration_bot';
export const getBotUsername = (): string => '@shahrokh_imigration_bot';

// Helper to build deep link with start param (e.g., pathway prefill)
export const getBotStartLink = (payload?: string): string => {
  if (!payload) return getBotLink();
  return `https://t.me/shahrokh_imigration_bot?start=${encodeURIComponent(payload)}`;
};
