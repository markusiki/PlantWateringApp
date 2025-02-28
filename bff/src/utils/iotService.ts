import config from './config'
import axios from 'axios'

let authToken = ''

const connect = async () => {
  const response = await axios.post(`${config.IOTSERVICE_URI}/auth/`, config.IOTSERVICE_CREDENTIALS)
  if (response.status !== 201) {
    throw new Error('error connecting to IOTService')
  }
  authToken = response.data.token
  return
}

export default {
  authToken,
  connect,
}
