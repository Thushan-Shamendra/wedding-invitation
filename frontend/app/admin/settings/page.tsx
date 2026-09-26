"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { authService } from "@/services/authService";
import { weddingService } from "@/services/weddingService";
import { Admin, Wedding } from "@/types";
import {
  User,
  Lock,
  Globe,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Send,
  Sparkles,
} from "lucide-react";

interface AccountForm {
  name: string;
  email: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface WebsiteSettingsForm {
  websiteStatus: "draft" | "published";
  rsvpEnabled: boolean;
  personalInvitationEnabled: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  // Card 1: Account
  const [accountForm, setAccountForm] = useState<AccountForm>({
    name: "",
    email: "",
  });
  const [initialAccount, setInitialAccount] = useState<AccountForm | null>(null);
  const [savingAccount, setSavingAccount] = useState(false);

  // Card 2: Password
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Card 3: Website Settings
  const [websiteForm, setWebsiteForm] = useState<WebsiteSettingsForm>({
    websiteStatus: "draft",
    rsvpEnabled: true,
    personalInvitationEnabled: true,
  });
  const [initialWebsite, setInitialWebsite] = useState<WebsiteSettingsForm | null>(null);
  const [savingWebsite, setSavingWebsite] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Load Admin profile & Wedding settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const [adminData, weddingData] = await Promise.all([
          authService.getCurrentAdmin(),
          weddingService.getWeddingDetails(),
        ]);

        if (adminData) {
          const acc: AccountForm = {
            name: adminData.name,
            email: adminData.email,
          };
          setAccountForm(acc);
          setInitialAccount(acc);
        }

        if (weddingData) {
          const web: WebsiteSettingsForm = {
            websiteStatus: weddingData.websiteStatus || "draft",
            rsvpEnabled: weddingData.rsvpEnabled !== false,
            personalInvitationEnabled:
              weddingData.personalInvitationEnabled !== false &&
              weddingData.personalizedInvitationsEnabled !== false,
          };
          setWebsiteForm(web);
          setInitialWebsite(web);
        }
      } catch (err: any) {
        console.error("Failed to load settings:", err);
        setToast({
          message: err.message || "Failed to load settings.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Dirty state checks
  const isAccountDirty =
    initialAccount !== null &&
    (accountForm.name !== initialAccount.name ||
      accountForm.email !== initialAccount.email);

  const isWebsiteDirty =
    initialWebsite !== null &&
    (websiteForm.websiteStatus !== initialWebsite.websiteStatus ||
      websiteForm.rsvpEnabled !== initialWebsite.rsvpEnabled ||
      websiteForm.personalInvitationEnabled !== initialWebsite.personalInvitationEnabled);

  // Handlers for Account
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.name.trim()) {
      setToast({ message: "Admin name is required.", type: "error" });
      return;
    }
    if (accountForm.name.trim().length > 100) {
      setToast({ message: "Admin name cannot exceed 100 characters.", type: "error" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(accountForm.email.trim())) {
      setToast({ message: "Please enter a valid email address.", type: "error" });
      return;
    }

    try {
      setSavingAccount(true);
      const updatedAdmin = await authService.updateProfile({
        name: accountForm.name.trim(),
        email: accountForm.email.trim(),
      });
      const updated: AccountForm = {
        name: updatedAdmin.name,
        email: updatedAdmin.email,
      };
      setAccountForm(updated);
      setInitialAccount(updated);
      setToast({
        message: "Account details updated successfully.",
        type: "success",
      });
    } catch (err: any) {
      console.error("Save account error:", err);
      setToast({
        message: err.message || "Failed to update account details.",
        type: "error",
      });
    } finally {
      setSavingAccount(false);
    }
  };

  const handleResetAccount = () => {
    if (initialAccount) {
      setAccountForm(initialAccount);
    }
  };

  // Handlers for Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      setToast({ message: "Current password is required.", type: "error" });
      return;
    }
    if (!passwordForm.newPassword) {
      setToast({ message: "New password is required.", type: "error" });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setToast({ message: "New password must be at least 8 characters long.", type: "error" });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setToast({ message: "New password and confirmation do not match.", type: "error" });
      return;
    }

    try {
      setSavingPassword(true);
      const res = await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword,
      });

      // Clear password form on success
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setToast({
        message: res.message || "Password updated successfully.",
        type: "success",
      });
    } catch (err: any) {
      console.error("Change password error:", err);
      setToast({
        message: err.message || "Failed to update password.",
        type: "error",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  // Handlers for Website Settings
  const handleSaveWebsiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSavingWebsite(true);
      const res = await weddingService.updateWeddingDetails({
        websiteStatus: websiteForm.websiteStatus,
        rsvpEnabled: websiteForm.rsvpEnabled,
        personalInvitationEnabled: websiteForm.personalInvitationEnabled,
      });

      const updated: WebsiteSettingsForm = {
        websiteStatus: res.data.websiteStatus || websiteForm.websiteStatus,
        rsvpEnabled: res.data.rsvpEnabled !== false,
        personalInvitationEnabled: res.data.personalInvitationEnabled !== false,
      };
      setWebsiteForm(updated);
      setInitialWebsite(updated);

      setToast({
        message: "Website settings saved successfully!",
        type: "success",
      });
    } catch (err: any) {
      console.error("Save website settings error:", err);
      setToast({
        message: err.message || "Failed to save website settings.",
        type: "error",
      });
    } finally {
      setSavingWebsite(false);
    }
  };

  const handleResetWebsite = () => {
    if (initialWebsite) {
      setWebsiteForm(initialWebsite);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#746E66]">
            Loading Settings...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="space-y-8 pb-16 max-w-4xl">
        {/* Header Intro */}
        <div className="pb-2 border-b border-[#E8E3DA]/80">
          <h2 className="text-2xl font-serif font-semibold text-[#26231F] tracking-tight">
            Settings
          </h2>
          <p className="text-xs sm:text-sm text-[#746E66] mt-0.5">
            Manage your administrator account and wedding website availability.
          </p>
        </div>

        {/* ============================================================== */}
        {/* CARD 1: ADMIN ACCOUNT INFORMATION */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DA]/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F8F6F1] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-semibold text-[#26231F]">
                  Admin Account
                </h3>
                <p className="text-[11px] text-[#746E66]">
                  Update your administrator display name and contact email address
                </p>
              </div>
            </div>

            {isAccountDirty && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </span>
            )}
          </div>

          <form onSubmit={handleSaveAccount} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#26231F]">
                  Administrator Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Wedding Admin"
                  value={accountForm.name}
                  onChange={(e) =>
                    setAccountForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#26231F]">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="admin@wedding.com"
                  value={accountForm.email}
                  onChange={(e) =>
                    setAccountForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleResetAccount}
                disabled={!isAccountDirty || savingAccount}
                className="text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                <span>Reset</span>
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={savingAccount}
                loadingText="Saving..."
                disabled={!isAccountDirty}
                className="text-xs min-w-[150px]"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                <span>Save Account Changes</span>
              </Button>
            </div>
          </form>
        </div>

        {/* ============================================================== */}
        {/* CARD 2: CHANGE PASSWORD */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DA]/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F8F6F1] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-semibold text-[#26231F]">
                  Change Password
                </h3>
                <p className="text-[11px] text-[#746E66]">
                  Ensure your account is protected with a secure password (minimum 8 characters)
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#26231F]">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#746E66] hover:text-[#26231F] transition-colors p-1"
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password & Confirmation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#26231F]">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#746E66] hover:text-[#26231F] transition-colors p-1"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#26231F]">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmNewPassword: e.target.value,
                      }))
                    }
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#746E66] hover:text-[#26231F] transition-colors p-1"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={savingPassword}
                loadingText="Updating..."
                disabled={
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmNewPassword
                }
                className="text-xs min-w-[140px]"
              >
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                <span>Update Password</span>
              </Button>
            </div>
          </form>
        </div>

        {/* ============================================================== */}
        {/* CARD 3: WEBSITE SETTINGS */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DA]/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F8F6F1] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-semibold text-[#26231F]">
                  Website Settings
                </h3>
                <p className="text-[11px] text-[#746E66]">
                  Control website publication status, online RSVP availability, and invitation token access
                </p>
              </div>
            </div>

            {isWebsiteDirty && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </span>
            )}
          </div>

          <form onSubmit={handleSaveWebsiteSettings} className="space-y-6">
            {/* Website Status Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#26231F]">
                Website Publication Status
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Draft Option */}
                <div
                  onClick={() =>
                    setWebsiteForm((prev) => ({ ...prev, websiteStatus: "draft" }))
                  }
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    websiteForm.websiteStatus === "draft"
                      ? "bg-[#C9A96E]/5 border-[#C9A96E] ring-1 ring-[#C9A96E]"
                      : "bg-white border-[#E8E3DA] hover:bg-[#F8F6F1]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      websiteForm.websiteStatus === "draft"
                        ? "border-[#C9A96E] bg-[#C9A96E]"
                        : "border-[#746E66]"
                    }`}
                  >
                    {websiteForm.websiteStatus === "draft" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#26231F]">Draft</p>
                      <span className="text-[10px] px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded">
                        Hidden
                      </span>
                    </div>
                    <p className="text-xs text-[#746E66] mt-1 leading-relaxed">
                      Your wedding website is hidden from normal visitors while you continue editing.
                    </p>
                  </div>
                </div>

                {/* Published Option */}
                <div
                  onClick={() =>
                    setWebsiteForm((prev) => ({ ...prev, websiteStatus: "published" }))
                  }
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    websiteForm.websiteStatus === "published"
                      ? "bg-[#C9A96E]/5 border-[#C9A96E] ring-1 ring-[#C9A96E]"
                      : "bg-white border-[#E8E3DA] hover:bg-[#F8F6F1]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      websiteForm.websiteStatus === "published"
                        ? "border-[#C9A96E] bg-[#C9A96E]"
                        : "border-[#746E66]"
                    }`}
                  >
                    {websiteForm.websiteStatus === "published" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#26231F]">Published</p>
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                        Live
                      </span>
                    </div>
                    <p className="text-xs text-[#746E66] mt-1 leading-relaxed">
                      Guests can access the public wedding website and celebration details.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="pt-2 border-t border-[#E8E3DA]/80 space-y-4">
              {/* RSVP Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E8E3DA] bg-[#F8F6F1]/50">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-[#26231F]">
                      Enable Online RSVP
                    </h4>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        websiteForm.rsvpEnabled
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-stone-100 text-stone-600 border border-stone-200"
                      }`}
                    >
                      {websiteForm.rsvpEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#746E66] leading-relaxed">
                    When turned off, the RSVP form is hidden on public pages and replaced with a message explaining submissions are closed. Existing RSVP records remain preserved.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={websiteForm.rsvpEnabled}
                    onChange={(e) =>
                      setWebsiteForm((prev) => ({
                        ...prev,
                        rsvpEnabled: e.target.checked,
                      }))
                    }
                  />
                  <div className="w-11 h-6 bg-[#E8E3DA] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8B4A0] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A96E]" />
                </label>
              </div>

              {/* Personalized Invitation Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E8E3DA] bg-[#F8F6F1]/50">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-[#26231F]">
                      Enable Personalized Invitations
                    </h4>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        websiteForm.personalInvitationEnabled
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-stone-100 text-stone-600 border border-stone-200"
                      }`}
                    >
                      {websiteForm.personalInvitationEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#746E66] leading-relaxed">
                    When turned off, individual guest token links (/invite/[token]) show an unavailable state without deleting guest data or tokens.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={websiteForm.personalInvitationEnabled}
                    onChange={(e) =>
                      setWebsiteForm((prev) => ({
                        ...prev,
                        personalInvitationEnabled: e.target.checked,
                      }))
                    }
                  />
                  <div className="w-11 h-6 bg-[#E8E3DA] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8B4A0] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A96E]" />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleResetWebsite}
                disabled={!isWebsiteDirty || savingWebsite}
                className="text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                <span>Reset</span>
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={savingWebsite}
                loadingText="Saving..."
                disabled={!isWebsiteDirty}
                className="text-xs min-w-[160px]"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                <span>Save Website Settings</span>
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AdminLayout>
  );
}
