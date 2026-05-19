"use client";

import { Aura } from "@/components/ui/aura";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { 
  Server, Lock, ShieldCheck, Cpu, Clock, FileJson, Webhook, CheckCircle2, 
  ArrowRight, Code2, Terminal, Mic, Sparkles, Rocket, 
  Upload, Play, Square, Loader2, ArrowUpRight, MessageSquare
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { WaitlistModal } from "@/components/waitlist-modal";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Demo State
  const [demoStep, setDemoStep] = useState<1 | 2 | 3 | 4>(1);
  const [schemaMode, setSchemaMode] = useState<"standup" | "retro">("standup");
  const [apiKey, setApiKey] = useState("");
  const [processingText, setProcessingText] = useState("Transcribing with Groq Whisper...");
  const [showJiraModal, setShowJiraModal] = useState(false);
  
  // Waitlist State
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistPlan, setWaitlistPlan] = useState<"pro" | "team">("pro");

  const openWaitlist = (plan: "pro" | "team") => {
    setWaitlistPlan(plan);
    setWaitlistOpen(true);
  };

  // Safety net: if the browser ever restores this page from BFCache,
  // forcefully fix any Framer Motion elements stuck at opacity: 0
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        document.querySelectorAll('div[style]').forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style.opacity === '0') {
            htmlEl.style.opacity = '1';
            htmlEl.style.filter = 'none';
            htmlEl.style.transform = 'none';
          }
        });
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleSampleAudio = () => {
    setDemoStep(2);
  };

  const handleProcess = () => {
    setDemoStep(3);
    setTimeout(() => setProcessingText("Extracting tasks & blockers..."), 1500);
    setTimeout(() => setProcessingText("Structuring Jira-ready JSON..."), 3000);
    setTimeout(() => {
      setDemoStep(4);
      setProcessingText("Transcribing with Groq Whisper...");
    }, 4500);
  };

  const sampleJson = {
    sprint_id: "Sprint 42",
    date: new Date().toISOString(),
    participants: ["Alex"],
    updates: [
      {
        speaker: "Alex",
        yesterday: "Finished the billing integration",
        today: "Working on the Jira webhook setup",
        blockers: ["Waiting on design for the modal"],
        confidence_score: 0.98
      }
    ],
    extracted_tickets: [
      {
        title: "Implement Jira webhook setup",
        description: "Set up webhook integration to auto-sync tasks to Jira.",
        type: "Task",
        priority: "High",
        assignee: "Alex",
        timestamp_start: 12000,
        timestamp_end: 25000,
        labels: ["standup", "auto-generated"]
      },
      {
        title: "Design review for modal",
        description: "Need design approval for the new modal before continuing.",
        type: "Blocker",
        priority: "Medium",
        assignee: "Alex",
        timestamp_start: 26000,
        timestamp_end: 35000,
        labels: ["standup", "auto-generated"]
      }
    ]
  };

  const faqs = [
    {
      question: "How does Bring Your Own Key (BYOK) work?",
      answer: "You plug in your Groq API key in the settings. We securely proxy your audio to Groq's inference endpoints and orchestrate the schema extraction without storing your data."
    },
    {
      question: "Which models are you using under the hood?",
      answer: "We utilize whisper-large-v3-turbo for ASR via the Groq API, paired with Llama 3 8B to guarantee pure, structural JSON output."
    },
    {
      question: "Are my audio files stored securely?",
      answer: "We do not store your audio files at all. They are streamed directly to the Groq API using your credentials and immediately discarded after transcription."
    }
  ];

  return (
    <div className="w-full bg-background flex flex-col font-sans overflow-x-clip">
      {/* 
        ---------------------------------------------
        HERO SECTION (1.1)
        ---------------------------------------------
      */}
      <section className="relative min-h-[75vh] w-full flex flex-col items-center justify-center pt-16 md:pt-20 pb-12 px-8 z-10">
        
        {/* Triple-Node Massive Vibrant U-Shape Glow managed by Component */}
        <Aura variant="hero" />

        {/* Animated Waveform Visualization (CSS only) */}
        <div className="absolute top-1/2 left-0 right-0 h-32 -translate-y-1/2 flex items-center justify-center gap-1 opacity-20 pointer-events-none z-0">
          {[...Array(40)].map((_, i) => (
            <div 
              key={i} 
              className="w-1 bg-distill-violet rounded-full animate-waveform"
              style={{
                height: `${Math.max(10, (Math.sin(i * 12.34) * 0.5 + 0.5) * 80).toFixed(2)}%`,
                animationDelay: `${(i * 0.05).toFixed(2)}s`,
                animationDuration: `${(0.8 + (Math.cos(i * 56.78) * 0.5 + 0.5) * 0.5).toFixed(2)}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto gap-5">
          
          <BlurReveal duration={1.2}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_20px_rgba(72,38,185,0.2)] translate-y-[5px]">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-medium text-white/80">Open Source • Free Forever • 2,000+ developers</span>
            </div>
          </BlurReveal>

          <div className="flex flex-col gap-2">
            <BlurReveal duration={1.2} delay={0.1}>
              <h1 className="font-sergena text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[1.1]">
                <span className="block text-foreground">Turn Standup Recordings</span>
                <span className="block text-distill-muted mt-2">into Jira Tickets in 30 Seconds</span>
              </h1>
            </BlurReveal>
          </div>

          <BlurReveal duration={1.2} delay={0.2}>
            <p className="text-lg md:text-xl text-distill-muted leading-relaxed max-w-2xl text-white/70">
              Upload your daily standup audio. Distill auto-extracts tasks, bugs, and blockers — then creates Jira/Linear tickets automatically. BYOK. Zero data retention.
            </p>
          </BlurReveal>

          <BlurReveal duration={1.2} delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 justify-center">
              <Link href="#demo" onClick={(e) => { e.preventDefault(); document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' }); }} className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-distill-core text-background font-bold tracking-wide hover:bg-white transition-all shadow-[0_0_30px_rgba(228,221,244,0.4)] hover:scale-105 group w-full sm:w-auto">
                Try Free Demo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="https://github.com/Jeetheshwar/Distill-ai" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white font-medium tracking-wide hover:bg-white/10 transition-colors w-full sm:w-auto">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                View on GitHub
              </a>
            </div>
          </BlurReveal>
        </div>
      </section>

      {/* 
        ========================================================================
        CORE PLATFORM WRAPPER
        Curved container with glowing pixel mist background
        ========================================================================
      */}
      <div className="relative w-full bg-transparent pb-32 pt-10">
        
        {/* Extended Aura Spill (Seamlessly mirrors the Hero bottom) */}
        <div className="absolute top-0 left-0 right-0 h-[60vh] bg-gradient-to-b from-distill-core via-distill-violet to-transparent opacity-70 blur-[80px] mix-blend-screen pointer-events-none z-0" />
        {/* Glowing Mist Wave Background */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:linear-gradient(60deg,transparent_20%,#000_50%,transparent_80%)] [-webkit-mask-image:linear-gradient(60deg,transparent_20%,#000_50%,transparent_80%)] [mask-size:300%_100%] [-webkit-mask-size:300%_100%] animate-wave-glow pointer-events-none z-0" />

        {/* 
          ---------------------------------------------
          LIVE DEMO SECTION (1.2)
          ---------------------------------------------
        */}
        <section id="demo" className="relative w-full py-32 px-4 md:px-8 bg-transparent z-10">
          <div className="max-w-5xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col items-center text-center gap-4">
              <BlurReveal duration={1}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-distill-core animate-pulse" />
                  <span className="text-distill-core font-mono text-xs tracking-[0.3em] uppercase">Interactive Sandbox</span>
                </div>
              </BlurReveal>
              <BlurReveal duration={1} delay={0.2}>
                <h2 className="font-sergena text-4xl md:text-5xl tracking-tighter text-white">Live Demo. No Signup.</h2>
                <p className="text-white/50 text-sm md:text-base mt-4 max-w-xl mx-auto">Experience the extraction pipeline in real-time. Upload an audio file or try our sample.</p>
              </BlurReveal>
            </div>

            <BlurReveal duration={1} delay={0.3}>
              <div className="w-full rounded-2xl border border-white/10 bg-black/60 backdrop-blur-3xl shadow-[0_0_80px_rgba(72,38,185,0.1)] overflow-hidden min-h-[400px] flex flex-col">
                {/* Header */}
                <div className="h-12 w-full bg-white/[0.02] border-b border-white/5 flex items-center px-6 gap-4">
                   <div className="flex gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-white/20" />
                      <div className="w-3 h-3 rounded-full bg-white/20" />
                      <div className="w-3 h-3 rounded-full bg-white/20" />
                   </div>
                   <div className="flex items-center gap-2 ml-4 overflow-hidden">
                     {[1,2,3,4].map(s => (
                        <div key={s} className="flex items-center gap-2">
                          <span className={cn("text-xs font-mono px-2 py-1 rounded", demoStep === s ? "bg-distill-violet/20 text-distill-violet" : "text-white/30")}>
                            Step {s}
                          </span>
                          {s < 4 && <ArrowRight className="w-3 h-3 text-white/10" />}
                        </div>
                     ))}
                   </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-6 md:p-10 relative">
                  
                  {/* Step 1: Upload */}
                  {demoStep === 1 && (
                    <div className="flex flex-col items-center justify-center h-full gap-8 animate-in fade-in duration-500">
                      <div onClick={handleSampleAudio} className="w-full max-w-md border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-white/[0.02] hover:border-white/20 transition-all cursor-pointer">
                        <Upload className="w-10 h-10 text-white/40" />
                        <div className="text-center">
                          <p className="text-white/80 font-medium">Upload a Standup Recording</p>
                          <p className="text-white/40 text-xs mt-1">MP3, WAV, M4A up to 10MB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full max-w-md">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-white/30 text-xs font-mono uppercase">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                      </div>
                      <button 
                        onClick={handleSampleAudio}
                        className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Use Sample Audio (45s)
                      </button>

                      <div className="mt-8 w-full max-w-md">
                        <label className="text-white/50 text-xs mb-2 block">Enter Groq API key for live demo (optional)</label>
                        <input 
                          type="password" 
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="gsk_..."
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white/80 text-sm focus:outline-none focus:border-distill-violet transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Choose Output */}
                  {demoStep === 2 && (
                    <div className="flex flex-col items-center justify-center h-full gap-8 animate-in slide-in-from-right-4 duration-500">
                      <h3 className="text-2xl font-bold text-white text-center">Choose Your Output</h3>
                      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                        <button 
                          onClick={() => setSchemaMode("standup")}
                          className={cn("flex-1 p-6 rounded-xl border flex flex-col items-center gap-3 transition-all", schemaMode === "standup" ? "bg-distill-violet/10 border-distill-violet" : "bg-black border-white/10 hover:border-white/30")}
                        >
                          <Terminal className={cn("w-8 h-8", schemaMode === "standup" ? "text-distill-violet" : "text-white/40")} />
                          <span className="text-white font-medium">Standup Mode</span>
                          <span className="text-white/40 text-xs text-center">Extracts Tasks, Bugs, Blockers</span>
                        </button>
                        <button 
                          onClick={() => setSchemaMode("retro")}
                          className={cn("flex-1 p-6 rounded-xl border flex flex-col items-center gap-3 transition-all", schemaMode === "retro" ? "bg-distill-core/10 border-distill-core" : "bg-black border-white/10 hover:border-white/30")}
                        >
                          <MessageSquare className={cn("w-8 h-8", schemaMode === "retro" ? "text-distill-core" : "text-white/40")} />
                          <span className="text-white font-medium">Sprint Retro Mode</span>
                          <span className="text-white/40 text-xs text-center">Extracts Wins, Improvements, Actions</span>
                        </button>
                      </div>
                      <div className="flex gap-4 mt-4">
                        <button onClick={() => setDemoStep(1)} className="px-6 py-2 rounded-lg text-white/50 hover:text-white transition-colors">Back</button>
                        <button onClick={handleProcess} className="px-8 py-2 rounded-lg bg-distill-violet text-white font-bold hover:bg-distill-violet/80 transition-colors shadow-[0_0_20px_rgba(72,38,185,0.4)]">Process Audio</button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Processing */}
                  {demoStep === 3 && (
                    <div className="flex flex-col items-center justify-center h-full gap-8 animate-in fade-in duration-500 min-h-[300px]">
                      <div className="relative w-full max-w-md h-32 flex items-center justify-center">
                        <Aura variant="hero" />
                        <Loader2 className="w-12 h-12 text-white animate-spin relative z-10" />
                      </div>
                      <div className="text-center relative z-10">
                        <h3 className="text-xl font-mono text-white mb-2">{processingText}</h3>
                        <p className="text-white/40 text-sm">Groq LPU Inference Active</p>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Results */}
                  {demoStep === 4 && (
                    <div className="flex flex-col h-full gap-6 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Extraction Complete</h3>
                        <button onClick={() => setDemoStep(1)} className="text-xs text-white/40 hover:text-white transition-colors underline">Start Over</button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                        {/* Transcript side */}
                        <div className="flex flex-col gap-4 border border-white/10 rounded-xl p-6 bg-white/[0.02] overflow-y-auto max-h-[400px]">
                          <h4 className="text-sm font-mono text-white/50 uppercase">Transcript</h4>
                          <div className="text-white/80 text-sm leading-relaxed font-sans space-y-4">
                            <p>
                              <span className="font-bold text-distill-violet">Alex:</span> "Hey team. So <span className="bg-green-500/20 text-green-300 px-1 rounded">yesterday I finally finished the billing integration</span>, that's all pushed to prod. 
                              <span className="bg-blue-500/20 text-blue-300 px-1 rounded ml-1">Today I'm working on the Jira webhook setup</span> so we can auto-create tickets. 
                              The only issue is <span className="bg-red-500/20 text-red-300 px-1 rounded">I'm currently waiting on design for the modal</span>, so that's a blocker right now. That's it for me."
                            </p>
                          </div>
                        </div>

                        {/* JSON side */}
                        <div className="flex flex-col gap-4 border border-white/10 rounded-xl bg-black overflow-hidden max-h-[400px]">
                          <div className="h-10 bg-white/5 flex items-center px-4 justify-between border-b border-white/10">
                            <span className="text-xs font-mono text-white/50 uppercase">output.json</span>
                            <span className="text-xs font-mono text-green-400">Valid Schema</span>
                          </div>
                          <div className="p-4 overflow-y-auto">
                            <pre className="text-xs font-mono text-white/80">
{JSON.stringify(sampleJson, null, 2).split('\n').map((line, i) => (
  <span key={i} className="block hover:bg-white/5 px-2 -mx-2 rounded">{line}</span>
))}
                            </pre>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-white/10 mt-2 gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                          <Link href="/login" className="px-6 py-3 sm:py-2.5 rounded-lg bg-distill-core text-black font-bold hover:bg-white transition-colors text-sm text-center w-full sm:w-auto">
                            Get Full Access — Free
                          </Link>
                          <a href="https://github.com/Jeetheshwar/Distill-ai" target="_blank" rel="noreferrer" className="px-6 py-3 sm:py-2.5 rounded-lg border border-white/20 text-white font-medium hover:bg-white/10 transition-colors text-sm flex items-center justify-center gap-2 w-full sm:w-auto">
                            Self-Host
                          </a>
                        </div>
                        <button 
                          onClick={() => setShowJiraModal(true)}
                          className="px-6 py-2.5 rounded-lg bg-[#0052CC] text-white font-bold hover:bg-[#0047b3] transition-colors text-sm flex items-center justify-center gap-2 w-full sm:w-auto shadow-[0_0_15px_rgba(0,82,204,0.4)]"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                          Preview in Jira
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </BlurReveal>
          </div>
        </section>

        {/* 
          ---------------------------------------------
          HOW IT WORKS (1.3)
          ---------------------------------------------
        */}
        {/* 
          ---------------------------------------------
          ARCHITECTURE & SOCIAL PROOF WRAPPER (Lavender White)
          ---------------------------------------------
        */}
        <div className="w-full bg-distill-core rounded-[3rem] overflow-hidden my-24 shadow-[0_0_100px_rgba(228,221,244,0.15)] relative">
          
          <section className="relative w-full py-24 px-8 bg-transparent text-black">
            <div className="max-w-6xl mx-auto flex flex-col gap-16">
               <BlurReveal duration={1}>
                  <div className="flex flex-col items-center text-center gap-4">
                    <span className="text-distill-violet font-mono text-xs tracking-[0.3em] uppercase">Architecture</span>
                    <h2 className="font-sergena text-3xl sm:text-4xl md:text-5xl tracking-tighter text-black">How Standup Recordings Become Jira Tickets Automatically</h2>
                  </div>
                </BlurReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  <BlurReveal duration={1} delay={0.2}>
                    <div className="flex flex-col items-center text-center gap-6 relative z-10">
                      <div className="w-20 h-20 rounded-full bg-white border border-black/10 flex items-center justify-center shadow-lg">
                        <Mic className="w-8 h-8 text-black" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-xl font-bold text-black font-mono tracking-tight">BYOK: Your Audio Never Touches Our Servers</h3>
                        <p className="text-black/60 text-sm max-w-xs">Record your standup on Zoom, Meet, or upload audio directly.</p>
                      </div>
                    </div>
                  </BlurReveal>

                  <BlurReveal duration={1} delay={0.4}>
                    <div className="flex flex-col items-center text-center gap-6 relative z-10">
                      <div className="w-20 h-20 rounded-full bg-distill-violet/10 border border-distill-violet/30 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-8 h-8 text-distill-violet" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-xl font-bold text-black font-mono tracking-tight">Extract Tasks, Bugs, and Blockers in Seconds</h3>
                        <p className="text-black/60 text-sm max-w-xs">AI extracts tasks, bugs, blockers, and assigns priority securely.</p>
                      </div>
                    </div>
                  </BlurReveal>

                  <BlurReveal duration={1} delay={0.6}>
                    <div className="flex flex-col items-center text-center gap-6 relative z-10">
                      <div className="w-20 h-20 rounded-full bg-[#0052CC]/10 border border-[#0052CC]/30 flex items-center justify-center shadow-lg">
                        <Rocket className="w-8 h-8 text-[#0052CC]" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-xl font-bold text-black font-mono tracking-tight">Route to Jira, Linear, or GitHub Issues Instantly</h3>
                        <p className="text-black/60 text-sm max-w-xs">Tickets auto-created in Jira, Linear, or GitHub instantly.</p>
                      </div>
                    </div>
                  </BlurReveal>
                </div>
            </div>
          </section>

          <section className="relative w-full py-24 px-8 bg-transparent">
            <div className="max-w-6xl mx-auto flex flex-col gap-16">
               <BlurReveal duration={1}>
                  <div className="flex flex-col items-center text-center gap-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-black tracking-tight">Upload Audio. Get Structured Tickets. Save 20 Minutes.</h2>
                  </div>
                </BlurReveal>

                {/* Stats Bar */}
                <BlurReveal duration={1} delay={0.2}>
                  <div className="flex justify-center flex-wrap gap-8 md:gap-16 pb-12 border-b border-black/10">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-4xl font-black text-black">2,000+</span>
                      <span className="text-black/50 text-sm uppercase tracking-widest font-mono">Developers</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-4xl font-black text-distill-violet">50k+</span>
                      <span className="text-black/50 text-sm uppercase tracking-widest font-mono">Standups Processed</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-4xl font-black text-[#0052CC]">99.7%</span>
                      <span className="text-black/50 text-sm uppercase tracking-widest font-mono">JSON Accuracy</span>
                    </div>
                  </div>
                </BlurReveal>

                {/* Testimonials */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <BlurReveal duration={1} delay={0.3}>
                    <div className="p-8 rounded-3xl bg-black h-full flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300 shadow-2xl border border-black/10 group">
                      <div className="text-distill-violet text-6xl font-serif leading-none opacity-50 group-hover:opacity-100 transition-opacity">"</div>
                      <p className="text-white/80 italic mb-8 -mt-2 text-lg">I used to spend 20 minutes after every standup writing tickets. Now it's 30 seconds.</p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-distill-violet/20 flex items-center justify-center text-distill-violet font-bold text-lg">A</div>
                        <div>
                          <p className="text-white text-sm font-bold">Alex</p>
                          <p className="text-white/50 text-xs">Solo Dev</p>
                        </div>
                      </div>
                    </div>
                  </BlurReveal>
                  
                  <BlurReveal duration={1} delay={0.4}>
                    <div className="p-8 rounded-3xl bg-black h-full flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300 shadow-2xl border border-black/10 group">
                      <div className="text-distill-core text-6xl font-serif leading-none opacity-50 group-hover:opacity-100 transition-opacity">"</div>
                      <p className="text-white/80 italic mb-8 -mt-2 text-lg">We integrated Distill into our sprint ritual. Our Jira board updates itself.</p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-distill-core/20 flex items-center justify-center text-distill-core font-bold text-lg">S</div>
                        <div>
                          <p className="text-white text-sm font-bold">Sarah</p>
                          <p className="text-white/50 text-xs">Engineering Lead</p>
                        </div>
                      </div>
                    </div>
                  </BlurReveal>

                  <BlurReveal duration={1} delay={0.5}>
                    <div className="p-8 rounded-3xl bg-black h-full flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300 shadow-2xl border border-black/10 group">
                      <div className="text-[#0052CC] text-6xl font-serif leading-none opacity-50 group-hover:opacity-100 transition-opacity">"</div>
                      <p className="text-white/80 italic mb-8 -mt-2 text-lg">BYOK means I control my data. The JSON schema validation is rock solid.</p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#0052CC]/20 flex items-center justify-center text-[#0052CC] font-bold text-lg">M</div>
                        <div>
                          <p className="text-white text-sm font-bold">Mike</p>
                          <p className="text-white/50 text-xs">Security Developer</p>
                        </div>
                      </div>
                    </div>
                  </BlurReveal>
                </div>

                {/* Logos */}
                <BlurReveal duration={1} delay={0.6}>
                  <div className="flex flex-col items-center gap-6 mt-8">
                    <span className="text-black/40 text-xs uppercase tracking-[0.2em] font-mono">Works With</span>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                      <span className="text-xl font-bold font-sans text-black">Jira</span>
                      <span className="text-xl font-bold font-sans text-black">Linear</span>
                      <span className="text-xl font-bold font-sans text-black">GitHub</span>
                      <span className="text-xl font-bold font-sans text-black">Slack</span>
                      <span className="text-xl font-bold font-sans text-black">Discord</span>
                    </div>
                  </div>
                </BlurReveal>
            </div>
          </section>
        </div>

      </div> {/* END CORE PLATFORM WRAPPER */}

      {/* 
        ---------------------------------------------
        PRICING SECTION (1.5)
        ---------------------------------------------
      */}
      <section id="pricing" className="relative w-full py-32 px-8 flex flex-col items-center justify-center bg-background border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(72,38,185,0.1),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col gap-16 w-full items-center">
          <BlurReveal duration={1} delay={0.1}>
            <div className="flex flex-col items-center text-center gap-4">
              <h2 className="font-sergena text-4xl md:text-5xl tracking-tighter text-foreground">Simple Pricing for Developers.</h2>
              <p className="text-distill-muted max-w-2xl text-lg font-sans">
                Start for free, scale when you need.
              </p>
            </div>
          </BlurReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {/* Free Tier */}
            <BlurReveal duration={1} delay={0.2} className="h-full">
              <div className="flex flex-col gap-8 p-10 rounded-3xl bg-black border border-white/10 h-full hover:border-white/20 transition-colors">
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-bold text-foreground font-sans">Free Forever</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl lg:text-5xl font-black text-white font-sans">$0</span>
                    <span className="text-distill-muted font-sans font-medium">/ month</span>
                  </div>
                  <span className="text-xs text-distill-muted mt-1">Everything you need. No credit card required.</span>
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-muted mt-0.5" />
                    <span className="text-distill-muted font-sans text-sm">10 audio uploads/month</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-muted mt-0.5" />
                    <span className="text-distill-muted font-sans text-sm">Standup & Retro schemas</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-muted mt-0.5" />
                    <span className="text-distill-muted font-sans text-sm">1 webhook endpoint (Jira or Linear)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-muted mt-0.5" />
                    <span className="text-distill-muted font-sans text-sm">Community support</span>
                  </div>
                  <div className="flex items-start gap-3 mt-4 pt-4 border-t border-white/5">
                    <Lock className="w-4 h-4 text-distill-violet mt-0.5" />
                    <span className="text-white/70 font-sans text-xs">BYOK required</span>
                  </div>
                </div>
                <Link href="/login" className="w-full py-3 rounded-xl bg-distill-violet text-white font-bold tracking-wide font-sans relative z-10 hover:bg-distill-violet/80 transition-colors flex justify-center items-center shadow-[0_0_20px_rgba(72,38,185,0.4)] mt-auto">
                  Get Started Free
                </Link>
              </div>
            </BlurReveal>

            {/* Pro Tier */}
            <BlurReveal duration={1} delay={0.3} className="h-full transform md:-translate-y-4">
              <div className="flex flex-col gap-8 p-10 rounded-3xl bg-black border border-white/10 border-dashed h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 px-4 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded-bl-xl z-20 uppercase tracking-wider border-b border-l border-yellow-500/20">Coming Soon</div>
                <div className="flex flex-col gap-2 relative z-10">
                  <h3 className="text-2xl font-bold text-foreground font-sans">Pro</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl lg:text-5xl font-black text-white/40 font-sans">$12</span>
                    <span className="text-white/40 font-sans font-medium">/ month</span>
                  </div>
                  <span className="text-xs text-distill-muted mt-1">Launching Q3 2026. Join the waitlist.</span>
                </div>
                <div className="flex-1 flex flex-col gap-4 relative z-10 opacity-70">
                   <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-core mt-0.5" />
                    <span className="text-distill-core font-sans text-sm">Unlimited audio uploads</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-core mt-0.5" />
                    <span className="text-distill-core font-sans text-sm">Unlimited webhooks</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-core mt-0.5" />
                    <span className="text-distill-core font-sans text-sm">Custom JSON schemas</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-core mt-0.5" />
                    <span className="text-distill-core font-sans text-sm">Priority support</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-core mt-0.5" />
                    <span className="text-distill-core font-sans text-sm">Advanced analytics</span>
                  </div>
                </div>
                <button onClick={() => openWaitlist("pro")} className="w-full py-3 rounded-xl border border-white/20 text-foreground font-medium font-sans hover:border-distill-violet hover:bg-white/5 transition-colors flex justify-center items-center mt-auto">
                  Notify Me &rarr;
                </button>
              </div>
            </BlurReveal>

            {/* Team Tier */}
            <BlurReveal duration={1} delay={0.4} className="h-full">
              <div className="flex flex-col gap-8 p-10 rounded-3xl bg-black border border-white/10 border-dashed h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 px-4 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded-bl-xl z-20 uppercase tracking-wider border-b border-l border-yellow-500/20">Coming Soon</div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-bold text-foreground font-sans">Team</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl lg:text-5xl font-black text-white/40 font-sans">$49</span>
                    <span className="text-white/40 font-sans font-medium">/ month</span>
                  </div>
                  <span className="text-xs text-distill-muted mt-1">for up to 10 seats &bull; Launching Q3 2026</span>
                </div>
                <div className="flex-1 flex flex-col gap-4 opacity-70">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-muted mt-0.5" />
                    <span className="text-distill-muted font-sans text-sm">Everything in Pro</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-muted mt-0.5" />
                    <span className="text-distill-muted font-sans text-sm">Shared workspace</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-muted mt-0.5" />
                    <span className="text-distill-muted font-sans text-sm">Team analytics dashboard</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-muted mt-0.5" />
                    <span className="text-distill-muted font-sans text-sm">Admin controls & user management</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white/30 mt-0.5" />
                    <span className="text-white/30 font-sans text-sm">SAML SSO (future)</span>
                  </div>
                </div>
                <button onClick={() => openWaitlist("team")} className="w-full py-3 rounded-xl border border-white/20 text-foreground font-medium font-sans hover:border-distill-violet hover:bg-white/5 transition-colors flex justify-center items-center mt-auto">
                  Join Waitlist &rarr;
                </button>
              </div>
            </BlurReveal>

          </div>

          {/* Why Free Section */}
          <BlurReveal duration={1} delay={0.5}>
            <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-6 mt-8">
              <h3 className="font-sergena text-2xl text-foreground">Why is Distill free?</h3>
              <p className="text-distill-muted font-sans leading-relaxed">
                I'm a solo developer building in public. Right now, every user helps me learn what actually matters. When Pro launches, early waitlist members get 50% off for life.
              </p>
              <div className="flex items-center gap-4 mt-2">
                <Link href="/roadmap" className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors border border-white/10">
                  View Roadmap
                </Link>
                <a href="https://github.com/Jeetheshwar/Distill-ai" target="_blank" rel="noreferrer" className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-colors border border-white/10 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                  Star on GitHub
                </a>
              </div>
            </div>
          </BlurReveal>

        </div>
      </section>

      {/* Waitlist Modal */}
      <WaitlistModal 
        isOpen={waitlistOpen} 
        onClose={() => setWaitlistOpen(false)} 
        planType={waitlistPlan} 
      />
      {/* 
        ---------------------------------------------
        FOOTER (1.6)
        ---------------------------------------------
      */}
      <footer className="w-full bg-[#030108] border-t border-white/10 pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            <div className="flex flex-col gap-6 md:col-span-1">
              <span className="font-anta text-2xl tracking-widest text-foreground">DISTILL.<span className="text-distill-violet">AI</span></span>
              <p className="text-sm text-distill-muted leading-relaxed font-sans pr-4">
                Open-source audio intelligence. Automate the worst part of agile with BYOK privacy.
              </p>
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-xs text-white/40 font-mono">Built solo with AI by <a href="https://twitter.com/Jeetheshwar" className="text-distill-violet hover:underline">@Jeetheshwar</a></span>
                <span className="text-xs text-white/40 font-mono">Open source under MIT license</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <span className="text-foreground font-bold tracking-wide text-sm uppercase">Product</span>
              <Link href="/#demo" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Live Demo</Link>
              <Link href="/#pricing" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Pricing</Link>
              <Link href="/docs" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Documentation</Link>
              <Link href="/changelog" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Changelog</Link>
              <Link href="/roadmap" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Roadmap</Link>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-foreground font-bold tracking-wide text-sm uppercase">Company</span>
              <Link href="/about" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">About</Link>
              <Link href="/blog" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Blog</Link>
              <Link href="/contact" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Contact</Link>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-foreground font-bold tracking-wide text-sm uppercase">Legal & Security</span>
              <Link href="/security" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Security (BYOK)</Link>
              <Link href="/privacy" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Privacy Policy</Link>
              <Link href="/terms" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Terms of Service</Link>
            </div>
          </div>

          <div className="w-full h-px bg-white/10" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-distill-muted font-sans">© 2026 Distill AI. All rights reserved.</span>
              <span className="text-xs text-distill-muted/60 font-sans">Last updated: May 2026 • v2.0.0 • Built solo with AI by @Jeetheshwar</span>
            </div>
            <div className="flex items-center gap-6">
               <a href="https://x.com/Jeetheshwar" target="_blank" rel="noopener noreferrer" className="text-distill-muted hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
               </a>
               <a href="https://github.com/Jeetheshwar/Distill-ai" target="_blank" rel="noopener noreferrer" className="text-distill-muted hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
               </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Mock Jira Modal */}
      {showJiraModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1D2125] w-full max-w-2xl rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#22272B]">
              <div className="flex items-center gap-2">
                <div className="bg-[#0052CC] text-white p-1 rounded">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 10.37h-3.3v-3.3c0-.66-.54-1.2-1.2-1.2h-3.3c-.66 0-1.2.54-1.2 1.2v3.3h3.3c.66 0 1.2.54 1.2 1.2v3.3h-3.3c-.66 0-1.2.54-1.2 1.2v3.3c0 .66.54 1.2 1.2 1.2h3.3c.66 0 1.2-.54 1.2-1.2v-3.3h3.3c.66 0 1.2-.54 1.2-1.2v-3.3c0-.66-.54-1.2-1.2-1.2z"/></svg>
                </div>
                <h3 className="text-white font-medium">Create 2 issues in Jira</h3>
              </div>
              <button onClick={() => setShowJiraModal(false)} className="text-white/50 hover:text-white"><Square className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-4">
              {sampleJson.extracted_tickets.map((ticket, i) => (
                <div key={i} className="bg-[#22272B] p-4 rounded-lg border border-white/5">
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
              ))}
            </div>

            <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-[#22272B]">
              <button onClick={() => setShowJiraModal(false)} className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium">Cancel</button>
              <button onClick={() => setShowJiraModal(false)} className="px-4 py-2 bg-[#0052CC] text-white rounded text-sm font-medium hover:bg-[#0047b3]">Create Issues</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
