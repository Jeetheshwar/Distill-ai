"use client";

import { createClient } from "@/utils/supabase/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button 
      onClick={handleSignOut}
      className="p-2 rounded-lg hover:bg-white/[0.05] text-distill-muted hover:text-white transition-colors border border-transparent"
      title="Sign Out"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
