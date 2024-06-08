import axios from "axios";
import { IDeviceSettingsState } from "../interfaces";
import { getAccessCookie } from './login'
const baseUrl = `/api/device`

const getConfig = () => {
  return {
    headers: { 'X-CSRF-TOKEN': getAccessCookie() }
  }
}

const getAll = async () => {
  const response = await axios.get(baseUrl, getConfig())
  return response
}

const updateSettings = async (deviceSettings: IDeviceSettingsState) => {
  const response = await axios.put(baseUrl, deviceSettings, getConfig())
  return response
}

const deviceService = { getAll, updateSettings }

export default deviceService