import { Response, NextFunction } from 'express'
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { CustomRequest, IUserForToken } from '../interfaces'
import config from './config'

export const tokenExtractor = (req: CustomRequest, res: Response, next: NextFunction) => {
  const cookies = req.headers.cookie?.split('; ')
  if (cookies) {
    for (const cookie of cookies) {
      if (cookie.startsWith('bff_access_token=')) {
        req.token = cookie.slice(17)
      }
    }
  }
  next()
}

export const userExtractor = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = jwt.verify(req.token!, config.SECRET!) as IUserForToken
    req.user = user
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ error: 'bff_access_token expired' })
    } else if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ error: 'bff_access_token missing or invalid' })
    }
  }
  next()
}
