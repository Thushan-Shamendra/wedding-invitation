import api from "./api";
import { Guest, GuestStats, PublicGuestInvitation } from "@/types";

interface GuestListResponse {
  success: boolean;
  count: number;
  data: Guest[];
}

interface GuestSingleResponse {
  success: boolean;
  message?: string;
  data: Guest;
}

interface GuestStatsResponse {
  success: boolean;
  data: GuestStats;
}

interface PublicInviteResponse {
  success: boolean;
  data: PublicGuestInvitation;
}

interface GuestDeleteResponse {
  success: boolean;
  message?: string;
}

export const guestService = {
  async getGuests(filters?: {
    search?: string;
    status?: string;
  }): Promise<Guest[]> {
    const params = new URLSearchParams();
    if (filters?.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }
    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status);
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await api.get<GuestListResponse>(`/guests${queryString}`, {
      requiresAuth: true,
    });
    return response.data || [];
  },

  async getGuestStats(): Promise<GuestStats> {
    const response = await api.get<GuestStatsResponse>("/guests/stats/summary", {
      requiresAuth: true,
    });
    return (
      response.data || {
        totalGuests: 0,
        attending: 0,
        declined: 0,
        pending: 0,
      }
    );
  },

  async getGuestById(id: string): Promise<Guest> {
    const response = await api.get<GuestSingleResponse>(`/guests/${id}`, {
      requiresAuth: true,
    });
    return response.data;
  },

  async createGuest(data: Partial<Guest>): Promise<GuestSingleResponse> {
    const response = await api.post<GuestSingleResponse>("/guests", data, {
      requiresAuth: true,
    });
    return response;
  },

  async updateGuest(
    id: string,
    data: Partial<Guest>
  ): Promise<GuestSingleResponse> {
    const response = await api.put<GuestSingleResponse>(`/guests/${id}`, data, {
      requiresAuth: true,
    });
    return response;
  },

  async deleteGuest(id: string): Promise<GuestDeleteResponse> {
    const response = await api.delete<GuestDeleteResponse>(`/guests/${id}`, {
      requiresAuth: true,
    });
    return response;
  },

  async getGuestByInvitationToken(token: string): Promise<PublicGuestInvitation> {
    const response = await api.get<PublicInviteResponse>(
      `/guests/invite/${token}`,
      {
        requiresAuth: false, // Public endpoint
      }
    );
    return response.data;
  },
};
