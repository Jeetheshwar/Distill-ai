import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="fixed top-6 left-0 w-full z-50 flex justify-center px-4">
      <div className="flex justify-between items-center w-full max-w-[95%] xl:max-w-[1400px] bg-[#0a0710]/80 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-2.5 shadow-[0_0_30px_rgba(72,38,185,0.15)] relative z-10">
        <Link href="/" className="font-anta text-2xl tracking-widest text-foreground">
          DISTILL.<span className="text-distill-violet">AI</span>
        </Link>
        
        <div className="hidden md:flex gap-10 items-center text-sm font-bold tracking-wide text-distill-muted">
          <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
        </div>

        <div className="flex items-center gap-6">
          {!user && (
            <Link href="/login" className="text-sm font-bold tracking-wide text-distill-muted hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
          )}
          <Link href={user ? "/dashboard" : "/login"} className="px-8 py-2 rounded-xl bg-foreground text-background font-bold tracking-wide hover:scale-105 transition-transform text-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {user ? "Dashboard" : "Get Started"}
          </Link>
        </div>
      </div>
    </nav>
  );
}
