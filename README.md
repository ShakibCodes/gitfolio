<div align="center">

# ⚡ GitFolio 2.0 — Developer Intelligence & Showcase Platform

### Transform any GitHub profile into an executive developer portfolio, 1v1 battle arena, and AI-powered intelligence dossier.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![GitHub API](https://img.shields.io/badge/GitHub-REST%20API-181717?style=flat-square&logo=github)](https://docs.github.com/en/rest)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)

<br/>

**GitFolio 2.0** goes beyond generic profile viewers. It turns any GitHub username into a high-caliber intelligence dashboard, complete with algorithmic developer grading, 1v1 developer battles, a client-ready showcase portfolio with printable PDF resumes, and an intelligent AI technical recruiter and code roaster that works out-of-the-box.

<br/>

</div>

---

## 🚀 What's New in GitFolio 2.0

| Feature | Description |
|---|---|
| 🏆 **Developer Score & Tier (0–100)** | Algorithmic grading across 5 pillars: Star Power, Code Velocity, Consistency Streak, Polyglot Breadth, and Community Footprint, with tiers from C to S+. |
| 💼 **Showcase & Printable Resume Mode** | Toggle into a client-ready developer portfolio view. Features a one-click print engine formatted for crisp, 1-page executive PDF resumes. |
| ⚔️ **1v1 Developer Versus Mode** | Battle two developers head-to-head on scores, stars, repos, followers, and languages with dynamic winner badges. |
| 🤖 **Dual-Engine AI Intelligence** | High-speed Llama 3.3 via Groq with an automatic deterministic fallback engine (never errors even without an API key). Includes 1-click Savage Code Roast, Salary Estimator, 1-Page Resume, and Hiring Dossier. |
| 🔍 **Interactive Repository Deep Dive** | Click any repo to inspect full stats, topics, license, open issues, and copy one-click clone commands (`git clone`, `gh repo clone`, SSH). |
| 🎨 **Interactive Tech Stack Bar** | Click any language in the stack bar to instantly filter all repositories. |
| 🟩 **Annual Activity & Streak Radar** | 365-day calendar heatmap tracking longest streak, active streak, and peak single day. |
| ⌨️ **Command Palette (Cmd+K / Ctrl+K)** | Instant Raycast-style keyboard shortcut navigation to switch users, jump to repos, or trigger actions. |
| 🚀 **README & Embed Badge Exporter** | Generate embeddable Markdown badges and HTML snippets ready to paste into your GitHub `README.md`. |
| 💎 **Cyber-Glass Design System** | Modern dark mode with neon accents, smooth hover-lifts, confetti celebrations, and responsive drawers. |

---

## 🖥️ Featured Developers to Explore

```
shadcn       →  Creator of shadcn/ui
torvalds     →  Creator of Linux & Git
gaearon      →  Co-creator of Redux & React Core
antfu        →  Vue & Vite Core Contributor
sindresorhus →  Open-source prolific titan
```

---

## 🛠️ Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org/) with App Router and Turbopack
- **Language** — [TypeScript 5](https://www.typescriptlang.org/)
- **Styling** — [Tailwind CSS v4](https://tailwindcss.com/) with custom `@theme` tokens
- **Icons** — [Lucide React](https://lucide.dev/)
- **Effects** — Canvas Confetti
- **AI** — Groq (Llama 3.3) with local deterministic heuristic fallback
- **Data** — GitHub REST & GraphQL API

---

## 🚀 Getting Started

### Installation

```bash
git clone https://github.com/ShakibCodes/gitfolio.git
cd gitfolio
npm install
```

### Environment Variables (Optional)

Create a `.env.local` file if you want live Groq AI or higher GitHub GraphQL limits:

```env
GROQ_API_KEY=your_groq_api_key_here
GITHUB_TOKEN=your_personal_github_token_here
```

*(Note: GitFolio functions completely with full intelligence and analytics even without these keys!)*

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License

MIT © [ShakibCodes](https://github.com/ShakibCodes)
