import axios from "axios";
import { IUnitToUpdate } from "../interfaces";
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

const changeSettigs = async (unit: IUnitToUpdate) => {
  try {
    const request = await axios.put(baseUrl, unit)
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


const unitServices = { getAll, changeSettigs, waterPlant }

export default unitServices
