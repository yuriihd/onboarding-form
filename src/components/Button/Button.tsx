import type { ComponentPropsWithRef } from 'react'
import styles from './Button.module.css'

export function Button({ type = 'button', ...props }: ComponentPropsWithRef<'button'>) {
  return <button type={type} className={styles.button} {...props} />
}
