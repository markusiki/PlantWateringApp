import axios from "axios";
import { IUnitToUpdate } from "../interfaces";
import serviceHelper from "./helpers";
const baseUrl = `/api/units`


const getAll = async () => {
  try {
    const response = await axios.get(baseUrl, serviceHelper.getConfig())
    return response
  }
  catch (error) {
    console.log(error)
  }
}

const changeSettings = async (unit: IUnitToUpdate) => {
  const response = await axios.put(baseUrl, unit, serviceHelper.getConfig())
  return response
}


const waterPlant = async (id: string) => {
  const response = await axios.post(`${baseUrl}/${id}`, "", serviceHelper.getConfig())
  return response
}


const deleteLogs = async (id: string) => {
  const response = await axios.delete(`${baseUrl}/logs/${id}`, serviceHelper.getConfig())
  return response

}


const unitServices = { getAll, changeSettings, waterPlant, deleteLogs }

export default unitServices
