"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";
import { KeyRound, ShieldAlert, Cpu, Eye, EyeOff, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

import { Aura } from "@/components/ui/aura";

export default function SecurityBYOKPage() {
  const [activeTab, setActiveTab] = useState<"api_keys" | "local">("api_keys");
  const [showKey, setShowKey] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadKey() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('api_keys').select('key_hash').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) {
        setActiveKey(data[0].key_hash);
      }
      setLoading(false);
    }
    loadKey();
  }, []);

  const handleRollKey = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Generate a secure payload hash natively
    const newHash = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    const { error } = await supabase.from('api_keys').insert({
      user_id: user.id,
      key_hash: newHash,
      key_hint: newHash.substring(0, 12) + "..."
    });
    
    if (!error) {
      setActiveKey(newHash);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (activeKey) {
      navigator.clipboard.writeText(activeKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-4xl w-full">
      <Aura variant="security" />
      <BlurReveal duration={0.8}>
        <div className="flex flex-col gap-2 relative">
          <h1 className="text-3xl font-bold text-foreground font-sans tracking-tight">Infrastructure Management</h1>
          <p className="text-distill-muted font-sans text-sm">Manage your Pro/Team API keys and local Docker engines.</p>
        </div>
      </BlurReveal>

      {/* Tabs Navigation */}
      <div className="flex gap-8 border-b border-white/10 w-full mb-4">
        {(["api_keys", "local"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-4 text-sm font-bold font-sans transition-colors relative tracking-wide",
              activeTab === tab ? "text-distill-core" : "text-distill-muted hover:text-white"
            )}
          >
            {tab === "api_keys" ? "API Keys" : "Local Engines"}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-distill-core shadow-[0_0_8px_var(--distill-core)]" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "api_keys" && (
      <BlurReveal duration={1} delay={0.1}>
        <div className="w-full rounded-2xl bg-white/[0.02] border border-white/5 p-8 flex flex-col gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <KeyRound className="w-6 h-6 text-distill-violet" />
             </div>
             <div className="flex flex-col">
               <h2 className="text-lg font-bold font-sans text-foreground">Active Secret Key</h2>
               <span className="text-xs text-distill-muted font-mono">Used for authenticating into the centralized routing engine.</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-sm tracking-widest text-distill-core flex items-center justify-between">
              {loading 
                ? "Loading Vault..." 
                : activeKey 
                  ? (showKey ? activeKey : activeKey.substring(0, 8) + "••••••••••••••••••••••••") 
                  : "No Key Generated"}
              <div className="flex items-center gap-3">
                <button onClick={() => setShowKey(!showKey)} disabled={!activeKey} className="text-distill-muted hover:text-white transition-colors disabled:opacity-50">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={handleCopy} disabled={!activeKey} className={cn("transition-colors disabled:opacity-50", copied ? "text-green-400" : "text-distill-muted hover:text-distill-core")}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button 
              onClick={handleRollKey}
              disabled={loading}
              className="px-6 py-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-foreground transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {activeKey ? "Roll Key" : "Generate Key"}
            </button>
          </div>
        </div>
      </BlurReveal>
      )}



      {activeTab === "local" && (
        <BlurReveal duration={0.8}>
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-foreground font-sans">Local Engines</h2>
            <div className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-8 flex flex-col items-center justify-center text-center h-64 gap-4">
               <Cpu className="w-8 h-8 text-green-500" />
               <p className="text-distill-muted font-sans">Register and manage local Docker containers.</p>
            </div>
          </div>
        </BlurReveal>
      )}
    </div>
  );
}
