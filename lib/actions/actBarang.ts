"use client";
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "../errorHandler"

export const getAllBarang = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/barang`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const createBarang = async (data: any) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/barang`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getBarang = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/barang/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editBarang = async (id: number, data: any) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/barang/${id}`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteBarang = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/barang/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}
