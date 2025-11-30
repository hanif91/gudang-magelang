"use server"

// import { auth } from "@/auth"
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getMereks = async () => {
    try {

        const response = await AxiosClient.get(`/api/gudang/merek`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createMerek = async (formData: FormData) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/merek`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getMerek = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/merek/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editMerek = async (id: number, formData: FormData) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/merek/${id}`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteMerek = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/merek/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



