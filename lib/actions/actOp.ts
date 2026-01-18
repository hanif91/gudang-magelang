"use client";
import AxiosClient from "@/lib/AxiosClient";
import { axiosErrorHandler } from "../errorHandler";

export const getOpList = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/dpb/by-no-op`);
        return response.data;
    } catch (error) {
        return axiosErrorHandler(error);
    }
};

export const updateNoOp = async (data: any) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/pembelian-item/update-no-op`, data);
        return response.data;
    } catch (error) {
        return axiosErrorHandler(error);
    }
};

export const createOp = async (data: any) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/pembelian-item/create-op`, data);
        return response.data;
    } catch (error) {
        return axiosErrorHandler(error);
    }
};
