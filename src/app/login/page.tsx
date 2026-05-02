"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { Aura } from "@/components/ui/aura";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Check your email for the confirmation link to activate your account.");
        setLoading(false);
      }
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
              {isSignUp ? "Create Account" : "Sign In"}
            </h1>
            <p className="text-distill-muted text-sm px-4">
              {isSignUp 
                ? "Join the open-source audio intelligence platform."
                : "Welcome back. Sign in to continue."}
            </p>
          </BlurReveal>
        </div>

        <BlurReveal duration={1} delay={0.2}>
          <div className="flex flex-col gap-6 w-full bg-[#0a0710]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-[0_0_40px_rgba(72,38,185,0.1)]">
            
            <button 
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setError(null);
                const { data, error } = await supabase.auth.signInWithOAuth({ 
                  provider: 'github',
                  options: {
                    skipBrowserRedirect: true
                  }
                });
                
                if (error) {
                  setError("GitHub OAuth is unconfigured in Supabase. Please sign in with email.");
                  setLoading(false);
                } else if (data?.url) {
                  window.location.href = data.url;
                }
              }}
              className="w-full py-3 rounded-lg bg-white text-black font-bold tracking-wide hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              Continue with GitHub
            </button>

            <div className="flex items-center gap-4 w-full">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs font-mono text-distill-muted uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form className="flex flex-col gap-4" onSubmit={isSignUp ? handleSignUp : handleLogin}>
              <div className="flex flex-col gap-1.5">
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

              <div className="flex flex-col gap-1.5 mb-2">
                <div className="flex justify-between items-center pr-1">
                  <label className="text-xs font-mono text-distill-muted uppercase tracking-wider pl-1">Password</label>
                  {!isSignUp && (
                    <button type="button" onClick={() => alert("Password reset is locked in this demo instance.")} className="text-xs font-mono text-distill-muted hover:text-white transition-colors">Forgot password?</button>
                  )}
                </div>
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

              {error && (
                <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-red-200 leading-relaxed">{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-3 mt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-distill-core text-background font-bold tracking-wide hover:bg-white transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(228,221,244,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? "Create Account" : "Sign In")}
                </button>

                <button 
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-transparent border border-white/10 text-distill-muted font-bold tracking-wide hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isSignUp ? "Already have an account? Sign In" : "New here? Create account"}
                </button>
              </div>
            </form>
          </div>
        </BlurReveal>
      </main>
    </div>
  );
}
