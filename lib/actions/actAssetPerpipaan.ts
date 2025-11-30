"use server"

import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getAllAssetPerpipaan = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/asset-perpipaan`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createAssetPerpipaan = async (formData: FormData) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/asset-perpipaan`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getAssetPerpipaan = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/asset-perpipaan/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editAssetPerpipaan = async (id: number, formData: FormData) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/asset-perpipaan/${id}`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteAssetPerpipaan = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/asset-perpipaan/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



