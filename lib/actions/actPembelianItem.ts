"use server"

// import { auth } from "@/auth"
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getAllPembelianItenm = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/pembelian-item`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createPembelianItem = async (formData: FormData) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/pembelian-item`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getPembelianItem = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/pembelian-item/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editPembelianItem = async (id: number, formData: FormData) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/pembelian-item/${id}`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deletePembelianItem = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/pembelian-item/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



