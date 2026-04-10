import { axiosInstance } from "@/shared/api/base";
import type {
  Invoice,
  CreateInvoiceParams,
  GetInvoicesParams,
  GetInvoicesResponse,
  UpdateInvoiceParams,
} from "../model/types";

export const invoiceApi = {
  getList: async (params?: GetInvoicesParams): Promise<GetInvoicesResponse> => {
    const response = await axiosInstance.get<GetInvoicesResponse>("/invoices", { params });
    return response.data;
  },

  getOne: async (id: number): Promise<Invoice> => {
    const response = await axiosInstance.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  create: async (params: CreateInvoiceParams): Promise<Invoice> => {
    const response = await axiosInstance.post<Invoice>("/invoices", params);
    return response.data;
  },

  update: async (id: number, params: UpdateInvoiceParams): Promise<Invoice> => {
    const response = await axiosInstance.patch<Invoice>(`/invoices/${id}`, params);
    return response.data;
  },

  remove: async (id: number): Promise<{ success: boolean }> => {
    const response = await axiosInstance.delete<{ success: boolean }>(`/invoices/${id}`);
    return response.data;
  },
};
