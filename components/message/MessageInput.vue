<!-- components/support/MessageInput.vue -->
<template>
  <v-textarea
    v-model="message"
    label="How can we help you?"
    :error-messages="errorMessages"
    variant="outlined"
    :maxlength="maxLength"
    :counter="true"
    :rows="rows"
    auto-grow
    required
    @update:model-value="handleInput"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  errorMessages?: string[]
  maxLength?: number
  rows?: number
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'input', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  errorMessages: () => [],
  maxLength: 1000,
  rows: 4,
})

const emit = defineEmits<Emits>()

const message = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleInput = (value: string) => {
  emit('input', value)
}
</script>
