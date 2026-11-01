import { useId, type ComponentPropsWithRef } from 'react'
import styles from './TextField.module.css'

interface TextFieldProps extends ComponentPropsWithRef<'input'> {
  label: string
  error?: string
}

export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
