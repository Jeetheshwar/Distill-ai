"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { Aura } from "@/components/ui/aura";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden px-6">
      <Aura variant="hero" />

      <main className="w-full max-w-sm relative z-10 flex flex-col gap-6">
        <div className="flex flex-col text-center mb-4">
          <Link href="/" className="font-anta tracking-widest text-3xl text-foreground hover:text-white transition-colors mb-8">
            DISTILL.<span className="text-distill-violet">AI</span>
          </Link>
          <BlurReveal duration={0.8}>
            <h1 className="text-3xl font-bold font-sans tracking-tight text-white mb-2">
              Update Password
            </h1>
            <p className="text-distill-muted text-sm px-4">
              Please enter your new password below.
            </p>
          </BlurReveal>
        </div>

        <BlurReveal duration={1} delay={0.2}>
          <div className="flex flex-col gap-6 w-full bg-[#0a0710]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-[0_0_40px_rgba(72,38,185,0.1)]">
            
            <form className="flex flex-col gap-4" onSubmit={handleUpdate}>
              <div className="flex flex-col gap-1.5 mb-2">
                <label className="text-xs font-mono text-distill-muted uppercase tracking-wider pl-1">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-distill-core focus:ring-1 focus:ring-distill-core transition-all pr-10"
                    placeholder="••••••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mb-2">
                <label className="text-xs font-mono text-distill-muted uppercase tracking-wider pl-1">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-distill-core focus:ring-1 focus:ring-distill-core transition-all pr-10"
                    placeholder="••••••••••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-red-200 leading-relaxed">{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-3 mt-4">
                <button 
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full py-3 rounded-lg bg-distill-core text-background font-bold tracking-wide hover:bg-white transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(228,221,244,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </BlurReveal>
      </main>
    </div>
  );
}
