import { axiosInstance } from "@/shared/api/base";
import type {
  Review,
  GetReviewsParams,
  GetReviewsResponse,
  CreateReviewParams,
  UpdateReviewParams,
} from "../model/types";

export const reviewApi = {
  getList: async (params?: GetReviewsParams): Promise<GetReviewsResponse> => {
    const res = await axiosInstance.get<GetReviewsResponse>("/reviews", { params });
    return res.data;
  },

  getOne: async (id: number): Promise<Review> => {
    const res = await axiosInstance.get<Review>(`/reviews/${id}`);
    return res.data;
  },

  create: async (params: CreateReviewParams): Promise<Review> => {
    const res = await axiosInstance.post<Review>("/reviews", params);
    return res.data;
  },

  update: async (id: number, params: UpdateReviewParams): Promise<Review> => {
    const res = await axiosInstance.patch<Review>(`/reviews/${id}`, params);
    return res.data;
  },

  remove: async (id: number): Promise<{ success: boolean }> => {
    const res = await axiosInstance.delete<{ success: boolean }>(`/reviews/${id}`);
    return res.data;
  },

  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await axiosInstance.post<{ url: string }>("/reviews/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

