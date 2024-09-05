import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Unit from './Unit'
import { IUnitState } from '../interfaces'

test('render unit id, name, status, moistValue and last time watered date', () => {
  const unit: IUnitState = {
    id: 'Unit1',
    name: 'Test1',
    status: 'OK',
    moistValue: 15000,
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
        moistValue: 15000,
        watered: true,
        waterMethod: 'auto: max watering interval',
      },
    ],
    counter: 0,
  }

  const mockHandler = jest.fn()
  render(<Unit unit={unit} setUnits={mockHandler} handleUnitChange={mockHandler} waterNow={mockHandler} deleteLogs={mockHandler} waterNowDisabeled={false} />)

  const unitId = screen.getByText(unit.id)
  const unitName = screen.getByText(unit.name)
  const unitStatus = screen.getByText(unit.status)
  const unitMoistValue = screen.getByText(unit.moistValue)
  const unitLastTimeWatered = screen.getByText(unit.logs[0].date)
  expect(unitId).toBeDefined()
  expect(unitName).toBeDefined()
  expect(unitStatus).toBeDefined()
  expect(unitMoistValue).toBeDefined()
  expect(unitLastTimeWatered).toBeDefined()
})
