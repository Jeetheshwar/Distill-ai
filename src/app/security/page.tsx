import { Aura } from "@/components/ui/aura";
import { ShieldCheck, Server, Lock, Database } from "lucide-react";
import Link from "next/link";

export default function SecurityPage() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col font-sans relative overflow-hidden">
      <Aura variant="hero" />
      
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-12 pt-32 pb-24 px-8 w-full">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 w-fit mb-2">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-green-500 uppercase tracking-wider">No Audio Retention</span>
          </div>
          <h1 className="font-sergena text-4xl md:text-6xl tracking-tighter text-foreground">Security & Architecture.</h1>
          <p className="text-xl text-distill-muted leading-relaxed">
            We Do Not Persist Your Audio Files. We built Distill AI for teams that need clearer control over how proprietary meeting audio is routed, processed, and retained.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-4">
            <Lock className="w-8 h-8 text-distill-violet" />
            <h3 className="text-xl font-bold text-white">Bring Your Own Key (BYOK)</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Distill operates as a stateless proxy. You provide your own Groq API key, and we use it exclusively for the duration of the transcription process. We do not store your key or use it for any other purpose.
            </p>
          </div>
          
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-4">
            <Database className="w-8 h-8 text-distill-core" />
            <h3 className="text-xl font-bold text-white">We are Stateless</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              No database storage of audio files. The audio stream is piped directly to the Groq inference endpoints, parsed into JSON, sent to your webhooks, and then destroyed. 
            </p>
          </div>
        </div>

        <div className="w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 mt-4 overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider font-mono">Data Flow Architecture</h3>
          <div className="relative font-mono text-sm leading-loose whitespace-pre text-distill-muted overflow-x-auto w-full">
<span className="text-white">User Browser</span> (Audio File / Chrome Ext)
      │
      ▼
<span className="text-distill-violet">Distill Next.js Proxy Route</span> (Stateless)
      │
      ├─► Uses user's Groq API Key
      │
      ▼
<span className="text-distill-core">Groq Inference API</span> (Whisper-v3 & Llama-3)
      │
      ▼
<span className="text-white">JSON Payload</span> (Tasks, Bugs, Blockers)
      │
      ▼
<span className="text-green-400">Webhook Trigger</span> (Jira / Linear / GitHub)
          </div>
        </div>

        <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] mt-8 flex flex-col items-center text-center gap-6">
          <svg className="w-12 h-12 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-white">Open source. Audit the code yourself.</h3>
            <p className="text-white/50 text-sm max-w-md mx-auto">
              Don't trust us? Don't have to. You can review the entire codebase, the proxy logic, and the exact LLM prompts used for schema extraction.
            </p>
          </div>
          <a href="https://github.com/Jeetheshwar/Distill-ai" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors">
            View Source Code
          </a>
        </div>
      </div>
    </div>
  );
}
