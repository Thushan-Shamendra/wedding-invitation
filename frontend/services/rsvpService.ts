import api from "./api";
import { RSVP, PublicRSVP, RSVPSubmitData, RSVPStats } from "@/types";

interface RSVPListResponse {
  success: boolean;
  count: number;
  data: RSVP[];
}

interface RSVPSingleResponse {
  success: boolean;
  message?: string;
  data: RSVP;
}

interface RSVPPublicLookupResponse {
  success: boolean;
  data: PublicRSVP | null;
}

interface RSVPPublicSubmitResponse {
  success: boolean;
  message: string;
  data: PublicRSVP;
}

interface RSVPStatsResponse {
  success: boolean;
  data: RSVPStats;
}

interface RSVPDeleteResponse {
  success: boolean;
  message?: string;
}

export const rsvpService = {
  // Public: Submit or update RSVP response by invitation token
  async submitRSVP(
    token: string,
    data: RSVPSubmitData
  ): Promise<RSVPPublicSubmitResponse> {
    const response = await api.post<RSVPPublicSubmitResponse>(
      `/rsvp/${token}`,
      data,
      {
        requiresAuth: false,
      }
    );
    return response;
  },

  // Public: Fetch existing RSVP for a personalized invitation token (or null if not responded yet)
  async getRSVPByInvitationToken(token: string): Promise<PublicRSVP | null> {
    const response = await api.get<RSVPPublicLookupResponse>(
      `/rsvp/invite/${token}`,
      {
        requiresAuth: false,
      }
    );
    return response.data || null;
  },

  // Admin: Get all RSVP responses with optional search, status filter, and limit
  async getRSVPResponses(filters?: {
    search?: string;
    status?: string;
    limit?: number;
  }): Promise<RSVP[]> {
    const params = new URLSearchParams();
    if (filters?.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }
    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    if (filters?.limit) {
      params.append("limit", filters.limit.toString());
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await api.get<RSVPListResponse>(`/rsvp${queryString}`, {
      requiresAuth: true,
    });
    return response.data || [];
  },

  // Admin: Get RSVP statistics summary
  async getRSVPStats(): Promise<RSVPStats> {
    const response = await api.get<RSVPStatsResponse>("/rsvp/stats/summary", {
      requiresAuth: true,
    });
    return (
      response.data || {
        totalResponses: 0,
        attendingResponses: 0,
        declinedResponses: 0,
        totalGuestsAttending: 0,
        pendingGuests: 0,
      }
    );
  },

  // Admin: Get single RSVP details by ID
  async getRSVPById(id: string): Promise<RSVP> {
    const response = await api.get<RSVPSingleResponse>(`/rsvp/${id}`, {
      requiresAuth: true,
    });
    return response.data;
  },

  // Admin: Update RSVP
  async updateRSVP(
    id: string,
    data: Partial<RSVP>
  ): Promise<RSVPSingleResponse> {
    const response = await api.put<RSVPSingleResponse>(`/rsvp/${id}`, data, {
      requiresAuth: true,
    });
    return response;
  },

  // Admin: Delete RSVP (resets guest to pending)
  async deleteRSVP(id: string): Promise<RSVPDeleteResponse> {
    const response = await api.delete<RSVPDeleteResponse>(`/rsvp/${id}`, {
      requiresAuth: true,
    });
    return response;
  },
};
