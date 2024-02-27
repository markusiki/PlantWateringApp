export interface IUnitState {
  id: string
  name: string
  status: string
  moistLevel: number
  moistLimit: number
  waterTime: number
  logs: string[]
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
  moistMeasureIntervall: number
}
export interface IDeviceSettingsProps {
  deviceSettings: IDeviceSettingsState
  handleDeciveSettingsChange: any
}
