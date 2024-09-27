// @ts-nocheck
import { IonApp } from '@ionic/react'
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Unit from './Unit'
import { IUnitState } from '../interfaces'
import { prettyDOM } from '@testing-library/react'

const testUnit: IUnitState = {
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
  counter: 0,
}

describe('Unit renders', () => {
  const user = userEvent.setup()
  const waterNowMock = vi.fn()
  const deleteLogsMock = vi.fn()
  const setUnitsMock = vi.fn()
  const setWaterNowDisabled = vi.fn()
  const { container, rerender } = render(
    <IonApp>
      <Unit
        unit={testUnit}
        setUnits={setUnitsMock}
        waterNow={waterNowMock}
        deleteLogs={deleteLogsMock}
        setWaterNowDisabled={setWaterNowDisabled}
        waterNowDisabled={false}
      />
    </IonApp>
  )

  test('unit id, name, status, moistValue and last time watered date', () => {
    const unitId = screen.getByText(testUnit.id)
    const unitName = screen.getByText(testUnit.name)
    const unitStatus = screen.getByText(testUnit.status)
    const unitMoistValue = screen.getByText(/12000/)
    const unitLastTimeWatered = screen.getByText(/27.08.2024 10:54/)
    expect(unitId).toBeDefined()
    expect(unitName).toBeDefined()
    expect(unitStatus).toBeDefined()
    expect(unitMoistValue).toBeDefined()
    expect(unitLastTimeWatered).toBeDefined()
  })

  test('absolute and relative moist values correctly', () => {
    const absMoistValue = screen.getByTestId('abs-moist-value')
    const relMoistValue = screen.getByTestId('rel-moist-value')
    expect(absMoistValue).toHaveTextContent('67%')
    expect(relMoistValue).toHaveTextContent('50%')
  })
  describe('log button which opens log modal when clicked', () => {
    beforeAll(async () => {
      const logButton = screen.getByText('Log')
      await user.click(logButton)
    })
    test('and renders log data', async () => {
      const date = screen.getByText('27.08.2024 10:54')
      expect(date).toBeInTheDocument()
      const status = screen.getByText('OK', { selector: 'p' })
      expect(status).toBeInTheDocument()
      const moistValue = screen.getByText('12000')
      expect(moistValue).toBeInTheDocument()

      const watered = screen.getByText('Yes')
      expect(watered).toBeInTheDocument()

      const waterMethod = screen.getByText('auto: max watering interval')
      expect(waterMethod).toBeInTheDocument()
    })
    test('and all logs can be deleted by clicking a button and confirming the deletion', async () => {
      const deleteLogsButton = screen.getByTestId('deleteLogs-button')
      await user.click(deleteLogsButton)
      expect(deleteLogsMock).not.toHaveBeenCalled()
      const confirmButton = await screen.findByText('CONFIRM')
      await user.click(confirmButton)
      expect(deleteLogsMock).toHaveBeenCalledOnce()
    })
  })
  describe('Water now button opens an alert to confirm or cancel watering', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })
    const waterNowButton = screen.getByText('Water now')

    test(
      'that can be confirmed and waterNow function will be called, the button will be disabeled and setUnits function is called waterTime + 1 times',
      { timeout: 6000 },
      async () => {
        await user.click(waterNowButton)
        await user.click(screen.getByText('WATER NOW'))
        expect(waterNowMock).toHaveBeenCalledOnce()
        expect(setWaterNowDisabled).toHaveBeenCalledOnce()
        rerender(
          <IonApp>
            <Unit
              unit={testUnit}
              waterNow={waterNowMock}
              setUnits={setUnitsMock}
              setWaterNowDisabled={setWaterNowDisabled}
              waterNowDisabled={true}
            />
          </IonApp>
        )
        expect(waterNowButton).toHaveAttribute('disabled')
        await vi.waitFor(
          () => {
            if (setUnitsMock.mock.calls.length !== 6) {
              throw new Error('Not working')
            }
          },
          { timeout: 6000, interval: 1000 }
        )

        expect(setUnitsMock).toHaveBeenCalledTimes(testUnit.waterTime + 1)
      }
    )
    test('that can be canceled and watering will be canceled', async () => {
      await user.click(waterNowButton)
      await user.click(screen.getByText('CANCEL'))
      expect(waterNowMock).not.toHaveBeenCalled()
    })
  })
  describe('unit settings button which opens unit settings modal when clicked', () => {
    const settingsButton = screen.getByTestId('settings-button')
    test('and the modal is rendered', async () => {
      await user.click(settingsButton)
      //console.log(prettyDOM(container, 20000))
      const modal = screen.getByText('Settings')
      expect(modal).toBeInTheDocument()
    })
  })
})
