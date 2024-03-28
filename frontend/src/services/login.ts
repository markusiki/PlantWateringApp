import axios from "axios";
import { ILoginCredentials } from "../interfaces";
const baseUrl = '/login'

const login = async (credentials: ILoginCredentials) => {
  try {
    const request = axios.post(baseUrl, credentials)
    const response = await request
    return response
  }
  catch (error) {
    console.log(error)
  }
}


const loginService = { login }

export default loginService