<!-- components/EditDescriptionDialog.vue -->
<template>
  <BaseDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Edit Description"
    max-width="600px"
  >
    <template #title>
      <div class="d-flex align-center">
        <span>Edit Description</span>
        <v-chip
          v-if="characterCount > 0"
          class="ml-4"
          :color="isWithinLimit ? 'info' : 'error'"
          size="small"
        >
          {{ characterCount }}/{{ maxCharacters }} characters
        </v-chip>
      </div>
    </template>

    <v-alert
      v-if="errorMessages.length > 0"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      <ul class="ps-4">
        <li v-for="(error, index) in errorMessages" :key="index">
          {{ error }}
        </li>
      </ul>
    </v-alert>

    <v-sheet class="pa-4" rounded border>
      <v-textarea
        v-model="localDescription"
        label="Description"
        rows="5"
        auto-grow
        counter
        :maxlength="maxCharacters"
        :rules="descriptionRules"
        :error-messages="errorMessages"
        placeholder="Enter a detailed description..."
        hide-details="auto"
      ></v-textarea>

      <div class="mt-2 text-caption text-grey">
        Provide a clear and detailed description. This will help others better
        understand your project.
      </div>
    </v-sheet>

    <template #actions>
      <v-spacer></v-spacer>
      <v-btn
        color="grey-darken-1"
        variant="text"
        @click="handleClose"
        :disabled="loading"
      >
        Cancel
      </v-btn>
      <v-btn
        color="primary"
        @click="handleSave"
        :loading="loading"
        :disabled="!isValid || loading"
      >
        Save Changes
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseDialog from '~/components/dialogs/BaseDialog.vue'

const props = defineProps<{
  modelValue: boolean
  description: string
  errors?: Record<string, string[]>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [description: string]
  close: []
}>()

const loading = ref(false)
const localDescription = ref(props.description)
const maxCharacters = 1000 // Adjust this value as needed

// Validation rules
const descriptionRules = [
  (v: string) => !!v?.trim() || 'Description is required',
  (v: string) =>
    v.length <= maxCharacters || `Maximum ${maxCharacters} characters allowed`,
  (v: string) => v.length >= 10 || 'Description must be at least 10 characters',
]

// Computed properties
const characterCount = computed(() => localDescription.value?.length ?? 0)

const isWithinLimit = computed(() => characterCount.value <= maxCharacters)

const isValid = computed(() => {
  return (
    !!localDescription.value?.trim() &&
    localDescription.value.length >= 10 &&
    localDescription.value.length <= maxCharacters
  )
})

const errorMessages = computed(() => {
  const messages: string[] = []
  if (props.errors?.description) {
    messages.push(...props.errors.description)
  }
  return messages
})

// Watchers
watch(
  () => props.description,
  (newVal) => {
    localDescription.value = newVal
  }
)

// Methods
const handleClose = () => {
  localDescription.value = props.description // Reset to original value
  emit('close')
  emit('update:modelValue', false)
}

const handleSave = async () => {
  if (!isValid.value) return

  loading.value = true
  try {
    await emit('save', localDescription.value.trim())
    emit('update:modelValue', false)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-textarea :deep(.v-field__input) {
  min-height: 120px !important;
}
</style>
