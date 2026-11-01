import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { OnboardingForm } from './OnboardingForm'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const validValues = {
  firstName: 'Hello',
  lastName: 'World',
  phone: '+13062776103',
  corporationNumber: '826417395',
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

interface ApiResponses {
  corporationNumber?: () => Response | Promise<Response>
  profileDetails?: () => Response | Promise<Response>
}

function mockApi({
  corporationNumber = () => jsonResponse({ corporationNumber: '826417395', valid: true }),
  profileDetails = () => new Response(null, { status: 200 }),
}: ApiResponses = {}) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async (input) =>
      String(input).includes('/corporation-number/') ? corporationNumber() : profileDetails(),
    )
}

function renderForm() {
  const user = userEvent.setup()
  render(<OnboardingForm />)
  return user
}

const getField = (label: string) => screen.getByLabelText(label)

async function fillForm(user: ReturnType<typeof userEvent.setup>, values = validValues) {
  await user.type(getField('First Name'), values.firstName)
  await user.type(getField('Last Name'), values.lastName)
  await user.type(getField('Phone Number'), values.phone)
  await user.type(getField('Corporation Number'), values.corporationNumber)
}

async function expectFieldError(label: string, message: string) {
  await waitFor(() => expect(getField(label)).toHaveAccessibleDescription(message))
}

describe('OnboardingForm', () => {
  it.each([
    ['First Name', 'First name is required'],
    ['Last Name', 'Last name is required'],
    ['Phone Number', 'Phone number is required'],
    ['Corporation Number', 'Corporation number is required'],
  ])('shows a required error when %s is left empty', async (label, message) => {
    const user = renderForm()

    await user.click(getField(label))
    await user.tab()

    await expectFieldError(label, message)
  })

  it('limits names to 50 characters', async () => {
    const user = renderForm()

    await user.type(getField('First Name'), 'a'.repeat(60))
    await user.type(getField('Last Name'), 'b'.repeat(60))

    expect(getField('First Name')).toHaveValue('a'.repeat(50))
    expect(getField('Last Name')).toHaveValue('b'.repeat(50))
  })

  it.each(['3062776103', '+1306277610', '+12125551234'])(
    'rejects %s as a phone number',
    async (phone) => {
      const user = renderForm()

      await user.type(getField('Phone Number'), phone)
      await user.tab()

      await expectFieldError(
        'Phone Number',
        'Enter a valid Canadian phone number, e.g. +13062776103',
      )
    },
  )

  it('clears the phone error once a Canadian number is entered', async () => {
    const user = renderForm()

    await user.type(getField('Phone Number'), '+12125551234')
    await user.tab()
    await expectFieldError('Phone Number', 'Enter a valid Canadian phone number, e.g. +13062776103')

    await user.clear(getField('Phone Number'))
    await user.type(getField('Phone Number'), validValues.phone)
    await user.tab()

    await waitFor(() => expect(getField('Phone Number')).not.toHaveAccessibleDescription())
  })

  it('checks the corporation number length before calling the API', async () => {
    const fetchMock = mockApi()
    const user = renderForm()

    await user.type(getField('Corporation Number'), '12345')
    await user.tab()

    await expectFieldError('Corporation Number', 'Corporation number must be 9 digits')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('validates the corporation number with the API on blur', async () => {
    const fetchMock = mockApi()
    const user = renderForm()

    await user.type(getField('Corporation Number'), validValues.corporationNumber)
    await user.tab()

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/corporation-number/826417395`),
    )
  })

  it('shows the API message for an invalid corporation number', async () => {
    mockApi({
      corporationNumber: () =>
        jsonResponse({ valid: false, message: 'Invalid corporation number' }, 404),
    })
    const user = renderForm()

    await user.type(getField('Corporation Number'), '111111111')
    await user.tab()

    await expectFieldError('Corporation Number', 'Invalid corporation number')
  })

  it('shows an error when the corporation number cannot be verified', async () => {
    mockApi({ corporationNumber: () => Promise.reject(new TypeError('Failed to fetch')) })
    const user = renderForm()

    await user.type(getField('Corporation Number'), validValues.corporationNumber)
    await user.tab()

    await expectFieldError(
      'Corporation Number',
      'Unable to verify corporation number. Please try again.',
    )
  })

  it('shows all errors and does not submit an empty form', async () => {
    const fetchMock = mockApi()
    const user = renderForm()

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await expectFieldError('First Name', 'First name is required')
    await expectFieldError('Last Name', 'Last name is required')
    await expectFieldError('Phone Number', 'Phone number is required')
    await expectFieldError('Corporation Number', 'Corporation number is required')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('submits the profile details and resets the form', async () => {
    const fetchMock = mockApi()
    const user = renderForm()

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Your details have been submitted.',
    )
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/profile-details`,
      expect.objectContaining({ method: 'POST' }),
    )
    const [, request] = fetchMock.mock.lastCall!
    expect(JSON.parse(String(request?.body))).toEqual(validValues)
    expect(getField('First Name')).toHaveValue('')
  })

  it('hides the success message when the next submission is invalid', async () => {
    mockApi()
    const user = renderForm()

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    await screen.findByRole('status')

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await expectFieldError('First Name', 'First name is required')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows the server error when the submission is rejected', async () => {
    mockApi({
      profileDetails: () => jsonResponse({ message: 'Invalid phone number' }, 400),
    })
    const user = renderForm()

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid phone number')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
