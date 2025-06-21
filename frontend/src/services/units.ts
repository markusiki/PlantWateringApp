import axios from 'axios'
import { IUnitToUpdate } from '../interfaces'
import serviceHelper from './helpers'
const baseUrl = `/api/units`

const getAll = async () => {
  const response = await axios.get(baseUrl, serviceHelper.getConfig())
  return response
}

const changeSettings = async (unit: IUnitToUpdate) => {
  const response = await axios.put(baseUrl, unit, serviceHelper.getConfig())
  return response
}

const waterPlant = async (id: string) => {
  const response = await axios.post(`${baseUrl}/${id}`, '', serviceHelper.getConfig())
  return response
}

const deleteLogs = async (id: string) => {
  const response = await axios.delete(`${baseUrl}/logs/${id}`, serviceHelper.getConfig())
  return response
}

const calibrateUnit = async (id: string, moistValueType: string) => {
  const response = await axios.put(
    `${baseUrl}/calibrate/${moistValueType}MoistValue/${id}`,
    {},
    serviceHelper.getConfig()
  )
  return response
}

const getRawMoistValue = async (id: string) => {
  const response = await axios.get(`${baseUrl}/rawMoistValue/${id}`, serviceHelper.getConfig())
  return response
}

const unitServices = { getAll, changeSettings, waterPlant, deleteLogs, calibrateUnit, getRawMoistValue }

export default unitServices
