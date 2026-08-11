# تلگرام شاهرخ — راهنمای اتصال ربات

**ربات:** [@shahrokh_imigration_bot](https://t.me/shahrokh_imigration_bot)  
**توکن:** `8945592149:AAHtsQr_ZSzJ2_Esjyl8pVzIKRCaNprhmXk` (در .env.local نگهداری می‌شود)

## ۱. امنیت — همین حالا انجام دهید
توکن شما در این چت عمومی ارسال شد. **حتما عوض کنید:**
1. برو به [@BotFather](https://t.me/BotFather)
2. `/mybots` → `shahrokh_imigration_bot` → `API Token` → `Revoke current token`
3. توکن جدید را در `/.env.local` جایگزین کن:
```
VITE_TELEGRAM_BOT_TOKEN=توکن_جدید
TELEGRAM_BOT_TOKEN=توکن_جدید
```

## ۲. گرفتن Admin Chat ID (برای دریافت فرم‌ها)
1. به [@userinfobot](https://t.me/userinfobot) پیام بده → `Id: 123456789` را کپی کن
2. یا ربات را Start کن، یک پیام بفرست، سپس در مرورگر:
```
https://api.telegram.org/bot<TOKEN>/getUpdates
```
`message.chat.id` را بردار
3. در `.env.local` اضافه کن:
```
VITE_TELEGRAM_ADMIN_CHAT_ID=123456789
TELEGRAM_ADMIN_CHAT_ID=123456789
```
بعد `npm run dev` را ری‌استارت کن. حالا فرم داخل اپ مستقیم به تلگرام شما می‌رود.

## ۳. افزوده شدن به اپ
- **Floating button** پایین راست در تمام صفحات (`App.tsx`)
- **Header** → دکمه تلگرام کنار زبان
- **Footer** → لینک تلگرام
- **صفحه شاهرخ** (`Turkey4XPage.tsx`) → کارت کامل با فرم ارسال به تلگرام + آموزش Start
- **سرویس:** `services/telegramService.ts` — `sendLeadToTelegram()`, `getBotInfo()`, `getBotLink()`

## ۴. اجرای ربات Polling (اختیاری)
ربات می‌تواند به پیام‌های تلگرام جواب دهد:

```bash
npm install node-telegram-bot-api dotenv
node server/telegramBot.js
```
این فایل:
- `/start` → خوشامد + ۴ مسیر
- `/pathway` → ارزیابی
- `/istanbul` → عکس 4K
- پیام عادی → Echo + راهنما

برای Production از **webhook** به‌جای polling استفاده کن (راهنمای Telegraf / Vercel).

## ۵. تست سریع
```bash
curl https://api.telegram.org/bot$VITE_TELEGRAM_BOT_TOKEN/getMe
curl -X POST https://api.telegram.org/bot$VITE_TELEGRAM_BOT/sendMessage -d chat_id=YOUR_ID -d text="تست شاهرخ"
```

## ۶. نکات
- توکن را **هرگز** در گیت کامیت نکن (.gitignore شامل `*.local` است)
- اگر `ADMIN_CHAT_ID` ست نباشد، فرم خطای "مستقیم به ربات پیام دهید" می‌دهد — کاربر به t.me/shahrokh_imigration_bot هدایت می‌شود
- برای WebApp پیشرفته می‌توانی Telegram WebApp SDK را به `index.html` اضافه کنی
