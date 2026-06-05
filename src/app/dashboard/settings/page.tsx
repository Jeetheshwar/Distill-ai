"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";
import { Settings, Users, CreditCard, Activity, Key } from "lucide-react";
import { Aura } from "@/components/ui/aura";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase.from('user_settings').select('groq_api_key').eq('user_id', user.id).single();
      if (data?.groq_api_key) {
        setApiKey(data.groq_api_key);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Upsert equivalent since we have unique(user_id) but need to handle insert vs update gracefully
    const { data: existing } = await supabase.from('user_settings').select('id').eq('user_id', user.id).single();
    
    if (existing) {
      await supabase.from('user_settings').update({ groq_api_key: apiKey }).eq('user_id', user.id);
    } else {
      await supabase.from('user_settings').insert({ user_id: user.id, groq_api_key: apiKey });
    }
    
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
               <h2 className="text-lg font-bold text-foreground font-sans">Bring Your Own Key (BYOK)</h2>
            </div>
            <p className="text-sm text-zinc-500 font-sans max-w-2xl">
              Distill operates as a secure, stateless proxy. Provide your Groq API key to enable lightning-fast audio extraction. Your key is stored securely in your database.
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
          <div className="flex flex-col gap-6 p-8 rounded-2xl bg-[#05040a] border border-white/5 shadow-2xl h-full">
            <div className="flex items-center gap-3">
               <Users className="w-6 h-6 text-zinc-500" />
               <h2 className="text-lg font-bold text-foreground font-sans">Team Management</h2>
            </div>
            <p className="text-sm text-zinc-500 font-sans">
              Team features are on the roadmap. Currently single-user only.
            </p>
          </div>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.3}>
          <div className="flex flex-col gap-6 p-8 rounded-2xl bg-[#05040a] border border-white/5 shadow-2xl h-full">
            <div className="flex items-center gap-3">
               <CreditCard className="w-6 h-6 text-white" />
               <h2 className="text-lg font-bold text-foreground font-sans">Billing & Invoices</h2>
            </div>
            <p className="text-sm text-zinc-500 font-sans">
              Manage your payment methods and download past invoices. You are currently on the Free Developer Sandbox.
            </p>
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
