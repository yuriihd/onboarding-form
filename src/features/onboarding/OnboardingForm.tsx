import { Button } from '../../components/Button/Button'
import { TextField } from '../../components/TextField/TextField'
import {
  CORPORATION_NUMBER_LENGTH,
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
} from './onboardingSchema'
import { useOnboardingForm } from './useOnboardingForm'
import styles from './OnboardingForm.module.css'

export function OnboardingForm() {
  const { register, errors, isSubmitting, isSubmitSuccessful, onSubmit } = useOnboardingForm()

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <h1 className={styles.title}>Onboarding Form</h1>

      <div className={styles.nameRow}>
        <TextField
          label="First Name"
          autoComplete="given-name"
          maxLength={NAME_MAX_LENGTH}
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <TextField
          label="Last Name"
          autoComplete="family-name"
          maxLength={NAME_MAX_LENGTH}
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <TextField
        label="Phone Number"
        type="tel"
        autoComplete="tel"
        maxLength={PHONE_MAX_LENGTH}
        error={errors.phone?.message}
        {...register('phone')}
      />

      <TextField
        label="Corporation Number"
        inputMode="numeric"
        maxLength={CORPORATION_NUMBER_LENGTH}
        error={errors.corporationNumber?.message}
        {...register('corporationNumber')}
      />

      {errors.root?.server && (
        <p className={styles.submitError} role="alert">
          {errors.root.server.message}
        </p>
      )}

      {isSubmitSuccessful && (
        <p className={styles.submitSuccess} role="status">
          Your details have been submitted.
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        Submit <span aria-hidden="true">→</span>
      </Button>
    </form>
  )
}
