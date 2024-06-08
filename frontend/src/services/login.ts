import axios from "axios";
import { ILoginCredentials } from "../interfaces";
const baseUrl = `/login`

export const getAccessCookie = () => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; csrf_access_token=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

const login = async (credentials: ILoginCredentials) => {
  const request = axios.post(baseUrl, credentials)
  const response = await request
  return response
}


const loginService = { login }

export default loginService