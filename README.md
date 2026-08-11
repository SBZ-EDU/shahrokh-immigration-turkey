<div align="center">
<img width="1200" height="475" alt="AI Immigration Visa Assistant" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# AI Immigration Visa Assistant — Fixed Edition

**Your AI companion for navigating global immigration pathways and visa applications.**  
*Fixed branch — 2026-08-11 — see `AUDIT_REPORT.md` and `FIXES_APPLIED.md`*

[![React 19](https://img.shields.io/badge/React-19-blue)]() [![Vite 6](https://img.shields.io/badge/Vite-6-purple)]() [![Gemini 2.5](https://img.shields.io/badge/Gemini-2.5--flash-green)]() [![Languages EN/FA/PT](https://img.shields.io/badge/i18n-EN%20%7C%20FA%20%7C%20PT--BR-orange)]()

Original repo: https://github.com/Websites-by-AI/AI-Iimmigration-visa-assistant-  
AI Studio source: https://ai.studio/apps/drive/1KapPhnJnu3UE1EbJN-NCi3Is8uL7F_5r

---

## ✨ Features (11 pages)

| Page | What it does | AI Model |
|------|--------------|----------|
| **Home** | Hero + service grid | — |
| **Dashboard** | Daily briefing (visa tip, country spotlight, fact, news) | `gemini-2.5-flash` JSON |
| **Eligibility Assessment** | Describe profile + optional doc → 2 distinct pathways | `gemini-2.5-flash` |
| **Destination Visualizer** | Text → city/ambiance images + optional video | `imagen-4.0` + `veo-2.0` |
| **Office Finder** | Geolocation / text search → embassies & centers | `gemini-2.5-flash` + `googleSearch` |
| **AI Consultant** | Streaming chat, voice input | `gemini-2.5-flash` Chat |
| **Pathway Analyzer** | Free-text → structured eligibility analysis | `gemini-2.5-flash` |
| **Immigration News** | Query → Quick / In-Depth / Myth-busting (grounded) | `gemini-2.5-flash` + `googleSearch` |
| **Our Consultants** | Team showcase | — |
| **For Investors** | Pitch + contact | — |
| **My Applications** | Save/restore/delete via IndexedDB | local |

Bilingual EN/FA + **new PT-BR**, RTL/LTR, voice input, quota handling.

---

## 🚀 Quick Start

**Prerequisites:** Node.js 18+

```bash
# 1. Clone (this branch already in /home/user/AI-Immigration-visa-assistant)
cp .env.example .env.local
# edit .env.local → VITE_GEMINI_API_KEY=AIza...  (https://aistudio.google.com/app/apikey)

npm install
npm run dev        # http://localhost:3000
```

**Env:** `VITE_GEMINI_API_KEY` is preferred. `GEMINI_API_KEY` / `API_KEY` also work via `vite.config.ts` shim.

**Build:**
```bash
npm run build   # 59 modules, ~679kB
npm run preview # serve dist
```

---

## 🔧 What was fixed (vs. original)

> Full details: [`AUDIT_REPORT.md`](./AUDIT_REPORT.md) + [`FIXES_APPLIED.md`](./FIXES_APPLIED.md)

- **Naming chaos:** `BaristaCoach`→`AiConsultant`, `CafeFinder`→`OfficeFinder`, `LegalDrafter`→`EligibilityAssessment`, etc. 13 dead templates moved to `.archive/`.
- **Duplicate bug:** Now generates **2 distinct pathways** (Skilled vs. Alternative), not twins.
- **Env:** `VITE_GEMINI_API_KEY` + graceful error, `.env.example`.
- **PT-BR:** Full `pt` translations + 13 `PROMPTS` now respond in Portuguese.
- **Upload:** 10MB + MIME guard, IndexedDB fallback for private mode.
- **Build:** Passes `vite build`.

---

## 🌐 Languages

Header globe → EN / Português (BR) / فارسی. Default auto-detects `navigator.language`. Add more in `constants.ts` → `translations`.

---

## 📁 Project Structure (after fix)

```
AI-Immigration-visa-assistant/
├── components/
│   ├── Home.tsx                    (was Hero)
│   ├── EligibilityAssessment.tsx   (was LegalDrafter)
│   ├── OfficeFinder.tsx            (was CafeFinderPage)
│   ├── AiConsultant.tsx            (was BaristaCoach)
│   ├── PathwayAnalyzer.tsx         (was ConceptAnalyzer)
│   ├── ConsultantsPage.tsx         (was StartupShowcase)
│   ├── DashboardPage.tsx           (was DailyDashboardPage)
│   ├── ImmigrationNews.tsx         (was NewsSummarizer)
│   ├── DestinationVisualizer.tsx   (was DestinationVisualizerPage)
│   ├── InvestorPage.tsx            (was InvestmentPage)
│   ├── MyApplications.tsx          (was MyReportsPage)
│   ├── PathwayDetailModal.tsx      (was MenuModal)
│   ├── Header.tsx / Footer.tsx / Toast.tsx / ...
│   └── [shims] BaristaCoach.tsx etc. → re-export new files
├── .archive/                       # 13 unused templates
├── services/
│   ├── geminiService.ts            # 2-pathway fix, getApiKey()
│   └── dbService.ts                # IndexedDB fallback
├── types.ts                        # Language 'pt', Page 'investor', auto-detect
├── constants.ts                    # +362 pt strings, PROMPTS pt support
├── vite.config.ts                  # VITE_GEMINI_API_KEY shim
├── .env.example
├── AUDIT_REPORT.md
└── FIXES_APPLIED.md
```

---

## 🔑 API & Quotas

- `gemini-2.5-flash`: free 15 RPM / 1500 RPD
- `imagen-4.0` & `veo-2.0`: **require billing** — video fails gracefully without it
- Handle: `QuotaErrorModal` → https://ai.google.dev/gemini-api/docs/billing

---

## 🛣️ Roadmap

- [ ] Replace CDN Tailwind with `npm i -D tailwindcss`
- [ ] Add `react-router-dom` + lazy loading
- [ ] Backend proxy to hide API key
- [ ] Auth (Supabase) for My Applications
- [ ] Vitest + Playwright

---

## 📄 License

GPL-3.0 (original)
