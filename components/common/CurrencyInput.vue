<template>
  <v-text-field
    ref="textFieldRef"
    :model-value="formattedValue"
    :label="label"
    :rules="combinedRules"
    :required="required"
    :placeholder="placeholder"
    :hint="hint"
    :persistent-hint="!!hint"
    :error-messages="errorMessages"
    :disabled="disabled"
    :loading="loading"
    inputmode="decimal"
    type="text"
    @input="handleInput"
    @blur="handleBlur"
    class="currency-input"
  >
    <template v-if="displayPrefix" #prepend-inner>
      <span class="currency-prefix">{{ displayPrefix }}</span>
    </template>
    <template v-if="displaySuffix" #append-inner>
      <span class="currency-suffix">{{ displaySuffix }}</span>
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { VTextField } from 'vuetify/components' // Import type for ref

interface Props {
  modelValue: number | null // Component expects number or null
  label?: string
  required?: boolean
  placeholder?: string
  hint?: string
  errorMessages?: string | string[]
  disabled?: boolean
  loading?: boolean
  rules?: ((v: number | null) => boolean | string)[] // Rules operate on the numeric value
  currencySymbol?: string | null
  currencyCode?: string | null
  prefixSymbol?: boolean // True: Prefix symbol/code, False: Suffix
  min?: number
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Amount',
  required: false,
  placeholder: '0.00',
  hint: '',
  errorMessages: () => [],
  disabled: false,
  loading: false,
  rules: () => [],
  currencySymbol: null,
  currencyCode: null,
  prefixSymbol: true, // Default to prefixing the symbol/code
  min: undefined,
  max: undefined,
})

const emit = defineEmits(['update:modelValue'])

const textFieldRef = ref<InstanceType<typeof VTextField> | null>(null) // Ref for the text field

// Internal state to hold the potentially non-numeric input string
const internalRawValue = ref<string>(formatNumberForInput(props.modelValue))

// Determine the symbol/code to display
const currencyDisplay = computed(
  () => props.currencySymbol ?? props.currencyCode
)

// Determine prefix or suffix based on props
const displayPrefix = computed(() =>
  props.prefixSymbol ? currencyDisplay.value : null
)
const displaySuffix = computed(() =>
  !props.prefixSymbol ? currencyDisplay.value : null
)

// Format the numeric modelValue for display in the input field
function formatNumberForInput(num: number | null): string {
  if (num === null || num === undefined) {
    return ''
  }
  // Basic formatting: convert number to string.
  // Avoid locale-specific formatting like commas here for easier input handling.
  return String(num)
}

// Parse the raw input string back to number or null
function parseInputToNumber(input: string): number | null {
  // Remove any non-numeric characters except decimal point
  // Note: This is a basic sanitization. More complex masking might be needed for thousand separators etc.
  const sanitized = input.replace(/[^0-9.]/g, '')

  // Ensure only one decimal point
  const parts = sanitized.split('.')
  if (parts.length > 2) {
    // Invalid number format (multiple dots) - treat as empty or keep last valid? Let's treat as empty for now.
    return null
  }

  if (sanitized === '' || sanitized === '.') {
    return null
  }

  const num = parseFloat(sanitized)
  return isNaN(num) ? null : num
}

// Update internal raw value when modelValue prop changes
watch(
  () => props.modelValue,
  (newValue) => {
    const currentNumericValue = parseInputToNumber(internalRawValue.value)
    // Only update internal state if the external value is different
    // or if the internal state is not a valid representation (e.g., during typing)
    if (newValue !== currentNumericValue) {
      internalRawValue.value = formatNumberForInput(newValue)
    }
  },
  { immediate: false }
) // Don't run immediately to allow initial typing

// Computed property for the v-text-field's model-value binding
const formattedValue = computed(() => internalRawValue.value)

// Validation rules adapted for the numeric value
const combinedRules = computed(() => {
  const valueRules = [
    (v: number | null) =>
      !props.required ||
      (v !== null && v !== undefined) ||
      'This field is required',
    (v: number | null) =>
      props.min === undefined ||
      v === null ||
      v >= props.min ||
      `Value must be at least ${props.min}`,
    (v: number | null) =>
      props.max === undefined ||
      v === null ||
      v <= props.max ||
      `Value must be no more than ${props.max}`,
  ]

  // Adapt prop rules to work with the numeric value emitted
  const adaptedPropRules = props.rules.map((rule) => (rawInput: string) => {
    const numericValue = parseInputToNumber(rawInput)
    return rule(numericValue)
  })

  // We validate the raw input string using adapted rules
  return adaptedPropRules // Vuetify rules operate on the field's direct model
})

// Handle user input: sanitize and emit numeric value
const handleInput = (event: Event) => {
  const inputElement = event.target as HTMLInputElement
  let rawValue = inputElement.value

  // Basic sanitization during typing: allow digits, one dot
  // Prevent multiple decimal points
  const parts = rawValue.split('.')
  if (parts.length > 2) {
    // Reconstruct with only the first decimal point
    rawValue = parts[0] + '.' + parts.slice(1).join('')
  }
  // Allow only numbers and a single dot
  const sanitized = rawValue.replace(/[^0-9.]/g, '')

  // Update the internal raw value for display
  internalRawValue.value = sanitized

  // Parse and emit the numeric value
  const numericValue = parseInputToNumber(sanitized)
  emit('update:modelValue', numericValue)

  // Force Vuetify validation check after input changes
  // Use nextTick to ensure DOM is updated before validation if needed
  nextTick(() => {
    textFieldRef.value?.validate()
  })
}

// Handle blur: reformat the input if necessary (e.g., remove trailing dot)
const handleBlur = () => {
  const numericValue = parseInputToNumber(internalRawValue.value)
  internalRawValue.value = formatNumberForInput(numericValue) // Reformat based on the parsed number
  // Emit again on blur in case formatting changed the value
  emit('update:modelValue', numericValue)
  // Ensure validation runs on blur as well
  nextTick(() => {
    textFieldRef.value?.validate()
  })
}
</script>

<style scoped>
.currency-input {
  /* Add any specific styling if needed */
}
.currency-prefix,
.currency-suffix {
  font-weight: 500;
  opacity: 0.8; /* Make symbol/code slightly less prominent */
  user-select: none; /* Prevent selecting the symbol */
  white-space: nowrap; /* Prevent wrapping */
  padding-left: 4px; /* Spacing for prefix */
  padding-right: 4px; /* Spacing for suffix */
}

/* Align prefix/suffix vertically centered */
:deep(.v-field__prepend-inner),
:deep(.v-field__append-inner) {
  align-items: center;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
