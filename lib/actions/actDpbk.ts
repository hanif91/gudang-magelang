"use client";
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "../errorHandler"

export const getAllDpbk = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/dpbk`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const createDpbk = async (data: any) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/dpbk`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getDpbk = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/dpbk/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editDpbk = async (id: number, data: any) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/dpbk/${id}`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteDpbk = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/dpbk/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}
