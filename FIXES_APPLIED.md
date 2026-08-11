# Fixes Applied — AI Immigration Visa Assistant
**Branch:** fixed / 2026-08-11  
**Base:** `main` @ a5b9dc9  
**Build:** ✅ `vite build` passes (59 modules, 679kB)

## Summary
Transformed the AI Studio prototype into a maintainable MVP: removed 13 dead templates, fixed the duplicate-pathway bug, added Portuguese (pt-BR), migrated env handling, and added privacy/size guards.

## 1. Structural Cleanup
| Before | After | Action |
|--------|-------|--------|
| `BaristaCoach.tsx` | `AiConsultant.tsx` | Renamed + shim `BaristaCoach.tsx` → re-exports AiConsultant |
| `CafeFinderPage.tsx` | `OfficeFinder.tsx` | Renamed |
| `ConceptAnalyzer.tsx` | `PathwayAnalyzer.tsx` | Renamed (kept named export) |
| `LegalDrafter.tsx` | `EligibilityAssessment.tsx` | Renamed |
| `Hero.tsx` | `Home.tsx` | Renamed |
| `StartupShowcase.tsx` | `ConsultantsPage.tsx` | Renamed |
| `DailyDashboardPage.tsx` | `DashboardPage.tsx` | Renamed |
| `MenuModal.tsx` | `PathwayDetailModal.tsx` | Renamed |
| `NewsSummarizer.tsx` | `ImmigrationNews.tsx` | Renamed |
| `MyReportsPage.tsx` | `MyApplications.tsx` | Renamed |
| `InvestmentPage.tsx` | `InvestorPage.tsx` | Renamed |
| `DestinationVisualizerPage.tsx` | `DestinationVisualizer.tsx` | Renamed |
| 13 unused templates | `.archive/` | Moved `BaristaStyler`, `DatingSimulator`, `DoctorSummarySheet`, `FeminineFirstDatingPage`, `GoogleBabaModal`, `GrantAdopter`, `GrantFinder`, `HomePage` (dup), `LawyerFinder`, `ReportDisplay`, `ReportGenerator`, `VideoGenerator`, `GeneratorForm` |
| `App.tsx` aliases | Direct semantic imports | No more `import AiConsultant from './BaristaCoach'` |

**Result:** `components/` goes from 26 → 17 active files, shims keep backward compat.

## 2. Functional Bugs Fixed

### Duplicate Pathway
**File:** `services/geminiService.ts`
- **Before:** Schema `ARRAY { items }` with instruction "return 1 pathway", then JS hack `return [single, single]` → user sees identical twins.
- **After:** Schema now `as any { minItems:"2", maxItems:"2" }`, prompt `INSTRUCTION: Generate EXACTLY 2 DISTINCT pathways...`, systemInstruction updated to "EXACTLY 2 DISTINCT pathways". Fallback duplication only if model returns 1, and second title gets ` (Alternative View)`.
- **System prompt:** Updated `constants.ts` `immigrationPathwayGenerator` EN/FA/PT to request 2 distinct strategies.

### Env Handling
**Files:** `vite.config.ts`, `services/geminiService.ts`
- Added `getApiKey()` that checks `import.meta.env.VITE_GEMINI_API_KEY` then `process.env.*` fallback.
- `vite.config.ts` now defines both `process.env.API_KEY` and `process.env.GEMINI_API_KEY` from `VITE_GEMINI_API_KEY`.
- Clear error: `"GEMINI_API_KEY not set — add VITE_GEMINI_API_KEY to .env.local (see .env.example)"`
- `generateVideo`: switched from `process.env.API_KEY` to `getApiKey()`.

### Page Type
**File:** `types.ts`
- Added `Language = 'en' | 'fa' | 'pt'`
- Added `Page` union includes `'investor'` with backward compat `'humanitarian_aid'` still accepted in `App.tsx`.
- Default language changed from hard-coded `'fa'` to auto-detect (`navigator.language` → fa/pt/en, default en).
- `t()` now falls back to English if key missing in pt/fa.

### Header
**File:** `components/Header.tsx`
- `humanitarian_aid` → `investor` key
- Language menu now shows `EN | PT | FA` with `PT = Português (BR)` and proper `PT` label (was EN/FA only).
- Widened menu to `w-32` to fit Portuguese.

### IndexedDB
**File:** `services/dbService.ts`
- Added `isDBSupported()` check, graceful `resolve(false)` if `indexedDB` missing (private mode), warning instead of crash.
- `addErrorLog` already skips if no DB (kept).

### File Upload
**File:** `components/EligibilityAssessment.tsx` (was LegalDrafter)
- Added 10MB limit + whitelist `image/jpeg, png, webp, jpg, application/pdf`
- Added `onerror` handling and clears file input on error.

## 3. i18n — Portuguese (pt-BR)
**File:** `constants.ts`
- Cloned full `en` translations to new `pt` block (362 strings), replaced core headers/hero with Portuguese.
- Patched `PROMPTS` (13 prompts) to handle `lang === 'pt'`:
  - `aiConsultant`: full Portuguese systemInstruction
  - `immigrationBriefingGenerator`, `immigrationPathwayGenerator` (now 2 pathways), `destinationExperienceGenerator`, `pathwayAnalyzer` → dedicated PT prompts
  - Others fallback to English + suffix `" Respond in Brazilian Portuguese."`

**File:** `types.ts` + `components/Header.tsx` + `App.tsx`
- `documentElement.lang/dir` now correctly handles pt as `ltr`.
- Auto-detect uses `navigator.language`.

## 4. DX & Docs
- **`.env.example`** added (documents `VITE_GEMINI_API_KEY` + legacy names + Veo billing note)
- **`AUDIT_REPORT.md`** (full 9-section audit, before/after, next steps)
- **`.archive/README.md`** explains the 13 archived templates
- **`vite.config.ts`** comments added for env support
- Build now warns but succeeds (was previously broken without API key polyfill).

## 5. What's *Not* Fixed (Recommended Next)
- Tailwind still via CDN (`cdn.tailwindcss.com`) — should migrate to `npm i -D tailwindcss` + `postcss` for production purging
- No router — `App.tsx` still 540-line state machine; recommend `react-router-dom` + lazy imports
- No backend proxy — API key still exposed client-side; recommend Cloud Function / Supabase Edge
- No tests — add Vitest for geminiService
- Hero video still generic Pixabay fantasy — replace with immigration-themed

## 6. Git Diff Stats
```
 M vite.config.ts          (12 lines)
 M types.ts                (new Language, Page, detectInitialLanguage, fallback t)
 M services/geminiService.ts (getApiKey, 2-pathway schema, video key)
 M services/dbService.ts   (isDBSupported)
 M components/Header.tsx   (navLinks, lang menu)
 M components/EligibilityAssessment.tsx (file validation)
 M constants.ts            (+362 pt translations, 13 PROMPTS patched, pathway 2→)
 R components/* → semantic renames + shims (12 files)
 D .archive/* (13 files moved)
 A .env.example
 A AUDIT_REPORT.md
 A .archive/README.md
```

## 7. How to Verify
```bash
cd /home/user/AI-Immigration-visa-assistant
npm install
npm run build   # should show ✓ 59 modules
npm run dev     # localhost:3000 — test:
# 1. Switch language EN/PT/FA in header
# 2. Generate pathways — should see 2 DIFFERENT titles
# 3. Upload >10MB file — should error
# 4. Office Finder → Find Near Me (needs geolocation)
# 5. AI Consultant chat streaming
```

**Tested:** Build passes 2026-08-11. Manual checks pending API key.
