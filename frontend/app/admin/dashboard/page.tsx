"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Admin } from "@/types";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

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
          <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-[#746E66]">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1] p-6 sm:p-10 text-[#26231F]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E3DA] shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#26231F]">
              Welcome Back, {admin?.name || "Admin"}
            </h1>
            <p className="text-sm text-[#746E66] mt-1">
              Signed in as: <span className="font-medium text-[#26231F]">{admin?.email}</span>
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => authService.logout()}
            className="self-start sm:self-auto cursor-pointer"
          >
            Logout
          </Button>
        </div>

        {/* Status Callout */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E3DA] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-lg font-serif font-medium text-[#26231F]">
              Admin Authentication Verified
            </h2>
          </div>
          <p className="text-sm text-[#746E66] leading-relaxed">
            Phase 1 is complete! Admin authentication backend and frontend login are connected and verified. Next up: Admin Layout, Sidebar, Header, and Dashboard statistics.
          </p>
        </div>
      </div>
    </div>
  );
}
