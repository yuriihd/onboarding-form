import { OnboardingForm } from './features/onboarding/OnboardingForm'
import styles from './App.module.css'

export function App() {
  return (
    <main className={styles.page}>
      <p className={styles.step}>Step 1 of 5</p>
      <OnboardingForm />
    </main>
  )
}
