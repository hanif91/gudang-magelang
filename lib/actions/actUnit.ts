"use server"

// import { auth } from "@/auth"
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getAllUnit = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/unit`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createUnit = async (formData: FormData) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/unit`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getUnit = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/unit/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editUnit = async (id: number, formData: FormData) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/unit/${id}`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteUnit = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/unit/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



