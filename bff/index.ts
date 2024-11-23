import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import dotenv from 'dotenv'
import morgan from 'morgan'


dotenv.config()

const PORT = process.env.PORT || 4000

const app = express()

app.use(express.static('build'))
app.use(morgan('combined'))

// create the proxy
/** @type {import('http-proxy-middleware/dist/types').RequestHandler<express.Request, express.Response>} */
const proxy = createProxyMiddleware({
  target: process.env.API_SERVER_URI,
  changeOrigin: true,
  secure: false,
  pathFilter: '/api'
})



app.use('/', proxy);
app.get('/*', async (req, res) => {
  res.redirect('/')
} )
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
})