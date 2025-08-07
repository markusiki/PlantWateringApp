import { Response, NextFunction } from 'express'
import { CustomRequest } from '../interfaces'
import axios from 'axios'
import config from './config'

export const proxyStatusChecker = async (req: CustomRequest, res: Response, next: NextFunction) => {
  if (!req.user?.wormhole_url.includes('plant-api-demo-backend')) {
    next()
  }
  try {
    const response = await axios.get(req.user?.wormhole_url!)
    console.log('status: ', response.status)
    if (response.status !== 200) {
      await axios.get(config.PING_URI!)
      setTimeout(() => {
        console.log('next')
        next()
      }, 10000)
    }
  } catch (error) {
    console.error('cant ping demo server')
  }

  next()
}
