"use server"

import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getAllBagianMinta = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/bagminta`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createBagianMinta = async (formData: FormData) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/bagminta`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getBagianMinta = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/bagminta/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editBagianMinta = async (id: number, formData: FormData) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/bagminta/${id}`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteBagianMinta = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/bagminta/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



