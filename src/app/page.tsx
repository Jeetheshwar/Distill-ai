"use client";

import { Aura } from "@/components/ui/aura";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { Server, Lock, ShieldCheck, Cpu, Clock, FileJson, Webhook, CheckCircle2, ArrowRight, Code2, Briefcase, Database, MessageSquareCode, Terminal } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Safety net: if the browser ever restores this page from BFCache,
  // forcefully fix any Framer Motion elements stuck at opacity: 0
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Directly manipulate DOM to override Framer Motion's frozen inline styles
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

  const differentiators = [
    {
      title: "Bring Your Own Key",
      description: "You provide the Groq API key, we handle schema extraction and webhook routing.",
      icon: <Lock className="w-6 h-6 text-distill-violet" />,
    },
    {
      title: "Zero Data Retention",
      description: "Your audio is processed via your own API credentials and never stored on our servers.",
      icon: <ShieldCheck className="w-6 h-6 text-distill-muted" />,
    },
    {
      title: "Ultra-Fast Inference",
      description: "Leverage Groq's LPU architecture to process meetings and extract JSON in seconds.",
      icon: <Server className="w-6 h-6 text-distill-core" />,
    },
  ];

  const features = [
    {
      title: "Powered by Groq",
      description: "Utilizing whisper-large-v3-turbo via the Groq API to achieve unprecedented audio transcription speeds.",
      icon: <Cpu className="w-6 h-6 text-distill-core" />,
    },
    {
      title: "Timeline Tracing",
      description: "Actionable tasks and entities are structurally hard-linked to exact milliseconds within the audio buffer, creating an immutable audit trail.",
      icon: <Clock className="w-6 h-6 text-distill-core" />,
    },
    {
      title: "Deterministic Structured Output",
      description: "Strictly typed LLM parsing mechanisms. Zero hallucinations. Distill guarantees valid JSON arrays adhering exactly to your defined schema constraints.",
      icon: <FileJson className="w-6 h-6 text-distill-core" />,
    },
    {
      title: "Headless API & Webhooks",
      description: "An invisible workflow operations layer built to forward processed artifacts instantly to Jira, Linear, GitHub, or any custom CI/CD pipelines.",
      icon: <Webhook className="w-6 h-6 text-distill-core" />,
    },
  ];

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
      question: "What is the Team dashboard?",
      answer: "The Team tier gives you a hosted UI to manage your webhooks, view retry queues, and share a schema library across your organization."
    },
    {
      question: "Are my audio files stored securely?",
      answer: "We do not store your audio files at all. They are streamed directly to the Groq API using your credentials and immediately discarded after transcription."
    }
  ];

  return (
    <div className="w-full bg-background flex flex-col">
      {/* 
        ---------------------------------------------
        HERO SECTION
        ---------------------------------------------
      */}
      <section className="relative min-h-[90vh] w-full flex flex-col items-center justify-center pt-24 md:pt-30 pb-16 px-8 overflow-hidden">
        
        {/* Triple-Node Massive Vibrant U-Shape Glow managed by Component */}
        <Aura variant="hero" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto gap-8">
          <div className="flex flex-col gap-2">
            <BlurReveal duration={1.2}>
              <h1 className="font-pixel text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[1.1] text-foreground">
                Audio-to-JSON
              </h1>
            </BlurReveal>
            <BlurReveal duration={1.2} delay={0.15}>
              <h1 className="font-pixel text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[1.1] text-distill-muted">
                via your API key.
              </h1>
            </BlurReveal>
          </div>

          <BlurReveal duration={1.2} delay={0.2}>
            <p className="text-lg md:text-xl text-distill-muted leading-relaxed font-sans max-w-2xl text-white">
              Bring Your Own Key (BYOK) audio extraction. You provide the Groq API key; we handle schema extraction and webhook routing.
            </p>
          </BlurReveal>

          <BlurReveal duration={1.2} delay={0.4}>
            <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
              <Link href="/docs" className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-distill-core text-background font-bold tracking-wide hover:bg-white transition-colors shadow-[0_0_20px_rgba(228,221,244,0.4)]">
                View Documentation
              </Link>
              <Link href="#pricing" className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-distill-violet/50 text-distill-core font-medium tracking-wide hover:bg-distill-violet/10 transition-colors">
                View Pricing
              </Link>
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
      <div className="relative w-full rounded-[40px] md:rounded-[60px] bg-black overflow-hidden border border-white/5 shadow-[0_-20px_100px_rgba(72,38,185,0.05)]">
        
        {/* Glowing Mist Wave Background */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:linear-gradient(60deg,transparent_20%,#000_50%,transparent_80%)] [-webkit-mask-image:linear-gradient(60deg,transparent_20%,#000_50%,transparent_80%)] [mask-size:300%_100%] [-webkit-mask-size:300%_100%] animate-wave-glow pointer-events-none z-0" />

      {/* 
        ---------------------------------------------
        STATELESS PIPELINE ARCHITECTURE (Consolidated & Premium)
        ---------------------------------------------
      */}
      <section id="architecture" className="relative w-full py-32 px-8 bg-transparent">
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-24">
          
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 border-b border-white/10 pb-12">
            <div className="flex flex-col gap-4 max-w-3xl">
              <BlurReveal duration={1}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-distill-core animate-pulse" />
                  <span className="text-distill-core font-mono text-xs tracking-[0.3em] uppercase">System Architecture</span>
                </div>
              </BlurReveal>
              <BlurReveal duration={1} delay={0.2}>
                <h2 className="font-pixel text-4xl md:text-6xl tracking-tighter text-white">Secure BYOK Protocol.</h2>
              </BlurReveal>
            </div>
            <BlurReveal duration={1} delay={0.3}>
              <p className="text-white/50 text-sm font-mono max-w-md leading-relaxed text-left md:text-right">
                A purely stateless API extraction pipeline utilizing your own Groq credentials. Zero data retention. Zero enterprise bloat.
              </p>
            </BlurReveal>
          </div>

          <BlurReveal duration={1} delay={0.4}>
            <div className="w-full flex justify-center">
              <div className="w-full max-w-5xl relative group">
                {/* Terminal Window */}
                <div className="relative w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-3xl shadow-[0_0_80px_rgba(72,38,185,0.05)] overflow-hidden flex flex-col transition-shadow duration-700 hover:shadow-[0_0_100px_rgba(72,38,185,0.15)]">
                  {/* Terminal Header */}
                  <div className="h-10 w-full bg-white/[0.02] border-b border-white/5 flex items-center justify-between px-6">
                    <div className="flex gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-red-500/80 transition-colors" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-yellow-500/80 transition-colors" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-green-500/80 transition-colors" />
                    </div>
                    <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">distill_stateless_proxy.sh</span>
                  </div>
                  {/* Terminal Body */}
                  <div className="relative p-8 md:p-16 overflow-x-auto">
                    {/* Scanlines & Glow */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-30 pointer-events-none" />
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-distill-violet/20 blur-[100px] pointer-events-none group-hover:bg-distill-core/20 transition-colors duration-1000" />
                    
                    <pre className="relative z-10 font-mono text-xs md:text-sm lg:text-base leading-[1.8] tracking-[0.15em] whitespace-pre mx-auto w-max text-left">
<span className="text-white/80">{'[ AUDIO STREAM ]'}</span><span className="text-white/30">{` ──────────┐\n`}</span>
<span className="text-white/30">{`                         │\n`}</span>
<span className="text-white/30">{`                         ▼\n`}</span>
<span className="text-distill-violet drop-shadow-[0_0_10px_rgba(72,38,185,0.8)]">{`               ┌───────────────────┐\n`}</span>
<span className="text-distill-violet drop-shadow-[0_0_10px_rgba(72,38,185,0.8)]">{`               │ DISTILL.AI PROXY  │`}</span><span className="text-white/40">{` ──( ZERO RETENTION )──┐\n`}</span>
<span className="text-distill-violet drop-shadow-[0_0_10px_rgba(72,38,185,0.8)]">{`               │ (Stateless Core)  │`}</span><span className="text-white/40">{`                       │\n`}</span>
<span className="text-distill-violet drop-shadow-[0_0_10px_rgba(72,38,185,0.8)]">{`               └───────────────────┘`}</span><span className="text-white/40">{`                       │\n`}</span>
<span className="text-white/40">{`                         │                                 │\n`}</span>
<span className="text-distill-core">{' [ GROQ_API_KEY ] '}</span><span className="text-white/40">{`──────┤                                 │\n`}</span>
<span className="text-white/40">{`                         ▼                                 │\n`}</span>
<span className="text-white/40">{`               ┌───────────────────┐                       │\n`}</span>
<span className="text-white/40">{`               │ GROQ INFERENCE    │                       │\n`}</span>
<span className="text-white/40">{`               │ whisper-large-v3  │                       │\n`}</span>
<span className="text-white/40">{`               └───────────────────┘                       │\n`}</span>
<span className="text-white/40">{`                         │                                 │\n`}</span>
<span className="text-white/40">{`                         ▼                                 │\n`}</span>
<span className="text-white/40">{`               ┌───────────────────┐                       │\n`}</span>
<span className="text-white/40">{`               │ SCHEMA VALIDATOR  │ ◀─────────────────────┘\n`}</span>
<span className="text-white/40">{`               │ (Strict JSON)     │\n`}</span>
<span className="text-white/40">{`               └───────────────────┘\n`}</span>
<span className="text-white/40">{`                         │\n`}</span>
<span className="text-white/40">{`                         ▼\n`}</span>
<span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{'             [ STRUCTURED JSON ARTIFACT ]'}</span>{`\n`}
<span className="text-white/40">{`                         │\n`}</span>
<span className="text-white/40">{`                         ▼\n`}</span>
<span className="text-white/80">{'           [ WEBHOOK -> JIRA / GITHUB / LINEAR ]'}</span>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </BlurReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 p-px">
            {differentiators.map((diff, i) => (
              <BlurReveal key={i} duration={1} delay={0.5 + i * 0.1}>
                <div className="group relative h-full bg-black p-10 flex flex-col gap-12 overflow-hidden transition-colors hover:bg-white/[0.02]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-distill-violet/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="text-white/30 group-hover:text-distill-core transition-colors duration-500">
                      {diff.icon}
                    </div>
                    <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest group-hover:text-white/60 transition-colors">SEC_0{i+1}</span>
                  </div>

                  <div className="relative z-10 flex flex-col gap-4">
                    <h3 className="text-lg font-mono tracking-tighter text-white uppercase">{diff.title}</h3>
                    <p className="text-white/50 leading-relaxed text-sm font-mono">
                      {diff.description}
                    </p>
                  </div>
                </div>
              </BlurReveal>
            ))}
          </div>

        </div>
      </section>

      {/* 
        ---------------------------------------------
        USE CASES SECTION (New)
        ---------------------------------------------
      */}
      <section id="use-cases" className="relative w-full py-32 px-8 overflow-hidden bg-transparent">
        <Aura variant="conic" />
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-16">
          <BlurReveal duration={1} delay={0.1}>
            <div className="flex flex-col items-center text-center gap-4">
              <span className="text-distill-core font-mono text-sm tracking-widest uppercase">Target Architectures</span>
              <h2 className="font-pixel text-4xl md:text-5xl tracking-tighter text-foreground">Built for Hackers & Indie Makers.</h2>
            </div>
          </BlurReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <BlurReveal duration={1} delay={0.3}>
              <div className="flex flex-col gap-6 p-10 rounded-2xl bg-white/[0.02] border border-white/10 h-full">
                <Code2 className="w-10 h-10 text-distill-core" />
                <h3 className="text-2xl font-bold text-foreground font-sans">For Solo Developers</h3>
                <p className="text-distill-muted leading-relaxed text-lg font-sans">
                  Bring your Groq API key and instantly process 1-hour meetings in seconds. Extract action items securely via our proxy dashboard.
                </p>
                <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-distill-core">
                  export GROQ_API_KEY="gsk_..."
                </div>
              </div>
            </BlurReveal>

            <BlurReveal duration={1} delay={0.4}>
              <div className="flex flex-col gap-6 p-10 rounded-2xl bg-white/[0.02] border border-white/10 h-full">
                <Terminal className="w-10 h-10 text-distill-violet" />
                <h3 className="text-2xl font-bold text-foreground font-sans">For Product Engineering</h3>
                <p className="text-distill-muted leading-relaxed text-lg font-sans">
                  Transform unstructured assets into strict schemas. Connect webhooks to instantly process UX interviews directly into labeled, categorized feature requests.
                </p>
                <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-distill-violet">
                  POST https://api.distill.ai/v1/extract
                </div>
              </div>
            </BlurReveal>
          </div>
        </div>
      </section>

      {/* 
        ---------------------------------------------
        PLATFORM FEATURES (Engine 2.0)
        ---------------------------------------------
      */}
      <section id="features" className="relative w-full py-32 px-8 overflow-hidden bg-transparent border-y border-white/5">
        <Aura variant="aurora" />
        
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-16">
          <BlurReveal duration={1} delay={0.1}>
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 pb-12 border-b border-white/5">
              <div className="flex flex-col gap-4 max-w-2xl">
                <span className="text-distill-core font-mono text-xs tracking-[0.3em] uppercase">Specs // 2.0</span>
                <h2 className="font-pixel text-4xl md:text-6xl tracking-tighter text-white">The Intelligence Layer.</h2>
              </div>
              <p className="text-white/50 text-sm font-mono max-w-md leading-relaxed text-left md:text-right">
                Deterministic data parsing mechanisms built on top of Groq's LPU architecture. Engineered for pure JSON fidelity.
              </p>
            </div>
          </BlurReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 p-px shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {features.map((feature, i) => (
              <BlurReveal key={i} duration={1} delay={0.2 + i * 0.1}>
                <div className="group bg-black p-10 md:p-14 flex flex-col gap-10 h-full relative overflow-hidden transition-all hover:bg-white/[0.02]">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-distill-violet/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="p-4 border border-white/5 bg-white/[0.02] text-white/30 group-hover:text-distill-violet group-hover:border-distill-violet/30 transition-colors">
                      {feature.icon}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">MOD_0{i+1}</span>
                      <h3 className="text-xl md:text-2xl font-mono tracking-tighter text-white uppercase">{feature.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-white/50 leading-relaxed text-sm md:text-base font-mono relative z-10">
                    {feature.description}
                  </p>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>



      {/* 
        ---------------------------------------------
        PRICING SECTION (2-Tier Model)
        ---------------------------------------------
      */}
      <section id="pricing" className="relative w-full py-32 px-8 flex flex-col items-center justify-center border-t border-white/5">
        <Aura variant="tactical-noise" />
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-16 w-full items-center">
          <BlurReveal duration={1} delay={0.1}>
            <div className="flex flex-col items-center text-center gap-4">
              <h2 className="font-pixel text-4xl md:text-5xl tracking-tighter text-foreground">Honest Pricing.</h2>
              <p className="text-distill-muted max-w-2xl text-lg font-sans">
                No enterprise bloat. Use your own API keys for free, forever.
              </p>
            </div>
          </BlurReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            {/* Developer Sandbox */}
            <BlurReveal duration={1} delay={0.2} className="h-full">
              <div className="flex flex-col gap-8 p-10 rounded-3xl bg-white/[0.02] border border-white/10 h-full">
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-bold text-foreground font-sans">Open Source</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl lg:text-5xl font-black text-foreground font-sans">Free</span>
                  </div>
                  <span className="text-xs text-distill-muted font-mono mt-1 uppercase">BYOK Access</span>
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-muted mt-0.5" />
                    <span className="text-distill-muted font-sans text-sm">Bring your own Groq key</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-muted mt-0.5" />
                    <span className="text-distill-muted font-sans text-sm">Pay only for what you use via Groq</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-muted mt-0.5" />
                    <span className="text-distill-muted font-sans text-sm">Community forum support</span>
                  </div>
                </div>
                <Link href="/docs" className="w-full py-3 rounded-full border border-white/20 text-foreground font-medium font-sans hover:bg-white/5 transition-colors flex justify-center items-center">
                  View Documentation
                </Link>
              </div>
            </BlurReveal>

            {/* Pro Tier */}
            <BlurReveal duration={1} delay={0.3} className="h-full transform md:-translate-y-4">
              <div className="flex flex-col gap-8 p-10 rounded-3xl bg-distill-violet/5 border border-distill-violet/50 h-full relative overflow-hidden shadow-[0_0_50px_rgba(72,38,185,0.1)]">
                <div className="absolute top-0 right-0 px-4 py-1 bg-distill-violet text-white text-xs font-bold rounded-bl-xl z-20 uppercase tracking-wider">Coming Soon</div>
                <div className="absolute inset-0 bg-gradient-to-br from-distill-violet/20 to-transparent pointer-events-none" />
                <div className="flex flex-col gap-2 relative z-10 opacity-70">
                  <h3 className="text-2xl font-bold text-foreground font-sans">Pro</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl lg:text-5xl font-black text-foreground font-sans">$29</span>
                    <span className="text-distill-muted font-sans font-medium">/ month</span>
                  </div>
                  <span className="text-xs text-distill-muted font-mono mt-1 uppercase">For serious indie makers</span>
                </div>
                <div className="flex-1 flex flex-col gap-4 relative z-10 opacity-70">
                   <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-core mt-0.5" />
                    <span className="text-distill-core font-sans text-sm">Everything in Free</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-core mt-0.5" />
                    <span className="text-distill-core font-sans text-sm">Pre-built schemas (Jira, Linear)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-distill-core mt-0.5" />
                    <span className="text-distill-core font-sans text-sm">Priority Discord support</span>
                  </div>
                </div>
                <button 
                  disabled
                  className="w-full py-3 rounded-full bg-distill-core/50 text-white/50 font-bold tracking-wide font-sans relative z-10 cursor-not-allowed"
                >
                  Join Waitlist
                </button>
              </div>
            </BlurReveal>

          </div>
        </div>
      </section>

      {/* 
        ---------------------------------------------
        FAQ SECTION
        ---------------------------------------------
      */}
      <section className="relative w-full py-24 px-8 bg-transparent border-t border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col gap-12">
          <BlurReveal duration={1}>
             <h2 className="font-pixel text-3xl md:text-5xl tracking-tighter text-foreground text-center">Developer FAQ</h2>
          </BlurReveal>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <BlurReveal key={idx} duration={1} delay={0.2 + idx * 0.1}>
                <div 
                  className={cn("p-6 rounded-2xl border transition-all cursor-pointer", openFaq === idx ? "bg-white/[0.04] border-white/20" : "bg-white/[0.01] border-white/5 hover:border-white/10")}
                  onClick={() => setOpenFaq(idx === openFaq ? null : idx)}
                >
                  <h4 className="text-lg font-bold font-sans text-foreground flex justify-between items-center">
                    {faq.question}
                    <span className="text-distill-violet text-xl font-mono">{openFaq === idx ? "-" : "+"}</span>
                  </h4>
                  {openFaq === idx && (
                    <p className="mt-4 text-distill-muted font-sans text-sm leading-relaxed border-t border-white/5 pt-4">
                      {faq.answer}
                    </p>
                  )}
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      </div>

      {/* CTA SECTION */}
      <section className="w-full relative min-h-[80vh] flex flex-col items-center justify-center px-8 bg-gradient-to-b from-transparent to-distill-violet/5 border-t border-white/5 overflow-hidden">
        <Aura variant="footer" />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
          <BlurReveal duration={1}>
            <h2 className="font-pixel text-5xl md:text-7xl tracking-tighter text-foreground">Extract the Signal.</h2>
            <p className="text-xl text-distill-muted mt-6 font-sans">
              Join elite frontend teams processing thousands of hours of audio with pure JSON fidelity.
            </p>
          </BlurReveal>
          <BlurReveal duration={1} delay={0.2}>
            <div className="flex gap-4 mt-8">
              <Link href="/login" className="group px-8 py-4 rounded-xl bg-foreground text-background font-bold tracking-wide hover:scale-105 transition-all text-lg flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Initialize Distill Core
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </BlurReveal>
        </div>
      </section>

      {/* PREMIUM FOOTER */}
      <footer className="w-full bg-[#030108] border-t border-white/10 pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            <div className="flex flex-col gap-6 md:col-span-1">
              <span className="font-anta text-2xl tracking-widest text-foreground">DISTILL.<span className="text-distill-violet">AI</span></span>
              <p className="text-sm text-distill-muted leading-relaxed font-sans pr-4">
                Open-source audio intelligence. Bring Your Own Key (BYOK) architecture for lightning-fast, deterministic extraction.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <span className="text-foreground font-bold tracking-wide text-sm uppercase">Product</span>
              <Link href="/#features" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Engine 2.0</Link>
              <Link href="/#pricing" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Pricing</Link>
              <Link href="/docs" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Documentation</Link>
              <Link href="/changelog" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Changelog</Link>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-foreground font-bold tracking-wide text-sm uppercase">Company</span>
              <Link href="/about" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">About</Link>
              <Link href="/blog" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Blog</Link>
              <Link href="/contact" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Contact</Link>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-foreground font-bold tracking-wide text-sm uppercase">Legal & Security</span>
              <Link href="/privacy" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Privacy Policy</Link>
              <Link href="/terms" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">Terms of Service</Link>
              <Link href="/soc2" className="text-distill-muted hover:text-white transition-colors text-sm font-sans">SOC2 Roadmap</Link>
            </div>
          </div>

          <div className="w-full h-px bg-white/10" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-xs text-distill-muted font-sans">© 2026 Distill OS. All rights reserved.</span>
            <div className="flex items-center gap-6">
               <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-distill-muted hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
               </a>
               <a href="https://github.com" target="_blank" rel="noreferrer" className="text-distill-muted hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
               </a>
               <a href="https://discord.com" target="_blank" rel="noreferrer" className="text-distill-muted hover:text-white transition-colors">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
               </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Empty space buffering the fixed bottom bar */}
      <div className="h-24 w-full bg-transparent" />
    </div>
  );
}
