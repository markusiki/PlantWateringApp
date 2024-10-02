import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from './Home'
//import { prettyDOM } from '@testing-library/react'

describe('Menu renders', () => {
  const user = userEvent.setup()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { container, rerender } = render(<Home />)

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
  test('the amount of unit components defined in device settings', async () => {
    await user.click(screen.getByText('Device Settings'))
    const numberOfUnitsInput = await screen.findByLabelText('Number of units')

    await user.clear(numberOfUnitsInput)
    await user.type(numberOfUnitsInput, '2')

    const confirmButton = await screen.findByTestId('confirmDeviceSettingsButton')

    const unit1 = screen.getByText('Unit1')
    const unit2 = screen.getByText('Unit2')
    const unit3 = screen.getByText('Unit3')
    const unit4 = screen.getByText('Unit4')

    await user.click(confirmButton)

    expect(unit1).toBeInTheDocument()
    expect(unit2).toBeInTheDocument()
    //console.log(prettyDOM(container, 2000))
    expect(unit3).not.toBeInTheDocument()
    expect(unit4).not.toBeInTheDocument()
  })
})
