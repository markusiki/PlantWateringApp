import axios from "axios";
import { IDeviceSettingsState } from "../interfaces";
const baseUrl = '/api/device'

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

const updateSettings = async (deviceSettings: IDeviceSettingsState) => {
  try {
    const request = axios.put(baseUrl, deviceSettings)
    const response = await request
    return response.data
  }
  catch (error) {
    console.log(error)
  }
}

const deviceService = { getAll, updateSettings }

export default deviceService