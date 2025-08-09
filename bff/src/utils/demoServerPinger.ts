import { Response, NextFunction } from 'express'
import { CustomRequest } from '../interfaces'
import axios, { AxiosError } from 'axios'
import config from './config'

export const demoServerPinger = async (req: CustomRequest, res: Response, next: NextFunction) => {
  let attempt = 0
  let reDeployed = false
  const maxAttempts = reDeployed ? 20 : 2

  const tryDeploy = async () => {
    try {
      await axios.get(config.PING_URI!)
    } catch (error: any) {
      console.error('deploy failed ', error.response?.status)
    }
  }

  const tryPing = async () => {
    try {
      const response = await axios.get(`${req.user?.wormhole_url}/service/status`)

      if (response.status === 200) {
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
      if (!reDeployed) {
        attempt = 0

        await tryDeploy()
        reDeployed = true
        await tryPing()
      } else {
        res.status(502).json({ error: 'Demo server not responding' })
      }
    }
  }

  await tryPing()
}
