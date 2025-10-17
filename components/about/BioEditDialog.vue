<template>
  <BaseDialog
    v-model="internalDialog"
    title="Edit Bio"
    max-width="600px"
    :show-close-button="true"
  >
    <div class="bio-edit-form">
      <v-textarea
        v-model="bioText"
        label="Tell us about yourself"
        placeholder="Share your story, interests, achievements, or anything you'd like others to know about you..."
        rows="6"
        counter
        :error-messages="validationResult.errors"
        variant="outlined"
        class="mb-4"
        @input="onBioInput"
        :disabled="loading"
        clearable
      >
        <template v-slot:counter>
          <div class="d-flex justify-space-between w-100">
            <span :class="wordCountColor">
              {{ validationResult.wordCount }}/{{ MAX_BIO_WORDS }} words
            </span>
            <span class="text-caption text-grey">
              {{ validationResult.charCount }}/{{ MAX_BIO_CHARS }} characters
            </span>
          </div>
        </template>
      </v-textarea>

      <!-- Bio Preview -->
      <v-card v-if="bioText.trim()" variant="outlined" class="mb-4">
        <v-card-title class="text-subtitle-1 py-3">
          <v-icon start size="small">mdi-eye</v-icon>
          Preview
        </v-card-title>
        <v-card-text class="pt-0">
          <div class="bio-preview">
            {{ bioText }}
          </div>
        </v-card-text>
      </v-card>

      <!-- Writing Tips -->
      <v-expansion-panels
        v-if="!bioText.trim()"
        variant="accordion"
        class="mb-4"
      >
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon start>mdi-lightbulb-outline</v-icon>
            Writing Tips
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <ul class="text-body-2 ml-4">
              <li>Keep it authentic and personal</li>
              <li>Mention your interests, skills, or hobbies</li>
              <li>Share what makes you unique</li>
              <li>Use a friendly, conversational tone</li>
              <li>Keep it concise but informative</li>
            </ul>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <template v-slot:actions>
      <v-spacer></v-spacer>
      <v-btn variant="text" @click="closeDialog" :disabled="loading">
        Cancel
      </v-btn>
      <v-btn
        color="primary"
        variant="elevated"
        @click="saveBio"
        :loading="loading"
        :disabled="!validationResult.isValid || !hasChanges"
      >
        Save Bio
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useNuxtApp } from '#app'
import { useBioManager } from '@/composables/useBioManager'
import { useAboutValidation } from '@/composables/useAboutValidation'

const props = defineProps({
  modelValue: Boolean,
  bio: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'bio-updated'])

// Composables
const { $axios } = useNuxtApp()
const { updateBio } = useBioManager()
const { validateBio, MAX_BIO_WORDS, MAX_BIO_CHARS } = useAboutValidation()

// Reactive data
const internalDialog = ref(props.modelValue)
const bioText = ref(props.bio || '')
const loading = ref(false)
const errorMessages = ref([])
const originalBio = ref(props.bio || '')

// Computed
const validationResult = computed(() => {
  return validateBio(bioText.value)
})

const wordCountColor = computed(() => {
  const ratio = validationResult.value.wordCount / MAX_BIO_WORDS
  if (ratio > 0.9) return 'text-error'
  if (ratio > 0.7) return 'text-warning'
  return 'text-primary'
})

const hasChanges = computed(() => {
  return bioText.value.trim() !== originalBio.value?.trim()
})

// Methods
const onBioInput = () => {
  // Clear error messages when user starts typing
  errorMessages.value = []
}

const saveBio = async () => {
  if (!validationResult.value.isValid) return

  try {
    loading.value = true
    errorMessages.value = []

    const result = await updateBio(bioText.value)

    if (result.success) {
      emit('bio-updated', bioText.value.trim())
      originalBio.value = bioText.value.trim()

      // Show success message
      nextTick(() => {
        console.log('Bio updated successfully')
      })
    } else {
      throw new Error(result.error || 'Failed to update bio')
    }
  } catch (error) {
    console.error('Error updating bio:', error)
    errorMessages.value = [error.message || 'Failed to update bio']
  } finally {
    loading.value = false
  }
}

const closeDialog = () => {
  internalDialog.value = false
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    internalDialog.value = newVal
  }
)

watch(
  () => props.bio,
  (newVal) => {
    bioText.value = newVal || ''
    originalBio.value = newVal || ''
  }
)

watch(internalDialog, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>

<style scoped>
.bio-preview {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
  padding: 16px;
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
