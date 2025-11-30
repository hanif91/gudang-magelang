"use server"

// import { auth } from "@/auth"
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getAllSupplier = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/supplier`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createSupplier = async (formData: FormData) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/supplier`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getSupplier = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/supplier/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editSupplier = async (id: number, formData: FormData) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/supplier/${id}`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteSupplier = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/supplier/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



