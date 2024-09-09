import axios from "axios";
import { ILoginCredentials } from "../interfaces";
const baseUrl = `/api`


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