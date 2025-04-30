import express from 'express'
import User from '../models/user'
import iotService from '../utils/iotService'
import { IRegisterBody, IUser } from '../interfaces'
import { HydratedDocument } from 'mongoose'

const deviceRegistrationRouter = express.Router()

deviceRegistrationRouter.post('/', async (req, res) => {
  const { username, pwhash, serial, rpi_serial }: IRegisterBody = req.body

  const usernameExists = await User.exists({ username: username })
  if (usernameExists) {
    res.status(400).json({ error: 'Username already exists' })
    return
  }
  const rpiRegistered = await User.exists({ 'devices.serial': serial })
  if (rpiRegistered) {
    res.status(400).json({ error: 'Device already registered to user' })
    return
  }

  const response = await iotService.openWormhole(rpi_serial, serial)

  const user: HydratedDocument<IUser> = new User({
    username: username,
    pwhash: pwhash,
    devices: {
      serial: serial,
      wormhole_slug: response.wormhole_slug,
    },
  })

  await user.save()

  res.status(201).json({ message: 'Device registered successfully' })
})

export default deviceRegistrationRouter
