import { validateCorporationNumber } from '../../api/onboardingApi'

export type CorporationNumberChecker = (corporationNumber: string) => Promise<string | undefined>

export function createCorporationNumberChecker(): CorporationNumberChecker {
  const results = new Map<string, Promise<string | undefined>>()

  async function check(corporationNumber: string) {
    try {
      const { valid, message } = await validateCorporationNumber(corporationNumber)
      return valid ? undefined : (message ?? 'Invalid corporation number')
    } catch {
      results.delete(corporationNumber)
      return 'Unable to verify corporation number. Please try again.'
    }
  }

  return (corporationNumber) => {
    let result = results.get(corporationNumber)

    if (!result) {
      result = check(corporationNumber)
      results.set(corporationNumber, result)
    }

    return result
  }
}
