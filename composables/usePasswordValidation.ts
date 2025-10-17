// composables/usePasswordValidation.ts
import { computed, Ref } from 'vue'

export interface PasswordCheck {
  label: string
  passes: boolean
}

export function usePasswordValidation(password: Ref<string>) {
  const hasUpperCase = computed(() => /[A-Z]/.test(password.value))
  const hasLowerCase = computed(() => /[a-z]/.test(password.value))
  const hasNumber = computed(() => /[0-9]/.test(password.value))
  const hasSpecialChar = computed(() => /[@$!%*#?&]/.test(password.value))
  const isLongEnough = computed(() => password.value.length >= 8)

  const passwordChecks = computed<PasswordCheck[]>(() => [
    { label: 'Uppercase', passes: hasUpperCase.value },
    { label: 'Lowercase', passes: hasLowerCase.value },
    { label: 'Number', passes: hasNumber.value },
    { label: 'Special', passes: hasSpecialChar.value },
    { label: '8+ chars', passes: isLongEnough.value },
  ])

  const meetsAllRequirements = computed(() =>
    passwordChecks.value.every((check) => check.passes)
  )

  return {
    passwordChecks,
    meetsAllRequirements,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
    isLongEnough,
  }
}
