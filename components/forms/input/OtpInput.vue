<template>
  <div class="enhanced-otp-container">
    <label v-if="label" class="otp-label">{{ label }}</label>
    <v-otp-input
      v-model="inputValue"
      :length="length"
      :type="type"
      variant="outlined"
      class="enhanced-otp-input"
      @input="handleInput"
    ></v-otp-input>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  label?: string
  length?: number
  type?: string
  errorMessage?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'input', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  length: 6,
  type: 'number',
  errorMessage: '',
})

const emit = defineEmits<Emits>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleInput = (value: string) => {
  emit('input', value)
}
</script>

<style scoped>
.enhanced-otp-container {
  margin-bottom: 1rem;
}

.otp-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.error-message {
  color: #ff5252;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

:deep(.enhanced-otp-input input) {
  border: 2px solid #1976d2 !important;
  border-radius: 8px !important;
  background-color: rgba(25, 118, 210, 0.05) !important;
  font-weight: bold !important;
  font-size: 1.2rem !important;
  color: #1976d2 !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  height: 48px !important;
  width: 48px !important;
  margin: 0 4px !important;
}

:deep(.enhanced-otp-input input:focus) {
  border-color: #1976d2 !important;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.3) !important;
}
</style>
