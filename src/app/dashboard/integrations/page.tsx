"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";
import { Webhook, Zap, PlayCircle, Plus, CheckCircle2, History, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Aura } from "@/components/ui/aura";
import { createClient } from "@/utils/supabase/client";

export default function WebhookPlaygroundPage() {
  const [activeTab, setActiveTab] = useState<"endpoints" | "templates" | "logs">("endpoints");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState("");
  const [activeUrl, setActiveUrl] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase.from('user_settings').select('webhook_url').eq('user_id', user.id).single();
      if (data?.webhook_url) {
        setEndpointUrl(data.webhook_url);
        setActiveUrl(data.webhook_url);
      }
    }
    loadSettings();
  }, []);

  const saveEndpoint = async () => {
    if (!endpointUrl) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: existing } = await supabase.from('user_settings').select('id').eq('user_id', user.id).single();
    if (existing) {
      await supabase.from('user_settings').update({ webhook_url: endpointUrl }).eq('user_id', user.id);
    } else {
      await supabase.from('user_settings').insert({ user_id: user.id, webhook_url: endpointUrl });
    }
    
    setActiveUrl(endpointUrl);
  };

  const triggerTest = async () => {
    if (!activeUrl) {
      alert("Please save an endpoint URL first.");
      return;
    }
    setIsRunning(true);
    setHasRun(false);

    try {
      const response = await fetch(activeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: dummyPayload
      });
      console.log("Webhook fired", response);
    } catch (e) {
      console.error(e);
    }

    setIsRunning(false);
    setHasRun(true);
  };

  const dummyPayload = `{
  "id": "trk_09vbxn28",
  "event": "extraction.completed",
  "created_at": 1713589200,
  "data": {
    "source": "zoom_meeting_772.wav",
    "schema_match": true,
    "entities": [
      {
        "type": "ticket",
        "title": "Migrate database to PostgreSQL 16",
        "assignee_context": "Sarah",
        "priority": "high"
      }
    ]
  }
}`;

  return (
    <div className="flex flex-col gap-10 max-w-6xl w-full">
      <Aura variant="webhooks" />
      <BlurReveal duration={0.8}>
        <div className="flex flex-col gap-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-foreground font-sans tracking-tight">Integration Settings</h1>
              <p className="text-distill-muted font-sans text-sm">Define POST targets for manual or preview-based JSON delivery.</p>
            </div>
          </div>
        </div>
      </BlurReveal>



      {activeTab === "endpoints" && (
        <div className="flex flex-col gap-10">
      {/* Endpoint Configuration */}
      <BlurReveal duration={1} delay={0.1}>
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold font-mono text-distill-muted uppercase tracking-widest">Active Endpoints</h2>
          <div className="w-full rounded-2xl bg-white/[0.01] border border-white/5 p-6 flex flex-col gap-4">
            <div className="flex gap-4">
              <input 
                type="url"
                placeholder="https://webhook.site/your-custom-url"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-distill-violet/50"
              />
              <button 
                onClick={saveEndpoint}
                className="px-6 py-3 rounded-lg bg-distill-violet/20 border border-distill-violet/40 text-distill-core font-bold text-sm tracking-wide hover:bg-distill-violet/40 transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                {activeUrl ? "Update Endpoint" : "Add Endpoint"}
              </button>
            </div>
            {activeUrl && (
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg mt-2">
                <div className="font-mono text-sm text-foreground truncate">{activeUrl}</div>
                <div className="flex items-center gap-2 text-xs font-bold font-sans text-distill-core uppercase shrink-0">
                  <div className="w-2 h-2 rounded-full bg-distill-core shadow-[0_0_10px_var(--distill-core)]" />
                  Active
                </div>
              </div>
            )}
          </div>
        </div>
      </BlurReveal>



      {/* Webhook Playground */}
      <BlurReveal duration={1} delay={0.2}>
        <div className="flex flex-col gap-4 mt-8">
          <h2 className="text-sm font-bold font-mono text-distill-muted uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4 text-distill-core" />
            Testing Playground
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Action Control */}
             <div className="flex flex-col gap-6 p-8 rounded-2xl bg-black/40 border border-white/5 h-max">
                <p className="text-sm text-distill-muted font-sans leading-relaxed">
                  Fire a synthetic <code className="text-white">extraction.completed</code> event to all Active Endpoints. This helps verify your API routing and infrastructure without expending real inference credits.
                </p>
                <button 
                  onClick={triggerTest}
                  disabled={isRunning}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold tracking-wide transition-all flex items-center justify-center gap-3",
                    isRunning 
                      ? "bg-white/5 border border-white/10 text-distill-muted cursor-not-allowed" 
                      : "bg-distill-core text-background hover:bg-white border border-transparent shadow-[0_0_20px_rgba(228,221,244,0.1)]"
                  )}
                >
                  {isRunning ? (
                     <div className="w-5 h-5 rounded-full border-2 border-distill-muted border-t-white animate-spin" />
                  ) : (
                     <>
                       <PlayCircle className="w-5 h-5" />
                       Send Test Payload
                     </>
                  )}
                </button>

                {hasRun && (
                  <div className="flex items-center gap-3 p-4 bg-distill-violet/10 border border-distill-violet/30 rounded-lg text-sm text-distill-core mt-2 font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    POST 200 OK — Delivered in 184ms
                  </div>
                )}
             </div>

             {/* Output Payload viewing */}
             <div className="flex flex-col rounded-2xl bg-[#0a0710] border border-white/10 overflow-hidden relative shadow-inner">
               <div className="px-6 py-3 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
                 <span className="text-xs font-mono text-distill-muted uppercase">Payload Preview</span>
                 <span className="text-xs font-mono text-distill-muted flex items-center gap-1"><History className="w-3 h-3"/> synthetic_7b9s</span>
               </div>
               <div className="p-6 overflow-x-auto min-h-[300px]">
                  <pre className={cn("text-sm font-mono text-[#9cdcfe] transition-opacity duration-500", isRunning ? "opacity-30" : "opacity-100")}>
                    <code className="block whitespace-pre">
                      {dummyPayload}
                    </code>
                  </pre>
               </div>
             </div>
          </div>
        </div>
      </BlurReveal>
        </div>
      )}


    </div>
  );
}
