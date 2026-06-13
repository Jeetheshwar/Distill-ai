"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";
import { Settings, Users, CreditCard, Activity, Key, ArrowRight } from "lucide-react";
import { Aura } from "@/components/ui/aura";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("hosted");
  const [saved, setSaved] = useState(false);
  const [planType, setPlanType] = useState("hobby");
  const supabase = createClient();

  useEffect(() => {
    const key = localStorage.getItem("groq_api_key");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (key) setApiKey(key);
    const prov = localStorage.getItem("extraction_provider");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (prov) setProvider(prov);

    async function loadPlan() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('user_settings').select('plan_type').eq('user_id', user.id).single();
        if (data?.plan_type) {
          setPlanType(data.plan_type);
        }
      }
    }
    loadPlan();
  }, []);

  const handleSave = async () => {
    localStorage.setItem("groq_api_key", apiKey);
    localStorage.setItem("extraction_provider", provider);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-10 max-w-6xl w-full">
      <Aura variant="overview" />
      <BlurReveal duration={0.8}>
        <div className="flex flex-col gap-4 relative">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-foreground font-sans tracking-tight">Settings</h1>
              <p className="text-zinc-500 font-sans text-sm">Manage your BYOK credentials and webhook settings.</p>
            </div>
          </div>
        </div>
      </BlurReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BlurReveal duration={1} delay={0.1} className="md:col-span-2">
          <div className="flex flex-col gap-6 p-8 rounded-2xl bg-[#05040a] border border-white/5 shadow-2xl h-full">
            <div className="flex items-center gap-3">
               <Key className="w-6 h-6 text-white" />
               <h2 className="text-lg font-bold text-foreground font-sans">Extraction Provider & BYOK</h2>
            </div>
            
            <div className="flex flex-col gap-3 mt-2 max-w-md">
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Extraction Provider</label>
              <select 
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-[#05040a] border border-white/10 rounded-md p-2 text-sm text-foreground focus:outline-none focus:border-white/50"
              >
                <option value="hosted">Hosted BYOK / Groq</option>
                <option value="local">Local Open Source</option>
              </select>
            </div>

            <p className="text-sm text-zinc-500 font-sans max-w-2xl mt-2">
              {provider === "local" 
                ? "Local Mode keeps audio on your machine. Run the Distill local companion, then process audio with local Whisper + Ollama models."
                : "Distill operates as a secure, stateless proxy. Provide your Groq API key to enable lightning-fast audio extraction. Your key is stored securely in your browser."}
            </p>
            <div className="flex flex-col gap-3 mt-2 max-w-md">
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Groq API Key</label>
              <div className="flex gap-3">
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="flex-1 bg-black border border-white/10 rounded-md p-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-white/50 transition-colors"
                />
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-md font-sans text-sm font-bold transition-all"
                >
                  {saved ? "Saved!" : "Save Key"}
                </button>
              </div>
            </div>
          </div>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.2}>
          <Link href="/dashboard/settings/team" className="flex flex-col gap-6 p-8 rounded-2xl bg-[#05040a] border border-white/5 shadow-2xl h-full hover:border-white/20 transition-colors group">
            <div className="flex items-center gap-3">
               <Users className="w-6 h-6 text-white" />
               <h2 className="text-lg font-bold text-foreground font-sans group-hover:text-distill-core transition-colors flex items-center gap-2">
                 Team Workspace <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0" />
               </h2>
            </div>
            <p className="text-sm text-zinc-400 font-sans mt-auto">
              Create a team to share pipelines, API keys, and extractions with your squad.
            </p>
          </Link>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.3}>
          <div className="flex flex-col gap-6 p-8 rounded-2xl bg-[#05040a] border border-white/5 shadow-2xl h-full">
            <div className="flex items-center gap-3">
               <CreditCard className="w-6 h-6 text-white" />
               <h2 className="text-lg font-bold text-foreground font-sans">Billing & Invoices</h2>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Current Plan</span>
              <div className="flex items-center justify-between p-4 rounded-xl bg-black border border-white/10">
                <span className="text-lg font-bold text-white capitalize">{planType === 'hobby' ? 'Hobby (BYOK)' : planType}</span>
                <span className="px-3 py-1 rounded-full bg-distill-violet/20 text-distill-core text-xs font-bold font-mono tracking-wide">ACTIVE</span>
              </div>
            </div>

            <p className="text-sm text-zinc-500 font-sans mt-2">
              Manage your payment methods and download past invoices.
            </p>

            <Link href="/pricing" className="mt-auto px-4 py-3 bg-white text-black font-bold rounded-lg text-center text-sm hover:bg-zinc-200 transition-colors flex justify-center items-center gap-2">
              Manage Subscription <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.4} className="md:col-span-2">
          <div className="flex flex-col gap-6 p-8 rounded-2xl bg-[#05040a] border border-white/5 shadow-2xl">
            <div className="flex items-center gap-3">
               <Activity className="w-6 h-6 text-zinc-500" />
               <h2 className="text-lg font-bold text-foreground font-sans">Usage Quotas</h2>
            </div>
            <p className="text-sm text-zinc-500 font-sans">
              Monitor your BYOK proxy execution time. Rate limits and billing are dictated entirely by your Groq API tier.
            </p>
            <div className="w-full bg-black/40 rounded-lg p-6 border border-white/5 mt-2">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-bold text-foreground font-sans">Monthly Inference Volume</span>
                <span className="text-zinc-500 font-mono">Proxy Mode Active</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white w-full animate-pulse opacity-20" />
              </div>
            </div>
          </div>
        </BlurReveal>
      </div>
    </div>
  );
}
