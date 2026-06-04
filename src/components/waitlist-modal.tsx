"use client";

import { useState } from "react";
import { Loader2, X, CheckCircle2, AlertCircle } from "lucide-react";
import { BlurReveal } from "./ui/blur-reveal";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: "pro" | "team";
}

export function WaitlistModal({ isOpen, onClose, planType }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan_type: planType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      if (data.message === "You're already on the list!") {
        setMessage({ text: data.message, type: "info" });
      } else {
        setMessage({ text: data.message, type: "success" });
        setEmail("");
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const displayPlanName = planType === "pro" ? "Pro" : "Team";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={onClose}
      />
      
      <BlurReveal duration={0.4}>
        <div className="relative w-full max-w-md bg-[#0a0710] border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-4 z-20">
            <button suppressHydrationWarning 
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-2 mb-6 text-center relative z-10">
            <h2 className="text-2xl font-bold font-sans text-white">
              Get Notified When {displayPlanName} Launches
            </h2>
            <p className="text-sm text-distill-muted font-sans mt-2">
              We're building {displayPlanName} features based on user feedback. Be the first to know when it's ready.
            </p>
          </div>

          {message?.type === "success" || message?.type === "info" ? (
            <div className="flex flex-col items-center justify-center gap-4 py-6 text-center animate-in fade-in slide-in-from-bottom-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-distill-core/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-distill-core" />
              </div>
              <h3 className="text-white font-bold">{message.text}</h3>
              <button suppressHydrationWarning 
                onClick={onClose}
                className="mt-4 px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
              <div className="flex flex-col gap-1.5">
                <input suppressHydrationWarning 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-distill-core focus:ring-1 focus:ring-distill-core transition-all"
                  autoFocus
                />
              </div>

              {message?.type === "error" && (
                <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-red-200 leading-relaxed">{message.text}</span>
                </div>
              )}

              <button suppressHydrationWarning 
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 mt-2 rounded-lg bg-distill-core text-background font-bold tracking-wide hover:bg-white transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(228,221,244,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Notify Me"}
              </button>

              <p className="text-xs text-center text-white/40 mt-2 font-sans">
                No spam. Unsubscribe anytime. ~500 people on the list.
              </p>
            </form>
          )}
        </div>
      </BlurReveal>
    </div>
  );
}
