/**
 * OpenRouter Service — for Shahrokh Group
 * Token: sk-or-v1-... (stored in VITE_OPENROUTER_API_KEY / Cloudflare secret OPENROUTER_API_KEY)
 * Handles Turkish, Persian, Arabic, English
 */

const getOpenRouterKey = (): string => {
  const vite = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_OPENROUTER_API_KEY) || '';
  const node = (typeof process !== 'undefined' && (process as any).env?.OPENROUTER_API_KEY) || '';
  const cf = (typeof process !== 'undefined' && (process as any).env?.OPENROUTER_API_KEY) || '';
  return vite || node || cf || '';
};

export const testOpenRouter = async (): Promise<{ ok: boolean; model?: string; error?: string }> => {
  const key = getOpenRouterKey();
  if (!key) return { ok: false, error: 'OPENROUTER_API_KEY not set' };
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    const data = await res.json();
    if (data.data) return { ok: true, model: data.data[0]?.id || 'ok' };
    return { ok: false, error: data.error?.message || 'unknown' };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
};

export const chatWithOpenRouter = async (
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  opts?: { model?: string; lang?: string }
): Promise<string> => {
  const key = getOpenRouterKey();
  if (!key) throw new Error('OPENROUTER_API_KEY not set — add to .env.local and Cloudflare secret');
  const model = opts?.model || 'openai/gpt-3.5-turbo';
  // Add system instruction for Shahrokh context
  const lang = opts?.lang || 'fa';
  const sysMap: Record<string, string> = {
    fa: 'شما دستیار گروه مهاجرتی شاهرخ هستید. به فارسی، دوستانه و دقیق جواب دهید. تخصص: مهاجرت ایران به ترکیه (استانبول).',
    tr: 'Sen Shahrokh Göç Grubu asistanısın. Türkçe, dostane ve net cevap ver. Uzmanlık: İran’dan Türkiye’ye göç.',
    ar: 'أنت مساعد مجموعة شاهرخ للهجرة. أجب بالعربية بود واحترافية. التخصص: الهجرة من إيران إلى تركيا.',
    en: 'You are Shahrokh Immigration assistant. Answer helpfully about Iran to Turkey (Istanbul) immigration.',
  };
  const systemMsg = sysMap[lang] || sysMap['fa'];
  const allMessages = [{ role: 'system' as const, content: systemMsg }, ...messages];

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://shahrokh-immigration.pages.dev',
      'X-Title': 'Shahrokh Immigration',
    },
    body: JSON.stringify({
      model,
      messages: allMessages,
      max_tokens: 800,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `OpenRouter ${res.status}`);
  return data.choices?.[0]?.message?.content || '';
};

// For Cloudflare Pages Function — uses secret OPENROUTER_API_KEY
export const callOpenRouterViaFunction = async (prompt: string, lang: string = 'fa'): Promise<string> => {
  // Try via Pages Function first (uses secret), fallback to direct
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, lang }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.content) return data.content;
    }
  } catch {}
  // Fallback direct
  return chatWithOpenRouter([{ role: 'user', content: prompt }], { lang });
};
