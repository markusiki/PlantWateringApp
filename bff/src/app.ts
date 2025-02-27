import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import mongoose from 'mongoose'
import morgan from 'morgan'
import config from './utils/config'
import deviceRegistrationRouter from './controllers/deviceRegistartionRouter'

const app = express()
app.use(express.json())

mongoose
  .connect(config.MONGODB_URI!)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.error('error connection to MongoDB', error.message)
  })

export let authToken: string

fetch(`${config.IOTSERVICE_URI}/auth/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(config.IOTSERVICE_CREDENTIALS),
})
  .then((response) => response.text())
  .then((text) => {
    const data = JSON.parse(text)
    authToken = data.token
    console.log(authToken)
  })
  .catch((error) => {
    console.error('error connection to IOTSERVICE', error)
  })

app.use(express.static('build'))
app.use(morgan('combined'))

// create the proxy
/** @type {import('http-proxy-middleware/dist/types').RequestHandler<express.Request, express.Response>} */
/* const proxy = createProxyMiddleware({
  target: process.env.API_SERVER_URI,
  changeOrigin: true,
  secure: false,
  pathFilter: '/api',
})

app.use('/', proxy) */
app.use('/api/register', deviceRegistrationRouter)
app.get('/*', async (req, res) => {
  res.redirect('/')
})

export default app
