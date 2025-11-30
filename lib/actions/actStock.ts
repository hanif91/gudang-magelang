"use server"

// import { auth } from "@/auth"
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getAllStock = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/stock`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createStock = async (formData: FormData) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/stock`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getStock = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/stock/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editStock = async (id: number, formData: FormData) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/stock/${id}`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteStock = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/stock/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



