<!-- components/page/edit/EditLocationDialog.vue -->
<template>
  <BaseDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Edit Location"
    max-width="600px"
  >
    <template #title>
      <div class="d-flex align-center">
        <span>Edit Location</span>
        <v-chip v-if="isFormValid" class="ml-4" color="success" size="small">
          Valid Location
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
      <v-form ref="form" v-model="isFormValid">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="localLocation.address"
              label="Street Address"
              :rules="[(v) => !!v || 'Address is required']"
              placeholder="Enter street address"
              clearable
              hide-details="auto"
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <div class="d-flex align-center">
              <v-text-field
                v-model="displayCountry"
                label="Country"
                :rules="[(v) => !!v || 'Country is required']"
                placeholder="Enter country"
                readonly
                hide-details="auto"
                variant="outlined"
                density="comfortable"
                class="flex-grow-1"
              ></v-text-field>

              <v-btn
                color="primary"
                variant="text"
                class="ml-2"
                prepend-icon="mdi-pencil"
                @click="goToSettings"
              >
                Edit Country
              </v-btn>
            </div>
            <p class="text-caption text-grey mt-1">
              To change your country, please visit the account settings page.
            </p>
          </v-col>
        </v-row>
      </v-form>
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
        :disabled="!isFormValid"
        :loading="loading"
      >
        Save Location
      </v-btn>
    </template>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Leave Page?</v-card-title>
        <v-card-text>
          You will be redirected to the account settings page to update your
          country. Any unsaved changes here will be lost.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showConfirmDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn color="primary" @click="confirmNavigation"> Continue </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseDialog from '~/components/dialogs/BaseDialog.vue'

interface Country {
  id: number
  name: string
  flag: string
  phone_code: string
}

interface PageLocation {
  id?: number
  page_id: number
  address: string | null
  country: Country | null | string
  created_at?: string
  updated_at?: string
}

const props = defineProps<{
  modelValue: boolean
  location: PageLocation
  errors?: Record<string, string[]>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [location: PageLocation]
  close: []
}>()

const router = useRouter()
const form = ref<any>(null)
const isFormValid = ref(false)
const loading = ref(false)
const showConfirmDialog = ref(false)
const localLocation = ref<PageLocation>({ ...props.location })

// Computed properties for country display
const displayCountry = computed(() => {
  const country = localLocation.value.country
  if (!country) return ''
  if (typeof country === 'string') return country
  return country.name || ''
})

const errorMessages = computed(() => {
  const messages: string[] = []
  if (props.errors) {
    Object.values(props.errors).forEach((errors) => {
      messages.push(...errors)
    })
  }
  return messages
})

// Watchers
watch(
  () => props.location,
  (newVal) => {
    localLocation.value = { ...newVal }
  },
  { deep: true }
)

watch(
  () => props.errors,
  (newErrors) => {
    if (newErrors && Object.keys(newErrors).length > 0) {
      isFormValid.value = false
    }
  }
)

// Methods
const handleClose = () => {
  localLocation.value = { ...props.location } // Reset to original values
  emit('close')
  emit('update:modelValue', false)
}

const handleSave = async () => {
  if (!form.value) return

  const { valid } = await form.value.validate()

  if (valid) {
    loading.value = true
    try {
      await emit('save', localLocation.value)
      emit('update:modelValue', false)
    } finally {
      loading.value = false
    }
  }
}

const goToSettings = () => {
  showConfirmDialog.value = true
}

const confirmNavigation = () => {
  showConfirmDialog.value = false
  emit('update:modelValue', false)
  router.push('/account/settings')
}
</script>

<style scoped>
.v-text-field :deep(.v-field__input) {
  min-height: 44px;
}
</style>
