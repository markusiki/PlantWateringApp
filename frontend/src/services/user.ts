import axios from "axios";
import { ILoginCredentials } from "../interfaces";
const baseUrl = `/api`

export const getAccessCookie = () => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; csrf_access_token=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

const login = async (credentials: ILoginCredentials) => {
  const response = await axios.post(`${baseUrl}/login`, credentials)
  return response
}

const logout = async () => {
  const response = await axios.post(`${baseUrl}/logout`)
  return response
}


const userService = { login, logout }

export default userService