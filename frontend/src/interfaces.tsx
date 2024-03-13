export interface IUnitState {
  id: string
  name: string
  status: string
  moistValue: number
  moistLimit: number
  waterTime: number
  logs: log[]
}

export interface log {
  date: string
  status: string
  moistValue: number
  watered: boolean
  waterMethod: string
}

export interface ILogProps {
  unit: IUnitState
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
}

export interface IDeviceSettingsState {
  autoWatering: boolean
  moistMeasureIntervall: number
}
export interface IDeviceSettingsProps {
  deviceSettings: IDeviceSettingsState
  handleDeciveSettingsChange: any
}

export interface IUnitToUpdate {
  name: string
  moistLimit: number
  waterTime: number
  id: IUnitState['id']
}
