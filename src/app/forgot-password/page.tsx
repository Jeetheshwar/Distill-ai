"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { Aura } from "@/components/ui/aura";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Provide the absolute redirect URL so the user lands on the update password page
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
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
              Reset Password
            </h1>
            <p className="text-distill-muted text-sm px-4">
              Enter your email to receive a password reset link.
            </p>
          </BlurReveal>
        </div>

        <BlurReveal duration={1} delay={0.2}>
          <div className="flex flex-col gap-6 w-full bg-[#0a0710]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-[0_0_40px_rgba(72,38,185,0.1)]">
            
            {success ? (
              <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-distill-core/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-distill-core" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-white font-bold text-lg">Check your email</h3>
                  <p className="text-distill-muted text-sm">We've sent a password reset link to <span className="text-white">{email}</span></p>
                </div>
                <Link href="/login" className="w-full mt-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-bold tracking-wide hover:bg-white/10 transition-colors flex items-center justify-center text-sm">
                  Back to Login
                </Link>
              </div>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={handleReset}>
                <div className="flex flex-col gap-1.5 mb-2">
                  <label className="text-xs font-mono text-distill-muted uppercase tracking-wider pl-1">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-distill-core focus:ring-1 focus:ring-distill-core transition-all"
                    placeholder="developer@startup.com"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 p-3 rounded-md">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-red-200 leading-relaxed">{error}</span>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-2">
                  <button 
                    type="submit"
                    disabled={loading || !email}
                    className="w-full py-3 rounded-lg bg-distill-core text-background font-bold tracking-wide hover:bg-white transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(228,221,244,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                  </button>

                  <Link href="/login" className="w-full py-3 rounded-lg bg-transparent text-distill-muted font-bold tracking-wide hover:text-white transition-colors flex items-center justify-center text-sm">
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </BlurReveal>
      </main>
    </div>
  );
}
