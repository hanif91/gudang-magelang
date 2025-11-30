"use server"

// import { auth } from "@/auth"
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getKateogories = async () => {
    try {

        const response = await AxiosClient.get(`/api/gudang/kategori`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createKategori = async (formData: FormData) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/kategori`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getKategori = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/kategori/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editKategori = async (id: number, formData: FormData) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/kategori/${id}`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteKategori = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/kategori/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



