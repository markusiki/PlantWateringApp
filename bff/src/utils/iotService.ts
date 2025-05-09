import config from './config'
import axios from 'axios'

let authToken: string | undefined

const connect = async () => {
  const response = await axios.post(`${config.IOTSERVICE_URI}/auth/`, config.IOTSERVICE_CREDENTIALS)
  if (response.status !== 201) {
    throw new Error('error connecting to IOTService')
  }
  authToken = response.data.token
  return
}

const openWormhole = async (rpi_serial: string, serial: string) => {
  const requestBody = {
    name: rpi_serial,
    wormhole_enabled: true,
  }

  const auth = {
    headers: {
      Authorization: `Token ${authToken}`,
    },
  }

  const response = await axios.put(`${config.IOTSERVICE_URI}/devices/${serial}/`, requestBody, auth)

  return await response.data
}

export default {
  connect,
  openWormhole,
}
