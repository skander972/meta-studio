# ✦ MetaStudio

> **The Privacy-First, Zero-Cost Open Graph Generator & Social Banner Designer**  
> Generate high-converting meta tags, audit SEO health, and design crystal-clear 1200×630 social preview cards directly in your browser.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Build: Zero-Dependency](https://img.shields.io/badge/Build-Zero--Dependency-success.svg)
![Cost: $0](https://img.shields.io/badge/Hosting%20Cost-%240-emerald.svg)

---

## ✨ Features

- **🎨 High-DPI 1200×630 Canvas Designer**: Design eye-catching social preview banners directly in the browser with presets, gradients, badges, and logo uploads.
- **📱 Live Multi-Platform Previews**: Side-by-side previews for **𝕏 / Twitter** (`summary_large_image`), **OpenGraph / LinkedIn / Facebook**, **Discord Embeds**, and **Google SERP Snippets**.
- **🛡️ Real-Time SEO Audit**: Live character count validation (title 50-60 chars, description 120-160 chars), canonical HTTPS checks, and social card health scoring.
- **💻 Multi-Framework Code Export**: One-click code generation for:
  - Standard HTML5 `<head>`
  - Next.js 14/15 App Router `Metadata`
  - Astro `<head>` / `<SEO>`
  - Nuxt 3 `useSeoMeta()`
  - SvelteKit `<svelte:head>`
  - Google JSON-LD Structured Data Schema (`WebSite`, `Article`)
- **🔗 Shareable Project State**: Instant URL hash-state encoding (`#...`) so you can share exact card configurations with teammates with zero database or backend requirements.
- **⚡ 100% Client-Side & Zero-Cost**: Runs entirely in the browser. Zero server costs, zero API keys, and 100/100 Lighthouse performance.

---

## 🚀 Instant Deployment (100% Free)

### Option 1: GitHub Pages (Recommended)

1. Create a new GitHub repository (e.g., `meta-studio`).
2. Push this folder to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of MetaStudio"
   git branch -M main
   git remote add origin https://github.com/skander972/meta-studio.git
   git push -u origin main
   ```
3. In GitHub, go to **Settings** → **Pages** → under **Build and deployment**, select **GitHub Actions** (the included workflow in `.github/workflows/deploy.yml` will automatically deploy your site).
4. Your site is live at `https://skander972.github.io/meta-studio/`!

### Option 2: Cloudflare Pages / Vercel / Netlify

Simply drag and drop this project folder into [Cloudflare Pages](https://pages.cloudflare.com) or [Netlify](https://netlify.com) for instantaneous global edge hosting with custom domain and SSL at $0 cost.

---

## 💻 Running Locally

Because MetaStudio uses native ES modules and CDN styling, you don't need `npm install` or complex build pipelines.

Simply serve the directory with any static server:
```bash
# Python
python -m http.server 8000

# or Node
npx serve .
```
Then visit `http://localhost:8000`.

---

## 💰 Monetization & Organic Traffic Strategy

1. **Micro-Tipping**: Replace the Buy Me a Coffee links in `index.html` with your personal [BuyMeACoffee](https://buymeacoffee.com) or GitHub Sponsors handle.
2. **Ethical Affiliate Links**: The footer contains recommended hosting and design resources. Swap in your affiliate links for domain registrars (Namecheap/Porkbun), web hosting (Cloudflare, DigitalOcean, Vercel), or design assets.
3. **Organic Viral Loop**: Every exported banner has an optional, discrete watermark (`Created with MetaStudio`). When users share their banners on Twitter/LinkedIn, other developers and marketers discover your tool.
4. **Launch Checklist**:
   - Submit to [Product Hunt](https://producthunt.com) under "Developer Tools" / "Design Tools".
   - Share on Reddit in `r/webdev`, `r/SideProject`, and `r/Frontend`.
   - Post a showcase on Hacker News (`Show HN: MetaStudio — 100% Client-side OpenGraph generator`).

---

## 👨‍💻 Creator & Maintainer

Built with ✦ by **Iskander Dagdoug** ([@skander972](https://github.com/skander972))  
- ☕ [Support on Buy Me a Coffee](https://buymeacoffee.com/skander972)
- 🐙 [GitHub Profile](https://github.com/skander972)

---

## 📄 License

MIT License — Free to use, fork, and monetize.
