<template>
  <BaseDialog v-model="dialog" :title="dialogTitle" max-width="600px">
    <!-- Only render the content if investment is not null -->
    <v-container v-if="investment">
      <v-row>
        <v-col cols="12">
          <div class="text-body-1 mb-4">
            Are you sure you want to
            {{ isRejecting ? 'reject' : 'approve' }} this investment?
          </div>

          <v-card variant="outlined" class="mb-4">
            <v-list-item>
              <template #prepend>
                <v-icon
                  :color="
                    investment.status === 'pending' ? 'warning' : 'success'
                  "
                >
                  {{
                    investment.status === 'pending'
                      ? 'mdi-clock-outline'
                      : 'mdi-check-circle'
                  }}
                </v-icon>
              </template>
              <v-list-item-title>
                Share Percentage: {{ investment.share_percentage }}%
              </v-list-item-title>
              <v-list-item-subtitle>
                Status: {{ investment.status }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-card>

          <v-expand-transition>
            <div v-if="isRejecting">
              <v-textarea
                v-model="notes"
                label="Rejection Reason"
                placeholder="Please provide a reason for rejection"
                variant="outlined"
                rows="3"
                :rules="[(v) => !!v || 'Reason is required for rejection']"
                :error-messages="notesError"
              />
            </div>
          </v-expand-transition>
        </v-col>
      </v-row>
    </v-container>

    <template #actions>
      <v-spacer />
      <v-btn color="grey-darken-1" variant="text" @click="closeDialog">
        Cancel
      </v-btn>
      <v-btn
        :color="isRejecting ? 'error' : 'success'"
        :loading="isLoading"
        :disabled="isLoading || (isRejecting && !notes.trim())"
        @click="handleAction"
      >
        {{ isRejecting ? 'Reject' : 'Approve' }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, PropType } from 'vue'
import { useSnackMessageStore } from '@/stores/useSnackMessage'

interface Investment {
  id: number
  share_percentage: number
  status: string
}

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  // Allow 'investment' to be null/undefined or optional
  investment: {
    type: Object as PropType<Investment | null>,
    default: null,
  },
  mode: {
    type: String as PropType<'approve' | 'reject'>,
    default: 'approve',
  },
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'approved', id: number): void
  (e: 'rejected', id: number, notes: string): void
}>()

const snackStore = useSnackMessageStore()

const isLoading = ref(false)
const notes = ref('')
const notesError = ref('')
const isRejecting = ref(false)

watch(
  () => props.mode,
  (newMode) => {
    isRejecting.value = newMode === 'reject'
  },
  { immediate: true }
)

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      resetForm()
      isRejecting.value = props.mode === 'reject'
    }
  }
)

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const dialogTitle = computed(() =>
  isRejecting.value ? 'Reject Investment' : 'Approve Investment'
)

const closeDialog = () => {
  dialog.value = false
  resetForm()
}

const resetForm = () => {
  notes.value = ''
  notesError.value = ''
  if (!props.mode) {
    isRejecting.value = false
  }
}

const validateForm = () => {
  if (isRejecting.value && !notes.value.trim()) {
    notesError.value = 'Please provide a reason for rejection'
    return false
  }
  notesError.value = ''
  return true
}

const handleAction = async () => {
  // If 'investment' is null, do nothing
  if (!props.investment) return

  if (!validateForm()) return
  isLoading.value = true

  try {
    if (isRejecting.value) {
      emit('rejected', props.investment.id, notes.value.trim())
    } else {
      emit('approved', props.investment.id)
    }
    closeDialog()
    snackStore.success(
      `Investment ${isRejecting.value ? 'rejected' : 'approved'} successfully`
    )
  } catch (error) {
    console.error('Investment action failed:', error)
    snackStore.error(
      `Failed to ${isRejecting.value ? 'reject' : 'approve'} investment`
    )
  } finally {
    isLoading.value = false
  }
}
</script>
