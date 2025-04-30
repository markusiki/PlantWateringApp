// @ts-nocheck

import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse, PathParams } from 'msw'
import { IDeviceSettingsState, IUnitState } from './interfaces'

const testUnits: IUnitState[] = [
  {
    id: 'Unit1',
    name: 'Test1',
    status: 'OK',
    moistValue: 12000,
    moistLimit: 14000,
    waterTime: 5,
    enableAutoWatering: false,
    enableMaxWaterInterval: false,
    enableMinWaterInterval: false,
    maxWaterInterval: 0,
    minWaterInterval: 0,
    logs: [
      {
        date: '27.08.2024 10:54',
        status: 'OK',
        moistValue: 12000,
        watered: true,
        waterMethod: 'auto: max watering interval',
      },
    ],
  },
  {
    id: 'Unit2',
    name: 'Test2',
    status: 'OK',
    moistValue: 12000,
    moistLimit: 14000,
    waterTime: 5,
    enableAutoWatering: false,
    enableMaxWaterInterval: false,
    enableMinWaterInterval: false,
    maxWaterInterval: 0,
    minWaterInterval: 0,
    logs: [
      {
        date: '27.08.2024 10:54',
        status: 'OK',
        moistValue: 12000,
        watered: true,
        waterMethod: 'auto: max watering interval',
      },
    ],
  },
  {
    id: 'Unit3',
    name: 'Test3',
    status: 'OK',
    moistValue: 12000,
    moistLimit: 14000,
    waterTime: 5,
    enableAutoWatering: false,
    enableMaxWaterInterval: false,
    enableMinWaterInterval: false,
    maxWaterInterval: 0,
    minWaterInterval: 0,
    logs: [
      {
        date: '27.08.2024 10:54',
        status: 'OK',
        moistValue: 12000,
        watered: true,
        waterMethod: 'auto: max watering interval',
      },
    ],
  },
  {
    id: 'Unit4',
    name: 'Test4',
    status: 'OK',
    moistValue: 12000,
    moistLimit: 14000,
    waterTime: 5,
    enableAutoWatering: false,
    enableMaxWaterInterval: false,
    enableMinWaterInterval: false,
    maxWaterInterval: 0,
    minWaterInterval: 0,
    logs: [
      {
        date: '27.08.2024 10:54',
        status: 'OK',
        moistValue: 12000,
        watered: true,
        waterMethod: 'auto: max watering interval',
      },
    ],
  },
]

let testDeviceSettings: IDeviceSettingsState = {
  runTimeProgram: false,
  moistMeasureInterval: 1,
  numberOfUnits: 4,
  tankVolume: 0,
  waterAmount: 0,
}

export const restHandlers = [
  http.post('/api/login', () => {
    return HttpResponse.json()
  }),
  http.get('/api/units', async () => {
    return HttpResponse.json(testUnits.slice(0, testDeviceSettings.numberOfUnits))
  }),
  http.get('/api/device', async () => {
    return HttpResponse.json(testDeviceSettings)
  }),
  http.put<PathParams, IDeviceSettingsState, IDeviceSettingsState>('/api/device', async ({ request }) => {
    const updatedSettings = await request.json()
    testDeviceSettings = updatedSettings
    return HttpResponse.json(testDeviceSettings)
  }),
]

const server = setupServer(...restHandlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())
