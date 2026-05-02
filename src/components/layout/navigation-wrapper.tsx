"use client";

import { usePathname } from "next/navigation";

export function NavigationWrapper({ 
  navbar, 
  children 
}: { 
  navbar: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isLogin = pathname?.startsWith("/login");

  if (isDashboard || isLogin) {
    return (
      <main className="flex-1 w-full relative z-10">
        {children}
      </main>
    );
  }

  return (
    <>
      {navbar}
      <main className="flex-1 w-full relative z-10">
        {children}
      </main>
    </>
  );
}
