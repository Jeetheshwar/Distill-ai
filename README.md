# Distill.ai

A BYOK (Bring Your Own Key) interface for structured audio extraction. Upload audio, define a JSON schema, and get deterministic structured output — routed via webhooks to Jira, Linear, or GitHub.

## What It Does

Distill turns unstructured audio (user interviews, standups, board meetings) into structured JSON artifacts using your own Groq API key. You provide the key, we handle the schema extraction and webhook routing. Your audio and your key never touch our infrastructure.

## Quick Start

1. Get a free Groq API key: https://console.groq.com
2. Visit the live app: [your-vercel-url.vercel.app]
3. Add your Groq key in Settings
4. Upload an audio file and select a target schema
5. Receive structured JSON or have it auto-routed to your webhook endpoint

## Tech Stack

- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS
- **Auth:** Supabase Auth
- **Transcription:** Groq API (whisper-large-v3-turbo) via BYOK proxy
- **Schema Extraction:** Structured LLM output with deterministic JSON constraints
- **Webhooks:** Configurable POST endpoints with retry logic

## Screenshots

(Add these after deployment — dashboard overview, extraction pipeline, webhook playground)

## Self-Hosting

```bash
git clone https://github.com/YOUR_USERNAME/distill.git
cd distill
npm install

# Create .env.local with:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

npm run dev
```
