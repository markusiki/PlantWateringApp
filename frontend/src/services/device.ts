import axios from "axios";
import { IDeviceSettingsState } from "../interfaces";
import { getAccessCookie } from './login'
const baseUrl = '/api/device'

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

const updateSettings = async (deviceSettings: IDeviceSettingsState) => {
  try {

    const request = axios.put(baseUrl, deviceSettings, getConfig())
    const response = await request
    return response
  }
  catch (error) {
    console.log(error)
  }
}

const deviceService = { getAll, updateSettings }

export default deviceService