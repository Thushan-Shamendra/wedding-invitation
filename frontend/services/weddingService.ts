import api from "./api";
import { Wedding } from "@/types";

interface WeddingApiResponse {
  success: boolean;
  message?: string;
  data: Wedding;
}

export const weddingService = {
  async getWeddingDetails(): Promise<Wedding> {
    const response = await api.get<WeddingApiResponse>("/wedding", {
      requiresAuth: false, // Public endpoint
    });
    return response.data;
  },

  async updateWeddingDetails(
    data: Partial<Wedding>
  ): Promise<WeddingApiResponse> {
    const response = await api.put<WeddingApiResponse>("/wedding", data, {
      requiresAuth: true, // Protected endpoint
    });
    return response;
  },
};
