"use server";

// import { auth } from "@/auth"
import axios from "axios";
import { axiosErrorHandler } from "@/lib/errorHandler";
import { getCurrentSession, setSessionTokenCookie } from "../session";
import { cookies } from "next/headers";

const backendUrl = process.env.BASE_URL;

export const getAllBarangKeluar = async () => {
  try {
    const cookieStore = await cookies();

    const response = await axios.get(`${backendUrl}/api/barang-keluar`, {
      headers: { Cookie: cookieStore.toString() },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return axiosErrorHandler(error);
  }
};

export const createBarangKeluar = async (formData: FormData) => {
  try {
    const cookieStore = await cookies();
    // cookieStore.set("session", token || "" , {
    //   httpOnly: true,
    //   sameSite: "lax",
    //   secure: process.env.NODE_ENV === "production",
    //   path: "***/***"
    // });
    const response = await axios.post(
      `${backendUrl}/api/barang-keluar`,
      formData,
      {
        headers: { Cookie: cookieStore.toString() },
      }
    );
    return response.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const getBarangKeluar = async (id: string | null) => {
  try {
    const cookieStore = await cookies();
    const response = await axios.get(`${backendUrl}/api/barang-keluar/${id}`, {
      headers: { Cookie: cookieStore.toString() },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const updateStatus = async (id: number, formData: FormData) => {
  try {
    const cookieStore = await cookies();
    const response = await axios.put(
      `${backendUrl}/api/barang-keluar/${id}`,
      formData,
      {
        headers: { Cookie: cookieStore.toString() },
      }
    );
    return response.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const editKomentar = async (id: number, formData: FormData) => {
  try {
    const cookieStore = await cookies();
    const response = await axios.put(
      `${backendUrl}/api/barang-keluar/komentar/${id}`,
      formData,
      {
        headers: { Cookie: cookieStore.toString() },
      }
    );
    return response.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const deleteBarangKeluar = async (id: string | null) => {
  try {
    const cookieStore = await cookies();
    const response = await axios.delete(
      `${backendUrl}/api/barang-keluar/${id}`,
      {
        headers: { Cookie: cookieStore.toString() },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};


export const deleteBarangKeluarItem = async (id: string | null) => {
  try {
    const cookieStore = await cookies();
    const response = await axios.delete(
      `${backendUrl}/api/barang-keluar/barang/${id}`,
      {
        headers: { Cookie: cookieStore.toString() },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};
