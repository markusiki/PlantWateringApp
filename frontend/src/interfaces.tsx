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
  waterFlowRate: number
  totalWateredAmount: number
  wetMoistValue: number
  dryMoistValue: number
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
  loginSpinner: boolean
}

export interface ILoginCredentials {
  username: string
  password: string
}

export interface IMenuProps extends IDeviceSettingsProps {
  handleLogout: (event: React.MouseEvent) => Promise<void>
  handleShutdown: () => Promise<void>
}

export interface IHeaderProps {
  isBackendConnected: boolean
  refresh: () => Promise<void>
  deviceSettings: IDeviceSettingsState
}

export interface ILog {
  date: string
  status: string
  moistValue: number
  watered: boolean
  waterMethod: string
  message: string
}

export interface ILogProps {
  unit: IUnitState
  deleteLogs: (event: React.MouseEvent, id: string) => Promise<void>
}

export interface IUnitProps {
  unit: IUnitState
  setUnits: React.Dispatch<React.SetStateAction<IUnitState[]>>
  handleUnitChange: any
  waterNow: (id: string) => Promise<boolean>
  deleteLogs: (event: React.MouseEvent, id: string) => Promise<void>
  waterNowDisabled: boolean
  setWaterNowDisabled: React.Dispatch<React.SetStateAction<boolean>>
  handleUnitCalibration: (event: React.MouseEvent, id: IUnitState['id'], moistValueType: string) => Promise<void>
}

export interface IUnitSettingsProps {
  unit: IUnitState
  handleUnitChange: any
  handleUnitCalibration: (event: React.MouseEvent, id: IUnitState['id'], moistValueType: string) => Promise<void>
}

export interface IUnitCalibrationProps {
  isCalibrating: boolean
  setIsCalibrating: React.Dispatch<React.SetStateAction<boolean>>
  unit: IUnitState
  handleUnitCalibration: (event: React.MouseEvent, id: IUnitState['id'], moistValueType: string) => Promise<void>
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
  waterFlowRate: string
}

export interface IDeviceSettingsState {
  runTimeProgram: boolean
  moistMeasureInterval: number
  numberOfUnits: number
  tankVolume: number
  waterAmount: number
}
export interface IDeviceSettingsProps {
  deviceSettings: IDeviceSettingsState
  handleDeviceSettingsChange: (event: React.MouseEvent, settings: IDeviceSettingsState) => Promise<void>
}

export interface IUnitToUpdate {
  name: string
  moistLimit: number
  waterTime: number
  id: string
}

export interface ILoadingSpinnerProps {
  isOpen: boolean
  message: string
}
