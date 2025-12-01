"use client"

// import { auth } from "@/auth"
import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getUsersParaf = async () => {
    try {

        const response = await AxiosClient.get(`/api/gudang/user-paraf`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createUserParaf = async (data: any) => {
    try {
        const response = await AxiosClient.post(`/api/gudang/user-paraf`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getUserParaf = async (id: string | null) => {
    try {
        const response = await AxiosClient.get(`/api/gudang/user-paraf/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editUserParaf = async (id: number, data: any) => {
    try {
        const response = await AxiosClient.put(`/api/gudang/user-paraf/${id}`, data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteUserParaf = async (id: string | null) => {
    try {
        const response = await AxiosClient.delete(`/api/gudang/user-paraf/${id}`)
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



