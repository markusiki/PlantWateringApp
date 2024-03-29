import axios from "axios";
import { IUnitToUpdate, IUserState } from "../interfaces";
const baseUrl = '/api/units'

let token: IUserState["token"] = null

const setToken = (newtoken: string) => {
  token = `Bearer ${newtoken}`
}


const getAll = async () => {
  try {
    const request = axios.get(baseUrl)
    const response = await request
    return response
  }
  catch (error) {
    console.log(error)
  }
}

const changeSettings = async (unit: IUnitToUpdate) => {
  try {
    const config = {
      headers: { Authorization: token }
    }
    const request = await axios.put(baseUrl, unit, config)
    const response = request
    return response
  }
  catch (error) {
    console.log(error)
  }
}

const waterPlant = async (id: string) => {
  try {
    const request = axios.post(`${baseUrl}/${id}`)
    const response = await request
    return response
  }
  catch (error) {
    console.log(error)
  }
}

const deleteLogs = async (id: string) => {
  try {
    const response = await axios.delete(`${baseUrl}/logs/${id}`)
    return response
  }
  catch (error) {
    console.log(error)
  }
}


const unitServices = {setToken, getAll, changeSettings, waterPlant, deleteLogs }

export default unitServices
