"use client";

import { BlurReveal } from "@/components/ui/blur-reveal";
import { Settings, Users, CreditCard, Activity } from "lucide-react";
import { Aura } from "@/components/ui/aura";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-10 max-w-6xl w-full">
      <Aura variant="overview" />
      <BlurReveal duration={0.8}>
        <div className="flex flex-col gap-4 relative">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-foreground font-sans tracking-tight">Organization Settings</h1>
              <p className="text-distill-muted font-sans text-sm">Manage your team members, billing status, and analyze usage quotas.</p>
            </div>
          </div>
        </div>
      </BlurReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BlurReveal duration={1} delay={0.1}>
          <div className="flex flex-col gap-6 p-8 rounded-2xl bg-white/[0.01] border border-white/5 h-full">
            <div className="flex items-center gap-3">
               <Users className="w-6 h-6 text-distill-core" />
               <h2 className="text-lg font-bold text-foreground font-sans">Team Management</h2>
            </div>
            <p className="text-sm text-distill-muted font-sans">
              Invite engineers and assign role-based access control (RBAC). Currently running in Single-User sandbox mode.
            </p>
            <button className="mt-auto w-max px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-foreground transition-colors">
              Invite Members
            </button>
          </div>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.2}>
          <div className="flex flex-col gap-6 p-8 rounded-2xl bg-white/[0.01] border border-white/5 h-full">
            <div className="flex items-center gap-3">
               <CreditCard className="w-6 h-6 text-distill-violet" />
               <h2 className="text-lg font-bold text-foreground font-sans">Billing & Invoices</h2>
            </div>
            <p className="text-sm text-distill-muted font-sans">
              Manage your payment methods and download past invoices. You are currently on the Free Developer Sandbox.
            </p>
            <button className="mt-auto w-max px-6 py-2 rounded-lg bg-distill-violet/20 border border-distill-violet/40 text-distill-core font-bold text-sm hover:bg-distill-violet/30 transition-colors">
              Upgrade to Team
            </button>
          </div>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.3} className="md:col-span-2">
          <div className="flex flex-col gap-6 p-8 rounded-2xl bg-white/[0.01] border border-white/5">
            <div className="flex items-center gap-3">
               <Activity className="w-6 h-6 text-distill-muted" />
               <h2 className="text-lg font-bold text-foreground font-sans">Usage Quotas</h2>
            </div>
            <p className="text-sm text-distill-muted font-sans">
              Monitor your API rate limits and managed cloud execution time. Local Docker execution does not count towards these limits.
            </p>
            <div className="w-full bg-black/40 rounded-lg p-6 border border-white/5 mt-2">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-bold text-foreground font-sans">Managed Extraction Minutes</span>
                <span className="text-distill-muted font-mono">0 / 500 min</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-distill-core w-[0%]" />
              </div>
            </div>
          </div>
        </BlurReveal>
      </div>

    </div>
  );
}
