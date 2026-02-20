import { axiosInstance } from "@/shared/api/base";
import type { GetUsersParams, GetUsersResponse } from "../model/types";

export const userApi = {
    getUsersList: async (params?: GetUsersParams): Promise<GetUsersResponse> => {
        const response = await axiosInstance.get<GetUsersResponse>("/users", {
            params
        });

        return response.data
    }
}