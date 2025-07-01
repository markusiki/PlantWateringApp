import dotenv from 'dotenv'

dotenv.config()

const PORT = 4000
const MONGODB_URI = process.env.MONGODB_URI
const IOTSERVICE_URI = process.env.IOTSERVICE_URI
const IOTSERVICE_CREDENTIALS = {
  email: process.env.IOTSERVICE_EMAIL,
  password: process.env.IOTSERVICE_PASSWORD,
}
const SECRET = process.env.SECRET

export default {
  PORT,
  MONGODB_URI,
  IOTSERVICE_URI,
  IOTSERVICE_CREDENTIALS,
  SECRET,
}
