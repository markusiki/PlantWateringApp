export interface IUnitState {
  id: string
  name: string
  status: string
  moistLevel: number
  moistLimit: number
  waterTime: number
  moistMeasureIntervall: number
  logs: string[]
}

export interface ILogProps {
  unit: IUnitState
}

export interface ISettingsProps {
  unit: IUnitState
  index: number
  units: IUnitState[]
  setUnits: React.Dispatch<React.SetStateAction<IUnitState[]>>
}

export interface ISettingsState {
  name: string
  moistLimit: number
  waterTime: number
  moistMeasureIntervall: number
}
