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
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <Link href="/" className="font-anta text-xl tracking-widest text-foreground hover:text-white transition-colors">
          DISTILL.<span className="text-distill-violet">AI</span>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 py-8 flex flex-col gap-2 overflow-y-auto">
        <span className="text-xs font-mono text-distill-muted ml-2 mb-4 uppercase tracking-wider">Control Plane</span>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive 
                  ? "bg-distill-violet/10 text-white border border-distill-violet/20 shadow-[0_0_15px_rgba(72,38,185,0.15)]" 
                  : "text-distill-muted hover:bg-white/[0.03] hover:text-white border border-transparent"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-distill-core" : "text-distill-muted group-hover:text-white")} />
              {item.name}
            </Link>
          );
        })}

        <div className="mt-8">
          <div className="mx-2 bg-black/40 border border-white/5 rounded-lg p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
              <span className="text-xs font-bold text-foreground font-sans">BYOK Proxy Ready</span>
            </div>
            <span className="text-[10px] font-mono text-distill-muted">v2.1.0 • Groq Inference Layer</span>
            <span className="text-[10px] font-mono text-distill-muted mt-1 flex items-center gap-1">
              <div className="w-1 h-1 border border-distill-muted rounded-full" /> Stateless Session
            </span>
          </div>
        </div>

        <div className="mt-8">
          <span className="text-xs font-mono text-distill-muted ml-2 mb-4 uppercase tracking-wider block">Resources</span>
          <Link href="/docs" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-distill-muted hover:bg-white/[0.03] hover:text-white transition-all group">
            <FileText className="w-5 h-5 group-hover:text-white text-distill-muted" />
            Documentation
          </Link>
        </div>
      </nav>

      {/* User profile mapped */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between p-2 py-3 rounded-lg hover:bg-white/[0.02] transition-colors border border-transparent">
          <div className="flex items-center gap-3 truncate">
            <div className="w-8 h-8 rounded-full bg-distill-violet/20 flex items-center justify-center border border-distill-violet/40 shrink-0">
              <span className="text-xs font-bold text-distill-core">
                {userEmail ? userEmail.substring(0, 2).toUpperCase() : "US"}
              </span>
            </div>
            <div className="flex flex-col truncate pr-2">
              <span className="text-sm font-bold text-foreground truncate">
                {userEmail ? userEmail.split("@")[0] : "Sandbox User"}
              </span>
              <span className="text-xs text-distill-muted truncate">
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
