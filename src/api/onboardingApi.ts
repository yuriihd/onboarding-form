const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface ProfileDetails {
  firstName: string
  lastName: string
  phone: string
  corporationNumber: string
}

export interface CorporationNumberValidation {
  valid: boolean
  message?: string
}

export async function validateCorporationNumber(
  corporationNumber: string,
): Promise<CorporationNumberValidation> {
  const response = await fetch(
    `${API_BASE_URL}/corporation-number/${encodeURIComponent(corporationNumber)}`,
  )

  if (!response.ok && response.status !== 404) {
    throw new Error(`Corporation number validation failed with status ${response.status}`)
  }

  return response.json()
}

export async function submitProfileDetails(details: ProfileDetails): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/profile-details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  })

  if (!response.ok) {
    const body: { message?: string } = await response.json().catch(() => ({}))
    throw new Error(body.message ?? 'Unable to submit profile details. Please try again.')
  }
}
