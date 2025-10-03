"use server"

// import { auth } from "@/auth"
import axios from "axios"
import { axiosErrorHandler } from "@/lib/errorHandler"
import { getCurrentSession, setSessionTokenCookie } from "../session"
import { cookies } from "next/headers"

const backendUrl = process.env.BASE_URL

export const getUsersParaf = async () => {
    try {

        const response = await axios.get(`/api/user-paraf`)
        return response.data
    } catch (error) {
        console.log(error)
        return axiosErrorHandler(error)
    }
}


export const createUserParaf = async (formData: FormData) => {
    try {
        const cookieStore = await cookies();
        // cookieStore.set("session", token || "" , {
        //   httpOnly: true,
        //   sameSite: "lax",
        //   secure: process.env.NODE_ENV === "production",
        //   path: "***/***"
        // });
        const response = await axios.post(`${backendUrl}/api/user-paraf`, formData, {
            headers: { Cookie: cookieStore.toString() }
        })
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getUserParaf = async (id: string | null) => {
    try {
        const cookieStore = await cookies();
        const response = await axios.get(`${backendUrl}/api/user-paraf/${id}`, {
            headers: { Cookie: cookieStore.toString() },
        })
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editUserParaf = async (id: number, formData: FormData) => {
    try {
        const cookieStore = await cookies();
        const response = await axios.put(`${backendUrl}/api/user-paraf/${id}`, formData, {
            headers: { Cookie: cookieStore.toString() }
        })
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteUserParaf = async (id: string | null) => {
    try {
        const cookieStore = await cookies();
        const response = await axios.delete(`${backendUrl}/api/user-paraf/${id}`, {
            headers: { Cookie: cookieStore.toString() },
        })
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}



