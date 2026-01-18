"use client"

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


export const createPembelianItem = async (data: any) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/pembelian-item`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const createPembelianOp = async (data: any) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/pembelian-item`, data)
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


export const editPembelianItem = async (id: number, data: any) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/pembelian-item/${id}`, data)
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



export const getOpDetail = async (noop: string) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/pembelian-item/op/${encodeURIComponent(noop)}`)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const updateOp = async (noop: string, data: any) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/pembelian-item/op/update/${encodeURIComponent(noop)}`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}
