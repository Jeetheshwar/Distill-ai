"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";
import { Settings, Users, CreditCard, Activity, Key } from "lucide-react";
import { Aura } from "@/components/ui/aura";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem("groq_api_key");
    if (existing) {
      setApiKey(existing);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("groq_api_key", apiKey);
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
              <p className="text-distill-muted font-sans text-sm">Manage your BYOK credentials and webhook settings.</p>
            </div>
          </div>
        </div>
      </BlurReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BlurReveal duration={1} delay={0.1} className="md:col-span-2">
          <div className="flex flex-col gap-6 p-8 rounded-2xl bg-white/[0.01] border border-white/5 h-full">
            <div className="flex items-center gap-3">
               <Key className="w-6 h-6 text-distill-core" />
               <h2 className="text-lg font-bold text-foreground font-sans">Bring Your Own Key (BYOK)</h2>
            </div>
            <p className="text-sm text-distill-muted font-sans max-w-2xl">
              Distill operates as a secure, stateless proxy. Provide your Groq API key to enable lightning-fast audio extraction. Your key is stored locally in your browser and sent securely in the Authorization header.
            </p>
            <div className="flex flex-col gap-3 mt-2 max-w-md">
              <label className="text-xs font-mono text-distill-muted uppercase tracking-wider">Groq API Key</label>
              <div className="flex gap-3">
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="flex-1 bg-[#0a0710] border border-white/10 rounded-md p-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-distill-core/50 transition-colors"
                />
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-distill-core/20 text-distill-core hover:bg-distill-core/30 border border-distill-core/30 rounded-md font-sans text-sm font-bold transition-all"
                >
                  {saved ? "Saved!" : "Save Key"}
                </button>
              </div>
            </div>
          </div>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.2}>
          <div className="flex flex-col gap-6 p-8 rounded-2xl bg-white/[0.01] border border-white/5 h-full">
            <div className="flex items-center gap-3">
               <Users className="w-6 h-6 text-distill-muted" />
               <h2 className="text-lg font-bold text-foreground font-sans">Team Management</h2>
            </div>
            <p className="text-sm text-distill-muted font-sans">
              Team features are on the roadmap. Currently single-user only.
            </p>
          </div>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.3}>
          <div className="flex flex-col gap-6 p-8 rounded-2xl bg-white/[0.01] border border-white/5 h-full">
            <div className="flex items-center gap-3">
               <CreditCard className="w-6 h-6 text-distill-violet" />
               <h2 className="text-lg font-bold text-foreground font-sans">Billing & Invoices</h2>
            </div>
            <p className="text-sm text-distill-muted font-sans">
              Manage your payment methods and download past invoices. You are currently on the Free Developer Sandbox.
            </p>
          </div>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.4} className="md:col-span-2">
          <div className="flex flex-col gap-6 p-8 rounded-2xl bg-white/[0.01] border border-white/5">
            <div className="flex items-center gap-3">
               <Activity className="w-6 h-6 text-distill-muted" />
               <h2 className="text-lg font-bold text-foreground font-sans">Usage Quotas</h2>
            </div>
            <p className="text-sm text-distill-muted font-sans">
              Monitor your BYOK proxy execution time. Rate limits and billing are dictated entirely by your Groq API tier.
            </p>
            <div className="w-full bg-black/40 rounded-lg p-6 border border-white/5 mt-2">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-bold text-foreground font-sans">Monthly Inference Volume</span>
                <span className="text-distill-muted font-mono">Proxy Mode Active</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-distill-core w-full animate-pulse opacity-20" />
              </div>
            </div>
          </div>
        </BlurReveal>
      </div>
    </div>
  );
}
