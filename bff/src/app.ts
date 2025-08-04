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

const pingDemoServer = async (url: string) => {
  try {
    await axios.get(url)
  } catch (error) {}
}

const proxyOptions: Options = {
  changeOrigin: true,
  secure: true,
  router: (req: any) => {
    const target = `${req.user?.wormhole_url}/api`
    pingDemoServer(req.user?.wormhole_url)

    return target
  },
  on: {
    proxyReq: (proxyReq, req: any, res) => {
      if (req.body) {
        const bodyData = JSON.stringify(req.body)
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
        proxyReq.write(bodyData)
      }
    },
    proxyRes: (proxyRes, req: any, res: any) => {
      const proxyCookies = proxyRes.headers['set-cookie'] || []
      proxyRes.headers['set-cookie'] = [...proxyCookies, `bff_access_token=${req.token}; Path=/; HttpOnly`]
    },
    error: async (err, req: any, res: any, target) => {
      req._proxyRetryCount = (req._proxyRetryCount || 0) + 1

      if (req._proxyRetryCount <= 3 && target?.toString().includes('plant-api-demo-backend')) {
        req._proxyRetried = await pingDemoServer(req.user?.wormhole_url)
        const retryProxy = createProxyMiddleware(proxyOptions)
        retryProxy(req, res, () => {
          res.status(502).send('Cannot connect to demo server')
        })
      } else {
        res.status(502).send()
      }
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
