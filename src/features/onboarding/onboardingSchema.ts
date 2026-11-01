import { z } from 'zod'
import { CANADIAN_AREA_CODES } from './canadianAreaCodes'
import type { CorporationNumberChecker } from './corporationNumberChecker'

export const NAME_MAX_LENGTH = 50
export const PHONE_MAX_LENGTH = 12
export const CORPORATION_NUMBER_LENGTH = 9

const PHONE_PATTERN = /^\+1\d{10}$/
const CORPORATION_NUMBER_PATTERN = /^\d{9}$/
const INVALID_PHONE_MESSAGE = 'Enter a valid Canadian phone number, e.g. +13062776103'

const requiredString = (label: string) => z.string().trim().min(1, `${label} is required`)

const name = (label: string) =>
  requiredString(label).max(NAME_MAX_LENGTH, `${label} must be at most ${NAME_MAX_LENGTH} characters`)

const hasCanadianAreaCode = (phone: string) => CANADIAN_AREA_CODES.has(phone.slice(2, 5))

export function createOnboardingSchema(checkCorporationNumber: CorporationNumberChecker) {
  return z.object({
    firstName: name('First name'),
    lastName: name('Last name'),
    phone: requiredString('Phone number')
      .regex(PHONE_PATTERN, { error: INVALID_PHONE_MESSAGE, abort: true })
      .refine(hasCanadianAreaCode, INVALID_PHONE_MESSAGE),
    corporationNumber: requiredString('Corporation number')
      .regex(CORPORATION_NUMBER_PATTERN, {
        error: `Corporation number must be ${CORPORATION_NUMBER_LENGTH} digits`,
        abort: true,
      })
      .superRefine(async (corporationNumber, ctx) => {
        const error = await checkCorporationNumber(corporationNumber)

        if (error) {
          ctx.addIssue({ code: 'custom', message: error })
        }
      }),
  })
}

export type OnboardingFormValues = z.infer<ReturnType<typeof createOnboardingSchema>>
