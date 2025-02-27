export interface IUser {
  username: string
  pwhash: string
  devices: {
    serial: string
    wormhole_slug: string
  }[]
}
