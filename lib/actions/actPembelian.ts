"use client"

// import { auth } from "@/auth"
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getAllPembelian = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/pembelian`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createPembelian = async (data: any) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/pembelian`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getPembelian = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/pembelian/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editPembelian = async (id: number, data: any) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/pembelian/${id}`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deletePembelian = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/pembelian/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



