import { axiosInstance } from "@/shared/api/base";
import type {
  CreatePostParams,
  GetPostsParams,
  GetPostsResponse,
  Post,
  UpdatePostParams,
} from "../model/types";

export const postApi = {
  getList: async (params?: GetPostsParams): Promise<GetPostsResponse> => {
    const res = await axiosInstance.get<GetPostsResponse>("/posts", { params });
    return res.data;
  },

  getOne: async (id: number): Promise<Post> => {
    const res = await axiosInstance.get<Post>(`/posts/${id}`);
    return res.data;
  },

  create: async (params: CreatePostParams): Promise<Post> => {
    const res = await axiosInstance.post<Post>("/posts", params);
    return res.data;
  },

  update: async (id: number, params: UpdatePostParams): Promise<Post> => {
    const res = await axiosInstance.patch<Post>(`/posts/${id}`, params);
    return res.data;
  },

  remove: async (id: number): Promise<{ success: boolean }> => {
    const res = await axiosInstance.delete<{ success: boolean }>(`/posts/${id}`);
    return res.data;
  },
};
