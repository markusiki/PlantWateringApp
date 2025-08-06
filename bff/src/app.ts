import mongoose from 'mongoose'
import config from './utils/config'
import express from 'express'
import iotService from './utils/iotService'
import { createProxyMiddleware, Options } from 'http-proxy-middleware'
import morgan from 'morgan'
import deviceRouter from './controllers/deviceRouter'
import loginRouter from './controllers/login'
import { tokenExtractor, userExtractor } from './utils/middleware'
import axios from 'axios'
import { IncomingMessage } from 'http'

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

const pingDemoServer = async () => {
  console.log('pingDemoServer: ', config.PING_URI)
  const response = await axios.get(config.PING_URI!)
  console.log('pinged!')
  return response
}

const handleDemoProxy = async (proxyRes: IncomingMessage, req: any, res: any) => {
  req._proxyRetryCount = (req._proxyRetryCount || 0) + 1
  console.log('proxyres')
  console.log('status: ', proxyRes.statusCode)
  console.log(req.user.wormhole_url.includes('plant-api-demo-backend'))
  console.log('retries: ', req._proxyRetryCount)
  if (req._proxyRetryCount <= 3) {
    console.log('pinging...')
    const retryProxy = createProxyMiddleware(proxyOptions)
    try {
      const response = await pingDemoServer()
      console.log('response data: ', response.data)
      console.log('retrying proxy...')
      // wait for demo server to spin up
      setTimeout(() => {
        retryProxy(req, res)
      }, 3000)
    } catch (error) {
      console.log(error)
      res.status(502).send('Cannot connect to demo server')
    }
  }
}

const proxyOptions: Options = {
  changeOrigin: true,
  secure: true,
  router: (req: any) => {
    const target = `${req.user?.wormhole_url}/api`
    return target
  },
  on: {
    proxyReq: (proxyReq, req: any, res) => {
      console.log('proxyreq')
      if (req.body) {
        const bodyData = JSON.stringify(req.body)
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
        proxyReq.write(bodyData)
      }
    },
    proxyRes: async (proxyRes, req: any, res: any) => {
      if (proxyRes.statusCode !== 200 && req.user.wormhole_url.includes('plant-api-demo-backend')) {
        await handleDemoProxy(proxyRes, req, res)
      }

      console.log('setting headers')
      const proxyCookies = proxyRes.headers['set-cookie'] || []
      proxyRes.headers['set-cookie'] = [...proxyCookies, `bff_access_token=${req.token}; Path=/; HttpOnly`]
    },
  },
}

const proxy = createProxyMiddleware(proxyOptions)

const app = express()
app.use(express.json())
app.use(express.static('build'))
app.use(morgan('combined'))
app.use(tokenExtractor)
app.use('/api/device', deviceRouter)
app.use('/api/login', loginRouter)
app.use('/api', userExtractor, proxy)
app.use('/', (req, res) => {
  res.redirect('/')
})

export default app
