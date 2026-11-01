import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { submitProfileDetails } from '../../api/onboardingApi'
import { createCorporationNumberChecker } from './corporationNumberChecker'
import { createOnboardingSchema, type OnboardingFormValues } from './onboardingSchema'

const EMPTY_VALUES: OnboardingFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  corporationNumber: '',
}

export function useOnboardingForm() {
  const [schema] = useState(() => createOnboardingSchema(createCorporationNumberChecker()))

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submitProfileDetails(values)
      reset()
    } catch (error) {
      setError('root.server', {
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      })
    }
  })

  return { register, errors, isSubmitting, isSubmitSuccessful, onSubmit }
}
