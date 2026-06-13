import Link from "next/link";

import { createClient } from "@/utils/supabase/server";
import PillNav from "../ui/PillNav";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Documentation', href: '/docs' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Changelog', href: '/changelog' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] transition-all duration-300 pointer-events-none flex justify-center">
      {/* Premium blur background layer with fade out to bottom */}
      <div className="absolute inset-0 bg-transparent backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_60%,transparent)] -z-10 h-24 pointer-events-none" />
      
      {/* Layout Container */}
      <div className="pointer-events-auto w-full max-w-[95%] xl:max-w-[1400px] flex justify-between items-start pt-3 px-5 md:px-8 relative z-10">
        
        {/* Left side: Logo */}
        <div className="flex-1 hidden md:flex items-center pt-1">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-distill-core flex items-center justify-center transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0D14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            </div>
            <span className="font-anta text-xl tracking-widest text-foreground mt-1">DISTILL.<span className="text-distill-core">AI</span></span>
          </Link>
        </div>

        {/* Center: Pill Navigation */}
        <div className="flex-shrink-0 flex justify-center items-center">
          <PillNav
            items={navItems}
            activeHref="/"
            className=""
            baseColor="#E6F0FA"
            pillColor="#0A0D14"
            hoveredPillTextColor="#0A0D14"
            pillTextColor="#ffffff"
            initialLoadAnimation
          />
        </div>

        {/* Right side: CTA / Auth */}
        <div className="flex-1 flex justify-end items-center mt-1">
          <div className="flex items-center gap-4">
            {!user && (
              <Link href="/login" className="text-sm font-bold tracking-wide text-distill-muted hover:text-white transition-colors hidden sm:block">
                Sign In
              </Link>
            )}
            <Link 
              href={user ? "/dashboard" : "/login?signup=true"} 
              className="px-6 py-[10px] rounded-[9999px] bg-distill-core text-[#0A0D14] font-bold tracking-wide hover:scale-105 transition-transform text-sm shadow-[0_0_15px_rgba(230,240,250,0.2)] whitespace-nowrap"
            >
              {user ? "Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>

      </div>
    </nav>
  );
}
