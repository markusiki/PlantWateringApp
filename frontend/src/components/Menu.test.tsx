import { IonApp, IonPage } from '@ionic/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Menu from './Menu'
//import { prettyDOM } from '@testing-library/react'

const testDeviceSettings = {
  runTimeProgram: false,
  moistMeasureInterval: 0,
  numberOfUnits: 1,
}

describe('Menu renders', () => {
  const user = userEvent.setup()
  const handleLogoutMock = vi.fn()
  const handleDeviceSettingsChangeMock = vi.fn()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { container, rerender } = render(
    <IonApp>
      <Menu
        deviceSettings={testDeviceSettings}
        handleLogout={handleLogoutMock}
        handleDeviceSettingsChange={handleDeviceSettingsChangeMock}
      />
      <IonPage id="main-content" />
    </IonApp>
  )

  describe('a device settings button, which opens a device settings modal when clicked', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    const deviceSettingsButton = screen.getByText('Device Settings')

    test('and handleDeviceSettigs function is called if input is valid', async () => {
      await user.click(deviceSettingsButton)
      const testChangedDeviceSettings = {
        runTimeProgram: true,
        moistMeasureInterval: 1,
        numberOfUnits: 2,
      }

      const runTimeProgramCheckbox = screen.getByText('Enable time program')
      const measureIntervalInput = await screen.findByLabelText('Soil moisture measure interval (days):')
      const numberOfUnitsInput = await screen.findByLabelText('Number of units')

      await user.click(runTimeProgramCheckbox)
      user.clear(measureIntervalInput)
      await user.type(measureIntervalInput, testChangedDeviceSettings.moistMeasureInterval.toString())
      user.clear(numberOfUnitsInput)
      await user.type(numberOfUnitsInput, testChangedDeviceSettings.numberOfUnits.toString())

      const confirmButton = await screen.findByText('Confirm')

      await user.click(confirmButton)
      expect(handleDeviceSettingsChangeMock.mock.calls[0][1]).toEqual(testChangedDeviceSettings)
    })
    test('and handleDeviceSettigs function is not called if measure interval input is invalid', async () => {
      await user.click(deviceSettingsButton)
      const measureIntervalInput = await screen.findByLabelText('Soil moisture measure interval (days):')

      user.clear(measureIntervalInput)
      await user.type(measureIntervalInput, '0')

      const confirmButton = await screen.findByText('Confirm')

      await user.click(confirmButton)
      expect(await screen.findByText('Invalid input')).toBeInTheDocument()
      expect(handleDeviceSettingsChangeMock).not.toHaveBeenCalled()
    })
    test('and handleDeviceSettigs function is not called if number on units input is invalid', async () => {
      await user.click(deviceSettingsButton)
      const numberOfUnitsInput = await screen.findByLabelText('Number of units')

      user.clear(numberOfUnitsInput)
      await user.type(numberOfUnitsInput, '0')

      const confirmButton = await screen.findByText('Confirm')

      await user.click(confirmButton)
      expect(await screen.findByText('Invalid input')).toBeInTheDocument()
      expect(handleDeviceSettingsChangeMock).not.toHaveBeenCalled()
    })
  })
})
