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
    ...(user
      ? [{ label: 'Dashboard', href: '/dashboard' }]
      : [
          { label: 'Sign In', href: '/login' },
          { label: 'Get Started', href: '/login?signup=true' }
        ])
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] transition-all duration-300 pointer-events-none flex justify-center">
      {/* Premium blur background layer with fade out to bottom */}
      <div className="absolute inset-0 bg-transparent backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_60%,transparent)] -z-10 h-24 pointer-events-none" />
      {/* Optional top highlight line */}
      <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10 pointer-events-none" />
      
      {/* Container for PillNav to keep it interactive while the wrapper is pointer-events-none */}
      <div className="pointer-events-auto w-full flex justify-center pt-4">
        <PillNav
          items={navItems}
          activeHref="/"
          className="shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10"
          baseColor="#000000"
          pillColor="#ffffff"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#000000"
          initialLoadAnimation
        />
      </div>
    </nav>
  );
}
