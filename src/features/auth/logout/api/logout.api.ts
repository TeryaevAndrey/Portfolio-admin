import { axiosInstance } from "@/shared/api/base";

export const logoutApi = {
  logout: async () => {
    const response = await axiosInstance.post("/auth/logout");

    return response.data;
  },
};
