"use client";

import { Aura } from "@/components/ui/aura";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { Database, Webhook, Code, Cpu, ShieldCheck, Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"curl" | "python" | "js">("python");
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  const handleCopy = (text: string, blockId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBlock(blockId);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  const codeSnippets = {
    python: `import httpx

# Send an audio buffer directly to Distill's Engine 2.0 FastAPI
def extract_ticket(audio_path: str):
    with open(audio_path, 'rb') as f:
        audio_bytes = f.read()
        
    response = httpx.post(
        "https://api.distill.ai/v1/extract",
        headers={"Authorization": "Bearer YOUR_SK_KEY"},
        files={"file": ("interview.wav", audio_bytes, "audio/wav")},
        data={"schema": "linear_feature_request"}
    )
    
    return response.json()

print(extract_ticket("ux-sync.wav"))`,
    curl: `curl -X POST https://api.distill.ai/v1/extract \\
  -H "Authorization: Bearer YOUR_SK_KEY" \\
  -F "file=@interview.wav" \\
  -F "schema=linear_feature_request"`,
    js: `const fs = require('fs');

async function extractTicket(audioPath) {
  const fileStream = fs.createReadStream(audioPath);
  
  const form = new FormData();
  form.append('file', fileStream);
  form.append('schema', 'linear_feature_request');

  const response = await fetch('https://api.distill.ai/v1/extract', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer YOUR_SK_KEY' },
    body: form,
  });

  return await response.json();
}

extractTicket('ux-sync.wav').then(console.log);`
  };

  const payloadSnippet = `{
  "id": "ext_982bcn12",
  "status": "completed",
  "entities": [
    {
      "type": "feature_request",
      "summary": "Implement Dark Mode across Dashboard charts",
      "confidence": 0.98,
      "audio_buffer_anchor": {
        "start_ms": 124500,
        "end_ms": 136000
      }
    }
  ]
}`;
  return (
    <div className="w-full bg-background min-h-screen pt-24 px-8 pb-32 relative">
      <Aura variant="docs" />
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 relative z-10">
        
        {/* Left Sidebar Menu */}
        <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-8 hidden lg:flex relative">
          <div className="sticky top-32 flex flex-col gap-6">
            <h3 className="font-pixel text-xl text-foreground">Docs</h3>
            <div className="flex flex-col gap-3 text-sm font-medium text-distill-muted font-sans">
              <a href="#quickstart" className="hover:text-white transition-colors">Quickstart</a>
              <a href="#self-hosting" className="hover:text-white transition-colors">Self-Hosting</a>
              <a href="#authentication" className="hover:text-white transition-colors">Authentication</a>
              <a href="#payloads" className="hover:text-white transition-colors bg-white/5 border border-white/5 p-2 rounded-md">JSON Target Schemas</a>
              <a href="#webhooks" className="hover:text-white transition-colors">Webhook Integrations</a>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-24 mt-4">
          <BlurReveal duration={1}>
            <div className="flex flex-col gap-4">
              <span className="text-distill-core font-mono text-sm tracking-widest uppercase">API Reference</span>
              <h1 className="font-pixel text-5xl md:text-6xl text-foreground">Developer Hub</h1>
              <p className="text-distill-muted text-lg font-sans max-w-2xl mt-2 leading-relaxed">
                Connect directly to our high-performance FastAPI ingestion endpoints or spin up a local CLI container. Everything goes in unstructured, and comes out as deterministic JSON.
              </p>
              <div className="mt-4 inline-flex w-max items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-2 rounded-lg font-mono text-sm">
                <ShieldCheck className="w-4 h-4" />
                Local Engine Docker Image — Coming Soon
              </div>
            </div>
          </BlurReveal>

          {/* Self Hosting Section */}
          <BlurReveal duration={1} delay={0.1}>
            <div className="flex flex-col gap-6" id="self-hosting">
              <h2 className="text-2xl font-bold font-sans text-foreground flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-distill-violet" />
                Self-Hosting (Docker)
              </h2>
              <p className="text-distill-muted font-sans text-base">
                You can run the entire Distill extraction pipeline locally using our official Docker image. This guarantees 100% data sovereignty. Ensure you have Docker installed and at least 8GB of allocated RAM.
              </p>

              <div className="w-full bg-[#0a0710] border border-white/10 rounded-2xl overflow-hidden mt-4 relative group">
                <button
                  onClick={() => handleCopy(`docker run -p 3000:3000 distill-ai/local-engine`, "docker")}
                  className="absolute top-4 right-4 p-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 opacity-0 group-hover:opacity-100 transition-all text-distill-muted hover:text-white"
                >
                  {copiedBlock === "docker" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <div className="p-6 overflow-x-auto">
                  <pre className="text-sm font-mono text-[#dcdcaa] leading-relaxed">
                    <code className="block whitespace-pre">
                      {`docker run -p 3000:3000 distill-ai/local-engine`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </BlurReveal>

          {/* Quickstart Endpoints */}
          <BlurReveal duration={1} delay={0.1}>
            <div className="flex flex-col gap-6" id="quickstart">
              <h2 className="text-2xl font-bold font-sans text-foreground flex items-center gap-3">
                <Code className="w-6 h-6 text-distill-violet" />
                Ingestion Endpoints
              </h2>
              <p className="text-distill-muted font-sans text-base">
                Distill expects raw or compressed audio arrays. We recommend buffering the audio directly into the API request to minimize file I/O operations locally.
              </p>

              {/* Multi-language code snippet block */}
              <div className="w-full bg-[#0a0710] border border-white/10 rounded-2xl overflow-hidden mt-4">
                <div className="flex border-b border-white/10 bg-white/[0.02] justify-between items-center pr-4">
                  <div className="flex">
                    {(["python", "curl", "js"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveTab(lang)}
                        className={cn(
                          "px-6 py-3 text-sm font-mono transition-colors",
                          activeTab === lang 
                            ? "text-distill-core border-b-2 border-distill-core bg-white/[0.04]" 
                            : "text-distill-muted hover:text-white hover:bg-white/[0.02]"
                        )}
                      >
                        {lang === "js" ? "Node.js" : lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCopy(codeSnippets[activeTab], "snippets")}
                    className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-distill-muted hover:text-white"
                  >
                    {copiedBlock === "snippets" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="text-sm font-mono text-[#dcdcaa] leading-relaxed">
                    <code className="block whitespace-pre">
                      {codeSnippets[activeTab]}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </BlurReveal>

          {/* Guaranteed Output Structure */}
          <BlurReveal duration={1} delay={0.2}>
            <div className="flex flex-col gap-6" id="payloads">
              <h2 className="text-2xl font-bold font-sans text-foreground flex items-center gap-3">
                <Database className="w-6 h-6 text-distill-core" />
                Deterministic Output Architecture
              </h2>
              <p className="text-distill-muted font-sans text-base">
                Engine 2.0 strictly constrains generation. The resultant JSON is guaranteed to meet your required Schema, providing an <code className="text-white px-1">audio_buffer_anchor</code> linking exact millisecond timestamps back to the source tensor.
              </p>

              {/* JSON preview */}
              <div className="w-full bg-[#0a0710] border border-white/10 rounded-2xl overflow-hidden mt-4 relative group">
                <div className="absolute top-0 right-0 px-4 py-2 bg-distill-core/10 text-distill-core border-b border-l border-white/10 rounded-bl-xl text-xs font-mono font-bold z-10">
                  200 OK
                </div>
                <button
                  onClick={() => handleCopy(payloadSnippet, "payload")}
                  className="absolute top-12 right-4 p-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 opacity-0 group-hover:opacity-100 transition-all text-distill-muted hover:text-white z-10"
                >
                  {copiedBlock === "payload" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <div className="p-6 overflow-x-auto mt-6">
                  <pre className="text-sm font-mono text-[#9cdcfe] leading-relaxed">
                    <code className="block whitespace-pre">
                      {payloadSnippet}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </BlurReveal>

          {/* Authentication Section */}
          <BlurReveal duration={1} delay={0.3}>
            <div className="flex flex-col gap-6" id="authentication">
              <h2 className="text-2xl font-bold font-sans text-foreground flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-distill-core" />
                Authentication
              </h2>
              <p className="text-distill-muted font-sans text-base leading-relaxed">
                If you are using the <strong>Pro</strong> or <strong>Team</strong> Managed Cloud endpoints, all requests require a valid Secret Key generated via the Dashboard infrastructure page. Ensure your requests contain the <code className="text-white px-1">Authorization: Bearer YOUR_SK_KEY</code> header. If you are running the <strong>Hacker</strong> tier strictly locally via Docker, no authentication header is required.
              </p>
            </div>
          </BlurReveal>

          {/* Webhooks Section */}
          <BlurReveal duration={1} delay={0.4}>
            <div className="flex flex-col gap-6" id="webhooks">
              <h2 className="text-2xl font-bold font-sans text-foreground flex items-center gap-3">
                <Webhook className="w-6 h-6 text-distill-violet" />
                Webhook Integrations
              </h2>
              <p className="text-distill-muted font-sans text-base leading-relaxed">
                Instead of polling the API, you can register Webhook Endpoints. Once an extraction finishes processing on our local LPUs, Distill will automatically fire a deterministic <code className="text-white px-1">POST</code> payload directly to your infrastructure (e.g., Linear, Jira, or a custom internal ingestion node).
              </p>
            </div>
          </BlurReveal>



        </main>
      </div>
    </div>
  );
}
