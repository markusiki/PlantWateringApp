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
  const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.pwhash)

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      message: 'Invalid username or password',
    })
  }

  const userForToken = {
    id: user._id,
    username: user.username,
    wormhole_url: user.devices.wormhole_url,
  }

  const token = jwt.sign(userForToken, config.SECRET!, { expiresIn: '1h' })
  req.token = token
  next()
})

export default loginRouter
