import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import PillNav from "../ui/PillNav";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Docs', href: '/docs' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] transition-all duration-300 pointer-events-none flex justify-center">
      {/* Premium blur background layer with fade out to bottom */}
      <div className="absolute inset-0 bg-transparent backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_60%,transparent)] -z-10 h-24 pointer-events-none" />
      
      {/* Layout Container */}
      <div className="pointer-events-auto w-full max-w-[95%] xl:max-w-[1400px] flex justify-between items-start pt-6 px-5 md:px-8 relative z-10">
        
        {/* Left spacing placeholder (keeps center perfectly aligned) */}
        <div className="flex-1 hidden md:block"></div>

        {/* Center: Pill Navigation */}
        <div className="flex-shrink-0 flex justify-center items-center">
          <PillNav
            items={navItems}
            activeHref="/"
            className=""
            baseColor="#BCA5E8"
            pillColor="#16131D"
            hoveredPillTextColor="#ffffff"
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
              className="px-6 py-[10px] rounded-[9999px] bg-[#BCA5E8] text-[#16131D] font-bold tracking-wide hover:scale-105 transition-transform text-sm shadow-[0_0_15px_rgba(188,165,232,0.2)] whitespace-nowrap"
            >
              {user ? "Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>

      </div>
    </nav>
  );
}
