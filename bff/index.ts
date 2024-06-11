import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import dotenv from 'dotenv'
import morgan from 'morgan'

dotenv.config()

const app = express()

app.use(express.static('build'))
app.use(morgan('combined'))

// create the proxy
/** @type {import('http-proxy-middleware/dist/types').RequestHandler<express.Request, express.Response>} */
const proxy = createProxyMiddleware({
  target: process.env.API_SERVER_URI, 
  changeOrigin: true,
  pathFilter: '/api'
})



app.use('/', proxy);
app.get('/*', async (req, res) => {
  res.redirect('/')
} )
app.listen(3000, () => {
  console.log(`Server is running on port 3000.`)
})