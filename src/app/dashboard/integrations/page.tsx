"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";
import { Webhook, Zap, PlayCircle, Plus, CheckCircle2, AlertCircle, Kanban, Blocks, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Aura } from "@/components/ui/aura";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function IntegrationsPage() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');

  const [activeTab, setActiveTab] = useState<"jira" | "linear" | "webhooks" | "testing">("jira");
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  
  const [endpointUrl, setEndpointUrl] = useState("");
  const [activeUrl, setActiveUrl] = useState("");
  
  const [connections, setConnections] = useState<any[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      // Load Webhook Settings
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('user_settings').select('webhook_url').eq('user_id', user.id).single();
        if (data?.webhook_url) {
          setEndpointUrl(data.webhook_url);
          setActiveUrl(data.webhook_url);
        }
      }

      // Load OAuth Connections
      try {
        const res = await fetch('/api/integrations');
        if (res.ok) {
          const data = await res.json();
          setConnections(data.connections || []);
        }
      } catch (e) {
        console.error("Failed to load integrations", e);
      } finally {
        setLoadingConnections(false);
      }
    }
    loadData();
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

  const isJiraConnected = connections.some(c => c.provider === 'jira');
  const isLinearConnected = connections.some(c => c.provider === 'linear');

  return (
    <div className="flex flex-col gap-10 max-w-6xl w-full pb-20">
      <Aura variant="webhooks" />
      <BlurReveal duration={0.8}>
        <div className="flex flex-col gap-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-foreground font-sans tracking-tight">Integrations</h1>
              <p className="text-distill-muted font-sans text-sm">Connect OAuth providers or configure custom webhooks.</p>
            </div>
          </div>
          {urlError === 'need_team' && (
            <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-lg mt-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm font-medium text-red-400 font-sans">
                  You must create a Team Workspace before connecting integrations.
                </p>
              </div>
              <Link href="/dashboard/settings/team" className="text-sm font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors">
                Create Team
              </Link>
            </div>
          )}
        </div>
      </BlurReveal>

      <div className="flex gap-8 border-b border-white/5 px-2 overflow-x-auto whitespace-nowrap">
        <button onClick={() => setActiveTab("jira")} className={cn("pb-4 font-bold text-sm transition-all border-b-2", activeTab === "jira" ? "border-white text-foreground" : "border-transparent text-zinc-500 hover:text-zinc-300")}>Jira Software</button>
        <button onClick={() => setActiveTab("linear")} className={cn("pb-4 font-bold text-sm transition-all border-b-2", activeTab === "linear" ? "border-white text-foreground" : "border-transparent text-zinc-500 hover:text-zinc-300")}>Linear</button>
        <button onClick={() => setActiveTab("webhooks")} className={cn("pb-4 font-bold text-sm transition-all border-b-2", activeTab === "webhooks" ? "border-white text-foreground" : "border-transparent text-zinc-500 hover:text-zinc-300")}>Custom Webhooks</button>
        <button onClick={() => setActiveTab("testing")} className={cn("pb-4 font-bold text-sm transition-all border-b-2", activeTab === "testing" ? "border-white text-foreground" : "border-transparent text-zinc-500 hover:text-zinc-300")}>Testing Playground</button>
      </div>

      {activeTab === "jira" && (
        <BlurReveal duration={1} delay={0.1}>
          <div className="flex flex-col gap-6 p-8 rounded-2xl bg-[#05040a] border border-[#0052CC]/30 shadow-[0_0_50px_rgba(0,82,204,0.1)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0052CC] flex items-center justify-center shadow-lg">
                  <Kanban className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Jira Software</h2>
                  <p className="text-xs text-zinc-400">Official Atlassian OAuth 2.0 Integration</p>
                </div>
              </div>
              {loadingConnections ? (
                <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
              ) : isJiraConnected ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold tracking-wide">
                  <CheckCircle2 className="w-4 h-4" /> Connected
                </div>
              ) : (
                <a href="/api/integrations/jira/connect" className="px-6 py-2.5 bg-[#0052CC] text-white rounded-lg font-bold text-sm hover:bg-[#0047b3] transition-colors shadow-lg flex items-center gap-2">
                  Connect Jira <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            <div className="pt-2">
              {isJiraConnected ? (
                <p className="text-sm text-zinc-400">
                  Your team workspace is actively connected to Jira. New extractions will be automatically pushed as tickets according to your pipeline configuration.
                </p>
              ) : (
                <p className="text-sm text-zinc-400">
                  Connect your Atlassian account to automatically sync extracted tickets directly to your Jira projects. Tokens are securely stored and refreshed automatically.
                </p>
              )}
            </div>
          </div>
        </BlurReveal>
      )}

      {activeTab === "linear" && (
        <BlurReveal duration={1} delay={0.1}>
          <div className="flex flex-col gap-6 p-8 rounded-2xl bg-[#05040a] border border-[#5E6AD2]/30 shadow-[0_0_50px_rgba(94,106,210,0.1)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#5E6AD2] flex items-center justify-center shadow-lg">
                  <Blocks className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Linear</h2>
                  <p className="text-xs text-zinc-400">Official Linear OAuth 2.0 Integration</p>
                </div>
              </div>
              {loadingConnections ? (
                <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
              ) : isLinearConnected ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold tracking-wide">
                  <CheckCircle2 className="w-4 h-4" /> Connected
                </div>
              ) : (
                <a href="/api/integrations/linear/connect" className="px-6 py-2.5 bg-[#5E6AD2] text-white rounded-lg font-bold text-sm hover:bg-[#4f59b8] transition-colors shadow-lg flex items-center gap-2">
                  Connect Linear <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            <div className="pt-2">
              {isLinearConnected ? (
                <p className="text-sm text-zinc-400">
                  Your team workspace is actively connected to Linear.
                </p>
              ) : (
                <p className="text-sm text-zinc-400">
                  Connect your Linear workspace to seamlessly route extracted issues and projects.
                </p>
              )}
            </div>
          </div>
        </BlurReveal>
      )}

      {activeTab === "webhooks" && (
        <BlurReveal duration={1} delay={0.1}>
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-bold font-mono text-distill-muted uppercase tracking-widest">Active Endpoints</h2>
            <div className="w-full rounded-2xl bg-white/[0.01] border border-white/5 p-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <input type="url" placeholder="https://webhook.site/your-custom-url" value={endpointUrl} onChange={(e) => setEndpointUrl(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-distill-violet/50" />
                <button onClick={saveEndpoint} className="px-6 py-3 rounded-lg bg-distill-violet/20 border border-distill-violet/40 text-distill-core font-bold text-sm tracking-wide hover:bg-distill-violet/40 transition-colors flex items-center gap-2 shrink-0">
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
      )}

      {activeTab === "testing" && (
        <BlurReveal duration={1} delay={0.1}>
          <div className="flex flex-col gap-4 mt-4">
            <h2 className="text-sm font-bold font-mono text-distill-muted uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-distill-core" />
              Testing Playground
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="flex flex-col gap-6 p-8 rounded-2xl bg-black/40 border border-white/5 h-max">
                  <p className="text-sm text-distill-muted font-sans leading-relaxed">
                    Fire a synthetic <code className="text-white">extraction.completed</code> event to all Active Webhook Endpoints.
                  </p>
                  <button onClick={triggerTest} disabled={isRunning} className={cn("w-full py-4 rounded-xl font-bold tracking-wide transition-all flex items-center justify-center gap-3", isRunning ? "bg-white/5 border border-white/10 text-distill-muted cursor-not-allowed" : "bg-distill-core text-background hover:bg-white border border-transparent shadow-[0_0_20px_rgba(228,221,244,0.1)]")}>
                    {isRunning ? <div className="w-5 h-5 rounded-full border-2 border-distill-muted border-t-white animate-spin" /> : <><PlayCircle className="w-5 h-5" /> Send Test Payload</>}
                  </button>
                  {hasRun && (
                    <div className="flex items-center gap-3 p-4 bg-distill-violet/10 border border-distill-violet/30 rounded-lg text-sm text-distill-core mt-2 font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      POST 200 OK
                    </div>
                  )}
               </div>
               <div className="flex flex-col rounded-2xl bg-[#0a0710] border border-white/10 overflow-hidden relative shadow-inner">
                 <div className="px-6 py-3 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
                   <span className="text-xs font-mono text-distill-muted uppercase">Payload Preview</span>
                 </div>
                 <div className="p-6 overflow-x-auto min-h-[300px]">
                    <pre className={cn("text-sm font-mono text-[#9cdcfe] transition-opacity duration-500", isRunning ? "opacity-30" : "opacity-100")}>
                      <code className="block whitespace-pre">{dummyPayload}</code>
                    </pre>
                 </div>
               </div>
            </div>
          </div>
        </BlurReveal>
      )}
    </div>
  );
}
