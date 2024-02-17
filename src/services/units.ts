import axios from "axios";
import { ISettingsProps } from "../interfaces";
const baseUrl = '/api/units'

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

const changeSettigs = async (newUnits: ISettingsProps, id: string) => {
  try {
    const request = axios.put(`${baseUrl}/${id}`, newUnits)
    const response = await request
    return response.data
  }
  catch (error) {
    console.log(error)
  }
}

const waterPlant = async (id: string) => {
  try {
    const request = axios.post(`${baseUrl}/${id}`)
    const response = await request
    return response.status
  }
  catch (error) {
    console.log(error)
  }
}


const unitServices = { getAll, changeSettigs, waterPlant }

export default unitServices
