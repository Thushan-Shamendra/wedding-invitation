import api from "./api";
import { ScheduleEvent } from "@/types";

interface ScheduleListResponse {
  success: boolean;
  count: number;
  data: ScheduleEvent[];
}

interface ScheduleSingleResponse {
  success: boolean;
  message?: string;
  data: ScheduleEvent;
}

interface ScheduleDeleteResponse {
  success: boolean;
  message?: string;
}

export const scheduleService = {
  async getScheduleEvents(): Promise<ScheduleEvent[]> {
    const response = await api.get<ScheduleListResponse>("/schedule", {
      requiresAuth: false, // Public endpoint
    });
    return response.data || [];
  },

  async createScheduleEvent(
    data: Partial<ScheduleEvent>
  ): Promise<ScheduleSingleResponse> {
    const response = await api.post<ScheduleSingleResponse>("/schedule", data, {
      requiresAuth: true,
    });
    return response;
  },

  async updateScheduleEvent(
    id: string,
    data: Partial<ScheduleEvent>
  ): Promise<ScheduleSingleResponse> {
    const response = await api.put<ScheduleSingleResponse>(
      `/schedule/${id}`,
      data,
      {
        requiresAuth: true,
      }
    );
    return response;
  },

  async deleteScheduleEvent(id: string): Promise<ScheduleDeleteResponse> {
    const response = await api.delete<ScheduleDeleteResponse>(
      `/schedule/${id}`,
      {
        requiresAuth: true,
      }
    );
    return response;
  },
};
