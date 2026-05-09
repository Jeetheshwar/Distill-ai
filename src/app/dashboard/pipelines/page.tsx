"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";
import { Aura } from "@/components/ui/aura";
import { UploadCloud, AudioLines, Database, FileJson, CheckCircle2, ChevronRight, Terminal, ShieldCheck, Cpu, Square } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function TranscribePipelinePage() {
  const [activeTab, setActiveTab] = useState<"new" | "history" | "schema">("new");
  const [stage, setStage] = useState<"idle" | "processing" | "finished">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [resultPayload, setResultPayload] = useState<any>(null);
  const [hasKey, setHasKey] = useState(true);
  const [schemaMode, setSchemaMode] = useState<"standup" | "retro">("standup");
  const [showJiraModal, setShowJiraModal] = useState(false);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem("groq_api_key");
    setHasKey(!!key);
  }, []);

  const logQueue = useRef<string[]>([
    "[SYS] Initializing BYOK Proxy...",
    "[SYS] Establishing secure TLS tunnel to Groq API...",
    "[API] Sending audio buffer to whisper-large-v3-turbo...",
    "[API] Streaming transcript to Llama3-8B JSON schema...",
    "[SYS] Payload securely received. Sequence completed."
  ]);

  const executeExtraction = async (file: File) => {
    setStage("processing");
    setLogs([]);
    setResultPayload(null);

    // 1. Kick off visual terminal loop
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < logQueue.current.length) {
        setLogs((prev) => [...prev, logQueue.current[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    // 2. Map Payload securely
    const formData = new FormData();
    formData.append("file", file);
    formData.append("schema", schemaMode);

    try {
      // 3. Dispatch to API Infrastructure
      const key = localStorage.getItem("groq_api_key") || "sk_mock_pro_key_9281";
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`
        },
        body: formData
      });

      const data = await res.json();
      
      if (res.ok) {
        setResultPayload(data);
        // Guarantee terminal visually finishes if server responds faster than 2 seconds
        clearInterval(interval);
        setTimeout(() => setStage("finished"), 800);
      } else {
        clearInterval(interval);
        setLogs((prev) => [...prev, `[ERROR] ${data.error}`]);
      }
    } catch (err) {
      clearInterval(interval);
      setLogs((prev) => [...prev, "[ERROR] Connection to API closed dynamically."]);
    }
  };

  const handleFireWebhook = async () => {
    setIsSendingWebhook(true);
    const savedWebhookUrl = localStorage.getItem("distill_webhook_url");
    if (savedWebhookUrl && resultPayload) {
      try {
        await fetch(savedWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resultPayload),
        });
        alert("Webhook successfully fired!");
      } catch (err) {
        console.error(err);
        alert("Failed to fire webhook. Check console.");
      }
    } else if (!savedWebhookUrl) {
      alert("No webhook URL configured in settings. Simulating success.");
    }
    setIsSendingWebhook(false);
    setShowJiraModal(false);
  };

  // True File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    let file: File | null = null;
    
    if ('dataTransfer' in e && e.dataTransfer.files.length > 0) {
      file = e.dataTransfer.files[0];
    } else if ('target' in e && (e.target as HTMLInputElement).files?.length) {
      file = (e.target as HTMLInputElement).files![0];
    }

    if (file) {
      executeExtraction(file);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-6xl w-full">
      <Aura variant="overview" />

      {activeTab === "new" && (
        <div className="flex flex-col gap-10 w-full">
          {!hasKey && (
            <div className="w-full bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center justify-center text-yellow-500 font-sans text-sm gap-2">
              <ShieldCheck className="w-5 h-5" />
              <span><strong>Demo Mode:</strong> No Groq API key configured. Add your key in Settings to process real audio.</span>
            </div>
          )}
      {stage === "idle" && (
        <BlurReveal duration={0.8}>
          <div className="flex flex-col gap-4 relative">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-foreground font-sans tracking-tight">Data Extraction Pipeline</h1>
                <p className="text-distill-muted max-w-2xl font-sans mb-6 mt-2">
                  Drop an unstructured audio file. Distill will safely proxy it to Groq API using your credentials and orchestrate the schema constraints without retaining data.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-64">
                <label className="text-xs font-mono text-distill-muted uppercase tracking-wider">Target Schema</label>
                <select 
                  value={schemaMode}
                  onChange={(e) => setSchemaMode(e.target.value as any)}
                  className="w-full bg-[#0a0710] border border-white/10 rounded-md p-2 text-sm text-foreground font-mono focus:outline-none focus:border-distill-violet/50"
                >
                  <option value="standup">Standup Mode</option>
                  <option value="retro">Sprint Retro Mode</option>
                </select>
              </div>
            </div>

            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileUpload}
              className="w-full flex justify-center mt-2 group"
            >
              <label 
                htmlFor="file-upload" 
                className="relative cursor-pointer transition-all hover:scale-[1.01] flex flex-col items-center justify-center w-full h-80 rounded-2xl border-2 border-dashed border-distill-violet/40 bg-[#0a0710]/50 hover:bg-distill-violet/5 hover:border-distill-core"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--distill-violet)_0%,_transparent_50%)] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
                <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center bg-black mb-6 shadow-[0_0_30px_rgba(72,38,185,0.2)]">
                  <UploadCloud className="w-8 h-8 text-distill-core" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Initialize BYOK Extraction</h3>
                <p className="text-distill-muted text-sm max-w-xs text-center">
                  Drag and drop an audio file, or click to browse. Max 100MB per file natively.
                </p>
                <div className="flex gap-4 mt-6">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-mono text-distill-muted">.WAV</span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-mono text-distill-muted">.MP3</span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-mono text-distill-muted">.M4A</span>
                </div>
                <input 
                  id="file-upload" 
                  type="file" 
                  accept="audio/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            
            <div className="w-full flex items-center justify-center gap-2 mt-4 text-xs font-mono text-distill-muted">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>BYOK Proxied: Audio is processed via Groq and never stored.</span>
            </div>
          </div>
        </BlurReveal>
      )}

      {/* STAGE B: TERMINAL PROCESSING */}
      {stage === "processing" && (
        <BlurReveal duration={0.8}>
          <div className="flex flex-col gap-6 relative w-full h-[60vh] justify-center max-w-3xl mx-auto">
            <div className="flex justify-between items-end">
              <h2 className="text-2xl font-bold text-foreground font-sans tracking-tight flex items-center gap-3">
                <Cpu className="w-6 h-6 text-white animate-pulse" /> 
                Processing via Groq API
              </h2>
              <span className="text-distill-core font-mono text-xs border border-distill-core/30 px-2 py-1 rounded bg-distill-core/10 animate-pulse">
                PROCESSING
              </span>
            </div>
            
            <div className="w-full h-80 bg-black border border-white/10 rounded-lg p-6 font-mono text-sm overflow-y-auto flex flex-col gap-2 relative shadow-[inset_0_0_20px_rgba(72,38,185,0.2)]">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-3 text-distill-muted items-start">
                  <span className="text-white/30 shrink-0 select-none">
                    {new Date().toISOString().substring(11, 23)}
                  </span>
                  <span className={cn(
                    "text-white",
                    log?.includes("[SYS]") && "text-distill-muted",
                    log?.includes("[MODEL]") && "text-blue-400",
                    log?.includes("[EXTRACT]") && "text-distill-core"
                  )}>
                    {log}
                  </span>
                </div>
              ))}
              <div className="animate-pulse w-3 h-5 bg-white/50 mt-1" />
            </div>
          </div>
        </BlurReveal>
      )}

      {/* STAGE C: DUAL PANE VERIFICATION */}
      {stage === "finished" && (
        <BlurReveal duration={1}>
          <div className="flex flex-col gap-8 relative w-full">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">Extraction Completed</h1>
                </div>
                <p className="text-distill-muted">
                  The audio tensor was successfully processed and mapped entirely to deterministic outputs. 
                </p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowJiraModal(true)}
                  className="px-6 py-2 bg-[#0052CC] text-white rounded-md font-sans text-sm font-bold hover:bg-[#0047b3] transition-colors shadow-[0_0_15px_rgba(0,82,204,0.4)]"
                >
                  Preview Tickets & Send
                </button>
                <button 
                  onClick={() => setStage("idle")}
                  className="px-6 py-2 border border-white/10 rounded-md font-sans text-sm hover:bg-white/5 transition-colors"
                >
                  Upload New File
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
              {/* Left Column: Transcript */}
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <AudioLines className="w-5 h-5 text-distill-muted" />
                  Raw Timeline
                </h3>
                <div className="w-full bg-[#0a0710] border border-white/10 rounded-xl p-6 h-[50vh] overflow-y-auto">
                  <pre className="font-mono text-sm leading-loose whitespace-pre-wrap text-distill-muted">
                    {resultPayload?.transcript?.split('\n').map((line: string, i: number) => (
                      <span key={i} className={cn("block", line.includes("Auth State") && "bg-distill-core/20 text-white rounded px-1")}>
                        {line}
                      </span>
                    ))}
                  </pre>
                </div>
              </div>

              {/* Right Column: Deterministic JSON */}
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Database className="w-5 h-5 text-distill-core" />
                  Structured Artifacts
                </h3>
                <div className="w-full bg-[#05040a] border border-distill-violet/30 rounded-xl overflow-hidden relative h-[50vh] flex flex-col shadow-[0_0_40px_rgba(72,38,185,0.1)]">
                  <div className="w-full bg-distill-violet/10 border-b border-distill-violet/20 px-4 py-2 flex justify-between items-center text-xs font-mono">
                    <span className="text-distill-core font-bold">payload.json</span>
                    <span className="text-distill-muted">{resultPayload?.metadata?.schema_applied || "standup"}</span>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1">
                    <pre className="text-sm font-mono text-[#4ec9b0] leading-relaxed">
                      <code className="block whitespace-pre">
                        {resultPayload ? JSON.stringify(resultPayload.entities, null, 2) : ""}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BlurReveal>
      )}
        </div>
      )}

      {/* Jira Preview Modal */}
      {showJiraModal && resultPayload && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1D2125] w-full max-w-2xl rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#22272B]">
              <div className="flex items-center gap-2">
                <div className="bg-[#0052CC] text-white p-1 rounded">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 10.37h-3.3v-3.3c0-.66-.54-1.2-1.2-1.2h-3.3c-.66 0-1.2.54-1.2 1.2v3.3h3.3c.66 0 1.2.54 1.2 1.2v3.3h-3.3c-.66 0-1.2.54-1.2 1.2v3.3c0 .66.54 1.2 1.2 1.2h3.3c.66 0 1.2-.54 1.2-1.2v-3.3h3.3c.66 0 1.2-.54 1.2-1.2v-3.3c0-.66-.54-1.2-1.2-1.2z"/></svg>
                </div>
                <h3 className="text-white font-medium">Preview Tickets Before Creating</h3>
              </div>
              <button onClick={() => setShowJiraModal(false)} className="text-white/50 hover:text-white"><Square className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-4">
              {resultPayload.entities?.extracted_tickets?.map((ticket: any, i: number) => (
                <div key={i} className="bg-[#22272B] p-4 rounded-lg border border-white/5 flex gap-3">
                  <div className="pt-1">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-500 rounded border-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <input type="text" defaultValue={ticket.title} className="bg-transparent border-none text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 w-full" />
                    </div>
                    <textarea defaultValue={ticket.description} className="w-full bg-[#1D2125] border border-white/10 rounded p-2 text-white/70 text-sm mb-3 h-20 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded text-xs text-white/70">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span> {ticket.type}
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded text-xs text-white/70">
                        <span className={cn("w-2 h-2 rounded-full", ticket.priority === 'High' ? 'bg-orange-400' : 'bg-yellow-400')}></span> {ticket.priority}
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded text-xs text-white/70">
                        Assignee: {ticket.assignee}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Fallback for Retro Mode or if entities is just an array from the fallback */}
              {Array.isArray(resultPayload.entities) && resultPayload.entities.map((item: any, i: number) => (
                <div key={i} className="bg-[#22272B] p-4 rounded-lg border border-white/5 flex gap-3">
                  <div className="pt-1">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-500 rounded border-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <input type="text" defaultValue={item.summary || item.title || "Untitled Issue"} className="bg-transparent border-none text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 w-full" />
                    </div>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded text-xs text-white/70">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span> {item.type || item.ticket_type || "Task"}
                      </div>
                      {item.priority && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded text-xs text-white/70">
                          <span className={cn("w-2 h-2 rounded-full", item.priority === 'high' ? 'bg-orange-400' : 'bg-yellow-400')}></span> {item.priority}
                        </div>
                      )}
                      {(item.assignee_context || item.owner) && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded text-xs text-white/70">
                          Assignee: {item.assignee_context || item.owner}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/10 flex justify-between items-center bg-[#22272B]">
              <button className="text-sm text-distill-core hover:underline">Save as Draft</button>
              <div className="flex gap-3">
                <button onClick={() => setShowJiraModal(false)} className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium">Cancel</button>
                <button onClick={handleFireWebhook} disabled={isSendingWebhook} className="px-4 py-2 bg-[#0052CC] text-white rounded text-sm font-medium hover:bg-[#0047b3] disabled:opacity-50">
                  {isSendingWebhook ? "Sending..." : "Create All Selected"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
