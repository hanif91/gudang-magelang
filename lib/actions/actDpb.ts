"use server";
import axios from "axios"
import { axiosErrorHandler } from "../errorHandler"
import { cookies } from "next/headers";

const backendUrl = process.env.BASE_URL

export const getAllDpb = async () => {
    try {
        const cookieStore = await cookies();
        const response = await axios.get(`/api/dpb`, {
            headers: { Cookie: cookieStore.toString() },
        })
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const createDpb = async (formData: FormData) => {
    try {
        const cookieStore = await cookies();
        // cookieStore.set("session", token || "" , {
        //   httpOnly: true,
        //   sameSite: "lax",
        //   secure: process.env.NODE_ENV === "production",
        //   path: "***/***"
        // });
        const response = await axios.post(`${backendUrl}/api/dpb`, formData, {
            headers: { Cookie: cookieStore.toString() }
        })
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const getDpb = async (id: string | null) => {
    try {
        const cookieStore = await cookies();
        const response = await axios.get(`${backendUrl}/api/dpb/${id}`, {
            headers: { Cookie: cookieStore.toString() },
        })
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}


export const editDpb = async (id: number, formData: FormData) => {
    try {
        const cookieStore = await cookies();
        const response = await axios.put(`${backendUrl}/api/dpb/${id}`, formData, {
            headers: { Cookie: cookieStore.toString() }
        })
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}

export const deleteDpb = async (id: string | null) => {
    try {
        const cookieStore = await cookies();
        const response = await axios.delete(`${backendUrl}/api/dpb/${id}`, {
            headers: { Cookie: cookieStore.toString() },
        })
        console.log(response.data)
        return response.data
    } catch (error) {
        return axiosErrorHandler(error)
    }
}
