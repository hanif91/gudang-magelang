"use server"

// import { auth } from "@/auth"
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getAllJenisBk = async () => {
    try {
        const response = await AxiosClient.get(`/api/gudang/jenis-bk`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createJenisBk = async (formData: FormData) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/jenis-bk`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getJenisBk = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/jenis-bk/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editJenisBk = async (id: number, formData: FormData) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/jenis-bk/${id}`, formData)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteJenisBk = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/jenis-bk/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



