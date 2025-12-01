"use client";

import AxiosClient from "@/lib/AxiosClient";
import { axiosErrorHandler } from "@/lib/errorHandler";

export const getAllBarangKeluar = async () => {
  try {
    const response = await AxiosClient.get(`/api/gudang/barang-keluar`);
    return response.data;
  } catch (error) {
    console.log(error);
    return axiosErrorHandler(error);
  }
};

export const createBarangKeluar = async (data: any) => {
  try {
    const response = await AxiosClient.post(
      `/api/gudang/barang-keluar`,
      data
    );
    return response.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const getBarangKeluar = async (id: string | null) => {
  try {
    const response = await AxiosClient.get(`/api/gudang/barang-keluar/${id}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const updateStatus = async (id: number, data: any) => {
  try {
    const response = await AxiosClient.put(
      `/api/gudang/barang-keluar/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const editKomentar = async (id: number, data: any) => {
  try {
    const response = await AxiosClient.put(
      `/api/gudang/barang-keluar/komentar/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const deleteBarangKeluar = async (id: string | null) => {
  try {
    const response = await AxiosClient.delete(
      `/api/gudang/barang-keluar/${id}`
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};


export const deleteBarangKeluarItem = async (id: string | null) => {
  try {
    const response = await AxiosClient.delete(
      `/api/gudang/barang-keluar/barang/${id}`
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};
