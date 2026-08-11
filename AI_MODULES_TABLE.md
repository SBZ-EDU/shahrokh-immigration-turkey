# ماژول‌های هوش مصنوعی سایت — گروه مهاجرتی شاهرخ

> تست شده در ۱۱ آگوست ۲۰۲۶ — دامنه: shahrokh-immigration.pages.dev / immigration.exhibition2world.ir

| # | ماژول | فایل سرویس | مدل / Provider | کاربرد در سایت | زبان‌ها | توکن / کلید | وضعیت تست | هزینه |
|---|-------|------------|----------------|----------------|----------|-------------|-----------|--------|
| 1 | **Gemini Chat** | `services/geminiService.ts` → `startChat()` | `gemini-2.5-flash` (Google) | مشاور هوشمند (صفحه AI Consultant) — چت استریمینگ | fa, tr, ar, en, pt | `VITE_GEMINI_API_KEY` (خالی) | ⚠️ بدون کلید — fallback به OpenRouter | رایگان 15 RPM |
| 2 | **Gemini Pathway** | `generateImmigrationPathways()` | `gemini-2.5-flash` JSON | تولید ۲ مسیر متمایز ترکیه (ارزیابی شاهرخ) | ۵ زبان | GEMINI | ⚠️ نیاز به کلید — در صورت خطا به OpenRouter سوییچ می‌کند | - |
| 3 | **Gemini Briefing** | `generateImmigrationBriefing()` | `gemini-2.5-flash` JSON | داشبورد روزانه (Visa Tip, Country Spotlight) | ۵ زبان | GEMINI | ⚠️ — | - |
| 4 | **Gemini Destination** | `generateDestinationExperienceText()` | `gemini-2.5-flash` | تجسم مقصد (culturalInsights, jobMarket) | ۵ زبان | GEMINI | ⚠️ — | - |
| 5 | **Imagen** | `generateImage()` | `imagen-4.0-generate-001` | تولید تصویر بسفروس + ambiance (۱۶:۹) | — | GEMINI | ⚠️ نیاز به billing | پولی |
| 6 | **Veo** | `generateVideo()` | `veo-2.0-generate-001` | ویدیوی Destination Visualizer | — | GEMINI | ⚠️ نیاز به billing | پولی |
| 7 | **OpenRouter Primary** | `services/openRouterService.ts` + `functions/api/ai.ts` | `openai/gpt-3.5-turbo` (402 مدل) | **جایگزین اصلی Gemini** — همه چت‌ها، ارزیابی، تحلیل مسیر | fa, tr, ar, en | `sk-or-v1-065c...17b8` (جدید) + `sk-or-v1-bc27...eed` + `sk-or-v1-f995...3789` | ✅ **فعال** — تست `402 models`, `سلام شاهرخ` برگشت، `POST /api/ai` → فارسی OK | $0.0003/1K |
| 8 | **OpenRouter Fallback** | `callOpenRouterViaFunction()` | `openai/gpt-3.5-turbo` | Fallback اگر Gemini خطا دهد | ۵ زبان | OPENROUTER_API_KEY (Cloudflare Secret) | ✅ hasKey:true | - |
| 9 | **Telegram Bot** | `services/telegramService.ts` + `server/telegramBot.js` | `@shahrokh_imigration_bot` (8945592149) | اطلاع‌رسانی ثبت‌نام/ورود به `@immig_1` + چت | fa | `8945592149:AAH...prhmXk` | ✅ `getMe` ok, pending 2, send to @immig_1 needs Start | رایگان |
| 10 | **HuggingFace RAG** | `HF_TOKEN` (2 توکن) | `hf_pnYa...` + `hf_SZ...` | RAG برای قوانین ترکیه (آینده) | fa, tr | `HF_TOKEN` Secret | ⚠️ ست شده ولی Function ندارد — آماده | رایگان |
| 11 | **Google Search Grounded** | `generateImmigrationNews()` + `findOfficialOffices()` | `gemini-2.5-flash` + `tools: [{googleSearch}]` | اخبار مهاجرت (۳ مود) + دفتر یاب | ۵ زبان | GEMINI | ⚠️ نیاز به GEMINI | - |
| 12 | **Three.js + GSAP** | `components/Hero3D.tsx` | `three@0.160` + `gsap@3` | هیروی ۳بعدی (خانه مینیمال + پل) — الهام Claw3D/MindStudio | — | — | ✅ 1.17MB bundle, deployed | - |
| 13 | **Cloudflare D1** | `functions/api/posts.ts`, `schema.sql` | `neginjam-db` (reuse, max 10) | ذخیره نوشته‌های ادمین/کاربر (WordPress-like) | — | `DB` binding | ✅ Table `shahrokh_posts` created, fallback IndexedDB | رایگان |
| 14 | **Cloudflare R2** | `wrangler.toml` | `shahrokh-media` | مدیا وردپرس (عکس‌ها) | — | `R2_ACCESS_KEY` | ⚠️ `not enabled` — fallback local | - |

## جزئیات تست (۱۱ آگوست ۲۰۲۶)

| تست | دستور | نتیجه |
|-----|--------|--------|
| **OpenRouter models** | `curl -H "Bearer sk-or-v1-065c..." https://openrouter.ai/api/v1/models` | ✅ `402 models`, first `sakana/sakana-namazu` |
| **OpenRouter chat** | `POST /api/v1/chat/completions` با `openai/gpt-3.5-turbo` | ✅ `سلام! چطور می‌توانم...` |
| **Cloudflare AI** | `GET https://shahrokh-immigration.pages.dev/api/ai` | ✅ `{"ok":true,"hasKey":true}` |
| **Cloudflare AI POST** | `POST /api/ai {"prompt":"تست","lang":"fa"}` | ✅ `سلام، من دستیار شاهرخ هستم...` |
| **Telegram getMe** | `GET https://api.telegram.org/bot8945.../getMe` | ✅ `shahrokh_imigration_bot` |
| **Telegram @immig_1** | `POST sendMessage chat_id=@immig_1` | ❌ `chat not found` — کاربر باید اول `/start` بزند، بعد `getUpdates` |
| **D1** | `wrangler d1 execute neginjam-db --command="CREATE TABLE shahrokh_posts"` | ✅ `success, 0.184ms` |
| **R2** | `wrangler r2 bucket list` | ❌ `not enabled` |
| **Build** | `npm run build` | ✅ 75 modules, 1,170kB |

## نمودار معماری

```
[User fa/tr/ar] → Header (FA/TR/AR/EN/PT) → Hero3D (Three.js+GSAP+Video AI)
    ↓
[Eligibility] → geminiService (Gemini) → fallback → openRouterService (OpenRouter sk-or-v1-065c) → D1/IndexedDB
    ↓
[Telegram] → AuthContext → notify @immig_1 (history)
    ↓
[Admin /admin] → postsService → /api/posts → D1 (neginjam-db) fallback IndexedDB → R2 (media)
```

## پیشنهادات بعدی (برای “تختی” کامل)

- [ ] Gemini کلید `VITE_GEMINI_API_KEY` را از aistudio.google.com بگیر و در `.env.local` + `wrangler secret put GEMINI_API_KEY` بگذار — آنگاه همه ۱۱ ماژول بدون fallback کار می‌کنند
- [ ] R2 را در Dashboard → R2 → Enable کن → `wrangler r2 bucket create shahrokh-media`
- [ ] یک D1 اختصاصی بساز (الان reuse `neginjam-db` چون سقف ۱۰) — یک DB قدیمی را `wrangler d1 delete` کن
- [ ] برای @immig_1: بهش بگو `@shahrokh_imigration_bot` را Start بزند، بعد `getUpdates` بزن تا chat_id عددی را بگیری و در `.env` بگذاری

---
*تولید خودکار — ۱۱ آگوست ۲۰۲۶ — گروه شاهرخ*
