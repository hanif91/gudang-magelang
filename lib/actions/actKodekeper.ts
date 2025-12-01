"use client"

// import { auth } from "@/auth"
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getAllKodekeper = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/kodekeper`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createKodekeper = async (data: any) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/kodekeper`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getKodekeper = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/kodekeper/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editKodekeper = async (id: number, data: any) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/kodekeper/${id}`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteKodekeper = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/kodekeper/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



