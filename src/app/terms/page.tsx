import { BlurReveal } from "@/components/ui/blur-reveal";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-8 flex flex-col items-center">
      <div className="max-w-3xl w-full flex flex-col gap-12">
        <BlurReveal duration={1}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <FileText className="w-6 h-6 text-distill-core" />
            </div>
            <h1 className="text-4xl font-bold font-sans text-foreground">Terms of Service</h1>
          </div>
          <p className="text-distill-muted font-sans text-sm">Last updated: April 2026</p>
        </BlurReveal>

        <BlurReveal duration={1} delay={0.1}>
          <div className="prose prose-invert max-w-none prose-p:text-distill-muted prose-headings:text-foreground prose-headings:font-sans">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing the Dashboard or utilizing our APIs, you agree to be bound by these Terms of Service.
            </p>
            
            <h2>2. License to Use</h2>
            <p>
              Distill grants you a revocable, non-exclusive, non-transferable license to access and use our application subject to the tier you have subscribed to. 
            </p>

            <h2>3. Reverse Engineering</h2>
            <p>
              You agree not to reverse engineer, decompile, or attempt to extract the processing logic embedded within the application.
            </p>
            
            <p>
              3. &quot;Lifetime Deal&quot; implies access for the active lifetime of the product.
              4. Refunds are evaluated on a case-by-case basis but generally we stick to &quot;No Refunds&quot;.
            </p>

            <h2>4. Limitation of Liability</h2>
            <p>
              Distill is provided &quot;as is&quot;. Because you control the execution environment and the data inputs, we are not liable for any data loss, extraction hallucinations, or infrastructure downtime you experience.
            </p>
          </div>
        </BlurReveal>
      </div>
    </div>
  );
}
