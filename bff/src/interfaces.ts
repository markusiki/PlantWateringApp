import { Request } from 'express'
import { Types } from 'mongoose'

export interface IUser {
  username: string
  pwhash: string
  devices: {
    serial: string
    wormhole_url: string
  }
}

export interface IUserForToken {
  id: Types.ObjectId
  username: string
  wormhole_url: string
}

export interface CustomRequest extends Request {
  token?: string
  user?: IUserForToken
  access_token?: string | undefined
}

export interface IRegisterBody {
  username: string
  pwhash: string
  serial: string
  rpi_serial: string
}

export interface IChangeUserBody {
  oldUsername: string
  newUsername: string
  oldPassword: string
  pwhash: string
  serial: string
}
