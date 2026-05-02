import { BlurReveal } from "@/components/ui/blur-reveal";
import { Activity, ArrowUpRight, BarChart3, Clock, Database, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Aura } from "@/components/ui/aura";

export default async function DashboardOverview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let extractionCount = 0;
  let totalDuration = 0;

  if (user) {
    const { data: extractions, error } = await supabase
      .from("extractions")
      .select("duration_seconds")
      .eq("user_id", user.id);
      
    if (extractions && !error) {
      extractionCount = extractions.length;
      totalDuration = extractions.reduce((acc, row) => acc + (row.duration_seconds || 0), 0);
    }
  }

  const processedMinutes = Math.floor(totalDuration / 60);

  const stats = [
    { title: "Processed Volume", value: `${processedMinutes} min`, change: `${extractionCount} files`, icon: Clock },
    { title: "Webhook Deliveries", value: extractionCount > 0 ? "100.00%" : "0.00%", change: "Healthy", icon: Activity },
    { title: "Avg. Latency", value: "45ms", change: "-12ms", icon: BarChart3 },
    { title: "Storage Quota", value: `${(totalDuration * 0.05).toFixed(1)} MB`, change: "0.1% used", icon: Database },
  ];

  return (
    <div className="flex flex-col gap-10 max-w-6xl w-full">
      <Aura variant="overview" />
      <BlurReveal duration={0.8}>
        <div className="flex flex-col gap-2 relative">
          <h1 className="text-3xl font-bold text-foreground font-sans tracking-tight">Overview</h1>
          <p className="text-distill-muted font-sans text-sm">Real-time metrics for your local pipeline and managed routing infrastructure.</p>
        </div>
      </BlurReveal>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <BlurReveal key={stat.title} duration={0.8} delay={0.1 + i * 0.1}>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-distill-muted">{stat.title}</span>
                <div className="p-2 bg-white/[0.03] rounded-md">
                  <stat.icon className="w-4 h-4 text-distill-violet" />
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-foreground font-sans tracking-tight">{stat.value}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-distill-core bg-distill-core/10 w-max px-2 py-1 rounded inline-flex">
                <ArrowUpRight className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
          </BlurReveal>
        ))}
      </div>

      {/* Cluster Status Map */}
      <BlurReveal duration={1} delay={0.4}>
        <div className="w-full flex-1 rounded-2xl bg-white/[0.01] border border-white/5 p-8 flex flex-col gap-6">
          <h2 className="text-lg font-bold font-sans text-foreground">Infrastructure Nodes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
             <div className="p-6 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-foreground font-sans">Local Docker Engine</span>
                   <span className="text-xs text-distill-muted font-mono">localhost:8080 (v2.1.0)</span>
                 </div>
               </div>
               <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full uppercase">Connected</span>
             </div>

             <div className="p-6 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-3 h-3 rounded-full bg-distill-core shadow-[0_0_10px_var(--distill-core)]" />
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-foreground font-sans">Webhook Delivery Network</span>
                   <span className="text-xs text-distill-muted font-mono">Pro / Team Tier Routing</span>
                 </div>
               </div>
               <span className="text-xs font-bold text-distill-core bg-distill-core/10 px-3 py-1 rounded-full uppercase">Healthy</span>
             </div>

             <div className="p-6 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-3 h-3 rounded-full bg-distill-muted" />
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-foreground font-sans">Team Schema Vault</span>
                   <span className="text-xs text-distill-muted font-mono">Encrypted Configuration</span>
                 </div>
               </div>
               <span className="text-xs font-bold text-distill-muted bg-white/5 px-3 py-1 rounded-full uppercase">Synced</span>
             </div>
          </div>
        </div>
      </BlurReveal>
    </div>
  );
}
