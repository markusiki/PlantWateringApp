import dotenv from 'dotenv'

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

const PORT = 4000
const MONGODB_URI = process.env.MONGODB_URI
const IOTSERVICE_URI = process.env.IOTSERVICE_URI
const IOTSERVICE_CREDENTIALS = {
  email: process.env.IOTSERVICE_EMAIL,
  password: process.env.IOTSERVICE_PASSWORD,
}
const SECRET = process.env.SECRET
const PING_URI = process.env.PING_URI
const DEV_WORMHOLE_URI = process.env.DEV_WORMHOLE_URI

export default {
  PORT,
  MONGODB_URI,
  IOTSERVICE_URI,
  IOTSERVICE_CREDENTIALS,
  SECRET,
  PING_URI,
  DEV_WORMHOLE_URI,
}
