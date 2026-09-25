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

  logout(): void {
    this.clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  },
};
