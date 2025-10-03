"use server"

// import { auth } from "@/auth"
import axios from "axios"
import { axiosErrorHandler } from "@/lib/errorHandler"
import { getCurrentSession, setSessionTokenCookie } from "../session"
import { cookies } from "next/headers"

const backendUrl = process.env.BASE_URL

export const getAllPembelian = async () => {
    try {
        const response = await axios.get(`/api/pembelian`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createPembelian = async (formData: FormData) => {
    try {
        const cookieStore = await cookies();
        // cookieStore.set("session", token || "" , {
        //   httpOnly: true,
        //   sameSite: "lax",
        //   secure: process.env.NODE_ENV === "production",
        //   path: "***/***"
        // });
        const response = await axios.post(`${backendUrl}/api/pembelian`, formData, {
            headers: { Cookie: cookieStore.toString() }
        })
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getPembelian = async (id: string | null) => {
    try {
        const cookieStore = await cookies();
        const response = await axios.get(`${backendUrl}/api/pembelian/${id}`, {
            headers: { Cookie: cookieStore.toString() },
        })
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editPembelian = async (id: number, formData: FormData) => {
    try {
        const cookieStore = await cookies();
        const response = await axios.put(`${backendUrl}/api/pembelian/${id}`, formData, {
            headers: { Cookie: cookieStore.toString() }
        })
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deletePembelian = async (id: string | null) => {
    try {
        const cookieStore = await cookies();
        const response = await axios.delete(`${backendUrl}/api/pembelian/${id}`, {
            headers: { Cookie: cookieStore.toString() },
        })
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



