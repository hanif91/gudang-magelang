"use client"

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


export const createBagianMinta = async (data: any) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/bagminta`, data)
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


export const editBagianMinta = async (id: number, data: any) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/bagminta/${id}`, data)
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



