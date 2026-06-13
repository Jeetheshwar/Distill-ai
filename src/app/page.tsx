"use client";

import { Aura } from "@/components/ui/aura";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { 
  FileJson, Webhook, CheckCircle2, 
  ArrowRight, Code2, Terminal, Mic, Sparkles, Rocket, 
  Upload, Play, Square, Loader2, ArrowUpRight, MessageSquare, Zap
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { WaitlistModal } from "@/components/waitlist-modal";

import { createClient } from "@/utils/supabase/client";
import { loadStripe } from "@stripe/stripe-js";

// Make sure to use process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in a real setup
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

export default function Home() {
  const [user, setUser] = useState<unknown>(null);
  const supabase = createClient();
  const [isAnnual, setIsAnnual] = useState(true);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (tierId: string, priceId: string) => {
    setLoadingTier(tierId);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await response.json();
      
      if (data.sessionId) {
        const stripe = await stripePromise;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (stripe as any)?.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        alert("Stripe is running in stub mode (Missing API Keys). In production, this redirects to checkout.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to initialize checkout.");
    }
    setLoadingTier(null);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };
    checkUser();
  }, []);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Demo State
  const [demoStep, setDemoStep] = useState<1 | 2 | 3 | 4>(1);
  const [schemaMode, setSchemaMode] = useState<"standup" | "retro">("standup");
  const [apiKey, setApiKey] = useState("");
  const [processingText, setProcessingText] = useState("Transcribing with Groq Whisper...");
  const [showJiraModal, setShowJiraModal] = useState(false);
  const [streamedJson, setStreamedJson] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [demoResult, setDemoResult] = useState<unknown>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setDemoStep(2);
    }
  };
  
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
    setSelectedFile(null);
    setDemoStep(2);
  };

  const handleProcess = async () => {
    setDemoStep(3);
    setProcessingText("Initializing pipeline...");

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      } else {
        formData.append("transcript", "Mocked local transcription: The team discussed migrating the main database to PostgreSQL 16. Sarah will lead the migration effort because of her prior experience with PgBouncer. It is a high priority task.");
      }
      formData.append("schema", schemaMode);

      setProcessingText("Transcribing & extracting via API...");
      
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "authorization": `Bearer ${apiKey || "sk_mock_pro_key_9281"}`
        },
        body: formData
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      const data = await response.json();
      setDemoResult(data.entities);
      setStreamedJson("");
      setDemoStep(4);
      setProcessingText("Transcribing with Groq Whisper..."); // Reset text
    } catch (err: unknown) {
      console.error(err);
      alert(`Extraction failed: ${err.message || "Check API key or file."}`);
      setDemoStep(1);
    }
  };

  useEffect(() => {
    if (demoStep === 4 && demoResult) {
      let currentIndex = 0;
      const fullString = JSON.stringify(demoResult, null, 2);
      const interval = setInterval(() => {
        currentIndex += Math.max(8, Math.floor(fullString.length / 50));
        if (currentIndex <= fullString.length) {
          setStreamedJson(fullString.slice(0, currentIndex));
        } else {
          setStreamedJson(fullString);
          clearInterval(interval);
        }
      }, 15);
      return () => clearInterval(interval);
    }
  }, [demoStep, demoResult]);

  const faqs = [
    {
      question: "How does Bring Your Own Key (BYOK) work?",
      answer: "You plug in your Groq API key in the settings. We securely proxy your audio to Groq's inference endpoints and orchestrate the schema extraction without storing your data."
    },
    {
      question: "Which models are you using under the hood?",
      answer: "We utilize whisper-large-v3-turbo for ASR via the Groq API, paired with Llama 3.3 70B Versatile to guarantee pure, structural JSON output."
    },
    {
      question: "Are my audio files stored securely?",
      answer: "We do not store your audio files at all. They are streamed directly to the Groq API using your credentials and immediately discarded after transcription."
    }
  ];

  return (
    <div className="w-full bg-background flex flex-col font-sans overflow-x-clip relative">
      {/* Premium Background Grid (+ - dots) spread across hero and wrapper */}
      <div className="absolute top-0 left-0 w-full h-[150vh] z-0 pointer-events-none overflow-hidden [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_70%)]">
        
        {/* Premium Noise Grain Overlay */}
        <div className="absolute inset-0 w-full h-full opacity-20 mix-blend-overlay">
           <svg className="w-full h-full">
             <filter id="noiseFilter">
               <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
             </filter>
             <rect width="100%" height="100%" filter="url(#noiseFilter)" />
           </svg>
        </div>

        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="premium-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 24 20 L 24 28 M 20 24 L 28 24" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 44 24 L 52 24" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M -4 24 L 4 24" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <circle cx="0" cy="0" r="1.5" fill="white" />
              <circle cx="48" cy="0" r="1.5" fill="white" />
              <circle cx="0" cy="48" r="1.5" fill="white" />
              <circle cx="48" cy="48" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#premium-grid)" />
        </svg>
      </div>

      {/* 
        ---------------------------------------------
        HERO SECTION (1.1)
        ---------------------------------------------
      */}
      <section className="relative min-h-[75vh] w-full flex flex-col items-center justify-center pt-16 md:pt-20 pb-12 px-8 z-10">
        
        {/* Triple-Node Massive Vibrant U-Shape Glow managed by Component */}
        <Aura variant="hero" />



        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto gap-5 pt-16 md:pt-12">
          
          <BlurReveal duration={1.2}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl shadow-[0_0_30px_rgba(72,38,185,0.3)] translate-y-[5px]">
              <span className="flex h-2 w-2 rounded-full bg-distill-core animate-pulse shadow-[0_0_10px_var(--distill-core)]"></span>
              <span className="text-sm font-mono text-white/90">Llama 3.3 Inference Online <span className="text-white/40 ml-2 hidden sm:inline">• 2,000+ developers</span></span>
            </div>
          </BlurReveal>

          <div className="flex flex-col gap-2">
            <BlurReveal duration={1.2} delay={0.1}>
              <h1 className="font-sergena text-[36px] sm:text-[48px] md:text-[72px] lg:text-[84px] tracking-tighter leading-[1.1]">
                <span className="block text-foreground">Turn Standup Recordings</span>
                <span className="block text-distill-muted mt-2">
                  into <span className="bg-gradient-to-br from-[#0052CC] to-distill-violet bg-clip-text text-transparent drop-shadow-lg">Jira Tickets</span> in <span className="bg-gradient-to-br from-distill-core to-white bg-clip-text text-transparent drop-shadow-lg">30 Seconds</span>
                </span>
              </h1>
            </BlurReveal>
          </div>

          <BlurReveal duration={1.2} delay={0.2}>
            <p className="text-base md:text-lg text-distill-muted leading-relaxed max-w-2xl text-white/70">
              Upload your daily standup audio. Distill auto-extracts tasks, bugs, and blockers — then creates Jira/Linear tickets automatically. BYOK. We do not persist audio files.
            </p>
          </BlurReveal>

          <BlurReveal duration={1.2} delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 justify-center">
              <div className="relative group w-full sm:w-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-distill-core via-distill-violet to-distill-core rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500 animate-tilt z-0"></div>
                <Link href={user ? "/dashboard" : "/login?signup=true"} className="relative inline-flex items-center justify-center px-8 py-4 rounded-full bg-black border border-white/10 text-white font-bold tracking-wide transition-all w-full sm:w-auto overflow-hidden hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset] z-10">
                  <span className="relative z-10 flex items-center">
                    {user ? "Go to Dashboard" : "Create Free Account"}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 text-distill-core group-hover:rotate-[-45deg]" />
                  </span>
                  {/* Premium sweep effect */}
                  <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out skew-x-12 z-0" />
                </Link>
              </div>
              <a href="https://github.com/Jeetheshwar/Distill-ai" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white font-medium tracking-wide hover:bg-white/10 transition-colors w-full sm:w-auto">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                View on GitHub
              </a>
            </div>
          </BlurReveal>

          <BlurReveal duration={1.2} delay={0.6}>
            <div className="mt-20 md:mt-28 flex flex-col items-center gap-4">
              <span className="text-xs font-mono text-white/60 uppercase tracking-widest">Natively Integrates With</span>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-100 transition-opacity duration-500">
                {/* Jira */}
                <div className="flex items-center gap-3 group cursor-default">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0052CC] shadow-[0_4px_20px_rgba(0,82,204,0.3)] shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 10.37h-3.3v-3.3c0-.66-.54-1.2-1.2-1.2h-3.3c-.66 0-1.2.54-1.2 1.2v3.3h3.3c.66 0 1.2.54 1.2 1.2v3.3h-3.3c-.66 0-1.2.54-1.2 1.2v3.3c0 .66.54 1.2 1.2 1.2h3.3c.66 0 1.2-.54 1.2-1.2v-3.3h3.3c.66 0 1.2-.54 1.2-1.2v-3.3c0-.66-.54-1.2-1.2-1.2z"/></svg>
                  </div>
                  <span className="font-bold text-white/70 group-hover:text-white tracking-tight transition-colors">Jira</span>
                </div>
                {/* Linear */}
                <div className="flex items-center gap-3 group cursor-default">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1A1A1A] border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                    <svg className="w-6 h-6 text-[#E0E0E0]" viewBox="0 0 24 24" fill="currentColor"><path d="M13.2 2H3C2.4 2 2 2.4 2 3v10.2c0 .3.1.5.3.7l9.8 9.8c.4.4 1 .4 1.4 0l10.2-10.2c.4-.4.4-1 0-1.4L13.9 2.3C13.7 2.1 13.5 2 13.2 2zM12 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                  </div>
                  <span className="font-bold text-white/70 group-hover:text-white tracking-tight transition-colors">Linear</span>
                </div>
                {/* Slack */}
                <div className="flex items-center gap-3 group cursor-default">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(255,255,255,0.15)] shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A"/>
                      <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
                      <path d="M8.834 5.042a2.528 2.528 0 0 1 2.521-2.52A2.528 2.528 0 0 1 13.876 5.042a2.527 2.527 0 0 1-2.521 2.52h-2.52v-2.52z" fill="#36C5F0"/>
                      <path d="M8.834 6.313a2.527 2.527 0 0 1 2.521 2.521 2.527 2.527 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
                      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.527 2.527 0 0 1-2.522 2.52h-2.522v-2.52z" fill="#2EB67D"/>
                      <path d="M17.688 8.834a2.527 2.527 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.528 2.528 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
                      <path d="M15.165 18.956a2.528 2.528 0 0 1-2.523 2.52A2.528 2.528 0 0 1 10.12 18.956a2.527 2.527 0 0 1 2.522-2.52h2.523v2.52z" fill="#ECB22E"/>
                      <path d="M15.165 17.688a2.527 2.527 0 0 1-2.523-2.521 2.527 2.527 0 0 1 2.523-2.521h6.312A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.521h-6.313z" fill="#ECB22E"/>
                    </svg>
                  </div>
                  <span className="font-bold text-white/70 group-hover:text-white tracking-tight transition-colors">Slack</span>
                </div>
              </div>
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
        {/* Glowing Mist Wave Background - Dots removed in favor of top-level premium grid */}
        <div className="absolute inset-0 bg-transparent [mask-image:linear-gradient(60deg,transparent_20%,#000_50%,transparent_80%)] [-webkit-mask-image:linear-gradient(60deg,transparent_20%,#000_50%,transparent_80%)] [mask-size:300%_100%] [-webkit-mask-size:300%_100%] animate-wave-glow pointer-events-none z-0" />

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
              <div className="relative group w-full">
                {/* Ultra Premium Glow Background */}
                <div className="absolute -inset-1 bg-gradient-to-r from-distill-violet via-[#0052CC] to-distill-core rounded-[2.2rem] blur-2xl opacity-30 group-hover:opacity-60 transition duration-1000 z-0"></div>
                
                <div className="w-full rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#0a0710]/95 to-[#000000]/95 backdrop-blur-3xl shadow-[0_40px_100px_-20px_rgba(72,38,185,0.3)] overflow-hidden min-h-[650px] flex flex-col relative ring-1 ring-white/5 z-10">
                {/* Premium Top Glow Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-distill-violet/60 to-transparent z-10" />
                
                {/* Mac-style Title Bar */}
                <div className="h-14 w-full bg-white/[0.01] border-b border-white/10 flex items-center px-6 gap-4 relative z-10">
                   <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                   </div>
                   <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-mono text-white/30 tracking-widest uppercase">
                     sandbox.tsx <span className="w-1.5 h-1.5 rounded-full bg-distill-violet/50" />
                   </div>
                   <div className="flex items-center gap-2 ml-auto overflow-hidden">
                     {[1,2,3,4].map(s => (
                        <div key={s} className="flex items-center gap-2">
                          <span className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded transition-colors", demoStep === s ? "bg-distill-violet/20 text-distill-violet ring-1 ring-distill-violet/30" : "text-white/20")}>
                            {s}
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
                      <button suppressHydrationWarning 
                        onClick={handleSampleAudio}
                        className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Use Sample Audio (45s)
                      </button>

                      <div className="mt-8 w-full max-w-md">
                        <label className="text-white/50 text-xs mb-2 block">Enter Groq API key for live demo (optional)</label>
                        <input suppressHydrationWarning 
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
                        <button suppressHydrationWarning 
                          onClick={() => setSchemaMode("standup")}
                          className={cn("flex-1 p-6 rounded-xl border flex flex-col items-center gap-3 transition-all", schemaMode === "standup" ? "bg-distill-violet/10 border-distill-violet" : "bg-black border-white/10 hover:border-white/30")}
                        >
                          <Terminal className={cn("w-8 h-8", schemaMode === "standup" ? "text-distill-violet" : "text-white/40")} />
                          <span className="text-white font-medium">Standup Mode</span>
                          <span className="text-white/40 text-xs text-center">Extracts Tasks, Bugs, Blockers</span>
                        </button>
                        <button suppressHydrationWarning 
                          onClick={() => setSchemaMode("retro")}
                          className={cn("flex-1 p-6 rounded-xl border flex flex-col items-center gap-3 transition-all", schemaMode === "retro" ? "bg-distill-core/10 border-distill-core" : "bg-black border-white/10 hover:border-white/30")}
                        >
                          <MessageSquare className={cn("w-8 h-8", schemaMode === "retro" ? "text-distill-core" : "text-white/40")} />
                          <span className="text-white font-medium">Sprint Retro Mode</span>
                          <span className="text-white/40 text-xs text-center">Extracts Wins, Improvements, Actions</span>
                        </button>
                      </div>
                      <div className="flex gap-4 mt-4">
                        <button suppressHydrationWarning onClick={() => setDemoStep(1)} className="px-6 py-2 rounded-lg text-white/50 hover:text-white transition-colors">Back</button>
                        <button suppressHydrationWarning onClick={handleProcess} className="px-8 py-2 rounded-lg bg-distill-violet text-white font-bold hover:bg-distill-violet/80 transition-colors shadow-[0_0_20px_rgba(72,38,185,0.4)]">Process Audio</button>
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
                        <button suppressHydrationWarning onClick={() => setDemoStep(1)} className="text-xs text-white/40 hover:text-white transition-colors underline">Start Over</button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                        {/* Transcript side */}
                        <div className="flex flex-col gap-4 border border-white/10 rounded-xl p-6 bg-white/[0.02] overflow-y-auto h-full max-h-[340px]">
                          <h4 className="text-sm font-mono text-white/50 uppercase">Transcript</h4>
                          <div className="text-white/80 text-sm leading-relaxed font-sans space-y-4">
                            <p>
                              <span className="font-bold text-distill-violet">Alex:</span> &quot;Hey team. So <span className="bg-green-500/20 text-green-300 px-1 rounded">yesterday I finally finished the billing integration</span>, that&apos;s all pushed to prod. 
                              <span className="bg-blue-500/20 text-blue-300 px-1 rounded ml-1">Today I&apos;m working on the Jira webhook setup</span> so we can auto-create tickets. 
                              The only issue is <span className="bg-red-500/20 text-red-300 px-1 rounded">I&apos;m currently waiting on design for the modal</span>, so that&apos;s a blocker right now. That&apos;s it for me.&quot;
                            </p>
                          </div>
                        </div>

                        {/* JSON side */}
                        <div className="flex flex-col gap-4 border border-white/10 rounded-xl bg-black overflow-hidden h-full max-h-[340px]">
                          <div className="h-10 bg-white/5 flex items-center px-4 justify-between border-b border-white/10">
                            <span className="text-xs font-mono text-white/50 uppercase">output.json</span>
                            <span className="text-xs font-mono text-green-400">Valid Schema</span>
                          </div>
                          <div className="p-4 overflow-y-auto">
                            <pre className="text-xs font-mono text-white/80">
{streamedJson.split('\n').map((line, i) => (
  <span key={i} className="block hover:bg-white/5 px-2 -mx-2 rounded h-4">{line}</span>
))}
{streamedJson.length < JSON.stringify(demoResult || {}, null, 2).length && (
  <span className="inline-block w-2 h-3 bg-white/80 animate-pulse ml-1 align-middle mt-1" />
)}
                            </pre>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-white/10 mt-2 gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                          <Link href="/login?signup=true" className="px-6 py-3 sm:py-2.5 rounded-lg bg-distill-core text-black font-bold hover:bg-white transition-colors text-sm text-center w-full sm:w-auto">
                            Get Full Access — Free
                          </Link>
                          <a href="https://github.com/Jeetheshwar/Distill-ai" target="_blank" rel="noreferrer" className="px-6 py-3 sm:py-2.5 rounded-lg border border-white/20 text-white font-medium hover:bg-white/10 transition-colors text-sm flex items-center justify-center gap-2 w-full sm:w-auto">
                            Self-Host
                          </a>
                        </div>
                        <button suppressHydrationWarning 
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
        <div id="features" className="w-full bg-[#E5F0FF] rounded-[3rem] overflow-hidden my-24 border-4 border-black/5 shadow-[12px_12px_0px_rgba(0,0,0,0.05)] relative">
          {/* Abstract colorful blobs for Neubrutalist Glass to overlay */}
          <div className="absolute top-10 -left-20 w-[40rem] h-[40rem] bg-pink-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
          <div className="absolute bottom-10 -right-20 w-[40rem] h-[40rem] bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[30rem] h-[30rem] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
          <div className="absolute bottom-1/4 left-2/3 w-[35rem] h-[35rem] bg-amber-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
          
          <section className="relative w-full py-24 px-4 md:px-8 bg-transparent text-black">
            <div className="max-w-7xl mx-auto flex flex-col gap-16">
               <BlurReveal duration={1}>
                  <div className="flex flex-col items-center text-center gap-4">
                    <span className="text-distill-violet font-mono text-xs tracking-[0.3em] uppercase">Architecture</span>
                    <h2 className="font-sergena text-4xl sm:text-5xl md:text-6xl tracking-tighter text-black max-w-3xl leading-[1.1]">
                      The engine behind <br/><span className="text-black/40">the 30-second standup</span>
                    </h2>
                  </div>
                </BlurReveal>

                {/* BENTO GRID (Architecture & Stats Only) */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[280px]">
                  
                  {/* Box A: AI Extraction (Span 2x2) */}
                  <BlurReveal duration={1} delay={0.1} className="md:col-span-2 lg:col-span-2 md:row-span-2">
                    <div className="h-full w-full rounded-[2rem] bg-white/40 backdrop-blur-xl border-2 border-white p-8 md:p-10 flex flex-col gap-6 overflow-hidden group transition-all duration-300 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.05)] hover:translate-y-1 hover:translate-x-1 relative">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 pointer-events-none">
                        <Sparkles className="w-32 h-32 text-distill-violet" />
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black text-black font-sans tracking-tight z-10 uppercase">AI Extraction</h3>
                      <p className="text-black/70 font-semibold max-w-sm text-lg z-10 leading-relaxed border-l-4 border-black/20 pl-4">
                        Our specialized Llama 3.3 pipeline analyzes transcripts to extract actionable tasks securely.
                      </p>
                      
                      <div className="mt-auto flex-1 w-full bg-white/60 rounded-xl border-2 border-black/5 p-6 font-mono text-sm text-black font-bold overflow-hidden relative flex flex-col gap-4">
                        <div className="leading-relaxed">
                          <span className="text-distill-violet">{"{"}</span>
                          <br/>
                          &nbsp;&nbsp;<span className="text-black">&quot;type&quot;</span>: <span className="text-black/60">&quot;Feature&quot;</span>,
                          <br/>
                          &nbsp;&nbsp;<span className="text-black">&quot;title&quot;</span>: <span className="text-black/60">&quot;Implement billing webhook&quot;</span>,
                          <br/>
                          <span className="text-distill-violet">{"}"}</span>
                        </div>
                      </div>
                    </div>
                  </BlurReveal>

                  {/* Box C: Accuracy Stat */}
                  <BlurReveal duration={1} delay={0.2} className="md:col-span-1 lg:col-span-1 md:row-span-1">
                    <div className="h-full w-full rounded-[2rem] bg-white/40 backdrop-blur-xl border-2 border-white p-8 flex flex-col justify-center items-center text-center gap-3 group transition-all duration-300 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.05)] hover:translate-y-1 hover:translate-x-1 relative overflow-hidden">
                       <span className="text-6xl lg:text-7xl font-black tracking-tighter z-10 text-black">99<span className="text-4xl text-distill-violet">.7%</span></span>
                       <div className="px-4 py-1.5 bg-black text-white border-2 border-black flex items-center justify-center -rotate-2 group-hover:rotate-0 transition-transform">
                          <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase z-10">Accuracy</span>
                       </div>
                    </div>
                  </BlurReveal>

                  {/* Box B: BYOK Architecture */}
                  <BlurReveal duration={1} delay={0.3} className="md:col-span-1 lg:col-span-1 md:row-span-1">
                    <div className="h-full w-full rounded-[2rem] bg-white/40 backdrop-blur-xl border-2 border-white p-8 flex flex-col gap-4 group transition-all duration-300 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.05)] hover:translate-y-1 hover:translate-x-1 relative overflow-hidden">
                      <div className="w-14 h-14 bg-black border-2 border-black flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                        <Mic className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-black text-black font-sans tracking-tight mt-2 uppercase">BYOK Privacy</h3>
                      <p className="text-black/70 font-semibold text-sm leading-relaxed border-l-4 border-black/20 pl-3">
                        We don&apos;t store your files. Stream audio securely using your own keys.
                      </p>
                    </div>
                  </BlurReveal>

                  {/* Box E: Instant Routing */}
                  <BlurReveal duration={1} delay={0.4} className="md:col-span-1 lg:col-span-1 md:row-span-1">
                    <div className="h-full w-full rounded-[2rem] bg-white/40 backdrop-blur-xl border-2 border-white p-8 flex flex-col gap-4 group transition-all duration-300 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.05)] hover:translate-y-1 hover:translate-x-1 relative overflow-hidden">
                      <div className="w-14 h-14 bg-black border-2 border-black flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-black text-black font-sans tracking-tight mt-2 uppercase">Routing</h3>
                      <p className="text-black/70 font-semibold text-sm leading-relaxed border-l-4 border-black/20 pl-3">
                        Structured tickets are auto-created in Jira, Linear, or GitHub instantly.
                      </p>
                    </div>
                  </BlurReveal>

                  {/* Box G: Processed Stat */}
                  <BlurReveal duration={1} delay={0.5} className="md:col-span-1 lg:col-span-1 md:row-span-1">
                    <div className="h-full w-full rounded-[2rem] bg-white/40 backdrop-blur-xl border-2 border-white p-8 flex flex-col justify-center items-center text-center gap-3 group transition-all duration-300 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.05)] hover:translate-y-1 hover:translate-x-1 relative overflow-hidden">
                       <span className="text-5xl lg:text-6xl font-black text-black tracking-tighter z-10 drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]">50k+</span>
                       <div className="px-4 py-1.5 bg-[#FFD700] border-2 border-black flex items-center justify-center rotate-2 group-hover:rotate-0 transition-transform">
                          <span className="text-black text-[10px] font-black tracking-[0.2em] uppercase z-10">Standups</span>
                       </div>
                    </div>
                  </BlurReveal>

                  {/* Box H: Marquee / Engineered With (Span All) */}
                  <BlurReveal duration={1} delay={0.6} className="md:col-span-3 lg:col-span-4 md:row-span-1">
                    <div className="h-full w-full rounded-[2rem] bg-white/40 backdrop-blur-xl border-2 border-white p-8 flex flex-col justify-center items-center gap-6 overflow-hidden relative group transition-all duration-300 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.05)] hover:translate-y-1 hover:translate-x-1">
                      <span className="text-black/50 text-[10px] uppercase tracking-[0.3em] font-black z-10">Engineered With</span>
                      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 transition-opacity duration-300 z-10">
                        <span className="text-xl font-black font-sans text-black tracking-tight hover:scale-110 transition-transform cursor-default uppercase">Groq LPU™</span>
                        <span className="text-xl font-black font-sans text-black tracking-tight hover:scale-110 transition-transform cursor-default uppercase">Llama 3.3</span>
                        <span className="text-xl font-black font-sans text-black tracking-tight hover:scale-110 transition-transform cursor-default uppercase">Whisper v3</span>
                        <span className="text-xl font-black font-sans text-black tracking-tight hover:scale-110 transition-transform cursor-default uppercase">Next.js</span>
                        <span className="text-xl font-black font-sans text-black tracking-tight hover:scale-110 transition-transform cursor-default uppercase">Supabase</span>
                      </div>
                    </div>
                  </BlurReveal>

                </div>
            </div>
          </section>

          {/* WORLD CLASS TESTIMONIALS MARQUEE */}
          <section className="relative w-full py-24 bg-transparent overflow-hidden border-t border-black/5">
            {/* Abstract colorful blobs for Neubrutalist Glass to overlay */}
            <div className="absolute top-10 left-1/4 w-[30rem] h-[30rem] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-10 right-1/4 w-[30rem] h-[30rem] bg-amber-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />

            {/* Gradient Masks for fade effect */}
            <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-[#E5F0FF] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-[#E5F0FF] to-transparent z-10 pointer-events-none" />
            
            <BlurReveal duration={1}>
              <div className="flex flex-col items-center text-center gap-4 mb-16 px-4">
                <span className="text-distill-violet font-mono text-xs tracking-[0.3em] uppercase">Wall of Love</span>
                <h2 className="font-sergena text-4xl sm:text-5xl tracking-tighter text-black">Loved by engineering teams</h2>
              </div>
            </BlurReveal>

            <div className="flex flex-col gap-6 relative z-0">
              {/* Row 1 - Scrolling Left */}
              <div className="flex w-max animate-marquee hover:[animation-play-state:paused] group">
                {[
                  { text: "I used to spend 20 minutes after every standup writing tickets. Now it takes exactly 30 seconds.", name: "Alex M.", title: "Solo Dev", initial: "AM" },
                  { text: "We integrated Distill into our sprint ritual. Our Jira board updates itself effortlessly.", name: "Sarah J.", title: "Eng Lead", initial: "SJ" },
                  { text: "BYOK means I control my data entirely. The JSON schema validation is incredibly rock solid.", name: "Mike T.", title: "Security Dev", initial: "MT" },
                  { text: "The accuracy is insane. It catches technical debt items we casually mention and creates perfect tickets.", name: "David L.", title: "Senior Engineer", initial: "DL" },
                  { text: "Our daily standups actually feel useful now because we know the busywork is being handled automatically.", name: "Priya S.", title: "Product Manager", initial: "PS" },
                  // Duplicate for infinite loop
                  { text: "I used to spend 20 minutes after every standup writing tickets. Now it takes exactly 30 seconds.", name: "Alex M.", title: "Solo Dev", initial: "AM" },
                  { text: "We integrated Distill into our sprint ritual. Our Jira board updates itself effortlessly.", name: "Sarah J.", title: "Eng Lead", initial: "SJ" },
                  { text: "BYOK means I control my data entirely. The JSON schema validation is incredibly rock solid.", name: "Mike T.", title: "Security Dev", initial: "MT" },
                  { text: "The accuracy is insane. It catches technical debt items we casually mention and creates perfect tickets.", name: "David L.", title: "Senior Engineer", initial: "DL" },
                  { text: "Our daily standups actually feel useful now because we know the busywork is being handled automatically.", name: "Priya S.", title: "Product Manager", initial: "PS" }
                ].map((t, i) => (
                  <div key={i} className="w-[400px] h-[220px] mx-3 rounded-[2rem] bg-white/40 backdrop-blur-xl border-2 border-white p-8 flex flex-col justify-between hover:bg-white/60 transition-all duration-300 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.05)] hover:translate-y-1 hover:translate-x-1 flex-shrink-0 cursor-default">
                    <div className="flex text-yellow-500 gap-1 mb-2">
                      {[1,2,3,4,5].map(star => <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                    </div>
                    <p className="text-black/80 font-serif text-[1.1rem] leading-snug italic line-clamp-3 mb-4">&quot;{t.text}&quot;</p>
                    <div className="mt-auto flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-distill-violet/10 text-distill-violet flex items-center justify-center font-bold text-sm border border-distill-violet/20">{t.initial}</div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-black">{t.name}</span>
                        <span className="text-xs text-black/50 font-medium uppercase tracking-wider">{t.title}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 2 - Scrolling Right */}
              <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused] group">
                {[
                  { text: "Finally, an AI tool that actually understands developer context and doesn't just summarize.", name: "James W.", title: "Tech Lead", initial: "JW" },
                  { text: "Setup took 5 minutes. The webhook integration with Linear is flawless. Highly recommend.", name: "Elena R.", title: "Frontend Dev", initial: "ER" },
                  { text: "We run it on our weekly syncs too. It pulls out action items and assigns them perfectly.", name: "Tom H.", title: "Engineering Manager", initial: "TH" },
                  { text: "I love that I can bring my own Groq key. The inference is blazing fast and completely private.", name: "Chris B.", title: "Backend Engineer", initial: "CB" },
                  { text: "It's like having a dedicated project manager in every call, but without the overhead.", name: "Anna K.", title: "Fullstack Dev", initial: "AK" },
                  // Duplicate for infinite loop
                  { text: "Finally, an AI tool that actually understands developer context and doesn't just summarize.", name: "James W.", title: "Tech Lead", initial: "JW" },
                  { text: "Setup took 5 minutes. The webhook integration with Linear is flawless. Highly recommend.", name: "Elena R.", title: "Frontend Dev", initial: "ER" },
                  { text: "We run it on our weekly syncs too. It pulls out action items and assigns them perfectly.", name: "Tom H.", title: "Engineering Manager", initial: "TH" },
                  { text: "I love that I can bring my own Groq key. The inference is blazing fast and completely private.", name: "Chris B.", title: "Backend Engineer", initial: "CB" },
                  { text: "It's like having a dedicated project manager in every call, but without the overhead.", name: "Anna K.", title: "Fullstack Dev", initial: "AK" }
                ].map((t, i) => (
                  <div key={i} className="w-[400px] h-[220px] mx-3 rounded-[2rem] bg-white/40 backdrop-blur-xl border-2 border-white p-8 flex flex-col justify-between hover:bg-white/60 transition-all duration-300 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.05)] hover:translate-y-1 hover:translate-x-1 flex-shrink-0 cursor-default">
                    <div className="flex text-yellow-500 gap-1 mb-2">
                      {[1,2,3,4,5].map(star => <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                    </div>
                    <p className="text-black/80 font-serif text-[1.1rem] leading-snug italic line-clamp-3 mb-4">&quot;{t.text}&quot;</p>
                    <div className="mt-auto flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black/10 text-black flex items-center justify-center font-bold text-sm border border-black/10">{t.initial}</div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-black">{t.name}</span>
                        <span className="text-xs text-black/50 font-medium uppercase tracking-wider">{t.title}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
          <BlurReveal duration={0.8}>
            <div className="flex flex-col items-center gap-6 max-w-3xl mx-auto text-center relative z-10 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-distill-violet/10 border border-distill-violet/20">
                <Zap className="w-4 h-4 text-distill-core" />
                <span className="text-xs font-mono font-bold text-distill-core uppercase tracking-widest">Pricing</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-sans font-bold text-foreground tracking-tighter">
                Zero-friction pricing.
              </h2>
              <p className="text-xl text-zinc-400 font-sans max-w-2xl">
                Choose the plan that fits your engineering team. Start for free with BYOK, or upgrade for hosted proxy power.
              </p>

              <div className="flex items-center gap-3 mt-8 bg-black/40 border border-white/10 p-1.5 rounded-full">
                <button 
                  onClick={() => setIsAnnual(false)} 
                  className={cn("px-6 py-2 rounded-full text-sm font-bold transition-all", !isAnnual ? "bg-white text-black shadow-lg" : "text-zinc-400 hover:text-white")}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setIsAnnual(true)} 
                  className={cn("px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2", isAnnual ? "bg-white text-black shadow-lg" : "text-zinc-400 hover:text-white")}
                >
                  Annually <span className={cn("px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest", isAnnual ? "bg-distill-violet text-white" : "bg-white/10 text-white")}>Save 20%</span>
                </button>
              </div>
            </div>
          </BlurReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full relative z-10">
            {/* HOBBY TIER */}
            <BlurReveal duration={1} delay={0.2}>
              <div className="flex flex-col p-8 rounded-3xl bg-[#0a0710] border border-white/5 h-full relative group hover:border-white/10 transition-colors">
                <div className="flex flex-col gap-2 mb-8">
                  <h3 className="text-xl font-bold text-white">Hobby</h3>
                  <p className="text-sm text-zinc-400">Bring Your Own Key (BYOK)</p>
                </div>
                <div className="flex items-end gap-2 mb-8">
                  <span className="text-5xl font-black text-white">$0</span>
                  <span className="text-zinc-500 mb-2">/ forever</span>
                </div>
                <Link href={user ? "/dashboard/pipelines" : "/login?signup=true"} className="w-full py-4 rounded-xl border border-white/20 text-white font-bold text-center hover:bg-white/5 transition-colors mb-8">
                  Get Started
                </Link>
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Included Features</p>
                  <ul className="flex flex-col gap-3">
                    {["Local processing (Browser API)", "Webhooks & Zapier output", "Community Discord Support", "Client-side storage only"].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                        <CheckCircle2 className="w-5 h-5 text-zinc-600 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </BlurReveal>

            {/* PRO TIER */}
            <BlurReveal duration={1} delay={0.3}>
              <div className="flex flex-col p-8 rounded-3xl bg-black border border-distill-core/40 shadow-[0_0_80px_rgba(228,221,244,0.1)] h-full relative overflow-hidden transform md:-translate-y-4">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-distill-violet via-distill-core to-distill-violet" />
                <div className="flex flex-col gap-2 mb-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Pro</h3>
                    <span className="px-3 py-1 rounded-full bg-distill-violet/20 text-distill-core text-xs font-bold font-mono tracking-wide">POPULAR</span>
                  </div>
                  <p className="text-sm text-zinc-400">Hosted AI processing</p>
                </div>
                <div className="flex items-end gap-2 mb-8">
                  <span className="text-5xl font-black text-white">{isAnnual ? "$29" : "$39"}</span>
                  <span className="text-zinc-500 mb-2">/ month</span>
                </div>
                <button 
                  onClick={() => handleSubscribe("pro", isAnnual ? "price_pro_annual" : "price_pro_monthly")}
                  disabled={loadingTier === "pro"}
                  className="w-full py-4 rounded-xl bg-white text-black font-bold flex justify-center items-center gap-2 hover:bg-zinc-200 transition-colors mb-8 disabled:opacity-50"
                >
                  {loadingTier === "pro" ? <span className="animate-pulse">Loading...</span> : <>Subscribe to Pro <ArrowRight className="w-4 h-4" /></>}
                </button>
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Everything in Hobby, including:</p>
                  <ul className="flex flex-col gap-3">
                    {["Cloud-hosted Groq Proxy", "Native Jira Integration", "1,000 extractions / mo", "Custom Schema Generation", "Priority email support"].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white">
                        <CheckCircle2 className="w-5 h-5 text-distill-core shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </BlurReveal>

            {/* TEAM TIER */}
            <BlurReveal duration={1} delay={0.4}>
              <div className="flex flex-col p-8 rounded-3xl bg-[#0a0710] border border-white/5 h-full relative group hover:border-white/10 transition-colors">
                <div className="flex flex-col gap-2 mb-8">
                  <h3 className="text-xl font-bold text-white">Team</h3>
                  <p className="text-sm text-zinc-400">For engineering squads</p>
                </div>
                <div className="flex items-end gap-2 mb-8">
                  <span className="text-5xl font-black text-white">{isAnnual ? "$99" : "$129"}</span>
                  <span className="text-zinc-500 mb-2">/ month</span>
                </div>
                <button 
                  onClick={() => handleSubscribe("team", isAnnual ? "price_team_annual" : "price_team_monthly")}
                  disabled={loadingTier === "team"}
                  className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-center hover:bg-white/10 transition-colors mb-8 disabled:opacity-50"
                >
                  {loadingTier === "team" ? <span className="animate-pulse">Loading...</span> : "Start 14-day Free Trial"}
                </button>
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Everything in Pro, including:</p>
                  <ul className="flex flex-col gap-3">
                    {["Shared Team Workspaces", "Linear & Asana Integrations", "Unlimited extractions", "SSO / SAML login", "Dedicated success manager"].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                        <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </BlurReveal>
          </div>

          {/* Why Free Section */}
          <BlurReveal duration={1} delay={0.5}>
            <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-6 mt-24">
              <h3 className="font-sergena text-2xl text-foreground">Why is Distill free?</h3>
              <p className="text-distill-muted font-sans leading-relaxed">
                I&apos;m a solo developer building in public. Right now, every user helps me learn what actually matters. When Pro launches, early waitlist members get 50% off for life.
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
               <a href="https://x.com/Jeetheshwar7" target="_blank" rel="noopener noreferrer" className="text-distill-muted hover:text-white transition-colors">
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
              <button suppressHydrationWarning onClick={() => setShowJiraModal(false)} className="text-white/50 hover:text-white"><Square className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(demoResult as any)?.extracted_tickets?.map((ticket: any, i: number) => (
                <div key={i} className="bg-[#22272B] p-4 rounded-lg border border-white/5">
                  <div className="flex justify-between mb-2">
                    <input suppressHydrationWarning type="text" defaultValue={ticket.title} className="bg-transparent border-none text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 w-full" />
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
              <button suppressHydrationWarning onClick={() => setShowJiraModal(false)} className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium">Cancel</button>
              <button suppressHydrationWarning onClick={() => setShowJiraModal(false)} className="px-4 py-2 bg-[#0052CC] text-white rounded text-sm font-medium hover:bg-[#0047b3]">Create Issues</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
