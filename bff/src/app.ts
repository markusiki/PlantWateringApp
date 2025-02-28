import mongoose from 'mongoose'
import config from './utils/config'
import express from 'express'
import { createProxyMiddleware, Options } from 'http-proxy-middleware'
import morgan from 'morgan'
import deviceRegistrationRouter from './controllers/deviceRegistartionRouter'
import loginRouter from './controllers/login'
import { tokenExtractor, userExtractor } from './utils/middleware'

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
    console.log('token fetched')
  })
  .catch((error) => {
    console.error('error connection to IOTSERVICE', error)
  })

const proxyOptions: Options = {
  changeOrigin: true,
  secure: false,
  router: (req: any) => {
    const target = config.getTargetURI(req.user?.wormhole_slug!)
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
  },
}

const proxy = createProxyMiddleware(proxyOptions)

const app = express()
app.use(express.json())
app.use(express.static('build'))
app.use(morgan('combined'))
app.use(tokenExtractor)
app.use('/api/register', deviceRegistrationRouter)
app.use('/api/login', loginRouter)
app.use('/', userExtractor, proxy)

export default app
