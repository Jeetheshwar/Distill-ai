# Distill AI — Turn Standups into Jira Tickets

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Jeetheshwar/Distill-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Upload standup audio. Get Jira tickets. Automate the worst part of agile.

## ⚡ Live Demo
**Try it without signing up:** [distill-ai-zeta.vercel.app](https://distill-ai-zeta.vercel.app/)

## 🎥 2-Minute Setup
*(Loom video walkthrough coming soon)*

## ✨ Features
- **Standup Mode**: Auto-extracts tasks, bugs, blockers with timestamps
- **Sprint Retro Mode**: Turns retros into actionable improvement tickets  
- **BYOK**: Your Groq API key, your data. We never see either.
- **Chrome Extension**: One-click recording from Google Meet/Zoom
- **Webhook Routing**: Auto-send to Jira, Linear, GitHub Issues
- **JSON Schema Validation**: Zero hallucination, strict typed output

## 🚀 Quick Start
1. Clone the repository
2. `npm install`
3. Rename `.env.example` to `.env` and configure your Supabase variables.
4. `npm run dev`

## 🏗️ Architecture
User Audio -> Distill BYOK Proxy -> Groq Inference (Whisper-v3) -> LLM Schema Validation -> Valid JSON -> Webhook (Jira/Linear)

## 📸 Screenshots
*(Add 4-5 real screenshots: Dashboard, Upload, Preview, Team View)*

## 🛠️ Self-Hosting
Distill is purely stateless when processing audio. You can self-host the entire dashboard and webhook management layer easily via Vercel. Connect your own Supabase project for auth and history.

## 🤝 Contributing
We welcome PRs! See [CONTRIBUTING.md](./CONTRIBUTING.md)
