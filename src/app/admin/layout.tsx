"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Sidebar from "@/components/shared/Sidebar";
import TopBar from "@/components/shared/TopBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we're not on the login page and not logged in, redirect
    if (pathname !== "/admin") {
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/admin");
      }
    }
  }, [currentUser, router, pathname]);

  // If on login page, allow rendering without protection
  if (pathname === "/admin") return <>{children}</>;

  // Otherwise, protect the content
  if (!currentUser || currentUser.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-[color:var(--color-dashboard-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
