import { BlurReveal } from "@/components/ui/blur-reveal";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-8 flex flex-col items-center">
      <div className="max-w-3xl w-full flex flex-col gap-12">
        <BlurReveal duration={1}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <ShieldCheck className="w-6 h-6 text-distill-core" />
            </div>
            <h1 className="text-4xl font-bold font-sans text-foreground">Privacy Policy</h1>
          </div>
          <p className="text-distill-muted font-sans text-sm">Last updated: April 2026</p>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.1}>
          <div className="prose prose-invert max-w-none prose-p:text-distill-muted prose-headings:text-foreground prose-headings:font-sans">
            <h2>1. Data Sovereignty First</h2>
            <p>
              Distill.ai is built on the fundamental principle of zero-trust. Because our core extraction engine acts as a Bring-Your-Own-Key (BYOK) proxy, we route your audio through our proxy and discard it immediately. We do not persist the audio data you process. Audio is streamed to the inference provider (Groq) without being stored on our servers.
            </p>
            
            <h2>2. What We Collect</h2>
            <p>
              We only collect metadata necessary to maintain your account and provide the dashboard services. This includes:
              <br/>- Authentication data (Email addresses)
              <br/>- Billing information, if paid plans are introduced, will be handled by the payment provider disclosed at that time.
              <br/>- Dashboard telemetry (Webhook failure logs, schema configurations)
            </p>

            <h2>3. Third-Party Processors</h2>
            <p>
              We do not share your account metadata with any third parties other than essential infrastructure providers (Supabase for Auth/Database, and Vercel for Edge Routing). Your audio processing is governed by your own API agreements with the BYOK inference provider (Groq).
            </p>
          </div>
        </BlurReveal>
      </div>
    </div>
  );
}
