import { axiosInstance } from "@/shared/api/base";
import type { CreateCaseParams } from "../model/types";

export const createCaseApi = {
  createCase: async (params: CreateCaseParams) => {
    const formData = new FormData();

    formData.append("title", params.title);
    formData.append("description", params.description || "");
    formData.append("link", params.link || "");

    if (params.images) {
      params.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    const response = await axiosInstance.post("/cases", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};
