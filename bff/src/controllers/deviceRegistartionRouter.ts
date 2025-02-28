import express from 'express'
import User from '../models/user'
import config from '../utils/config'
import iotService from '../utils/iotService'
import { IUser } from '../interfaces'
import axios from 'axios'
import { HydratedDocument } from 'mongoose'

const deviceRegistrationRouter = express.Router()

deviceRegistrationRouter.post('/', async (req, res) => {
  const { username, pwhash, serial, rpi_serial } = req.body

  const usernameExists = await User.exists({ username: username })
  if (usernameExists) {
    res.status(400).json({ error: 'Username already exists' })
    return
  }
  const rpiRegistered = await User.exists({ devices: { serial: serial } })
  if (rpiRegistered) {
    res.status(400).json({ error: 'Device already registered to user' })
    return
  }

  const requestBody = {
    name: rpi_serial,
    wormhole_enabled: true,
  }

  const auth = {
    headers: {
      Authorization: `Token ${iotService.authToken}`,
    },
  }

  const response = await axios.put(`${config.IOTSERVICE_URI}/devices/${serial}/`, requestBody, auth)

  const data = await response.data

  const user: HydratedDocument<IUser> = new User({
    username: username,
    pwhash: pwhash,
    devices: {
      serial: serial,
      wormhole_slug: data.wormhole_slug,
    },
  })

  await user.save()

  res.status(201).send()
})

export default deviceRegistrationRouter
