import { axiosInstance } from "@/shared/api/base";
import type { Callback, GetCallbacksParams, GetCallbacksResponse } from "../model/types";

export const callbackApi = {
  getList: async (params?: GetCallbacksParams): Promise<GetCallbacksResponse> => {
    const res = await axiosInstance.get<GetCallbacksResponse>("/callbacks", { params });
    return res.data;
  },

  getOne: async (id: number): Promise<Callback> => {
    const res = await axiosInstance.get<Callback>(`/callbacks/${id}`);
    return res.data;
  },

  markAsRead: async (id: number): Promise<Callback> => {
    const res = await axiosInstance.patch<Callback>(`/callbacks/${id}/read`);
    return res.data;
  },

  remove: async (id: number): Promise<{ success: boolean }> => {
    const res = await axiosInstance.delete<{ success: boolean }>(`/callbacks/${id}`);
    return res.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const res = await axiosInstance.get<{ count: number }>("/callbacks/unread-count");
    return res.data;
  },
};
