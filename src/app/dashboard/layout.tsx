import { Aura } from "@/components/ui/aura";
import { createClient } from "@/utils/supabase/server";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <DashboardSidebar userEmail={user?.email} />

      {/* Main App Canvas */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10 bg-black/50">
        
        <div className="flex-1 p-8 lg:p-12 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
