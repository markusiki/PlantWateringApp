import axios from "axios";
import { IUnitToUpdate, IUserState } from "../interfaces";
import { getAccessCookie } from "./login";
const baseUrl = '/api/units'

const getConfig = () => {
  return {
    headers: { 'X-CSRF-TOKEN': getAccessCookie() }
  }
}

const getAll = async () => {
  try {
    const request = axios.get(baseUrl, getConfig())
    const response = await request
    return response
  }
  catch (error) {
    console.log(error)
  }
}

const changeSettings = async (unit: IUnitToUpdate) => {
  try {
    const request = await axios.put(baseUrl, unit, getConfig())
    const response = request
    return response
  }
  catch (error) {
    console.log(error)
  }
}

const waterPlant = async (id: string) => {
  try {
    const request = axios.post(`${baseUrl}/${id}`, "", getConfig())
    const response = await request
    return response
  }
  catch (error) {
    console.log(error)
  }
}

const deleteLogs = async (id: string) => {
  try {
    const response = await axios.delete(`${baseUrl}/logs/${id}`, getConfig())
    return response
  }
  catch (error) {
    console.log(error)
  }
}


const unitServices = { getAll, changeSettings, waterPlant, deleteLogs }

export default unitServices
