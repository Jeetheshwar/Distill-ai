"use client";

import Link from "next/link";
import { LayoutDashboard, ShieldEllipsis, Webhook, FileText, Settings, Cpu } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/auth/signout-button";
import { Users } from "lucide-react";

export function DashboardSidebar({ userEmail }: { userEmail: string | undefined }) {
  const pathname = usePathname();

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Pipelines", href: "/dashboard/pipelines", icon: Cpu },
    { name: "Infrastructure", href: "/dashboard/infrastructure", icon: ShieldEllipsis },
    { name: "Integrations", href: "/dashboard/integrations", icon: Webhook },
    { name: "Team Workspace", href: "/dashboard/team", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-md hidden md:flex flex-col relative z-20">
      <div className="flex items-center pt-2 px-2 pb-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-distill-core flex items-center justify-center transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0D14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
          </div>
          <span className="font-anta text-xl tracking-widest text-foreground mt-1">DISTILL.<span className="text-distill-core">AI</span></span>
        </Link>
      </div>
      
      <nav className="dashboard-scroll flex-1 px-4 py-8 flex flex-col gap-2 overflow-y-auto">
        <span className="text-xs font-mono text-zinc-500 ml-2 mb-4 uppercase tracking-wider">Control Plane</span>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive 
                  ? "bg-white/[0.04] text-white border-l-2 border-l-white/80 rounded-l-none border-y border-r border-transparent" 
                  : "text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-300 border border-transparent"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-zinc-600 group-hover:text-zinc-400")} />
              {item.name}
            </Link>
          );
        })}

        <div className="mt-8">
          <div className="mx-2 bg-white/[0.01] border border-white/[0.05] rounded-lg p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-pulse" />
              <span className="text-xs font-bold text-zinc-300 font-sans">BYOK Proxy Ready</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">v2.1.0 • Groq Inference Layer</span>
            <span className="text-[10px] font-mono text-zinc-500 mt-1 flex items-center gap-1">
              <div className="w-1 h-1 border border-zinc-500 rounded-full" /> Stateless Session
            </span>
          </div>
        </div>

        <div className="mt-8">
          <span className="text-xs font-mono text-zinc-500 ml-2 mb-4 uppercase tracking-wider block">Resources</span>
          <Link href="/docs" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-300 transition-all group">
            <FileText className="w-5 h-5 group-hover:text-zinc-400 text-zinc-600 transition-colors" />
            Documentation
          </Link>
        </div>
      </nav>

      {/* User profile mapped */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between p-2 py-3 rounded-lg hover:bg-white/[0.02] transition-colors border border-transparent">
          <div className="flex items-center gap-3 truncate">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
              <span className="text-xs font-bold text-white">
                {userEmail ? userEmail.substring(0, 2).toUpperCase() : "US"}
              </span>
            </div>
            <div className="flex flex-col truncate pr-2">
              <span className="text-sm font-bold text-foreground truncate">
                {userEmail ? userEmail.split("@")[0] : "Sandbox User"}
              </span>
              <span className="text-xs text-zinc-500 truncate">
                {userEmail || "No Session"}
              </span>
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
