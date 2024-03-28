export interface IUnitState {
  id: string
  name: string
  status: string
  moistValue: number
  moistLimit: number
  waterTime: number
  enableMaxWaterInterval: boolean
  enableMinWaterInterval: boolean
  maxWaterInterval: number
  minWaterInterval: number
  logs: ILog[]
}

export interface IUserState {
  username: string | null
  token: string | null
}

export interface ILoginProps {
  username: string
  password: string
  setUsername: React.Dispatch<React.SetStateAction<string>>
  setPassword: React.Dispatch<React.SetStateAction<string>>
  handleLogin: (event: React.MouseEvent) => Promise<void>
}

export interface ILoginCredentials {
  username: string
  password: string
}

export interface ILog {
  date: string
  status: string
  moistValue: number
  watered: boolean
  waterMethod: string
}

export interface ILogProps {
  unit: IUnitState
  deleteLogs: (event: React.MouseEvent, id: string) => Promise<void>
}

export interface IUnitSettingsProps {
  unit: IUnitState
  index: number
  units: IUnitState[]
  handleUnitChange: any
}

export interface IUnitSettingsState {
  name: string
  moistLimit: number
  waterTime: number
  enableMaxWaterInterval: boolean
  enableMinWaterInterval: boolean
  maxWaterInterval: number
  minWaterInterval: number
}

export interface IDeviceSettingsState {
  autoWatering: boolean
  moistMeasureInterval: number
}
export interface IDeviceSettingsProps {
  deviceSettings: IDeviceSettingsState
  handleDeciveSettingsChange: any
}

export interface IUnitToUpdate {
  name: string
  moistLimit: number
  waterTime: number
  id: string
}
