"use server"

// import { auth } from "@/auth"
import axios from "axios"
import { axiosErrorHandler } from "@/lib/errorHandler"
import { getCurrentSession, setSessionTokenCookie } from "../session"
import { cookies } from "next/headers"

const backendUrl = process.env.BASE_URL

export const getMereks = async () => {
    try {

        const response = await axios.get(`/api/merek`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createMerek = async (formData: FormData) => {
    try {
        const cookieStore = await cookies();
        // cookieStore.set("session", token || "" , {
        //   httpOnly: true,
        //   sameSite: "lax",
        //   secure: process.env.NODE_ENV === "production",
        //   path: "***/***"
        // });
        const response = await axios.post(`${backendUrl}/api/merek`, formData, {
            headers: { Cookie: cookieStore.toString() }
        })
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getMerek = async (id: string | null) => {
    try {
        const cookieStore = await cookies();
        const response = await axios.get(`${backendUrl}/api/merek/${id}`, {
            headers: { Cookie: cookieStore.toString() },
        })
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editMerek = async (id: number, formData: FormData) => {
    try {
        const cookieStore = await cookies();
        const response = await axios.put(`${backendUrl}/api/merek/${id}`, formData, {
            headers: { Cookie: cookieStore.toString() }
        })
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteMerek = async (id: string | null) => {
    try {
        const cookieStore = await cookies();
        const response = await axios.delete(`${backendUrl}/api/merek/${id}`, {
            headers: { Cookie: cookieStore.toString() },
        })
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



