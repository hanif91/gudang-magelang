"use server"

import AxiosClient from "@/lib/AxiosClient"
import { axiosErrorHandler } from "@/lib/errorHandler"

export const getUsers = async () => {
  try {

    const response = await AxiosClient.get(`/api/gudang/users`)
    return response.data
  } catch (error) {
    console.log(error)
    return axiosErrorHandler(error)
  }
}

export const createUser = async (formData: FormData) => {
  try {
    const response = await AxiosClient.post(`/api/gudang/users`, formData)
    return response.data
  } catch (error) {
    return axiosErrorHandler(error)
  }
}

export const getUser = async (id: string | null) => {
  try {
    const response = await AxiosClient.get(`/api/gudang/users/${id}`)
    console.log(response.data)
    return response.data
  } catch (error) {
    return axiosErrorHandler(error)
  }
}

export const editUser = async (id: number, formData: FormData) => {
  try {
    const response = await AxiosClient.put(`/api/gudang/users/${id}`, formData)
    return response.data
  } catch (error) {
    return axiosErrorHandler(error)
  }
}

export const deleteUser = async (id: string) => {
  try {
    // const session = await auth()
    // const response = await axios.delete(`${backendUrl}/users/${id}`, {
    //   headers: {
    //     Authorization: `Bearer ${session?.user.userToken}`,
    //   },
    // })
    // return response.data
  } catch (error) {
    return axiosErrorHandler(error)
  }
}