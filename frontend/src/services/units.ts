import axios from "axios";
import { IUnitToUpdate } from "../interfaces";
import { getAccessCookie } from "./login";
const baseUrl = `/api/units`

const getConfig = () => {
  return {
    headers: { 'X-CSRF-TOKEN': getAccessCookie() }
  }
}

const getAll = async () => {
  try {
    const response = await axios.get(baseUrl, getConfig())
    return response
  }
  catch (error) {
    console.log(error)
  }
}

const changeSettings = async (unit: IUnitToUpdate) => {
  const response = await axios.put(baseUrl, unit, getConfig())
  return response
}


const waterPlant = async (id: string) => {
  const response = await axios.post(`${baseUrl}/${id}`, "", getConfig())
  return response
}


const deleteLogs = async (id: string) => {
  const response = await axios.delete(`${baseUrl}/logs/${id}`, getConfig())
  return response

}


const unitServices = { getAll, changeSettings, waterPlant, deleteLogs }

export default unitServices
