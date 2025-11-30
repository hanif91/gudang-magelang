"use server"

import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getAllAssetLokasi = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/asset-lokasi`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createAssetLokasi = async (formData: FormData) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/asset-lokasi`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getAssetLokasi = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/asset-lokasi/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editAssetLokasi = async (id: number, formData: FormData) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/asset-lokasi/${id}`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteAssetLokasi = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/asset-lokasi/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



