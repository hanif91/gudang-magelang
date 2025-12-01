"use client"

import axios from "axios";
import Cookies from "js-cookie";

export function asErrorMessage(e: any): string {
    console.log(e);
    return e?.response?.data?.message ?? e?.message ?? "Unknown error";
}

const axiosClient = axios.create({

    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 15000,
});

axiosClient.interceptors.request.use(async (config) => {
    const token = Cookies.get('token_gudang');
    console.log("TOKEN ", token)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// axiosClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         console.log(error);
//         if (error.response?.status === 401) {
//             Cookies.remove('token_gudang');
//             const portalUrl = process.env.NEXT_PUBLIC_PORTAL_BASE_URL;
//             if (portalUrl) {
//                 window.location.href = portalUrl;
//             } else {
//                 window.location.href = "/login"; // Fallback
//             }
//         }
//         return Promise.reject(error);
//     },
// );

export default axiosClient;
