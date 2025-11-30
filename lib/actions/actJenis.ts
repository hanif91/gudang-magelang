"use server"

// import { auth } from "@/auth"
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getAllJenis = async () => {
    console.log("testt")
    try {
        const response = await AxiosClient.get(`/api/gudang/jenis`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createJenis = async (formData: FormData) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/jenis`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getJenis = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/jenis/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editJenis = async (id: number, formData: FormData) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/jenis/${id}`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteJenis = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/jenis/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



