import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'
import { IDeviceSettingsState, IUnitState } from './interfaces'

const testUnits: IUnitState[] = 
[
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
  }
]

const testDeviceSettings: IDeviceSettingsState = {
  runTimeProgram: false,
  moistMeasureInterval: 1,
  numberOfUnits: 4
} 

export const restHandlers = [
  http.post('/api/login', () => {
    return HttpResponse.json()
  }),
  http.get('/api/units', async () => {
    return HttpResponse.json(testUnits)
  }),
  http.get('/api/device', async () => {
    return HttpResponse.json(testDeviceSettings)
  }),
  http.put('/api/device', async ({ request }) => {
    const requestBody = await request.json()
    return HttpResponse.json(requestBody)

  })
]


const server = setupServer(...restHandlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())