import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300">
      {/* Premium blur background layer with fade out to bottom */}
      <div className="absolute inset-0 bg-transparent backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_60%,transparent)] -z-10 h-full" />
      {/* Optional top highlight line */}
      <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />
      
      <div className="flex justify-center w-full px-4 pt-4 pb-6">
        <div className="flex justify-between items-center w-full max-w-[95%] xl:max-w-[1400px] px-5 md:px-8 relative z-10">
          <Link href="/" className="font-anta text-2xl tracking-widest text-foreground">
            DISTILL.<span className="text-distill-violet">AI</span>
          </Link>
        
        <div className="hidden md:flex gap-10 items-center text-sm font-bold tracking-wide text-distill-muted">
          <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          {!user && (
            <Link href="/login" className="text-sm font-bold tracking-wide text-distill-muted hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
          )}
          <Link href={user ? "/dashboard" : "/login?signup=true"} className="px-5 md:px-8 py-2 rounded-xl bg-foreground text-background font-bold tracking-wide hover:scale-105 transition-transform text-sm shadow-[0_0_15px_rgba(255,255,255,0.2)] whitespace-nowrap">
            {user ? "Dashboard" : "Get Started"}
          </Link>
        </div>
        </div>
      </div>
    </nav>
  );
}
