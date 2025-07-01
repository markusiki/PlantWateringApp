import express from 'express'
import User from '../models/user'
import iotService from '../utils/iotService'
import { IChangeUserBody, IRegisterBody, IUser } from '../interfaces'
import bcrypt from 'bcrypt'
import { HydratedDocument } from 'mongoose'

const deviceRouter = express.Router()

deviceRouter.post('/register', async (req, res) => {
  try {
    const { username, pwhash, serial, rpi_serial }: IRegisterBody = req.body

    if (username.length < 7) {
      res.status(400).json({ error: 'Username must be longer than 6 characters' })
      return
    }

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

    const serialHash = await bcrypt.hash(serial, 10)

    const user: HydratedDocument<IUser> = new User({
      username: username,
      pwhash: pwhash,
      devices: {
        serial: serialHash,
        wormhole_url: response.wormhole_url,
      },
    })

    await user.save()

    res.status(201).json({ message: 'Device registered successfully' })
  } catch (error) {
    res.status(500).json({ error: error })
  }
})

deviceRouter.post('/change-user', async (req, res) => {
  try {
    const { oldUsername, oldPassword, newUsername, pwhash, serial }: IChangeUserBody = req.body

    if (newUsername.length < 7) {
      res.status(400).json({ error: 'Username must be longer than 6 characters' })
      return
    }

    const user = await User.findOne({ username: oldUsername })
    const serialMatch = user === null ? false : await bcrypt.compare(serial, user.devices.serial)
    const passwordMatch = user == null ? false : await bcrypt.compare(oldPassword, user.pwhash)
    if (!(user && serialMatch && passwordMatch)) {
      res.status(401).json({ error: 'Username, old password or device serial does not match.' })
      return
    }
    const usernameChanged = oldUsername === newUsername ? false : true
    const usernameNotValid = !usernameChanged ? false : await User.exists({ username: newUsername })
    if (usernameNotValid) {
      res.status(400).json({ error: 'Username already exists' })
      return
    }

    user.username = newUsername
    user.pwhash = pwhash

    await user.save()

    res.status(200).json({ message: 'Username and password changed successfully.' })
  } catch (error) {
    res.status(500).json({ error: error })
  }
})

export default deviceRouter
