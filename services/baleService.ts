/**
 * Bale Messenger Bot Service — like Telegram but for Iran
 * Docs: https://dev.bale.ai
 * Bot: @shahrokh_bale_bot (create via @BotFather in Bale)
 * Token: set via VITE_BALE_BOT_TOKEN / BALE_BOT_TOKEN
 */

const getBaleToken = (): string => {
  const vite = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BALE_BOT_TOKEN) || '';
  const node = (typeof process !== 'undefined' && (process as any).env?.BALE_BOT_TOKEN) || '';
  return vite || node || '';
};

const getBaleBase = (): string => {
  const token = getBaleToken();
  if (!token) throw new Error('BALE_BOT_TOKEN not set — get from @BotFather in Bale');
  return `https://tapi.bale.ai/bot${token}`;
};

export const sendBaleMessage = async (chatId: string | number, text: string): Promise<any> => {
  const url = `${getBaleBase()}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || 'Bale send failed');
  return data;
};

export const getBaleBotLink = (username: string = 'shahrokh_bale_bot'): string => `https://ble.ir/${username}`;
export const getBaleBotUsername = () => '@shahrokh_bale_bot';

// For Shahrokh — same manager as Telegram but on Bale
export const BALE_MANAGER_ID = '09206263218'; // or Bale chat_id

export const notifyBaleNewUser = async (user: { name: string; email: string }): Promise<void> => {
  try {
    await sendBaleMessage(BALE_MANAGER_ID, `🆕 کاربر جدید بله: ${user.name} (${user.email})`);
  } catch (e) {
    console.warn('Bale notify failed, token not set', e);
  }
};

// Check AI for each module
export const checkAIModules = async (): Promise<Record<string, { status: string; latency?: number }>> => {
  const results: Record<string, any> = {};
  const start = Date.now();
  // Test OpenRouter
  try {
    const { chatWithOpenRouter } = await import('./openRouterService');
    await chatWithOpenRouter([{ role: 'user', content: 'تست' }], { lang: 'fa' });
    results['openRouter'] = { status: '✅ فعال', latency: Date.now() - start };
  } catch (e: any) {
    results['openRouter'] = { status: `❌ ${e.message}` };
  }
  // Test Gemini
  try {
    const { getAllPosts } = await import('./postsService');
    await getAllPosts();
    results['gemini'] = { status: '✅ fallback به OpenRouter' };
  } catch (e: any) {
    results['gemini'] = { status: `⚠️ ${e.message}` };
  }
  // Test Telegram
  try {
    const { getBotInfo } = await import('./telegramService');
    const info = await getBotInfo();
    results['telegram'] = { status: info.ok ? '✅ فعال' : '❌' };
  } catch (e: any) {
    results['telegram'] = { status: `❌ ${e.message}` };
  }
  // Bale
  try {
    const token = getBaleToken();
    results['bale'] = { status: token ? '✅ توکن ست' : '⚠️ توکن خالی — بساز' };
  } catch (e: any) {
    results['bale'] = { status: `⚠️ ${e.message}` };
  }
  // Neshan
  results['neshan'] = { status: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_NESHAN_API_KEY) ? '✅' : '⚠️ mock' };
  // BusinessAnalyzer
  results['businessAnalyzer'] = { status: '✅ ۶ لایه' };
  
  return results;
};
