import axios from "axios";
import { IDeviceSettingsState } from "../interfaces";
import serviceHelpers from './helpers'
const baseUrl = `/api/device`


const getAll = async () => {
  const response = await axios.get(baseUrl, serviceHelpers.getConfig())
  return response
}

const updateSettings = async (deviceSettings: IDeviceSettingsState) => {
  const response = await axios.put(baseUrl, deviceSettings, serviceHelpers.getConfig())
  return response
}

const deviceService = { getAll, updateSettings }

export default deviceService