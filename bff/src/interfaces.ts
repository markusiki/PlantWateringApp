import { Request } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { Types } from 'mongoose'

export interface IUser {
  username: string
  pwhash: string
  devices: {
    serial: string
    wormhole_slug: string
  }
}

export interface IUserForToken {
  id: Types.ObjectId
  username: string
  wormhole_slug: string
}

export interface CustomRequest extends Request {
  token?: string
  user?: IUserForToken
  access_token?: string | undefined
}
