import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('Home renders', () => {
  const user = userEvent.setup()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { container, rerender } = render(<App />)

  test('login page if user is not logged in, and user can log in', async () => {
    const usernameInput = await screen.findByLabelText('Username')
    const passwordInput = await screen.findByLabelText('Password')
    expect(usernameInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()

    await user.type(usernameInput, 'test')
    await user.type(passwordInput, 'test')

    await user.click(screen.getByText('Login'))

    expect(usernameInput).not.toBeInTheDocument()
  })
  test('4 unit components as default', async () => {
    for (var i = 1; i < 5; i++) {
      expect(screen.getByText(`Unit${i}`)).toBeInTheDocument()
    }
  })
  describe('the quantity of unit components defined in device settings', () => {
    test('when the quantity is reduced', async () => {
      await user.click(screen.getByText('Device Settings'))
      const numberOfUnitsInput = await screen.findByLabelText('Number of units')

      await user.clear(numberOfUnitsInput)
      await user.type(numberOfUnitsInput, '2')

      const confirmButton = await screen.findByTestId('confirmDeviceSettingsButton')

      await user.click(confirmButton)

      const unit1 = screen.getByText('Unit1')
      const unit2 = screen.getByText('Unit2')
      expect(unit1).toBeInTheDocument()
      expect(unit2).toBeInTheDocument()
      const unit3 = screen.queryByText('Unit3')
      const unit4 = screen.queryByText('Unit4')
      expect(unit3).not.toBeInTheDocument()
      expect(unit4).not.toBeInTheDocument()
    })
    test('when the quantity is increased', async () => {
      await user.click(screen.getByText('Device Settings'))
      const numberOfUnitsInput = await screen.findByLabelText('Number of units')

      await user.clear(numberOfUnitsInput)
      await user.type(numberOfUnitsInput, '3')

      const confirmButton = await screen.findByTestId('confirmDeviceSettingsButton')

      await user.click(confirmButton)

      const unit1 = screen.getByText('Unit1')
      const unit2 = screen.getByText('Unit2')
      const unit3 = screen.getByText('Unit3')
      expect(unit1).toBeInTheDocument()
      expect(unit2).toBeInTheDocument()
      expect(unit3).toBeInTheDocument()

      const unit4 = screen.queryByText('Unit4')
      expect(unit4).not.toBeInTheDocument()
    })
  })
})
