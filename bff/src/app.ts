import mongoose from 'mongoose'
import config from './utils/config'
import express from 'express'
import iotService from './utils/iotService'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { proxyOptions } from './utils/proxyOptions'
import morgan from 'morgan'
import deviceRouter from './controllers/deviceRouter'
import loginRouter from './controllers/login'
import { tokenExtractor, userExtractor } from './utils/middleware'
import { demoServerPinger } from './utils/demoServerPinger'

mongoose
  .connect(config.MONGODB_URI!)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.error('error connection to MongoDB', error.message)
  })

iotService
  .connect()
  .then(() => {
    console.log('connected to IOT Service')
  })
  .catch((error) => {
    console.error('error connection to IOT Service', error.message)
  })

const proxy = createProxyMiddleware(proxyOptions)

const app = express()
app.use(express.json())
app.use(express.static('build'))
app.use(morgan('combined'))
app.use(tokenExtractor)
app.use('/api/device', deviceRouter)
app.use('/api/login', loginRouter, userExtractor, demoServerPinger)
app.use('/api', userExtractor, proxy)
app.use('/', (req, res) => {
  res.redirect('/')
})

export default app
