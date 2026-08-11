export interface Env {
  OPENROUTER_API_KEY?: string;
  HF_TOKEN?: string;
  DB?: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { OPENROUTER_API_KEY, HF_TOKEN } = ctx.env;
  const { prompt, lang = 'fa', model = 'openai/gpt-3.5-turbo' } = await ctx.request.json() as any;
  
  if (!prompt) return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400 });

  // Try OpenRouter first
  const key = OPENROUTER_API_KEY || HF_TOKEN;
  if (!key) {
    return new Response(JSON.stringify({ error: 'AI keys not configured. Set OPENROUTER_API_KEY in Cloudflare Pages secrets.' }), { status: 500 });
  }

  const sysMap: Record<string, string> = {
    fa: 'شما دستیار گروه مهاجرتی شاهرخ هستید. به فارسی، دوستانه و دقیق جواب دهید. تخصص: مهاجرت ایران به ترکیه.',
    tr: 'Sen Shahrokh Göç Grubu asistanısın. Türkçe, dostane ve net cevap ver.',
    ar: 'أنت مساعد مجموعة شاهرخ للهجرة. أجب بالعربية بود واحترافية.',
    en: 'You are Shahrokh Immigration assistant. Answer helpfully in English about Iran to Turkey immigration.',
    pt: 'Você é assistente do Grupo Shahrokh. Responda em português brasileiro de forma útil sobre imigração Irã-Turquia.',
  };
  const sys = sysMap[lang] || sysMap['en'];

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://shahrokh-immigration.pages.dev',
        'X-Title': 'Shahrokh',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: sys }, { role: 'user', content: prompt }],
        max_tokens: 600,
      }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'OpenRouter error');
    const content = data.choices?.[0]?.message?.content || '';
    return new Response(JSON.stringify({ content, usage: data.usage }), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const hasKey = !!ctx.env.OPENROUTER_API_KEY;
  return new Response(JSON.stringify({ ok: true, hasKey, model: 'openai/gpt-3.5-turbo', lang: 'fa' }), { headers: { "Content-Type": "application/json" } });
};
