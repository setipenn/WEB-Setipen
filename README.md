# VocaSMK - Gamified Vocational English Learning Platform 🇮🇩

A complete, production-ready gamified English vocabulary learning web app designed specifically for **vocational high school (SMK) students in Indonesia**. 

Mobile-first, bandwidth-efficient, and optimized for low-spec smartphones used across vocational schools in Indonesia.

---

## 🌟 Tech Stack & Architecture

- **Frontend:** React 19 + TypeScript + Tailwind CSS (Vite-based SPA)
- **State & Gamification:** Reactive Context store with localStorage persistence & deterministic XP / Spaced Repetition engine
- **Backend Proxy & AI:** Express.js + `@google/genai` TypeScript SDK (server-side only, no exposed API keys)
- **Database & Auth:** Supabase (PostgreSQL with Row Level Security policies) + Embedded deterministic fallback
- **Audio & Animations:** Offline Web Audio API synth tones (zero latency, zero 404s), Web Speech API for authentic English pronunciations, Framer Motion, and `canvas-confetti` celebrations.

---

## 🚀 Key Features

1. **Points & Level System (Level 1–50):**
   - Base XP (10 points) + Speed Demon bonus (answering under 3 seconds) + Streak multiplier (up to 2.0x).
   - Indonesian Vocational Ranks: *Pemula Kejuruan*, *Penjelajah Kosakata*, *Pemburu Kata*, *Pendekar Bahasa*, *Ahli Kosakata*, and *Legenda Kata SMK*.
   - Animated XP bar and celebratory level-up modal.

2. **22 Badges & Achievements:**
   - 22 distinct badges across Quiz, Streak, Speed, and Vocab categories with full modal inspection and unlock criteria.
   - Greyscale locked vs. colored unlocked gallery with unlock timestamps.

3. **Leaderboard with Realtime Podium:**
   - Tabs: **Kelas** (Class), **Sekolah** (School), **Jurusan** (Major), **Mingguan** (Weekly), and **Sepanjang Waktu** (All-time).
   - 3D Gold/Silver/Bronze podium with glowing crowns.
   - Privacy mode toggle ("Hanya Nickname") for student privacy.

4. **Interactive Quiz Engine (7 Question Types):**
   - Multiple Choice
   - Fill in the blank (Typing with fuzzy matching)
   - Matching pairs (English term to Indonesian meaning)
   - Drag & drop / Sentence arrangement
   - True / False
   - Listening audio pronunciation (with speed controls)
   - Word scramble
   - Lives/Hearts system, question countdown timer, in-quiz power-ups (50/50, Extra Time +15s, Skip), instant feedback, and **"Ulangi Soal Salah" (Retry Missed Questions)** mode.

5. **Learning Materials & Flashcards:**
   - Organized by 8 Vocational Majors: **TKJ, RPL, Akuntansi, Perhotelan, Otomotif, Pemasaran, Keperawatan, Umum**.
   - 3D Flip Card flashcards with spaced-repetition algorithm ("Masih Belajar" vs. "Sudah Hafal").
   - Personal **"Bank Kataku" (Word Bank)** with custom study notes and export capability.

6. **Teacher Portal & Management:**
   - Class creation with auto-generated 6-character access codes (e.g. `TKJ10A`).
   - Manual Question Bank manager across all 7 question types.
   - Bulk CSV Import with instant error validation table before saving.
   - Quiz Builder with passing score and class assignment.
   - Weak-Topic Analytics Heatmap identifying students' common mistakes.
   - Export student scores to CSV.

7. **Kahoot-Style Live Quiz Mode:**
   - Host room with 6-digit PIN on projector.
   - Realtime synchronized countdown and scoreboard between questions.

8. **Gemini AI Features:**
   - **Kak Voca AI Mentor:** Multi-turn vocational English conversation.
   - **Vocational Photo Scanner (`gemini-4-argon`):** Analyze workshop, lab, or office photos to extract English terminology and workplace examples.
   - **High Thinking Mode (`gemini-4-carbon` with `ThinkingLevel.HIGH`):** Deep linguistic breakdown of complex vocational terminology and formal email drafting.

9. **Virtual Shop & Verified Certificate Generator:**
   - Spend earned coins on avatar frames and power-up refills.
   - Printable / Downloadable official Certificate of Vocational English Competency with unique verification code.

---

## 🛠️ Environment Variables (`.env`)

```env
# Gemini API Key (Injected automatically in AI Studio via Settings > Secrets)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Optional Supabase Connection (Leave blank to use embedded reactive store)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

PORT=3000
```

---

## 📦 Setup & Deployment

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npx tsx --test src/utils/gamification.test.ts

# 3. Start development server
npm run dev
# App will run at http://localhost:3000
```

### Deploying to Supabase
1. Create a project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run `supabase/schema.sql`.
4. Paste and run `supabase/seed.sql` to populate badges, topics, and initial questions.

### Deploying to Vercel
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Under **Environment Variables**, add `GEMINI_API_KEY`.
4. Build command: `npm run build`, output directory: `dist`.
