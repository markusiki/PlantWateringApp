export interface IUnitState {
  id: string
  name: string
  status: string
  moistValue: number
  moistLimit: number
  waterTime: number
  enableAutoWatering: boolean
  enableMaxWaterInterval: boolean
  enableMinWaterInterval: boolean
  maxWaterInterval: number
  minWaterInterval: number
  logs: ILog[]
  counter?: number
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

export interface IMenuProps extends IDeviceSettingsProps {
  handleLogout: (event: React.MouseEvent) => Promise<void>
}

export interface IHeaderProps {
  isBackendConnected: boolean
  refresh: () => Promise<void>
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

export interface IUnitProps {
  unit: IUnitState
  setUnits: React.Dispatch<React.SetStateAction<IUnitState[]>>
  handleUnitChange: any
  waterNow: (id: string) => Promise<void>
  deleteLogs: (event: React.MouseEvent, id: string) => Promise<void>
  waterNowDisabled: boolean
  setWaterNowDisabled: React.Dispatch<React.SetStateAction<boolean>>
}

export interface IUnitSettingsProps {
  unit: IUnitState
  handleUnitChange: any
}

export interface IUnitSettingsState {
  name: string
  moistLimit: number
  waterTime: number
  enableAutoWatering: boolean
  enableMaxWaterInterval: boolean
  enableMinWaterInterval: boolean
  maxWaterInterval: number
  minWaterInterval: number
}

export interface IDeviceSettingsState {
  runTimeProgram: boolean
  moistMeasureInterval: number
  numberOfUnits: number
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
