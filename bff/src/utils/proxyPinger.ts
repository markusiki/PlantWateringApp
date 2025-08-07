import { Response, NextFunction } from 'express'
import { CustomRequest } from '../interfaces'
import axios from 'axios'
import config from './config'

export const proxyPinger = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const maxAttempts = 30
  let attempt = 0
  let reDeployed = false

  const tryDeploy = async () => {
    try {
      const response = await axios.get(config.PING_URI!)

      if (response.status === 200) {
        console.log('deploy complete')
      }
    } catch (error) {
      console.error('deploy failed')
    }
  }

  const tryPing = async () => {
    try {
      const response = await axios.get(`${req.user?.wormhole_url}/service/status`)
      console.log(`Attempt ${attempt + 1}:`, response.status)

      if (response.status === 200) {
        console.log('stop pinging')
        next()
        return
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error)
    }

    attempt++
    if (attempt < maxAttempts) {
      setTimeout(tryPing, 2000) // wait 2 second before next attempt
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
