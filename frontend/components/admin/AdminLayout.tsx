"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Admin } from "@/types";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutProps {
  title?: string;
  children: React.ReactNode;
}

export function AdminLayout({
  title = "Dashboard",
  children,
}: AdminLayoutProps) {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        router.replace("/admin/login");
        return;
      }

      const currentAdmin = await authService.getCurrentAdmin();
      if (!currentAdmin) {
        authService.logout();
        return;
      }

      setAdmin(currentAdmin);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F6F1]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs sm:text-sm font-medium tracking-wide uppercase text-[#746E66]">
            Verifying Admin Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1] text-[#26231F] flex flex-col">
      {/* Desktop Fixed Sidebar & Mobile Drawer */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-[260px] flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header */}
        <AdminHeader
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          admin={admin}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
