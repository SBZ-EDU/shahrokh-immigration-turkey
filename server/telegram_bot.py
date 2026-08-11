#!/usr/bin/env python3
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ContextTypes

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN") or "YOUR_TELEGRAM_BOT_TOKEN_HERE"
OPENROUTER = os.getenv("OPENROUTER_API_KEY") or "YOUR_OPENROUTER_TOKEN_HERE"
MANAGER = "@immig_1"

async def ask_ai(prompt, lang="fa"):
    import aiohttp
    try:
        async with aiohttp.ClientSession() as s:
            async with s.post("https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENROUTER}", "Content-Type": "application/json"},
                json={"model":"openai/gpt-3.5-turbo","messages":[{"role":"system","content":"شما دستیار شاهرخ هستید. فارسی جواب دهید."},{"role":"user","content":prompt}],"max_tokens":500}) as r:
                j = await r.json()
                return j["choices"][0]["message"]["content"]
    except Exception as e:
        return f"خطای AI: {e}"

def kb_main():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🧭 ارزیابی", callback_data="pathway"), InlineKeyboardButton("🏠 استانبول", callback_data="istanbul")],
        [InlineKeyboardButton("📍 دفاتر", callback_data="office"), InlineKeyboardButton("📞 تماس", callback_data="contact")],
        [InlineKeyboardButton("🌐 سایت", url="https://shahrokh-immigration.pages.dev"), InlineKeyboardButton("🤖 AI", callback_data="ai")],
    ])

async def start(u,c):
    await u.message.reply_text(f"سلام {u.effective_user.first_name}! به شاهرخ خوش اومدی — یکی را انتخاب کن:", reply_markup=kb_main(), parse_mode="Markdown")

async def button(u,c):
    q = u.callback_query
    await q.answer()
    d = q.data
    if d=="pathway":
        await q.message.reply_text("پروفایلت رو بفرست:", reply_markup=InlineKeyboardMarkup([ [InlineKeyboardButton("⚡ 400K", callback_data="exp_400"), InlineKeyboardButton("🏠 200K", callback_data="prop_200")]]))
    elif d=="istanbul":
        await c.bot.send_photo(q.message.chat_id, photo="https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=1200&auto=format&fit=crop", caption="استانبول 🇹🇷", reply_markup=kb_main())
    elif d=="office":
        await q.message.reply_text("📍 تهران + لونت", reply_markup=kb_main())
    elif d=="contact":
        await q.message.reply_text("📞 +90 542...", reply_markup=kb_main())
    elif d=="ai":
        await q.message.reply_text("هر سوالی بپرس — AI جواب میده")
    elif d in ("exp_400","prop_200"):
        ans = await ask_ai("مسیر "+d+" ترکیه را توضیح بده")
        await q.message.reply_text(ans, reply_markup=kb_main())

async def msg(u,c):
    txt = u.message.text
    try: await c.bot.send_message(MANAGER, f"💬 {u.effective_user.first_name}: {txt[:300]}")
    except: pass
    await c.bot.send_chat_action(u.effective_chat.id, "typing")
    ans = await ask_ai(txt)
    await u.message.reply_text(ans, reply_markup=kb_main())

app = Application.builder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(CallbackQueryHandler(button))
app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, msg))
print("Python bot ready — buttons + AI")
app.run_polling()
