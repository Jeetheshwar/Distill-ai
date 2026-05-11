import { Aura } from "@/components/ui/aura";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export default function RoadmapPage() {
  const roadmap = [
    {
      quarter: "Q3 2026",
      title: "Pro & Team Tiers",
      status: "in-progress",
      items: [
        "SAML SSO Integration for Enterprise clients.",
        "Shared Team Workspaces and collaborative webhooks.",
        "Team analytics dashboards and execution monitoring.",
        "Unlimited uploads and fully custom JSON schemas."
      ]
    },
    {
      quarter: "Q4 2026",
      title: "Platform Expansion",
      status: "planned",
      items: [
        "Direct integration with GitHub Issues and Linear.",
        "Multi-language Whisper support expansion.",
        "Custom vocabulary training for specific engineering jargon.",
        "Desktop app wrapper for offline recording."
      ]
    },
    {
      quarter: "Q2 2026",
      title: "The Open-Source Pivot",
      status: "completed",
      items: [
        "Removed all artificial Stripe paywalls.",
        "Transitioned to a pure Bring Your Own Key (BYOK) architecture.",
        "Launched Chrome Extension MVP for one-click recording.",
        "Completely rebuilt the landing page."
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-distill-core" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Circle className="w-5 h-5 text-white/30" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Completed";
      case "in-progress": return "In Progress";
      default: return "Planned";
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col font-sans relative overflow-hidden">
      <Aura variant="hero" />
      
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-16 pt-32 pb-24 px-8 w-full">
        <div className="flex flex-col gap-4">
          <h1 className="font-pixel text-4xl md:text-6xl tracking-tighter text-foreground">Roadmap.</h1>
          <p className="text-xl text-distill-muted leading-relaxed">
            What we're building next. Distill is built in public—features are prioritized based on waitlist and community feedback.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {roadmap.map((phase, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-6 md:gap-12 relative">
              <div className="flex flex-col gap-1 min-w-[120px] pt-1">
                <span className="text-lg font-mono font-bold text-white">{phase.quarter}</span>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusIcon(phase.status)}
                  <span className="text-xs text-distill-muted uppercase tracking-wider font-bold">{getStatusText(phase.status)}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 w-full relative overflow-hidden">
                {phase.status === "in-progress" && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/50" />
                )}
                {phase.status === "completed" && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-distill-core/50" />
                )}
                <h3 className="text-xl font-bold text-white">{phase.title}</h3>
                <ul className="flex flex-col gap-3">
                  {phase.items.map((item, j) => (
                    <li key={j} className="text-white/70 text-sm flex gap-3">
                      <span className="text-distill-violet mt-1">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
