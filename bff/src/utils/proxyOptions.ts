import type { Options } from 'http-proxy-middleware'
import config from './config'

export const proxyOptions: Options = {
  changeOrigin: true,
  secure: true,
  router: (req: any) => {
    const target = process.env.NODE_ENV === 'development' ? config.DEV_WORMHOLE_URI : `${req.user?.wormhole_url}/api`
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
    proxyRes: async (proxyRes, req: any, res: any) => {
      const proxyCookies = proxyRes.headers['set-cookie'] || []
      if (req.path === '/login') {
        proxyRes.headers['set-cookie'] = [...proxyCookies, `bff_access_token=${req.token}; Path=/; HttpOnly`]
      }
      if (req.path === '/logout') {
        proxyRes.headers['set-cookie'] = [
          ...proxyCookies,
          `bff_access_token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly`,
        ]
      }
    },
  },
}
