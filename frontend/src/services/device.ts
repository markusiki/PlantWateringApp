import axios from "axios";
import { IDeviceSettingsState, IUserState } from "../interfaces";
const baseUrl = '/api/device'

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

const updateSettings = async (deviceSettings: IDeviceSettingsState) => {
  try {
    const config = {
      headers: { Authorization: token }
    }
    const request = axios.put(baseUrl, deviceSettings, config)
    const response = await request
    return response
  }
  catch (error) {
    console.log(error)
  }
}

const deviceService = { setToken, getAll, updateSettings }

export default deviceService