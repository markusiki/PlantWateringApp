import { Schema, model } from 'mongoose'
import { IUser } from '../interfaces'

const userSchema = new Schema<IUser>({
  username: String,
  pwhash: String,
  devices: {
    serial: String,
    wormhole_slug: String,
  },
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
  virtuals: true,
})

export default model<IUser>('User', userSchema)
