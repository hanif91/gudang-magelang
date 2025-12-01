"use client"

import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getAllAssetWilayah = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/asset-wilayah`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createAssetWilayah = async (data: any) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/asset-wilayah`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getAssetWilayah = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/asset-wilayah/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editAssetWilayah = async (id: number, data: any) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/asset-wilayah/${id}`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteAssetWilayah = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/asset-wilayah/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



