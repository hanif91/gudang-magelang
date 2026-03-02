"use client";
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "../errorHandler"

export const getAllReturBarang = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/retur-barang`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const createReturBarang = async (data: any) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/retur-barang`, data)
        return response.data
    } catch (error) {
        console.error(error)
        return axiosErrorHandler(error)
    }
}

export const deleteReturBarang = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/retur-barang/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getReturBarangDetail = async (noop: string) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/retur-barang/${noop}`)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const updateReturBarang = async (id_op: string, data: any) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/retur-barang/${id_op}`, data)
        return response.data
    } catch (error) {
        console.error(error)
        return axiosErrorHandler(error)
    }
}
