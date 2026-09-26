import { Admin, AuthResponse } from "@/types";

const TOKEN_KEY = "wedding_admin_token";
const ADMIN_KEY = "wedding_admin_data";

export const authService = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
    );
  },

  getStoredAdmin(): Admin | null {
    if (typeof window === "undefined") return null;
    const adminStr =
      localStorage.getItem(ADMIN_KEY) || sessionStorage.getItem(ADMIN_KEY);
    if (!adminStr) return null;
    try {
      return JSON.parse(adminStr) as Admin;
    } catch {
      return null;
    }
  },

  setAuth(token: string, admin: Admin, rememberMe: boolean = true): void {
    if (typeof window === "undefined") return;
    this.clearAuth();
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(ADMIN_KEY, JSON.stringify(admin));
  },

  clearAuth(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },

  async login(
    email: string,
    password: string,
    rememberMe: boolean = true
  ): Promise<AuthResponse> {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Invalid email or password.");
    }

    if (data.token && data.admin) {
      this.setAuth(data.token, data.admin, rememberMe);
    }

    return data;
  },

  async getCurrentAdmin(): Promise<Admin | null> {
    const token = this.getToken();
    if (!token) return null;

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    try {
      const response = await fetch(`${apiUrl}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuth();
        }
        return null;
      }

      const data = await response.json();
      if (data.admin) {
        // update stored admin info
        const rememberMe = Boolean(localStorage.getItem(TOKEN_KEY));
        this.setAuth(token, data.admin, rememberMe);
        return data.admin;
      }
      return null;
    } catch (err) {
      console.error("Failed to verify admin profile:", err);
      return this.getStoredAdmin();
    }
  },

  async updateProfile(data: { name: string; email: string }): Promise<Admin> {
    const token = this.getToken();
    if (!token) throw new Error("Authentication required.");

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const response = await fetch(`${apiUrl}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const resData = await response.json();

    if (!response.ok) {
      throw new Error(resData.message || "Failed to update profile.");
    }

    if (resData.admin) {
      const rememberMe = Boolean(localStorage.getItem(TOKEN_KEY));
      this.setAuth(token, resData.admin, rememberMe);
      return resData.admin;
    }

    throw new Error("Invalid response from server.");
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword?: string;
  }): Promise<{ success: boolean; message: string }> {
    const token = this.getToken();
    if (!token) throw new Error("Authentication required.");

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const response = await fetch(`${apiUrl}/auth/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const resData = await response.json();

    if (!response.ok) {
      throw new Error(resData.message || "Failed to change password.");
    }

    return resData;
  },

  logout(): void {
    this.clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  },
};
