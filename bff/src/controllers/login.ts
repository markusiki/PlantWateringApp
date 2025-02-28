import express from 'express'
import User from '../models/user'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from '../utils/config'
import { CustomRequest } from '../interfaces'

const loginRouter = express.Router()

loginRouter.post('/', async (req: CustomRequest, res, next) => {
  const { username, password } = req.body

  const user = await User.findOne({ username: username })
  const passwordCorrect = user === null ? false : bcrypt.compare(password, user.pwhash)

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: 'Invalid username or password',
    })
  }

  const userForToken = {
    id: user._id,
    username: user.username,
    wormhole_slug: user.devices.wormhole_slug,
  }

  const token = jwt.sign(userForToken, config.SECRET!)
  req.token = token

  next()
})

export default loginRouter
