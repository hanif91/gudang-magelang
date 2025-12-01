"use client"

// import { auth } from "@/auth"
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getAllPaket = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/paket`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createPaket = async (data: any) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/paket`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getPaket = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/paket/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editPaket = async (id: number, data: any) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/paket/${id}`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deletePaket = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/paket/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



