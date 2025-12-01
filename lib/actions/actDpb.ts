"use client";
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "../errorHandler"

export const getAllDpb = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/dpb`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const createDpb = async (data: any) => {
    try {
        console.log("INT")
        const response = await AxiosClient.post(`/api/gudang/dpb`, data)
        return response.data
    } catch (error) {
        console.error(error)
        return axiosErrorHandler(error)
    }
}

export const getDpb = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/dpb/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editDpb = async (id: number, data: any) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/dpb/${id}`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteDpb = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/dpb/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}
