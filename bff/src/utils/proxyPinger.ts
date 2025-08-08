import { Response, NextFunction } from 'express'
import { CustomRequest } from '../interfaces'
import axios, { AxiosError } from 'axios'
import config from './config'

export const proxyPinger = async (req: CustomRequest, res: Response, next: NextFunction) => {
  let attempt = 0
  let reDeployed = false
  const maxAttempts = reDeployed ? 20 : 2

  const tryDeploy = async () => {
    try {
      const response = await axios.get(config.PING_URI!)

      if (response.status === 200) {
        console.log('deploy complete')
      }
    } catch (error: any) {
      console.error('deploy failed ', error.response?.status)
    }
  }

  const tryPing = async () => {
    try {
      const response = await axios.get(`${req.user?.wormhole_url}/service/status/not`)
      console.log(`Attempt ${attempt + 1} succeeded`)

      if (response.status === 200) {
        console.log('stop pinging')
        next()
        return
      }
    } catch (error: any) {
      console.error(`Ping attempt ${attempt + 1} failed: `, error.response.status)
    }

    attempt++
    const maxAttempts = reDeployed ? 20 : 2
    if (attempt < maxAttempts) {
      setTimeout(tryPing, 3000) // wait 2 second before next attempt
    } else {
      console.log('Max attempts reached')
      if (!reDeployed) {
        attempt = 0
        console.log('reDeployed: ', reDeployed)
        console.log('pingign deploy')
        await tryDeploy()
        reDeployed = true
        await tryPing()
      } else {
        console.log('reDeployed: ', reDeployed)
        res.status(502).json({ error: 'Demo server not responding' })
      }
    }
  }

  await tryPing()
}
