"use server"

// import { auth } from "@/auth"
import axios from "axios"
import { axiosErrorHandler } from "@/lib/errorHandler"
import { getCurrentSession, setSessionTokenCookie } from "../session"
import { cookies } from "next/headers"

const backendUrl = process.env.BASE_URL

export const getAllStock = async () => {
    try {
        const response = await axios.get(`/api/stock`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createStock = async (formData: FormData) => {
    try {
        const cookieStore = await cookies();
        // cookieStore.set("session", token || "" , {
        //   httpOnly: true,
        //   sameSite: "lax",
        //   secure: process.env.NODE_ENV === "production",
        //   path: "***/***"
        // });
        const response = await axios.post(`${backendUrl}/api/stock`, formData, {
            headers: { Cookie: cookieStore.toString() }
        })
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getStock = async (id: string | null) => {
    try {
        const cookieStore = await cookies();
        const response = await axios.get(`${backendUrl}/api/stock/${id}`, {
            headers: { Cookie: cookieStore.toString() },
        })
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editStock = async (id: number, formData: FormData) => {
    try {
        const cookieStore = await cookies();
        const response = await axios.put(`${backendUrl}/api/stock/${id}`, formData, {
            headers: { Cookie: cookieStore.toString() }
        })
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteStock = async (id: string | null) => {
    try {
        const cookieStore = await cookies();
        const response = await axios.delete(`${backendUrl}/api/stock/${id}`, {
            headers: { Cookie: cookieStore.toString() },
        })
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



