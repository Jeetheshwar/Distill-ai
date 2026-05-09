import { Aura } from "@/components/ui/aura";
import { Users, Lock } from "lucide-react";
import Link from "next/link";

export default function TeamPage() {
  return (
    <div className="flex flex-col gap-10 max-w-6xl w-full">
      <Aura variant="overview" />
      
      <div className="flex flex-col gap-4 relative">
        <h1 className="text-3xl font-bold text-foreground font-sans tracking-tight">Team Workspace</h1>
        <p className="text-distill-muted max-w-2xl font-sans mb-6 mt-2">
          Shared pipelines, team webhooks, and advanced analytics for your engineering organization.
        </p>

        <div className="w-full flex flex-col items-center justify-center p-16 border border-white/10 rounded-2xl bg-black/40 backdrop-blur-md">
          <Lock className="w-12 h-12 text-distill-violet mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Team Plan Required</h2>
          <p className="text-white/50 max-w-md text-center mb-8">
            Upgrade to the Team plan to unlock shared workspaces, admin controls, and team analytics dashboards.
          </p>
          <button disabled className="px-8 py-3 rounded-xl bg-distill-violet text-white font-bold opacity-50 cursor-not-allowed">
            Upgrade via Stripe (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
