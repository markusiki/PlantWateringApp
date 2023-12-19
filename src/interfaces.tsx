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