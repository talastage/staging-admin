<template>
  <v-card :elevation="10" class="pa-4">
    <h3 class="text-h6 mb-4">Select Premiere Dates</h3>

    <v-row>
      <!-- Start Date Picker -->
      <v-col cols="12" sm="6">
        <div class="date-field">
          <label>Start Date</label>
          <v-menu
            v-model="startMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                v-model="formattedStartDate"
                :disabled="store.loading"
                readonly
                placeholder="Select start date"
                prepend-inner-icon="mdi-calendar"
                :error-messages="startDateError ? [startDateError] : []"
                class="custom-input"
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="internalStartDate"
              :min="minStartDate"
              :max="maxStartDate"
              @update:model-value="handleStartDateSelect"
              locale="en-US"
            >
              <v-row class="d-flex" justify="end">
                <v-btn text color="primary" @click="startMenu = false"
                  >Cancel</v-btn
                >
                <v-btn text color="primary" @click="saveStartDate">OK</v-btn>
              </v-row>
            </v-date-picker>
          </v-menu>
        </div>
      </v-col>

      <!-- End Date Picker -->
      <v-col cols="12" sm="6">
        <div class="date-field">
          <label>End Date</label>
          <v-menu
            v-model="endMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                v-model="formattedEndDate"
                :disabled="store.loading || !internalStartDate"
                readonly
                placeholder="Select end date"
                prepend-inner-icon="mdi-calendar"
                :error-messages="endDateError ? [endDateError] : []"
                class="custom-input"
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="internalEndDate"
              :min="minEndDate"
              :max="maxEndDate"
              @update:model-value="handleEndDateSelect"
              locale="en-US"
            >
              <v-row class="d-flex" justify="end">
                <v-btn text color="primary" @click="endMenu = false"
                  >Cancel</v-btn
                >
                <v-btn text color="primary" @click="saveEndDate">OK</v-btn>
              </v-row>
            </v-date-picker>
          </v-menu>
        </div>
      </v-col>
    </v-row>

    <div class="d-flex justify-space-between align-center mt-4">
      <div class="text-body-1">
        Duration: <strong>{{ calculatedDays }} days</strong>
      </div>
      <v-chip
        v-if="durationError"
        color="error"
        size="small"
        variant="outlined"
      >
        {{ durationError }}
      </v-chip>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { usePremieringCostCalculateStore } from '~/stores/usePremieringCostCalculateStoreDELETE'

// Access the store
const store = usePremieringCostCalculateStore()

// Menu visibility states
const startMenu = ref(false)
const endMenu = ref(false)

// Internal date states as strings (YYYY-MM-DD)
const internalStartDate = ref<string | null>(null)
const internalEndDate = ref<string | null>(null)

// Initialize internal dates from store on mount
onMounted(() => {
  internalStartDate.value = store.startDate
  internalEndDate.value = store.endDate
})

// Date constraints in 'YYYY-MM-DD' format
const minStartDate = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.toISOString().split('T')[0]
})

const maxStartDate = computed(() => {
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + store.maxDays)
  return maxDate.toISOString().split('T')[0]
})

const minEndDate = computed(() => {
  if (!internalStartDate.value) return minStartDate.value
  const minEnd = new Date(internalStartDate.value)
  minEnd.setDate(minEnd.getDate() + store.minDays)
  return minEnd.toISOString().split('T')[0]
})

const maxEndDate = computed(() => {
  if (!internalStartDate.value) return maxStartDate.value
  const maxEnd = new Date(internalStartDate.value)
  maxEnd.setDate(maxEnd.getDate() + store.maxDays)
  return maxEnd.toISOString().split('T')[0]
})

// Formatting for display in the text fields
const locale = 'en-US'

const formattedStartDate = computed(() => {
  return internalStartDate.value
    ? new Date(internalStartDate.value).toLocaleDateString(locale, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''
})

const formattedEndDate = computed(() => {
  return internalEndDate.value
    ? new Date(internalEndDate.value).toLocaleDateString(locale, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''
})

// Computed property for duration in days
const calculatedDays = computed(() => {
  if (!internalStartDate.value || !internalEndDate.value) return 0
  const start = new Date(internalStartDate.value)
  const end = new Date(internalEndDate.value)
  const diffTime = end.getTime() - start.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Validation computed properties
const startDateError = computed(() => {
  if (!internalStartDate.value) return 'Start date is required'
  const startDate = new Date(internalStartDate.value)
  const minDate = new Date(minStartDate.value)
  if (startDate < minDate) return 'Start date cannot be in the past'
  return ''
})

const endDateError = computed(() => {
  if (!internalEndDate.value) return 'End date is required'
  if (!internalStartDate.value) return 'Please select start date first'
  const endDate = new Date(internalEndDate.value)
  const minEnd = new Date(minEndDate.value)
  if (endDate < minEnd)
    return `End date cannot be before ${minEnd.toLocaleDateString(locale)}`
  return ''
})

const durationError = computed(() => {
  const days = calculatedDays.value
  if (days < store.minDays) {
    return `Minimum ${store.minDays} days required`
  }
  if (days > store.maxDays) {
    return `Maximum ${store.maxDays} days allowed`
  }
  return ''
})

// Event handlers
function handleStartDateSelect(newDate: string | null) {
  if (newDate) {
    internalStartDate.value = newDate

    // Adjust end date if needed
    if (internalEndDate.value) {
      const daysDiff = calculatedDays.value

      if (daysDiff < store.minDays) {
        const newEnd = new Date(newDate)
        newEnd.setDate(newEnd.getDate() + store.minDays)
        internalEndDate.value = newEnd.toISOString().split('T')[0]
      } else if (daysDiff > store.maxDays) {
        const newEnd = new Date(newDate)
        newEnd.setDate(newEnd.getDate() + store.maxDays)
        internalEndDate.value = newEnd.toISOString().split('T')[0]
      }
    }

    updateStoreDates()
    startMenu.value = false
  }
}

function handleEndDateSelect(newDate: string | null) {
  if (newDate) {
    internalEndDate.value = newDate
    updateStoreDates()
    endMenu.value = false
  }
}

function saveStartDate() {
  if (internalStartDate.value) {
    handleStartDateSelect(internalStartDate.value)
  }
}

function saveEndDate() {
  if (internalEndDate.value) {
    handleEndDateSelect(internalEndDate.value)
  }
}

function updateStoreDates() {
  if (
    internalStartDate.value &&
    internalEndDate.value &&
    !startDateError.value &&
    !endDateError.value &&
    !durationError.value
  ) {
    const start = new Date(internalStartDate.value)
    const end = new Date(internalEndDate.value)
    store.updateDates(start, end)
  }
}

// Watchers to synchronize with the store
watch(
  () => store.startDate,
  (newDate) => {
    if (
      newDate &&
      (!internalStartDate.value ||
        new Date(newDate).getTime() !==
          new Date(internalStartDate.value).getTime())
    ) {
      internalStartDate.value = new Date(newDate).toISOString().split('T')[0]
    }
  },
  { immediate: true }
)

watch(
  () => store.endDate,
  (newDate) => {
    if (
      newDate &&
      (!internalEndDate.value ||
        new Date(newDate).getTime() !==
          new Date(internalEndDate.value).getTime())
    ) {
      internalEndDate.value = new Date(newDate).toISOString().split('T')[0]
    }
  },
  { immediate: true }
)

// Watcher for changes in store's days property
watch(
  () => store.days,
  (newDays) => {
    if (internalStartDate.value && newDays > 0) {
      const newEnd = new Date(internalStartDate.value)
      newEnd.setDate(newEnd.getDate() + newDays)
      internalEndDate.value = newEnd.toISOString().split('T')[0]
      updateStoreDates()
    }
  }
)
</script>

<style scoped>
.date-field {
  position: relative;
  margin-bottom: 1rem;
}

.date-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}

.custom-input {
  width: 100%;
  /* Additional styling can be added here if needed */
}

.error-text {
  color: #ff5252;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

/* Vuetify's v-date-picker already comes styled, but you can customize if needed */
</style>
