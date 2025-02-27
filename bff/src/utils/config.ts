import dotenv from 'dotenv'

dotenv.config()

const PORT = 5000
const MONGODB_URI = process.env.MONGODB_URI
const IOTSERVICE_URI = process.env.IOTSERVICE_URI
const IOTSERVICE_CREDENTIALS = {
  email: process.env.IOTSERVICE_EMAIL,
  password: process.env.IOTSERVICE_PASSWORD,
}
const email = process.env.IOTSERVICE_EMAIL
const password = process.env.IOTSERVICE_PASSWORD

export default {
  PORT,
  MONGODB_URI,
  IOTSERVICE_URI,
  IOTSERVICE_CREDENTIALS,
}
